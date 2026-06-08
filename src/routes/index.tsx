import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import { AppShell } from "@/components/AppShell";
import { clients, type Client } from "@/lib/clients-data";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: ClientOverview,
  head: () => ({
    meta: [
      { title: "Client Overview · Client360" },
      { name: "description", content: "Manage clients, contracts, operational units and pricing in one workspace." },
    ],
  }),
});

const columnHelper = createColumnHelper<Client>();

function SortIcon({ dir }: { dir: false | "asc" | "desc" }) {
  return (
    <span className="ml-1 inline-flex flex-col text-[8px] leading-[8px] text-slate-400">
      <span className={dir === "asc" ? "text-brand-secondary" : ""}>▲</span>
      <span className={dir === "desc" ? "text-brand-secondary" : ""}>▼</span>
    </span>
  );
}

function ClientOverview() {
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const states = useMemo(
    () => Array.from(new Set(clients.map((c) => c.state))).sort(),
    [],
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Client Name",
        cell: (info) => (
          <Link
            to="/clients/$clientId"
            params={{ clientId: info.row.original.id }}
            className="font-semibold text-brand-secondary hover:text-brand-primary"
          >
            {info.getValue()}
          </Link>
        ),
      }),
      columnHelper.accessor("client360Id", {
        header: "Client360 ID",
        cell: (info) => (
          <span className="font-mono text-xs text-slate-600">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("billingAddress", {
        header: "Billing Address",
        enableSorting: false,
        cell: (info) => <span className="text-slate-600">{info.getValue()}</span>,
      }),
      columnHelper.accessor("state", {
        header: "State",
        filterFn: "equals",
        cell: (info) => <span className="text-slate-700">{info.getValue()}</span>,
      }),
      columnHelper.accessor("city", {
        header: "City",
        cell: (info) => <span className="text-slate-600">{info.getValue()}</span>,
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) =>
          info.getValue() === "active" ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
              <span className="size-1.5 rounded-full bg-emerald-500" /> Active
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
              <span className="size-1.5 rounded-full bg-slate-400" /> Inactive
            </span>
          ),
      }),
      columnHelper.display({
        id: "open",
        header: () => <span className="sr-only">Open</span>,
        cell: (info) => (
          <Link
            to="/clients/$clientId"
            params={{ clientId: info.row.original.id }}
            className="inline-flex items-center gap-1 rounded-md border border-brand-secondary/15 bg-white px-3 py-1.5 text-xs font-semibold text-brand-secondary transition-colors hover:border-brand-primary hover:bg-brand-primary hover:text-white"
          >
            View details
            <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ),
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: clients,
    columns,
    state: { sorting, globalFilter, columnFilters },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    globalFilterFn: (row, _id, value) => {
      const q = String(value).toLowerCase();
      const c = row.original;
      return [c.name, c.state, c.city, c.client360Id, c.billingAddress]
        .join(" ")
        .toLowerCase()
        .includes(q);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const stateFilter = (table.getColumn("state")?.getFilterValue() as string) ?? "all";

  return (
    <AppShell breadcrumbs={[{ label: "Clients" }]}>
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-brand-secondary">Client Overview</h1>
          <p className="mt-1 text-sm text-slate-500">
            {table.getFilteredRowModel().rows.length} of {clients.length} clients
          </p>
        </div>
        <Button className="bg-brand-primary text-white hover:bg-brand-primary-hover">
          + Add Client
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-surface-card shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <svg className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path strokeLinecap="round" d="m20 20-3-3" />
            </svg>
            <Input
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search by client name, state, city, or ID…"
              className="pl-9"
            />
          </div>
          <Select
            value={stateFilter}
            onValueChange={(v) =>
              table.getColumn("state")?.setFilterValue(v === "all" ? undefined : v)
            }
          >
            <SelectTrigger className="sm:w-48">
              <SelectValue placeholder="Filter by state" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All states</SelectItem>
              {states.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(globalFilter || stateFilter !== "all") && (
            <Button
              variant="ghost"
              onClick={() => {
                setGlobalFilter("");
                table.getColumn("state")?.setFilterValue(undefined);
              }}
              className="text-slate-500"
            >
              Clear
            </Button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/70 text-xs font-semibold uppercase tracking-wider text-slate-500">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => {
                    const canSort = h.column.getCanSort();
                    return (
                      <th key={h.id} className="px-6 py-3.5">
                        {canSort ? (
                          <button
                            onClick={h.column.getToggleSortingHandler()}
                            className="inline-flex items-center hover:text-brand-secondary"
                          >
                            {flexRender(h.column.columnDef.header, h.getContext())}
                            <SortIcon dir={h.column.getIsSorted()} />
                          </button>
                        ) : (
                          flexRender(h.column.columnDef.header, h.getContext())
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-100">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center text-sm text-slate-500">
                    No clients match your filters.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="transition-colors hover:bg-brand-primary/[0.04]">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
