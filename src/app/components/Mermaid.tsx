import React, { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

mermaid.initialize({
  startOnLoad: false,
  theme: "base",
  fontFamily: "'Noto Sans JP', sans-serif",
  themeVariables: {
    primaryColor: "#FFFFFF",
    primaryTextColor: "#111827",
    primaryBorderColor: "#E5E7EB",
    lineColor: "#9CA3AF",
    secondaryColor: "#F3F4F6",
    tertiaryColor: "#FAFAFA",
    fontSize: "14px",
  },
  flowchart: {
    htmlLabels: true,
    curve: "basis",
    nodeSpacing: 40,
    rankSpacing: 50,
    padding: 12,
  },
});

let counter = 0;

export function Mermaid({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [err, setErr] = useState<string | null>(null);
  const id = useRef(`m-${++counter}`);

  useEffect(() => {
    let cancelled = false;
    setErr(null);
    mermaid
      .render(id.current, chart)
      .then(({ svg }) => {
        if (!cancelled && ref.current) {
          ref.current.innerHTML = svg;
        }
      })
      .catch((e) => {
        if (!cancelled) setErr(String(e?.message || e));
      });
    return () => { cancelled = true; };
  }, [chart]);

  if (err) {
    return (
      <pre style={{ fontSize: "11px", color: "#DC2626", background: "#FEF2F2", padding: "8px 12px", borderRadius: 6, overflowX: "auto" }}>{err}</pre>
    );
  }
  return <div ref={ref} className="mermaid-container flex justify-center" />;
}
