from __future__ import annotations

import sys
import unittest
from pathlib import Path
from tempfile import TemporaryDirectory

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import build  # noqa: E402


ROOT_URL = "https://example.invalid/data/root"


def app_config(*, allow=None, deny=None, attributes=None) -> dict:
    return {
        "enabled": True,
        "output": "Surge/Test.list",
        "sources": [{"name": "v2fly", "role": "primary", "format": "v2fly-domain-list", "url": ROOT_URL}],
        "include_policy": {"mode": "explicit", "allow": allow or [], "deny": deny or []},
        "attributes": {"mode": "explicit", "include": attributes or []},
        "supplement": "sources/supplement/Test.list",
        "exclude": [],
    }


class BuildTests(unittest.TestCase):
    def compile(self, config: dict, texts: dict[str, str]) -> build.Compilation:
        with TemporaryDirectory() as directory:
            return build.compile_app("Test", config, Path(directory), texts.__getitem__)

    def test_maps_core_v2fly_directives_and_normalizes(self) -> None:
        result = self.compile(
            app_config(),
            {ROOT_URL: "Example.COM.\nfull:Api.Example.com\nkeyword:GitHub\n"},
        )
        self.assertEqual(
            [rule.render() for rule in result.rules],
            ["DOMAIN,api.example.com", "DOMAIN-SUFFIX,example.com", "DOMAIN-KEYWORD,github"],
        )

    def test_loads_and_validates_project_manifest(self) -> None:
        root = Path(__file__).resolve().parents[1]
        manifest = build.load_manifest(root / "sources" / "apps.yaml")
        self.assertEqual(set(manifest["apps"]), {"OKX", "WhatsApp", "LINE", "GitHub"})
        for app_name, app in manifest["apps"].items():
            build.validate_app_config(app_name, app)

    def test_explicit_include_allows_and_denies(self) -> None:
        result = self.compile(
            app_config(allow=["child"], deny=["other"]),
            {
                ROOT_URL: "include:child\ninclude:other\nroot.example\n",
                "https://example.invalid/data/child": "child.example\n",
            },
        )
        self.assertEqual([rule.render() for rule in result.rules], ["DOMAIN-SUFFIX,child.example", "DOMAIN-SUFFIX,root.example"])
        self.assertEqual([name for name, _ in result.denied_includes], ["other"])

    def test_unclassified_include_fails(self) -> None:
        with self.assertRaisesRegex(build.BuildError, "not declared"):
            self.compile(app_config(), {ROOT_URL: "include:child\n"})

    def test_attribute_selection_keeps_untagged_entries(self) -> None:
        texts = {ROOT_URL: "plain.example\ncn.example @cn\nads.example @ads\n"}
        without_attributes = self.compile(app_config(), texts)
        self.assertEqual([rule.render() for rule in without_attributes.rules], ["DOMAIN-SUFFIX,plain.example"])
        with_cn = self.compile(app_config(attributes=["cn"]), texts)
        self.assertEqual([rule.render() for rule in with_cn.rules], ["DOMAIN-SUFFIX,cn.example", "DOMAIN-SUFFIX,plain.example"])

    def test_negative_attributes_and_regexp_fail(self) -> None:
        with self.assertRaisesRegex(build.BuildError, "negative attributes"):
            self.compile(app_config(), {ROOT_URL: "not-cn.example @!cn\n"})
        with self.assertRaisesRegex(build.BuildError, "unsupported v2fly regexp"):
            self.compile(app_config(), {ROOT_URL: "regexp:^example\\.com$\n"})

    def test_rejects_invalid_supplement_keyword(self) -> None:
        with TemporaryDirectory() as temporary_directory:
            supplement = Path(temporary_directory) / "Demo.list"
            supplement.write_text("DOMAIN-KEYWORD,\n", encoding="utf-8")
            with self.assertRaisesRegex(build.BuildError, "invalid supplement domain keyword"):
                build.parse_supplement(supplement, "Demo")


if __name__ == "__main__":
    unittest.main()
