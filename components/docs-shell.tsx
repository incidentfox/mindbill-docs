"use client";

import { Code2, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { navigation, navigationGroups } from "@/lib/navigation";
import { SearchDialog } from "./search-dialog";
import { ThemeToggle } from "./theme-toggle";

export function DocsShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const sidebar = (
    <nav className="sidebar-nav" aria-label="Documentation">
      {navigationGroups.map((group) => (
        <section key={group}>
          <h2>{group}</h2>
          {navigation.filter((item) => item.group === group).map((item) => {
            const active = pathname === item.href.split("#")[0];
            return <Link key={item.href} className={active ? "active" : ""} href={item.href} onClick={() => setMobileOpen(false)}>{item.label}</Link>;
          })}
        </section>
      ))}
    </nav>
  );

  return (
    <div className="docs-app">
      <header className="topbar">
        <div className="topbar-inner">
          <button className="mobile-menu-button" type="button" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu size={20} /></button>
          <Link className="wordmark" href="/" aria-label="MindBill documentation">
            <Image src="/mindbill-logo.svg" alt="MindBill" width={116} height={39} priority />
            <i>docs</i>
          </Link>
          <SearchDialog />
          <nav className="top-links" aria-label="Primary">
            <Link className={pathname === "/" || pathname.startsWith("/learn") || pathname.startsWith("/guides") ? "active" : ""} href="/learn/workers-comp-billing">Learn</Link>
            <Link className={pathname.startsWith("/components") ? "active" : ""} href="/components/react">Components</Link>
            <Link className={pathname.startsWith("/api-reference") ? "active" : ""} href="/api-reference">API</Link>
          </nav>
          <ThemeToggle />
          <a className="icon-button" href="https://github.com/incidentfox/mindbill-docs" aria-label="MindBill docs on GitHub"><Code2 size={19} /></a>
        </div>
      </header>
      <aside className="desktop-sidebar">{sidebar}</aside>
      {mobileOpen ? (
        <div className="mobile-nav-overlay" onMouseDown={() => setMobileOpen(false)}>
          <aside className="mobile-nav" role="dialog" aria-modal="true" aria-label="Documentation navigation" onMouseDown={(event) => event.stopPropagation()}>
            <div><Link className="wordmark" href="/" aria-label="MindBill documentation"><Image src="/mindbill-logo.svg" alt="MindBill" width={116} height={39} /><i>docs</i></Link><button className="icon-button" type="button" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X size={20} /></button></div>
            {sidebar}
          </aside>
        </div>
      ) : null}
      <main className="docs-main">{children}</main>
    </div>
  );
}
