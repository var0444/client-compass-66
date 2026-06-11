import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { AppShell } from "@/components/AppShell";
import { DataTable } from "@/components/DataTable";
import { StatusChip, statusToTone } from "@/components/StatusChip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AddEntityDialog, type FieldDef } from "@/components/AddEntityDialog";
import { pricingModels, type PricingModel } from "@/lib/master-data";

export const Route = createFileRoute("/master/pricing")({
  component: PricingPage,
  head: () => ({ meta: [{ title: "Pricing · Client360" }] }),
});

const helper = createColumnHelper<PricingModel>();

function PricingPage() {
  const [openAdd, setOpenAdd] = useState(false);
  const fields: FieldDef[] = [
    { type: "text", key: "name", label: "Model Name", required: true, placeholder: "Premium Global Tier" },
    { type: "text", key: "id", label: "Model ID", placeholder: "PM-2010" },
    { type: "select", key: "type", label: "Type", options: [
      { value: "Subscription", label: "Subscription" }, { value: "Per Transaction", label: "Per Transaction" }, { value: "Tiered", label: "Tiered" }, { value: "Per Unit", label: "Per Unit" },
    ]},
    { type: "select", key: "basis", label: "Basis", options: [
      { value: "Monthly Fixed", label: "Monthly Fixed" }, { value: "Volume Brackets", label: "Volume Brackets" }, { value: "Per 1K Calls", label: "Per 1K Calls" }, { value: "Per Label", label: "Per Label" },
    ]},
    { type: "text", key: "rate", label: "Rate", placeholder: "$1,200/mo" },
    { type: "date", key: "effectiveFrom", label: "Effective From", required: true },
    { type: "select", key: "appliesTo", label: "Applies To", full: true, options: [
      { value: "enterprise", label: "Enterprise segment" }, { value: "mid", label: "Mid-Market segment" }, { value: "smb", label: "SMB segment" }, { value: "product", label: "Specific product" },
    ]},
    { type: "switch", key: "active", label: "Activate immediately", defaultValue: true, full: true },
    { type: "checkbox", key: "allowOverride", label: "Allow OU-level overrides", full: true },
  ];

  const columns = useMemo(() => [
    helper.accessor("name", {
      header: "Pricing Model",
      cell: (i) => (
        <div>
          <div className="font-semibold text-slate-900">{i.getValue()}</div>
          <div className="font-mono text-[11px] text-slate-400">{i.row.original.id}</div>
        </div>
      ),
    }),
    helper.accessor("type", { header: "Type", cell: (i) => <StatusChip tone="info" dot={false}>{i.getValue()}</StatusChip> }),
    helper.accessor("basis", { header: "Basis", cell: (i) => <span className="text-sm text-slate-600">{i.getValue()}</span> }),
    helper.accessor("rate", { header: "Rate", cell: (i) => <span className="text-sm font-semibold text-slate-900">{i.getValue()}</span> }),
    helper.accessor("appliesTo", { header: "Applies To", cell: (i) => <span className="text-sm text-slate-600">{i.getValue()}</span> }),
    helper.accessor("effectiveFrom", { header: "Effective From", cell: (i) => <span className="text-sm text-slate-500">{i.getValue()}</span> }),
    helper.accessor("status", { header: "Status", cell: (i) => <StatusChip tone={statusToTone(i.getValue())}>{i.getValue()}</StatusChip> }),
  ], []);

  return (
    <AppShell
      breadcrumbs={[{ label: "Master Management" }, { label: "Pricing" }]}
      title="Pricing Management"
      subtitle="Maintain pricing models that contracts and operational units inherit or override."
      actions={<Button onClick={() => setOpenAdd(true)} className="bg-brand-primary text-white hover:bg-brand-primary-hover">+ Add Pricing Model</Button>}
    >
      <DataTable
        data={pricingModels}
        columns={columns}
        searchPlaceholder="Search pricing models…"
        searchKeys={["name", "id", "type", "basis", "appliesTo"]}
        renderExpanded={(p) => (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Field label="Name"><Input defaultValue={p.name} /></Field>
            <Field label="Type"><Input defaultValue={p.type} /></Field>
            <Field label="Basis"><Input defaultValue={p.basis} /></Field>
            <Field label="Rate"><Input defaultValue={p.rate} /></Field>
            <Field label="Applies To"><Input defaultValue={p.appliesTo} /></Field>
            <Field label="Effective From"><Input defaultValue={p.effectiveFrom} /></Field>
            <Field label="Status"><Input defaultValue={p.status} /></Field>
            <div className="flex items-end justify-end gap-2">
              <Button variant="ghost" size="sm">Cancel</Button>
              <Button size="sm" className="bg-brand-secondary text-white hover:bg-brand-secondary-hover">Save</Button>
            </div>
          </div>
        )}
      />
      <AddEntityDialog
        open={openAdd} onOpenChange={setOpenAdd}
        title="Add Pricing Model" description="Define a new pricing model that contracts or OUs can inherit."
        fields={fields} submitLabel="Create Pricing Model"
      />
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-slate-600">{label}</Label>
      {children}
    </div>
  );
}
