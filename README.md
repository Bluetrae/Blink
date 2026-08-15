<div align="center">

# 🧭 Rulink

**Surge App Rule-Set · 自动构建 · 稳定分发**

[![Update Surge Rule-Sets](https://github.com/Bluetrae/Rulink/actions/workflows/update.yml/badge.svg?branch=main)](https://github.com/Bluetrae/Rulink/actions/workflows/update.yml)
[![Surge Rule-Sets](https://img.shields.io/badge/Surge-Rule--Sets-2f81f7?style=flat-square)](https://github.com/Bluetrae/Rulink/tree/main/Surge)
[![Updated](https://img.shields.io/github/last-commit/Bluetrae/Rulink/main?label=updated&style=flat-square)](https://github.com/Bluetrae/Rulink/commits/main)
[![Stars](https://img.shields.io/github/stars/Bluetrae/Rulink?label=stars&style=flat-square)](https://github.com/Bluetrae/Rulink/stargazers)

</div>

<br>

个人使用的 Surge **App Rule-Set** 仓库：把经过审计的上游 App 规则，保守转换为可长期引用的稳定规则集。

> [!NOTE]
> 这是 **App Rule-Set 仓库**，不是完整的 Surge 配置模板；策略组与 `FINAL` 由你的主配置负责。

> [!IMPORTANT]
> 本仓库仅供个人学习研究使用；使用前请阅读 [DISCLAIMER.md](DISCLAIMER.md) 与 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。**禁止任何形式的转载或发布至国内平台**。

## ✨ 特点

- **入口稳定** —— 主配置只引用本仓库 raw URL，上游变动无需改主配置。
- **范围优先** —— 准确性高于数量，宁少勿滥。
- **生成即产物** —— `Surge/*.list` 仅由构建器 / Actions 生成，绝不手工维护。
- **证据驱动** —— 新来源先过 source audit；补充规则须经 Surge 日志确认。

## 🚀 快速开始

在 Surge 主配置 `[Rule]` 段、`FINAL` 之前加一行：

```ini
RULE-SET,https://raw.githubusercontent.com/Bluetrae/Rulink/main/Surge/<App>.list,<你的策略>
```

> [!IMPORTANT]
> **规则顺序**：域名类规则集必须放在 IP 类规则（如 China IPv4）**之前**。Surge 自上而下匹配，只有 IP 类规则与 `FINAL` 才触发 DNS 解析；顺序颠倒会让待代理域名被提前解析，失去 DNS 防污染保护。

<sub>raw 直连不稳时，可改用 jsDelivr 加速地址（缓存最长 12 小时，规则更新会相应延迟）：`https://cdn.jsdelivr.net/gh/Bluetrae/Rulink@main/Surge/<App>.list`。</sub>

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

<details>
<summary>📋 点击展开全部 18 个 Rule-Sets 清单</summary>

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

</details>

<sub>输出不带策略名：`RULE-SET` 的最后一个字段始终由你的主配置决定。规则数量每天随上游变化，实时数字见各文件开头的 `# 规则统计` 头，本表不固化数字以免过时。</sub>

## ⚙️ 更新机制

`apps.yaml → build.py 解析 / 转换 / 去重 → 合并 supplement → Surge/*.list`，由 GitHub Actions（[`update.yml`](.github/workflows/update.yml)）每天北京时间约 **00:01**（定时任务不保证准点）先跑单测再全量构建，**只有 `Surge/` 变化**才由 `github-actions[bot]` 提交；上游 404、超时、未知规则类型、未声明 include 等一律**显式失败**，绝不静默改变语义。

<sub>每日运行全自动、无人值守：有实质变化才提交，无变化零提交；构建失败时保留旧输出并等待人工处理，不阻塞日常使用。新 App 与 supplement 永远由人工审计添加，CI 不会自动引入。</sub>

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
AGENTS.md                  # 长期项目规范与上游选择政策
HANDOFF.md                 # 项目交接状态档案
SOURCE_AUDITS.md           # source audit 档案与主配置对照
THIRD_PARTY_NOTICES.md     # 上游许可记录；DISCLAIMER.md 责任边界
sources/apps.yaml          # source manifest：来源、范围控制与选源理由
sources/supplement/        # 仅限日志确认的上游缺口，按需创建
scripts/build.py           # 保守、显式失败的构建器
tests/                     # 单元测试
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

## ⚖️ 使用与许可

感谢 Repcz、SukkaW、blackmatrix7、v2fly 等上游作者对规则集的长期维护（各 App 的来源明细与许可见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)）。

本仓库为个人规则分发与学习维护而设，无任何担保；请结合自己的 Surge 策略与日志自行验证，并遵守适用法律、服务条款与上游许可。根目录**不设统一许可证**：构建代码与文档是原创内容，`Surge/*.list` 是多上游生成的产物，不得被统一标记为 MIT 等单一许可证 —— 详情见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
