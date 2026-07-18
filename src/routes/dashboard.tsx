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
        <Stat icon={<Receipt className="size-4" />} label="Invoices generated (24h)" value="1,284" tone="success" />
        <Stat icon={<AlertOctagon className="size-4" />} label="Invoice generation failures" value="9" tone="danger" />
        <Stat icon={<Radar className="size-4" />} label="Billing anomalies (24h)" value="27" tone="warning" />
        <Stat icon={<DollarSign className="size-4" />} label="Revenue at risk" value="$412K" tone="warning" />
        <Stat icon={<Clock className="size-4" />} label="Investigations open" value="14" tone="info" />
        <Stat icon={<ShieldAlert className="size-4" />} label="Contract compliance breaches" value="4" tone="danger" />
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
  { t: "Wk1", actual: 3.82, baseline: 3.80 },
  { t: "Wk2", actual: 3.91, baseline: 3.88 },
  { t: "Wk3", actual: 3.76, baseline: 3.85 },
  { t: "Wk4", actual: 4.62, baseline: 3.90, anomaly: true },
  { t: "Wk5", actual: 3.94, baseline: 3.95 },
  { t: "Wk6", actual: 4.02, baseline: 4.00 },
  { t: "Wk7", actual: 3.21, baseline: 4.05, anomaly: true },
  { t: "Wk8", actual: 4.10, baseline: 4.08 },
  { t: "Wk9", actual: 4.18, baseline: 4.12 },
  { t: "Wk10", actual: 4.85, baseline: 4.15, anomaly: true },
  { t: "Wk11", actual: 4.20, baseline: 4.18 },
  { t: "Wk12", actual: 4.24, baseline: 4.22 },
];

const anomalyMix = [
  { name: "Client contract pricing variance", value: 6, color: "#FF612B", icon: DollarSign },
  { name: "Duplicate client billing", value: 4, color: "#002677", icon: Receipt },
  { name: "Revenue leakage / underbilling", value: 5, color: "#F59E0B", icon: TrendingDown },
  { name: "Invoice amount spike", value: 4, color: "#0EA5E9", icon: TrendingUp },
  { name: "Administrative fee mismatch", value: 3, color: "#8B5CF6", icon: Percent },
  { name: "PMPM billing variance", value: 3, color: "#10B981", icon: GitCompare },
  { name: "Billing outside contract dates", value: 2, color: "#EF4444", icon: ShieldAlert },
];

type Anomaly = {
  id: string;
  category: string;
  tone: "danger" | "warning" | "info" | "draft" | "success";
  icon: any;
  clientName: string;
  invoiceNumber: string;
  billingPeriod: string;
  businessUnit: string;
  billingCategory: string;
  expected: string;
  actual: string;
  variance: string;
  revenueImpact: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  confidence: number;
  rootCause: string;
  recommendedAction: string;
  status: "Open" | "In Review" | "Escalated" | "Resolved";
  analyst: string;
};

const anomalies: Anomaly[] = [
  {
    id: "BIL-90412", category: "Client Contract Pricing Variance", tone: "danger", icon: DollarSign,
    clientName: "UnitedHealth Group — Commercial", invoiceNumber: "INV-2026-08841",
    billingPeriod: "Jun 2026", businessUnit: "PBM Client Billing — East",
    billingCategory: "Per-Claim Administrative Fee",
    expected: "$0.62 / claim", actual: "$0.78 / claim",
    variance: "+$0.16 / claim", revenueImpact: "+$184,220 overbilled",
    severity: "Critical", confidence: 0.97,
    rootCause: "Rate card v3.2 loaded; contract references v3.1 pricing schedule.",
    recommendedAction: "Hold invoice release · reload rate card v3.1 · issue credit memo if released.",
    status: "Escalated", analyst: "P. Ramirez",
  },
  {
    id: "BIL-90408", category: "Duplicate Client Billing", tone: "danger", icon: Receipt,
    clientName: "Elevance Health", invoiceNumber: "INV-2026-08829",
    billingPeriod: "Jun 2026", businessUnit: "PBM Client Billing — Central",
    billingCategory: "Implementation Fee",
    expected: "$45,000 (one-time)", actual: "$90,000 (billed twice)",
    variance: "+$45,000", revenueImpact: "+$45,000 duplicate charge",
    severity: "High", confidence: 0.99,
    rootCause: "Implementation milestone event fired twice from onboarding workflow.",
    recommendedAction: "Reverse duplicate line · issue credit memo · patch onboarding event handler.",
    status: "In Review", analyst: "S. Okafor",
  },
  {
    id: "BIL-90397", category: "Revenue Leakage / Underbilling Risk", tone: "warning", icon: TrendingDown,
    clientName: "Humana — MAPD", invoiceNumber: "INV-2026-08811",
    billingPeriod: "Jun 2026", businessUnit: "Revenue Integrity",
    billingCategory: "PMPM Administrative Fee",
    expected: "412,880 eligible members", actual: "398,120 billed members",
    variance: "-14,760 members", revenueImpact: "-$62,730 underbilled",
    severity: "High", confidence: 0.93,
    rootCause: "Eligibility feed truncated; new group HUM-MAPD-441 not mapped to billing entity.",
    recommendedAction: "Re-run eligibility reconciliation · map group · rebill supplemental invoice.",
    status: "Open", analyst: "J. Whitmore",
  },
  {
    id: "BIL-90385", category: "Invoice Amount Spike", tone: "warning", icon: TrendingUp,
    clientName: "CVS Caremark — Commercial", invoiceNumber: "INV-2026-08802",
    billingPeriod: "Jun 2026", businessUnit: "PBM Client Billing — West",
    billingCategory: "Total Monthly Invoice",
    expected: "$1.42M (12-mo avg)", actual: "$2.08M",
    variance: "+46.5%", revenueImpact: "+$660K vs baseline",
    severity: "High", confidence: 0.91,
    rootCause: "Manual adjustment batch ADJ-7712 posted against wrong client contract.",
    recommendedAction: "Reverse ADJ-7712 · reallocate to correct client · release corrected invoice.",
    status: "In Review", analyst: "A. Nakamura",
  },
  {
    id: "BIL-90371", category: "Administrative Fee Mismatch", tone: "info", icon: Percent,
    clientName: "Cigna", invoiceNumber: "INV-2026-08788",
    billingPeriod: "Jun 2026", businessUnit: "Revenue Integrity",
    billingCategory: "Rebate Admin Fee",
    expected: "1.25% of rebate pass-through", actual: "1.85%",
    variance: "+60 bps", revenueImpact: "+$28,410 overbilled",
    severity: "Medium", confidence: 0.88,
    rootCause: "Fee schedule not updated after contract amendment CA-2026-14.",
    recommendedAction: "Apply amendment CA-2026-14 · recalculate · credit client.",
    status: "Open", analyst: "M. Delacroix",
  },
  {
    id: "BIL-90358", category: "Billing Outside Contract Effective Dates", tone: "danger", icon: ShieldAlert,
    clientName: "BCBS Federal Employee Program", invoiceNumber: "INV-2026-08774",
    billingPeriod: "Jun 2026", businessUnit: "Client Billing Operations",
    billingCategory: "PMPM Administrative Fee",
    expected: "Contract effective through May 31, 2026", actual: "Billed for full Jun 2026",
    variance: "30 days beyond term", revenueImpact: "$91,200 exposed to dispute",
    severity: "Critical", confidence: 0.98,
    rootCause: "Contract renewal not booked; auto-renew flag disabled but billing job not gated.",
    recommendedAction: "Suspend invoice · confirm renewal status · rebill under new contract or credit.",
    status: "Escalated", analyst: "P. Ramirez",
  },
  {
    id: "BIL-90344", category: "PMPM Billing Variance", tone: "warning", icon: GitCompare,
    clientName: "Aetna — Commercial", invoiceNumber: "INV-2026-08761",
    billingPeriod: "Jun 2026", businessUnit: "PBM Client Billing — East",
    billingCategory: "PMPM Fee",
    expected: "$3.85 PMPM", actual: "$4.21 PMPM",
    variance: "+$0.36 PMPM", revenueImpact: "+$142,880 overbilled",
    severity: "High", confidence: 0.89,
    rootCause: "Tier-2 pricing applied to Tier-1 book of business.",
    recommendedAction: "Correct product mapping · reprice · issue credit memo.",
    status: "In Review", analyst: "S. Okafor",
  },
  {
    id: "BIL-90332", category: "Credit Memo Anomaly", tone: "draft", icon: RotateCcw,
    clientName: "Molina Healthcare", invoiceNumber: "CM-2026-01192",
    billingPeriod: "Jun 2026", businessUnit: "Finance — Revenue Assurance",
    billingCategory: "Credit Memo",
    expected: "~$8K avg credit memo", actual: "$74,500 credit",
    variance: "+8.3× baseline", revenueImpact: "-$66,500 vs expected",
    severity: "Medium", confidence: 0.84,
    rootCause: "Bulk credit applied without dispute ticket reference.",
    recommendedAction: "Attach supporting dispute · route through Finance approval workflow.",
    status: "Open", analyst: "L. Bianchi",
  },
  {
    id: "BIL-90318", category: "AI-Detected Outlier Pattern", tone: "info", icon: Sparkles,
    clientName: "Centene — Ambetter", invoiceNumber: "INV-2026-08742",
    billingPeriod: "Jun 2026", businessUnit: "Revenue Integrity",
    billingCategory: "Composite (multi-line)",
    expected: "Within 2σ of client pattern", actual: "4.6σ deviation across 3 fee categories",
    variance: "Composite anomaly", revenueImpact: "$118K under review",
    severity: "Medium", confidence: 0.82,
    rootCause: "Correlated shifts in admin fee, PMPM, and rebate admin — likely mid-cycle rate reload.",
    recommendedAction: "Compare rate cards · confirm effective date · validate with client success.",
    status: "Open", analyst: "J. Whitmore",
  },
];

const severityTone: Record<Anomaly["severity"], "danger" | "warning" | "info" | "neutral"> = {
  Critical: "danger", High: "danger", Medium: "warning", Low: "info",
};
const statusTone: Record<Anomaly["status"], "warning" | "info" | "danger" | "success"> = {
  Open: "warning", "In Review": "info", Escalated: "danger", Resolved: "success",
};

function AnomalySection() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-md bg-gradient-to-br from-brand-primary/15 to-amber-100 text-brand-primary">
            <Sparkles className="size-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">PBM Client Billing Anomalies</h2>
            <p className="max-w-4xl text-xs text-slate-500">
              AI continuously analyzes PBM client billing, invoice generation, contractual pricing, administrative fees, PMPM billing, adjustments, credits, and historical billing patterns to proactively identify revenue leakage, overbilling, underbilling, pricing deviations, reconciliation differences, and contract compliance issues before invoices are released.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusChip tone="info">Pre-release scan</StatusChip>
          <StatusChip tone="warning">27 open</StatusChip>
          <StatusChip tone="success">Model v3.1</StatusChip>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Panel title="Invoice value — baseline vs actual" desc="Aggregate weekly invoice value ($M) · dots = anomalous billing periods" className="lg:col-span-2">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={anomalyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                <XAxis dataKey="t" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={40} tickFormatter={(v) => `$${v}M`} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} formatter={(v: number) => `$${v}M`} />
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

        <Panel title="Anomalies by category" desc="Last 30 days">
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

      <Panel title="Flagged billing anomalies" desc="Ranked by severity, revenue impact, and AI confidence">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="thead-brand">
              <tr>
                <th className="th-brand px-3 py-2 text-left">Anomaly</th>
                <th className="th-brand px-3 py-2 text-left">Client / Invoice</th>
                <th className="th-brand px-3 py-2 text-left">Billing Category</th>
                <th className="th-brand px-3 py-2 text-right">Expected</th>
                <th className="th-brand px-3 py-2 text-right">Actual</th>
                <th className="th-brand px-3 py-2 text-right">Revenue Impact</th>
                <th className="th-brand px-3 py-2 text-left">Severity · Confidence</th>
                <th className="th-brand px-3 py-2 text-left">Status · Analyst</th>
                <th className="th-brand" />
              </tr>
            </thead>
            <tbody>
              {anomalies.map((a) => {
                const Icon = a.icon;
                return (
                  <tr key={a.id} className="border-t border-slate-100 align-top hover:bg-slate-50/60">
                    <td className="px-3 py-3">
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-md bg-slate-50 text-slate-600 ring-1 ring-slate-200">
                          <Icon className="size-3.5" />
                        </span>
                        <div>
                          <div className="font-mono text-[10px] text-slate-500">{a.id}</div>
                          <div className="font-semibold text-slate-900">{a.category}</div>
                          <div className="mt-1 max-w-xs text-[11px] text-slate-500"><span className="font-medium text-slate-600">Root cause:</span> {a.rootCause}</div>
                          <div className="mt-0.5 max-w-xs text-[11px] text-slate-500"><span className="font-medium text-slate-600">Action:</span> {a.recommendedAction}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-medium text-slate-900">{a.clientName}</div>
                      <div className="font-mono text-[11px] text-slate-500">{a.invoiceNumber}</div>
                      <div className="text-[11px] text-slate-500">{a.billingPeriod} · {a.businessUnit}</div>
                    </td>
                    <td className="px-3 py-3 text-slate-700">{a.billingCategory}</td>
                    <td className="px-3 py-3 text-right font-mono text-slate-700">{a.expected}</td>
                    <td className="px-3 py-3 text-right font-mono text-slate-900">{a.actual}</td>
                    <td className="px-3 py-3 text-right">
                      <div className={cn("font-mono font-semibold", a.revenueImpact.startsWith("-") ? "text-rose-600" : "text-brand-primary")}>{a.revenueImpact}</div>
                      <div className="font-mono text-[11px] text-slate-500">Δ {a.variance}</div>
                    </td>
                    <td className="px-3 py-3">
                      <StatusChip tone={severityTone[a.severity]}>{a.severity}</StatusChip>
                      <div className="mt-1 text-[11px] text-slate-500">AI confidence <span className="font-semibold text-slate-700">{Math.round(a.confidence * 100)}%</span></div>
                    </td>
                    <td className="px-3 py-3">
                      <StatusChip tone={statusTone[a.status]}>{a.status}</StatusChip>
                      <div className="mt-1 text-[11px] text-slate-500">{a.analyst}</div>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <button className="inline-flex items-center gap-1 whitespace-nowrap text-[11px] font-semibold text-brand-primary hover:underline">
                        Investigate <ArrowRight className="size-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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
