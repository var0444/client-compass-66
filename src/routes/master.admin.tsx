import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, Database, Users2, Workflow, KeyRound } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/master/admin")({
  component: AdminCenter,
  head: () => ({ meta: [{ title: "Admin Center · Client360" }] }),
});

type Tab = "metadata" | "users" | "workflows" | "integrations";

function AdminCenter() {
  const [tab, setTab] = useState<Tab>("metadata");
  return (
    <AppShell
      breadcrumbs={[{ label: "Master Management" }, { label: "Admin Center" }]}
      title="Admin Center"
      subtitle="Reserved for metadata table administration and configuration management."
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-1 border-b border-slate-200">
          <Tab2 active={tab === "metadata"} onClick={() => setTab("metadata")} icon={<Database className="size-4" />}>Metadata Tables</Tab2>
          <Tab2 active={tab === "users"} onClick={() => setTab("users")} icon={<Users2 className="size-4" />}>Users & Roles</Tab2>
          <Tab2 active={tab === "workflows"} onClick={() => setTab("workflows")} icon={<Workflow className="size-4" />}>Workflows</Tab2>
          <Tab2 active={tab === "integrations"} onClick={() => setTab("integrations")} icon={<KeyRound className="size-4" />}>Integrations</Tab2>
        </div>

        <div className="rounded-xl border border-dashed border-brand-secondary/30 bg-gradient-to-br from-brand-secondary/[0.04] to-white p-10 text-center">
          <span className="inline-flex size-12 items-center justify-center rounded-full bg-brand-secondary/10 text-brand-secondary">
            <ShieldCheck className="size-6" />
          </span>
          <h3 className="mt-4 text-base font-semibold text-slate-900">{labelFor(tab)} — coming soon</h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
            This area is reserved for administrative configuration. Use the tabs above to switch between management sections.
          </p>
        </div>
      </div>
    </AppShell>
  );
}

function labelFor(t: Tab) {
  return t === "metadata" ? "Metadata Tables" : t === "users" ? "Users & Roles" : t === "workflows" ? "Workflow Configuration" : "Integration Keys";
}

function Tab2({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors",
        active ? "text-brand-primary" : "text-slate-500 hover:text-slate-900",
      )}
    >
      {icon}{children}
      {active && <span className="absolute -bottom-px left-0 right-0 h-0.5 rounded-full bg-brand-primary" />}
    </button>
  );
}
