import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { AppShell } from "@/components/AppShell";
import { DataTable } from "@/components/DataTable";
import { StatusChip } from "@/components/StatusChip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { carriers, type Carrier } from "@/lib/master-data";

export const Route = createFileRoute("/master/carriers")({
  component: CarriersPage,
  head: () => ({ meta: [{ title: "Carriers · Client360" }] }),
});

const helper = createColumnHelper<Carrier>();

function YN({ v }: { v: boolean }) {
  return v ? <StatusChip tone="success" dot={false}>Yes</StatusChip> : <StatusChip tone="neutral" dot={false}>No</StatusChip>;
}

function CarriersPage() {
  const columns = useMemo(() => [
    helper.accessor("name", {
      header: "Carrier",
      cell: (i) => (
        <div>
          <div className="font-semibold text-slate-900">{i.getValue()}</div>
          <div className="font-mono text-[11px] text-slate-400">{i.row.original.id}</div>
        </div>
      ),
    }),
    helper.accessor("claimBillStartDate", { header: "Claim Bill Start", cell: (i) => <span className="text-sm text-slate-600">{i.getValue()}</span> }),
    helper.accessor("claimPricingType", { header: "Pricing Type", cell: (i) => <StatusChip tone="info" dot={false}>{i.getValue()}</StatusChip> }),
    helper.accessor("claimIndicator", { header: "Claim", cell: (i) => <span className="font-mono text-xs text-slate-700">{i.getValue()}</span> }),
    helper.accessor("internalBillingIndicator", { header: "Int. Billing", cell: (i) => <span className="font-mono text-xs text-slate-700">{i.getValue()}</span> }),
    helper.accessor("migrationIndicator", {
      header: "Migration",
      cell: (i) => {
        const v = i.getValue();
        const tone = v === "Migrated" ? "success" : v === "Pending" ? "warning" : "neutral";
        return <StatusChip tone={tone}>{v}</StatusChip>;
      },
    }),
    helper.accessor("sourceSystem", { header: "Source", cell: (i) => <span className="text-sm text-slate-600">{i.getValue()}</span> }),
  ], []);

  return (
    <AppShell
      breadcrumbs={[{ label: "Master Management" }, { label: "Carriers" }]}
      title="Carrier Management"
      subtitle="Configure claim, billing and migration behavior per carrier."
      actions={<Button className="bg-brand-primary text-white hover:bg-brand-primary-hover">+ Add Carrier</Button>}
    >
      <DataTable
        data={carriers}
        columns={columns}
        searchPlaceholder="Search carriers by name, source, or pricing type…"
        searchKeys={["name", "id", "sourceSystem", "claimPricingType", "migrationIndicator"]}
        renderExpanded={(c) => (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Claim configuration</div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Claim Bill Start Date"><Input defaultValue={c.claimBillStartDate} /></Field>
                <Field label="Claim Pricing Type"><Input defaultValue={c.claimPricingType} /></Field>
                <Field label="Claim Indicator"><Input defaultValue={c.claimIndicator} /></Field>
                <Field label="Source System"><Input defaultValue={c.sourceSystem} /></Field>
              </div>
            </div>
            <div className="space-y-4">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Suppression & migration</div>
              <ToggleRow label="Suppress Rejected Claims" defaultChecked={c.suppressRejectedClaims} />
              <ToggleRow label="Suppress Net" defaultChecked={c.suppressNet} />
              <ToggleRow label="Suppress Historic Claims" defaultChecked={c.suppressHistoricClaims} />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Internal Billing"><Input defaultValue={c.internalBillingIndicator} /></Field>
                <Field label="Migration"><Input defaultValue={c.migrationIndicator} /></Field>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" size="sm">Cancel</Button>
                <Button size="sm" className="bg-brand-secondary text-white hover:bg-brand-secondary-hover">Save</Button>
              </div>
            </div>
            <div className="md:col-span-2 grid grid-cols-3 gap-4 border-t border-slate-100 pt-4 text-sm">
              <Summary label="Rejected" value={<YN v={c.suppressRejectedClaims} />} />
              <Summary label="Net" value={<YN v={c.suppressNet} />} />
              <Summary label="Historic" value={<YN v={c.suppressHistoricClaims} />} />
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

function ToggleRow({ label, defaultChecked }: { label: string; defaultChecked: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50/60 px-3 py-2">
      <span className="text-sm text-slate-700">{label}</span>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}

function Summary({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      {value}
    </div>
  );
}
