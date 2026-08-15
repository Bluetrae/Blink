from __future__ import annotations

import sys
import unittest
from pathlib import Path
from tempfile import TemporaryDirectory

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import build  # noqa: E402


ROOT_URL = "https://example.invalid/data/root"


def app_config(*, allow=None, deny=None, attributes=None, source_format="v2fly-domain-list", url=ROOT_URL) -> dict:
    return {
        "enabled": True,
        "output": "Surge/Test.list",
        "sources": [{"name": "test-source", "role": "primary", "format": source_format, "url": url}],
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
        self.assertEqual(
            set(manifest["apps"]),
            {
                "OKX",
                "WhatsApp",
                "LINE",
                "GitHub",
                "SafePal",
                "PayPal",
                "Netflix",
                "YouTube",
                "X",
                "Instagram",
                "Telegram",
                "Threads",
            },
        )
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

    def test_parses_native_surge_rules_conservatively(self) -> None:
        source_url = "https://example.invalid/Surge/Test.list"
        result = self.compile(
            app_config(source_format="surge-rule-set", url=source_url),
            {
                source_url: (
                    "# generated source\n"
                    "DOMAIN,Api.Example.COM.\n"
                    "DOMAIN-SUFFIX,Example.com\n"
                    "DOMAIN-KEYWORD,GitHub\n"
                    "USER-AGENT,Example App*\n"
                    "PROCESS-NAME,Example App\n"
                    "IP-CIDR,192.0.2.7/24,no-resolve\n"
                    "IP-CIDR6,2001:db8::7/64\n"
                )
            },
        )
        self.assertEqual(
            [rule.render() for rule in result.rules],
            [
                "DOMAIN,api.example.com",
                "DOMAIN-SUFFIX,example.com",
                "DOMAIN-KEYWORD,github",
                "USER-AGENT,Example App*",
                "PROCESS-NAME,Example App",
                "IP-CIDR,192.0.2.0/24,no-resolve",
                "IP-CIDR6,2001:db8::/64",
            ],
        )

    def test_native_surge_unknown_types_and_policies_fail(self) -> None:
        source_url = "https://example.invalid/Surge/Test.list"
        with self.assertRaisesRegex(build.BuildError, "unsupported Surge rule type"):
            self.compile(
                app_config(source_format="surge-rule-set", url=source_url),
                {source_url: "URL-REGEX,^https://example\\.com\n"},
            )
        with self.assertRaisesRegex(build.BuildError, "unexpected option"):
            self.compile(
                app_config(source_format="surge-rule-set", url=source_url),
                {source_url: "DOMAIN,example.com,Proxy\n"},
            )

    def test_rejects_invalid_supplement_keyword(self) -> None:
        with TemporaryDirectory() as temporary_directory:
            supplement = Path(temporary_directory) / "Demo.list"
            supplement.write_text("DOMAIN-KEYWORD,\n", encoding="utf-8")
            with self.assertRaisesRegex(build.BuildError, "invalid supplement rule"):
                build.parse_supplement(supplement, "Demo")


if __name__ == "__main__":
    unittest.main()
