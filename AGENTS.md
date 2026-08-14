# WProxyRules 项目规范

## 项目目标

自动生成个人使用的 Surge App Rule-Sets。

## 规则与来源规范

- Generated files 不允许手工维护。
- 持久化自定义规则只能放在 `sources/custom/`。
- 每个 App 默认使用 1 个主源，最多 1 个补充源，除非有明确理由。
- 不追求规则数量最大化，避免无意义吞入共享 CDN。
- Reject / Domestic / China IP / CDN / LAN 等基础设施规则不纳入本仓库，继续直接引用成熟上游。
- 输出规则不带策略名，由 Surge 主配置通过 `RULE-SET` 指定策略。

## 安全规范

- 禁止提交机场订阅 URL、token、GitHub PAT、密码、2FA、MTProto secret、证书等敏感信息。

## 可用工具与 Git 规范

- GitHub Plugin 在当前 Edu 工作区不可用，不要依赖它。
- 可使用本地 filesystem、terminal、Git CLI、Chrome。
- 用户正在重新熟悉 Git；执行会修改 Git repository 状态的命令前，先用一句话解释该命令用途。
- 禁止未经确认使用 `git reset --hard`、force push、改写已发布历史。

## 开发顺序

- 首批开发顺序：OKX、WhatsApp、LINE、GitHub；验证后再扩展其他 App。
- Apple Music 暂缓，因为当前 Apple 分流依赖 Repcz、Sukka、extended-matching 和手工 CDN 修复。
