# 🧭 WProxyRules

> 个人使用的 Surge App Rule-Set 自动构建与分发仓库。

WProxyRules 把经过审计的上游 App 规则保守地转换为 Surge Rule-Set，并通过本仓库稳定的 raw URL 发布。Surge 主配置只需引用这些 URL；当上游发生变动时，维护 source manifest 和构建器即可，不必反复修改主配置。

> [!NOTE]
> 这是 **App Rule-Set 仓库**，不是完整的 Surge 配置模板。策略组、DNS、国内分流、CDN、LAN 与 `FINAL` 应继续由主配置和成熟上游负责。

---

## ✨ 使用原则

- **入口稳定**：Surge 只引用 `Bluetrae/WProxyRules` 的 raw URL，不直接依赖各个上游的文件路径。
- **范围优先**：规则准确性比规则数量更重要；不会为“覆盖更多”而混入共享 CDN 或无关基础设施。
- **生成即产物**：`Surge/*.list` 只能由构建器或 GitHub Actions 生成，绝不手工维护。
- **证据驱动**：新增来源必须先做 source audit；补充规则必须由 Surge 日志或实际使用证明为上游缺口。

---

## 🚀 在 Surge 中引用

在 Surge 主配置的 `[Rule]` 段、`FINAL` 之前加入：

```ini
RULE-SET,<URL>,<策略>
```

例如，下列配置与当前个人策略分组一致：

```ini
# 💳 Finance
RULE-SET,https://raw.githubusercontent.com/Bluetrae/WProxyRules/main/Surge/OKX.list,Finance
RULE-SET,https://raw.githubusercontent.com/Bluetrae/WProxyRules/main/Surge/PayPal.list,Finance

# 💬 Communication
RULE-SET,https://raw.githubusercontent.com/Bluetrae/WProxyRules/main/Surge/WhatsApp.list,Proxy
RULE-SET,https://raw.githubusercontent.com/Bluetrae/WProxyRules/main/Surge/LINE.list,Proxy

# 💻 Development
RULE-SET,https://raw.githubusercontent.com/Bluetrae/WProxyRules/main/Surge/GitHub.list,GitHub

# 🧩 Choose policies in your own configuration
RULE-SET,https://raw.githubusercontent.com/Bluetrae/WProxyRules/main/Surge/SafePal.list,<你的金融策略>
RULE-SET,https://raw.githubusercontent.com/Bluetrae/WProxyRules/main/Surge/Netflix.list,<你的媒体策略>
```

> [!TIP]
> 如果主配置已直接引用 blackmatrix7 的 WhatsApp、LINE、GitHub 或 PayPal，请用本仓库对应 URL **替换**原 Rule-Set，而非叠加两份同类规则。OKX 输出已覆盖此前手工维护的 `okx.ac`、`okx.cab`、`okx.com.cdn.cloudflare.net` 与 `xlayer.tech`。

---

## 📦 当前 Rule-Sets

| 分类 | App | Surge Rule-Set | 规则类型概览 |
| --- | --- | --- | --- |
| 💳 Finance | [OKX](https://raw.githubusercontent.com/Bluetrae/WProxyRules/main/Surge/OKX.list) | `Surge/OKX.list` | 域名 |
| 💳 Finance | [PayPal](https://raw.githubusercontent.com/Bluetrae/WProxyRules/main/Surge/PayPal.list) | `Surge/PayPal.list` | 域名、User-Agent |
| 💳 Finance | [SafePal](https://raw.githubusercontent.com/Bluetrae/WProxyRules/main/Surge/SafePal.list) | `Surge/SafePal.list` | 域名 |
| 💬 Communication | [WhatsApp](https://raw.githubusercontent.com/Bluetrae/WProxyRules/main/Surge/WhatsApp.list) | `Surge/WhatsApp.list` | 域名 |
| 💬 Communication | [LINE](https://raw.githubusercontent.com/Bluetrae/WProxyRules/main/Surge/LINE.list) | `Surge/LINE.list` | 域名 |
| 💻 Development | [GitHub](https://raw.githubusercontent.com/Bluetrae/WProxyRules/main/Surge/GitHub.list) | `Surge/GitHub.list` | 域名 |
| 🎬 Media | [Netflix](https://raw.githubusercontent.com/Bluetrae/WProxyRules/main/Surge/Netflix.list) | `Surge/Netflix.list` | 域名、IP、User-Agent、Process |

所有输出文件均不携带策略名；`RULE-SET` 的最后一个字段始终由你的 Surge 主配置决定。

---

## ⚙️ 自动构建与更新

GitHub Actions 工作流位于 [`.github/workflows/update.yml`](.github/workflows/update.yml)。它可以手动运行，也会在每日北京时间约 02:17 检查上游；只有生成结果实际变化时，才会由 `github-actions[bot]` 提交 `Surge/` 输出。

```text
审计后的 sources/apps.yaml
          ↓
build.py 解析 / 转换 / 规范化 / 去重
          ↓
合并已验证的 sources/supplement（如存在）
          ↓
生成 Surge/*.list
          ↓
Surge 使用本仓库的稳定 raw URL
```

构建会明确失败，而不是静默改变规则语义：上游 404、超时、HTML 响应、未知规则类型、未声明 include、include 循环、无法安全转换的规则、无效 supplement，以及空输出都会中止构建。

---

## 🧩 来源与规则边界

### 上游选择

长期优先偏好为 **Repcz → SukkaW → 其他长期验证的成熟维护者 → v2fly / MetaCubeX**，但这不是机械排序。每个 App 都以更新活跃度、覆盖完整度、规则范围、Surge 格式适配性和维护质量为准；作者偏好不能成为继续使用过时或不完整来源的理由。

每个 App 默认只有一个 primary source，最多一个 supplemental source。`sources/supplement/<App>.list` 是可选层，只能存放上游未覆盖、且经实际使用确认的规则；没有真实缺口就不创建文件。

### 不属于本仓库的内容

Reject、Domestic、China IP、CDN、LAN 等基础设施规则不在这里复制或重新维护，继续直接引用成熟上游。这样可以让本仓库专注于 App 归属，而不会把公共网络基础设施错误纳入某个 App 的策略。

### 输入格式

| Format | 构建行为 |
| --- | --- |
| `v2fly-domain-list` | 解析普通 domain、`full:`、`keyword:` 与 manifest 明确允许的 `include`。regexp、未声明 include、否定 attribute 会直接失败。 |
| `surge-rule-set` | 只接受无策略名的 `DOMAIN`、`DOMAIN-SUFFIX`、`DOMAIN-KEYWORD`、`USER-AGENT`、`PROCESS-NAME`、`IP-CIDR`、`IP-CIDR6`；IP 仅允许额外携带 `no-resolve`。 |

支持一种输入格式，不代表自动接纳任何来源。新增或替换 source 前，必须先完成 source audit 并审查 manifest 改动。

---

## 🗂️ 仓库结构

```text
sources/apps.yaml          # 长期 source manifest：来源、范围控制与选源理由
sources/supplement/        # 仅限已证实的上游缺口；按需创建
scripts/build.py           # 保守、显式失败的构建器
Surge/                     # Generated files：仅由构建器或 Actions 写入
.github/workflows/update.yml
```

更多项目规范、source audit 结论和交接状态见 [AGENTS.md](AGENTS.md) 与 [CODEX_HANDOFF.md](CODEX_HANDOFF.md)。

---

## 🔎 本地验证

```powershell
# First time only: create a local environment ignored by Git
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt

# 新增或修改单个 App 时：快速、只读预检
.\.venv\Scripts\python.exe scripts\build.py --app PayPal

# 需要时进行完整健康检查
.\.venv\Scripts\python.exe scripts\build.py
.\.venv\Scripts\python.exe -m unittest discover -s tests -v
```

`build.py` 默认只进行预检，不写文件。只有在明确需要本地生成输出时才使用：

```powershell
.\.venv\Scripts\python.exe scripts\build.py --write
```

`.venv/` 已被 Git 忽略，绝不提交。提交前请检查生成差异；不要手工修改 `Surge/*.list`，也不要提交订阅 URL、token、密码、证书或其他敏感信息。

---

## 🛡️ 使用说明

本仓库为个人规则分发与学习维护而设。网络环境、地区可用性与上游内容都可能变化；请结合自己的 Surge 策略和日志自行验证，并遵守适用的法律、服务条款与上游许可。
