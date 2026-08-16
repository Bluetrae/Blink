<div align="center">

# <img src="docs/images/avatar.png" width="36" height="36" alt="" style="vertical-align:middle" /> Rulink

**多客户端 App Rule-Set · 自动构建 · 稳定分发**

[![Update Rule-Sets](https://github.com/Bluetrae/Rulink/actions/workflows/update.yml/badge.svg?branch=main)](https://github.com/Bluetrae/Rulink/actions/workflows/update.yml)
[![Rule-Sets](https://img.shields.io/badge/Rule--Sets-6_clients-2f81f7?style=flat-square)](https://github.com/Bluetrae/Rulink/tree/main/Surge)
[![Portal](https://img.shields.io/badge/Portal-网页入口-4d6bfe?style=flat-square)](https://bluetrae.github.io/Rulink/)
[![Updated](https://img.shields.io/github/last-commit/Bluetrae/Rulink/main?label=updated&style=flat-square)](https://github.com/Bluetrae/Rulink/commits/main)
[![Stars](https://img.shields.io/github/stars/Bluetrae/Rulink?label=stars&style=flat-square)](https://github.com/Bluetrae/Rulink/stargazers)

</div>

<br>

个人使用的**多客户端 App Rule-Set** 仓库：把经过审计的上游 App 规则，保守转换为可长期引用的稳定规则集。一份 Canonical Rule Model 渲染为多个客户端格式，覆盖 **Surge / Shadowrocket / Loon / Stash / Egern / Quantumult X**，而不是为每个客户端维护一套独立规则。

> [!NOTE]
> 这是 **App Rule-Set 仓库**，不是完整的代理客户端配置模板；策略组与 `FINAL` 由你的主配置负责。

> [!IMPORTANT]
> 本仓库仅供个人学习研究使用；使用前请阅读 [DISCLAIMER.md](DISCLAIMER.md) 与 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。**禁止任何形式的转载或发布至国内平台**。

## 🚀 快速开始

### Surge / Shadowrocket

在 `[Rule]` 段、`FINAL` 之前加一行（policy 由你的主配置指定）：

```ini
RULE-SET,https://raw.githubusercontent.com/Bluetrae/Rulink/main/Surge/<App>.list,<你的策略>
```

Shadowrocket 语法与 Surge 相同，也可直接用 `Shadowrocket/` 目录 URL。

### Loon

在 `[Remote Rule]` 段添加一行：

```ini
https://raw.githubusercontent.com/Bluetrae/Rulink/main/Loon/<App>.list, policy=<你的策略>, tag=<App>, enabled=true
```

### Stash

在 `rule-providers` 注册 classical text 规则集，在 `rules` 里用 `RULE-SET` 引用：

```yaml
rule-providers:
  <App>:
    type: http
    behavior: classical
    format: text
    url: https://raw.githubusercontent.com/Bluetrae/Rulink/main/Stash/<App>.list
    interval: 86400
rules:
  - RULE-SET,<App>,<你的策略>
```

### Egern

```yaml
rules:
  - rule_set:
      match: https://raw.githubusercontent.com/Bluetrae/Rulink/main/Egern/<App>.yaml
      policy: <你的策略>
```

（Egern 也可以直接用 `rule_set.match` 消费 `Surge/` 目录的 classical `.list` URL。）

### Quantumult X

在 `[filter_remote]` 段添加一行；行尾的 `policy` 是占位符，实际策略由 `force-policy` 指定：

```ini
https://raw.githubusercontent.com/Bluetrae/Rulink/main/QuantumultX/<App>.list, tag=<App>, force-policy=<你的策略>, update-interval=172800, opt-parser=false, enabled=true
```

> [!IMPORTANT]
> **规则顺序**：域名类规则集必须放在 IP 类规则（如 China IPv4）**之前**。自上而下匹配的客户端（Surge / Shadowrocket / Loon / Stash / Egern / Quantumult X）都只有 IP 类规则与 `FINAL` 才触发 DNS 解析；顺序颠倒会让待代理域名被提前解析，失去 DNS 防污染保护。

<sub>raw 直连不稳时，可改用 jsDelivr 加速地址（缓存最长 12 小时，规则更新会相应延迟）：`https://cdn.jsdelivr.net/gh/Bluetrae/Rulink@main/Surge/<App>.list`。</sub>

## 🌐 网页入口

无需域名即可访问：[`https://bluetrae.github.io/Rulink/`](https://bluetrae.github.io/Rulink/)。切换顶部客户端标签（Surge / Shadowrocket / Loon / Stash / Egern / Quantumult X）即可查看每个 App 的规则数与对应接入行，一键复制。

<div align="center">
  <a href="https://bluetrae.github.io/Rulink/">
    <img src="docs/images/portal-preview.png" alt="Rulink 门户预览" width="720" />
  </a>
</div>

## ⚙️ 更新机制

每天北京时间约 **00:01**，GitHub Actions（[`update.yml`](.github/workflows/update.yml)）自动检查上游并重建六个客户端的规则文件与门户数据：有实质变化才提交，无变化零提交；构建失败时保留旧输出、暂停更新，不影响日常使用。新 App 与补充规则由人工审计添加，CI 不会自动引入。

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
docs/MULTI_CLIENT_AUDIT.md # 六客户端格式审计与架构决策依据
sources/apps.yaml          # source manifest：来源、范围控制与选源理由
sources/supplement/        # 仅限日志确认的上游缺口，按需创建
scripts/build.py           # 保守、显式失败的构建器（canonical 模型 + 处理管线）
scripts/renderers.py       # 客户端 Renderer：classical / egern-yaml / quantumultx
scripts/gen_portal_stats.py # 从 Surge 输出与 manifest 生成门户数据
tests/                     # 单元测试
Surge/                     # Generated：classical .list（原 Surge 入口，路径与字节不变）
Loon/                      # Generated：与 Surge 逐字节相同的 classical .list
Shadowrocket/              # Generated：与 Surge 逐字节相同的 classical .list
Stash/                     # Generated：与 Surge 逐字节相同的 classical .list
Egern/                     # Generated：Egern 自有 YAML Rule-Set schema
QuantumultX/               # Generated：QX filter 行（行尾占位符 policy，force-policy 覆盖）
portal/                    # 网页门户（Vite + React + TS + Tailwind CSS）
docs/                      # 审计文档与门户预览图等静态资源
.github/workflows/update.yml
.github/workflows/pages.yml # 门户构建与 GitHub Pages 部署
```

<sub>生成目录绝不手工修改；本仓库不包含任何订阅 URL、token、密码、证书或其他敏感信息。</sub>

## ⚖️ 使用与许可

感谢 Repcz、SukkaW、blackmatrix7、v2fly 等上游作者对规则集的长期维护（各 App 的来源明细与许可见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)）。

本仓库为个人规则分发与学习维护而设，无任何担保；请结合自己的代理客户端策略与日志自行验证，并遵守适用法律、服务条款与上游许可。根目录**不设统一许可证**：构建代码与文档是原创内容，`Surge/`、`Loon/`、`Shadowrocket/`、`Stash/`、`Egern/`、`QuantumultX/` 是多上游生成的产物，不得被统一标记为 MIT 等单一许可证 —— 详情见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
