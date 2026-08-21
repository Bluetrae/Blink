# DeepSeek Harness 迁移说明

> 用途：让新的 Agent 在不导入或伪造旧聊天会话的前提下，安全、准确地接手 Blink。
>
> 本文件是项目上下文摘要，不是完整聊天记录，也不是运行时配置文件。它不应包含 API key、token、订阅地址、密码、2FA、证书或其他敏感信息。

## 使用方式

在 DeepSeek Harness 中选择本仓库作为 workspace 后，先要求 Agent 按下面的“必读顺序”只读检查项目。首次回应必须复述它理解的当前状态和下一步建议；获得用户确认前不得修改文件。

推荐的首次提示：

```text
你正在接手 Blink 项目。请先只读地阅读 DEEPSEEK_MIGRATION.md 指定的文件，
并执行 Git 与项目状态审计。把当前 Git 工作区和 engine/sources/apps.yaml 视为最高
事实来源；若与历史聊天或摘要冲突，以当前文件和 Git 历史为准。先报告你的理解，
在我明确确认前不要修改文件。
```

## 项目身份与事实优先级

- 项目名称：Blink
- GitHub：<https://github.com/Bluetrae/Blink>
- 本地工作区：`C:\Users\<用户名>\Projects\Blink`
- Raw Rule-Set 基础地址（v1.1 起）：
  - Surge：`https://raw.githubusercontent.com/Bluetrae/Blink/main/Surge/`（自 v1 起不变，用户主配置依赖此路径）
  - Shadowrocket：`https://raw.githubusercontent.com/Bluetrae/Blink/main/Shadowrocket/`
  - Loon：`https://raw.githubusercontent.com/Bluetrae/Blink/main/Loon/`
  - Stash：`https://raw.githubusercontent.com/Bluetrae/Blink/main/Stash/`
  - Egern：`https://raw.githubusercontent.com/Bluetrae/Blink/main/Egern/`
  - Quantumult X：`https://raw.githubusercontent.com/Bluetrae/Blink/main/QuantumultX/`

遇到信息不一致时，按以下顺序判断：

1. 当前 Git 工作区、`git status`、Git 历史和实际生成文件。
2. `engine/sources/apps.yaml`、`engine/scripts/build.py`、测试与 GitHub Actions workflow。
3. `AGENTS.md`、`HANDOFF.md`、README 与合规文档。
4. 本文件。
5. 仓库外保存的原始聊天档案。

原始对话可能含有已废弃的设计、临时推测或已完成事项；它只能用于追溯，不能覆盖较高优先级的事实。

## 必读顺序

1. `README.md`：项目用途、用户入口和当前输出清单。
2. `AGENTS.md`：长期规则、上游选择政策、Git 安全要求和新增 App 流程。
3. `HANDOFF.md`：最近完成状态、已审计来源和后续计划。
4. `engine/sources/apps.yaml`：所有启用 App 的权威 source manifest 与 parser policy。
5. `engine/scripts/build.py` 与 `engine/tests/test_build.py`：构建器实际支持的语义和测试边界。
6. `.github/workflows/update.yml`：自动更新、写入和 Actions 提交逻辑。
7. `THIRD_PARTY_NOTICES.md` 与 `DISCLAIMER.md`：来源许可、个人使用和责任边界。

## 当前迁移基线

本文件创建前的已验证 Git 基线是：

```text
4402b1a refactor: rename repository to Blink
origin: https://github.com/Bluetrae/Blink.git
```

该基线仅作迁移记录。每次接手都必须重新执行只读 `git status`、`git log` 和必要的测试；不要假设此处的提交仍是最新状态。

仓库曾用名 `WProxyRules`、`Rulink`，现为 **`Blink`**。项目文档、origin 和 public raw URL 应使用 `Bluetrae/Blink`；旧 `Bluetrae/Rulink` 路径（含 raw）由 GitHub 301 重定向到新地址，但不得再新增旧名称引用。

## 项目目标

自动生成个人使用的多客户端 App Rule-Sets（Surge / Shadowrocket / Loon / Stash / Egern）；详细规范见 `AGENTS.md`，对外说明见 `README.md`，格式审计与架构决策见 `engine/docs/MULTI_CLIENT_AUDIT.md`，本文件不重复。

## 不可违反的项目边界

以 `AGENTS.md` 的「规则与来源规范」「安全规范」「可用工具与 Git 规范」为准，要点：generated 目录（`Surge/`、`Loon/`、`Shadowrocket/`、`Stash/`、`Egern/`）与 supplement 的边界、敏感信息禁令、git 危险命令与改动前说明，均不得违反。

## 上游选择与审计原则

以 `AGENTS.md` 的「Upstream Source Selection Policy」为准（一梯队 Repcz/SukkaW 先审，按证据决定，audit 结论按 App 独立记录），本文件不重复。

## 构建器关键语义

- `engine/scripts/build.py` 默认只检查（含全部客户端渲染验证）；仅显式传入 `--write` 才写入生成目录。
- v1 支持 `v2fly-domain-list` 与严格白名单的 policy-free `surge-rule-set`。
- v2fly `domain`、`full`、`keyword` 分别映射为 `DOMAIN-SUFFIX`、`DOMAIN`、`DOMAIN-KEYWORD`；不安全的 regexp 不得静默改变语义。
- v2fly include 采用显式 allow/deny policy：未在 allow 或 deny 中声明的 include 必须导致构建失败；同一 include 同时允许和拒绝也必须失败。
- attribute 语义固定为“无 attribute 条目 + 至少带一个显式允许 attribute 的条目”。当前所有 App 的 `attributes.include` 均为空，因此只输出无 attribute 条目；`@!name` 否定属性在 v1 不支持，必须失败而非静默处理。
- exclude 是 manifest 的显式、可审计决策，不能用猜测替代 source audit。
- surge-rule-set 来源可通过类型级 exclude（`ip-asn:*`、`url-regex:*`）显式丢弃 v1 不输出的规则类型；被丢弃的行数出现在构建报告的 `skipped_excluded` 字段。
- 上游完全缺失的 App 可声明 `sources: []`（supplement-only），全部规则来自 `engine/sources/supplement/<App>.list`；最终输出仍必须非空。
- **多客户端渲染（v1.1）**：canonical 规则经 `engine/scripts/renderers.py` 渲染 —— `classical` 供 Surge / Loon / Shadowrocket / Stash（四目录逐字节相同）、`egern-yaml` 供 Egern、`quantumultx` 供 Quantumult X（`HOST*`/`IP-CIDR`/`IP6-CIDR`/`USER-AGENT` 行，行尾占位符 `policy` 由 `[filter_remote]` 的 `force-policy` 覆盖；no-resolve 槽位无生产实证故统一省略，见 `engine/docs/MULTI_CLIENT_AUDIT.md`）。构建报告 `clients` 字段给出每客户端规则数与显式 dropped 列表；`PROCESS-NAME` 对 Loon / Shadowrocket / Egern / Quantumult X 显式丢弃，绝不静默。Surge 向后兼容门禁：`Surge/*.list` 路径与字节自 v1 起不变，重构建后 `git diff Surge/` 必须为空。
- 构建必须保守、可读、错误显式；不能为了成功生成而扩大规则范围或篡改规则语义。

## 已启用的 App 与 primary source

18 个 App 的权威定义（URL、格式、exclude/include/attribute policy 与选源理由）见 `engine/sources/apps.yaml`；完整审计档案见 `SOURCE_AUDITS.md`。本文件不维护冗余清单。

## 自动化与验证

- Python 依赖仅为锁定的 `PyYAML==6.0.3`；本地 `.venv` 是开发环境，不应提交。
- 单元测试入口：`.\.venv\Scripts\python.exe -m unittest discover -s tests -v`
- 单 App 只读预检优先使用：`.\.venv\Scripts\python.exe scripts\build.py --app <App>`。
- 全量写入仅使用：`.\.venv\Scripts\python.exe scripts\build.py --write`，并应在确认范围后执行。
- GitHub Actions workflow 名称为 `Update Rule-Sets`，支持手动运行和每日北京时间约 00:01 运行（GitHub 定时任务不保证准点，实际执行可能延后）。只有生成目录（`Surge/`、`Loon/`、`Shadowrocket/`、`Stash/`、`Egern/`、`QuantumultX/`）或门户数据发生变化时，workflow 才会以 `github-actions[bot]` 创建生成提交。
- 每日运行全自动、无人值守：有实质变化才提交、无变化零提交；构建失败（上游 404/超时/格式不合 v1）时保留旧输出、暂停更新，等待人工处理且无时限；新 App 与 supplement 永远由人工审计添加。

对新增 App，优先做定向预检；全量构建放在 GitHub Actions、每日更新、发布前健康检查或用户明确要求的全仓库验证中。构建写入必须保持原子性：所有选定 App 都成功后才更新输出。

## 当前状态（2026-08-26 更新）

2026-08-20 之后完成的大块变更（`git log origin/main..main` 可查最新提交；以 `git log` 为准）：

- **规则层 multi-view**：`build.py` 新增 `PHASE_BY_KIND` / `phase_of` / `semantic_views`；每 App 从 canonical
  派生 `-domainset.conf`（纯域名）/ `-nonip.conf`（含 keyword/UA/PROCESS）/ `-ip.conf`（IP 段）七端语义视图
  （`.conf` 后缀、policy-free，`views: true` 开启）；IP 段恒置于域名段之后；`renderers.py` 提供
  `render_surge_domainset` / `render_mihomo_domainset` / `render_view`（Surge/Shadowrocket 域名清单、
  Stash/Clash `behavior:domain`、Loon/Egern classical、QX filter）。
- **语义视图门禁 `engine/scripts/validate_views.py`**：校验视图种类合法（IP 不进 nonip、domain 不进 ip、
  纯域名无空 IP 视图）、Surge 视图与 canonical 拆分一致、七端齐全、头统计（含各端显式丢弃）正确；
  已同时接入 `checks.yml` 与每日 `update.yml`。
- **Profile 层**：`intent.yaml` 收敛为普适八组（单订阅池 + 地区组/Auto + Proxy/Final + 6 App 路由），
  General 按 skk 技术基线；7 端模板能力矩阵 FULL/ADAPTED/UNSUPPORTED 标注；6 路由 App 改用 domain/IP
  分文件引用；`Profiles/` 由 `build_profile.py --write` 生成，人工确认后提交，不进入每日更新。
- **portal**：规则卡片统一「复制规则链接」（点击弹出固定定位 + React Portal 的菜单，回弹动画、
  选项 hover/选中反馈，不会被相邻卡片遮挡）；非 mihomo 复制 raw 链接到客户端前端导入、
  Stash/Clash 复制配置文件写法；新增 App 搜索框（名称/中文分类/note/来源匹配 + 关键词高亮 +
  空结果状态 + 与「接入你的客户端」全部复制区联动）；官方 App 图标资产（含 Starryblu）。
- **新 App**：Starryblu（全球支付 App，supplement-only，根域 starryblu.com，2026-08-26）。
- **文档**：README 更新（29 App / 203 产物、去标题 emoji、合并重复的顺序说明）；HANDOFF.md 已同步当前状态。

现状数字：**29 App、26 上游源、203 个七端主产物**；单测 52 项；`manifest.json` 另记录每 App 的
per-client 语义视图与 SHA。**敏感信息检查**：仓库不含真实订阅 URL / 凭据 / 机场链接 / 本地真实路径 /
个人域名具体示例（个人化域名在文档中仅作泛化描述）。

## 已知待办与谨慎项

- 后续计划中的 AI、TikTok、Spotify、ZABank 已于 2026-08-15 完成 source audit 并全部落地；完整档案见 `SOURCE_AUDITS.md`。原清单中的 Live（现命名 APTV）是用户自用直播源，同日以 supplement-only 形式迁入（26 条，注释自用）。
- Apple Music 暂缓：当前 Apple 分流仍依赖 Repcz、SukkaW、extended-matching 与手工 CDN 修复，暂不纳入此 pipeline。
- ZABank 的 9 个候选域名已经 2026-08-15 审计确认上游全部缺失，并以三条根域名（`za.group`、`zainvest.group`、`zajourney.com`）写入 `engine/sources/supplement/ZABank.list`；如有日志发现新的 ZA Bank 域名，按漏网处理流程追加。
- `engine/sources/supplement/` 目前含 `ZABank.list`（3 条根域名）、`APTV.list`（26 条自用直播源）、`NBA.list` 与 `Suno.list`（各 2 条根域，2026-08-16 好友场景新增，无任何上游专项）；其他 App 无 supplement 文件是正确的空状态，不是缺失文件。
- 若 Surge 日志出现漏网：先确认 App 归属，再与上游比较，确认真正缺失后才加入对应 supplement、重新构建并验证。

## 原始聊天档案

完整对话若需要保留，应存放在仓库外的私密本地目录，例如：

```text
C:\Users\<用户名>\Documents\AI-Archives\Blink\
```

不要将完整聊天记录提交到公开仓库，也不要在每次新 session 自动交给模型。只有在需要追溯某项决策时，才提供经过筛选和脱敏的相关片段。
