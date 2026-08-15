# WProxyRules

个人使用的 Surge App Rule-Set 自动分发仓库。

仓库将经过审计的上游规则转换为 Surge 可用格式，并把稳定的输出发布在自己的 raw URL。Surge 主配置只需要引用这里的 URL；当上游来源需要调整时，修改 manifest 与构建逻辑即可，无需逐个改动 Surge 主配置。

## 当前可用 Rule-Sets

| App | Surge Rule-Set URL |
| --- | --- |
| OKX | `https://raw.githubusercontent.com/Bluetrae/WProxyRules/main/Surge/OKX.list` |
| WhatsApp | `https://raw.githubusercontent.com/Bluetrae/WProxyRules/main/Surge/WhatsApp.list` |
| LINE | `https://raw.githubusercontent.com/Bluetrae/WProxyRules/main/Surge/LINE.list` |
| GitHub | `https://raw.githubusercontent.com/Bluetrae/WProxyRules/main/Surge/GitHub.list` |
| SafePal | `https://raw.githubusercontent.com/Bluetrae/WProxyRules/main/Surge/SafePal.list` |

示例：在 Surge 主配置的 `[Rule]` 中以 `RULE-SET,<URL>,<策略>` 形式为每个 Rule-Set 指定策略名称。

```ini
RULE-SET,https://raw.githubusercontent.com/Bluetrae/WProxyRules/main/Surge/OKX.list,Finance
RULE-SET,https://raw.githubusercontent.com/Bluetrae/WProxyRules/main/Surge/WhatsApp.list,Proxy
RULE-SET,https://raw.githubusercontent.com/Bluetrae/WProxyRules/main/Surge/LINE.list,Proxy
RULE-SET,https://raw.githubusercontent.com/Bluetrae/WProxyRules/main/Surge/GitHub.list,GitHub
```

生成的 list 不包含策略名；策略始终由你的 Surge 主配置决定。

若你此前直接引用 blackmatrix7 的 WhatsApp、LINE、GitHub Rule-Set，切换时请用本仓库对应 URL **替换**原有的同类 Rule-Set，不要同时叠加两份来源。OKX 当前输出已覆盖原来单独维护的 `okx.ac`、`okx.cab`、`okx.com.cdn.cloudflare.net` 与 `xlayer.tech`，切换后同样不需要保留这四条手工规则。

## 自动更新

GitHub Actions 工作流位于 [`.github/workflows/update.yml`](.github/workflows/update.yml)。它可手动运行，并会在每日北京时间约 02:17 定时运行：

1. 读取 `sources/apps.yaml` 中启用的 App 与上游来源；
2. 以保守语义解析 v2fly domain-list；
3. 只展开 manifest 明确允许的 include，拒绝明确禁止的 include；
4. 合并存在且经验证的 supplement；
5. 规范化、去重、排序并生成 `Surge/*.list`；
6. 仅当 `Surge/` 实际变化时，由 `github-actions[bot]` 提交生成结果。

上游格式异常、未声明 include、include 循环、无法安全转换的规则或无效 supplement 都会使构建失败，而不是静默改变分流语义。

## 规则与来源原则

- `Surge/*.list` 是 generated files，绝不手工修改。
- 每个 App 默认 1 个 primary source，最多 1 个 supplemental source；不追求为了数量而合并多个来源。
- source 的长期偏好是 Repcz > SukkaW > 其他长期验证作者 > v2fly / MetaCubeX，但 freshness、覆盖、范围精准性、格式适配性和维护质量优先于作者排序。
- 当前 OKX、WhatsApp、LINE、GitHub 是 pipeline 验证样本，不限制仓库将来支持的 App 范围。
- Reject、Domestic、China IP、CDN、LAN 等基础设施规则继续引用成熟上游，不纳入本仓库。

详细规范与来源决策记录见 [AGENTS.md](AGENTS.md) 和 [CODEX_HANDOFF.md](CODEX_HANDOFF.md)。

## supplement 的使用

`sources/supplement/<App>.list` 只用于：已通过 Surge 日志或实际使用确认、且选定上游确实缺失的 App 规则。

没有补充规则时不创建空文件。不要把上游已有条目、机场订阅 URL、token、密码、证书或其他敏感信息放入仓库。

推荐流程：

```text
Surge 日志发现漏网
→ 确认属于哪个 App
→ 与选定上游比较并确认缺失
→ sources/supplement/<App>.list
→ 重新构建
→ 由 Actions 发布更新
```

## 本地验证与构建

Python 仅依赖 [requirements.txt](requirements.txt) 中锁定的 PyYAML；其余使用标准库。

```powershell
python -m pip install -r requirements.txt
python scripts/build.py
python -m unittest discover -s tests -v
```

`python scripts/build.py` 是只读预检。只有在明确需要本地写入生成文件时才运行：

```powershell
python scripts/build.py --write
```

提交前请检查生成差异，不要手工编辑 `Surge/*.list`。
