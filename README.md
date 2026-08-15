<div align="center">

# 🧭 Rulink

**Surge App Rule-Set · 自动构建 · 稳定分发**

[![Update Surge Rule-Sets](https://github.com/Bluetrae/Rulink/actions/workflows/update.yml/badge.svg?branch=main)](https://github.com/Bluetrae/Rulink/actions/workflows/update.yml)
[![Surge Rule-Sets](https://img.shields.io/badge/Surge-Rule--Sets-2f81f7?style=flat-square)](https://github.com/Bluetrae/Rulink/tree/main/Surge)
[![Updated](https://img.shields.io/github/last-commit/Bluetrae/Rulink/main?label=updated&style=flat-square)](https://github.com/Bluetrae/Rulink/commits/main)
[![Stars](https://img.shields.io/github/stars/Bluetrae/Rulink?label=stars&style=flat-square)](https://github.com/Bluetrae/Rulink/stargazers)

</div>

<br>

个人使用的 Surge **App Rule-Set** 仓库：**审计上游 → 保守转换 → 稳定 raw URL 发布**。Surge 主配置只需引用本仓库 URL；上游变动时只更新本仓库，不必反复改主配置。

> [!NOTE]
> 这是 **App Rule-Set 仓库**，不是完整的 Surge 配置模板。策略组、DNS、国内分流、CDN、LAN 与 `FINAL` 仍由主配置和成熟上游负责。

## ✨ 特点

- **入口稳定** —— 只引用 `Bluetrae/Rulink` 的 raw URL，不依赖上游文件路径。
- **范围优先** —— 准确性高于数量，不吞入共享 CDN 与无关基础设施。
- **生成即产物** —— `Surge/*.list` 仅由构建器 / Actions 生成，绝不手工维护。
- **证据驱动** —— 新来源先过 source audit；补充规则须经 Surge 日志确认。

## 🚀 快速开始

在 Surge 主配置 `[Rule]` 段、`FINAL` 之前加一行：

```ini
RULE-SET,https://raw.githubusercontent.com/Bluetrae/Rulink/main/Surge/<App>.list,<你的策略>
```

<details>
<summary>📋 点击展开全部 18 个 App 的引用示例</summary>

```ini
# 💳 Finance
RULE-SET,https://raw.githubusercontent.com/Bluetrae/Rulink/main/Surge/OKX.list,Finance
RULE-SET,https://raw.githubusercontent.com/Bluetrae/Rulink/main/Surge/PayPal.list,Finance
RULE-SET,https://raw.githubusercontent.com/Bluetrae/Rulink/main/Surge/SafePal.list,Finance
RULE-SET,https://raw.githubusercontent.com/Bluetrae/Rulink/main/Surge/ZABank.list,Finance

# 💬 Communication
RULE-SET,https://raw.githubusercontent.com/Bluetrae/Rulink/main/Surge/WhatsApp.list,Proxy
RULE-SET,https://raw.githubusercontent.com/Bluetrae/Rulink/main/Surge/LINE.list,Proxy
RULE-SET,https://raw.githubusercontent.com/Bluetrae/Rulink/main/Surge/Telegram.list,Proxy

# 💻 Development
RULE-SET,https://raw.githubusercontent.com/Bluetrae/Rulink/main/Surge/GitHub.list,GitHub

# 🧠 AI
RULE-SET,https://raw.githubusercontent.com/Bluetrae/Rulink/main/Surge/AI.list,<你的 AI 策略>

# 🎮 Game
RULE-SET,https://raw.githubusercontent.com/Bluetrae/Rulink/main/Surge/Steam.list,<你的游戏策略>

# 🌐 Social
RULE-SET,https://raw.githubusercontent.com/Bluetrae/Rulink/main/Surge/X.list,<你的社交策略>
RULE-SET,https://raw.githubusercontent.com/Bluetrae/Rulink/main/Surge/Instagram.list,<你的社交策略>
RULE-SET,https://raw.githubusercontent.com/Bluetrae/Rulink/main/Surge/Threads.list,<你的社交策略>
RULE-SET,https://raw.githubusercontent.com/Bluetrae/Rulink/main/Surge/TikTok.list,<你的社交策略>

# 🎬 Media
RULE-SET,https://raw.githubusercontent.com/Bluetrae/Rulink/main/Surge/YouTube.list,<你的媒体策略>
RULE-SET,https://raw.githubusercontent.com/Bluetrae/Rulink/main/Surge/Netflix.list,<你的媒体策略>
RULE-SET,https://raw.githubusercontent.com/Bluetrae/Rulink/main/Surge/Spotify.list,<你的媒体策略>

# 📺 APTV（自用）
RULE-SET,https://raw.githubusercontent.com/Bluetrae/Rulink/main/Surge/APTV.list,<你的直播策略>
```

</details>

> [!TIP]
> 若主配置已直接引用 blackmatrix7、Repcz、v2fly 的同类列表，请**替换**为本仓库 URL，而非叠加两份。OKX 输出已覆盖此前手工维护的 `okx.ac`、`okx.cab`、`okx.com.cdn.cloudflare.net`、`xlayer.tech`；ZA Bank 的 9 条手工域名亦可删除。

## 📦 Rule-Sets 清单

| 分类 | App | 文件 | 规则类型 |
| --- | --- | --- | --- |
| 💳 Finance | [OKX](https://raw.githubusercontent.com/Bluetrae/Rulink/main/Surge/OKX.list) | `Surge/OKX.list` | 域名 |
| 💳 Finance | [PayPal](https://raw.githubusercontent.com/Bluetrae/Rulink/main/Surge/PayPal.list) | `Surge/PayPal.list` | 域名、User-Agent |
| 💳 Finance | [SafePal](https://raw.githubusercontent.com/Bluetrae/Rulink/main/Surge/SafePal.list) | `Surge/SafePal.list` | 域名 |
| 💳 Finance | [ZABank](https://raw.githubusercontent.com/Bluetrae/Rulink/main/Surge/ZABank.list) | `Surge/ZABank.list` | 域名 |
| 💬 Communication | [WhatsApp](https://raw.githubusercontent.com/Bluetrae/Rulink/main/Surge/WhatsApp.list) | `Surge/WhatsApp.list` | 域名 |
| 💬 Communication | [LINE](https://raw.githubusercontent.com/Bluetrae/Rulink/main/Surge/LINE.list) | `Surge/LINE.list` | 域名 |
| 💬 Communication | [Telegram](https://raw.githubusercontent.com/Bluetrae/Rulink/main/Surge/Telegram.list) | `Surge/Telegram.list` | 域名 |
| 💻 Development | [GitHub](https://raw.githubusercontent.com/Bluetrae/Rulink/main/Surge/GitHub.list) | `Surge/GitHub.list` | 域名 |
| 🧠 AI | [AI](https://raw.githubusercontent.com/Bluetrae/Rulink/main/Surge/AI.list) | `Surge/AI.list` | 域名 |
| 🎮 Game | [Steam](https://raw.githubusercontent.com/Bluetrae/Rulink/main/Surge/Steam.list) | `Surge/Steam.list` | 域名 |
| 🌐 Social | [X](https://raw.githubusercontent.com/Bluetrae/Rulink/main/Surge/X.list) | `Surge/X.list` | 域名、IP |
| 🌐 Social | [Instagram](https://raw.githubusercontent.com/Bluetrae/Rulink/main/Surge/Instagram.list) | `Surge/Instagram.list` | 域名 |
| 🌐 Social | [Threads](https://raw.githubusercontent.com/Bluetrae/Rulink/main/Surge/Threads.list) | `Surge/Threads.list` | 域名 |
| 🌐 Social | [TikTok](https://raw.githubusercontent.com/Bluetrae/Rulink/main/Surge/TikTok.list) | `Surge/TikTok.list` | 域名、IP |
| 🎬 Media | [YouTube](https://raw.githubusercontent.com/Bluetrae/Rulink/main/Surge/YouTube.list) | `Surge/YouTube.list` | 域名 |
| 🎬 Media | [Spotify](https://raw.githubusercontent.com/Bluetrae/Rulink/main/Surge/Spotify.list) | `Surge/Spotify.list` | 域名、IP、User-Agent、Process |
| 🎬 Media | [Netflix](https://raw.githubusercontent.com/Bluetrae/Rulink/main/Surge/Netflix.list) | `Surge/Netflix.list` | 域名、IP、User-Agent、Process |
| 📺 APTV | [APTV](https://raw.githubusercontent.com/Bluetrae/Rulink/main/Surge/APTV.list) | `Surge/APTV.list` | 域名、IP（自用） |

<sub>输出不带策略名：`RULE-SET` 的最后一个字段始终由你的主配置决定。规则数量每天随上游变化，实时数字见各文件开头的 `# 规则统计` 头，本表不固化数字以免过时。</sub>

## ⚙️ 更新机制

`审计后的 apps.yaml → build.py 解析 / 转换 / 去重 → 合并 supplement → Surge/*.list → 主配置引用 raw URL`

GitHub Actions（[`update.yml`](.github/workflows/update.yml)）每天北京时间约 **02:17** 先跑单测、再全量构建，**只有 `Surge/` 发生变化**时才会由 `github-actions[bot]` 提交；遇到上游 404、超时、HTML 响应、未知规则类型、未声明 include、include 循环或空输出等，构建**显式失败**，绝不静默改变语义。

## 🧩 来源政策

- 优先偏好 **Repcz → SukkaW → 其他长期验证的成熟作者 → v2fly / MetaCubeX**，但每个 App 的最终主源以 freshness、completeness、scope、format suitability、maintenance quality 的证据为准；每 App 恰好 1 个 primary、至多 1 个 supplemental。
- 输入格式：

| 格式 | 构建行为 |
| --- | --- |
| `v2fly-domain-list` | `domain`/`full`/`keyword` → `DOMAIN-SUFFIX`/`DOMAIN`/`DOMAIN-KEYWORD`；regexp、否定属性、未声明 include 直接失败 |
| `surge-rule-set` | 严格白名单：`DOMAIN`、`DOMAIN-SUFFIX`、`DOMAIN-KEYWORD`、`USER-AGENT`、`PROCESS-NAME`、`IP-CIDR`、`IP-CIDR6`（IP 仅允许 `no-resolve`）；支持类型级 exclude（`ip-asn:*`、`url-regex:*`）与 supplement-only App（`sources: []`） |

- Reject / Domestic / China IP / CDN / LAN 等基础设施**不复制进本仓库**，继续直接引用成熟上游。

## 🗂️ 仓库结构

```text
sources/apps.yaml          # source manifest：来源、范围控制与选源理由
sources/supplement/        # 仅限日志确认的上游缺口，按需创建
SOURCE_AUDITS.md           # 完整 source audit 档案与主配置对照
scripts/build.py           # 保守、显式失败的构建器
Surge/                     # Generated files：仅由构建器 / Actions 写入
.github/workflows/update.yml
```

## 🔎 本地验证

```powershell
# 首次：创建被 Git 忽略的本地环境
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt

# 新增 / 修改单个 App：只读预检（推荐）
.\.venv\Scripts\python.exe scripts\build.py --app PayPal

# 单元测试
.\.venv\Scripts\python.exe -m unittest discover -s tests -v

# 需要本地生成输出时才用（CI 每天自动执行）
.\.venv\Scripts\python.exe scripts\build.py --write
```

<sub>`.venv/` 已被 Git 忽略，绝不提交。提交前请检查生成差异；不要手工修改 `Surge/*.list`，也不要提交订阅 URL、token、密码、证书或其他敏感信息。</sub>

## 📚 文档索引

- [AGENTS.md](AGENTS.md) —— 长期项目规范与上游选择政策
- [SOURCE_AUDITS.md](SOURCE_AUDITS.md) —— 每个 App 的候选、证据与选源结论
- [HANDOFF.md](HANDOFF.md) —— 项目交接状态档案
- [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) / [DISCLAIMER.md](DISCLAIMER.md) —— 上游许可与责任边界

## ⚖️ 使用与许可

本仓库为个人规则分发与学习维护而设，无任何担保；请结合自己的 Surge 策略与日志自行验证，并遵守适用法律、服务条款与上游许可。根目录**不设统一许可证**：构建代码与文档是原创内容，`Surge/*.list` 是多上游生成的产物，不得被统一标记为 MIT 等单一许可证 —— 详情见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
