import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  Users,
  Truck,
  Package,
  Tag,
  Settings,
  Search,
  Bell,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Gauge,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  match?: (pathname: string) => boolean;
}

const primary: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: Gauge, match: (p) => p === "/" || p.startsWith("/dashboard") },
  { to: "/clients", label: "Clients", icon: Users, match: (p) => p === "/clients" || p.startsWith("/clients/") },
  { to: "/invoices", label: "Invoices", icon: FileText, match: (p) => p.startsWith("/invoices") },
];

const master: NavItem[] = [
  { to: "/master/carriers", label: "Carriers", icon: Truck },
  { to: "/master/products", label: "Products", icon: Package },
  { to: "/master/pricing", label: "Pricing", icon: Tag },
  { to: "/master/admin", label: "Admin Center", icon: ShieldCheck },
];

interface ShellProps {
  breadcrumbs?: { label: string; to?: string }[];
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

function useCollapsed() {
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    try {
      const v = localStorage.getItem("nav-collapsed");
      if (v === "1") setCollapsed(true);
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem("nav-collapsed", collapsed ? "1" : "0"); } catch {}
  }, [collapsed]);
  return [collapsed, setCollapsed] as const;
}

export function AppShell({ breadcrumbs, title, subtitle, actions, children }: ShellProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [collapsed, setCollapsed] = useCollapsed();

  return (
    <div className="flex min-h-screen bg-surface-base font-sans text-slate-900">
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-slate-200 bg-white transition-[width] duration-200 lg:flex",
          collapsed ? "w-16" : "w-60",
        )}
      >
        <div className={cn("flex h-14 items-center gap-2 border-b border-slate-100", collapsed ? "justify-center px-2" : "px-5")}>
          <span className="grid size-7 shrink-0 place-items-center rounded-md bg-brand-secondary text-white">
            <LayoutDashboard className="size-4" />
          </span>
          {!collapsed && (
            <div className="leading-tight">
              <div className="text-sm font-bold text-brand-secondary">Client360</div>
              <div className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Operations Suite</div>
            </div>
          )}
        </div>

        <nav className={cn("flex-1 overflow-y-auto py-4 text-sm", collapsed ? "px-2" : "px-3")}>
          {!collapsed && <SectionLabel>Workspace</SectionLabel>}
          <ul className="space-y-0.5">
            {primary.map((item) => (
              <NavLink key={item.to} item={item} active={item.match ? item.match(pathname) : pathname.startsWith(item.to)} collapsed={collapsed} />
            ))}
          </ul>

          {!collapsed && <SectionLabel className="mt-6">Master Management</SectionLabel>}
          {collapsed && <div className="my-3 border-t border-slate-100" />}
          <ul className="space-y-0.5">
            {master.map((item) => (
              <NavLink key={item.to} item={item} active={pathname.startsWith(item.to)} collapsed={collapsed} />
            ))}
          </ul>
        </nav>

        <div className="border-t border-slate-100 p-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-50",
              collapsed && "justify-center px-0",
            )}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronsRight className="size-4" /> : <><ChevronsLeft className="size-4" /> Collapse</>}
          </button>
          {!collapsed && (
            <button className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
              <Settings className="size-4" /> Settings
            </button>
          )}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-slate-200 bg-white/80 px-6 backdrop-blur">
          <div className="flex flex-1 items-center gap-2 text-sm text-slate-500">
            {breadcrumbs?.map((b, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && <ChevronRight className="size-3.5 text-slate-300" />}
                {b.to ? (
                  <Link to={b.to} className="hover:text-slate-900">{b.label}</Link>
                ) : (
                  <span className="font-medium text-slate-900">{b.label}</span>
                )}
              </span>
            ))}
          </div>
          <div className="relative hidden md:block">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Quick search…"
              className="h-9 w-64 rounded-lg border border-slate-200 bg-slate-50/60 pl-8 pr-3 text-sm outline-none transition-colors focus:border-brand-primary focus:bg-white"
            />
          </div>
          <button className="relative grid size-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100">
            <Bell className="size-4" />
            <span className="absolute right-2 top-2 size-1.5 rounded-full bg-brand-primary" />
          </button>
          <div className="grid size-8 place-items-center rounded-full bg-brand-secondary text-xs font-semibold text-white">MC</div>
        </header>

        {(title || actions) && (
          <div className="border-b border-slate-200 bg-white px-6 py-5">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
              <div className="min-w-0">
                {title && <h1 className="truncate text-2xl font-bold tracking-tight text-slate-900">{title}</h1>}
                {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
              </div>
              {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
            </div>
          </div>
        )}

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

function SectionLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("px-3 pb-1.5 pt-2 text-[10px] font-bold uppercase tracking-wider text-slate-400", className)}>
      {children}
    </div>
  );
}

function NavLink({ item, active, collapsed }: { item: NavItem; active: boolean; collapsed: boolean }) {
  const Icon = item.icon;
  return (
    <li>
      <Link
        to={item.to}
        title={collapsed ? item.label : undefined}
        className={cn(
          "flex items-center gap-2.5 rounded-lg text-sm font-medium transition-colors",
          collapsed ? "justify-center px-2 py-2" : "px-3 py-2",
          active
            ? "bg-brand-secondary/[0.08] text-brand-secondary"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
        )}
      >
        <Icon className={cn("size-4 shrink-0", active ? "text-brand-primary" : "text-slate-400")} />
        {!collapsed && item.label}
      </Link>
    </li>
  );
}

export function RootOutlet() {
  return <Outlet />;
}
