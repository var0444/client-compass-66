import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Search, Truck, Building2, Layers, Ban } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface UnassignedCarrier {
  carrier: string;
  accounts: { account: string; groups: string[] }[];
}

/** Demo inventory of CAGs not yet associated with any operational unit. */
export const initialUnassignedCags: UnassignedCarrier[] = [
  { carrier: "DHL Express", accounts: [
    { account: "ACC-90110", groups: ["International Priority", "Economy Select", "Returns"] },
    { account: "ACC-90112", groups: ["Medical Express", "Same Day"] },
  ] },
  { carrier: "USPS", accounts: [
    { account: "ACC-31007", groups: ["Priority Mail", "First Class", "Media Mail"] },
  ] },
  { carrier: "OnTrac", accounts: [
    { account: "ACC-66420", groups: ["West Regional", "Ground Saver"] },
    { account: "ACC-66421", groups: ["Specialty Rx"] },
  ] },
  { carrier: "UPS", accounts: [
    { account: "ACC-48802", groups: ["Next Day Air", "2nd Day Air", "Ground Residential"] },
  ] },
];

export interface NewCagAssignment {
  ouId: string;
  carrier: string;
  account: string; // "—" for carrier level
  group: string;   // "—" for carrier/account level
  effectiveFrom: string;
  effectiveTo: string;
  active: boolean;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  units: { id: string; name: string }[];
  inventory: UnassignedCarrier[];
  /** CAGs already linked to an OU — pick these to add new effective dates. */
  assignedInventory?: UnassignedCarrier[];
  onAssign: (rows: NewCagAssignment[]) => void;
}

type ScopeFilter = "unassigned" | "assigned" | "all";

/** Merge two inventories, de-duplicating groups per carrier/account. */
function mergeInventory(a: UnassignedCarrier[], b: UnassignedCarrier[]): UnassignedCarrier[] {
  const map = new Map<string, Map<string, Set<string>>>();
  for (const src of [a, b])
    for (const c of src)
      for (const acct of c.accounts) {
        if (!map.has(c.carrier)) map.set(c.carrier, new Map());
        const am = map.get(c.carrier)!;
        if (!am.has(acct.account)) am.set(acct.account, new Set());
        acct.groups.forEach((g) => am.get(acct.account)!.add(g));
      }
  return [...map.entries()].map(([carrier, am]) => ({
    carrier,
    accounts: [...am.entries()].map(([account, gs]) => ({ account, groups: [...gs] })),
  }));
}

const gKey = (c: string, a: string, g: string) => `${c}|${a}|${g}`;

export function AssignCagDialog({ open, onOpenChange, units, inventory, assignedInventory = [], onAssign }: Props) {
  const [ouId, setOuId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [active, setActive] = useState(true);
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<ScopeFilter>("unassigned");
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (open) {
      setOuId(""); setFrom(""); setTo(""); setActive(true); setQuery(""); setScope("unassigned"); setPicked(new Set()); setExpanded({});
    }
  }, [open]);

  const assignedKeys = useMemo(() => {
    const s = new Set<string>();
    for (const c of assignedInventory)
      for (const a of c.accounts) for (const g of a.groups) s.add(gKey(c.carrier, a.account, g));
    return s;
  }, [assignedInventory]);

  const source = useMemo(() => {
    if (scope === "unassigned") return inventory;
    if (scope === "assigned") return assignedInventory;
    return mergeInventory(inventory, assignedInventory);
  }, [scope, inventory, assignedInventory]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return source;
    return source
      .map((c) => {
        if (c.carrier.toLowerCase().includes(q)) return c;
        const accounts = c.accounts
          .map((a) => a.account.toLowerCase().includes(q) ? a : { ...a, groups: a.groups.filter((g) => g.toLowerCase().includes(q)) })
          .filter((a) => a.groups.length > 0);
        return { ...c, accounts };
      })
      .filter((c) => c.accounts.length > 0);
  }, [source, query]);

  const allGroupKeys = (c: UnassignedCarrier, a?: string) =>
    c.accounts.filter((x) => !a || x.account === a).flatMap((x) => x.groups.map((g) => gKey(c.carrier, x.account, g)));

  const stateOf = (keys: string[]): boolean | "indeterminate" => {
    const n = keys.filter((k) => picked.has(k)).length;
    return n === 0 ? false : n === keys.length ? true : "indeterminate";
  };

  const toggle = (keys: string[], on: boolean) =>
    setPicked((prev) => {
      const next = new Set(prev);
      keys.forEach((k) => (on ? next.add(k) : next.delete(k)));
      return next;
    });

  /** Collapse selections to the most general level that is fully covered. */
  const plan = useMemo(() => {
    const rules: { carrier: string; account: string; group: string; label: string; excluded: string[] }[] = [];
    for (const c of source) {
      const keys = allGroupKeys(c);
      const sel = keys.filter((k) => picked.has(k));
      if (sel.length === 0) continue;
      if (sel.length === keys.length) {
        rules.push({ carrier: c.carrier, account: "—", group: "—", label: "All accounts & groups", excluded: [] });
        continue;
      }
      for (const a of c.accounts) {
        const aKeys = allGroupKeys(c, a.account);
        const aSel = aKeys.filter((k) => picked.has(k));
        if (aSel.length === 0) continue;
        if (aSel.length === aKeys.length) {
          rules.push({ carrier: c.carrier, account: a.account, group: "—", label: "All groups", excluded: [] });
        } else {
          a.groups.filter((g) => picked.has(gKey(c.carrier, a.account, g))).forEach((g) =>
            rules.push({ carrier: c.carrier, account: a.account, group: g, label: "Single group", excluded: [] }));
        }
      }
      const excluded = keys.filter((k) => !picked.has(k)).map((k) => k.split("|").slice(1).join(" / "));
      if (rules.length) rules[rules.length - 1].excluded = excluded;
    }
    return rules;
  }, [picked, source]);

  const excludedByCarrier = useMemo(() => {
    const m: Record<string, string[]> = {};
    for (const c of source) {
      const keys = allGroupKeys(c);
      const sel = keys.filter((k) => picked.has(k));
      if (sel.length > 0 && sel.length < keys.length) m[c.carrier] = keys.filter((k) => !picked.has(k)).map((k) => k.split("|").slice(1).join(" · "));
    }
    return m;
  }, [picked, source]);

  const canSubmit = ouId && from && plan.length > 0;

  const submit = () => {
    onAssign(plan.map((r) => ({ ouId, carrier: r.carrier, account: r.account, group: r.group, effectiveFrom: from, effectiveTo: to || "Open-ended", active })));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Assign CAGs</DialogTitle>
          <DialogDescription>
            Pick carriers, accounts or groups at any level. Use the filter to work with unassigned CAGs, or switch to assigned ones to add new effective dates. Select a whole carrier to include everything under it, then untick any groups you want to exclude.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 md:grid-cols-[1.4fr_1fr]">
          {/* Picker */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 size-4 text-slate-400" />
                <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search carrier, account or group…" className="pl-8" />
              </div>
              <Select value={scope} onValueChange={(v) => { setScope(v as ScopeFilter); setPicked(new Set()); }}>
                <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="all">All CAGs</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="max-h-[420px] overflow-y-auto rounded-lg border border-slate-200">
              {filtered.length === 0 && <p className="p-6 text-center text-sm text-slate-500">No unassigned CAGs match.</p>}
              {filtered.map((c) => {
                const fullC = source.find((x) => x.carrier === c.carrier)!;
                const cKeys = allGroupKeys(fullC);
                const cOpen = expanded[c.carrier] ?? !!query;
                const total = cKeys.length;
                const n = cKeys.filter((k) => picked.has(k)).length;
                return (
                  <div key={c.carrier} className="border-b border-slate-100 last:border-0">
                    <div className="flex items-center gap-2 bg-slate-50/70 px-3 py-2">
                      <button type="button" onClick={() => setExpanded((p) => ({ ...p, [c.carrier]: !cOpen }))} className="text-slate-500">
                        {cOpen ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                      </button>
                      <Checkbox checked={stateOf(cKeys)} onCheckedChange={(v) => toggle(cKeys, v === true)} />
                      <Truck className="size-4 text-brand-primary" />
                      <span className="text-sm font-semibold text-slate-900">{c.carrier}</span>
                      <span className="ml-auto text-[11px] text-slate-500">
                        {n === total ? "Entire carrier" : n > 0 ? `${n}/${total} groups` : `${fullC.accounts.length} accounts · ${total} groups`}
                      </span>
                    </div>
                    {cOpen && c.accounts.map((a) => {
                      const aKeys = allGroupKeys(fullC, a.account);
                      return (
                        <div key={a.account} className="pl-8">
                          <div className="flex items-center gap-2 px-3 py-1.5">
                            <Checkbox checked={stateOf(aKeys)} onCheckedChange={(v) => toggle(aKeys, v === true)} />
                            <Building2 className="size-3.5 text-slate-500" />
                            <span className="font-mono text-xs text-slate-700">{a.account}</span>
                          </div>
                          <div className="pb-1.5 pl-8">
                            {a.groups.map((g) => {
                              const k = gKey(c.carrier, a.account, g);
                              const on = picked.has(k);
                              const carrierPartial = stateOf(cKeys) !== false && !on;
                              return (
                                <label key={g} className="flex cursor-pointer items-center gap-2 rounded px-3 py-1 text-sm hover:bg-slate-50">
                                  <Checkbox checked={on} onCheckedChange={(v) => toggle([k], v === true)} />
                                  <Layers className="size-3.5 text-slate-400" />
                                  <span className={cn("text-slate-700", carrierPartial && "text-slate-400 line-through")}>{g}</span>
                                  {carrierPartial && <span className="ml-auto rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-600">Excluded</span>}
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Assignment details + preview */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Operational Unit <span className="text-brand-primary">*</span></Label>
              <Select value={ouId} onValueChange={setOuId}>
                <SelectTrigger><SelectValue placeholder="Select OU…" /></SelectTrigger>
                <SelectContent>{units.map((u) => <SelectItem key={u.id} value={u.id}>{u.name} ({u.id})</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600">Effective From <span className="text-brand-primary">*</span></Label>
                <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600">Effective To</Label>
                <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50/60 px-3 py-2">
              <span className="text-sm text-slate-700">Activate on effective date</span>
              <Switch checked={active} onCheckedChange={setActive} />
            </div>

            <div className="rounded-lg border border-brand-primary/25 bg-brand-primary/[0.04] p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">Will be created ({plan.length})</p>
              {plan.length === 0 ? (
                <p className="text-xs text-slate-500">Nothing selected yet.</p>
              ) : (
                <ul className="max-h-40 space-y-1.5 overflow-y-auto">
                  {plan.map((r) => (
                    <li key={`${r.carrier}${r.account}${r.group}`} className="flex items-start justify-between gap-2 text-xs">
                      <span className="text-slate-800">
                        <b>{r.carrier}</b>{r.account !== "—" && <> / <span className="font-mono">{r.account}</span></>}{r.group !== "—" && <> / {r.group}</>}
                      </span>
                      <span className="shrink-0 rounded bg-white px-1.5 py-0.5 text-[10px] text-slate-600">{r.label}</span>
                    </li>
                  ))}
                </ul>
              )}
              {Object.entries(excludedByCarrier).map(([carrier, ex]) => (
                <div key={carrier} className="mt-2 border-t border-brand-primary/15 pt-2 text-xs text-slate-600">
                  <span className="inline-flex items-center gap-1 font-medium text-red-600"><Ban className="size-3" /> Excluded from {carrier}:</span>{" "}
                  {ex.join(", ")}
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={!canSubmit} onClick={submit} className="bg-brand-primary text-white hover:bg-brand-primary-hover">
            Assign {plan.length > 0 ? `${plan.length} CAG${plan.length === 1 ? "" : "s"}` : "CAGs"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
