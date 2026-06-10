import { createFileRoute, Link, notFound, Outlet, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Settings2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StatusChip } from "@/components/StatusChip";
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
    <AppShell breadcrumbs={[{ label: "Clients", to: "/" }, { label: "Unknown" }]} title="Client not found">
      <Link to="/" className="text-sm font-medium text-brand-primary">Back to Clients</Link>
    </AppShell>
  ),
  errorComponent: ({ error }) => (
    <AppShell breadcrumbs={[{ label: "Clients", to: "/" }, { label: "Error" }]} title="Something went wrong">
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

  return (
    <AppShell
      breadcrumbs={[
        { label: "Clients", to: "/" },
        { label: client.name },
        { label: isConfig ? "Configuration" : "Dashboard" },
      ]}
      title={client.name}
      subtitle={`${client.client360Id} · ${client.city}, ${client.state} · Owner ${client.owner}`}
      actions={
        <div className="flex items-center gap-3">
          <StatusChip tone={client.status === "active" ? "success" : "neutral"}>
            {client.status === "active" ? "Active" : "Inactive"}
          </StatusChip>
          <span className="hidden text-xs text-slate-400 md:inline">{client.segment}</span>
        </div>
      }
    >
      <div className="mb-5 flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 text-sm shadow-sm w-fit">
        <SubTab to="/clients/$clientId" active={!isConfig} icon={<LayoutDashboard className="size-4" />}>Dashboard</SubTab>
        <SubTab to="/clients/$clientId/configuration" active={isConfig} icon={<Settings2 className="size-4" />}>Configuration</SubTab>
      </div>
      <Outlet />
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
