import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  TrendingUp, TrendingDown, FileBarChart, BarChart3, Filter, Download, ArrowRight,
  Activity, AlertOctagon, Link2Off, Clock, CheckCircle2, Server,
  Sparkles, Zap, DollarSign, PackageX, GitCompare, Radar,
  Pill, Receipt, ShieldAlert, Percent, RotateCcw, FileWarning,
} from "lucide-react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
  Pie, PieChart, Cell, Legend, Line, LineChart, ReferenceDot,
} from "recharts";
import { AppShell } from "@/components/AppShell";
import { StatusChip } from "@/components/StatusChip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { dashboardMetrics } from "@/lib/clients-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
  head: () => ({ meta: [{ title: "Dashboard · Client360" }] }),
});

type Tab = "hub" | "summary" | "reports";

function DashboardPage() {
  const [tab, setTab] = useState<Tab>("summary");
  const [period, setPeriod] = useState("90");

  return (
    <AppShell
      breadcrumbs={[{ label: "Dashboard" }, { label: tabLabel(tab) }]}
      title="Dashboard"
      subtitle="Executive summary, action hub, and reports across all clients."
      actions={
        tab === "summary" ? (
          <div className="flex items-center gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last 12 months</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm"><Download className="mr-1.5 size-3.5" /> Export</Button>
          </div>
        ) : tab === "hub" ? (
          <StatusChip tone="success">All systems nominal</StatusChip>
        ) : null
      }
    >
      <div className="space-y-5">
        <div className="flex items-center gap-1 border-b border-slate-200">
          <TabBtn active={tab === "hub"} onClick={() => setTab("hub")} icon={<Activity className="size-4" />}>Core Action Hub</TabBtn>
          <TabBtn active={tab === "summary"} onClick={() => setTab("summary")} icon={<BarChart3 className="size-4" />}>Executive Summary</TabBtn>
          <TabBtn active={tab === "reports"} onClick={() => setTab("reports")} icon={<FileBarChart className="size-4" />}>Reports</TabBtn>
        </div>

        {tab === "hub" && <CoreActionHub />}
        {tab === "summary" && <ExecutiveSummary />}
        {tab === "reports" && <ReportsView />}
      </div>
    </AppShell>
  );
}

function tabLabel(t: Tab) {
  return t === "hub" ? "Core Action Hub" : t === "summary" ? "Executive Summary" : "Reports";
}

function TabBtn({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
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

/* -------------------- Executive Summary -------------------- */

function ExecutiveSummary() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Total Revenue" value="$382.4K" trend="+12.4%" up />
        <Kpi label="Active Clients" value="42" trend="+3" up />
        <Kpi label="Active Contracts" value="64" trend="+5" up />
        <Kpi label="Failed Jobs" value="48" trend="-18%" up />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Panel title="Revenue trend" desc="Aggregate across all clients" className="lg:col-span-2">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboardMetrics.monthlyRevenue}>
                <defs>
                  <linearGradient id="grev" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#002677" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#002677" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={40} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Area type="monotone" dataKey="value" stroke="#002677" strokeWidth={2} fill="url(#grev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Revenue by segment">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={segmentMix} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {segmentMix.map((s, i) => <Cell key={s.name} fill={["#FF612B", "#002677", "#00B0E6"][i]} />)}
                </Pie>
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <Panel title="Job operations" desc="Completed vs failed across the network">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dashboardMetrics.jobOps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={40} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="completed" fill="#002677" radius={[4, 4, 0, 0]} />
              <Bar dataKey="failed" fill="#FF612B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>
    </div>
  );
}

const segmentMix = [
  { name: "Enterprise", value: 58 },
  { name: "Mid-Market", value: 27 },
  { name: "SMB", value: 15 },
];

/* -------------------- Core Action Hub -------------------- */

function CoreActionHub() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
        <Stat icon={<CheckCircle2 className="size-4" />} label="Claims billed (24h)" value="182,441" tone="success" />
        <Stat icon={<AlertOctagon className="size-4" />} label="Failed billing runs" value="14" tone="danger" />
        <Stat icon={<Radar className="size-4" />} label="PBM anomalies (24h)" value="11" tone="warning" />
        <Stat icon={<RotateCcw className="size-4" />} label="Reversals flagged" value="38" tone="warning" />
        <Stat icon={<Clock className="size-4" />} label="Rebate reviews pending" value="9" tone="info" />
        <Stat icon={<ShieldAlert className="size-4" />} label="Compliance alerts" value="3" tone="danger" />
      </div>

      <AnomalySection />


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
            <thead className="thead-brand">
              <tr>
                <th className="th-brand py-2 px-2 text-left">CAG</th>
                <th className="th-brand py-2 px-2 text-left">Carrier</th>
                <th className="th-brand py-2 px-2 text-left">Detected</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {unmapped.map((u) => (
                <tr key={u.id} className="border-t border-slate-100">
                  <td className="py-2 px-2 font-mono text-xs">{u.id}</td>
                  <td className="px-2">{u.carrier}</td>
                  <td className="px-2 text-slate-500">{u.detected}</td>
                  <td className="text-right pr-2">
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
        </Panel>
      </div>
    </div>
  );
}

/* -------------------- Anomaly Detection -------------------- */

const anomalyTrend = [
  { t: "00:00", actual: 6420, baseline: 6500 },
  { t: "02:00", actual: 5980, baseline: 6100 },
  { t: "04:00", actual: 5750, baseline: 5900 },
  { t: "06:00", actual: 6300, baseline: 6250 },
  { t: "08:00", actual: 8120, baseline: 7800 },
  { t: "10:00", actual: 11890, baseline: 8600, anomaly: true },
  { t: "12:00", actual: 8450, baseline: 8300 },
  { t: "14:00", actual: 8210, baseline: 8200 },
  { t: "16:00", actual: 3120, baseline: 7900, anomaly: true },
  { t: "18:00", actual: 7480, baseline: 7500 },
  { t: "20:00", actual: 7210, baseline: 7100 },
  { t: "22:00", actual: 9840, baseline: 6800, anomaly: true },
];

const anomalyMix = [
  { name: "AWP / MAC pricing deviation", value: 3, color: "#FF612B", icon: DollarSign },
  { name: "Rebate variance", value: 2, color: "#002677", icon: Percent },
  { name: "Claim reversal spike", value: 2, color: "#F59E0B", icon: RotateCcw },
  { name: "DIR fee mismatch", value: 2, color: "#0EA5E9", icon: Receipt },
  { name: "340B duplicate discount", value: 1, color: "#8B5CF6", icon: ShieldAlert },
  { name: "Formulary tier drift", value: 1, color: "#10B981", icon: Pill },
];

const anomalies = [
  {
    id: "PBM-3391", type: "AWP pricing deviation", tone: "danger" as const, icon: DollarSign,
    title: "Ingredient cost 22% above AWP-15% contracted rate",
    client: "UnitedHealth Grp · OU Midwest Retail · NDC 00093-7146", when: "18 min ago",
    metric: "$142.80 vs $117.05 allowed", severity: "High", confidence: 0.96,
  },
  {
    id: "PBM-3388", type: "Rebate variance", tone: "warning" as const, icon: Percent,
    title: "Manufacturer rebate accrual short by 34% vs contracted guarantee",
    client: "Elevance Health · Commercial Book · Q3 accrual", when: "1 h ago",
    metric: "$2.14 PMPM vs $3.25 guarantee", severity: "High", confidence: 0.91,
  },
  {
    id: "PBM-3384", type: "Claim reversal spike", tone: "warning" as const, icon: RotateCcw,
    title: "Reversal rate 4.8× baseline for Medicare Part D group",
    client: "Humana · MAPD Group 88231 · 24h window", when: "2 h ago",
    metric: "38 reversals vs ~8 expected", severity: "Medium", confidence: 0.87,
  },
  {
    id: "PBM-3379", type: "340B duplicate discount", tone: "danger" as const, icon: ShieldAlert,
    title: "340B claim also billed with manufacturer rebate (duplicate discount)",
    client: "CVS Caremark · Covered entity CE-4421", when: "3 h ago",
    metric: "12 claims · $8,940 exposure", severity: "High", confidence: 0.98,
  },
  {
    id: "PBM-3372", type: "DIR fee mismatch", tone: "info" as const, icon: Receipt,
    title: "Retro DIR fee assessed above ceiling on preferred pharmacy network",
    client: "Cigna Express Scripts · OU Southeast", when: "5 h ago",
    metric: "6.1% vs 4.5% cap", severity: "Medium", confidence: 0.83,
  },
  {
    id: "PBM-3365", type: "Copay mismatch", tone: "draft" as const, icon: FileWarning,
    title: "Member copay deviates from benefit plan tier design",
    client: "BCBS FEP · Plan FEP-Std · Tier 2 generics", when: "7 h ago",
    metric: "Avg $18 vs $10 tier design", severity: "Low", confidence: 0.79,
  },
  {
    id: "PBM-3358", type: "Formulary tier drift", tone: "draft" as const, icon: Pill,
    title: "Non-formulary NDCs adjudicated at preferred tier pricing",
    client: "Aetna · Commercial NPF formulary", when: "9 h ago",
    metric: "27 NDCs · $12,410 impact", severity: "Medium", confidence: 0.85,
  },
];

function AnomalySection() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-md bg-gradient-to-br from-brand-primary/15 to-amber-100 text-brand-primary">
            <Sparkles className="size-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">PBM Billing Anomalies</h2>
            <p className="text-xs text-slate-500">ML-flagged deviations across US healthcare PBM billing — AWP/MAC pricing, rebates, DIR fees, 340B, reversals & formulary adherence.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusChip tone="info">HIPAA-scoped</StatusChip>
          <StatusChip tone="warning">11 open</StatusChip>
          <StatusChip tone="success">Model v2.4</StatusChip>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Panel title="Baseline vs actual" desc="Rx claims adjudicated per 2h · last 24h (dots = anomalies)" className="lg:col-span-2">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={anomalyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                <XAxis dataKey="t" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={40} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="baseline" stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="actual" stroke="#002677" strokeWidth={2} dot={false} />
                {anomalyTrend.filter((d) => d.anomaly).map((d) => (
                  <ReferenceDot key={d.t} x={d.t} y={d.actual} r={5} fill="#FF612B" stroke="white" strokeWidth={2} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Anomalies by type" desc="Last 24 hours">
          <ul className="space-y-2">
            {anomalyMix.map((a) => {
              const Icon = a.icon;
              const total = anomalyMix.reduce((s, x) => s + x.value, 0);
              const pct = Math.round((a.value / total) * 100);
              return (
                <li key={a.name}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-medium text-slate-700">
                      <Icon className="size-3.5" style={{ color: a.color }} /> {a.name}
                    </span>
                    <span className="font-mono text-slate-500">{a.value} · {pct}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: a.color }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>

      <Panel title="Recent anomalies" desc="Ranked by severity and confidence">
        <ul className="divide-y divide-slate-100">
          {anomalies.map((a) => {
            const Icon = a.icon;
            return (
              <li key={a.id} className="flex items-start justify-between gap-4 py-3">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 grid size-8 place-items-center rounded-md bg-slate-50 text-slate-600 ring-1 ring-slate-200">
                    <Icon className="size-4" />
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-slate-500">{a.id}</span>
                      <StatusChip tone={a.tone}>{a.type}</StatusChip>
                      <span className="text-[11px] text-slate-500">Severity: <span className="font-semibold text-slate-700">{a.severity}</span></span>
                      <span className="text-[11px] text-slate-500">Confidence: <span className="font-semibold text-slate-700">{Math.round(a.confidence * 100)}%</span></span>
                    </div>
                    <div className="mt-0.5 text-sm font-medium text-slate-900">{a.title}</div>
                    <div className="text-xs text-slate-500">{a.client} · {a.when} · <span className="font-mono">{a.metric}</span></div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <button className="text-xs font-semibold text-slate-500 hover:text-slate-900">Dismiss</button>
                  <button className="inline-flex items-center gap-1 text-xs font-semibold text-brand-primary hover:underline">
                    Investigate <ArrowRight className="size-3" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </Panel>
    </div>
  );
}

// Silence unused-import warning when tree-shaken
void PackageX;

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

/* -------------------- Reports -------------------- */

function ReportsView() {
  const [reportId, setReportId] = useState<string>(reports[0].id);
  const [carrier, setCarrier] = useState("all");
  const [search, setSearch] = useState("");
  const report = reports.find((r) => r.id === reportId)!;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Report</div>
          <Select value={reportId} onValueChange={setReportId}>
            <SelectTrigger className="h-9 w-72 border-brand-secondary/20 bg-brand-secondary/[0.04] font-semibold text-brand-secondary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {reports.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{r.name}</span>
                    <span className="text-[11px] text-slate-500">{r.desc}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Filter className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filter rows…" className="h-9 w-48 pl-8" />
          </div>
          <Select value={carrier} onValueChange={setCarrier}>
            <SelectTrigger className="h-9 w-36"><SelectValue placeholder="Carrier" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All carriers</SelectItem>
              <SelectItem value="FedEx">FedEx</SelectItem>
              <SelectItem value="UPS">UPS</SelectItem>
              <SelectItem value="DHL">DHL</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm"><Download className="mr-1.5 size-3.5" /> CSV</Button>
        </div>
      </div>

      <div className="mt-2 text-xs text-slate-500">{report.desc}</div>

      <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
        <table className="w-full text-sm">
          <thead className="thead-brand">
            <tr>
              {report.columns.map((c) => <th key={c} className="th-brand px-3 py-2 text-left">{c}</th>)}
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {report.rows
              .filter((r) => carrier === "all" || r.includes(carrier))
              .filter((r) => !search || r.join(" ").toLowerCase().includes(search.toLowerCase()))
              .map((row, i) => (
                <tr key={i} className="border-t border-slate-100 hover:bg-slate-50/60">
                  {row.map((cell, j) => (
                    <td key={j} className={cn("px-3 py-2", j === 0 ? "font-medium text-slate-900" : "text-slate-600")}>{cell}</td>
                  ))}
                  <td className="px-3 py-2 text-right">
                    <button className="text-xs font-semibold text-brand-primary hover:underline">Drill down →</button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const reports = [
  {
    id: "rev-by-client",
    name: "Revenue by Client",
    desc: "Monthly revenue contribution per client.",
    columns: ["Client", "Segment", "Carrier", "MRR", "Change"],
    rows: [
      ["Aramex", "Enterprise", "FedEx", "$61,200", "+8.4%"],
      ["Ashwini Logistics", "Mid-Market", "UPS", "$24,800", "+2.1%"],
      ["Priti Couriers", "SMB", "DHL", "$8,400", "-1.2%"],
      ["DRP2301", "Enterprise", "FedEx", "$52,300", "+5.6%"],
    ],
  },
  {
    id: "failed-jobs",
    name: "Failed Job Operations",
    desc: "Failed jobs grouped by client and root cause.",
    columns: ["Client", "Job", "Carrier", "Cause", "When"],
    rows: [
      ["Aramex", "Pricing recalculation", "FedEx", "Timeout", "12m ago"],
      ["Ashwini Logistics", "Contract sync", "UPS", "Auth", "47m ago"],
      ["DRP2302", "CAG ingestion", "DHL", "Schema", "1h ago"],
    ],
  },
  {
    id: "cag-coverage",
    name: "CAG Coverage",
    desc: "Carrier · Account · Group mapping status per operational unit.",
    columns: ["Client", "OU", "Carrier", "Mapped", "Gaps"],
    rows: [
      ["Aramex", "West Coast", "FedEx", "12 / 14", "2"],
      ["Aramex", "Texas Hub", "UPS", "8 / 8", "0"],
      ["DRP2301", "Northeast", "DHL", "5 / 9", "4"],
    ],
  },
  {
    id: "pricing-overrides",
    name: "Pricing Overrides",
    desc: "OU-level overrides vs contract base.",
    columns: ["Client", "OU", "Carrier", "Override", "Δ vs base"],
    rows: [
      ["Aramex", "West Coast", "FedEx", "Tier 2", "-5.6%"],
      ["Aramex", "Tri-State", "UPS", "Volume", "-15.5%"],
      ["DRP2302", "Central", "DHL", "Custom", "+3.2%"],
    ],
  },
];

function Kpi({ label, value, trend, up }: { label: string; value: string; trend: string; up: boolean }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{value}</div>
      <div className={`mt-1 inline-flex items-center gap-1 text-xs font-medium ${up ? "text-emerald-600" : "text-rose-600"}`}>
        {up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />} {trend}
      </div>
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
