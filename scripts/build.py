#!/usr/bin/env python3
"""Conservatively compile v2fly domain-list-community sources into Surge rules.

The default mode is a read-only preflight.  Surge files are written only when
``--write`` is supplied after every selected app has compiled successfully.
"""

from __future__ import annotations

import argparse
import dataclasses
import ipaddress
import json
import re
import sys
import urllib.error
import urllib.request
from collections import defaultdict
from pathlib import Path
from typing import Callable, Iterable

import yaml


ALLOWED_SURGE_TYPES = ("DOMAIN", "DOMAIN-SUFFIX", "DOMAIN-KEYWORD", "IP-CIDR", "IP-CIDR6")
SORT_ORDER = {rule_type: position for position, rule_type in enumerate(ALLOWED_SURGE_TYPES)}
SAFE_INCLUDE_NAME = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]*$")


class BuildError(RuntimeError):
    """A deterministic input or policy error that must stop a build."""


@dataclasses.dataclass(frozen=True)
class SourceLocation:
    source: str
    line: int
    chain: tuple[str, ...]

    def describe(self) -> str:
        chain = " -> ".join(self.chain)
        return f"{self.source}:{self.line} (include chain: {chain})"


@dataclasses.dataclass(frozen=True)
class ParsedEntry:
    kind: str
    value: str
    attributes: frozenset[str]
    location: SourceLocation


@dataclasses.dataclass(frozen=True)
class SurgeRule:
    kind: str
    value: str
    location: SourceLocation

    @property
    def key(self) -> tuple[str, str]:
        return self.kind, self.value

    def render(self) -> str:
        return f"{self.kind},{self.value}"


@dataclasses.dataclass
class Compilation:
    app_name: str
    rules: list[SurgeRule]
    skipped_attributes: list[ParsedEntry]
    denied_includes: list[tuple[str, SourceLocation]]
    provenance: dict[tuple[str, str], list[SourceLocation]]


FetchText = Callable[[str], str]


def load_manifest(path: Path) -> dict:
    try:
        document = yaml.safe_load(path.read_text(encoding="utf-8"))
    except OSError as error:
        raise BuildError(f"cannot read manifest {path}: {error}") from error
    except yaml.YAMLError as error:
        raise BuildError(f"invalid YAML in {path}: {error}") from error
    if not isinstance(document, dict) or document.get("version") != 1:
        raise BuildError("manifest must be a mapping with version: 1")
    apps = document.get("apps")
    if not isinstance(apps, dict) or not apps:
        raise BuildError("manifest must contain a non-empty apps mapping")
    for app_name, app in apps.items():
        validate_app_config(app_name, app)
    return document


def validate_app_config(app_name: str, app: object) -> None:
    if not isinstance(app, dict):
        raise BuildError(f"{app_name}: app configuration must be a mapping")
    for key in ("enabled", "output", "sources", "supplement", "exclude", "include_policy", "attributes"):
        if key not in app:
            raise BuildError(f"{app_name}: missing required field {key!r}")
    if not isinstance(app["enabled"], bool):
        raise BuildError(f"{app_name}: enabled must be boolean")
    if not isinstance(app["output"], str) or not app["output"].startswith("Surge/"):
        raise BuildError(f"{app_name}: output must be a path below Surge/")
    if not isinstance(app["supplement"], str) or not app["supplement"].startswith("sources/supplement/"):
        raise BuildError(f"{app_name}: supplement must be a path below sources/supplement/")
    if not isinstance(app["exclude"], list):
        raise BuildError(f"{app_name}: exclude must be a list")

    sources = app["sources"]
    if not isinstance(sources, list) or not sources:
        raise BuildError(f"{app_name}: sources must be a non-empty list")
    primaries = 0
    supplementals = 0
    for source in sources:
        if not isinstance(source, dict):
            raise BuildError(f"{app_name}: each source must be a mapping")
        if source.get("format") != "v2fly-domain-list":
            raise BuildError(f"{app_name}: unsupported source format {source.get('format')!r}")
        if not isinstance(source.get("url"), str) or not source["url"].startswith("https://"):
            raise BuildError(f"{app_name}: source URL must use https")
        if source.get("role") == "primary":
            primaries += 1
        elif source.get("role") == "supplemental":
            supplementals += 1
        else:
            raise BuildError(f"{app_name}: source role must be primary or supplemental")
    if primaries != 1 or supplementals > 1:
        raise BuildError(f"{app_name}: require exactly one primary and at most one supplemental source")

    include_policy = app["include_policy"]
    if not isinstance(include_policy, dict) or include_policy.get("mode") != "explicit":
        raise BuildError(f"{app_name}: include_policy.mode must be explicit")
    allow = include_policy.get("allow")
    deny = include_policy.get("deny")
    if not isinstance(allow, list) or not isinstance(deny, list) or not all(isinstance(item, str) for item in allow + deny):
        raise BuildError(f"{app_name}: include_policy allow and deny must be string lists")
    overlap = set(allow) & set(deny)
    if overlap:
        raise BuildError(f"{app_name}: include targets cannot be both allowed and denied: {sorted(overlap)}")

    attributes = app["attributes"]
    if not isinstance(attributes, dict) or attributes.get("mode") != "explicit":
        raise BuildError(f"{app_name}: attributes.mode must be explicit")
    selected = attributes.get("include")
    if not isinstance(selected, list) or not all(isinstance(item, str) and item and not item.startswith("!") for item in selected):
        raise BuildError(f"{app_name}: attributes.include must be a list of positive attribute names")


def default_fetch_text(url: str) -> str:
    request = urllib.request.Request(url, headers={"User-Agent": "WProxyRules/1"})
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            content_type = response.headers.get_content_type()
            raw = response.read()
    except urllib.error.HTTPError as error:
        raise BuildError(f"upstream HTTP {error.code} for {url}") from error
    except (urllib.error.URLError, TimeoutError, OSError) as error:
        raise BuildError(f"upstream fetch failed for {url}: {error}") from error
    if content_type == "text/html" or raw.lstrip().lower().startswith((b"<!doctype html", b"<html")):
        raise BuildError(f"upstream returned HTML instead of a rule list: {url}")
    try:
        return raw.decode("utf-8-sig")
    except UnicodeDecodeError as error:
        raise BuildError(f"upstream is not UTF-8 text: {url}") from error


def parse_v2fly_text(text: str, source: str, chain: tuple[str, ...]) -> list[ParsedEntry]:
    entries: list[ParsedEntry] = []
    for line_number, original in enumerate(text.splitlines(), start=1):
        stripped = original.strip()
        if not stripped or stripped.startswith("#"):
            continue
        tokens = stripped.split()
        head, *tail = tokens
        attributes = frozenset(token[1:] for token in tail if token.startswith("@"))
        values = [token for token in tail if not token.startswith("@")]
        location = SourceLocation(source, line_number, chain)
        if any(attribute.startswith("!") for attribute in attributes):
            raise BuildError(f"v1 does not support negative attributes at {location.describe()}: {original}")

        if ":" not in head:
            if values:
                raise BuildError(f"malformed v2fly line at {location.describe()}: {original}")
            entries.append(ParsedEntry("domain", head, attributes, location))
            continue

        directive, value = head.split(":", 1)
        if directive not in {"domain", "full", "keyword", "regexp", "include"} or not value or values:
            raise BuildError(f"unsupported or malformed v2fly directive at {location.describe()}: {original}")
        if directive == "include" and attributes:
            raise BuildError(f"attribute-qualified include is unsupported in v1 at {location.describe()}: {original}")
        entries.append(ParsedEntry(directive, value, attributes, location))
    return entries


def include_url(parent_url: str, include_name: str) -> str:
    if not SAFE_INCLUDE_NAME.fullmatch(include_name):
        raise BuildError(f"unsafe v2fly include name {include_name!r}")
    base, _, _ = parent_url.rpartition("/")
    if not base:
        raise BuildError(f"cannot resolve include from malformed source URL {parent_url!r}")
    return f"{base}/{include_name}"


def normalize_domain(value: str, location: SourceLocation) -> str:
    candidate = value.rstrip(".").lower()
    if not candidate or any(character in candidate for character in "/,:@ \t"):
        raise BuildError(f"invalid domain at {location.describe()}: {value!r}")
    try:
        encoded = candidate.encode("idna").decode("ascii")
    except UnicodeError as error:
        raise BuildError(f"invalid IDNA domain at {location.describe()}: {value!r}") from error
    labels = encoded.split(".")
    if any(not label or len(label) > 63 or not re.fullmatch(r"[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?", label) for label in labels):
        raise BuildError(f"invalid domain at {location.describe()}: {value!r}")
    return encoded


def convert_entry(entry: ParsedEntry) -> SurgeRule:
    if entry.kind == "regexp":
        raise BuildError(f"unsupported v2fly regexp at {entry.location.describe()}: {entry.value!r}")
    if entry.kind == "domain":
        return SurgeRule("DOMAIN-SUFFIX", normalize_domain(entry.value, entry.location), entry.location)
    if entry.kind == "full":
        return SurgeRule("DOMAIN", normalize_domain(entry.value, entry.location), entry.location)
    if entry.kind == "keyword":
        value = entry.value.lower()
        if not value or any(character in value for character in ",\r\n"):
            raise BuildError(f"invalid domain keyword at {entry.location.describe()}: {entry.value!r}")
        return SurgeRule("DOMAIN-KEYWORD", value, entry.location)
    raise BuildError(f"cannot convert v2fly entry {entry.kind!r} at {entry.location.describe()}")


def parse_excludes(items: Iterable[object], app_name: str) -> list[tuple[str, str]]:
    excludes: list[tuple[str, str]] = []
    mappings = {"domain": "DOMAIN", "domain-suffix": "DOMAIN-SUFFIX", "domain-keyword": "DOMAIN-KEYWORD"}
    for item in items:
        if not isinstance(item, str) or ":" not in item:
            raise BuildError(f"{app_name}: exclude entries must use type:value syntax")
        kind, value = item.split(":", 1)
        if kind not in mappings or not value:
            raise BuildError(f"{app_name}: unsupported exclude {item!r}")
        location = SourceLocation(f"manifest:{app_name}", 0, (app_name,))
        normalized = value.lower() if kind == "domain-keyword" else normalize_domain(value, location)
        excludes.append((mappings[kind], normalized))
    return excludes


def is_excluded(rule: SurgeRule, excludes: Iterable[tuple[str, str]]) -> bool:
    for kind, value in excludes:
        if kind == "DOMAIN" and rule.kind == "DOMAIN" and rule.value == value:
            return True
        if kind == "DOMAIN-KEYWORD" and rule.kind == "DOMAIN-KEYWORD" and rule.value == value:
            return True
        if kind == "DOMAIN-SUFFIX":
            if rule.kind == "DOMAIN-SUFFIX" and rule.value == value:
                return True
            if rule.kind == "DOMAIN" and (rule.value == value or rule.value.endswith(f".{value}")):
                return True
    return False


def parse_supplement(path: Path, app_name: str) -> list[SurgeRule]:
    if not path.exists():
        return []
    rules: list[SurgeRule] = []
    for line_number, original in enumerate(path.read_text(encoding="utf-8-sig").splitlines(), start=1):
        stripped = original.strip()
        if not stripped or stripped.startswith("#"):
            continue
        parts = [part.strip() for part in stripped.split(",")]
        location = SourceLocation(str(path), line_number, (app_name, "supplement"))
        if len(parts) != 2 or parts[0] not in ALLOWED_SURGE_TYPES:
            raise BuildError(f"invalid supplement rule at {location.describe()}: {original}")
        kind, value = parts
        if kind in {"DOMAIN", "DOMAIN-SUFFIX"}:
            value = normalize_domain(value, location)
        elif kind == "DOMAIN-KEYWORD":
            value = value.lower()
            if not value or any(character in value for character in ",\r\n"):
                raise BuildError(f"invalid supplement domain keyword at {location.describe()}: {original}")
        else:
            try:
                network = ipaddress.ip_network(value, strict=False)
            except ValueError as error:
                raise BuildError(f"invalid IP supplement at {location.describe()}: {value!r}") from error
            expected = "IP-CIDR6" if network.version == 6 else "IP-CIDR"
            if kind != expected:
                raise BuildError(f"IP family does not match rule type at {location.describe()}: {original}")
            value = str(network)
        rules.append(SurgeRule(kind, value, location))
    return rules


def compile_app(app_name: str, app: dict, root: Path, fetch_text: FetchText = default_fetch_text) -> Compilation:
    allow = set(app["include_policy"]["allow"])
    deny = set(app["include_policy"]["deny"])
    selected_attributes = set(app["attributes"]["include"])
    cached_entries: dict[str, list[ParsedEntry]] = {}
    stack: list[str] = []
    rules: list[SurgeRule] = []
    skipped_attributes: list[ParsedEntry] = []
    denied_includes: list[tuple[str, SourceLocation]] = []

    def resolve(url: str, list_name: str, chain: tuple[str, ...]) -> None:
        if list_name in stack:
            cycle = " -> ".join((*stack, list_name))
            raise BuildError(f"include cycle for {app_name}: {cycle}")
        stack.append(list_name)
        if url not in cached_entries:
            cached_entries[url] = parse_v2fly_text(fetch_text(url), url, chain)
        for parsed in cached_entries[url]:
            location = SourceLocation(parsed.location.source, parsed.location.line, chain)
            entry = dataclasses.replace(parsed, location=location)
            if entry.kind == "include":
                target = entry.value
                if target in allow:
                    resolve(include_url(url, target), target, (*chain, target))
                elif target in deny:
                    denied_includes.append((target, entry.location))
                else:
                    raise BuildError(f"{app_name}: include {target!r} is not declared in include_policy at {entry.location.describe()}")
                continue
            if entry.attributes and not (set(entry.attributes) & selected_attributes):
                skipped_attributes.append(entry)
                continue
            rules.append(convert_entry(entry))
        stack.pop()

    for source in app["sources"]:
        source_name = source["name"]
        resolve(source["url"], source_name, (source_name,))

    rules.extend(parse_supplement(root / app["supplement"], app_name))
    excludes = parse_excludes(app["exclude"], app_name)
    provenance: dict[tuple[str, str], list[SourceLocation]] = defaultdict(list)
    unique: dict[tuple[str, str], SurgeRule] = {}
    for rule in rules:
        if is_excluded(rule, excludes):
            continue
        provenance[rule.key].append(rule.location)
        unique.setdefault(rule.key, rule)
    ordered = sorted(unique.values(), key=lambda rule: (SORT_ORDER[rule.kind], rule.value))
    if not ordered:
        raise BuildError(f"{app_name}: final output is empty")
    return Compilation(app_name, ordered, skipped_attributes, denied_includes, dict(provenance))


def write_outputs(compilations: Iterable[Compilation], manifest: dict, root: Path) -> None:
    for compilation in compilations:
        output = root / manifest["apps"][compilation.app_name]["output"]
        output.parent.mkdir(parents=True, exist_ok=True)
        temporary = output.with_suffix(output.suffix + ".tmp")
        temporary.write_text("\n".join(rule.render() for rule in compilation.rules) + "\n", encoding="utf-8", newline="\n")
        temporary.replace(output)


def select_apps(manifest: dict, requested: list[str]) -> list[str]:
    if requested:
        unknown = set(requested) - set(manifest["apps"])
        if unknown:
            raise BuildError(f"unknown app(s): {', '.join(sorted(unknown))}")
        return requested
    return [name for name, app in manifest["apps"].items() if app["enabled"]]


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--manifest", type=Path, default=Path("sources/apps.yaml"))
    parser.add_argument("--app", action="append", default=[], help="compile only this app; may be repeated")
    parser.add_argument("--write", action="store_true", help="write Surge outputs after all selected apps compile")
    arguments = parser.parse_args(argv)
    root = arguments.manifest.resolve().parent.parent
    try:
        manifest = load_manifest(arguments.manifest)
        names = select_apps(manifest, arguments.app)
        compilations = [compile_app(name, manifest["apps"][name], root) for name in names]
        if arguments.write:
            write_outputs(compilations, manifest, root)
        report = {
            "mode": "write" if arguments.write else "check",
            "apps": [
                {
                    "name": item.app_name,
                    "rules": len(item.rules),
                    "skipped_attributes": len(item.skipped_attributes),
                    "denied_includes": [name for name, _ in item.denied_includes],
                }
                for item in compilations
            ],
        }
        print(json.dumps(report, ensure_ascii=False, indent=2))
        return 0
    except BuildError as error:
        print(f"build failed: {error}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
