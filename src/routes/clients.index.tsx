import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { ChevronRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { DataTable } from "@/components/DataTable";
import { StatusChip } from "@/components/StatusChip";
import { AddClientDrawer } from "@/components/AddClientDrawer";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { clients, type Client } from "@/lib/clients-data";

export const Route = createFileRoute("/clients/")({
  component: ClientOverview,
  head: () => ({
    meta: [
      { title: "Clients · Client360" },
      { name: "description", content: "Search, manage, and navigate clients, contracts, operational units and pricing." },
    ],
  }),
});

const ch = createColumnHelper<Client>();

function ClientOverview() {
  const navigate = useNavigate();
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
      ch.accessor("segment", { header: "Segment", cell: (info) => <span className="text-sm text-slate-600">{info.getValue()}</span> }),
      ch.accessor("city", {
        header: "Location",
        cell: (info) => (
          <span className="text-sm text-slate-600">
            {info.getValue()}, {info.row.original.state} <span className="text-slate-400">· {info.row.original.zipCode}</span>
          </span>
        ),
      }),
      ch.accessor("owner", { header: "Owner", cell: (info) => <span className="text-sm text-slate-600">{info.getValue()}</span> }),
      ch.accessor("status", {
        header: "Status",
        cell: (info) =>
          info.getValue() === "active"
            ? <StatusChip tone="success">Active</StatusChip>
            : <StatusChip tone="neutral">Inactive</StatusChip>,
      }),
      ch.display({
        id: "open",
        header: "",
        cell: () => <ChevronRight className="ml-auto size-4 text-slate-300" />,
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
        onRowClick={(c) => navigate({ to: "/clients/$clientId", params: { clientId: c.id } })}
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
      />

      <AddClientDrawer open={openDrawer} onOpenChange={setOpenDrawer} />
    </AppShell>
  );
}
