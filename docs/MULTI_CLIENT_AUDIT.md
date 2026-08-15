# Rulink Multi-Client Audit（Surge / Shadowrocket / Loon / Stash / Egern）

> 审计日期：2026-08。目的：在动手改代码前，确认五个客户端的规则格式事实，
> 决定 Shared Output、Renderer 数量与 Output Architecture。本文件是
> 实现阶段的唯一格式依据；实现若与本文件冲突，先回改本文件再改代码。

## 1. 审计方法与证据层级

沙箱环境禁止直连 HTTP，证据分三层，优先级从高到低：

1. **官方文档**：
   - Surge：[官方手册](https://manual.nssurge.com/rule/ruleset.html) + 官方手册汉化仓库 [lockcp/SurgeHandbook](https://github.com/lockcp/SurgeHandbook)（内容可核对）。
   - Loon：[官方手册仓库 Loon0x00/LoonManual](https://github.com/Loon0x00/LoonManual) + 官方示例配置 [Loon0x00/LoonExampleConfig](https://github.com/Loon0x00/LoonExampleConfig)（内容可核对）。
   - Stash：[Rule Sets](https://stash.wiki/en/rules/rule-set)、[Rule Types](https://stash.wiki/en/rules/rule-types)（页面存在；正文本环境不可读，结论以生产实证为准并标注）。
   - Egern：[Rules](https://egernapp.com/docs/configuration/rules)（正文本环境不可读，结论以生产实证为准并标注）。
2. **生产实证**（克隆仓库逐文件核对）：
   - [Repcz/Tool](https://github.com/Repcz/Tool)：五客户端目录 + 每客户端 `.conf`/`Stash.yaml` 模板；Surge/Loon/Shadowrocket/Stash 四个目录的 `YouTube.list`、`Netflix.list` 等**逐字节相同**；Egern 目录为 `*_set` YAML schema。
   - [SukkaW/Surge](https://github.com/SukkaW/Surge)：TypeScript 构建流水线，按客户端族输出 domainset/non_ip/ip 三种格式。
   - [xkww3n/Rules](https://github.com/xkww3n/Rules) 及其 [wiki 配置示例](https://github.com/xkww3n/Rules/wiki)：各客户端引用语法对照。
   - [ClashConnectRules/Egern](https://github.com/ClashConnectRules/Egern)：生产 Egern YAML 配置，实证 `rule_set.match` 直接消费 Surge `.list` / SukkaW `.conf` / Loon `.lsr`。
   - [MetaCubeX/Meta-Docs](https://github.com/MetaCubeX/Meta-Docs)：Clash 族 rule-provider 参考（非 Stash 官方，仅作族参考）。
3. **社区手册**：[LOWERTOP/Shadowrocket](https://github.com/LOWERTOP/Shadowrocket)（标注"与官方群组同步更新"的手册补完计划；Shadowrocket 无公开官方手册站点，App 内帮助为权威）。

无法由官方规范确认的项目一律标 **Needs Verification**，不凭经验宣布兼容。

## 2. 五客户端审计详情

### Surge（官方手册 + 官方汉化）

- 规则类型：`DOMAIN`、`DOMAIN-SUFFIX`、`DOMAIN-KEYWORD`、`IP-CIDR`、`IP-CIDR6`、`USER-AGENT`、`PROCESS-NAME`、`GEOIP`、`IP-ASN`、`URL-REGEX`、`DEST-PORT` 等。
- 单条格式：域规则两字段 `DOMAIN,value`；IP 规则可选 `no-resolve`：`IP-CIDR,net,no-resolve`。
- **no-resolve**：官方文档明确，防止对域名目标做无效 DNS 解析。
- Rule-Set 文件：官方明确"一行一条规则，**不写策略**"（policy-free classical text）。
- 引用：主配置 `[Rule]` 段 `RULE-SET,<URL>,<policy>[,pre-matching][,extended-matching]`，policy 在引用处。
- 注释：官方 profile format 文档：`#`、`;`、`//` 行注释，`//` 支持行内注释。
- 更新/缓存：App 管理，规则集文件内无 TTL。
- 无损性：Rulink 现行 7 种类型全支持（含 USER-AGENT、PROCESS-NAME，Repcz Surge 文件携带二者生产验证）。

### Shadowrocket（LOWERTOP 手册 + 生产实证；无公开官方手册站点）

- 规则类型：`DOMAIN`、`DOMAIN-SUFFIX`、`DOMAIN-KEYWORD`、`DOMAIN-WILDCARD`、`USER-AGENT`、`URL-REGEX`、`IP-CIDR`、`IP-ASN`、`GEOIP`、`RULE-SET`、`DOMAIN-SET`、`SCRIPT`、`DST-PORT`、`AND/OR/NOT`、`PROTOCOL`、`FINAL`。
- **no-resolve**：手册明确（`IP-CIDR,172.16.0.0/12,DIRECT,no-resolve`），域目标跳过 IP 规则、不触发本地 DNS。
- **IP-CIDR6**：手册只描述 `IP-CIDR` 匹配 IPv4/IPv6；Repcz Shadowrocket 目录实际发布 `IP-CIDR6,...no-resolve` 行（Netflix 199 条）→ 生产可用，官方文档级 Needs Verification。
- **PROCESS-NAME**：手册无此类型；手册明确"iOS 没有常规分应用代理，只能域名/IP/UA 分流"；Repcz Shadowrocket 文件丢弃 PROCESS-NAME → 不可无损表达。
- Rule-Set：`RULE-SET,<URL>,<policy>`（Repcz Shadowrocket.conf 生产实证，语法同 Surge）；规则集内容为含规则类型的 classical 行。
- 注释：`#`（生产实证）；`;` Needs Verification。
- 更新/缓存：App 内"使用配置/编译配置"或自动更新，文件内无 TTL。存在 Clash 配置导入能力，但原生 RULE-SET 是更自然、维护成本最低的路径（本仓库不依赖 Clash 导入假设）。

### Loon（官方手册仓库）

- 规则类型（官方）：`DOMAIN`、`DOMAIN-SUFFIX`、`DOMAIN-KEYWORD`、`IP-CIDR`、`IP-CIDR6`、`GEOIP`、`IP-ASN`、`USER-AGENT`、`URL-REGEX`、`SRC-PORT`、`DEST-PORT`、`PROTOCOL`、`AND/OR/NOT`、`FINAL`。
- **no-resolve**：官方文档明确（IP 规则可选参数，附专门解释）。
- **USER-AGENT**：官方示例规则文件含 `USER-AGENT,PayPal*` 等行 → 官方支持。
- **PROCESS-NAME**：官方手册全部章节无此类型；Repcz Loon 文件丢弃 → 视为不支持。
- 订阅规则（官方 sub_rule.md）："只要是满足 Loon 类型的规则都可以放入规则集"，引用形式 `URL, POLICY`；主配置 `[Remote Rule]` 段：`URL, policy=X, tag=Y, enabled=true`（Repcz Loon.conf 生产实证）。
- 注释：`#`（生产实证）；`;` Needs Verification。
- 更新/缓存：App 管理，文件内无 TTL。

### Stash（官方 wiki 页面存在；正文不可读，生产实证为主）

- 内核为 Clash Premium 系；配置是 YAML，但 **rule-provider 可直接消费 classical text，不需要 YAML payload**。
- 生产实证（Repcz `Stash.yaml`）：
  ```yaml
  rule-providers:
    YouTube: {behavior: classical, format: text, interval: 86400, url: .../Stash/Rules/YouTube.list}
  rules:
    - RULE-SET,YouTube,Media
  ```
  `format: text` 的 classical payload = policy-free classical 行；`no-resolve`、`IP-CIDR6`、`DOMAIN-KEYWORD`、`PROCESS-NAME` 均保留于 Repcz Stash 文件。
- 变体：xkww3n 使用 Stash 特有 `behavior: domain-text`；mihomo 系另有 `yaml/text/mrs`。**`format: text` 的官方文档级确认 Needs Verification，生产级已证**。
- **PROCESS-NAME**：✅ Repcz Stash 保留（com.netflix.mediaclient、com.spotify.music）。
- **USER-AGENT**：Clash 内核支持 classical UA 规则；但 Repcz 在 Stash 目录丢弃 UA（Netflix/Spotify）→ 语义风险 Needs Verification，默认保留、真机验证。
- 注释：`#`（生产实证）；`;` Needs Verification。
- 更新/缓存：`interval: 86400`（provider 级，生产实证）。

### Egern（官方 docs 页面存在；正文不可读，生产实证为主）

- 两条消费路径，均生产实证：
  1. **classical 直接消费**：CCR-Egern 生产配置 `- rule_set: {match: <Surge .list / SukkaW .conf / Loon .lsr URL>, policy: X}`；xkww3n README："纯文本规则集（Surge 标准）适用于 Surge、Stash、Surfboard 和 **Egern**"。policy 在引用处。
  2. **Egern 自有 YAML Rule-Set**（Repcz `Egern/Rules/*.yaml` 生产 schema）：
     ```yaml
     no_resolve: true
     domain_set: [...]
     domain_suffix_set: [...]
     domain_keyword_set: [...]
     ip_cidr_set: [...]
     ip_cidr6_set: [...]
     user_agent_set: ['Argo*']     # USER-AGENT 映射
     url_regex_set: [...]
     ```
- **no-resolve**：rule-set 级 `no_resolve: true`；配置内规则级 `no_resolve: true` 字段（CCR 实证）。
- **PROCESS-NAME**：Repcz Egern 文件丢弃、无对应 key → 不可无损表达（官方文档级 Needs Verification）。
- Egern YAML ≠ Clash YAML：`rules:` 是对象列表（`rule_set` / `domain` / `domain_suffix` / `domain_keyword` / `geoip` / `url_regex` / `default`），与 Clash 完全不同。另支持 `dns.forward` 的 `proxy_rule_set` 做域名级 DNS 分流。
- 注释：`#`（生产实证）。更新间隔字段：Needs Verification。

## 3. Client Capability Matrix

| Rule Type | Surge | Shadowrocket | Loon | Stash | Egern |
|---|---|---|---|---|---|
| DOMAIN | ✅ 官方 | ✅ 手册 | ✅ 官方 | ✅ 内核+生产 | ✅ 生产 |
| DOMAIN-SUFFIX | ✅ 官方 | ✅ 手册 | ✅ 官方 | ✅ 内核+生产 | ✅ 生产 |
| DOMAIN-KEYWORD | ✅ 官方 | ✅ 手册 | ✅ 官方 | ✅ 内核+生产 | ✅ 生产 |
| IP-CIDR | ✅ 官方 | ✅ 手册 | ✅ 官方 | ✅ 生产 | ✅ 生产 |
| IP-CIDR6 | ✅ 官方 | ⚠️ 生产可用 / 官方 Needs Verification | ✅ 官方 | ✅ 生产 | ✅ 生产（ip_cidr6_set） |
| USER-AGENT | ✅ 官方 | ✅ 手册 | ✅ 官方示例 | ⚠️ 内核支持 / Repcz 丢弃 / Needs Verification | ✅ 生产（user_agent_set）；classical 内 Needs Verification |
| PROCESS-NAME | ✅ 官方 | ❌ 无此类型 | ❌ 官方无 | ✅ 生产保留 | ❌ 无对应 key |
| no-resolve 语义 | ✅ 官方 | ✅ 手册 | ✅ 官方 | ✅ 生产 | ✅ 生产 |
| 注释 `#` | ✅ | ✅ 生产 | ✅ 生产 | ✅ 生产 | ✅ 生产 |
| 注释 `;` / `//` | ✅ 官方 | Needs Verification | Needs Verification | Needs Verification | Needs Verification |

## 4. Remote Rule-Set Compatibility Matrix

| | Surge | Shadowrocket | Loon | Stash | Egern |
|---|---|---|---|---|---|
| 引用指令 | `RULE-SET,URL,POLICY` | `RULE-SET,URL,POLICY` | `[Remote Rule]` 段 `URL, policy=P, tag=T, enabled=true` | `rule-providers`（name/behavior/format/url/interval）+ `RULE-SET,name,POLICY` | `rule_set: {match: URL, policy: P}` |
| Policy 位置 | 引用处 | 引用处 | 引用处 | 引用处 | 引用处 |
| 远程文件带 policy？ | 否 | 否 | 否 | 否（text classical） | 否 |
| 独立 classical 文件 | ✅ | ✅ | ✅ | ✅（format: text） | ✅ |
| 需要 YAML wrapper/payload | ❌ | ❌ | ❌ | ❌（可选 yaml/mrs 优化） | ❌（可选自有 YAML schema） |
| 更新/缓存 | App 管理 | App 管理 | App 管理 | `interval: 86400` | App 管理（字段 Needs Verification） |
| 主配置格式 | INI | INI | INI | YAML（Clash 系） | YAML（自有 schema） |

## 5. 兼容性结论（A–E）

- **A. 可共享同一 output**：Surge / Shadowrocket / Loon / Stash 共享**逐字节相同**的 classical `.list`。
- **B. 引用方式不同、Rule-Set 内容相同**：上述四客户端；Egern 也能直接消费同一 classical 文件（`rule_set.match`），即 classical 文件实际覆盖全部五端。
- **C. 真正需要不同 serialization**：仅 **Egern 自有 YAML schema** 一种，且是**可选**的。决策：发布它——它是 Egern 生态最自然的 Rule-Set 载体（内置规则库格式、UA 的 `user_agent_set` 表达、PROCESS-NAME 边界显式），代价是一个小 Renderer。
- **D. 无法无损表达的 Canonical Type**：只有 **PROCESS-NAME**（Loon ❌、Shadowrocket ❌、Egern ❌）。其余 6 种全部五端可表达。
- **E. 必须 capability fail/downgrade 的项目**：PROCESS-NAME → 对 Loon/Shadowrocket/Egern **显式降级丢弃**（沿用仓库 `ip-asn:*`/`url-regex:*` 类型级排除先例：构建报告计数，绝不 silent）。受影响 App：Netflix（1 条）、Spotify（1 条）。Egern 的 `no_resolve: true` 为 set 级：全部 IP 规则带 no-resolve 时输出，全不带时省略（语义等价），**混合时显式构建失败**（当前 18 App 数据全部均匀，无混合）。

## 6. Shared Output Feasibility

**可行且为最优解**。共享 classical 输出 ×4 客户端 + Egern YAML ×1，共 **2 种序列化格式覆盖 5 客户端**。Stash 的关键疑问已有答案：官方支持 classical text（`format: text`），**不需要为 Stash 制造 YAML Rule-Set**。

## 7. Renderer Architecture

**2 个 Renderer，按真正不同的 serialization format 划分，不按客户端划分**：

| Renderer | 输出 | 目标客户端 | 规则类型处理 |
|---|---|---|---|
| `classical` | policy-free classical text（与现行 `SurgeRule.render()` 字节一致，含两行 `#` 头） | Surge / Shadowrocket / Loon / Stash | 7 种全保留（Stash UA 保留待真机验证） |
| `egern-yaml` | Egern `*_set` schema | Egern | 域名类 → 对应 set；IP → `ip_cidr(_6)_set` + `no_resolve`；USER-AGENT → `user_agent_set`；PROCESS-NAME → 显式丢弃 + 报告 |

Canonical Model 复用现有 policy-free `SurgeRule`（实现时更名为 `Rule`，字段、key、provenance、dedup 逻辑不变），`render()` 从模型移出到 Renderer。Surge 输出 = classical renderer 的一个 target，**字节不变**。

## 8. Output Architecture

```
Surge/<App>.list         # 保持现有路径与字节（backward compat）
Loon/<App>.list          # 与 Surge 逐字节相同
Shadowrocket/<App>.list  # 与 Surge 逐字节相同
Stash/<App>.list         # 与 Surge 逐字节相同
Egern/<App>.yaml         # Egern schema
```

- 采纳 Repcz/Tool 生态惯例：每客户端独立目录，各客户端用户直接取本客户端目录 URL；git 对相同内容只存一份 blob，仓库体积几乎不增。
- 采纳 SukkaW/Surge 思想：内容（canonical）与每客户端序列化严格分离；README 提供每客户端引用片段。SukkaW 的 domainset/non_ip/ip 拆分与 mihomo `domain/ipcidr` 行为优化对当前规模（≤1158 条/App）无必要，列为未来可选优化。

## 9. Surge Backward Compatibility Plan

1. `Surge/<App>.list` 路径与字节**保持完全不变**：`RULE-SET,https://raw.githubusercontent.com/Bluetrae/Rulink/main/Surge/<App>.list,<策略>` 持续有效；jsDelivr 镜像说明不变。
2. 重构验收门禁：重构建后 `git diff Surge/` 必须为空（golden-byte 检查）。
3. Surge 路径从不移动 → 无需 alias / 重复发布路径 / staged migration。

## 10. Needs Verification 汇总

1. Stash `format: text` 的官方文档正文（页面存在但本环境不可读）——生产实证充分，风险低。
2. Shadowrocket `IP-CIDR6` 官方文档级确认（生产实证可用）。
3. Stash 的 `USER-AGENT` 语义（Repcz 生产丢弃）——保留 + 真机验证。
4. Egern 官方文档正文（schema 与 `rule_set` 消费均为生产实证）。
5. `;` 注释在非 Surge 客户端的支持（本仓库只依赖 `#`，风险可规避）。

## 11. 测试策略（实现阶段）

- **A · Smoke**：OKX（v2fly 转换路径）→ canonical → classical ×4 + Egern YAML，人工核对结构。
- **B · YouTube 跨端 E2E**：当前主源 Repcz 14 条不变；五端最小引用示例内置 README；真机验证首页/搜索/播放/Shorts/图床/CDN/评论/API，观察落 Final、CDN 漏网与五端一致性。
- **C · Complex Semantics**：GitHub（include allow/deny + attributes + exclude + provenance + dedup + nested source）跑全管线五端输出一致性。
- 核心代码禁止 OKX/YouTube/GitHub 业务特例。

## 12. 后续阶段

多客户端输出落地后，重构更新 `portal/` 网页：卡片增加客户端切换/标签页，为每客户端提供对应复制接入行（Surge/Shadowrocket `RULE-SET,URL,POLICY`；Loon `[Remote Rule]` 行；Stash `rule-providers`+`RULE-SET` YAML 片段；Egern `rule_set` YAML 片段 + Egern YAML 文件链接）。
