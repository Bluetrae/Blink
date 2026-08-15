import { useEffect, useState } from "react";
import type { PortalData } from "./types";
import { useTimedTheme } from "./hooks";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Rulesets from "./components/Rulesets";
import Usage from "./components/Usage";
import About from "./components/About";
import Footer from "./components/Footer";

const FALLBACK_REPO = "https://github.com/Bluetrae/Rulink";

export default function App() {
  useTimedTheme();
  const [data, setData] = useState<PortalData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("data/stats.json")
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<PortalData>;
      })
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <Nav repo={data?.repo ?? FALLBACK_REPO} />
      <main>
        {error ? (
          <section className="px-6 py-24 text-center">
            <h1 className="text-2xl font-bold">规则数据加载失败</h1>
            <p className="mt-3 text-mute">
              {error} · 请直接查看{" "}
              <a
                className="text-accent underline underline-offset-2"
                href="https://github.com/Bluetrae/Rulink"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub 上的生成目录
              </a>
            </p>
          </section>
        ) : data ? (
          <>
            <Hero
              appsCount={data.apps.length}
              totalRules={data.apps.reduce((sum, app) => sum + app.rules, 0)}
            />
            <Rulesets data={data} />
            <Usage data={data} />
            <About repo={data.repo} />
          </>
        ) : (
          <section className="px-6 py-24 text-center text-mute">正在加载规则数据…</section>
        )}
      </main>
      <Footer repo={data?.repo ?? FALLBACK_REPO} />
    </>
  );
}
