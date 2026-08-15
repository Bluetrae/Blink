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
- `sources/apps.yaml` 已定义十二个 App：OKX、WhatsApp、LINE、GitHub、SafePal、Threads 使用 v2fly primary source；PayPal、YouTube、X、Instagram 使用 Repcz 原生 Surge primary source；Telegram 使用 SukkaW 原生 Surge primary source；Netflix 使用 blackmatrix7 原生 Surge primary source；均保留显式 parser policy
- `requirements.txt` 将唯一第三方依赖锁定为 `PyYAML==6.0.3`
- `scripts/build.py` 已完成 v1；默认只做检查，只有显式传入 `--write` 才会写入 `Surge/*.list`。它支持 `v2fly-domain-list` 与严格白名单的 `surge-rule-set` 输入格式
- `tests/test_build.py` 已覆盖 v2fly 核心映射、include allow/deny、attribute 语义、严格原生 Surge 解析、错误策略及实际 manifest 校验
- `.github/workflows/update.yml` 已启用；支持手动运行和每日北京时间约 02:17 的定时运行
- GitHub Actions 首次完整成功运行是 #2，生成 commit 为 `5b1ff58 chore: update generated Surge rule-sets`
- GitHub Actions 第 3 次手动运行成功，生成 commit 为 `498ca27 chore: update generated Surge rule-sets`
- GitHub Actions 第 4 次手动运行成功，生成 commit 为 `d69291a chore: update generated Surge rule-sets`
- 最近一次手动运行成功，生成 commit 为 `4f2535c chore: update generated Surge rule-sets`
- 已生成 `Surge/OKX.list`、`Surge/WhatsApp.list`、`Surge/LINE.list`、`Surge/GitHub.list`、`Surge/SafePal.list`、`Surge/PayPal.list`、`Surge/Netflix.list`、`Surge/YouTube.list`、`Surge/X.list`、`Surge/Instagram.list`、`Surge/Telegram.list`、`Surge/Threads.list`
- 目前没有任何 `sources/supplement/<App>.list` 文件；这是预期状态

## 项目目标

建立一个自动聚合、转换、去重、合并 supplement 补充规则并发布 Surge Rule-Set 的个人仓库，让 Surge 只引用稳定的自己仓库 URL，上游变动时只改仓库 source 定义而不用改 Surge 主配置。

`supplement` 只存放上游规则未覆盖、且通过 Surge 日志或实际使用确认需要补充的规则。不得重复放入上游已存在的规则；每次补充前须先与选定上游比较。`Surge/*.list` 为 generated files，不允许手工修改。补充文件按需创建，没有补充规则的 App 不需要空文件。

## Upstream Source Selection Policy

### 长期信任优先偏好

Repcz > SukkaW > 其他长期验证过的成熟作者 > v2fly / MetaCubeX

该排序是优先偏好，不是绝对规则。每个 App 的最终 primary source 必须综合评估：freshness（更新活跃度）、completeness（覆盖完整度）、scope（是否精准属于该 App）、format suitability（是否适合 Surge 或能稳定转换）、maintenance quality（维护质量）。

Repcz 与 SukkaW 是一梯队可信上游：每个 App audit 先审 Repcz 的专项规则，再审 SukkaW 的专项或可直接适用的窄范围规则；不能把 SukkaW 在执行中降为普通 fallback。SukkaW 的通用基础设施规则与配置方法继续直接引用，不复制进本仓库，也不误归类为 App 专项规则。

- 如果 Repcz 或 SukkaW 有对应且维护良好的专项规则，优先使用。
- 如果 Repcz 或 SukkaW 没有对应规则，或规则明显长期未更新、覆盖不足，可以选择 v2fly / MetaCubeX 等更活跃的数据源。
- 不允许仅因作者偏好而继续使用明显过时或不完整的规则。
- 每个 App 默认 1 个 primary source，最多 1 个 supplemental source。
- `sources/supplement/<App>.list` 仅用于上游仍缺失、且通过 Surge 日志或实际使用确认的补充规则。
- 不追求“合并越多越好”，避免不同规则源叠加后吞入无关共享 CDN 域名。
- 后续 `apps.yaml` 应为每个 App 保留 `note` 或 `reason` 字段，记录主源选择理由，避免以后遗失决策依据。

### Source audit 前置要求

新增 App 或更换既有 App 的 primary source 前，必须先完成一轮 source audit。至少覆盖：YouTube、X、Instagram、Threads、Telegram、AI、TikTok、Spotify、Netflix、Live、OKX、PayPal、SafePal、ZABank、WhatsApp、LINE、GitHub。

每个 App 的 audit 应记录：

- 候选来源
- 作者
- URL
- 最近维护情况
- 规则规模或覆盖特点
- 是否 Surge 原生
- 是否需要转换
- 是否存在明显过宽规则
- 推荐 primary
- 是否需要 supplemental
- 选择理由

## 第一批验证样本

- OKX
- WhatsApp
- LINE
- GitHub

这四个 App 只是 source → build → supplement → Surge output 整个 pipeline 的验证样本，不代表它们优先于其他 App，也不代表仓库只面向它们；仓库设计上应支持当前计划中的全部 App。

## 后续计划纳入

- AI
- TikTok
- Spotify
- Live
- ZABank

## 已确定的规则源结论

四个初始验证样本及 SafePal、Threads 当前均只使用 1 个 v2fly primary source；PayPal、YouTube、X、Instagram 使用 Repcz 原生 Surge primary source；Telegram 使用 SukkaW 原生 Surge primary source；Netflix 使用 blackmatrix7 原生 Surge primary source。所有 App 均不配置 supplemental source，也不创建 supplement 文件；`build.py` 会根据 `format` 解析真实语义，而非按行粗暴转换。

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

属性语义固定为：输出所有无 attribute 条目，加上至少具有一个 `attributes.include` 中属性的条目。当前 manifest 的 `attributes.include` 均为 `[]`；该属性选择仅适用于 v2fly 条目，v1 遇到 `@!name` 否定属性会失败，不会静默误解析。

## Finance supplement 候选与当前已知

### ZABank

以下域名为待核对候选，尚未与选定上游比较，不应直接写入 `sources/supplement/`：

```text
wbs.za.group
i18n.za.group
offlineapp.za.group
bankappgw.za.group
bank-stock.zainvest.group
aim-abtesting-sdk.za.group
appmon-prd.zajourney.com
bank-sbsmarket.zainvest.group
integrate-appgw.zajourney.com
```

### SafePal

SafePal 已采用 v2fly primary source；`isafepal.com` 与 `safepal.com` 均由上游覆盖，因此不应写入 `sources/supplement/`。

## 当前仓库结构

```text
README.md
AGENTS.md
CODEX_HANDOFF.md
sources/apps.yaml
sources/supplement/
scripts/build.py
Surge/
.github/workflows/update.yml
```

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

生成文件仅可由 `python scripts/build.py --write` 或 GitHub Actions 更新，绝不手工编辑。Surge 主配置应引用本仓库稳定 raw URL，并通过 `RULE-SET` 自行指定策略。

## 构建闭环

```text
上游更新或手动触发
→ GitHub Actions（或本地 `build.py --write`）
→ 解析 v2fly / 展开经显式批准的 include，或解析经审计的原生 Surge Rule-Set
→ 解析/转换/合并 supplement
→ 去重/规范化
→ Surge/*.list
→ 仅当 `Surge/` 有变化时由 Actions bot 提交
→ Surge 使用自己仓库的稳定 raw URL
```

## 漏网规则处理

```text
Surge 日志出现漏网
→ 日志确认归属
→ 与选定上游比较，确认缺失
→ sources/supplement/<App>.list
→ 重新构建
→ 以后永久保留
```
