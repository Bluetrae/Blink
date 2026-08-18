#!/usr/bin/env python3
"""Scan canonical generated outputs for duplicates, invalid rules, empties, and drifted order."""

from __future__ import annotations

import argparse
import json
import sys
from collections import Counter
from pathlib import Path

import build
from parity_check import read_header


class HealthError(RuntimeError):
    """A generated canonical Rule-Set failed a repository health invariant."""


def check(root: Path) -> dict:
    manifest = build.load_manifest(root / "engine" / "sources" / "apps.yaml")
    report = {}
    for app_name, app in manifest["apps"].items():
        if not app["enabled"]:
            continue
        path = root / app["output"]
        try:
            rules = build.parse_surge_rule_set_text(
                path.read_text(encoding="utf-8-sig"), str(path), (app_name, "health")
            )
        except (OSError, build.BuildError) as error:
            raise HealthError(f"{app_name}: invalid canonical output: {error}") from error
        if not rules:
            raise HealthError(f"{app_name}: canonical output is empty")
        keys = [rule.key for rule in rules]
        duplicates = [key for key, count in Counter(keys).items() if count > 1]
        if duplicates:
            raise HealthError(f"{app_name}: duplicate canonical rules: {duplicates[:5]}")
        expected_order = sorted(keys, key=lambda key: (build.SORT_ORDER[key[0]], key[1]))
        if keys != expected_order:
            raise HealthError(f"{app_name}: canonical rules are not deterministically sorted")
        name, header_count = read_header(path)
        if name != app_name or header_count != len(rules):
            raise HealthError(f"{app_name}: generated header metadata is stale")
        report[app_name] = {
            "rules": len(rules),
            "types": dict(sorted(Counter(rule.kind for rule in rules).items())),
        }
    return {"apps": report}


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path("."))
    arguments = parser.parse_args(argv)
    try:
        print(json.dumps(check(arguments.root.resolve()), ensure_ascii=False, indent=2))
        return 0
    except (HealthError, build.BuildError) as error:
        print(f"health check failed: {error}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
