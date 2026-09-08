"use client";

import { createContext, useContext, useId, useState, type ReactNode } from "react";

type Framework = "React" | "Angular";
const FrameworkContext = createContext<{ framework: Framework; select: (value: Framework) => void } | null>(null);

export function QuickstartFramework({ children }: { children: ReactNode }) {
  const [framework, select] = useState<Framework>("React");
  return <FrameworkContext.Provider value={{ framework, select }}>{children}</FrameworkContext.Provider>;
}

/** Server-rendered highlighted snippets, with a shared frontend choice across steps. */
export function QuickstartTabs({ label, tabs, shared = false }: {
  label: string;
  tabs: { label: string; content: ReactNode }[];
  shared?: boolean;
}) {
  const id = useId();
  const context = useContext(FrameworkContext);
  const [local, setLocal] = useState(tabs[0].label);
  const selected = shared && context ? context.framework : local;
  function select(value: string) {
    if (shared && context) context.select(value as Framework);
    else setLocal(value);
  }
  return <div className="quickstart-tabs">
    <div role="tablist" aria-label={label} data-copy-page-ignore>
      {tabs.map((tab, index) => <button key={tab.label} type="button" role="tab"
        id={`${id}-tab-${index}`} aria-controls={`${id}-panel-${index}`}
        aria-selected={selected === tab.label} tabIndex={selected === tab.label ? 0 : -1}
        onClick={() => select(tab.label)}
        onKeyDown={(event) => {
          const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
          if (!keys.includes(event.key)) return;
          event.preventDefault();
          const next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1
            : (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
          select(tabs[next].label);
          document.getElementById(`${id}-tab-${next}`)?.focus();
        }}>{tab.label}</button>)}
    </div>
    {tabs.map((tab, index) => <div key={tab.label} role="tabpanel" tabIndex={0}
      id={`${id}-panel-${index}`} aria-labelledby={`${id}-tab-${index}`}
      hidden={selected !== tab.label} data-copy-page-ignore={selected !== tab.label ? "" : undefined}>
      {tab.content}
    </div>)}
  </div>;
}
