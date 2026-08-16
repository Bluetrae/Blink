<div align="center">

# <img src="engine/docs/images/avatar.png" width="36" height="36" alt="" style="vertical-align:middle" /> Blink

**多客户端规则与配置 · 自动构建 · 稳定分发**

[![Update Rule-Sets](https://github.com/Bluetrae/Blink/actions/workflows/update.yml/badge.svg?branch=main)](https://github.com/Bluetrae/Blink/actions/workflows/update.yml)
[![Stars](https://img.shields.io/github/stars/Bluetrae/Blink?style=flat-square&label=Stars&color=ffcb2e)](https://github.com/Bluetrae/Blink/stargazers)
[![Updated](https://img.shields.io/github/last-commit/Bluetrae/Blink/main?style=flat-square&label=Updated&color=3178c6)](https://github.com/Bluetrae/Blink/commits/main)
[![Views](https://komarev.com/ghpvc/?username=Bluetrae&repo=Blink&label=Views&color=7c3aed&style=flat-square)](https://github.com/Bluetrae/Blink)
[![License](https://img.shields.io/badge/License-Custom-8A2BE2?style=flat-square)](THIRD_PARTY_NOTICES.md)
[![Portal](https://img.shields.io/badge/Portal-网页入口-4d6bfe?style=flat-square)](https://bluetrae.github.io/Blink/)

[![Surge](https://img.shields.io/badge/Surge-007AFF?style=for-the-badge)](Surge/)
[![Shadowrocket](https://img.shields.io/badge/Shadowrocket-2C3E50?style=for-the-badge)](Shadowrocket/)
[![Loon](https://img.shields.io/badge/Loon-FFC107?style=for-the-badge)](Loon/)
[![Stash](https://img.shields.io/badge/Stash-8E44AD?style=for-the-badge)](Stash/)
[![Egern](https://img.shields.io/badge/Egern-E74C3C?style=for-the-badge)](Egern/)
[![Quantumult X](https://img.shields.io/badge/Quantumult_X-0B84CE?style=for-the-badge)](QuantumultX/)

<br>

[![Forks](https://img.shields.io/github/forks/Bluetrae/Blink?style=flat-square&label=Forks&color=30c46c)](https://github.com/Bluetrae/Blink/forks)
[![Repo Size](https://img.shields.io/github/repo-size/Bluetrae/Blink?style=flat-square&label=Size&color=ef4444)](https://github.com/Bluetrae/Blink)
[![Commit Activity](https://img.shields.io/github/commit-activity/m/Bluetrae/Blink?style=flat-square&label=Commits%2FMonth&color=7c3aed)](https://github.com/Bluetrae/Blink/commits/main)

</div>

个人使用的**多客户端规则与配置文件**仓库，分两层：

- **规则层（自动维护）**：把经过审计的上游 App 规则保守转换为一份 Canonical Rule Model，渲染为 **Surge / Shadowrocket / Loon / Stash / Egern / Quantumult X** 六种客户端格式，每日自动更新，不是为每个客户端维护一套独立规则。
- **配置层（人工维护）**：把同一份配置意图（策略组 / 规则引用 / 通用设置）迁移为六客户端**完整配置文件**，单一订阅池组织、占位符已内置，替换一条订阅即可复用。

<sub>生成目录由构建器自动维护、绝不手工修改；仓库不含任何订阅 URL、token、密码或证书等敏感信息。</sub>

> [!NOTE]
> 配置文件是**人工维护层**，不随规则每日更新；导入前把 `https://YOUR-SUBSCRIPTION-URL` 替换为你的订阅链接，并真机验证策略组与分流效果。

> [!IMPORTANT]
> 本仓库仅供个人学习研究使用；使用前请阅读 [DISCLAIMER.md](DISCLAIMER.md) 与 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。**禁止任何形式的转载或发布至国内平台**。

---

## 📑 目录

- [🚀 规则集快速开始](#rules-quickstart)
- [🧭 配置文件快速开始](#profiles-quickstart)
- [🌐 网页入口](#portal)
- [🧩 来源政策](#sources)
- [⚖️ 使用与许可](#license)

---

<a id="rules-quickstart"></a>

## 🚀 规则集快速开始

### Surge / Shadowrocket

在 `[Rule]` 段、`FINAL` 之前加一行（policy 由你的主配置指定）：

```ini
RULE-SET,https://raw.githubusercontent.com/Bluetrae/Blink/main/Surge/<App>.list,<你的策略>
```

Shadowrocket 语法与 Surge 相同，也可直接用 `Shadowrocket/` 目录 URL。

### Loon

在 `[Remote Rule]` 段添加一行：

```ini
https://raw.githubusercontent.com/Bluetrae/Blink/main/Loon/<App>.list, policy=<你的策略>, tag=<App>, enabled=true
```

### Stash

在 `rule-providers` 注册 classical text 规则集，在 `rules` 里用 `RULE-SET` 引用：

```yaml
rule-providers:
  <App>:
    type: http
    behavior: classical
    format: text
    url: https://raw.githubusercontent.com/Bluetrae/Blink/main/Stash/<App>.list
    interval: 86400
rules:
  - RULE-SET,<App>,<你的策略>
```

### Egern

```yaml
rules:
  - rule_set:
      match: https://raw.githubusercontent.com/Bluetrae/Blink/main/Egern/<App>.yaml
      policy: <你的策略>
```

（Egern 也可以直接用 `rule_set.match` 消费 `Surge/` 目录的 classical `.list` URL。）

### Quantumult X

在 `[filter_remote]` 段添加一行；行尾的 `policy` 是占位符，实际策略由 `force-policy` 指定：

```ini
https://raw.githubusercontent.com/Bluetrae/Blink/main/QuantumultX/<App>.list, tag=<App>, force-policy=<你的策略>, update-interval=172800, opt-parser=false, enabled=true
```

> [!IMPORTANT]
> **规则顺序**：域名类规则集必须放在 IP 类规则（如 China IPv4）**之前**。自上而下匹配的客户端（Surge / Shadowrocket / Loon / Stash / Egern / Quantumult X）都只有 IP 类规则与 `FINAL` 才触发 DNS 解析；顺序颠倒会让待代理域名被提前解析，失去 DNS 防污染保护。

<sub>raw 直连不稳时，可改用 jsDelivr 加速地址（缓存最长 12 小时，规则更新会相应延迟）：`https://cdn.jsdelivr.net/gh/Bluetrae/Blink@main/Surge/<App>.list`。</sub>

---

<a id="profiles-quickstart"></a>

## 🧭 配置文件快速开始

六客户端**完整配置文件**位于 [`Profiles/`](Profiles/)：`Surge.conf`、`Shadowrocket.conf`、`Loon.conf`、`Stash.yaml`、`Egern.yaml`、`QuantumultX.conf`。

1. 下载对应客户端的配置文件（或在[门户](https://bluetrae.github.io/Blink/)「配置文件」板块用 **iOS 一键导入**）。
2. 用文本编辑器把 `https://YOUR-SUBSCRIPTION-URL` 替换成你的订阅链接。
3. 导入客户端，真机验证策略组与分流效果。

配置采用**单一订阅池**组织：全部策略组与地区筛选只依赖一条订阅；规则全部通过远程 URL 引用（本仓库规则 + 成熟上游基础设施），不复制规则内容。配置文件**人工维护、人工审核后发布**，不随规则每日更新。

---

<a id="portal"></a>

## 🌐 网页入口

无需域名即可访问：[`https://bluetrae.github.io/Blink/`](https://bluetrae.github.io/Blink/)，页面板块：

- **规则集**：切换六客户端标签查看每个 App 的规则数与对应接入行，一键复制；
- **接入指南**：六客户端全量接入片段，一键复制；
- **配置文件**：六客户端配置文件的下载 / 复制 / **iOS 一键导入**（支持 URL Scheme 的客户端）与导入指引；
- **构建与来源**：构建管线与选源原则。

<div align="center">
  <a href="https://bluetrae.github.io/Blink/">
    <img src="engine/docs/images/portal-preview.png" alt="Blink 门户预览" width="720" />
  </a>
</div>

---

<a id="sources"></a>

## 🧩 来源政策

- 每个 App 独立审计选源：以更新活跃度、覆盖、范围、格式与维护质量为证据，作者偏好只作并列时的 tie-breaker；每 App 恰好 1 个 primary、至多 1 个 supplemental。完整的候选、证据与结论档案见 [`engine/SOURCE_AUDITS.md`](engine/SOURCE_AUDITS.md)。
- Reject / Domestic / China IP / CDN / LAN 等基础设施**不复制进本仓库**，继续直接引用成熟上游。

---

<a id="license"></a>

## ⚖️ 使用与许可

感谢 Repcz、SukkaW、blackmatrix7、v2fly 等上游作者对规则集的长期维护（各 App 的来源明细与许可见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)）。

本仓库为个人规则分发与学习维护而设，无任何担保；请结合自己的代理客户端策略与日志自行验证，并遵守适用法律、服务条款与上游许可。根目录**不设统一许可证**：构建代码与文档是原创内容，`Surge/`、`Loon/`、`Shadowrocket/`、`Stash/`、`Egern/`、`QuantumultX/`、`Profiles/` 是多上游生成的产物，不得被统一标记为 MIT 等单一许可证 —— 详情见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。

> [!WARNING]
> 任何以任何方式查看此项目的人或直接或间接使用该项目的使用者都应仔细阅读此声明。
>
> 保留随时更改或补充此免责声明的权利。
>
> 一旦使用并复制了该项目的任何文件，则视为您已接受此免责声明。
