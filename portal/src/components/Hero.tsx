import CodeBlock from "./CodeBlock";

interface HeroProps {
  appsCount: number;
  totalRules: number;
}

const EXAMPLE_LINE =
  "RULE-SET,https://raw.githubusercontent.com/Bluetrae/Rulink/main/Surge/YouTube.list,Proxy";

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <li className="flex min-w-36 max-w-52 flex-1 flex-col gap-0.5 rounded-2xl border border-line bg-paper px-5 py-4">
      <strong className="text-lg font-bold tracking-tight">{value}</strong>
      <span className="text-[13px] text-mute">{label}</span>
    </li>
  );
}

export default function Hero({ appsCount, totalRules }: HeroProps) {
  return (
    <section id="top" className="hero-bg px-6 pb-16 pt-20 text-center sm:pt-24">
      <p className="mx-auto mb-5 inline-block rounded-full border border-[#dfe5ff] bg-accent-soft px-3.5 py-1 text-[13px] font-semibold tracking-wide text-accent">
        Surge App Rule-Set · 自动构建 · 稳定分发
      </p>
      <h1 className="mx-auto max-w-3xl text-[32px] font-bold leading-[1.2] tracking-tight sm:text-5xl">
        经过审计的 App 规则，
        <br className="hidden sm:block" />
        <span className="bg-gradient-to-r from-accent to-[#8b5cf6] bg-clip-text text-transparent">
          一个稳定入口
        </span>
        接入 Surge
      </h1>
      <p className="mx-auto mt-5 max-w-xl text-base text-mute">
        Rulink 每日从可信上游保守转换 App 专用规则，通过本仓库的固定 URL
        发布。主配置只需引用一次，之后由这里自动保持更新。
      </p>
      <div className="mt-7 flex justify-center gap-3">
        <a
          href="#usage"
          className="rounded-[9px] bg-accent px-5 py-2.5 text-[15px] font-medium text-white transition hover:bg-accent-strong"
        >
          开始使用
        </a>
        <a
          href="#rulesets"
          className="rounded-[9px] border border-line bg-white px-5 py-2.5 text-[15px] font-medium text-ink transition hover:bg-paper"
        >
          查看规则集
        </a>
      </div>
      <div className="mx-auto mt-11 max-w-2xl">
        <CodeBlock file="Surge 主配置 · [Rule]" copyText={EXAMPLE_LINE}>
          <span className="text-white/40"># 一行接入，策略名由你自己决定{"\n"}</span>
          <span className="text-[#8ab4ff]">RULE-SET</span>
          ,https://raw.githubusercontent.com/Bluetrae/Rulink/main/Surge/YouTube.list,
          <span className="text-[#7ee2a8]">Proxy</span>
        </CodeBlock>
      </div>
      <ul className="mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-3">
        <Stat value={String(appsCount)} label="Rule-Sets" />
        <Stat value={String(totalRules)} label="有效规则" />
        <Stat value="每日 00:01" label="自动检查上游" />
        <Stat value="审计准入" label="Repcz · SukkaW 优先" />
      </ul>
    </section>
  );
}
