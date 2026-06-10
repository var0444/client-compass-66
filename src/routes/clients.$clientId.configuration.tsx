import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { FileText, Boxes, Tags, Link2 } from "lucide-react";
import { DataTable } from "@/components/DataTable";
import { StatusChip, statusToTone } from "@/components/StatusChip";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  contractsByClient,
  getClient,
  operationalUnitsByClient,
  type CagAssociation,
  type Contract,
  type OperationalUnit,
  type ProductPrice,
} from "@/lib/clients-data";

export const Route = createFileRoute("/clients/$clientId/configuration")({
  loader: ({ params }) => ({ client: getClient(params.clientId) }),
  component: ClientConfiguration,
});

type TabKey = "contracts" | "units" | "pricing" | "cags";

function ClientConfiguration() {
  const { client } = Route.useLoaderData();
  const [tab, setTab] = useState<TabKey>("contracts");
  if (!client) return null;

  const contracts = contractsByClient[client.id] ?? [];
  const units = operationalUnitsByClient[client.id] ?? [];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 pb-px">
        <TabBtn k="contracts" cur={tab} set={setTab} icon={<FileText className="size-4" />} count={contracts.length}>Contracts</TabBtn>
        <TabBtn k="units" cur={tab} set={setTab} icon={<Boxes className="size-4" />} count={units.length}>Operational Units</TabBtn>
        <TabBtn k="pricing" cur={tab} set={setTab} icon={<Tags className="size-4" />}>Pricing Models</TabBtn>
        <TabBtn k="cags" cur={tab} set={setTab} icon={<Link2 className="size-4" />}>CAG Associations</TabBtn>
      </div>

      {tab === "contracts" && <ContractsTab contracts={contracts} units={units} />}
      {tab === "units" && <UnitsTab units={units} />}
      {tab === "pricing" && <PricingTab units={units} contracts={contracts} />}
      {tab === "cags" && <CagsTab units={units} />}
    </div>
  );
}

function TabBtn({
  k, cur, set, icon, count, children,
}: { k: TabKey; cur: TabKey; set: (k: TabKey) => void; icon: React.ReactNode; count?: number; children: React.ReactNode }) {
  const active = cur === k;
  return (
    <button
      onClick={() => set(k)}
      className={cn(
        "relative inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors",
        active ? "text-brand-primary" : "text-slate-500 hover:text-slate-900",
      )}
    >
      {icon}
      {children}
      {count !== undefined && (
        <span className={cn(
          "ml-1 rounded-full px-1.5 py-px text-[10px] font-semibold",
          active ? "bg-brand-primary/10 text-brand-primary" : "bg-slate-100 text-slate-500",
        )}>{count}</span>
      )}
      {active && <span className="absolute -bottom-px left-0 right-0 h-0.5 rounded-full bg-brand-primary" />}
    </button>
  );
}

/* -------------------- Contracts -------------------- */

const cHelper = createColumnHelper<Contract>();

function ContractsTab({ contracts, units }: { contracts: Contract[]; units: OperationalUnit[] }) {
  const columns = useMemo(() => [
    cHelper.accessor("id", {
      header: "Contract",
      cell: (i) => <span className="font-mono text-xs font-semibold text-slate-900">{i.getValue()}</span>,
    }),
    cHelper.accessor("basePricing", {
      header: "Base Pricing",
      cell: (i) => <span className="text-sm text-slate-700">{i.getValue()}</span>,
    }),
    cHelper.accessor("monthlyValue", { header: "Monthly Value", cell: (i) => <span className="text-sm font-semibold text-slate-900">{i.getValue()}</span> }),
    cHelper.accessor("start", { header: "Effective Range", cell: (i) => <span className="text-sm text-slate-600">{i.getValue()} → {i.row.original.end}</span> }),
    cHelper.accessor("unitsLinked", { header: "Units Linked", cell: (i) => <span className="text-sm text-slate-600">{i.getValue()} OUs</span> }),
    cHelper.accessor("status", { header: "Status", cell: (i) => <StatusChip tone={statusToTone(i.getValue())}>{i.getValue()}</StatusChip> }),
  ], []);

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Contracts"
        desc="Multiple contracts allowed. Only one is Active at any time. Expand a row to see linked operational units."
        action={<Button size="sm" className="bg-brand-primary text-white hover:bg-brand-primary-hover">+ Add Contract</Button>}
      />
      <DataTable
        data={contracts}
        columns={columns}
        searchPlaceholder="Search contracts…"
        emptyMessage="No contracts on file."
        renderExpanded={(c) => {
          const linked = units.filter((u) => u.contractId === c.id);
          return (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <Detail label="Source" value={c.source} />
              <Detail label="Term" value={c.term} />
              <Detail label="Status" value={<StatusChip tone={statusToTone(c.status)}>{c.status}</StatusChip>} />
              <div className="md:col-span-3">
                <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Operational Units on this contract ({linked.length})
                </div>
                {linked.length === 0 ? (
                  <div className="text-sm text-slate-500">No units linked yet.</div>
                ) : (
                  <ul className="grid gap-2 md:grid-cols-2">
                    {linked.map((u) => (
                      <li key={u.id} className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm">
                        <div>
                          <div className="font-medium text-slate-900">{u.name}</div>
                          <div className="font-mono text-[11px] text-slate-400">{u.id} · {u.region}</div>
                        </div>
                        <StatusChip tone={statusToTone(u.status)}>{u.status}</StatusChip>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          );
        }}
      />
    </div>
  );
}

/* -------------------- Operational Units -------------------- */

const uHelper = createColumnHelper<OperationalUnit>();

function UnitsTab({ units }: { units: OperationalUnit[] }) {
  const columns = useMemo(() => [
    uHelper.accessor("name", {
      header: "Operational Unit",
      cell: (i) => (
        <div>
          <div className="font-semibold text-slate-900">{i.getValue()}</div>
          <div className="font-mono text-[11px] text-slate-400">{i.row.original.id}</div>
        </div>
      ),
    }),
    uHelper.accessor("region", { header: "Region", cell: (i) => <span className="text-sm text-slate-600">{i.getValue()}</span> }),
    uHelper.accessor("contractId", { header: "Contract", cell: (i) => <span className="font-mono text-xs text-slate-700">{i.getValue()}</span> }),
    uHelper.accessor("skuCount", { header: "Products", cell: (i) => <span className="text-sm text-slate-700">{i.getValue()} SKUs</span> }),
    uHelper.accessor("pricingOverride", {
      header: "Pricing",
      cell: (i) => {
        const t = i.getValue().tone;
        const tone = t === "amber" ? "warning" : t === "emerald" ? "success" : "neutral";
        return <StatusChip tone={tone}>{i.getValue().label}</StatusChip>;
      },
    }),
    uHelper.accessor("status", { header: "Status", cell: (i) => <StatusChip tone={statusToTone(i.getValue())}>{i.getValue()}</StatusChip> }),
  ], []);

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Operational Units"
        desc="Sub-client groups under this client. Expand a row to manage product pricing overrides and CAG associations inline."
        action={<Button size="sm" className="bg-brand-primary text-white hover:bg-brand-primary-hover">+ Add Operational Unit</Button>}
      />
      <DataTable
        data={units}
        columns={columns}
        searchPlaceholder="Search operational units…"
        emptyMessage="No operational units yet."
        renderExpanded={(u) => (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <Detail label="Effective From" value={u.effectiveFrom} />
              <Detail label="Effective To" value={u.effectiveTo} />
              <Detail label="Region" value={u.region} />
              <Detail label="Linked Contract" value={<span className="font-mono text-xs">{u.contractId}</span>} />
            </div>
            <InlinePricingEditor products={u.products} />
          </div>
        )}
      />
    </div>
  );
}

function InlinePricingEditor({ products }: { products: ProductPrice[] }) {
  return (
    <div>
      <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Product pricing · inline edit</div>
      <div className="overflow-hidden rounded-lg border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50/60 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-3 py-2 text-left">Product</th>
              <th className="px-3 py-2 text-left">Model</th>
              <th className="px-3 py-2 text-right">Base</th>
              <th className="px-3 py-2 text-right">Adjusted</th>
              <th className="px-3 py-2 text-right">Δ</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const base = parseFloat(p.basePrice.replace(/[^0-9.]/g, ""));
              const adj = parseFloat(p.adjusted.replace(/[^0-9.]/g, ""));
              const delta = base ? ((adj - base) / base) * 100 : 0;
              return (
                <tr key={p.name} className="border-t border-slate-100">
                  <td className="px-3 py-2 font-medium text-slate-900">{p.name}</td>
                  <td className="px-3 py-2 text-slate-600">{p.model}</td>
                  <td className="px-3 py-2 text-right text-slate-500">{p.basePrice}</td>
                  <td className="px-3 py-2 text-right">
                    <Input defaultValue={p.adjusted} className="h-8 w-24 text-right" />
                  </td>
                  <td className="px-3 py-2 text-right text-xs font-semibold">
                    <span className={delta < 0 ? "text-emerald-600" : delta > 0 ? "text-rose-600" : "text-slate-400"}>
                      {delta === 0 ? "—" : `${delta > 0 ? "+" : ""}${delta.toFixed(1)}%`}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* -------------------- Pricing Models -------------------- */

function PricingTab({ units, contracts }: { units: OperationalUnit[]; contracts: Contract[] }) {
  const active = contracts.find((c) => c.status === "Active");
  return (
    <div className="space-y-4">
      <SectionHeader
        title="Pricing Models"
        desc="Compare contract base pricing with operational unit overrides side-by-side."
      />
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Contract Base</div>
            <div className="font-mono text-xs text-slate-500">{active?.id ?? "—"}</div>
            <div className="mt-0.5 font-semibold text-slate-900">{active?.basePricing ?? "No active contract"}</div>
          </div>
          <StatusChip tone="info">Inherited by all OUs unless overridden</StatusChip>
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/60 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-3 py-2 text-left">Product</th>
                <th className="px-3 py-2 text-left">Model</th>
                <th className="px-3 py-2 text-right">Base</th>
                {units.map((u) => (
                  <th key={u.id} className="px-3 py-2 text-right">{u.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from(new Set(units.flatMap((u) => u.products.map((p) => p.name)))).map((name) => {
                const first = units.flatMap((u) => u.products).find((p) => p.name === name);
                return (
                  <tr key={name} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-medium text-slate-900">{name}</td>
                    <td className="px-3 py-2 text-slate-600">{first?.model}</td>
                    <td className="px-3 py-2 text-right text-slate-500">{first?.basePrice}</td>
                    {units.map((u) => {
                      const p = u.products.find((pp) => pp.name === name);
                      if (!p) return <td key={u.id} className="px-3 py-2 text-right text-slate-300">—</td>;
                      const base = parseFloat(p.basePrice.replace(/[^0-9.]/g, ""));
                      const adj = parseFloat(p.adjusted.replace(/[^0-9.]/g, ""));
                      const same = base === adj;
                      return (
                        <td key={u.id} className={cn("px-3 py-2 text-right font-medium", same ? "text-slate-500" : "text-brand-secondary")}>
                          {p.adjusted}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* -------------------- CAGs -------------------- */

function CagsTab({ units }: { units: OperationalUnit[] }) {
  const rows = units.flatMap((u) => u.cags.map((c) => ({ ...c, ouName: u.name, ouId: u.id })));
  const helper = createColumnHelper<typeof rows[number]>();
  const columns = useMemo(() => [
    helper.accessor("ouName", {
      header: "Operational Unit",
      cell: (i) => (
        <div>
          <div className="font-medium text-slate-900">{i.getValue()}</div>
          <div className="font-mono text-[11px] text-slate-400">{i.row.original.ouId}</div>
        </div>
      ),
    }),
    helper.accessor("carrier", { header: "Carrier", cell: (i) => <span className="text-sm text-slate-700">{i.getValue()}</span> }),
    helper.accessor("account", { header: "Account", cell: (i) => <span className="font-mono text-xs text-slate-600">{i.getValue()}</span> }),
    helper.accessor("group", { header: "Group", cell: (i) => <span className="text-sm text-slate-700">{i.getValue()}</span> }),
    helper.accessor("effectiveFrom", { header: "Effective Range", cell: (i) => <span className="text-sm text-slate-600">{i.getValue()} → {i.row.original.effectiveTo}</span> }),
    helper.accessor("status", { header: "Status", cell: (i) => <StatusChip tone={statusToTone(i.getValue())}>{i.getValue()}</StatusChip> }),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], []);

  return (
    <div className="space-y-4">
      <SectionHeader
        title="CAG Associations"
        desc="Carrier + Account + Group mappings across operational units, scoped by effective date."
        action={<Button size="sm" className="bg-brand-primary text-white hover:bg-brand-primary-hover">+ Add CAG</Button>}
      />
      <DataTable
        data={rows}
        columns={columns}
        searchPlaceholder="Search by carrier, account or unit…"
        emptyMessage="No CAG associations yet."
        renderExpanded={(c: CagAssociation & { ouName: string; ouId: string }) => (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Detail label="Carrier" value={c.carrier} />
            <Detail label="Account" value={<span className="font-mono text-xs">{c.account}</span>} />
            <Detail label="Group" value={c.group} />
            <Detail label="Status" value={<StatusChip tone={statusToTone(c.status)}>{c.status}</StatusChip>} />
            <Detail label="Effective From" value={c.effectiveFrom} />
            <Detail label="Effective To" value={c.effectiveTo} />
          </div>
        )}
      />
    </div>
  );
}

/* -------------------- Helpers -------------------- */

function SectionHeader({ title, desc, action }: { title: string; desc: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-500">{desc}</p>
      </div>
      {action}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</div>
      <div className="mt-1 text-sm font-medium text-slate-800">{value}</div>
    </div>
  );
}
