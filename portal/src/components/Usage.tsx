import { useMemo, type ReactNode } from "react";
import type { PortalData } from "../types";
import { CATEGORY_LABELS, CATEGORY_ORDER, ruleSetLine, sortedApps } from "../data";
import CodeBlock from "./CodeBlock";
import Reveal from "./Reveal";

const STEPS: ReactNode[] = [
  <>打开 Surge 主配置，找到 <code>[Rule]</code> 段。</>,
  <>复制下面的规则行，放在 <code>FINAL</code> 之前。</>,
  <>把策略名换成你自己的，保存并重载配置。</>,
];

export default function Usage({ data }: { data: PortalData }) {
  const lines = useMemo(() => {
    const out: string[] = [];
    for (const category of CATEGORY_ORDER) {
      const group = sortedApps(data.apps).filter((app) => app.category === category);
      if (group.length === 0) continue;
      out.push(`# ${CATEGORY_LABELS[category] ?? category}`);
      for (const app of group) out.push(ruleSetLine(data.raw_base, app));
      out.push("");
    }
    return out.join("\n").replace(/\n+$/, "");
  }, [data]);

  return (
    <section id="usage" className="scroll-mt-16 px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <Reveal>
          <div className="mx-auto mb-10 max-w-xl text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">在 Surge 中使用</h2>
            <p className="mt-2.5 text-mute">三步接入，之后无需再改主配置。</p>
          </div>
        </Reveal>
        <Reveal>
          <ol className="mx-auto mb-8 flex max-w-4xl flex-wrap justify-center gap-3">
            {STEPS.map((step, index) => (
              <li
                key={index}
                className="relative flex-1 basis-56 max-w-80 rounded-2xl border border-line bg-paper py-4 pl-13 pr-4 text-sm"
              >
                <span className="absolute left-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-[13px] font-semibold text-white">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </Reveal>
        <Reveal>
          <CodeBlock file="全部 Rule-Sets · 按分类分组" copyText={lines} copyLabel="复制全部" maxHeight>
            {lines}
          </CodeBlock>
          <p className="mt-4 text-center text-[13.5px] text-mute">
            规则文件不携带策略名：<code>RULE-SET</code> 的最后一个字段始终由你的 Surge
            主配置决定。
          </p>
        </Reveal>
      </div>
    </section>
  );
}
