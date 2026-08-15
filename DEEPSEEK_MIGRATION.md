# DeepSeek Harness 迁移说明

> 用途：让新的 Agent 在不导入或伪造旧聊天会话的前提下，安全、准确地接手 Rulink。
>
> 本文件是项目上下文摘要，不是完整聊天记录，也不是运行时配置文件。它不应包含 API key、token、订阅地址、密码、2FA、证书或其他敏感信息。

## 使用方式

在 DeepSeek Harness 中选择本仓库作为 workspace 后，先要求 Agent 按下面的“必读顺序”只读检查项目。首次回应必须复述它理解的当前状态和下一步建议；获得用户确认前不得修改文件。

推荐的首次提示：

```text
你正在接手 Rulink 项目。请先只读地阅读 DEEPSEEK_MIGRATION.md 指定的文件，
并执行 Git 与项目状态审计。把当前 Git 工作区和 sources/apps.yaml 视为最高
事实来源；若与历史聊天或摘要冲突，以当前文件和 Git 历史为准。先报告你的理解，
在我明确确认前不要修改文件。
```

## 项目身份与事实优先级

- 项目名称：Rulink
- GitHub：<https://github.com/Bluetrae/Rulink>
- 本地工作区：`C:\Users\Jennie\Projects\Rulink`
- Raw Rule-Set 基础地址：`https://raw.githubusercontent.com/Bluetrae/Rulink/main/Surge/`

遇到信息不一致时，按以下顺序判断：

1. 当前 Git 工作区、`git status`、Git 历史和实际生成文件。
2. `sources/apps.yaml`、`scripts/build.py`、测试与 GitHub Actions workflow。
3. `AGENTS.md`、`HANDOFF.md`、README 与合规文档。
4. 本文件。
5. 仓库外保存的原始聊天档案。

原始对话可能含有已废弃的设计、临时推测或已完成事项；它只能用于追溯，不能覆盖较高优先级的事实。

## 必读顺序

1. `README.md`：项目用途、用户入口和当前输出清单。
2. `AGENTS.md`：长期规则、上游选择政策、Git 安全要求和新增 App 流程。
3. `HANDOFF.md`：最近完成状态、已审计来源和后续计划。
4. `sources/apps.yaml`：所有启用 App 的权威 source manifest 与 parser policy。
5. `scripts/build.py` 与 `tests/test_build.py`：构建器实际支持的语义和测试边界。
6. `.github/workflows/update.yml`：自动更新、写入和 Actions 提交逻辑。
7. `THIRD_PARTY_NOTICES.md` 与 `DISCLAIMER.md`：来源许可、个人使用和责任边界。

## 当前迁移基线

本文件创建前的已验证 Git 基线是：

```text
4402b1a refactor: rename repository to Rulink
origin: https://github.com/Bluetrae/Rulink.git
```

该基线仅作迁移记录。每次接手都必须重新执行只读 `git status`、`git log` 和必要的测试；不要假设此处的提交仍是最新状态。

仓库已从 `WProxyRules` 改名为 `Rulink`。项目文档、origin 和 public raw URL 应使用 `Bluetrae/Rulink`，不得再新增旧名称或旧 raw URL。

## 项目目标

Rulink 自动聚合、转换、去重，并在确认存在上游缺口时合并 supplement，发布个人使用的 Surge App Rule-Sets。

Surge 主配置只引用 Rulink 的稳定 raw URL，并由 `RULE-SET` 自行指定策略。上游发生变化时，优先更新 manifest/source 定义，而不是要求用户批量修改 Surge 主配置。

## 不可违反的项目边界

- `Surge/*.list` 是 generated files；禁止手工编辑。
- `sources/supplement/<App>.list` 只存放上游未覆盖、且由 Surge 日志或实际使用确认的缺口；没有缺口时不创建空文件。
- 写入 supplement 前必须与选定上游比较，禁止重复加入已有规则。
- 每个 App 默认一个 primary source，最多一个 supplemental source；不追求规则数量最大化。
- Reject、Domestic、China IP、CDN、LAN 等基础设施规则不纳入本仓库，继续直接引用成熟上游。
- 输出规则不带 Surge 策略名。
- 不得提交订阅 URL、token、PAT、密码、2FA、MTProto secret、证书或任何敏感信息。
- 不得未经用户明确确认使用 `git reset --hard`、force push 或改写已经发布的历史。
- 任何会改变 Git 状态的命令前，先用一句中文说明该命令作用；暂存、提交、推送均需清楚汇报范围和结果。

## 上游选择与审计原则

长期优先偏好为：Repcz 与 SukkaW 一梯队 > 其他长期验证过的成熟作者 > v2fly / MetaCubeX。

偏好不是机械排序。每次 source audit 都必须基于 freshness、completeness、scope、format suitability 与 maintenance quality 作出结论。若优先作者的专项规则缺失、过时、范围不准或覆盖不足，应按证据选择更合适的活跃来源。

新增 App 或替换 primary 前必须完成独立 source audit，记录候选来源、作者、URL、维护情况、覆盖特点、Surge 适配性、潜在过宽条目、推荐 source 与理由。可以按产品类别批量研究，但结论必须按 App 独立保存。

## 构建器 v1 的关键语义

- `scripts/build.py` 默认只检查；仅显式传入 `--write` 才能写入 `Surge/*.list`。
- v1 支持 `v2fly-domain-list` 与严格白名单的 policy-free `surge-rule-set`。
- v2fly `domain`、`full`、`keyword` 分别映射为 Surge `DOMAIN-SUFFIX`、`DOMAIN`、`DOMAIN-KEYWORD`；不安全的 regexp 不得静默改变语义。
- v2fly include 采用显式 allow/deny policy：未在 allow 或 deny 中声明的 include 必须导致构建失败；同一 include 同时允许和拒绝也必须失败。
- attribute 语义固定为“无 attribute 条目 + 至少带一个显式允许 attribute 的条目”。当前所有 App 的 `attributes.include` 均为空，因此只输出无 attribute 条目；`@!name` 否定属性在 v1 不支持，必须失败而非静默处理。
- exclude 是 manifest 的显式、可审计决策，不能用猜测替代 source audit。
- surge-rule-set 来源可通过类型级 exclude（`ip-asn:*`、`url-regex:*`）显式丢弃 v1 不输出的规则类型；被丢弃的行数出现在构建报告的 `skipped_excluded` 字段。
- 上游完全缺失的 App 可声明 `sources: []`（supplement-only），全部规则来自 `sources/supplement/<App>.list`；最终输出仍必须非空。
- 构建必须保守、可读、错误显式；不能为了成功生成而扩大规则范围或篡改规则语义。

## 已启用的 App 与 primary source

| App | 当前 primary | 格式 | 关键边界 |
| --- | --- | --- | --- |
| OKX | v2fly | `v2fly-domain-list` | `oklink.com @cn` 当前不启用。 |
| WhatsApp | v2fly | `v2fly-domain-list` | `@ads` graph 条目当前不启用。 |
| LINE | v2fly | `v2fly-domain-list` | 不引入整个 `naver.jp`；`nhncorp.jp` 仅凭证据处理。 |
| GitHub | v2fly | `v2fly-domain-list` | 允许 `github-copilot`，拒绝 `npmjs`；不扩大为 Microsoft/Amazon/Azure 公共基础设施。 |
| SafePal | v2fly | `v2fly-domain-list` | 上游已覆盖 `isafepal.com` 与 `safepal.com`。 |
| PayPal | Repcz | `surge-rule-set` | 与比较过的 blackmatrix7 输出等价时，按优先偏好选择 Repcz。 |
| Netflix | blackmatrix7 | `surge-rule-set` | 保留有价值的 IPv4/IPv6 与 `no-resolve` 语义。 |
| YouTube | Repcz | `surge-rule-set` | 保持紧凑、核心的专项范围。 |
| X | Repcz | `surge-rule-set` | 保留 X/Twitter/Grok/媒体及已审计的窄范围 IP 覆盖。 |
| Instagram | Repcz | `surge-rule-set` | 排除过宽的 `DOMAIN-KEYWORD,instagram`。 |
| Telegram | SukkaW | `surge-rule-set` | 只保留核心 Telegram 范围；不默认包含 TON 与第三方客户端生态。 |
| Threads | v2fly | `v2fly-domain-list` | 当前为 `threads.com` 与 `threads.net` 的窄范围集合。 |
| TikTok | Repcz | `surge-rule-set` | 2 条 `IP-ASN` 通过 `exclude: ["ip-asn:*"]` 类型级丢弃。 |
| Spotify | Repcz | `surge-rule-set` | 21 条全白名单兼容，零转换风险。 |
| AI | Repcz | `surge-rule-set` | 1 条 `URL-REGEX` 通过 `exclude: ["url-regex:*"]` 类型级丢弃；DeepSeek 未纳入。 |
| ZABank | 无上游 | supplement-only | `sources: []`，仅 `sources/supplement/ZABank.list` 三条根域名。 |
| Steam | Repcz | `surge-rule-set` | 20 条核心域名，零转换风险；blackmatrix7 陈旧且含无关域名。 |
| APTV | 无上游 | supplement-only | 用户自用直播源（26 条，注释自用，迁自 Bluetrae/Bridge；原计划名 Live）。 |

实际 URL、exclude、include policy、attribute policy 和完整选源理由均以 `sources/apps.yaml` 为准。

## 自动化与验证

- Python 依赖仅为锁定的 `PyYAML==6.0.3`；本地 `.venv` 是开发环境，不应提交。
- 单元测试入口：`.\.venv\Scripts\python.exe -m unittest discover -s tests -v`
- 单 App 只读预检优先使用：`.\.venv\Scripts\python.exe scripts\build.py --app <App>`。
- 全量写入仅使用：`.\.venv\Scripts\python.exe scripts\build.py --write`，并应在确认范围后执行。
- GitHub Actions workflow 名称为 `Update Surge Rule-Sets`，支持手动运行和每日北京时间约 00:01 运行（GitHub 定时任务不保证准点，实际执行可能延后）。只有 `Surge/` 发生变化时，workflow 才会以 `github-actions[bot]` 创建生成提交。
- 每日运行全自动、无人值守：有实质变化才提交、无变化零提交；构建失败（上游 404/超时/格式不合 v1）时保留旧输出、暂停更新，等待人工处理且无时限；新 App 与 supplement 永远由人工审计添加。

对新增 App，优先做定向预检；全量构建放在 GitHub Actions、每日更新、发布前健康检查或用户明确要求的全仓库验证中。构建写入必须保持原子性：所有选定 App 都成功后才更新输出。

## 已知待办与谨慎项

- 后续计划中的 AI、TikTok、Spotify、ZABank 已于 2026-08-15 完成 source audit 并全部落地；完整档案见 `SOURCE_AUDITS.md`。原清单中的 Live（现命名 APTV）是用户自用直播源，同日以 supplement-only 形式迁入（26 条，注释自用）。
- Apple Music 暂缓：当前 Apple 分流仍依赖 Repcz、SukkaW、extended-matching 与手工 CDN 修复，暂不纳入此 pipeline。
- ZABank 的 9 个候选域名已经 2026-08-15 审计确认上游全部缺失，并以三条根域名（`za.group`、`zainvest.group`、`zajourney.com`）写入 `sources/supplement/ZABank.list`；如有日志发现新的 ZA Bank 域名，按漏网处理流程追加。
- `sources/supplement/` 目前含 `ZABank.list`（3 条根域名）与 `APTV.list`（26 条自用直播源）；其他 App 无 supplement 文件是正确的空状态，不是缺失文件。
- 若 Surge 日志出现漏网：先确认 App 归属，再与上游比较，确认真正缺失后才加入对应 supplement、重新构建并验证。

## 原始聊天档案

完整对话若需要保留，应存放在仓库外的私密本地目录，例如：

```text
C:\Users\Jennie\Documents\AI-Archives\Rulink\
```

不要将完整聊天记录提交到公开仓库，也不要在每次新 session 自动交给模型。只有在需要追溯某项决策时，才提供经过筛选和脱敏的相关片段。
