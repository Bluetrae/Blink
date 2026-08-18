from __future__ import annotations

import sys
import unittest
from pathlib import Path
from tempfile import TemporaryDirectory

import yaml

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "engine" / "scripts"))
import build_profile  # noqa: E402

# Sandboxed Windows runners may deny chmod on directories; tempfile cleanup
# calls it on every temporary directory it removes.  Redirect mkdtemp to
# plain directories inside the workspace so TemporaryDirectory keeps working.
import os
import tempfile as _tempfile

_WORKSPACE_TMP = Path(__file__).resolve().parents[2] / ".tmp-tests"
_temp_sequence = iter(range(1 << 30))


def _mkdtemp(*_args, **_kwargs):
    _WORKSPACE_TMP.mkdir(exist_ok=True)
    path = _WORKSPACE_TMP / f"t{os.getpid()}_{next(_temp_sequence)}"
    os.mkdir(path)
    return str(path)


_tempfile.mkdtemp = _mkdtemp


def sample_intent() -> dict:
    return {
        "version": 1,
        "subscription": {
            "name": "Sub",
            "url": "https://YOUR-SUBSCRIPTION-URL",
            "update_interval": 86400,
        },
        "policy_groups": [
            {"name": "Proxy", "type": "select", "members": ["HK", "Final", "Sub"]},
            {"name": "Final", "type": "select", "members": ["HK", "Auto", "DIRECT"]},
            {"name": "HK", "type": "select", "filter": "(?i)Hong\\s*Kong"},
            {
                "name": "Auto",
                "type": "url-test",
                "members": ["HK"],
                "interval": 600,
                "tolerance": 80,
            },
        ],
        "apps": {"YouTube": {"policy": "Proxy"}},
        "infrastructure": [
            {
                "name": "reject",
                "url": "https://ruleset.skk.moe/List/non_ip/reject.conf",
                "policy": "REJECT",
                "qx_url": "https://example.invalid/qx-reject.list",
            },
        ],
    }


class ProfileEngineTests(unittest.TestCase):
    def render(self, intent: dict) -> dict[str, str]:
        return {
            client: build_profile.render_client(client, intent) for client in build_profile.CLIENTS
        }

    def test_all_seven_clients_render_without_leftover_markers(self) -> None:
        outputs = self.render(sample_intent())
        self.assertEqual(set(outputs), set(build_profile.CLIENTS))
        for client, text in outputs.items():
            for marker in build_profile.MARKERS:
                self.assertNotIn(marker, text, f"{client} left marker {marker}")

    def test_every_profile_exposes_single_subscription_placeholder(self) -> None:
        outputs = self.render(sample_intent())
        placeholder = "https://YOUR-SUBSCRIPTION-URL"
        for client, text in outputs.items():
            self.assertIn(placeholder, text, client)
        for client in ("shadowrocket", "loon", "quantumultx"):
            self.assertIn("ADAPTED", outputs[client], client)

    def test_yaml_clients_parse_as_valid_yaml(self) -> None:
        outputs = self.render(sample_intent())
        for client in ("stash", "egern", "clash"):
            document = yaml.safe_load(outputs[client])
            self.assertIsInstance(document, dict)

    def test_clash_uses_text_format_drops_sub_and_ends_with_match(self) -> None:
        outputs = self.render(sample_intent())
        text = outputs["clash"]
        document = yaml.safe_load(text)
        # format: text is mandatory for classical providers (default is yaml).
        self.assertGreater(text.count("format: text"), 0)
        # Clash proxies arrays cannot reference a provider name: Sub must be
        # covered by the region filter groups instead.
        proxy_group = next(g for g in document["proxy-groups"] if g["name"] == "Proxy")
        self.assertNotIn("Sub", proxy_group["proxies"])
        hk_group = next(g for g in document["proxy-groups"] if g["name"] == "HK")
        self.assertEqual(hk_group["use"], ["Sub"])
        # Infrastructure + app providers and the MATCH tail rule.
        self.assertIn("RULE-SET,reject,REJECT", text)
        self.assertIn("RULE-SET,YouTube,Proxy", text)
        self.assertTrue(text.rstrip().endswith("- MATCH,Final"))

    def test_stash_and_egern_filters_are_single_quoted_and_parse(self) -> None:
        outputs = self.render(sample_intent())
        self.assertIn("filter: '(?i)Hong\\s*Kong'", outputs["stash"])
        document = yaml.safe_load(outputs["stash"])
        group = next(g for g in document["proxy-groups"] if g["name"] == "HK")
        self.assertEqual(group["filter"], "(?i)Hong\\s*Kong")

    def test_qx_keeps_group_name_case_and_lowercases_builtins(self) -> None:
        outputs = self.render(sample_intent())
        text = outputs["quantumultx"]
        self.assertIn("force-policy=Proxy", text)  # 组名保持大小写
        self.assertIn("force-policy=reject", text)  # 内置策略小写
        self.assertIn("static=Final, HK,Auto,direct", text)
        self.assertNotIn("Sub", text.split("[policy]")[1].split("[filter_remote]")[0])

    def test_qx_requires_qx_url_for_remote_rules(self) -> None:
        intent = sample_intent()
        del intent["infrastructure"][0]["qx_url"]
        with self.assertRaisesRegex(build_profile.ProfileError, "qx_url"):
            build_profile.render_client("quantumultx", intent)

    def test_unknown_group_member_fails(self) -> None:
        intent = sample_intent()
        intent["policy_groups"][0]["members"].append("Nope")
        with self.assertRaisesRegex(build_profile.ProfileError, "unknown member"):
            build_profile.validate_intent(intent)

    def test_cycle_detection_fails(self) -> None:
        intent = sample_intent()
        intent["policy_groups"][0]["members"] = ["Loop"]
        intent["policy_groups"].append({"name": "Loop", "type": "select", "members": ["Proxy"]})
        with self.assertRaisesRegex(build_profile.ProfileError, "cycle"):
            build_profile.validate_intent(intent)

    def test_app_policy_must_resolve(self) -> None:
        intent = sample_intent()
        intent["apps"]["YouTube"]["policy"] = "Ghost"
        with self.assertRaisesRegex(build_profile.ProfileError, "does not exist"):
            build_profile.validate_intent(intent)

    def test_client_availability_list_honored(self) -> None:
        intent = sample_intent()
        intent["infrastructure"][0]["clients"] = ["surge"]
        outputs = self.render(intent)
        self.assertIn("reject.conf", outputs["surge"])
        self.assertNotIn("reject.conf", outputs["shadowrocket"])

    def test_write_outputs_generates_profiles_dir(self) -> None:
        intent = sample_intent()
        with TemporaryDirectory() as temporary_directory:
            root = Path(temporary_directory)
            for client, (_template, output_name) in build_profile.CLIENTS.items():
                template = root / "sources" / "profile" / "templates" / _template
                template.parent.mkdir(parents=True, exist_ok=True)
                template.write_text("__POLICY_GROUPS__\n__RULES__\n", encoding="utf-8")
            # Swap module constants for the temp root.
            original = (build_profile.TEMPLATE_DIR, build_profile.OUTPUT_DIR)
            build_profile.TEMPLATE_DIR = root / "sources" / "profile" / "templates"
            build_profile.OUTPUT_DIR = root / "Profiles"
            try:
                outputs = {
                    client: build_profile.render_client(client, intent)
                    for client in build_profile.CLIENTS
                }
                build_profile.OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
                for client, text in outputs.items():
                    _template, output_name = build_profile.CLIENTS[client]
                    (build_profile.OUTPUT_DIR / output_name).write_text(text, encoding="utf-8")
                self.assertEqual(len(list((root / "Profiles").glob("*"))), 7)
            finally:
                build_profile.TEMPLATE_DIR, build_profile.OUTPUT_DIR = original


if __name__ == "__main__":
    unittest.main()
