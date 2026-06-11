import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  AlertOctagon,
  Link2Off,
  Clock,
  CheckCircle2,
  Activity,
  TrendingUp,
  Server,
  ArrowRight,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StatusChip } from "@/components/StatusChip";

export const Route = createFileRoute("/")({
  component: CommandCenter,
  head: () => ({
    meta: [
      { title: "Command Center · Client360" },
      { name: "description", content: "Operational status, failed processes, unmapped CAGs, system errors and pending actions." },
    ],
  }),
});

function CommandCenter() {
  return (
    <AppShell
      breadcrumbs={[{ label: "Command Center" }]}
      title="Command Center"
      subtitle="Real-time operational status across clients, contracts and integrations."
      actions={<StatusChip tone="success">All systems nominal</StatusChip>}
    >
      <div className="space-y-6">
        {/* Top KPI strip */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          <Stat icon={<CheckCircle2 className="size-4" />} label="Jobs OK (24h)" value="4,812" tone="success" />
          <Stat icon={<AlertOctagon className="size-4" />} label="Failed Processes" value="14" tone="danger" />
          <Stat icon={<Link2Off className="size-4" />} label="Unmapped CAGs" value="7" tone="warning" />
          <Stat icon={<Clock className="size-4" />} label="Pending Actions" value="23" tone="info" />
          <Stat icon={<Server className="size-4" />} label="System Errors" value="2" tone="danger" />
        </div>

        {/* Two-column main */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Panel title="Failed processes" desc="Last 24 hours" className="lg:col-span-2">
            <ul className="divide-y divide-slate-100">
              {failed.map((f) => (
                <li key={f.id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-slate-500">{f.id}</span>
                      <StatusChip tone="danger">{f.severity}</StatusChip>
                    </div>
                    <div className="mt-0.5 text-sm font-medium text-slate-900">{f.title}</div>
                    <div className="text-xs text-slate-500">{f.client} · {f.when}</div>
                  </div>
                  <button className="inline-flex items-center gap-1 text-xs font-semibold text-brand-primary hover:underline">
                    Investigate <ArrowRight className="size-3" />
                  </button>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Pending actions" desc="Awaiting your review">
            <ul className="space-y-3">
              {pending.map((p) => (
                <li key={p.id} className="rounded-md border border-slate-100 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-500">{p.id}</span>
                    <StatusChip tone={p.tone}>{p.label}</StatusChip>
                  </div>
                  <div className="mt-1 text-sm font-medium text-slate-900">{p.title}</div>
                  <div className="text-xs text-slate-500">{p.due}</div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Panel title="Unmapped CAGs" desc="Carrier · Account · Group with no operational unit binding">
            <table className="w-full text-sm">
              <thead className="text-[11px] uppercase tracking-wider text-slate-500">
                <tr><th className="py-2 text-left">CAG</th><th className="text-left">Carrier</th><th className="text-left">Detected</th><th /></tr>
              </thead>
              <tbody>
                {unmapped.map((u) => (
                  <tr key={u.id} className="border-t border-slate-100">
                    <td className="py-2 font-mono text-xs">{u.id}</td>
                    <td>{u.carrier}</td>
                    <td className="text-slate-500">{u.detected}</td>
                    <td className="text-right">
                      <Link to="/clients" className="text-xs font-semibold text-brand-primary hover:underline">Map →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>

          <Panel title="System health" desc="Integrations and background workers">
            <ul className="space-y-2">
              {systems.map((s) => (
                <li key={s.name} className="flex items-center justify-between rounded-md border border-slate-100 px-3 py-2 text-sm">
                  <span className="flex items-center gap-2 text-slate-700">
                    <Activity className={`size-3.5 ${s.tone === "success" ? "text-emerald-500" : s.tone === "warning" ? "text-amber-500" : "text-rose-500"}`} />
                    {s.name}
                  </span>
                  <StatusChip tone={s.tone}>{s.status}</StatusChip>
                </li>
              ))}
            </ul>
            <Link
              to="/dashboard"
              className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-brand-primary hover:underline"
            >
              View full dashboard <TrendingUp className="size-3" />
            </Link>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}

const failed = [
  { id: "JOB-78231", title: "Pricing recalculation failed for OU-7721", client: "Aramex", when: "12 min ago", severity: "Critical" },
  { id: "JOB-78212", title: "Contract sync timeout", client: "Ashwini Logistics", when: "47 min ago", severity: "High" },
  { id: "JOB-78189", title: "CAG ingestion rejected 3 rows", client: "DRP2302", when: "1 h ago", severity: "Medium" },
  { id: "JOB-78104", title: "Carrier feed schema mismatch", client: "Priti Couriers", when: "3 h ago", severity: "High" },
];

const pending = [
  { id: "REQ-441", title: "Approve volume override · OU-9902", due: "Due today", label: "Approval", tone: "warning" as const },
  { id: "REQ-438", title: "Renew contract CONT-2024-0012", due: "Due in 6 days", label: "Renewal", tone: "info" as const },
  { id: "REQ-435", title: "Confirm carrier migration · DHL Express", due: "Due in 12 days", label: "Migration", tone: "draft" as const },
];

const unmapped = [
  { id: "CAG-902", carrier: "FedEx", detected: "2h ago" },
  { id: "CAG-901", carrier: "UPS", detected: "5h ago" },
  { id: "CAG-898", carrier: "OnTrac", detected: "1d ago" },
];

const systems: { name: string; status: string; tone: "success" | "warning" | "danger" }[] = [
  { name: "Pricing Engine", status: "Operational", tone: "success" },
  { name: "Carrier Feed (FedEx)", status: "Operational", tone: "success" },
  { name: "Carrier Feed (DHL)", status: "Degraded", tone: "warning" },
  { name: "Billing Webhook", status: "Operational", tone: "success" },
  { name: "CAG Mapper", status: "2 errors", tone: "danger" },
];

function Stat({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: "success" | "danger" | "warning" | "info" }) {
  const toneMap = {
    success: "text-emerald-600 bg-emerald-50",
    danger: "text-rose-600 bg-rose-50",
    warning: "text-amber-600 bg-amber-50",
    info: "text-sky-600 bg-sky-50",
  };
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">{label}</span>
        <span className={`grid size-7 place-items-center rounded-md ${toneMap[tone]}`}>{icon}</span>
      </div>
      <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{value}</div>
    </div>
  );
}

function Panel({ title, desc, children, className = "" }: { title: string; desc?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {desc && <p className="text-xs text-slate-500">{desc}</p>}
      </div>
      {children}
    </div>
  );
}

// silence unused warning
void AlertTriangle;
