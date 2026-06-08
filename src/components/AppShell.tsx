import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

interface AppShellProps {
  breadcrumbs: { label: string; to?: string }[];
  children: ReactNode;
}

export function AppShell({ breadcrumbs, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-surface-base font-sans text-slate-900">
      <nav className="sticky top-0 z-10 border-b border-slate-200 bg-surface-card px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
              <span className="inline-block size-2.5 rounded-full bg-brand-primary" />
              <span className="text-brand-secondary">Client</span><span className="text-slate-400 font-semibold">360</span>
            </Link>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              {breadcrumbs.map((b, i) => (
                <span key={i} className="flex items-center gap-2">
                  {i > 0 && <span className="text-slate-300">/</span>}
                  {b.to ? (
                    <Link to={b.to} className="hover:text-slate-900">
                      {b.label}
                    </Link>
                  ) : (
                    <span className="text-slate-900">{b.label}</span>
                  )}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <nav className="hidden gap-1 text-sm font-medium text-slate-500 md:flex">
              <Link to="/" className="rounded px-3 py-1.5 hover:bg-slate-50">Clients</Link>
              <a className="rounded px-3 py-1.5 hover:bg-slate-50" href="#">Pricing</a>
              <a className="rounded px-3 py-1.5 hover:bg-slate-50" href="#">Invoices</a>
              <a className="rounded px-3 py-1.5 hover:bg-slate-50" href="#">Reports</a>
            </nav>
            <div className="size-8 rounded-full bg-slate-100 outline-1 -outline-offset-1 outline-black/5" />
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl p-8">{children}</main>
    </div>
  );
}
