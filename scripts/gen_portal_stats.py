#!/usr/bin/env python3
"""Generate portal/public/data/stats.json for the portal.

Reads the generated Surge/*.list headers plus the source manifest and writes a
small JSON document consumed by the Vite + React portal.  The output contains
only data derived from those inputs — no timestamps — so it changes exactly
when the Surge outputs or the manifest change, and the daily workflow commits
it together with the generated rules.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections import Counter
from pathlib import Path

import yaml

REPO = "https://github.com/Bluetrae/Rulink"
RAW_BASE = "https://raw.githubusercontent.com/Bluetrae/Rulink/main"

# Display-only portal metadata.  Source logic lives in the manifest; this
# mapping only groups apps for the portal and suggests a policy label for the
# copyable RULE-SET line.  The last field is always the user's own choice.
PORTAL_META = {
    "OKX": {"category": "Finance", "emoji": "💠", "policy": "Finance"},
    "PayPal": {"category": "Finance", "emoji": "💸", "policy": "Finance"},
    "SafePal": {"category": "Finance", "emoji": "🔐", "policy": "Finance"},
    "ZABank": {"category": "Finance", "emoji": "🏦", "policy": "Finance"},
    "WhatsApp": {"category": "Communication", "emoji": "💬", "policy": "Proxy"},
    "LINE": {"category": "Communication", "emoji": "💬", "policy": "Proxy"},
    "Telegram": {"category": "Communication", "emoji": "✈️", "policy": "Proxy"},
    "GitHub": {"category": "Development", "emoji": "🐙", "policy": "GitHub"},
    "Steam": {"category": "Gaming", "emoji": "🎮", "policy": "Proxy"},
    "X": {"category": "Social", "emoji": "𝕏", "policy": "Proxy"},
    "Instagram": {"category": "Social", "emoji": "📷", "policy": "Proxy"},
    "Threads": {"category": "Social", "emoji": "🧵", "policy": "Proxy"},
    "YouTube": {"category": "Media", "emoji": "▶️", "policy": "Media"},
    "Netflix": {"category": "Media", "emoji": "🎬", "policy": "Media"},
    "TikTok": {"category": "Media", "emoji": "🎵", "policy": "Proxy"},
    "Spotify": {"category": "Media", "emoji": "🎧", "policy": "Proxy"},
    "APTV": {"category": "Media", "emoji": "📺", "policy": "Media"},
    "AI": {"category": "AI", "emoji": "🤖", "policy": "Proxy"},
}

HEADER_NAME = re.compile(r"^# 规则名称:\s*(.+?)\s*$")
HEADER_COUNT = re.compile(r"^# 规则统计:\s*(\d+)\s*$")


class PortalError(RuntimeError):
    """A deterministic input error that must stop stats generation."""


def parse_list(path: Path) -> tuple[str | None, int | None, dict[str, int]]:
    name = None
    count = None
    types: Counter[str] = Counter()
    try:
        lines = path.read_text(encoding="utf-8").splitlines()
    except OSError as error:
        raise PortalError(f"cannot read {path}: {error}") from error
    for line in lines:
        match = HEADER_NAME.match(line)
        if match:
            name = match.group(1)
            continue
        match = HEADER_COUNT.match(line)
        if match:
            count = int(match.group(1))
            continue
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            continue
        types[stripped.split(",")[0]] += 1
    return name, count, dict(types)


def build(root: Path) -> dict:
    manifest_path = root / "sources" / "apps.yaml"
    try:
        manifest = yaml.safe_load(manifest_path.read_text(encoding="utf-8"))
    except (OSError, yaml.YAMLError) as error:
        raise PortalError(f"cannot read manifest {manifest_path}: {error}") from error
    if not isinstance(manifest, dict) or not isinstance(manifest.get("apps"), dict):
        raise PortalError("manifest must be a mapping with an apps mapping")
    apps_out = []
    for app_name, app in manifest["apps"].items():
        if not app.get("enabled"):
            continue
        meta = PORTAL_META.get(app_name)
        if meta is None:
            raise PortalError(f"{app_name}: missing portal metadata (add it to PORTAL_META)")
        output = root / app["output"]
        list_name, header_count, type_counts = parse_list(output)
        if list_name != app_name:
            raise PortalError(f"{output}: header name {list_name!r} does not match app {app_name!r}")
        if header_count is None:
            raise PortalError(f"{output}: missing 规则统计 header")
        if header_count != sum(type_counts.values()):
            raise PortalError(
                f"{output}: header count {header_count} does not match body rules {sum(type_counts.values())}"
            )
        sources = app.get("sources") or []
        primary = next((item for item in sources if item.get("role") == "primary"), sources[0] if sources else {})
        apps_out.append(
            {
                "name": app_name,
                "category": meta["category"],
                "emoji": meta["emoji"],
                "policy": meta["policy"],
                "file": app["output"],
                "rules": header_count,
                "types": type_counts,
                "source": {
                    "author": primary.get("author", ""),
                    "name": primary.get("name", ""),
                    "format": primary.get("format", ""),
                },
                "note": (app.get("note") or "").strip(),
            }
        )
    return {"repo": REPO, "raw_base": RAW_BASE, "apps": apps_out}


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--manifest", type=Path, default=Path("sources/apps.yaml"))
    parser.add_argument("--output", type=Path, default=Path("portal/public/data/stats.json"))
    parser.add_argument("--stdout", action="store_true", help="print the JSON instead of writing it")
    arguments = parser.parse_args(argv)
    root = arguments.manifest.resolve().parent.parent
    try:
        document = build(root)
        text = json.dumps(document, ensure_ascii=False, indent=2) + "\n"
        if arguments.stdout:
            print(text, end="")
        else:
            output = arguments.output
            output.parent.mkdir(parents=True, exist_ok=True)
            output.write_text(text, encoding="utf-8", newline="\n")
        return 0
    except PortalError as error:
        print(f"portal stats failed: {error}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
