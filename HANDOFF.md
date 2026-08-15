# Rulink 项目交接状态

## 项目名称

Rulink

## GitHub

https://github.com/Bluetrae/Rulink

## 本地路径

`C:\Users\Jennie\Projects\Rulink`

## 当前状态

- `main` 跟踪 `origin/main`
- working tree clean
- `safe.directory` 已配置完成
- 根目录刻意不设置覆盖整个仓库的统一许可证：原创构建代码/文档与第三方上游及 generated Rule-Set 分开处理；`THIRD_PARTY_NOTICES.md` 记录来源和已知许可，`DISCLAIMER.md` 记录个人使用、无担保与责任边界
- `sources/apps.yaml` 已定义十八个 App：OKX、WhatsApp、LINE、GitHub、SafePal、Threads 使用 v2fly primary source；PayPal、YouTube、X、Instagram、TikTok、Spotify、AI、Steam 使用 Repcz 原生 Surge primary source；Telegram 使用 SukkaW 原生 Surge primary source；Netflix 使用 blackmatrix7 原生 Surge primary source；ZABank 无可用上游、APTV 为用户自用直播源，均为 supplement-only App（`sources: []`）；均保留显式 parser policy
- `requirements.txt` 将唯一第三方依赖锁定为 `PyYAML==6.0.3`
- `scripts/build.py` 已完成 v1；默认只做检查，只有显式传入 `--write` 才会写入生成目录。它支持 `v2fly-domain-list` 与严格白名单的 `surge-rule-set` 输入格式，并支持类型级 exclude（`ip-asn:*`、`url-regex:*`）与 supplement-only App（`sources: []`）
- **多客户端支持已完成（v1.1）**：`scripts/renderers.py` 提供 2 个 Renderer —— `classical`（Surge / Shadowrocket / Loon / Stash 四个目录逐字节相同，`Surge/*.list` 路径与字节完全不变）与 `egern-yaml`（Egern `*_set` schema；`PROCESS-NAME` 显式丢弃并计入构建报告，`no_resolve` 为 set 级、混合时显式失败）。格式审计与架构决策见 `docs/MULTI_CLIENT_AUDIT.md`；Surge 向后兼容门禁 = 重构建后 `git diff Surge/` 为空（单测 `test_existing_surge_outputs_roundtrip_byte_identical` 覆盖离线往返字节一致性）
- 新增生成目录：`Loon/*.list`、`Shadowrocket/*.list`、`Stash/*.list`（与 `Surge/*.list` 逐字节相同）、`Egern/*.yaml`（每 App 一份 YAML Rule-Set）
- 构建报告新增 `clients` 字段：每客户端规则数与显式 dropped 列表；check 模式同样渲染全部客户端，非 Surge renderer 的失败会在预检阶段暴露
- `.github/workflows/update.yml` 已更名为 Update Rule-Sets，提交范围覆盖 `Surge Loon Shadowrocket Stash Egern portal/public/data`
- `tests/test_build.py` 增至 25 个用例；测试临时目录经模块级 patch 落在工作区 `.tmp-tests/`（已 gitignore），兼容沙箱化 Windows 运行环境
- `tests/test_build.py` 已覆盖 v2fly 核心映射、include allow/deny、attribute 语义、严格原生 Surge 解析、类型级 exclude、supplement-only App、抓取重试、CLI 端到端、错误策略、实际 manifest 校验、Egern YAML schema、PROCESS-NAME 降级报告、no-resolve set 级语义及 Surge golden-byte 往返
- `.github/workflows/update.yml` 已启用；支持手动运行和每日北京时间约 00:01 的定时运行（GitHub 定时任务不保证准点）
- GitHub Actions 首次完整成功运行是 #2，生成 commit 为 `5b1ff58 chore: update generated Surge rule-sets`
- GitHub Actions 第 3 次手动运行成功，生成 commit 为 `498ca27 chore: update generated Surge rule-sets`
- GitHub Actions 第 4 次手动运行成功，生成 commit 为 `d69291a chore: update generated Surge rule-sets`
- 最近一次手动运行成功，生成 commit 为 `4f2535c chore: update generated Surge rule-sets`
- 随后一次 GitHub Actions 运行生成 commit `832541c chore: update generated Surge rule-sets`：为全部 12 个生成文件写入 `# 规则名称` 与 `# 规则统计` 头部（构建器实现于 `76cdb63 feat: add metadata headers to generated rule-sets`）
- `DEEPSEEK_MIGRATION.md` 已加入仓库，供新 Agent 无会话接手；2026-08-15 之后的最新提交以 `git log` 为准
- 已生成 `Surge/OKX.list`、`Surge/WhatsApp.list`、`Surge/LINE.list`、`Surge/GitHub.list`、`Surge/SafePal.list`、`Surge/PayPal.list`、`Surge/Netflix.list`、`Surge/YouTube.list`、`Surge/X.list`、`Surge/Instagram.list`、`Surge/Telegram.list`、`Surge/Threads.list`、`Surge/TikTok.list`、`Surge/Spotify.list`、`Surge/AI.list`、`Surge/ZABank.list`、`Surge/Steam.list`、`Surge/APTV.list`
- `sources/supplement/` 目前含 `ZABank.list`（3 条根域名，supplement-only）与 `APTV.list`（26 条自用直播源，supplement-only，已注释自用）；其他 App 无 supplement 文件，这是预期状态
- 2026-08-15：完成用户 Surge 主配置与仓库输出的完整对照；脱敏结论见 `SOURCE_AUDITS.md`「用户 Surge 主配置对照」一节（要点：ZA Bank 9 条手工行、OKX 7 条手工行可删；Telegram 主配置保持现状；Steam 已新增纳入；APTV 已迁入为自用 supplement）
- `portal/` 与 `scripts/gen_portal_stats.py` 是用户在**另一个工作流窗口**开发中的仓库门户网站内容，属授权内容：不要删除、不要改动、不要纳入自己的提交；本地提交一律使用显式路径暂存（如 `git add README.md`），避免与门户开发互相干扰
- 门户已上线：https://bluetrae.github.io/Rulink/（仓库 About 已填 Website；GitHub Pages 采用 GitHub Actions 构建，`pages.yml` 随 `main` 推送自动部署）。主题为时间制：08:00–22:00 浅色、22:00–08:00 深色，无手动切换按钮；配色对齐 DeepSeek Harness 设计令牌；favicon 使用 DeepSeek 官方图标（已记录于 `THIRD_PARTY_NOTICES.md`「Repository assets」）。页面特性：悬浮胶囊导航（滚动玻璃化）、首屏错峰入场、CTA 旋转描边、移动端汉堡菜单、流式标题；README 预览图位于 `docs/images/portal-preview.png`（与 README 同步更新）

## 项目目标

自动生成个人使用的多客户端 App Rule-Sets（Surge / Shadowrocket / Loon / Stash / Egern）：一份 source definition 与 canonical 规则，渲染为多客户端输出；完整规范见 [AGENTS.md](AGENTS.md)，对外说明见 [README.md](README.md)，本文件不重复。

## Upstream Source Selection Policy

上游选择政策与 source audit 要求以 [AGENTS.md](AGENTS.md) 为准（一梯队审计顺序、audit 记录项均在其中），本文件不重复；每个 App 的最终结论见下文「已确定的规则源结论」与 [SOURCE_AUDITS.md](SOURCE_AUDITS.md)。

## 后续计划纳入

原计划中的 AI、TikTok、Spotify、ZABank 已于 2026-08-15 完成 source audit 并全部落地（见 `SOURCE_AUDITS.md` 与下文结论）。

原清单中的 Live（现命名 APTV）是用户自用直播源，已于 2026-08-15 以 supplement-only 形式迁入本仓库（26 条，注释自用，迁自 Bluetrae/Bridge）。

## 已确定的规则源结论

各 App 的具体选源结论如下（权威定义与精简理由见 `sources/apps.yaml` 的 `note`；完整审计档案见 `SOURCE_AUDITS.md`）：

- OKX：`https://raw.githubusercontent.com/v2fly/domain-list-community/master/data/okx`。旧 blackmatrix7 规则过少；当前保留无 attribute 条目，`oklink.com @cn` 未启用。
- WhatsApp：`https://raw.githubusercontent.com/v2fly/domain-list-community/master/data/whatsapp`。比旧 blackmatrix7 覆盖更现代；`@ads` graph 条目未启用。
- LINE：`https://raw.githubusercontent.com/v2fly/domain-list-community/master/data/line`。当前比旧 blackmatrix7 更完整；避免引入整个 `naver.jp`，但 `line.naver.jp` 与 `nhncorp.jp` 暂不凭猜测排除，等待实际日志证据。
- GitHub：`https://raw.githubusercontent.com/v2fly/domain-list-community/master/data/github`。显式允许 `github-copilot` include，显式拒绝 `npmjs` include；精确 GitHub Azure/S3 生产主机可保留，但不得扩展为整个 Microsoft、Amazon 或 Azure 公共基础设施；`@ads` telemetry 条目未启用。
- SafePal：`https://raw.githubusercontent.com/v2fly/domain-list-community/master/data/safepal`。当前无可用的 Repcz、SukkaW、blackmatrix7 或 MetaCubeX 专项规则；v2fly 的窄范围列表覆盖 `isafepal.com` 与 `safepal.com`，没有 include 或 attribute 条目。
- PayPal：`https://raw.githubusercontent.com/Repcz/Tool/X/Surge/Rules/PayPal.list`。与 blackmatrix7 当前 PayPal 产物规范化后同为 248 条、差集为零，因此按长期作者优先偏好选择 Repcz；保留原生 `DOMAIN-SUFFIX`、`DOMAIN-KEYWORD` 与 `USER-AGENT` 语义。
- Netflix：`https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Surge/Netflix/Netflix.list`。保留其相较纯域名来源更有价值的 IPv4/IPv6 覆盖与 `no-resolve` 语义；第 4 次 Actions 生成 1,158 条原生 Surge 规则。
- YouTube：`https://raw.githubusercontent.com/Repcz/Tool/X/Surge/Rules/YouTube.list`。Repcz 的 14 条原生 Surge 规则覆盖核心 YouTube、video、image、API 和关联域名；紧凑的专项范围优先于没有确证价值的大型聚合列表。
- X：`https://raw.githubusercontent.com/Repcz/Tool/X/Surge/Rules/Twitter.list`。Repcz 的 34 条原生规则覆盖 X、Twitter、Grok、媒体域名和聚焦 IP 段；相比 v2fly 的当前有效域名输出覆盖更完整，无需格式转换。
- Instagram：`https://raw.githubusercontent.com/Repcz/Tool/X/Surge/Rules/Instagram.list`。保留 `instagram.com`、`cdninstagram.com`、`instagr.am` 三个核心 suffix；显式排除过宽的 `DOMAIN-KEYWORD,instagram`，不采用含大量第三方增长、营销、拼写变体与 SEO 域名的 v2fly 集合。
- Telegram：`https://raw.githubusercontent.com/SukkaW/Surge/master/Source/non_ip/telegram.conf`。SukkaW 的 14 条原生规则仅覆盖核心 Telegram 域名；Repcz 当前含 v1 不支持的 `IP-ASN` 以及第三方客户端、遥测范围，v2fly 的 TON 生态条目不作为保守默认输出。
- Threads：`https://raw.githubusercontent.com/v2fly/domain-list-community/master/data/threads`。Repcz 与 SukkaW 没有专项规则；v2fly 只有 `threads.com` 和 `threads.net`，无 attribute、无 include，可安全转换。
- TikTok：`https://raw.githubusercontent.com/Repcz/Tool/X/Surge/Rules/TikTok.list`。Repcz 的 83 条原生规则覆盖最完整且每日更新；2 条 `IP-ASN` 通过 `exclude: ["ip-asn:*"]` 类型级显式丢弃；blackmatrix7 陈旧且混入字节 AI IDE 域名，v2fly 条目全部带 `@!cn` 否定属性不可用。
- Spotify：`https://raw.githubusercontent.com/Repcz/Tool/X/Surge/Rules/Spotify.list`。21 条原生规则全部在 v1 白名单内，零转换风险；SukkaW 仅内嵌于 stream.ts（2025-11 后未更新），blackmatrix7 约 14 个月未更新，v2fly 会混入第三方 conductrics.com。
- AI：`https://raw.githubusercontent.com/Repcz/Tool/X/Surge/Rules/AI.list`。51 条聚合覆盖主流 AI 服务，为 SukkaW ai.conf 的派生（多 `file.oaiusercontent.com`）；1 条 `URL-REGEX` 通过 `exclude: ["url-regex:*"]` 类型级显式丢弃；DeepSeek 未纳入（国内直连默认，须日志确认缺口后才可进 supplement）。
- ZABank：无任何上游提供 ZABank 规则（2026-08-15 审计验证 Repcz/SukkaW/v2fly/blackmatrix7/MetaCubeX 全部缺失）。采用 supplement-only：`sources: []` + `sources/supplement/ZABank.list`（`za.group`、`zainvest.group`、`zajourney.com` 三条根域名），覆盖此前记录的 9 个候选域名。
- Steam：`https://raw.githubusercontent.com/Repcz/Tool/X/Surge/Rules/Steam.list`。Repcz 的 20 条核心 Steam 域名零转换风险、每日更新；SukkaW 无专项；v2fly 偏宽（地区性 CDN）；blackmatrix7 陈旧（2025-06）且混入盗版站 `steamunlocked.net`。2026-08-15 新增，替代用户主配置中的 blackmatrix7 Steam。
- APTV（原计划名 Live）：无上游，用户自用直播源（经 APTV 前端 App 观看）。2026-08-15 自用户私有仓库 `Bluetrae/Bridge` 迁入（garyshare 直播源 2026-02-22 版，26 条：17 DOMAIN + 4 DOMAIN-SUFFIX + 5 IP-CIDR,no-resolve），supplement-only（`sources: []`），文件头部与 manifest note 均已注明自用；不含订阅 URL 或 token。

## Finance supplement 候选与当前已知

### ZABank

2026-08-15 source audit 确认 Repcz、SukkaW、v2fly（全树 1536 个 data 文件）、blackmatrix7、MetaCubeX 均无 ZABank 规则，因此 ZABank 采用 supplement-only 方案：`sources: []`，全部规则来自 `sources/supplement/ZABank.list`。此前记录的 9 个候选域名全部落在三条根域名之下，已由三条根域名完整覆盖：

```text
za.group          → wbs、i18n、offlineapp、bankappgw、aim-abtesting-sdk
zainvest.group    → bank-stock、bank-sbsmarket
zajourney.com     → appmon-prd、integrate-appgw
```

supplement 内容为 `DOMAIN-SUFFIX,za.group`、`DOMAIN-SUFFIX,zainvest.group`、`DOMAIN-SUFFIX,zajourney.com`，共 3 条。

### SafePal

SafePal 已采用 v2fly primary source；`isafepal.com` 与 `safepal.com` 均由上游覆盖，因此不应写入 `sources/supplement/`。

## 已验证的生成结果

首次成功的 GitHub Actions 运行 #2 在 2026-08-15 生成并提交以下文件：

- `Surge/OKX.list`：9 条规则
- `Surge/WhatsApp.list`：11 条规则
- `Surge/LINE.list`：20 条规则
- `Surge/GitHub.list`：58 条规则

GitHub Actions 第 3 次手动运行在同日新增：

- `Surge/SafePal.list`：2 条规则（`isafepal.com`、`safepal.com`）

GitHub Actions 第 4 次手动运行在同日新增：

- `Surge/PayPal.list`：248 条规则
- `Surge/Netflix.list`：1,158 条规则

最近一次手动运行新增：

- `Surge/YouTube.list`：14 条规则
- `Surge/X.list`：34 条规则
- `Surge/Instagram.list`：3 条规则
- `Surge/Telegram.list`：14 条规则
- `Surge/Threads.list`：2 条规则

2026-08-15 本地全量生成新增：

- `Surge/TikTok.list`：81 条规则（2 条 IP-ASN 类型级排除）
- `Surge/Spotify.list`：21 条规则
- `Surge/AI.list`：50 条规则（1 条 URL-REGEX 类型级排除）
- `Surge/ZABank.list`：3 条规则（supplement-only）
- `Surge/Steam.list`：20 条规则（同日稍后新增）
- `Surge/APTV.list`：26 条规则（supplement-only，自用直播源，同日迁入）

生成文件仅可由 `python scripts/build.py --write` 或 GitHub Actions 更新，绝不手工编辑。各客户端主配置引用本仓库稳定 raw URL，并在引用处指定策略：Surge / Shadowrocket 用 `RULE-SET`，Loon 用 `[Remote Rule]`，Stash 用 `rule-providers` + `RULE-SET`，Egern 用 `rule_set.match`（最小引用示例见 README「快速开始」）。

## 构建闭环

```text
上游更新或手动触发
→ GitHub Actions（或本地 `build.py --write`）
→ 解析 v2fly / 展开经显式批准的 include，或解析经审计的原生 Surge Rule-Set
→ 解析/转换/合并 supplement
→ 去重/规范化 → canonical 规则（含 provenance）
→ Renderer 层（renderers.py）
→ Surge/*.list + Loon/*.list + Shadowrocket/*.list + Stash/*.list（四者逐字节相同）
→ Egern/*.yaml（PROCESS-NAME 显式丢弃并计入报告）
→ 仅当生成目录有变化时由 Actions bot 提交
→ 各客户端使用自己目录的稳定 raw URL（Surge URL 自 v1 起保持不变）
```

## 无人值守与人工介入时机

- **每日 00:01（北京时间）的 GitHub Actions 全自动、无人值守**：拉取上游 → 单测 → 全量重建 → 仅生成目录（`Surge/`、`Loon/`、`Shadowrocket/`、`Stash/`、`Egern/`）或门户数据有实质变化时由 bot 提交；无变化零提交。维护者无需每天登录。GitHub 定时任务不保证准点，实际执行可能延后。
- **构建失败 = 暂停更新，不是故障**：上游 404/超时/格式不合 v1 时，构建显式失败且不写任何文件，旧输出继续可用；无处理时限，下次维护时修复 manifest 或等待上游恢复即可。
- **需要人工介入的时机（全部事件驱动、无时限）**：
  1. Actions 出现红色失败（上游格式变化、404、超时）→ 查日志，修复 source/manifest 或等上游恢复。
  2. 新增 App → source audit → 写 `apps.yaml` → `build.py --app <App>` 定向预检 → 提交。
  3. Surge 日志出现漏网 → 确认归属 → 与上游比较 → 写 supplement → 重建。
- 建议维护者开启仓库 Actions 失败通知（Watch → Custom → 勾选 Actions），平时零打扰，出错才提醒。

## 漏网规则处理

```text
Surge 日志出现漏网
→ 日志确认归属
→ 与选定上游比较，确认缺失
→ sources/supplement/<App>.list
→ 重新构建
→ 以后永久保留
```
