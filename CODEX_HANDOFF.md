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

## 第一批计划纳入

- OKX
- WhatsApp
- LINE
- GitHub

这四个 App 只是 build pipeline 的验证样本，不代表仓库只面向它们；仓库设计上应支持当前计划中的全部 App。

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
