# Third-Party Notices

## Scope

Rulink contains original build code, tests, workflow configuration, and
documentation, together with generated Surge Rule-Sets derived from publicly
available upstream rule sources.

This file records the known upstream provenance and license or project notice
for each generated Rule-Set. It is an attribution and compliance reference,
not legal advice and not a replacement for the full upstream terms.

`Surge/*.list` files are generated artifacts. Rulink does not claim to
relicense upstream rules, nor does this repository grant permissions beyond
those available from the applicable upstream authors and licenses.

## Generated Rule-Set provenance

| Generated file | Upstream project | Upstream URL | Known license or project notice |
| --- | --- | --- | --- |
| `Surge/OKX.list` | v2fly/domain-list-community | https://github.com/v2fly/domain-list-community | MIT License |
| `Surge/WhatsApp.list` | v2fly/domain-list-community | https://github.com/v2fly/domain-list-community | MIT License |
| `Surge/LINE.list` | v2fly/domain-list-community | https://github.com/v2fly/domain-list-community | MIT License |
| `Surge/GitHub.list` | v2fly/domain-list-community | https://github.com/v2fly/domain-list-community | MIT License |
| `Surge/SafePal.list` | v2fly/domain-list-community | https://github.com/v2fly/domain-list-community | MIT License |
| `Surge/Threads.list` | v2fly/domain-list-community | https://github.com/v2fly/domain-list-community | MIT License |
| `Surge/PayPal.list` | Repcz/Tool | https://github.com/Repcz/Tool | MIT License |
| `Surge/YouTube.list` | Repcz/Tool | https://github.com/Repcz/Tool | MIT License |
| `Surge/X.list` | Repcz/Tool | https://github.com/Repcz/Tool | MIT License |
| `Surge/Instagram.list` | Repcz/Tool | https://github.com/Repcz/Tool | MIT License |
| `Surge/Telegram.list` | SukkaW/Surge | https://github.com/SukkaW/Surge | AGPL-3.0 for this non-IP rule source; see upstream README for exceptions |
| `Surge/Netflix.list` | blackmatrix7/ios_rule_script | https://github.com/blackmatrix7/ios_rule_script | GPL-2.0 |
| `Surge/TikTok.list` | Repcz/Tool | https://github.com/Repcz/Tool | MIT License |
| `Surge/Spotify.list` | Repcz/Tool | https://github.com/Repcz/Tool | MIT License |
| `Surge/AI.list` | Repcz/Tool | https://github.com/Repcz/Tool | MIT License |
| `Surge/Steam.list` | Repcz/Tool | https://github.com/Repcz/Tool | MIT License |
| `Surge/ZABank.list` | Rulink repo-maintained supplement | `sources/supplement/ZABank.list` | No upstream source; original repo-maintained rules |
| `Surge/APTV.list` | Rulink repo-maintained supplement (self-use) | `sources/supplement/APTV.list` | Personal rules migrated from Bluetrae/Bridge; no third-party license |

The exact source URL, format, and selection rationale for each App are kept in
[`sources/apps.yaml`](sources/apps.yaml). Upstream projects may change their
licenses, notices, source content, or repository structure; source audits and
this notice must be reviewed whenever a source is added or replaced.

## License handling principles

- Do not remove, override, or misrepresent upstream copyright, license, or
  warranty notices.
- Do not assume that converting a rule source to Surge syntax removes upstream
  license obligations.
- Before redistributing, relicensing, or using a generated Rule-Set beyond
  personal use, review the full terms of every applicable upstream source.
- The Apache, MIT, GPL, AGPL, or other terms of one source do not automatically
  apply to files derived from another source.
- A future license for Rulink original code and documentation must clearly
  exclude upstream material and generated Rule-Sets unless a separate license
  audit establishes that broader licensing is appropriate.

## Source access and reproducibility

The repository publishes the source manifest, conservative build logic, and
GitHub Actions workflow used to create generated files. These materials are
provided to make the transformation reviewable; they do not replace any source
availability, attribution, or license obligations imposed by upstream authors.
