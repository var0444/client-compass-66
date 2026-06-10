import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { AppShell } from "@/components/AppShell";
import { DataTable } from "@/components/DataTable";
import { StatusChip, statusToTone } from "@/components/StatusChip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { products, type Product } from "@/lib/master-data";

export const Route = createFileRoute("/master/products")({
  component: ProductsPage,
  head: () => ({ meta: [{ title: "Products · Client360" }] }),
});

const helper = createColumnHelper<Product>();

function ProductsPage() {
  const columns = useMemo(() => [
    helper.accessor("name", {
      header: "Product",
      cell: (i) => (
        <div>
          <div className="font-semibold text-slate-900">{i.getValue()}</div>
          <div className="font-mono text-[11px] text-slate-400">{i.row.original.id}</div>
        </div>
      ),
    }),
    helper.accessor("category", { header: "Category", cell: (i) => <StatusChip tone="info" dot={false}>{i.getValue()}</StatusChip> }),
    helper.accessor("uom", { header: "UoM", cell: (i) => <span className="text-sm text-slate-600">{i.getValue()}</span> }),
    helper.accessor("basePrice", { header: "Base Price", cell: (i) => <span className="text-sm font-semibold text-slate-900">{i.getValue()}</span> }),
    helper.accessor("lastUpdated", { header: "Updated", cell: (i) => <span className="text-sm text-slate-500">{i.getValue()}</span> }),
    helper.accessor("status", { header: "Status", cell: (i) => <StatusChip tone={statusToTone(i.getValue())}>{i.getValue()}</StatusChip> }),
  ], []);

  return (
    <AppShell
      breadcrumbs={[{ label: "Master Management" }, { label: "Products" }]}
      title="Product Management"
      subtitle="Manage catalog products available to client contracts and operational units."
      actions={<Button className="bg-brand-primary text-white hover:bg-brand-primary-hover">+ Add Product</Button>}
    >
      <DataTable
        data={products}
        columns={columns}
        searchPlaceholder="Search products…"
        searchKeys={["name", "id", "category", "uom"]}
        renderExpanded={(p) => (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="space-y-4 md:col-span-2">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Product Name"><Input defaultValue={p.name} /></Field>
                <Field label="Category"><Input defaultValue={p.category} /></Field>
                <Field label="Unit of Measure"><Input defaultValue={p.uom} /></Field>
                <Field label="Base Price"><Input defaultValue={p.basePrice} /></Field>
              </div>
              <Field label="Description"><Textarea defaultValue={p.description} rows={3} /></Field>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm">Cancel</Button>
                <Button size="sm" className="bg-brand-secondary text-white hover:bg-brand-secondary-hover">Save</Button>
              </div>
            </div>
            <div className="space-y-3 rounded-lg border border-slate-100 bg-slate-50/60 p-4">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Metadata</div>
              <Meta label="Product ID" value={<span className="font-mono text-xs">{p.id}</span>} />
              <Meta label="Status" value={<StatusChip tone={statusToTone(p.status)}>{p.status}</StatusChip>} />
              <Meta label="Last Updated" value={p.lastUpdated} />
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

function Meta({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-800">{value}</span>
    </div>
  );
}
