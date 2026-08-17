import { useMemo, useState, type ReactNode } from "react";
import type { ClientKey, PortalData } from "../types";
import { allSnippets, CLIENT_TABS, clientIcon, clientTab } from "../data";
import CodeBlock from "./CodeBlock";
import Reveal from "./Reveal";

const STEPS: Record<ClientKey, ReactNode[]> = {
  surge: [
    <>
      打开 Surge 主配置，找到 <code>[Rule]</code> 段。
    </>,
    <>
      复制下面的规则行，放在 <code>FINAL</code> 之前。
    </>,
    <>把策略名换成你自己的，保存并重载配置。</>,
  ],
  shadowrocket: [
    <>
      打开 Shadowrocket 配置的 <code>[Rule]</code> 段（语法与 Surge 相同）。
    </>,
    <>
      复制下面的规则行，放在 <code>FINAL</code> 之前。
    </>,
    <>把策略名换成你自己的，保存并使用配置。</>,
  ],
  loon: [
    <>
      打开 Loon 配置，找到 <code>[Remote Rule]</code> 段。
    </>,
    <>复制下面的规则行，一行一个 App。</>,
    <>
      把 <code>policy</code> 换成你自己的策略组，保存并重载配置。
    </>,
  ],
  stash: [
    <>
      打开 Stash 配置，把下面整段复制进 <code>rule-providers</code> 与 <code>rules</code>。
    </>,
    <>
      把每个 <code>RULE-SET</code> 行放在 <code>MATCH</code>/<code>FINAL</code> 之前合适的位置。
    </>,
    <>
      策略名换成你自己的；<code>interval: 86400</code> 控制规则集更新周期。
    </>,
  ],
  clash: [
    <>
      打开 Clash 配置（Clash Meta for Android / FLClash，Mihomo 内核），把下面整段复制进{" "}
      <code>rule-providers</code> 与 <code>rules</code>。
    </>,
    <>
      把每个 <code>RULE-SET</code> 行放在 <code>MATCH</code> 之前合适的位置；规则经 Clash/ 目录分发
      （USER-AGENT 已显式去除）。
    </>,
    <>
      策略名换成你自己的；<code>interval: 86400</code> 控制规则集更新周期。
    </>,
  ],
  egern: [
    <>
      打开 Egern 配置，把下面整段复制进 <code>rules</code> 列表。
    </>,
    <>
      按你的匹配顺序放置 <code>rule_set</code> 条目，<code>default</code> 之前。
    </>,
    <>
      把 <code>policy</code> 换成你自己的策略组。
    </>,
  ],
  quantumultx: [
    <>
      打开 Quantumult X 配置，把下面整段复制进 <code>[filter_remote]</code> 段。
    </>,
    <>
      一行一个 App；行尾的 <code>policy</code> 是占位符，实际策略由 <code>force-policy</code> 指定。
    </>,
    <>
      把 <code>force-policy</code> 换成你自己的策略组，<code>update-interval</code> 控制更新周期。
    </>,
  ],
};

export default function Usage({ data }: { data: PortalData }) {
  const [client, setClient] = useState<ClientKey>("surge");
  const tab = clientTab(client);
  const lines = useMemo(() => allSnippets(data, client), [data, client]);

  return (
    <section id="usage" className="scroll-mt-24 px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <Reveal>
          <div className="mx-auto mb-10 max-w-xl text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">接入你的客户端</h2>
            <p className="mt-2.5 text-mute">同一套规则，七种客户端各自的最小引用方式。</p>
          </div>
        </Reveal>
        <Reveal>
          <div className="mb-6 flex flex-wrap justify-center gap-2.5">
            {CLIENT_TABS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setClient(item.key)}
                title={item.badge}
                className={`inline-flex items-center gap-2 rounded-full border px-5 py-2 text-[13.5px] font-medium transition-all duration-200 ease-out active:scale-[0.96] ${
                  client === item.key
                    ? "border-accent bg-accent text-white shadow-sm hover:shadow-md hover:shadow-accent/30"
                    : "border-line bg-card text-mute hover:-translate-y-0.5 hover:border-line-strong hover:text-ink active:translate-y-0"
                }`}
              >
                <img
                  src={clientIcon(item.key)}
                  alt=""
                  width={18}
                  height={18}
                  className="h-[18px] w-[18px] rounded-[5px] object-cover"
                />
                {item.label}
              </button>
            ))}
          </div>
        </Reveal>
        <Reveal>
          <ol className="mx-auto mb-8 flex max-w-4xl flex-wrap justify-center gap-3">
            {STEPS[client].map((step, index) => (
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
          <CodeBlock file={tab.fileLabel} copyText={lines} copyLabel="复制全部" maxHeight>
            {lines}
          </CodeBlock>
          <p className="mt-4 text-center text-[13.5px] text-mute">{tab.note}</p>
        </Reveal>
      </div>
    </section>
  );
}
