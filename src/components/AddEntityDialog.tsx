import { useEffect, useState, type ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export type FieldDef =
  | { type: "text"; key: string; label: string; placeholder?: string; required?: boolean; full?: boolean; defaultValue?: string }
  | { type: "textarea"; key: string; label: string; placeholder?: string; rows?: number; full?: boolean; defaultValue?: string }
  | { type: "date"; key: string; label: string; required?: boolean; full?: boolean; defaultValue?: string }
  | { type: "select"; key: string; label: string; options: { value: string; label: string }[]; placeholder?: string; full?: boolean; defaultValue?: string }
  | { type: "multiselect"; key: string; label: string; options: { value: string; label: string }[]; full?: boolean; defaultValue?: string[] }
  | { type: "checkbox"; key: string; label: string; description?: string; full?: boolean; defaultValue?: boolean }
  | { type: "switch"; key: string; label: string; description?: string; full?: boolean; defaultValue?: boolean };

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description?: string;
  fields: FieldDef[];
  submitLabel?: string;
  onSubmit?: (values: Record<string, any>) => void;
  footer?: ReactNode;
}

export function AddEntityDialog({ open, onOpenChange, title, description, fields, submitLabel = "Create", onSubmit }: Props) {
  const [values, setValues] = useState<Record<string, any>>({});

  useEffect(() => {
    if (open) {
      const initial: Record<string, any> = {};
      for (const f of fields) {
        if ("defaultValue" in f && f.defaultValue !== undefined) initial[f.key] = f.defaultValue;
        else if (f.type === "multiselect") initial[f.key] = [];
        else if (f.type === "checkbox" || f.type === "switch") initial[f.key] = false;
      }
      setValues(initial);
    }
  }, [open]); // eslint-disable-line

  const set = (k: string, v: any) => setValues((p) => ({ ...p, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-2">
          {fields.map((f) => (
            <div key={f.key} className={cn("space-y-1.5", f.full && "col-span-2")}>
              <Label className="text-xs font-medium text-slate-600">
                {f.label}
                {("required" in f && f.required) && <span className="text-brand-primary"> *</span>}
              </Label>
              {renderField(f, values[f.key], (v) => set(f.key, v))}
              {"description" in f && f.description && (
                <p className="text-[11px] text-slate-500">{f.description}</p>
              )}
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            className="bg-brand-primary text-white hover:bg-brand-primary-hover"
            onClick={() => { onSubmit?.(values); onOpenChange(false); }}
          >
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function renderField(f: FieldDef, value: any, onChange: (v: any) => void) {
  switch (f.type) {
    case "text":
      return <Input value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={f.placeholder} />;
    case "textarea":
      return <Textarea value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={f.placeholder} rows={f.rows ?? 3} />;
    case "date":
      return <Input type="date" value={value ?? ""} onChange={(e) => onChange(e.target.value)} />;
    case "select":
      return (
        <Select value={value ?? ""} onValueChange={onChange}>
          <SelectTrigger><SelectValue placeholder={f.placeholder ?? "Select…"} /></SelectTrigger>
          <SelectContent>
            {f.options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
      );
    case "multiselect": {
      const selected: string[] = Array.isArray(value) ? value : [];
      return (
        <div className="grid grid-cols-2 gap-2 rounded-md border border-slate-200 bg-slate-50/60 p-2">
          {f.options.map((o) => {
            const checked = selected.includes(o.value);
            return (
              <label key={o.value} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm hover:bg-white">
                <Checkbox
                  checked={checked}
                  onCheckedChange={(c) => {
                    const next = c ? [...selected, o.value] : selected.filter((v) => v !== o.value);
                    onChange(next);
                  }}
                />
                <span className="text-slate-700">{o.label}</span>
              </label>
            );
          })}
        </div>
      );
    }
    case "checkbox":
      return (
        <label className="flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm">
          <Checkbox checked={!!value} onCheckedChange={(c) => onChange(!!c)} />
          <span className="text-slate-700">{f.label}</span>
        </label>
      );
    case "switch":
      return (
        <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50/60 px-3 py-2">
          <span className="text-sm text-slate-700">{f.label}</span>
          <Switch checked={!!value} onCheckedChange={onChange} />
        </div>
      );
  }
}
