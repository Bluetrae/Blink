# WProxyRules

个人使用的 Surge App Rule-Set 自动分发仓库。

WProxyRules 将经过审计的上游规则保守地转换为 Surge 可用的 Rule-Set，并通过本仓库稳定的 raw URL 发布。Surge 主配置只需引用这些 URL；以后上游发生变化时，只调整 source manifest 与构建逻辑，无需逐条修改主配置。

> 这是一个 **Surge App Rule-Set 仓库**，不是完整 Surge 配置模板。策略组、DNS、国内分流、CDN、LAN 与 FINAL 规则继续由你的主配置和成熟上游负责。

## 当前可用 Rule-Sets

| App | Rule-Set URL | 规则类型概览 |
| --- | --- | --- |
| OKX | `https://raw.githubusercontent.com/Bluetrae/WProxyRules/main/Surge/OKX.list` | 域名 |
| PayPal | `https://raw.githubusercontent.com/Bluetrae/WProxyRules/main/Surge/PayPal.list` | 域名、User-Agent |
| SafePal | `https://raw.githubusercontent.com/Bluetrae/WProxyRules/main/Surge/SafePal.list` | 域名 |
| WhatsApp | `https://raw.githubusercontent.com/Bluetrae/WProxyRules/main/Surge/WhatsApp.list` | 域名 |
| LINE | `https://raw.githubusercontent.com/Bluetrae/WProxyRules/main/Surge/LINE.list` | 域名 |
| GitHub | `https://raw.githubusercontent.com/Bluetrae/WProxyRules/main/Surge/GitHub.list` | 域名 |
| Netflix | `https://raw.githubusercontent.com/Bluetrae/WProxyRules/main/Surge/Netflix.list` | 域名、IP、User-Agent、Process |

所有输出均不携带策略名；策略始终由你的 Surge 主配置决定。

## 在 Surge 中使用

将 Rule-Set 放在 `[Rule]` 段中、`FINAL` 之前，并按你自己的策略组命名。格式固定为：

```ini
RULE-SET,<URL>,<策略>
```

下面是与当前个人配置相符的示例：

```ini
# Finance
RULE-SET,https://raw.githubusercontent.com/Bluetrae/WProxyRules/main/Surge/OKX.list,Finance
RULE-SET,https://raw.githubusercontent.com/Bluetrae/WProxyRules/main/Surge/PayPal.list,Finance

# Communication
RULE-SET,https://raw.githubusercontent.com/Bluetrae/WProxyRules/main/Surge/WhatsApp.list,Proxy
RULE-SET,https://raw.githubusercontent.com/Bluetrae/WProxyRules/main/Surge/LINE.list,Proxy

# Development
RULE-SET,https://raw.githubusercontent.com/Bluetrae/WProxyRules/main/Surge/GitHub.list,GitHub

# Choose your own policies for these two sets
RULE-SET,https://raw.githubusercontent.com/Bluetrae/WProxyRules/main/Surge/SafePal.list,<你的金融策略>
RULE-SET,https://raw.githubusercontent.com/Bluetrae/WProxyRules/main/Surge/Netflix.list,<你的媒体策略>
```

### 迁移提示

- 已直接引用 blackmatrix7 的 WhatsApp、LINE、GitHub 或 PayPal Rule-Set 时，用本仓库对应 URL **替换**原有 Rule-Set，不要叠加两份同类规则。
- PayPal 可继续指定为 `Finance`；Netflix 的策略由你自己的媒体分组决定。
- OKX 当前输出已覆盖此前单独维护的 `okx.ac`、`okx.cab`、`okx.com.cdn.cloudflare.net` 与 `xlayer.tech`；切换后不需要继续保留这四条手工规则。

## 自动更新

GitHub Actions 工作流位于 [`.github/workflows/update.yml`](.github/workflows/update.yml)，可手动运行，并会在每日北京时间约 02:17 自动检查上游。

```text
审计后的 sources/apps.yaml
→ build.py 解析、转换、规范化与去重
→ 合并已验证的 supplement（如存在）
→ 生成 Surge/*.list
→ 仅在输出实际变化时由 github-actions[bot] 提交
```

构建会在以下情况明确失败，而不是静默改变分流语义：上游 404 / 超时 / HTML 响应、未知规则类型、未声明 include、include 循环、无法安全转换的规则或无效 supplement。

## 规则边界

- `Surge/*.list` 是 generated files，绝不手工编辑。
- 每个 App 默认只使用 1 个 primary source，最多 1 个 supplemental source；规则数量不是目标，范围准确才是。
- 上游选择优先参考 Repcz、SukkaW 与成熟维护者，但 freshness、完整度、范围、格式适配性和维护质量优先于作者偏好。
- Reject、Domestic、China IP、CDN、LAN 等基础设施规则不纳入本仓库，继续直接引用成熟上游。
- `sources/supplement/<App>.list` 仅放置已由 Surge 日志或实际使用证实、且上游确实缺失的规则；没有缺口就不创建文件。

## 支持的输入格式

| Format | 行为 |
| --- | --- |
| `v2fly-domain-list` | 解析普通 domain、`full:`、`keyword:` 与 manifest 明确允许的 `include`；regexp、未声明 include、否定 attribute 会失败。 |
| `surge-rule-set` | 只接受无策略名的 `DOMAIN`、`DOMAIN-SUFFIX`、`DOMAIN-KEYWORD`、`USER-AGENT`、`PROCESS-NAME`、`IP-CIDR`、`IP-CIDR6`；IP 仅允许额外携带 `no-resolve`。 |

支持一种格式不代表自动接纳任何 App。新增或更换 source 前必须先完成 source audit，并单独审查 manifest 变更。

## 仓库结构与本地验证

```text
sources/apps.yaml          # 长期 source manifest
sources/supplement/        # 仅限已证实的上游缺口
scripts/build.py           # 保守构建器
Surge/                     # 仅由构建器或 Actions 生成
.github/workflows/update.yml
```

```powershell
# First time only: create a local environment ignored by Git
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt

# For a new or changed App: fast, targeted read-only validation
.\.venv\Scripts\python.exe scripts\build.py --app PayPal

# Full local health check when needed
.\.venv\Scripts\python.exe scripts\build.py
.\.venv\Scripts\python.exe -m unittest discover -s tests -v
```

新增 App 的日常审计优先使用 `--app <App>`，避免不相关上游的临时网络问题阻塞定向验证。全量检查仍由 GitHub Actions、每日更新和发布前验证负责。`.venv/` 已被 Git 忽略，绝不提交。

`build.py` 默认是只读预检。只有明确需要在本地生成文件时才使用：

```powershell
.\.venv\Scripts\python.exe scripts\build.py --write
```

提交前请检查生成差异；不要手工修改 `Surge/*.list`，也不要提交订阅 URL、token、密码、证书或其他敏感信息。

更完整的项目规范、source audit 结论与交接状态见 [AGENTS.md](AGENTS.md) 和 [CODEX_HANDOFF.md](CODEX_HANDOFF.md)。
