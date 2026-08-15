import CodeBlock from "./CodeBlock";

interface HeroProps {
  appsCount: number;
  totalRules: number;
}

const EXAMPLE_LINE =
  "RULE-SET,https://raw.githubusercontent.com/Bluetrae/Rulink/main/Surge/YouTube.list,Proxy";

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <li className="flex flex-col gap-0.5 rounded-2xl border border-line bg-paper px-5 py-4 sm:max-w-52 sm:flex-1">
      <strong className="text-lg font-bold tracking-tight">{value}</strong>
      <span className="text-[13px] text-mute">{label}</span>
    </li>
  );
}

export default function Hero({ appsCount, totalRules }: HeroProps) {
  return (
    <section id="top" className="hero-bg px-6 pb-16 pt-24 text-center sm:pt-28">
      <p
        className="hero-enter mx-auto mb-5 inline-block rounded-full border border-accent-soft bg-accent-soft px-3.5 py-1 text-[13px] font-semibold tracking-wide text-accent"
        style={{ animationDelay: "0ms" }}
      >
        多客户端 App Rule-Set · 自动构建 · 稳定分发
      </p>
      <h1
        className="hero-enter mx-auto max-w-3xl text-[clamp(2rem,5.2vw,3.25rem)] font-bold leading-[1.2] tracking-tight"
        style={{ animationDelay: "70ms" }}
      >
        经过审计的 App 规则，
        <br className="hidden sm:block" />
        <span className="bg-gradient-to-r from-accent to-[#8b5cf6] bg-clip-text text-transparent">
          一套规则
        </span>
        ，五个客户端
      </h1>
      <p
        className="hero-enter mx-auto mt-5 max-w-xl text-base text-mute"
        style={{ animationDelay: "140ms" }}
      >
        Rulink 每日从可信上游保守转换 App 专用规则，一份 canonical 规则渲染为
        Surge / Shadowrocket / Loon / Stash / Egern 五种输出。主配置只需引用一次，
        之后由这里自动保持更新。
      </p>
      <div className="hero-enter mt-7 flex justify-center gap-3" style={{ animationDelay: "210ms" }}>
        <span className="rotating-border inline-block rounded-full p-[1.5px]">
          <a
            href="#usage"
            className="inline-block rounded-full bg-accent px-6 py-2.5 text-[15px] font-medium text-white transition-colors hover:bg-accent-strong"
          >
            开始使用
          </a>
        </span>
        <a
          href="#rulesets"
          className="rounded-full border border-line bg-card px-6 py-2.5 text-[15px] font-medium text-ink transition hover:bg-paper"
        >
          查看规则集
        </a>
      </div>
      <div className="hero-enter mx-auto mt-11 max-w-2xl" style={{ animationDelay: "280ms" }}>
        <CodeBlock file="Surge 主配置 · [Rule]" copyText={EXAMPLE_LINE}>
          <span className="text-white/40"># 一行接入，策略名由你自己决定{"\n"}</span>
          <span className="text-[#8ab4ff]">RULE-SET</span>
          ,https://raw.githubusercontent.com/Bluetrae/Rulink/main/Surge/YouTube.list,
          <span className="text-[#7ee2a8]">Proxy</span>
        </CodeBlock>
      </div>
      <ul
        className="hero-enter mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:justify-center"
        style={{ animationDelay: "350ms" }}
      >
        <Stat value={String(appsCount)} label="Rule-Sets" />
        <Stat value={String(totalRules)} label="有效规则" />
        <Stat value="5 客户端" label="Surge · Loon · Stash · Egern" />
        <Stat value="每日 00:01" label="自动检查上游" />
        <Stat value="审计准入" label="Repcz · SukkaW 优先" />
      </ul>
    </section>
  );
}
