import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { Download, FileText, Receipt } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { DataTable } from "@/components/DataTable";
import { StatusChip, statusToTone } from "@/components/StatusChip";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExpandedShell, FieldRow } from "@/components/ExpandedShell";

export const Route = createFileRoute("/invoices")({
  component: InvoicesPage,
  head: () => ({ meta: [{ title: "Invoices · Client360" }] }),
});

interface InvoiceLine {
  description: string;
  qty: number;
  rate: string;
  amount: string;
  kind: "Claim Fee" | "Claim Activity Fee" | "Product" | "Other";
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  clientRefId: string;
  clientName: string;
  contractId: string;
  invoiceGroup: string;
  dueDate: string;
  amount: string;
  status: "Paid" | "Pending" | "Overdue" | "Draft";
  billTo: { name: string; address: string; email: string };
  lines: InvoiceLine[];
}

const invoices: Invoice[] = [
  {
    id: "INV-2025-1042",
    invoiceNumber: "INV-2025-1042",
    invoiceDate: "2025-06-01",
    clientRefId: "CRI00203",
    clientName: "Aramex",
    contractId: "CONT-2024-0008",
    invoiceGroup: "Monthly · Enterprise",
    dueDate: "2025-06-30",
    amount: "$61,200.00",
    status: "Pending",
    billTo: { name: "Aramex Inc.", address: "731 Main St, Suite 110, Phoenix, AZ 85001", email: "ap@aramex.com" },
    lines: [
      { description: "Premium Global Tier — base fee", qty: 1, rate: "$48,000.00", amount: "$48,000.00", kind: "Product" },
      { description: "Claim fees", qty: 412, rate: "$22.00", amount: "$9,064.00", kind: "Claim Fee" },
      { description: "Claim activity fees", qty: 1180, rate: "$3.50", amount: "$4,130.00", kind: "Claim Activity Fee" },
      { description: "Tracking API overage", qty: 1, rate: "$6.00", amount: "$6.00", kind: "Other" },
    ],
  },
  {
    id: "INV-2025-1041",
    invoiceNumber: "INV-2025-1041",
    invoiceDate: "2025-06-01",
    clientRefId: "CRI100",
    clientName: "Ashwini Logistics",
    contractId: "CONT-2024-0012",
    invoiceGroup: "Monthly · Mid-Market",
    dueDate: "2025-06-30",
    amount: "$24,800.00",
    status: "Paid",
    billTo: { name: "Ashwini Logistics LLP", address: "12 Brigade Rd, Bengaluru 560001", email: "finance@ashwini.io" },
    lines: [
      { description: "Standard Tier — base fee", qty: 1, rate: "$18,500.00", amount: "$18,500.00", kind: "Product" },
      { description: "Claim fees", qty: 240, rate: "$18.00", amount: "$4,320.00", kind: "Claim Fee" },
      { description: "Claim activity fees", qty: 560, rate: "$3.50", amount: "$1,960.00", kind: "Claim Activity Fee" },
      { description: "Custom labeling module", qty: 1, rate: "$20.00", amount: "$20.00", kind: "Product" },
    ],
  },
  {
    id: "INV-2025-1038",
    invoiceNumber: "INV-2025-1038",
    invoiceDate: "2025-05-01",
    clientRefId: "CRI200",
    clientName: "Priti Couriers",
    contractId: "CONT-2024-0021",
    invoiceGroup: "Monthly · SMB",
    dueDate: "2025-05-31",
    amount: "$8,400.00",
    status: "Overdue",
    billTo: { name: "Priti Couriers Pvt. Ltd.", address: "44 Park Rd, Pune 411001", email: "billing@priti.co" },
    lines: [
      { description: "SMB base fee", qty: 1, rate: "$7,000.00", amount: "$7,000.00", kind: "Product" },
      { description: "Claim fees", qty: 88, rate: "$14.00", amount: "$1,232.00", kind: "Claim Fee" },
      { description: "Claim activity fees", qty: 48, rate: "$3.50", amount: "$168.00", kind: "Claim Activity Fee" },
    ],
  },
  {
    id: "INV-2025-1045",
    invoiceNumber: "INV-2025-1045",
    invoiceDate: "2025-06-10",
    clientRefId: "CRI00301",
    clientName: "DRP2301",
    contractId: "CONT-2025-0001",
    invoiceGroup: "Quarterly · Enterprise",
    dueDate: "2025-07-10",
    amount: "$52,300.00",
    status: "Draft",
    billTo: { name: "DRP2301 Holdings", address: "200 Park Ave, New York, NY 10166", email: "ap@drp2301.com" },
    lines: [
      { description: "Enterprise base — quarterly", qty: 1, rate: "$45,000.00", amount: "$45,000.00", kind: "Product" },
      { description: "Claim fees", qty: 290, rate: "$22.00", amount: "$6,380.00", kind: "Claim Fee" },
      { description: "Claim activity fees", qty: 263, rate: "$3.50", amount: "$920.50", kind: "Claim Activity Fee" },
    ],
  },
];

const ih = createColumnHelper<Invoice>();

function InvoicesPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState("all");

  const groups = useMemo(() => Array.from(new Set(invoices.map((i) => i.invoiceGroup))), []);

  const data = useMemo(() => invoices.filter((i) =>
    (statusFilter === "all" || i.status === statusFilter) &&
    (groupFilter === "all" || i.invoiceGroup === groupFilter)
  ), [statusFilter, groupFilter]);

  const columns = useMemo(() => [
    ih.accessor("invoiceNumber", {
      header: "Invoice #",
      cell: (i) => (
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-md bg-brand-secondary/[0.08] text-brand-secondary">
            <Receipt className="size-3.5" />
          </span>
          <span className="font-mono text-xs font-semibold text-slate-900">{i.getValue()}</span>
        </div>
      ),
    }),
    ih.accessor("invoiceDate", { header: "Invoice Date", cell: (i) => <span className="text-sm text-slate-600">{i.getValue()}</span> }),
    ih.accessor("clientName", {
      header: "Client",
      cell: (i) => (
        <div>
          <div className="text-sm font-medium text-slate-900">{i.getValue()}</div>
          <div className="font-mono text-[11px] text-slate-400">{i.row.original.clientRefId}</div>
        </div>
      ),
    }),
    ih.accessor("contractId", { header: "Contract", cell: (i) => <span className="font-mono text-xs text-slate-700">{i.getValue()}</span> }),
    ih.accessor("invoiceGroup", { header: "Group", cell: (i) => <span className="text-sm text-slate-600">{i.getValue()}</span> }),
    ih.accessor("dueDate", { header: "Due Date", cell: (i) => <span className="text-sm text-slate-600">{i.getValue()}</span> }),
    ih.accessor("amount", { header: "Amount", cell: (i) => <span className="text-sm font-semibold text-slate-900">{i.getValue()}</span> }),
    ih.accessor("status", {
      header: "Status",
      cell: (i) => {
        const s = i.getValue();
        const tone = s === "Paid" ? "success" : s === "Pending" ? "info" : s === "Overdue" ? "danger" : "draft";
        return <StatusChip tone={tone}>{s}</StatusChip>;
      },
    }),
  ], []);

  return (
    <AppShell
      breadcrumbs={[{ label: "Invoices" }]}
      title="Invoices"
      subtitle={`${data.length} invoice${data.length === 1 ? "" : "s"} across all clients`}
      actions={
        <Button variant="outline" size="sm">
          <Download className="mr-1.5 size-3.5" /> Export
        </Button>
      }
    >
      <DataTable
        data={data}
        columns={columns}
        searchPlaceholder="Search by invoice #, client, contract…"
        searchKeys={["invoiceNumber", "clientName", "clientRefId", "contractId", "invoiceGroup", "status"]}
        toolbar={
          <>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 w-36 bg-white"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Select value={groupFilter} onValueChange={setGroupFilter}>
              <SelectTrigger className="h-9 w-48 bg-white"><SelectValue placeholder="Group" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All groups</SelectItem>
                {groups.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
              </SelectContent>
            </Select>
          </>
        }
        renderExpanded={(inv) => (
          <ExpandedShell
            sections={[
              {
                id: "billto",
                title: "Bill to",
                description: "Client billing recipient.",
                view: (
                  <div>
                    <FieldRow label="Name">{inv.billTo.name}</FieldRow>
                    <FieldRow label="Address">{inv.billTo.address}</FieldRow>
                    <FieldRow label="Email">{inv.billTo.email}</FieldRow>
                    <FieldRow label="Client Ref"><span className="font-mono text-xs">{inv.clientRefId}</span></FieldRow>
                    <FieldRow label="Contract"><span className="font-mono text-xs">{inv.contractId}</span></FieldRow>
                  </div>
                ),
              },
              {
                id: "lines",
                title: `Line items (${inv.lines.length})`,
                description: "Claim fees, claim activity fees, products and other billing components.",
                view: (
                  <div className="overflow-hidden rounded-lg border border-slate-200">
                    <table className="w-full text-sm">
                      <thead className="thead-brand">
                        <tr>
                          <th className="th-brand px-3 py-2 text-left">Description</th>
                          <th className="th-brand px-3 py-2 text-left">Kind</th>
                          <th className="th-brand px-3 py-2 text-right">Qty</th>
                          <th className="th-brand px-3 py-2 text-right">Rate</th>
                          <th className="th-brand px-3 py-2 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inv.lines.map((l, i) => (
                          <tr key={i} className="border-t border-slate-100">
                            <td className="px-3 py-2 font-medium text-slate-900">{l.description}</td>
                            <td className="px-3 py-2">
                              <StatusChip tone={l.kind === "Claim Fee" ? "info" : l.kind === "Claim Activity Fee" ? "warning" : l.kind === "Product" ? "success" : "neutral"} dot={false}>
                                {l.kind}
                              </StatusChip>
                            </td>
                            <td className="px-3 py-2 text-right text-slate-600">{l.qty}</td>
                            <td className="px-3 py-2 text-right text-slate-600">{l.rate}</td>
                            <td className="px-3 py-2 text-right font-semibold text-slate-900">{l.amount}</td>
                          </tr>
                        ))}
                        <tr className="border-t border-slate-200 bg-brand-secondary/[0.04]">
                          <td colSpan={4} className="px-3 py-2 text-right text-sm font-semibold text-slate-700">Total</td>
                          <td className="px-3 py-2 text-right text-base font-bold text-brand-secondary">{inv.amount}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ),
              },
              {
                id: "meta",
                title: "Invoice meta",
                view: (
                  <div>
                    <FieldRow label="Invoice #"><span className="font-mono text-xs">{inv.invoiceNumber}</span></FieldRow>
                    <FieldRow label="Date">{inv.invoiceDate}</FieldRow>
                    <FieldRow label="Due">{inv.dueDate}</FieldRow>
                    <FieldRow label="Group">{inv.invoiceGroup}</FieldRow>
                    <FieldRow label="Status"><StatusChip tone={statusToTone(inv.status)}>{inv.status}</StatusChip></FieldRow>
                  </div>
                ),
              },
            ]}
            actions={
              <Button size="sm" variant="outline">
                <FileText className="mr-1.5 size-3.5" /> Download PDF
              </Button>
            }
          />
        )}
      />
    </AppShell>
  );
}
