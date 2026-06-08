import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  contractsByClient,
  getClient,
  operationalUnitsByClient,
  type OperationalUnit,
} from "@/lib/clients-data";

export const Route = createFileRoute("/clients/$clientId")({
  loader: ({ params }) => {
    const client = getClient(params.clientId);
    if (!client) throw notFound();
    return { client };
  },
  component: ClientDetail,
  notFoundComponent: () => (
    <AppShell breadcrumbs={[{ label: "Clients", to: "/" }, { label: "Unknown" }]}>
      <div className="rounded-xl border border-slate-200 bg-surface-card p-12 text-center">
        <h2 className="text-lg font-semibold">Client not found</h2>
        <Link to="/" className="mt-2 inline-block text-sm font-medium text-brand-primary">Back to Clients</Link>
      </div>
    </AppShell>
  ),
  errorComponent: ({ error }) => (
    <AppShell breadcrumbs={[{ label: "Clients", to: "/" }, { label: "Error" }]}>
      <p className="text-sm text-red-600">{error.message}</p>
    </AppShell>
  ),
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.client.name ?? "Client"} · Client360` }],
  }),
});

type Tab = "units" | "pricing" | "groups" | "history";

function ClientDetail() {
  const { client } = Route.useLoaderData();
  const contracts = contractsByClient[client.id] ?? [];
  const units = operationalUnitsByClient[client.id] ?? [];
  const activeContract = contracts.find((c) => c.status === "Active");
  const [tab, setTab] = useState<Tab>("units");
  const [selectedUnit, setSelectedUnit] = useState(units[0]?.id);

  return (
    <AppShell
      breadcrumbs={[
        { label: "Clients", to: "/" },
        { label: client.name },
      ]}
    >
      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{client.name}</h1>
            {client.status === "active" && (
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                ACTIVE CLIENT
              </span>
            )}
          </div>
          <p className="text-slate-500">
            ID: <span className="font-mono">{client.client360Id}</span> • {client.billingAddress}, {client.city}, {client.state}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/clients/$clientId/contracts"
            params={{ clientId: client.id }}
            className="inline-flex items-center rounded-lg border border-slate-200 bg-surface-card px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            All Contracts
          </Link>
          <button className="inline-flex items-center rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-primary-hover">
            + Add Operational Unit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="col-span-12 space-y-8 lg:col-span-4">
          <section className="rounded-xl border border-slate-200 bg-surface-card p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Active Contract</h2>
              <Link
                to="/clients/$clientId/contracts"
                params={{ clientId: client.id }}
                className="text-[10px] font-bold text-brand-primary underline"
              >
                VIEW ALL ({contracts.length})
              </Link>
            </div>
            {activeContract ? (
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-slate-400">Contract ID</div>
                  <div className="font-semibold font-mono text-sm">{activeContract.id}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-slate-400">Start Date</div>
                    <div className="text-sm font-medium">{activeContract.start}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">End Date</div>
                    <div className="text-sm font-medium">{activeContract.end}</div>
                  </div>
                </div>
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <div className="mb-1 text-xs text-slate-500">Base Pricing Plan</div>
                  <div className="flex items-center justify-between font-semibold text-slate-900">
                    <span>{activeContract.basePricing}</span>
                    <span className="text-brand-primary">{activeContract.monthlyValue}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No active contract.</p>
            )}
          </section>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 bg-surface-card p-4 shadow-sm">
              <div className="text-xs font-medium text-slate-500">Operational Units</div>
              <div className="mt-1 text-2xl font-bold">{units.length}</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-surface-card p-4 shadow-sm">
              <div className="text-xs font-medium text-slate-500">Total Products</div>
              <div className="mt-1 text-2xl font-bold">
                {units.reduce((a, u) => a + u.products.length, 0)}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-span-12 space-y-6 lg:col-span-8">
          <div className="flex items-center border-b border-slate-200">
            {(
              [
                ["units", "Operational Units"],
                ["pricing", "Pricing Models"],
                ["groups", "Client Groups"],
                ["history", "History"],
              ] as [Tab, string][]
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={
                  tab === key
                    ? "border-b-2 border-brand-primary px-4 py-2 text-sm font-semibold text-brand-primary"
                    : "px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700"
                }
              >
                {label}
              </button>
            ))}
          </div>

          {tab === "units" && (
            <>
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-surface-card shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-6 py-4">Operational Unit</th>
                      <th className="px-6 py-4">Region</th>
                      <th className="px-6 py-4">Products</th>
                      <th className="px-6 py-4">Pricing Override</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {units.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900">{u.name}</div>
                          <div className="font-mono text-[11px] text-slate-400">{u.id}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{u.region}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-xs font-medium">
                            {u.skuCount} SKUs
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <PricingTag tone={u.pricingOverride.tone} label={u.pricingOverride.label} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedUnit(u.id);
                              setTab("pricing");
                            }}
                            className="font-medium text-brand-primary hover:text-brand-primary-hover"
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <div className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-slate-200">
                  <span className="text-lg font-bold text-slate-400">⤡</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-900">Hierarchical Mapping View</h3>
                <p className="mx-auto mt-1 max-w-xs text-xs text-slate-500">
                  Visualize how your {units.length} operational units map to the active contract pricing tiers and client groups.
                </p>
                <button className="mt-4 text-xs font-bold uppercase tracking-widest text-brand-primary hover:underline">
                  Open Map Canvas
                </button>
              </div>
            </>
          )}

          {tab === "pricing" && (
            <PricingMapping
              units={units}
              selected={selectedUnit ?? units[0]?.id}
              onSelect={setSelectedUnit}
            />
          )}

          {tab === "groups" && (
            <EmptyPanel title="Client Groups" desc="Group related operational units for consolidated billing and reporting." />
          )}
          {tab === "history" && (
            <EmptyPanel title="History" desc="A timeline of contract, pricing and operational unit changes will appear here." />
          )}
        </div>
      </div>
    </AppShell>
  );
}

function PricingTag({ tone, label }: { tone: "amber" | "emerald" | "neutral"; label: string }) {
  if (tone === "amber") {
    return (
      <span className="rounded border border-amber-100 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-600">
        {label}
      </span>
    );
  }
  if (tone === "emerald") {
    return (
      <span className="rounded border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600">
        {label}
      </span>
    );
  }
  return <span className="text-xs italic text-slate-400">{label}</span>;
}

function PricingMapping({
  units,
  selected,
  onSelect,
}: {
  units: OperationalUnit[];
  selected?: string;
  onSelect: (id: string) => void;
}) {
  const list = units;
  const unit = list.find((u) => u.id === selected) ?? list[0];
  if (!unit)
    return <EmptyPanel title="No operational units" desc="Add an operational unit to start mapping products and pricing." />;
  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-4 space-y-1 rounded-xl border border-slate-200 bg-surface-card p-2 shadow-sm">
        {list.map((u) => (
          <button
            key={u.id}
            onClick={() => onSelect(u.id)}
            className={
              u.id === unit.id
                ? "block w-full rounded-md bg-brand-primary px-3 py-2 text-left text-sm font-semibold text-white"
                : "block w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
            }
          >
            <div>{u.name}</div>
            <div className={u.id === unit.id ? "font-mono text-[11px] text-white/70" : "font-mono text-[11px] text-slate-400"}>
              {u.id}
            </div>
          </button>
        ))}
      </div>
      <div className="col-span-8 overflow-hidden rounded-xl border border-slate-200 bg-surface-card shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50 px-6 py-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Product Pricing · {unit.name}
          </div>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="text-xs font-medium text-slate-500">
            <tr className="border-b border-slate-100">
              <th className="px-6 py-3">Product</th>
              <th className="px-6 py-3">Model</th>
              <th className="px-6 py-3 text-right">Base</th>
              <th className="px-6 py-3 text-right">Adjusted</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {unit.products.map((p: any) => (
              <tr key={p.name} className="hover:bg-slate-50/50">
                <td className="px-6 py-3 font-medium text-slate-900">{p.name}</td>
                <td className="px-6 py-3 text-slate-600">{p.model}</td>
                <td className="px-6 py-3 text-right text-slate-500">{p.basePrice}</td>
                <td className="px-6 py-3 text-right">
                  <input
                    defaultValue={p.adjusted}
                    className="w-24 rounded border border-transparent bg-transparent px-2 py-1 text-right font-medium outline-none transition-colors hover:border-slate-200 focus:border-brand-primary"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EmptyPanel({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">{desc}</p>
    </div>
  );
}
