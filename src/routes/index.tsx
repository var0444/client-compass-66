import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { LayoutDashboard, Settings2, MapPin, Mail, Building2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { DataTable } from "@/components/DataTable";
import { StatusChip } from "@/components/StatusChip";
import { AddClientDrawer } from "@/components/AddClientDrawer";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { clients, type Client } from "@/lib/clients-data";

export const Route = createFileRoute("/")({
  component: ClientOverview,
  head: () => ({
    meta: [
      { title: "Clients · Client360" },
      { name: "description", content: "Search, expand, and manage clients, contracts, operational units and pricing." },
    ],
  }),
});

const ch = createColumnHelper<Client>();

function ClientOverview() {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [stateFilter, setStateFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const states = useMemo(() => Array.from(new Set(clients.map((c) => c.state))).sort(), []);

  const data = useMemo(() => {
    return clients.filter((c) =>
      (stateFilter === "all" || c.state === stateFilter) &&
      (statusFilter === "all" || c.status === statusFilter)
    );
  }, [stateFilter, statusFilter]);

  const columns = useMemo(
    () => [
      ch.accessor("name", {
        header: "Client",
        cell: (info) => (
          <div className="flex items-center gap-3">
            <span className="grid size-8 shrink-0 place-items-center rounded-md bg-brand-secondary/[0.08] text-xs font-bold text-brand-secondary">
              {info.getValue().slice(0, 2).toUpperCase()}
            </span>
            <div className="min-w-0">
              <div className="truncate font-semibold text-slate-900">{info.getValue()}</div>
              <div className="font-mono text-[11px] text-slate-400">{info.row.original.client360Id}</div>
            </div>
          </div>
        ),
      }),
      ch.accessor("segment", {
        header: "Segment",
        cell: (info) => <span className="text-sm text-slate-600">{info.getValue()}</span>,
      }),
      ch.accessor("city", {
        header: "Location",
        cell: (info) => (
          <span className="text-sm text-slate-600">
            {info.getValue()}, {info.row.original.state} <span className="text-slate-400">· {info.row.original.zipCode}</span>
          </span>
        ),
      }),
      ch.accessor("owner", {
        header: "Owner",
        cell: (info) => <span className="text-sm text-slate-600">{info.getValue()}</span>,
      }),
      ch.accessor("status", {
        header: "Status",
        cell: (info) =>
          info.getValue() === "active" ? (
            <StatusChip tone="success">Active</StatusChip>
          ) : (
            <StatusChip tone="neutral">Inactive</StatusChip>
          ),
      }),
    ],
    [],
  );

  return (
    <AppShell
      breadcrumbs={[{ label: "Clients" }]}
      title="Clients"
      subtitle={`${data.length} client${data.length === 1 ? "" : "s"} in your workspace`}
      actions={
        <Button onClick={() => setOpenDrawer(true)} className="bg-brand-primary text-white hover:bg-brand-primary-hover">
          + Add Client
        </Button>
      }
    >
      <DataTable
        data={data}
        columns={columns}
        searchPlaceholder="Search by name, ID, state, city…"
        searchKeys={["name", "client360Id", "state", "city", "billingAddress", "owner", "segment"]}
        toolbar={
          <>
            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger className="h-9 w-40 border-slate-200 bg-white"><SelectValue placeholder="State" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All states</SelectItem>
                {states.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 w-36 border-slate-200 bg-white"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </>
        }
        renderExpanded={(c) => (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <SectionLabel>Billing Address</SectionLabel>
              <div className="mt-2 flex items-start gap-2 text-sm text-slate-700">
                <MapPin className="mt-0.5 size-4 text-slate-400" />
                <div>
                  <div>{c.billingAddress}</div>
                  <div className="text-slate-500">{c.city}, {c.state} {c.zipCode}</div>
                </div>
              </div>
            </div>
            <div>
              <SectionLabel>Account</SectionLabel>
              <div className="mt-2 space-y-1.5 text-sm">
                <div className="flex items-center gap-2 text-slate-700"><Building2 className="size-4 text-slate-400" /> {c.segment}</div>
                <div className="flex items-center gap-2 text-slate-700"><Mail className="size-4 text-slate-400" /> Owner: {c.owner}</div>
              </div>
            </div>
            <div className="flex flex-col items-start gap-2 md:items-end">
              <SectionLabel className="self-start md:self-end">Quick Access</SectionLabel>
              <div className="flex gap-2">
                <Link
                  to="/clients/$clientId"
                  params={{ clientId: c.id }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-brand-secondary px-3 py-2 text-xs font-semibold text-white hover:bg-brand-secondary-hover"
                >
                  <LayoutDashboard className="size-3.5" /> Dashboard
                </Link>
                <Link
                  to="/clients/$clientId/configuration"
                  params={{ clientId: c.id }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-brand-primary hover:text-brand-primary"
                >
                  <Settings2 className="size-3.5" /> Configuration
                </Link>
              </div>
            </div>
          </div>
        )}
      />

      <AddClientDrawer open={openDrawer} onOpenChange={setOpenDrawer} />
    </AppShell>
  );
}

function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`text-[10px] font-bold uppercase tracking-wider text-slate-400 ${className ?? ""}`}>
      {children}
    </div>
  );
}
