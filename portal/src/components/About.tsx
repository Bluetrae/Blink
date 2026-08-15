import Reveal from "./Reveal";

interface AboutProps {
  repo: string;
}

const PIPELINE = [
  { title: "Source audit", text: "每个 App 记录候选、证据与结论" },
  { title: "build.py", text: "解析 / 转换 / 规范化 / 去重，异常即中止" },
  { title: "supplement", text: "只合并经 Surge 日志证实的上游缺口" },
  { title: "Surge/*.list", text: "全部 App 成功后才原子写入" },
  { title: "稳定 raw URL", text: "主配置引用一次，自动保持更新" },
];

export default function About({ repo }: AboutProps) {
  return (
    <section id="about" className="scroll-mt-16 px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <div className="mx-auto mb-10 max-w-xl text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">构建与来源</h2>
            <p className="mt-2.5 text-mute">
              每个 App 先审计、后转换；构建显式失败，而不是静默改变规则语义。
            </p>
          </div>
        </Reveal>
        <div className="grid gap-4 md:grid-cols-2">
          <Reveal className="h-full">
            <div className="h-full rounded-2xl border border-line bg-paper p-6">
              <h3 className="mb-4 text-base font-bold">构建管线</h3>
              <ol className="flex flex-wrap items-stretch gap-2">
                {PIPELINE.map((step, index) => (
                  <li
                    key={step.title}
                    className="flex flex-1 basis-40 flex-col gap-1 rounded-xl border border-line bg-white p-3"
                  >
                    <span className="text-[11px] font-semibold tracking-wide text-accent">
                      STEP {index + 1}
                    </span>
                    <strong className="text-sm font-semibold">{step.title}</strong>
                    <span className="text-xs leading-relaxed text-mute">{step.text}</span>
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>
          <Reveal className="h-full">
            <div className="h-full rounded-2xl border border-line bg-paper p-6">
              <h3 className="mb-4 text-base font-bold">来源原则</h3>
              <ul className="space-y-3">
                <li className="relative pl-5 text-sm">
                  <span className="absolute left-0 top-2 h-1.5 w-1.5 rounded-[2px] bg-accent" />
                  优先梯队：Repcz → SukkaW → 长期验证的维护者 → v2fly / MetaCubeX，证据优先于偏好。
                </li>
                <li className="relative pl-5 text-sm">
                  <span className="absolute left-0 top-2 h-1.5 w-1.5 rounded-[2px] bg-accent" />
                  每个 App 默认 1 个主源、最多 1 个补充源；补充规则只收录经 Surge 日志确认的缺口。
                </li>
                <li className="relative pl-5 text-sm">
                  <span className="absolute left-0 top-2 h-1.5 w-1.5 rounded-[2px] bg-accent" />
                  Reject / 国内分流 / CDN / LAN 等基础设施不纳入，继续直接引用成熟上游。
                </li>
                <li className="relative pl-5 text-sm">
                  <span className="absolute left-0 top-2 h-1.5 w-1.5 rounded-[2px] bg-accent" />
                  生成产物不附统一许可证，使用前请查看{" "}
                  <a href={`${repo}/blob/main/THIRD_PARTY_NOTICES.md`} target="_blank" rel="noopener noreferrer">
                    第三方声明
                  </a>{" "}
                  与{" "}
                  <a href={`${repo}/blob/main/DISCLAIMER.md`} target="_blank" rel="noopener noreferrer">
                    免责说明
                  </a>。
                </li>
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
