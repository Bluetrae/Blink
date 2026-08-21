from __future__ import annotations

import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "engine" / "scripts"))
import validate_views  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]


class ValidateViewsTests(unittest.TestCase):
    def test_real_repo_views_are_semantically_consistent(self) -> None:
        # The committed semantic views must satisfy the domain-first / IP-last
        # invariants for every views-enabled app.
        report = validate_views.check_views(ROOT)
        self.assertGreaterEqual(len(report["apps"]), 1)
        self.assertIn("Telegram", report["apps"])
        self.assertEqual(report["apps"]["Telegram"], {"domainset": 15, "ip": 14})


if __name__ == "__main__":
    unittest.main()
