import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { AppShell } from "@/components/AppShell";
import { DataTable } from "@/components/DataTable";
import { StatusChip, statusToTone } from "@/components/StatusChip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { pricingModels, type PricingModel } from "@/lib/master-data";

export const Route = createFileRoute("/master/pricing")({
  component: PricingPage,
  head: () => ({ meta: [{ title: "Pricing · Client360" }] }),
});

const helper = createColumnHelper<PricingModel>();

function PricingPage() {
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
      actions={<Button className="bg-brand-primary text-white hover:bg-brand-primary-hover">+ Add Pricing Model</Button>}
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
