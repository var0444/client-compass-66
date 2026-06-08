import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { clients } from "@/lib/clients-data";

export const Route = createFileRoute("/")({
  component: ClientOverview,
  head: () => ({
    meta: [
      { title: "Client Overview · Client360" },
      { name: "description", content: "Manage clients, contracts, operational units and pricing in one workspace." },
    ],
  }),
});

function ClientOverview() {
  return (
    <AppShell breadcrumbs={[{ label: "Clients" }]}>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Client Overview</h1>
          <p className="mt-2 text-sm text-slate-500">
            Number of clients: <span className="font-semibold text-slate-700">{clients.length}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <button className="inline-flex items-center rounded-lg border border-slate-200 bg-surface-card px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50">
            Filter
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-primary-hover">
            <span className="text-base leading-none">+</span> Add Client
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-surface-card shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-6 py-4">Actions</th>
              <th className="px-6 py-4">Client Name</th>
              <th className="px-6 py-4">Client360 ID</th>
              <th className="px-6 py-4">Billing Address</th>
              <th className="px-6 py-4">State</th>
              <th className="px-6 py-4">City</th>
              <th className="px-6 py-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {clients.map((c) => (
              <tr key={c.id} className="transition-colors hover:bg-slate-50/50">
                <td className="px-6 py-4">
                  <Link
                    to="/clients/$clientId"
                    params={{ clientId: c.id }}
                    className="inline-flex size-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition-colors hover:border-brand-primary hover:text-brand-primary"
                    aria-label={`Manage ${c.name}`}
                  >
                    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 2v6h6M9 13h6M9 17h6" />
                    </svg>
                  </Link>
                </td>
                <td className="px-6 py-4">
                  <Link to="/clients/$clientId" params={{ clientId: c.id }} className="font-semibold text-slate-900 hover:text-brand-primary">
                    {c.name}
                  </Link>
                </td>
                <td className="px-6 py-4 font-mono text-xs text-slate-600">{c.client360Id}</td>
                <td className="px-6 py-4 text-slate-600">{c.billingAddress}</td>
                <td className="px-6 py-4 text-slate-600">{c.state}</td>
                <td className="px-6 py-4 text-slate-600">{c.city}</td>
                <td className="px-6 py-4 text-right">
                  {c.status === "active" ? (
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">Active</span>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">Inactive</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
