# Disclaimer

## Purpose and scope

Blink is a personal-use repository for building and distributing multi-client
App Rule-Sets (Surge, Shadowrocket, Loon, Stash, Egern) from reviewed public
sources. It is provided for learning, personal configuration maintenance, and
rule-format automation.

The repository is not an official product, service, endorsement, or
representation of Surge, Shadowrocket, Loon, Stash, Egern, any application
named by a Rule-Set, or any upstream rule author.

## No warranty

To the maximum extent permitted by applicable law, the repository, its build
logic, source selections, generated Rule-Sets, and documentation are provided
on an "as is" and "as available" basis. No warranty is made that any rule is
accurate, complete, current, suitable for a particular purpose, available in a
given region, compatible with a given client or client version, or effective
for a given network, account, service, or policy configuration.

Upstream sources, DNS behavior, application endpoints, network conditions, and
service policies can change at any time. A successful build does not guarantee
that a Rule-Set will produce the intended routing result.

## User responsibility

Anyone who uses, copies, modifies, or redistributes this repository or its
outputs is responsible for:

- reviewing the generated rules and source changes before relying on them;
- selecting and testing their own policies, DNS settings, and network
  configuration for each client they use;
- checking proxy client logs (currently verified through Surge) and correcting
  app-specific gaps through the documented `engine/sources/supplement/` process;
- complying with applicable laws, service terms, and all relevant upstream
  licenses, notices, and attribution requirements;
- not redistributing, republishing, or mirroring repository content to
  domestic content platforms or public media without permission; and
- protecting their own credentials, subscription URLs, tokens, certificates,
  account data, and other sensitive information.

## Upstream material

Generated Rule-Sets may contain or be derived from third-party public rule
sources. Those sources remain subject to their respective authors' terms,
licenses, notices, and availability. Blink does not grant permission to
use, copy, modify, or redistribute upstream material beyond what the relevant
rightsholders allow.

See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) and
[`engine/sources/apps.yaml`](engine/sources/apps.yaml) for the current source inventory.

## Liability boundary

To the maximum extent permitted by applicable law, the repository maintainer
does not accept responsibility for direct or indirect loss, service disruption,
misrouting, data loss, account impact, or other consequences arising from use
of this repository or its outputs. Nothing in this disclaimer excludes or
limits liability where exclusion or limitation is prohibited by applicable law.

## Changes

This repository, its source selections, generated outputs, and these notices
may be changed or removed at any time. Continued use should be based on the
current repository contents and the then-current terms of applicable upstream
sources.
