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

建立一个自动聚合、转换、去重、合并 custom 补丁并发布 Surge Rule-Set 的个人仓库，让 Surge 只引用稳定的自己仓库 URL，上游变动时只改仓库 source 定义而不用改 Surge 主配置。

## 第一批计划纳入

- OKX
- WhatsApp
- LINE
- GitHub

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

## Finance custom 当前已知

### ZABank

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
sources/custom/
scripts/build.py
Surge/
.github/workflows/update.yml
```

## 构建闭环

```text
上游更新
→ GitHub Actions
→ build.py
→ 解析/转换/合并 custom
→ 去重/规范化
→ Surge/*.list
→ Surge 使用自己仓库的稳定 raw URL
```

## 漏网规则处理

```text
Surge 日志出现漏网
→ 日志确认归属
→ sources/custom/<App>.list
→ 重新构建
→ 以后永久保留
```
