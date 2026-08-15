# Rulink Source Audits

> 每个 App 的独立 source audit 记录：候选来源、证据、结论与选择理由，按 App 分节集中保存。
> 最终的精简理由同步写入 `sources/apps.yaml` 对应 App 的 `note` 字段；本文件是完整审计档案。

## 审计政策摘要

- 优先偏好：Repcz > SukkaW > 其他长期验证过的成熟作者 > v2fly / MetaCubeX；这是优先偏好而非机械排序。
- 每个 App 的 primary 由 freshness（更新活跃度）、completeness（覆盖完整度）、scope（范围是否精准）、format suitability（Surge 适配性）与 maintenance quality（维护质量）综合决定；作者偏好不能覆盖明显过时或不完整的证据。
- Manifest 硬约束：每个 App 恰好 1 个 primary source，最多 1 个 supplemental source；输出规则不带策略名。
- 构建器 v1 格式边界：
  - `v2fly-domain-list`：`domain`/`full`/`keyword` 映射为 Surge `DOMAIN-SUFFIX`/`DOMAIN`/`DOMAIN-KEYWORD`；regexp 与 `@!` 否定属性直接构建失败；带 `@attribute` 的条目默认被跳过（除非 manifest 显式 include）；`include` 必须在 include_policy 显式 allow/deny，否则构建失败。
  - `surge-rule-set`（严格白名单）：仅接受无策略名的 `DOMAIN`、`DOMAIN-SUFFIX`、`DOMAIN-KEYWORD`、`USER-AGENT`、`PROCESS-NAME`、`IP-CIDR`、`IP-CIDR6`；IP 仅允许额外 `no-resolve`。`IP-ASN`、`URL-REGEX`、带策略名等会导致构建失败。
- 不追求规则数量最大化；避免吞入共享 CDN、广告 SDK、无关基础设施或过宽关键字。
- `sources/supplement/<App>.list` 仅存放上游未覆盖、且由 Surge 日志或实际使用确认的缺口。

## 审计状态

| App | 状态 | 结论摘要 |
| --- | --- | --- |
| AI | 已落地 | Repcz `AI.list`（50 条输出；1 条 URL-REGEX 已类型级排除） |
| TikTok | 已落地 | Repcz `TikTok.list`（81 条输出；2 条 IP-ASN 已类型级排除） |
| Spotify | 已落地 | Repcz `Spotify.list`（21 条），零转换风险，无需 supplemental |
| ZABank | 已落地 | supplement-only（`sources: []` + 3 条根域名），上游 5+ 家全部缺失 |
| Live | 不纳入 | 用户个人直播源，不进入本仓库（2026-08 确认） |

## 各 App 审计记录

### TikTok

审计日期：2026-08-15。以下 URL 与正文均为当日直接抓取验证（Node.js fetch；本环境 pwsh/curl 因沙箱 Schannel 限制不可用）。

候选来源：

| 候选 | 作者 | URL | 格式 | Surge 原生 | 规模/覆盖 | 维护证据 | 过宽/无关条目 | 格式风险 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Repcz（一梯队） | Repcz | `https://raw.githubusercontent.com/Repcz/Tool/X/Surge/Rules/TikTok.list`（200） | surge-rule-set | 是 | 83 条：DOMAIN 19 / DOMAIN-SUFFIX 55 / DOMAIN-KEYWORD 7 / IP-ASN 2；覆盖 tiktok.com、cdn、musical.ly、byteimg/byte* CDN、ttlive 等 | 仓库每日自动更新，分支 head 2026-08-15（仓库历史重写，无逐文件 commit） | cocacola.co.jp、api.snapkit.com、courses.snapsolve.com（Snap 系）、engagements.appsflyer.com、roovza-*.appsflyersdk.com（AppsFlyer SDK）、capcut.com、musemuse.cn | 尾部 2 条 `IP-ASN,11983/138699,no-resolve` 超出 build.py v1 白名单，当前会构建失败 |
| SukkaW（一梯队） | SukkaW | 无 TikTok 专项（仓库递归树 0 命中 tiktok/bytedance/capcut 等） | — | — | — | — | — | 不存在专项规则，非被降级 |
| blackmatrix7 | blackmatrix7 | `.../rule/Surge/TikTok/TikTok.list`（200） | surge-rule-set | 是 | 33 条 | 最后 commit 2025-12-21；文件头 UPDATED 2025-08-10（约 8 个月陈旧） | marscode.com、trae.ai、trae-api-sg.mchost.guru、byteintlapi.com（字节 AI IDE 工具）、capcut.com、snssdk.com（抖音 SDK）；`DOMAIN-KEYWORD,tiktok` 过宽 | 格式全白名单兼容，但陈旧且范围漂移 |
| v2fly | v2fly | `.../master/data/tiktok`（200） | v2fly-domain-list | 否 | 36 条：25 裸后缀 + 10 `full:` + 1 `@ads` | 最后 commit 2026-08-05（活跃） | `full:roovza-*.appsflyersdk.com`（AppsFlyer SDK） | 全部条目带 `@!cn` 否定属性，v1 对否定属性直接构建失败，不可用 |
| MetaCubeX | MetaCubeX | 无 TikTok 文本产物（树 0 命中） | — | — | — | — | — | 无 |

推荐 primary：**Repcz TikTok.list**。理由：一梯队、Surge 原生、覆盖最完整（83 条含 CDN/关键字/IP）、维护最活跃；唯一障碍是 2 条 IP-ASN，需要一次显式、可审计的清单/构建器决策（见下方“待决策”）。可选 exclude（若希望收紧）：cocacola.co.jp、api.snapkit.com、courses.snapsolve.com、engagements.appsflyer.com、roovza-launches.appsflyersdk.com、capcut.com、musemuse.cn。

supplemental：**不需要**。v2fly 独有的边缘域名（tiktok-minis.com、tiktok-row.net、tiktokeu-cdn.com、ttcdn-us.com 等）按政策等待 Surge 日志确认后再补。

决议（2026-08-15）：build.py 已增加类型级 exclude，manifest 使用 `exclude: ["ip-asn:*"]` 显式丢弃 2 条 IP-ASN；输出 81 条，构建报告 `skipped_excluded: 2`。审计中列出的可选收紧项（cocacola.co.jp、Snap 系、AppsFlyer SDK、capcut.com 等）暂不排除，等待 Surge 日志证据。

### Spotify

审计日期：2026-08-15。以下 URL 与正文均为当日直接抓取验证。

候选来源：

| 候选 | 作者 | URL | 格式 | Surge 原生 | 规模/覆盖 | 维护证据 | 过宽/无关条目 | 格式风险 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Repcz（一梯队） | Repcz | `https://raw.githubusercontent.com/Repcz/Tool/X/Surge/Rules/Spotify.list`（200） | surge-rule-set | 是 | 21 条：SUFFIX 17 + KEYWORD 1（-spotify-com）+ IP-CIDR 1（35.186.224.47/32,no-resolve）+ PROCESS-NAME com.spotify.music + USER-AGENT Spotify* | 仓库每日自动更新（分支 head 2026-08-15）；文件自身最后提交 2026-08-06（仓库历史重写） | 无共享 CDN/广告/第三方；akamaized 均为 spotify 专属（spotify-com.akamaized.net 同时覆盖 audio4-ak/heads-ak 等） | 无：全部在 v1 白名单内，零转换风险 |
| SukkaW（一梯队） | SukkaW | 无独立 Spotify 文件（`Source/non_ip/spotify.conf` 404）；SPOTIFY 常量内嵌于 `Source/stream.ts`（20 条，与 Repcz 内容几乎一致），发布物为合并 `ruleset.skk.moe/List/non_ip/stream.conf`（409 行多服务混排） | TS 源码 + 合并 conf | 语法原生但非独立列表 | 20 条 | stream.ts 最后提交 2025-11-13（约 9 个月） | 同 Repcz | 需从 TS 抽取或从合并 stream.conf 拆分，无直接可用的窄范围产物 |
| v2fly | v2fly | `.../master/data/spotify`（200） | v2fly-domain-list | 否 | 25 条：17 裸后缀 + 8 `full:` + 3 `@ads` | 最后 commit 2026-06-23 | 第三方 `full:cdn-spotify-experiments.conductrics.com` 会直接混入（需 exclude）；3 条 @ads 追踪域默认被跳过 | 可转换，无 regexp/include/@! 否定 |
| blackmatrix7 | blackmatrix7 | `.../rule/Surge/Spotify/Spotify.list`（200） | surge-rule-set | 是 | 31 条：DOMAIN 6 + KEYWORD 1（spotify，偏宽）+ SUFFIX 20 + IP-CIDR 2 + PROCESS-NAME 1 + USER-AGENT 1 | 文件头 UPDATED 2025-06-06；最后 commit 2025-06-17（约 14 个月陈旧） | 第三方 conductrics.com；`DOMAIN-KEYWORD,spotify` 过宽 | 格式干净但过时 |
| MetaCubeX | MetaCubeX | 无 Surge 文本 Spotify 产物（geosite 数据源自 v2fly，内容等价） | 二进制 dat | 否 | — | — | — | 不适合直接作源 |

推荐 primary：**Repcz Spotify.list**。理由：一梯队、可直接消费的独立 Surge 原生文件、覆盖核心域名 + 音频 CDN + IP + 进程 + UA；与 SukkaW 内容规范化后等价时，作者优先偏好作为 tie-breaker，且 Repcz 更活跃、产物可直接使用。

supplemental：**不需要**。其他源中非冗余条目（spotify.map.fastly.net、spotify.map.fastlylb.net、spotify.com.edgesuite.net、spotify.link）均为边缘 CDN/短链，按“仅日志确认缺口才补”原则暂不预补；conductrics.com 属第三方，明确不纳入。

无需任何构建器改动，可直接按现有 manifest 结构新增。

### AI（聚合式 Rule-Set）

审计日期：2026-08-15。目标：单一聚合 AI Rule-Set，覆盖主流 AI 服务（ChatGPT/OpenAI、Claude、Gemini、Perplexity、Poe、Grok、Copilot 等）。以下 URL 与正文均为当日直接抓取验证。

候选来源：

| 候选 | 作者 | URL | 格式 | Surge 原生 | 规模/覆盖 | 维护证据 | 过宽/无关条目 | 格式风险 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SukkaW（一梯队） | SukkaW | `https://raw.githubusercontent.com/SukkaW/Surge/master/Source/non_ip/ai.conf`（200） | surge-rule-set（conf 语法） | 是 | 51 条有效行（含 1 条 URL-REGEX）：OpenAI/ChatGPT（openai/oaistatic/sora/chatgpt/chat.com/ai.com + KEYWORD openai）、Claude（anthropic/claude.ai/claude.com）、Perplexity、Google AI（bard/gemini/aisandbox/deepmind/generativelanguage/aistudio/makersuite/notebooklm/jules/antigravity/aida/generativeai 等）、Poe、Meta AI、Cloudflare AI Gateway、Dify、Jasper/Clipdrop、OpenArt、Copilot（api.github.com）、Grok（grok.com/x.ai）、Groq、JetBrains AI、OpenRouter | 最后 commit 2026-08-06（活跃，PR 溯源完整） | 无共享 CDN；均为各服务自有域 | 1 条 `URL-REGEX,https://www\.google\.com/.*continue=https://gemini\.google\.com.+`（修复 Gemini 429 sorry 跳转，需 MitM www.google.com）超出 v1 白名单 |
| Repcz（一梯队） | Repcz | `https://raw.githubusercontent.com/Repcz/Tool/X/Surge/Rules/AI.list`（200） | surge-rule-set | 是 | 51 条；内容与 SukkaW ai.conf 几乎逐条一致（明显派生自 SukkaW），额外多 `DOMAIN,file.oaiusercontent.com`（OpenAI 文件 CDN） | 仓库每日自动更新（分支 head 2026-08-15） | 同 SukkaW | 同 SukkaW：1 条相同 URL-REGEX |
| v2fly | v2fly | `.../master/data/category-ai-!cn`（200） | v2fly-domain-list | 否 | 约 30 个 include（anthropic/cursor/github-copilot/huggingface/manus/openai/perplexity/poe/xai 等）+ 数十个杂项 AI 工具域（midjourney/mistral/ollama/lmstudio/crewai/devin 等） | 最后 commit 2026-08-04 | 范围远超“主流 AI 服务”需求，含大量小众工具 | include 全部需显式 allow/deny（管理成本高）；且包含 bytedance-ai-!cn 等，范围失控 |
| blackmatrix7 | blackmatrix7 | 无聚合 AI.list（404）；分服务列表：OpenAI 35 / Copilot 51 / Gemini 13 / Claude 3 | surge-rule-set | 是 | 覆盖分散 | 文件头 UPDATED 2025-06-06（陈旧） | 大量第三方基础设施（statsig/auth0/intercom/sentry/stripe/launchdarkly/algolia 等）、telemetry 域；OpenAI/Copilot 各含 IP-ASN | 聚合需拼接 4+ 源，超出“1 primary + ≤1 supplemental”约束 |
| MetaCubeX | MetaCubeX | 无直接可用的 Surge 文本聚合产物 | — | — | — | — | — | 不适合直接作源 |

推荐 primary：**Repcz AI.list**（备选 SukkaW ai.conf）。理由：两个一梯队候选规范化后基本等价（Repcz = SukkaW + `file.oaiusercontent.com`）；按“候选规范化后等价时作者优先偏好作 tie-breaker”选 Repcz；若更看重原版与 PR 溯源，可改选 SukkaW ai.conf（同样活跃，2026-08-06）。两者都必须显式处理 1 条 URL-REGEX（见“待决策”）。

supplemental：**不需要**。

其他注意事项：
- **DeepSeek 未覆盖**：Repcz/SukkaW 聚合均不含 deepseek.com（v2fly `data/deepseek` 仅 1 行 `deepseek.com`；blackmatrix7 无）。推测原因是 DeepSeek 为国内服务、通常直连。是否需要纳入 AI 聚合需用户确认；若纳入，在 primary 之外需另做决策（supplement 按政策要求日志确认缺口）。
- **与既有输出的重叠**：AI 聚合含 grok.com/x.ai（与 X.list 的 Grok 覆盖重叠）与 api.github.com（与 GitHub.list 的 copilot 覆盖重叠）。Surge 中不同 RULE-SET 按顺序命中，重叠无害；仅在此记录。
- 决议（2026-08-15）：build.py 已增加类型级 exclude，manifest 使用 `exclude: ["url-regex:*"]` 显式丢弃 1 条 URL-REGEX；输出 50 条，`skipped_excluded: 1`。DeepSeek 未纳入（国内直连默认；须日志确认缺口后才可进 supplement）。

### ZABank

审计日期：2026-08-15。以下 URL 与状态码均为当日直接抓取验证（Node.js fetch；部分经本地代理 CONNECT 隧道）。

候选来源：**全部缺失**。

| 作者 | 验证结果 |
| --- | --- |
| Repcz | X/Surge/Rules 目录 75 个 .list 无 ZABank；`ZABank.list`、`ZA-Bank.list`、`ZABANK.list`、`za-bank.list`、`Bank.list`、`Finance.list` 全部 404 |
| SukkaW | `Source/non_ip` 仅 29 个文件，无 za 相关；`hk.conf` 404 |
| v2fly | `data/zabank` 404、`data/zainvest` 404；全量树 1536 个 `data/*` 无 zabank/zainvest/za.group；银行类目仅 `category-bank-cn/ir/jp/mm/ru`（无 HK） |
| blackmatrix7 | `rule/Surge` 670 项无 ZABank；`ZABank/ZABank.list` 404、`ZA/ZA.list` 404 |
| MetaCubeX | 规则以二进制 Releases 分发，仓库树内无 za/bank/hk 文本规则 |
| xkww3n/Rules（成熟作者） | 74 项无 za |

9 个候选域名对照：全部未覆盖，且全部是三个根域名的子域名：

- `za.group`：wbs、i18n、offlineapp、bankappgw、aim-abtesting-sdk
- `zainvest.group`：bank-stock、bank-sbsmarket
- `zajourney.com`：appmon-prd、integrate-appgw

推荐方案：无成熟上游可作 primary。以 3 条根域名 `DOMAIN-SUFFIX,za.group` / `DOMAIN-SUFFIX,zainvest.group` / `DOMAIN-SUFFIX,zajourney.com` 建立最小规则集，即可覆盖全部 9 个候选域名；纯 DOMAIN-SUFFIX，零转换风险，兼容 build.py 两种格式。

决议（2026-08-15）：采用方案 (a) —— build.py 允许 `sources: []`（supplement-only），manifest 已落地：`sources/supplement/ZABank.list` 写入三条根域名，输出 3 条规则。9 个候选域名来自用户实际使用记录（此前交接文档中的候选清单），若与实际使用不符请告知，可随时移除。

supplemental：不适用（本身即无 primary 上游）。
