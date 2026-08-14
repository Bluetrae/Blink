# WProxyRules 项目交接状态

## 项目名称

WProxyRules

## GitHub

https://github.com/Bluetrae/WProxyRules

## 本地路径

`C:\Users\Jennie\Projects\WProxyRules`

## 当前状态

- `main` 跟踪 `origin/main`
- working tree clean
- `safe.directory` 已配置完成
- 当前仓库只有 `README.md`
- 尚未编写 `build.py`
- 尚未创建 GitHub Actions
- 尚未生成任何 Surge 规则

## 项目目标

建立一个自动聚合、转换、去重、合并 supplement 补充规则并发布 Surge Rule-Set 的个人仓库，让 Surge 只引用稳定的自己仓库 URL，上游变动时只改仓库 source 定义而不用改 Surge 主配置。

`supplement` 只存放上游规则未覆盖、且通过 Surge 日志或实际使用确认需要补充的规则。不得重复放入上游已存在的规则；每次补充前须先与选定上游比较。`Surge/*.list` 为 generated files，不允许手工修改。补充文件按需创建，没有补充规则的 App 不需要空文件。

## Upstream Source Selection Policy

### 长期信任优先偏好

Repcz > SukkaW > 其他长期验证过的成熟作者 > v2fly / MetaCubeX

该排序是优先偏好，不是绝对规则。每个 App 的最终 primary source 必须综合评估：freshness（更新活跃度）、completeness（覆盖完整度）、scope（是否精准属于该 App）、format suitability（是否适合 Surge 或能稳定转换）、maintenance quality（维护质量）。

- 如果 Repcz 或 SukkaW 有对应且维护良好的专项规则，优先使用。
- 如果 Repcz 或 SukkaW 没有对应规则，或规则明显长期未更新、覆盖不足，可以选择 v2fly / MetaCubeX 等更活跃的数据源。
- 不允许仅因作者偏好而继续使用明显过时或不完整的规则。
- 每个 App 默认 1 个 primary source，最多 1 个 supplemental source。
- `sources/supplement/<App>.list` 仅用于上游仍缺失、且通过 Surge 日志或实际使用确认的补充规则。
- 不追求“合并越多越好”，避免不同规则源叠加后吞入无关共享 CDN 域名。
- 后续 `apps.yaml` 应为每个 App 保留 `note` 或 `reason` 字段，记录主源选择理由，避免以后遗失决策依据。

### Source audit 前置要求

在真正创建 `apps.yaml` 前，必须先完成一轮 source audit。至少覆盖：YouTube、X、Instagram、Threads、Telegram、AI、TikTok、Spotify、Netflix、Live、OKX、PayPal、SafePal、ZABank、WhatsApp、LINE、GitHub。

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

## 第一批计划纳入

- OKX
- WhatsApp
- LINE
- GitHub

这四个 App 只是 source → build → supplement → Surge output 整个 pipeline 的验证样本，不代表它们优先于其他 App，也不代表仓库只面向它们；仓库设计上应支持当前计划中的全部 App。

## 后续计划纳入

- YouTube
- X
- Instagram
- Threads
- Telegram
- AI
- TikTok
- Spotify
- Netflix
- Live
- PayPal
- SafePal
- ZABank

## 已确定的规则源结论

- OKX：旧 blackmatrix7 规则过少，优先采用活跃 geosite/domain-list 类来源 + custom。
- WhatsApp：v2fly/MetaCubeX 现有域名覆盖比旧 blackmatrix7 更完整。
- LINE：v2fly 当前规则明显更完整，避免因为 LINE 引入整个 `naver.jp` 这类过宽域名。
- GitHub：应优先采用活跃维护源，避免冻结旧 blackmatrix7 列表。
- PayPal：blackmatrix7 当前仍可作为合理上游。
- Netflix：blackmatrix7 现有列表的 IP 覆盖仍有价值，不要盲目替换成纯域名源。

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

```text
isafepal.com
```

## 仓库未来目标结构

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

## 构建闭环

```text
上游更新
→ GitHub Actions
→ build.py
→ 解析/转换/合并 supplement
→ 去重/规范化
→ Surge/*.list
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
