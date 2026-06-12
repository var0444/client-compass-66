import { Fragment, useState, type ReactNode } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
} from "@tanstack/react-table";
import { ChevronDown, ChevronRight, ChevronsLeft, ChevronsRight, Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T, any>[];
  searchPlaceholder?: string;
  searchKeys?: (keyof T)[];
  toolbar?: ReactNode;
  renderExpanded?: (row: T) => ReactNode;
  onRowClick?: (row: T) => void;
  pageSize?: number;
  emptyMessage?: string;
  getRowId?: (row: T) => string;
}

export function DataTable<T extends { id?: string }>({
  data,
  columns,
  searchPlaceholder = "Search…",
  searchKeys,
  toolbar,
  renderExpanded,
  onRowClick,
  pageSize = 8,
  emptyMessage = "No records found.",
  getRowId,
}: DataTableProps<T>) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter, columnFilters },
    initialState: { pagination: { pageIndex: 0, pageSize } },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    globalFilterFn: (row, _id, value) => {
      const q = String(value).toLowerCase();
      if (!q) return true;
      const keys = searchKeys ?? (Object.keys(row.original as object) as (keyof T)[]);
      return keys.some((k) => String((row.original as any)[k] ?? "").toLowerCase().includes(q));
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const rows = table.getRowModel().rows;
  const total = table.getFilteredRowModel().rows.length;
  const colCount = columns.length + (renderExpanded ? 1 : 0);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-9 border-slate-200 bg-slate-50/60 pl-8 focus-visible:bg-white"
          />
        </div>
        {toolbar}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="thead-brand">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {renderExpanded && <th className="w-8" />}
                {hg.headers.map((h) => {
                  const canSort = h.column.getCanSort();
                  const sorted = h.column.getIsSorted();
                  return (
                    <th
                      key={h.id}
                      className="th-brand px-4 py-2.5 text-left"
                    >
                      {canSort ? (
                        <button
                          onClick={h.column.getToggleSortingHandler()}
                          className="inline-flex items-center gap-1 hover:opacity-80"
                        >
                          {flexRender(h.column.columnDef.header, h.getContext())}
                          {sorted === "asc" ? <ArrowUp className="size-3" /> : sorted === "desc" ? <ArrowDown className="size-3" /> : <ArrowUpDown className="size-3 opacity-40" />}
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
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={colCount} className="px-6 py-16 text-center text-sm text-slate-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const id = getRowId?.(row.original) ?? row.original.id ?? row.id;
                const isOpen = !!expanded[id];
                const clickable = !!renderExpanded || !!onRowClick;
                return (
                  <Fragment key={id}>
                    <tr
                      onClick={() => {
                        if (renderExpanded) setExpanded((p) => ({ ...p, [id]: !p[id] }));
                        else if (onRowClick) onRowClick(row.original);
                      }}
                      className={cn(
                        "border-b border-slate-50 transition-colors",
                        clickable && "cursor-pointer hover:bg-brand-secondary/[0.035]",
                        isOpen && "bg-brand-secondary/[0.04]",
                      )}
                    >
                      {renderExpanded && (
                        <td className="pl-4 pr-0 align-middle">
                          <span className="grid size-5 place-items-center rounded text-slate-400">
                            {isOpen ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                          </span>
                        </td>
                      )}
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3 align-middle">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                    {renderExpanded && isOpen && (
                      <tr className="bg-slate-50/50">
                        <td />
                        <td colSpan={colCount - 1} className="px-4 pb-5 pt-2">
                          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                            {renderExpanded(row.original)}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-2.5 text-xs text-slate-500">
        <div>
          Showing <span className="font-semibold text-slate-700">{rows.length === 0 ? 0 : table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}</span>–
          <span className="font-semibold text-slate-700">{table.getState().pagination.pageIndex * table.getState().pagination.pageSize + rows.length}</span> of {total}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="size-7" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
            <ChevronsLeft className="size-3.5" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            Prev
          </Button>
          <span className="px-2">
            Page <span className="font-semibold text-slate-700">{table.getState().pagination.pageIndex + 1}</span> / {table.getPageCount() || 1}
          </span>
          <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
          <Button variant="ghost" size="icon" className="size-7" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>
            <ChevronsRight className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
