import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { TrendingUp, TrendingDown, FileBarChart, BarChart3, Filter, Download, ChevronRight } from "lucide-react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
  Pie, PieChart, Cell, Legend,
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

type Tab = "metrics" | "reports";

function DashboardPage() {
  const [tab, setTab] = useState<Tab>("metrics");
  const [period, setPeriod] = useState("90");

  return (
    <AppShell
      breadcrumbs={[{ label: "Dashboard" }]}
      title="Dashboard"
      subtitle="Metrics, analytics, and reports across all clients."
      actions={
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
      }
    >
      <div className="space-y-5">
        <div className="flex items-center gap-1 border-b border-slate-200">
          <TabBtn active={tab === "metrics"} onClick={() => setTab("metrics")} icon={<BarChart3 className="size-4" />}>Metrics & Analytics</TabBtn>
          <TabBtn active={tab === "reports"} onClick={() => setTab("reports")} icon={<FileBarChart className="size-4" />}>Reports</TabBtn>
        </div>

        {tab === "metrics" ? <MetricsView /> : <ReportsView />}
      </div>
    </AppShell>
  );
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

function MetricsView() {
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

function ReportsView() {
  const [reportId, setReportId] = useState<string>(reports[0].id);
  const [carrier, setCarrier] = useState("all");
  const [search, setSearch] = useState("");
  const report = reports.find((r) => r.id === reportId)!;

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[260px_1fr]">
      <aside className="rounded-xl border border-slate-200 bg-white p-3">
        <div className="px-2 pb-2 pt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Available Reports</div>
        <ul className="space-y-0.5">
          {reports.map((r) => (
            <li key={r.id}>
              <button
                onClick={() => setReportId(r.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm",
                  reportId === r.id ? "bg-brand-secondary/[0.08] text-brand-secondary" : "text-slate-600 hover:bg-slate-50",
                )}
              >
                <span>{r.name}</span>
                <ChevronRight className="size-3.5 opacity-50" />
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">{report.name}</h3>
            <p className="text-sm text-slate-500">{report.desc}</p>
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

        <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/60 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                {report.columns.map((c) => <th key={c} className="px-3 py-2 text-left">{c}</th>)}
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
