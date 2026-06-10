import { createFileRoute } from "@tanstack/react-router";
import { TrendingUp, TrendingDown, Activity, AlertTriangle, CheckCircle2, Package } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { contractsByClient, dashboardMetrics, getClient, operationalUnitsByClient } from "@/lib/clients-data";
import { StatusChip } from "@/components/StatusChip";

export const Route = createFileRoute("/clients/$clientId/")({
  loader: ({ params }) => {
    const client = getClient(params.clientId);
    return { client };
  },
  component: ClientDashboard,
});

function ClientDashboard() {
  const { client } = Route.useLoaderData();
  if (!client) return null;
  const contracts = contractsByClient[client.id] ?? [];
  const units = operationalUnitsByClient[client.id] ?? [];
  const activeContract = contracts.find((c) => c.status === "Active");

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Monthly Revenue" value="$61.2K" trend="+8.4%" up icon={<TrendingUp className="size-4" />} />
        <Kpi label="Active Operational Units" value={String(units.length)} trend={`${contracts.length} contracts`} up icon={<Package className="size-4" />} />
        <Kpi label="Job Success Rate" value="98.7%" trend="+0.6%" up icon={<CheckCircle2 className="size-4" />} />
        <Kpi label="Open Alerts" value="3" trend="−2 this week" up={false} icon={<AlertTriangle className="size-4" />} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Revenue trend</h3>
              <p className="text-xs text-slate-500">Last 6 months</p>
            </div>
            <span className="text-xs font-medium text-emerald-600">+45% vs prior period</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboardMetrics.monthlyRevenue}>
                <defs>
                  <linearGradient id="rev" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#FF612B" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#FF612B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={40} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Area type="monotone" dataKey="value" stroke="#FF612B" strokeWidth={2} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Active Contract</h3>
          {activeContract ? (
            <div className="mt-3 space-y-3 text-sm">
              <div className="font-mono text-xs text-slate-500">{activeContract.id}</div>
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                <div className="text-xs text-slate-500">{activeContract.basePricing}</div>
                <div className="mt-0.5 text-lg font-bold text-brand-secondary">{activeContract.monthlyValue}</div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-slate-400">Start</div>
                  <div className="font-medium text-slate-700">{activeContract.start}</div>
                </div>
                <div>
                  <div className="text-slate-400">End</div>
                  <div className="font-medium text-slate-700">{activeContract.end}</div>
                </div>
              </div>
              <StatusChip tone="success">{activeContract.status}</StatusChip>
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500">No active contract</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Job operations</h3>
            <p className="text-xs text-slate-500">Completed vs failed, last 7 days</p>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardMetrics.jobOps}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={40} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Bar dataKey="completed" fill="#002677" radius={[4, 4, 0, 0]} />
                <Bar dataKey="failed" fill="#FF612B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Activity</h3>
          <ul className="mt-3 space-y-3 text-sm">
            <Activity2 icon={<CheckCircle2 className="size-4 text-emerald-500" />} title="Pricing override approved" detail="OU-9902 · Volume Discount" time="2h ago" />
            <Activity2 icon={<TrendingUp className="size-4 text-brand-primary" />} title="Revenue milestone reached" detail="$60K MRR for the first time" time="Yesterday" />
            <Activity2 icon={<AlertTriangle className="size-4 text-amber-500" />} title="CAG nearing expiry" detail="CAG-001 expires Dec 31" time="2 days ago" />
            <Activity2 icon={<Activity className="size-4 text-sky-500" />} title="Contract drafted" detail="CONT-2025-0001" time="1 week ago" />
          </ul>
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, trend, up, icon }: { label: string; value: string; trend: string; up: boolean; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">{label}</span>
        <span className="grid size-7 place-items-center rounded-md bg-slate-50 text-slate-500">{icon}</span>
      </div>
      <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{value}</div>
      <div className={`mt-1 inline-flex items-center gap-1 text-xs font-medium ${up ? "text-emerald-600" : "text-rose-600"}`}>
        {up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
        {trend}
      </div>
    </div>
  );
}

function Activity2({ icon, title, detail, time }: { icon: React.ReactNode; title: string; detail: string; time: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5">{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-slate-900">{title}</div>
        <div className="truncate text-xs text-slate-500">{detail}</div>
      </div>
      <span className="shrink-0 text-[11px] text-slate-400">{time}</span>
    </li>
  );
}
