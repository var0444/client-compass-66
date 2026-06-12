import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { FileText, Boxes, Tags, Link2, ArrowRight } from "lucide-react";
import { DataTable } from "@/components/DataTable";
import { StatusChip, statusToTone } from "@/components/StatusChip";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ExpandedShell, FieldRow } from "@/components/ExpandedShell";
import { AddEntityDialog, type FieldDef } from "@/components/AddEntityDialog";
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
      {tab === "units" && <UnitsTab units={units} contracts={contracts} />}
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
  const [openAdd, setOpenAdd] = useState(false);
  const columns = useMemo(() => [
    cHelper.accessor("id", { header: "Contract", cell: (i) => <span className="font-mono text-xs font-semibold text-slate-900">{i.getValue()}</span> }),
    cHelper.accessor("basePricing", { header: "Base Pricing", cell: (i) => <span className="text-sm text-slate-700">{i.getValue()}</span> }),
    cHelper.accessor("monthlyValue", { header: "Monthly Value", cell: (i) => <span className="text-sm font-semibold text-slate-900">{i.getValue()}</span> }),
    cHelper.accessor("start", { header: "Effective Range", cell: (i) => <span className="text-sm text-slate-600">{i.getValue()} → {i.row.original.end}</span> }),
    cHelper.accessor("unitsLinked", { header: "Units Linked", cell: (i) => <span className="text-sm text-slate-600">{i.getValue()} OUs</span> }),
    cHelper.accessor("status", { header: "Status", cell: (i) => <StatusChip tone={statusToTone(i.getValue())}>{i.getValue()}</StatusChip> }),
  ], []);

  const fields: FieldDef[] = [
    { type: "text", key: "id", label: "Contract ID", placeholder: "CONT-2025-0010", required: true },
    { type: "select", key: "source", label: "Source", options: [
      { value: "direct", label: "Direct Sales" }, { value: "partner", label: "Partner Referral" }, { value: "renewal", label: "Renewal" },
    ]},
    { type: "date", key: "start", label: "Start Date", required: true },
    { type: "date", key: "end", label: "End Date", required: true },
    { type: "select", key: "basePricing", label: "Base Pricing Plan", options: [
      { value: "premium", label: "Premium Global Tier" }, { value: "standard", label: "Standard Tier" }, { value: "custom", label: "Custom Tier" },
    ], full: true },
    { type: "text", key: "monthlyValue", label: "Monthly Value", placeholder: "$1,200" },
    { type: "text", key: "term", label: "Term", placeholder: "12 Months" },
    { type: "multiselect", key: "linkedUnits", label: "Link Operational Units",
      options: units.map((u) => ({ value: u.id, label: `${u.name} (${u.id})` })), full: true },
    { type: "switch", key: "activate", label: "Set as Active contract (deactivates current active)", full: true },
    { type: "textarea", key: "notes", label: "Notes", placeholder: "Internal notes…", full: true },
  ];

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Contracts"
        desc="Multiple contracts allowed. Only one is Active at any time. Expand a row to view details and edit inline."
        action={<Button size="sm" onClick={() => setOpenAdd(true)} className="bg-brand-primary text-white hover:bg-brand-primary-hover">+ Add Contract</Button>}
      />
      <DataTable
        data={contracts}
        columns={columns}
        searchPlaceholder="Search contracts…"
        emptyMessage="No contracts on file."
        renderExpanded={(c) => {
          const linked = units.filter((u) => u.contractId === c.id);
          return (
            <ExpandedShell
              sections={[
                {
                  id: "overview",
                  title: "Contract overview",
                  description: "Top-level identifiers and term.",
                  view: (
                    <div>
                      <FieldRow label="Contract ID"><span className="font-mono text-xs">{c.id}</span></FieldRow>
                      <FieldRow label="Source">{c.source}</FieldRow>
                      <FieldRow label="Term">{c.term}</FieldRow>
                      <FieldRow label="Status"><StatusChip tone={statusToTone(c.status)}>{c.status}</StatusChip></FieldRow>
                    </div>
                  ),
                  edit: (
                    <div className="grid grid-cols-2 gap-3">
                      <FieldLabel label="Source"><Input defaultValue={c.source} /></FieldLabel>
                      <FieldLabel label="Term"><Input defaultValue={c.term} /></FieldLabel>
                      <FieldLabel label="Start"><Input type="date" /></FieldLabel>
                      <FieldLabel label="End"><Input type="date" /></FieldLabel>
                    </div>
                  ),
                },
                {
                  id: "pricing",
                  title: "Pricing & value",
                  description: "Base pricing plan and contract value.",
                  view: (
                    <div>
                      <FieldRow label="Base Pricing">{c.basePricing}</FieldRow>
                      <FieldRow label="Monthly Value"><span className="font-semibold">{c.monthlyValue}</span></FieldRow>
                      <FieldRow label="Effective From">{c.start}</FieldRow>
                      <FieldRow label="Effective To">{c.end}</FieldRow>
                    </div>
                  ),
                  edit: (
                    <div className="grid grid-cols-2 gap-3">
                      <FieldLabel label="Base Pricing"><Input defaultValue={c.basePricing} /></FieldLabel>
                      <FieldLabel label="Monthly Value"><Input defaultValue={c.monthlyValue} /></FieldLabel>
                    </div>
                  ),
                },
                {
                  id: "linked",
                  title: `Linked operational units (${linked.length})`,
                  description: "Units inheriting this contract's base pricing.",
                  view: linked.length === 0 ? (
                    <p className="text-sm text-slate-500">No units linked yet.</p>
                  ) : (
                    <ul className="space-y-2">
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
                  ),
                },
              ]}
            />
          );
        }}
      />
      <AddEntityDialog
        open={openAdd} onOpenChange={setOpenAdd}
        title="Add Contract" description="Create a new contract for this client."
        fields={fields} submitLabel="Create Contract"
      />
    </div>
  );
}

/* -------------------- Operational Units -------------------- */

const uHelper = createColumnHelper<OperationalUnit>();

function UnitsTab({ units, contracts }: { units: OperationalUnit[]; contracts: Contract[] }) {
  const [openAdd, setOpenAdd] = useState(false);
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

  const fields: FieldDef[] = [
    { type: "text", key: "name", label: "Unit Name", placeholder: "West Coast Fulfillment", required: true },
    { type: "text", key: "id", label: "Unit ID", placeholder: "OU-1001" },
    { type: "select", key: "region", label: "Region", options: [
      { value: "pacific", label: "Pacific (CA, WA)" }, { value: "central", label: "Central (TX)" }, { value: "northeast", label: "Northeast (NY, NJ)" }, { value: "southeast", label: "Southeast (FL, GA)" },
    ]},
    { type: "select", key: "contractId", label: "Linked Contract", options: contracts.map((c) => ({ value: c.id, label: `${c.id} · ${c.status}` }))},
    { type: "date", key: "effectiveFrom", label: "Effective From", required: true },
    { type: "date", key: "effectiveTo", label: "Effective To" },
    { type: "select", key: "overrideType", label: "Pricing Override", options: [
      { value: "none", label: "Inherit contract base" }, { value: "tier2", label: "Tier 2 Override" }, { value: "volume", label: "Volume Discount" }, { value: "custom", label: "Custom" },
    ], full: true },
    { type: "multiselect", key: "products", label: "Products in scope", full: true, options: [
      { value: "lmd", label: "Last-Mile Delivery Pro" }, { value: "wms", label: "Warehouse Management" }, { value: "api", label: "Real-time Tracking API" }, { value: "freight", label: "Freight Core SaaS" }, { value: "label", label: "Custom Labeling Module" },
    ]},
    { type: "switch", key: "active", label: "Activate immediately", full: true, defaultValue: true },
  ];

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Operational Units"
        desc="Sub-client groups under this client. Expand a row to manage details, pricing overrides and CAG associations inline."
        action={<Button size="sm" onClick={() => setOpenAdd(true)} className="bg-brand-primary text-white hover:bg-brand-primary-hover">+ Add Operational Unit</Button>}
      />
      <DataTable
        data={units}
        columns={columns}
        searchPlaceholder="Search operational units…"
        emptyMessage="No operational units yet."
        renderExpanded={(u) => (
          <ExpandedShell
            sections={[
              {
                id: "details",
                title: "Unit details",
                view: (
                  <div>
                    <FieldRow label="Name">{u.name}</FieldRow>
                    <FieldRow label="Region">{u.region}</FieldRow>
                    <FieldRow label="Contract"><span className="font-mono text-xs">{u.contractId}</span></FieldRow>
                    <FieldRow label="Effective"><>{u.effectiveFrom} → {u.effectiveTo}</></FieldRow>
                  </div>
                ),
                edit: (
                  <div className="grid grid-cols-2 gap-3">
                    <FieldLabel label="Name"><Input defaultValue={u.name} /></FieldLabel>
                    <FieldLabel label="Region"><Input defaultValue={u.region} /></FieldLabel>
                    <FieldLabel label="From"><Input type="date" /></FieldLabel>
                    <FieldLabel label="To"><Input type="date" /></FieldLabel>
                  </div>
                ),
              },
              {
                id: "cags",
                title: `CAG associations (${u.cags.length})`,
                view: (
                  <ul className="space-y-1.5">
                    {u.cags.map((c) => (
                      <li key={c.id} className="flex items-center justify-between rounded border border-slate-100 bg-slate-50/60 px-2 py-1.5 text-xs">
                        <span className="font-medium text-slate-800">{c.carrier} · {c.group}</span>
                        <span className="font-mono text-slate-500">{c.account}</span>
                      </li>
                    ))}
                  </ul>
                ),
              },
            ]}
          />
        )}
      />
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-900">Product pricing (inline edit)</div>
            <div className="text-xs text-slate-500">Override per OU. Highlighted rows differ from contract base.</div>
          </div>
          <Button size="sm" onClick={() => setOpenCustom(true)} className="bg-brand-primary text-white hover:bg-brand-primary-hover">
            + Add Customized Pricing
          </Button>
        </div>
        {units.map((u) => (
          <details key={u.id} className="group mt-2 rounded-md border border-slate-100 open:bg-slate-50/40">
            <summary className="flex cursor-pointer items-center justify-between px-3 py-2 text-sm">
              <span className="font-medium text-slate-800">{u.name}</span>
              <span className="text-xs text-slate-500">{u.products.length} products · {u.pricingOverride.label}</span>
            </summary>
            <div className="px-3 pb-3">
              <InlinePricingEditor products={u.products} />
            </div>
          </details>
        ))}
      </div>


      <AddEntityDialog
        open={openAdd} onOpenChange={setOpenAdd}
        title="Add Operational Unit" description="Create a sub-client operational unit linked to a contract."
        fields={fields} submitLabel="Create Unit"
      />
    </div>
  );
}

function InlinePricingEditor({ products }: { products: ProductPrice[] }) {
  return (
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
  );
}

/* -------------------- Pricing Models -------------------- */

function PricingTab({ units, contracts }: { units: OperationalUnit[]; contracts: Contract[] }) {
  const active = contracts.find((c) => c.status === "Active");
  const productNames = Array.from(new Set(units.flatMap((u) => u.products.map((p) => p.name))));
  const overrideCount = units.reduce(
    (n, u) => n + u.products.filter((p) => parseFloat(p.basePrice.replace(/[^0-9.]/g, "")) !== parseFloat(p.adjusted.replace(/[^0-9.]/g, ""))).length,
    0,
  );

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Pricing Models"
        desc="Contract base pricing vs operational unit overrides. Each OU may override product pricing — view both layers side-by-side."
      />

      {/* Layered summary cards */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <LayerCard
          tone="info" label="Contract Base"
          title={active?.basePricing ?? "No active contract"}
          sub={active ? `${active.id} · ${active.monthlyValue}` : "—"}
          footer="Inherited by all OUs unless overridden."
        />
        <LayerCard
          tone="warning" label="OU Overrides"
          title={`${overrideCount} active overrides`}
          sub={`${units.length} operational units`}
          footer="Per-product overrides cascade from contract base."
        />
        <LayerCard
          tone="success" label="Net Savings"
          title="−$3,420 / mo"
          sub="vs. uniform contract base"
          footer="Estimated based on current adjusted prices."
        />
      </div>

      {/* Matrix with OU overrides clearly visible */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-900">Product pricing matrix</div>
          <div className="flex items-center gap-3 text-[11px]">
            <Legend swatch="bg-slate-100 text-slate-600" label="Contract base" />
            <Legend swatch="bg-emerald-50 text-emerald-700 ring-emerald-200" label="OU override (lower)" />
            <Legend swatch="bg-rose-50 text-rose-700 ring-rose-200" label="OU override (higher)" />
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/60 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-3 py-2 text-left">Product</th>
                <th className="px-3 py-2 text-left">Model</th>
                <th className="px-3 py-2 text-right">Contract Base</th>
                {units.map((u) => (
                  <th key={u.id} className="px-3 py-2 text-right">
                    <div className="text-slate-700">{u.name}</div>
                    <div className="font-mono text-[10px] font-normal text-slate-400">{u.id}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {productNames.map((name) => {
                const first = units.flatMap((u) => u.products).find((p) => p.name === name);
                return (
                  <tr key={name} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-medium text-slate-900">{name}</td>
                    <td className="px-3 py-2 text-slate-600">{first?.model}</td>
                    <td className="px-3 py-2 text-right text-slate-700">{first?.basePrice}</td>
                    {units.map((u) => {
                      const p = u.products.find((pp) => pp.name === name);
                      if (!p) return <td key={u.id} className="px-3 py-2 text-right text-slate-300">—</td>;
                      const base = parseFloat(p.basePrice.replace(/[^0-9.]/g, ""));
                      const adj = parseFloat(p.adjusted.replace(/[^0-9.]/g, ""));
                      const same = base === adj;
                      const delta = base ? ((adj - base) / base) * 100 : 0;
                      const tone = same ? "" : delta < 0 ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-rose-50 text-rose-700 ring-rose-200";
                      return (
                        <td key={u.id} className="px-3 py-2 text-right">
                          {same ? (
                            <span className="text-slate-500">{p.adjusted}</span>
                          ) : (
                            <span className={cn("inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-semibold ring-1 ring-inset", tone)}>
                              {p.adjusted}
                              <span className="text-[10px] opacity-70">{delta > 0 ? "+" : ""}{delta.toFixed(1)}%</span>
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-3 text-xs text-slate-500">
          Tip: Manage per-OU pricing overrides under <span className="font-semibold text-slate-700">Operational Units</span>.
          <ArrowRight className="ml-1 inline size-3" />
        </div>
      </div>
    </div>
  );
}

function LayerCard({ tone, label, title, sub, footer }: { tone: "info" | "warning" | "success"; label: string; title: string; sub: string; footer: string }) {
  const map = { info: "border-sky-200 bg-sky-50/40", warning: "border-amber-200 bg-amber-50/40", success: "border-emerald-200 bg-emerald-50/40" };
  return (
    <div className={cn("rounded-xl border p-4", map[tone])}>
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</div>
      <div className="mt-1 text-base font-semibold text-slate-900">{title}</div>
      <div className="text-xs text-slate-600">{sub}</div>
      <div className="mt-2 text-[11px] text-slate-500">{footer}</div>
    </div>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-slate-500">
      <span className={cn("inline-block size-2.5 rounded-sm ring-1 ring-inset", swatch)} /> {label}
    </span>
  );
}

/* -------------------- CAGs -------------------- */

function CagsTab({ units }: { units: OperationalUnit[] }) {
  const [openAdd, setOpenAdd] = useState(false);
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

  const fields: FieldDef[] = [
    { type: "select", key: "ou", label: "Operational Unit", required: true, options: units.map((u) => ({ value: u.id, label: u.name })) },
    { type: "select", key: "carrier", label: "Carrier", required: true, options: [
      { value: "FedEx", label: "FedEx" }, { value: "UPS", label: "UPS" }, { value: "DHL", label: "DHL Express" }, { value: "USPS", label: "USPS" },
    ]},
    { type: "text", key: "account", label: "Account #", placeholder: "ACC-XXXXX" },
    { type: "text", key: "group", label: "Group", placeholder: "Domestic Ground" },
    { type: "date", key: "from", label: "Effective From", required: true },
    { type: "date", key: "to", label: "Effective To" },
    { type: "checkbox", key: "primary", label: "Mark as primary carrier for this OU", full: true },
    { type: "switch", key: "active", label: "Active", defaultValue: true, full: true },
  ];

  return (
    <div className="space-y-4">
      <SectionHeader
        title="CAG Associations"
        desc="Carrier + Account + Group mappings across operational units, scoped by effective date."
        action={<Button size="sm" onClick={() => setOpenAdd(true)} className="bg-brand-primary text-white hover:bg-brand-primary-hover">+ Add CAG</Button>}
      />
      <DataTable
        data={rows}
        columns={columns}
        searchPlaceholder="Search by carrier, account or unit…"
        emptyMessage="No CAG associations yet."
        renderExpanded={(c: CagAssociation & { ouName: string; ouId: string }) => (
          <ExpandedShell
            sections={[
              {
                id: "id",
                title: "Identification",
                view: (
                  <div>
                    <FieldRow label="Operational Unit">{c.ouName} <span className="font-mono text-[11px] text-slate-400">({c.ouId})</span></FieldRow>
                    <FieldRow label="Carrier">{c.carrier}</FieldRow>
                    <FieldRow label="Account"><span className="font-mono text-xs">{c.account}</span></FieldRow>
                    <FieldRow label="Group">{c.group}</FieldRow>
                  </div>
                ),
                edit: (
                  <div className="grid grid-cols-2 gap-3">
                    <FieldLabel label="Carrier"><Input defaultValue={c.carrier} /></FieldLabel>
                    <FieldLabel label="Account"><Input defaultValue={c.account} /></FieldLabel>
                    <FieldLabel label="Group"><Input defaultValue={c.group} /></FieldLabel>
                  </div>
                ),
              },
              {
                id: "scope",
                title: "Effective scope",
                view: (
                  <div>
                    <FieldRow label="From">{c.effectiveFrom}</FieldRow>
                    <FieldRow label="To">{c.effectiveTo}</FieldRow>
                    <FieldRow label="Status"><StatusChip tone={statusToTone(c.status)}>{c.status}</StatusChip></FieldRow>
                  </div>
                ),
                edit: (
                  <div className="grid grid-cols-2 gap-3">
                    <FieldLabel label="From"><Input type="date" /></FieldLabel>
                    <FieldLabel label="To"><Input type="date" /></FieldLabel>
                  </div>
                ),
              },
            ]}
          />
        )}
      />
      <AddEntityDialog
        open={openAdd} onOpenChange={setOpenAdd}
        title="Add CAG Association" description="Map a Carrier · Account · Group to an operational unit."
        fields={fields} submitLabel="Create CAG"
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

function FieldLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-1.5 text-xs font-medium text-slate-600">
      <div>{label}</div>
      {children}
    </label>
  );
}
