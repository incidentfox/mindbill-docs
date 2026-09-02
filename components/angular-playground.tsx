"use client";

import { useEffect, useRef, useState } from "react";
// CodeBlock is an async server component (shiki) and cannot render inside a
// client tree, so the playground ships a light client-safe code panel instead.
function PlainCode({ code, filename }: { code: string; filename: string }) {
  return (
    <div className="code-block" data-code-language="ts">
      <div className="code-toolbar"><span>{filename}</span></div>
      <pre className="angular-playground-pre"><code>{code.trim()}</code></pre>
    </div>
  );
}

// Live Angular playgrounds. The demo site publishes an Angular Elements bundle
// (built from @mindbill/angular) with CORS-open assets; loading it registers
// every mindbill-* component as a real custom element, so these previews render
// the ACTUAL Angular components — same code partners install — not mockups.
// Complex inputs are assigned as element properties; outputs arrive as
// CustomEvents whose detail is the emitted value.
const DEMO_ORIGIN =
  process.env.NEXT_PUBLIC_ANGULAR_DEMO_ORIGIN ?? "https://codexangular-clinical-demo.vercel.app";
const ELEMENTS_SRC = `${DEMO_ORIGIN}/elements/main.js`;

let elementsLoader: Promise<void> | null = null;
function loadElements(): Promise<void> {
  if (!elementsLoader) {
    elementsLoader = new Promise<void>((resolve, reject) => {
      if ((window as { mindbillElementsReady?: boolean }).mindbillElementsReady) return resolve();
      const script = document.createElement("script");
      script.type = "module";
      script.src = ELEMENTS_SRC;
      script.onerror = () => reject(new Error("The Angular components bundle could not be loaded."));
      window.addEventListener("mindbill-elements-ready", () => resolve(), { once: true });
      document.head.appendChild(script);
      setTimeout(() => reject(new Error("Timed out loading the Angular components bundle.")), 20000);
    });
  }
  return elementsLoader;
}

export type AngularLiveProps = {
  name: string;
  tag: string;
  code: string;
  height?: number;
  label?: string;
  /** Assigned onto the custom element as PROPERTIES (bills, appearance, …). */
  props?: Record<string, unknown>;
  /** CustomEvent listeners: output name → handler(detail, element). */
  events?: Record<string, (detail: unknown, element: HTMLElement) => void>;
};

export function AngularPlayground({ name, tag, code, height = 560, label = "Live Angular component · synthetic data", props, events }: AngularLiveProps) {
  const host = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");

  useEffect(() => {
    let alive = true;
    let element: HTMLElement | null = null;
    const listeners: Array<[string, EventListener]> = [];
    loadElements()
      .then(() => {
        if (!alive || !host.current) return;
        element = document.createElement(tag);
        Object.assign(element, props ?? {});
        for (const [event, handler] of Object.entries(events ?? {})) {
          const listener = ((raw: CustomEvent) => handler(raw.detail, element!)) as EventListener;
          element.addEventListener(event, listener);
          listeners.push([event, listener]);
        }
        host.current.replaceChildren(element);
        setState("ready");
      })
      .catch(() => alive && setState("failed"));
    return () => {
      alive = false;
      listeners.forEach(([event, listener]) => element?.removeEventListener(event, listener));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tag]);

  return (
    <div className="playground-shell" data-copy-page-ignore>
      <div className="playground-title">
        <span>{name}</span>
        <small>{label}</small>
      </div>
      <div className="angular-playground-grid">
        <div className="angular-playground-code">
          <PlainCode code={code} filename={`${tag}.component.ts`} />
        </div>
        <div className="angular-playground-preview" style={{ maxHeight: height }}>
          {state === "loading" ? <p className="angular-playground-status">Loading the live Angular component…</p> : null}
          {state === "failed" ? (
            <p className="angular-playground-status">
              The live preview could not load the Angular bundle. The example app at{" "}
              <a href={DEMO_ORIGIN} target="_blank" rel="noreferrer">{DEMO_ORIGIN.replace("https://", "")}</a>{" "}
              shows the same components running.
            </p>
          ) : null}
          <div ref={host} />
        </div>
      </div>
    </div>
  );
}
