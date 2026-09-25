import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { Boxes, Tags, Link2, CreditCard, RefreshCw, GitBranch, Search } from "lucide-react";
import { DataTable } from "@/components/DataTable";
import { StatusChip, statusToTone } from "@/components/StatusChip";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExpandedShell, FieldRow } from "@/components/ExpandedShell";
import { AddEntityDialog, type FieldDef } from "@/components/AddEntityDialog";
import { cn } from "@/lib/utils";
import {
  billingArrangementsByClient,
  contractsByClient,
  getClient,
  operationalUnitsByClient,
  type CagAssociation,
  type BillingArrangement,
  type Contract,
  type OperationalUnit,
  type ProductPrice,
} from "@/lib/clients-data";
import { products as globalProducts } from "@/lib/master-data";

export const Route = createFileRoute("/clients/$clientId/configuration")({
  loader: ({ params }) => ({ client: getClient(params.clientId) }),
  component: ClientConfiguration,
  head: ({ loaderData }) => {
    const clientName = loaderData?.client?.name ?? "Client";
    const description = `Manage billing arrangements, operational units, global pricing, and overrides for ${clientName}.`;
    return {
      meta: [
        { title: `${clientName} Configuration · Client360` },
        { name: "description", content: description },
        { property: "og:title", content: `${clientName} Configuration · Client360` },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
});

type TabKey = "arrangements" | "units" | "pricing" | "cags";

function ClientConfiguration() {
  const { client } = Route.useLoaderData();
  const [tab, setTab] = useState<TabKey>("arrangements");
  if (!client) return null;

  const contracts = contractsByClient[client.id] ?? [];
  const arrangements = billingArrangementsByClient[client.id] ?? [];
  const units = operationalUnitsByClient[client.id] ?? [];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 pb-px">
        <TabBtn k="arrangements" cur={tab} set={setTab} icon={<CreditCard className="size-4" />} count={arrangements.length}>Billing Arrangements</TabBtn>
        <TabBtn k="units" cur={tab} set={setTab} icon={<Boxes className="size-4" />} count={units.length}>Operational Units</TabBtn>
        <TabBtn k="pricing" cur={tab} set={setTab} icon={<Tags className="size-4" />}>Pricing Models</TabBtn>
        <TabBtn k="cags" cur={tab} set={setTab} icon={<Link2 className="size-4" />}>CAG Associations</TabBtn>
      </div>

      {tab === "arrangements" && <BillingArrangementsTab arrangements={arrangements} contracts={contracts} units={units} />}
      {tab === "units" && <UnitsTab units={units} arrangements={arrangements} />}
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

/* -------------------- Billing Arrangements -------------------- */

const baHelper = createColumnHelper<BillingArrangement>();

function BillingArrangementsTab({ arrangements, contracts, units }: { arrangements: BillingArrangement[]; contracts: Contract[]; units: OperationalUnit[] }) {
  const [flow, setFlow] = useState<"new" | "renew" | "amend" | null>(null);
  const columns = useMemo(() => [
    baHelper.accessor("id", { header: "Billing Arrangement", cell: (i) => <div><div className="font-mono text-xs font-semibold text-slate-900">{i.getValue()}</div><div className="text-sm text-slate-700">{i.row.original.name}</div></div> }),
    baHelper.accessor("billingModel", { header: "Billing Model", cell: (i) => <span className="text-sm text-slate-700">{i.getValue()}</span> }),
    baHelper.accessor("contractIds", { header: "Contracts", cell: (i) => <span className="text-sm text-slate-600">{i.getValue().length} versions</span> }),
    baHelper.accessor("unitsLinked", { header: "OUs Linked", cell: (i) => <span className="text-sm text-slate-600">{i.getValue()} OUs</span> }),
    baHelper.accessor("effectiveFrom", { header: "Effective Range", cell: (i) => <span className="text-sm text-slate-600">{i.getValue()} → {i.row.original.effectiveTo}</span> }),
    baHelper.accessor("status", { header: "Status", cell: (i) => <StatusChip tone={statusToTone(i.getValue())}>{i.getValue()}</StatusChip> }),
  ], []);
  const currentContracts = contracts.filter((c) => c.status === "Active" || c.status === "Draft");
  const arrangementOptions = arrangements.map((a) => ({ value: a.id, label: `${a.id} · ${a.name}` }));
  const contractOptions = currentContracts.map((c) => ({ value: c.id, label: `${c.id} · ${c.status}` }));

  const flowConfig = {
    new: { title: "New Contract & Billing Arrangement", description: "Create a new arrangement when a contract introduces a distinct OU billing relationship.", submitLabel: "Create Arrangement" },
    renew: { title: "Renew Contract", description: "Create the next contract version while preserving the Billing Arrangement ID and OU links.", submitLabel: "Create Renewal" },
    amend: { title: "Amend Contract", description: "Record a contract amendment under the same Billing Arrangement without breaking downstream OU mappings.", submitLabel: "Create Amendment" },
  } as const;

  const fields: FieldDef[] = flow === "new" ? [
    { type: "text", key: "arrangementId", label: "Billing Arrangement ID", placeholder: "BA-ARX-003", required: true },
    { type: "text", key: "name", label: "Arrangement name", placeholder: "Aramex Regional Billing", required: true },
    { type: "select", key: "billingModel", label: "Billing model", options: [{ value: "consolidated", label: "Consolidated monthly" }, { value: "usage", label: "Usage-based" }, { value: "hybrid", label: "Hybrid" }] },
    { type: "multiselect", key: "linkedUnits", label: "Link operational units", options: units.map((u) => ({ value: u.id, label: `${u.name} (${u.id})` })), full: true },
    { type: "text", key: "contractId", label: "First contract ID", placeholder: "CONT-2026-0001", required: true },
    { type: "date", key: "start", label: "Contract start", required: true },
    { type: "date", key: "end", label: "Contract end", required: true },
  ] : [
    { type: "select", key: "arrangementId", label: "Billing Arrangement", options: arrangementOptions, required: true, full: true },
    { type: "select", key: "contractId", label: "Source contract", options: contractOptions, required: true },
    { type: "text", key: "newContractId", label: "New contract ID", placeholder: "CONT-2026-0002", required: true },
    { type: "date", key: "start", label: "Effective from", required: true },
    { type: "date", key: "end", label: "Effective to", required: true },
    { type: "text", key: "monthlyValue", label: flow === "amend" ? "Amended monthly value" : "Renewal monthly value", placeholder: "$1,350/mo" },
    ...(flow === "amend" ? [{ type: "textarea" as const, key: "reason", label: "Amendment reason", placeholder: "Describe the commercial or scope change…", full: true }] : []),
  ];

  return (
    <div className="space-y-4">
      <SectionHeader title="Billing Arrangements" desc="Stable billing relationships that group contract versions and operational units. Renewals and amendments retain the arrangement ID." action={<Button size="sm" onClick={() => setFlow("new")} className="bg-brand-primary text-white hover:bg-brand-primary-hover">+ New arrangement</Button>} />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <LayerCard tone="info" label="Stable relationship" title={`${arrangements.length} arrangements`} sub="IDs remain through renewals" footer="OUs link to the arrangement, not a single contract version." />
        <LayerCard tone="warning" label="Contract lifecycle" title={`${contracts.length} contract versions`} sub="Renew or amend in context" footer="History stays grouped for audit and billing operations." />
      </div>
      <DataTable data={arrangements} columns={columns} searchPlaceholder="Search arrangements…" emptyMessage="No billing arrangements yet." renderExpanded={(a) => {
        const arrangementContracts = contracts.filter((c) => a.contractIds.includes(c.id));
        const linked = units.filter((u) => u.billingArrangementId === a.id);
        return <ExpandedShell sections={[
          { id: "identity", title: "Arrangement overview", description: "The stable billing relationship shared by contract versions and OUs.", view: <div><FieldRow label="Arrangement ID"><span className="font-mono text-xs">{a.id}</span></FieldRow><FieldRow label="Name">{a.name}</FieldRow><FieldRow label="Billing model">{a.billingModel}</FieldRow><FieldRow label="Effective range">{a.effectiveFrom} → {a.effectiveTo}</FieldRow></div>, edit: <div className="grid grid-cols-2 gap-3"><FieldLabel label="Arrangement name"><Input defaultValue={a.name} /></FieldLabel><FieldLabel label="Billing model"><Input defaultValue={a.billingModel} /></FieldLabel></div> },
          { id: "contracts", title: `Contract lifecycle (${arrangementContracts.length})`, description: "Renewal and amendment actions create new versions under this same arrangement.", view: <div className="space-y-2">{arrangementContracts.map((c) => <div key={c.id} className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50/60 px-3 py-2"><div><div className="font-mono text-xs font-semibold text-slate-900">{c.id}</div><div className="text-xs text-slate-500">{c.start} → {c.end} · {c.monthlyValue}</div></div><StatusChip tone={statusToTone(c.status)}>{c.status}</StatusChip></div>)}</div>, edit: <div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={() => setFlow("renew")}><RefreshCw className="mr-1.5 size-3.5" />Renew contract</Button><Button size="sm" variant="outline" onClick={() => setFlow("amend")}><GitBranch className="mr-1.5 size-3.5" />Amend contract</Button></div> },
          { id: "units", title: `Linked operational units (${linked.length})`, description: "These OUs inherit the arrangement's active contract and pricing relationship.", view: linked.length === 0 ? <p className="text-sm text-slate-500">No units linked yet.</p> : <ul className="space-y-2">{linked.map((u) => <li key={u.id} className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm"><div><div className="font-medium text-slate-900">{u.name}</div><div className="font-mono text-[11px] text-slate-400">{u.id} · {u.region}</div></div><StatusChip tone={statusToTone(u.status)}>{u.status}</StatusChip></li>)}</ul> },
        ]} />;
      }} />
      {flow && <AddEntityDialog open={flow !== null} onOpenChange={(open) => !open && setFlow(null)} title={flowConfig[flow].title} description={flowConfig[flow].description} fields={fields} submitLabel={flowConfig[flow].submitLabel} onSubmit={() => setFlow(null)} />}
    </div>
  );
}

/* -------------------- Operational Units -------------------- */

const uHelper = createColumnHelper<OperationalUnit>();

function UnitsTab({ units, arrangements }: { units: OperationalUnit[]; arrangements: BillingArrangement[] }) {
  const [openAdd, setOpenAdd] = useState(false);
  const [openCustom, setOpenCustom] = useState(false);
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
    uHelper.accessor("billingArrangementId", { header: "Billing Arrangement", cell: (i) => <span className="font-mono text-xs text-slate-700">{i.getValue()}</span> }),
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
    { type: "select", key: "billingArrangementId", label: "Billing Arrangement", options: arrangements.map((a) => ({ value: a.id, label: `${a.id} · ${a.name}` }))},
    { type: "date", key: "effectiveFrom", label: "Effective From", required: true },
    { type: "date", key: "effectiveTo", label: "Effective To" },
    { type: "select", key: "overrideType", label: "Pricing Override", options: [
      { value: "none", label: "Inherit global price" }, { value: "tier2", label: "Tier 2 Override" }, { value: "volume", label: "Volume Discount" }, { value: "custom", label: "Custom" },
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
                    <FieldRow label="Billing Arrangement"><span className="font-mono text-xs">{u.billingArrangementId}</span></FieldRow>
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
            <div className="text-xs text-slate-500">Override per OU. Highlighted rows differ from the global price.</div>
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
         title="Add Operational Unit" description="Create a sub-client operational unit linked to a billing arrangement."
        fields={fields} submitLabel="Create Unit"
      />
      <AddEntityDialog
        open={openCustom} onOpenChange={setOpenCustom}
        title="Add Customized Pricing"
        description="Define a per-OU pricing override on top of the global price. Existing customization workflow remains available via the OU edit panel."
        submitLabel="Add Override"
        fields={[
          { type: "select", key: "unit", label: "Operational Unit", required: true, options: units.map((u) => ({ value: u.id, label: u.name })) },
          { type: "select", key: "product", label: "Product", required: true, options: Array.from(new Set(units.flatMap((u) => u.products.map((p) => p.name)))).map((n) => ({ value: n, label: n })) },
          { type: "select", key: "model", label: "Pricing Model", options: [
            { value: "tier2", label: "Tier 2 Override" }, { value: "volume", label: "Volume Discount" }, { value: "flat", label: "Flat Rate" }, { value: "custom", label: "Custom" },
          ]},
          { type: "text", key: "basePrice", label: "Base Price", placeholder: "$12.50" },
          { type: "text", key: "adjusted", label: "Adjusted Price", placeholder: "$11.20", required: true },
          { type: "date", key: "from", label: "Effective From", required: true },
          { type: "date", key: "to", label: "Effective To" },
          { type: "textarea", key: "reason", label: "Justification", full: true, placeholder: "Why this override is necessary…" },
          { type: "switch", key: "active", label: "Activate immediately", full: true, defaultValue: true },
        ]}
      />

    </div>
  );
}

function InlinePricingEditor({ products }: { products: ProductPrice[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <table className="w-full text-sm">
        <thead className="thead-brand">
          <tr>
            <th className="th-brand px-3 py-2 text-left">Product</th>
            <th className="th-brand px-3 py-2 text-left">Model</th>
            <th className="th-brand px-3 py-2 text-right">Base</th>
            <th className="th-brand px-3 py-2 text-right">Adjusted</th>
            <th className="th-brand px-3 py-2 text-right">Δ</th>
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

type ProductPricingSummary = {
  id: string;
  name: string;
  category: string;
  contractRates: string[];
  ouOverrideCount: number;
  cagOverrideCount: number;
};

const priceHelper = createColumnHelper<ProductPricingSummary>();

function PricingTab({ units, contracts }: { units: OperationalUnit[]; contracts: Contract[] }) {
  const activeContracts = contracts.filter((contract) => contract.status === "Active");
  const rows: ProductPricingSummary[] = globalProducts.map((product) => {
    const prices = units.flatMap((unit) => {
      const contract = activeContracts.find((item) => item.billingArrangementId === unit.billingArrangementId);
      return contract?.productPrices?.filter((item) => item.productName === product.name).map((item) => item.price) ?? [];
    });
    const ouOverrideCount = units.filter((unit) => {
      const contract = activeContracts.find((item) => item.billingArrangementId === unit.billingArrangementId);
      const contractPrice = contract?.productPrices?.find((item) => item.productName === product.name)?.price;
      const ouPrice = unit.products.find((item) => item.name === product.name)?.adjusted;
      return pricesDiffer(contractPrice, ouPrice);
    }).length;
    const cagOverrideCount = units.reduce((total, unit) => total + unit.cags.filter((cag) => {
      const cagPrice = cag.pricingOverrides?.find((item) => item.productName === product.name)?.adjusted;
      return Boolean(cagPrice);
    }).length, 0);
    return {
      id: product.id,
      name: product.name,
      category: product.category,
      contractRates: [...new Set(prices)],
      ouOverrideCount,
      cagOverrideCount,
    };
  });

  const columns = useMemo(() => [
    priceHelper.accessor("name", {
      header: "Product",
      cell: (info) => <div><div className="font-semibold text-slate-900">{info.getValue()}</div><div className="text-xs text-slate-500">{info.row.original.category} · {info.row.original.id}</div></div>,
    }),
    priceHelper.accessor("contractRates", {
      header: "Active contract rates",
      cell: (info) => info.getValue().length ? <div className="flex flex-wrap gap-1.5">{info.getValue().map((rate) => <span key={rate} className="rounded-sm bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">{rate}</span>)}</div> : <span className="text-xs text-slate-400">No active contract rate</span>,
    }),
    priceHelper.accessor("ouOverrideCount", { header: "OU differences", cell: (info) => <span className="font-medium text-slate-700">{info.getValue()}</span> }),
    priceHelper.accessor("cagOverrideCount", { header: "CAG differences", cell: (info) => <span className="font-medium text-slate-700">{info.getValue()}</span> }),
  ], []);

  const ouOverrides = rows.reduce((sum, product) => sum + product.ouOverrideCount, 0);
  const cagOverrides = rows.reduce((sum, product) => sum + product.cagOverrideCount, 0);
  const cagScopes = units.reduce((sum, unit) => sum + unit.cags.length, 0);

  return (
    <div className="space-y-4">
      <SectionHeader title="Contract Pricing & Overrides" desc="Contract rates are the reference. Operational Unit overrides apply next, followed by Carrier, Carrier + Account, and Carrier + Account + Group pricing." />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <LayerCard tone="info" label="Contract rates" title={`${activeContracts.length} active contracts`} sub={`${rows.filter((row) => row.contractRates.length > 0).length} products with contract pricing`} footer="Rates come from the active contracts linked through each Billing Arrangement." />
        <LayerCard tone="warning" label="OU differences" title={`${ouOverrides} product / OU pairs`} sub={`${units.length} operational units`} footer="An OU price replaces its linked contract rate for that unit." />
        <LayerCard tone="success" label="CAG differences" title={`${cagOverrides} scoped prices`} sub={`${cagScopes} carrier associations`} footer="CAG pricing is nested below the OU: carrier → account → group." />
      </div>
      <DataTable
        data={rows}
        columns={columns}
        getRowId={(row) => row.id}
        searchKeys={["id", "name", "category"]}
        searchPlaceholder="Search products…"
        emptyMessage="No products match your search."
        renderExpanded={(product) => <PricingProductDetail product={product} units={units} contracts={activeContracts} />}
      />
    </div>
  );
}

type PricingComparison = {
  id: string;
  scope: "ou" | "carrier" | "account" | "group";
  label: string;
  detail: string;
  contractPrice?: string;
  parentPrice?: string;
  appliedPrice?: string;
  source: string;
  override: boolean;
};

function PricingProductDetail({ product, units, contracts }: { product: ProductPricingSummary; units: OperationalUnit[]; contracts: Contract[] }) {
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState("all");
  const [overridesOnly, setOverridesOnly] = useState(false);
  const [page, setPage] = useState(0);
  const pageSize = 10;
  const comparisons: PricingComparison[] = units.flatMap((unit) => {
    const contract = contracts.find((item) => item.billingArrangementId === unit.billingArrangementId);
    const contractPrice = contract?.productPrices?.find((item) => item.productName === product.name)?.price;
    const rawOuPrice = unit.products.find((item) => item.name === product.name)?.adjusted;
    const ouOverride = pricesDiffer(contractPrice, rawOuPrice);
    const ouPrice = contractPrice ? (ouOverride ? rawOuPrice : contractPrice) : undefined;
    const unitRows: PricingComparison[] = [{
      id: `${unit.id}-ou`, scope: "ou", label: unit.name, detail: `${unit.id} · ${unit.region}`,
      contractPrice, parentPrice: contractPrice, appliedPrice: ouPrice,
      source: ouOverride ? "OU override" : "Active contract", override: ouOverride,
    }];
    const cagRows = unit.cags.map((cag): PricingComparison => {
      const level = cag.scopeLevel ?? (cag.group && cag.group !== "—" ? "group" : cag.account && cag.account !== "—" ? "account" : "carrier");
      const parentLevel = level === "group" ? "account" : level === "account" ? "carrier" : "ou";
      const parentCag = level === "group"
        ? unit.cags.find((candidate) => candidate.carrier === cag.carrier && candidate.account === cag.account && (candidate.scopeLevel ?? (candidate.group && candidate.group !== "—" ? "group" : candidate.account && candidate.account !== "—" ? "account" : "carrier")) === "account")
        : level === "account"
          ? unit.cags.find((candidate) => candidate.carrier === cag.carrier && (candidate.scopeLevel ?? (candidate.group && candidate.group !== "—" ? "group" : candidate.account && candidate.account !== "—" ? "account" : "carrier")) === "carrier")
          : undefined;
      const parentOverride = parentCag?.pricingOverrides?.find((item) => item.productName === product.name)?.adjusted;
      const parentPrice = parentOverride ?? ouPrice;
      const ownPrice = cag.pricingOverrides?.find((item) => item.productName === product.name)?.adjusted;
      const appliedPrice = contractPrice ? (ownPrice ?? parentPrice) : undefined;
      const override = pricesDiffer(parentPrice, ownPrice);
      const scopeName = level === "carrier" ? "Carrier" : level === "account" ? "Carrier + Account" : "Carrier + Account + Group";
      const detail = [cag.carrier, cag.account !== "—" ? cag.account : undefined, cag.group !== "—" ? cag.group : undefined].filter(Boolean).join(" · ");
      return {
        id: `${unit.id}-${cag.id}`, scope: level, label: `${scopeName} · ${detail}`, detail: `${unit.name} (${unit.id}) · ${cag.id}`,
        contractPrice, parentPrice, appliedPrice,
        source: override ? `${scopeName} override` : parentCag && parentOverride ? `Inherited from ${parentLevel === "account" ? "account" : "carrier"}` : "Inherited from OU",
        override,
      };
    });
    return [...unitRows, ...cagRows];
  });

  const filtered = comparisons.filter((item) => {
    const matchesScope = scope === "all" || item.scope === scope;
    const matchesSearch = `${item.label} ${item.detail} ${item.source}`.toLowerCase().includes(query.toLowerCase());
    return matchesScope && matchesSearch && (!overridesOnly || item.override);
  });
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount - 1);
  const visibleRows = filtered.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{product.name} · pricing by scope</h3>
          <p className="text-xs text-slate-500">Compare each scope against its contract rate and the price inherited from its parent.</p>
        </div>
        <span className="text-xs text-slate-500">{filtered.length} comparison rows</span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-48 flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input aria-label="Search pricing scopes" value={query} onChange={(event) => { setQuery(event.target.value); setPage(0); }} placeholder="Search OUs, carriers, accounts…" className="h-9 pl-8" />
        </div>
        <Select value={scope} onValueChange={(value) => { setScope(value); setPage(0); }}>
          <SelectTrigger aria-label="Filter pricing scope" className="w-full sm:w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All pricing scopes</SelectItem>
            <SelectItem value="ou">Operational Units</SelectItem>
            <SelectItem value="carrier">Carrier</SelectItem>
            <SelectItem value="account">Carrier + Account</SelectItem>
            <SelectItem value="group">Carrier + Account + Group</SelectItem>
          </SelectContent>
        </Select>
        <Button variant={overridesOnly ? "default" : "outline"} size="sm" onClick={() => { setOverridesOnly((current) => !current); setPage(0); }}>
          {overridesOnly ? "Overrides only" : "Show all prices"}
        </Button>
      </div>
      <div className="overflow-x-auto rounded-md border border-slate-200">
        <table className="w-full text-left text-xs">
          <thead className="thead-brand"><tr><th className="th-brand px-3 py-2">Scope / peer</th><th className="th-brand px-3 py-2">Contract</th><th className="th-brand px-3 py-2">Inherited from parent</th><th className="th-brand px-3 py-2">Applicable price</th><th className="th-brand px-3 py-2">Vs. contract</th><th className="th-brand px-3 py-2">Price source</th></tr></thead>
          <tbody>
            {visibleRows.map((row) => {
              const delta = priceDelta(row.contractPrice, row.appliedPrice);
              return <tr key={row.id} className="border-t border-slate-100 align-top">
                <td className="min-w-52 px-3 py-2"><div className="font-medium text-slate-800">{row.label}</div><div className="mt-0.5 text-[10px] text-slate-500">{row.detail}</div></td>
                <td className="whitespace-nowrap px-3 py-2 text-slate-600">{row.contractPrice ?? <span className="text-slate-400">Not priced</span>}</td>
                <td className="whitespace-nowrap px-3 py-2 text-slate-600">{row.parentPrice ?? <span className="text-slate-400">Not priced</span>}</td>
                <td className="whitespace-nowrap px-3 py-2"><span className={cn("font-semibold", row.override ? "text-brand-primary" : "text-slate-800")}>{row.appliedPrice ?? "Not priced"}</span></td>
                <td className={cn("whitespace-nowrap px-3 py-2 font-medium", delta === null ? "text-slate-400" : delta < 0 ? "text-emerald-700" : delta > 0 ? "text-rose-700" : "text-slate-500")}>{delta === null ? "—" : `${delta > 0 ? "+" : ""}${delta.toFixed(1)}%`}</td>
                <td className="whitespace-nowrap px-3 py-2 text-slate-500">{row.source}</td>
              </tr>;
            })}
            {visibleRows.length === 0 && <tr><td colSpan={6} className="px-3 py-8 text-center text-slate-500">No pricing comparisons match these filters.</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <span>Showing {filtered.length === 0 ? 0 : currentPage * pageSize + 1}–{Math.min((currentPage + 1) * pageSize, filtered.length)} of {filtered.length}</span>
        <div className="flex items-center gap-2"><Button size="sm" variant="outline" disabled={currentPage === 0} onClick={() => setPage((value) => Math.max(0, value - 1))}>Previous</Button><span>Page {currentPage + 1} of {pageCount}</span><Button size="sm" variant="outline" disabled={currentPage + 1 >= pageCount} onClick={() => setPage((value) => Math.min(pageCount - 1, value + 1))}>Next</Button></div>
      </div>
    </div>
  );
}

function parsePrice(value?: string) {
  if (!value) return Number.NaN;
  return Number.parseFloat(value.replace(/[^0-9.]/g, ""));
}

function pricesDiffer(reference?: string, candidate?: string) {
  if (!reference || !candidate) return false;
  return parsePrice(reference) !== parsePrice(candidate);
}

function priceDelta(reference?: string, candidate?: string) {
  const base = parsePrice(reference);
  const value = parsePrice(candidate);
  if (!Number.isFinite(base) || !Number.isFinite(value) || base === 0) return null;
  return ((value - base) / base) * 100;
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
