import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { contractsByClient, getClient } from "@/lib/clients-data";

export const Route = createFileRoute("/clients/$clientId/contracts")({
  loader: ({ params }) => {
    const client = getClient(params.clientId);
    if (!client) throw notFound();
    return { client };
  },
  component: ContractsPage,
  notFoundComponent: () => (
    <AppShell breadcrumbs={[{ label: "Clients", to: "/" }, { label: "Unknown" }]}>
      <p>Client not found.</p>
    </AppShell>
  ),
  errorComponent: ({ error }) => (
    <AppShell breadcrumbs={[{ label: "Clients", to: "/" }]}>
      <p className="text-sm text-red-600">{error.message}</p>
    </AppShell>
  ),
  head: ({ loaderData }) => ({
    meta: [{ title: `Contracts · ${loaderData?.client.name ?? "Client"}` }],
  }),
});

function ContractsPage() {
  const { client } = Route.useLoaderData();
  const contracts = contractsByClient[client.id] ?? [];

  return (
    <AppShell
      breadcrumbs={[
        { label: "Clients", to: "/" },
        { label: client.name, to: "/clients/$clientId".replace("$clientId", client.id) },
        { label: "Client Contracts" },
      ]}
    >
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contracts</h1>
          <p className="mt-2 text-sm text-slate-500">
            Number of client contracts: <span className="font-semibold text-slate-700">{contracts.length}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <button className="inline-flex items-center rounded-lg border border-slate-200 bg-surface-card px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50">
            Filter
          </button>
          <button className="inline-flex items-center rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-primary-hover">
            + Add Client Contract
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-surface-card shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-6 py-4">Contract ID</th>
              <th className="px-6 py-4">Start Date</th>
              <th className="px-6 py-4">End Date</th>
              <th className="px-6 py-4">Term</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Source</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {contracts.map((c) => (
              <tr key={c.id} className={c.status === "Active" ? "bg-blue-50/40" : "hover:bg-slate-50/50"}>
                <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-900">{c.id}</td>
                <td className="px-6 py-4 text-slate-600">{c.start}</td>
                <td className="px-6 py-4 text-slate-600">{c.end}</td>
                <td className="px-6 py-4 text-slate-600">{c.term}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={c.status} />
                </td>
                <td className="px-6 py-4 text-slate-600">{c.source}</td>
                <td className="px-6 py-4 text-right">
                  <button className="font-medium text-brand-primary hover:text-brand-primary-hover">Manage</button>
                </td>
              </tr>
            ))}
            {contracts.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-500">
                  No contracts yet.
                  <div className="mt-2">
                    <Link to="/clients/$clientId" params={{ clientId: client.id }} className="text-brand-primary">
                      Back to client
                    </Link>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}

function StatusBadge({ status }: { status: "Active" | "Expired" | "Draft" }) {
  const map = {
    Active: "bg-emerald-100 text-emerald-700",
    Expired: "bg-slate-100 text-slate-600",
    Draft: "bg-amber-100 text-amber-700",
  } as const;
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${map[status]}`}>{status}</span>
  );
}
