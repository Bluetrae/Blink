#!/usr/bin/env python3
"""Detect new semantic overlap between canonical App Rule-Sets against a reviewed baseline."""

from __future__ import annotations

import argparse
import json
import sys
from itertools import combinations
from pathlib import Path

import build

SCHEMA_VERSION = 1


class OverlapError(RuntimeError):
    """Cross-App overlap changed without a reviewed baseline update."""


def encode_key(key: tuple[str, str, tuple[str, ...]]) -> list:
    return [key[0], key[1], list(key[2])]


def decode_key(value: object) -> tuple[str, str, tuple[str, ...]]:
    if (
        not isinstance(value, list)
        or len(value) != 3
        or not isinstance(value[0], str)
        or not isinstance(value[1], str)
        or not isinstance(value[2], list)
        or not all(isinstance(option, str) for option in value[2])
    ):
        raise OverlapError(f"invalid overlap rule key: {value!r}")
    return value[0], value[1], tuple(value[2])


def collect(root: Path) -> dict[str, list[list]]:
    manifest = build.load_manifest(root / "engine" / "sources" / "apps.yaml")
    app_rules = {}
    for app_name, app in manifest["apps"].items():
        if not app["enabled"]:
            continue
        path = root / app["output"]
        try:
            rules = build.parse_surge_rule_set_text(
                path.read_text(encoding="utf-8-sig"), str(path), (app_name, "overlap")
            )
        except (OSError, build.BuildError) as error:
            raise OverlapError(f"cannot parse {app_name}: {error}") from error
        app_rules[app_name] = {rule.key for rule in rules}

    pairs = {}
    for left, right in combinations(sorted(app_rules), 2):
        overlap = sorted(app_rules[left] & app_rules[right])
        if overlap:
            pairs[f"{left}|{right}"] = [encode_key(key) for key in overlap]
    return pairs


def baseline_document(root: Path) -> dict:
    return {"schema_version": SCHEMA_VERSION, "pairs": collect(root)}


def check(root: Path, baseline_path: Path) -> dict:
    try:
        baseline = json.loads(baseline_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise OverlapError(f"cannot read baseline {baseline_path}: {error}") from error
    if not isinstance(baseline, dict) or baseline.get("schema_version") != SCHEMA_VERSION:
        raise OverlapError("overlap baseline must use schema_version 1")
    pairs = baseline.get("pairs")
    if not isinstance(pairs, dict):
        raise OverlapError("overlap baseline pairs must be a mapping")
    expected = {
        pair: {decode_key(value) for value in values}
        for pair, values in pairs.items()
        if isinstance(pair, str) and isinstance(values, list)
    }
    current_encoded = collect(root)
    current = {
        pair: {decode_key(value) for value in values} for pair, values in current_encoded.items()
    }
    new = {}
    removed = {}
    for pair in sorted(set(expected) | set(current)):
        additions = current.get(pair, set()) - expected.get(pair, set())
        deletions = expected.get(pair, set()) - current.get(pair, set())
        if additions:
            new[pair] = [encode_key(key) for key in sorted(additions)]
        if deletions:
            removed[pair] = [encode_key(key) for key in sorted(deletions)]
    if new:
        sample = ", ".join(f"{pair}:+{len(values)}" for pair, values in list(new.items())[:10])
        raise OverlapError(f"new cross-App overlap requires audit and baseline update: {sample}")
    return {
        "pairs_with_overlap": len(current),
        "rules_in_overlap": sum(len(values) for values in current.values()),
        "removed_since_baseline": removed,
        "new_since_baseline": {},
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path("."))
    parser.add_argument(
        "--baseline",
        type=Path,
        default=Path("engine/reports/overlap_baseline.json"),
    )
    parser.add_argument(
        "--write-baseline",
        action="store_true",
        help="replace the baseline after explicitly reviewing current overlaps",
    )
    arguments = parser.parse_args(argv)
    root = arguments.root.resolve()
    baseline = arguments.baseline
    if not baseline.is_absolute():
        baseline = root / baseline
    try:
        if arguments.write_baseline:
            baseline.parent.mkdir(parents=True, exist_ok=True)
            baseline.write_text(
                json.dumps(baseline_document(root), ensure_ascii=False, indent=2, sort_keys=True)
                + "\n",
                encoding="utf-8",
                newline="\n",
            )
            print(json.dumps({"baseline_written": str(baseline)}, ensure_ascii=False, indent=2))
        else:
            print(json.dumps(check(root, baseline), ensure_ascii=False, indent=2))
        return 0
    except (OverlapError, build.BuildError) as error:
        print(f"overlap check failed: {error}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
