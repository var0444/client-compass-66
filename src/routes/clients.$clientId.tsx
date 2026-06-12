import { createFileRoute, Link, notFound, Outlet, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { ClipboardList, Pencil, Settings2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StatusChip } from "@/components/StatusChip";
import { Button } from "@/components/ui/button";
import { AddEntityDialog, type FieldDef } from "@/components/AddEntityDialog";
import { getClient } from "@/lib/clients-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/clients/$clientId")({
  loader: ({ params }) => {
    const client = getClient(params.clientId);
    if (!client) throw notFound();
    return { client };
  },
  component: ClientLayout,
  notFoundComponent: () => (
    <AppShell breadcrumbs={[{ label: "Clients", to: "/clients" }, { label: "Unknown" }]} title="Client not found">
      <Link to="/clients" className="text-sm font-medium text-brand-primary">Back to Clients</Link>
    </AppShell>
  ),
  errorComponent: ({ error }) => (
    <AppShell breadcrumbs={[{ label: "Clients", to: "/clients" }, { label: "Error" }]} title="Something went wrong">
      <p className="text-sm text-rose-600">{error.message}</p>
    </AppShell>
  ),
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.client.name ?? "Client"} · Client360` }],
  }),
});

function ClientLayout() {
  const { client } = Route.useLoaderData();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isConfig = pathname.endsWith("/configuration");
  const [editOpen, setEditOpen] = useState(false);

  const editFields: FieldDef[] = [
    { type: "text", key: "name", label: "Client Name", required: true, defaultValue: client.name },
    { type: "text", key: "client360Id", label: "Client360 ID", defaultValue: client.client360Id },
    { type: "select", key: "segment", label: "Segment", defaultValue: client.segment, options: [
      { value: "Enterprise", label: "Enterprise" }, { value: "Mid-Market", label: "Mid-Market" }, { value: "SMB", label: "SMB" },
    ]},
    { type: "text", key: "owner", label: "Account Owner", defaultValue: client.owner },
    { type: "text", key: "billingAddress", label: "Billing Address", full: true, defaultValue: client.billingAddress },
    { type: "text", key: "city", label: "City", defaultValue: client.city },
    { type: "text", key: "state", label: "State", defaultValue: client.state },
    { type: "text", key: "zipCode", label: "ZIP Code", defaultValue: client.zipCode },
    { type: "switch", key: "active", label: "Active client", full: true, defaultValue: client.status === "active" },
  ];

  return (
    <AppShell
      breadcrumbs={[
        { label: "Clients", to: "/clients" },
        { label: client.name },
        { label: isConfig ? "Configuration" : "Summary" },
      ]}
      title={client.name}
      subtitle={`${client.client360Id} · ${client.city}, ${client.state} · Owner ${client.owner}`}
      actions={
        <div className="flex items-center gap-3">
          <StatusChip tone={client.status === "active" ? "success" : "neutral"}>
            {client.status === "active" ? "Active" : "Inactive"}
          </StatusChip>
          <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}>
            <Pencil className="mr-1.5 size-3.5" /> Edit Client
          </Button>
        </div>
      }
    >
      <div className="mb-5 flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 text-sm shadow-sm w-fit">
        <SubTab to="/clients/$clientId" active={!isConfig} icon={<ClipboardList className="size-4" />}>Client Summary</SubTab>
        <SubTab to="/clients/$clientId/configuration" active={isConfig} icon={<Settings2 className="size-4" />}>Configuration</SubTab>
      </div>
      <Outlet />

      <AddEntityDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        title="Edit Client"
        description="Update client information. Changes apply across all linked contracts and operational units."
        fields={editFields}
        submitLabel="Save Changes"
      />
    </AppShell>
  );
}

function SubTab({ to, active, icon, children }: { to: string; active: boolean; icon: React.ReactNode; children: React.ReactNode }) {
  const { client } = Route.useLoaderData();
  return (
    <Link
      to={to}
      params={{ clientId: client.id }}
      className={cn(
        "inline-flex items-center gap-2 rounded-md px-3 py-1.5 font-medium transition-colors",
        active ? "bg-brand-secondary text-white" : "text-slate-600 hover:bg-slate-50",
      )}
    >
      {icon}
      {children}
    </Link>
  );
}
