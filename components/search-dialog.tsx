"use client";

import { Command, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { navigation } from "@/lib/navigation";

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) window.requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return navigation;
    return navigation.filter((item) =>
      [item.label, item.description, item.group, ...item.keywords]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [query]);

  function visit(href: string) {
    setQuery("");
    setOpen(false);
    router.push(href);
  }

  function close() {
    setQuery("");
    setOpen(false);
  }

  return (
    <>
      <button className="search-trigger" type="button" onClick={() => setOpen(true)}>
        <Search size={17} />
        <span>Search docs</span>
        <kbd><Command size={12} /> K</kbd>
      </button>
      {open ? (
        <div className="search-overlay" role="presentation" onMouseDown={close}>
          <div className="search-panel" role="dialog" aria-modal="true" aria-label="Search documentation" onMouseDown={(event) => event.stopPropagation()}>
            <div className="search-input-wrap">
              <Search size={19} />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search guides, components, and API"
                aria-label="Search documentation"
              />
              <button className="icon-button" type="button" onClick={close} aria-label="Close search"><X size={18} /></button>
            </div>
            <div className="search-results">
              {results.length ? results.map((item) => {
                const Icon = item.icon;
                return (
                  <button key={item.href} type="button" onClick={() => visit(item.href)}>
                    <Icon size={19} />
                    <span><strong>{item.label}</strong><small>{item.description}</small></span>
                    <em>{item.group}</em>
                  </button>
                );
              }) : <p className="empty-search">No matching documentation.</p>}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
