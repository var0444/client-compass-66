import { useState, type ReactNode } from "react";
import { Pencil, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ExpandedShell({
  sections,
  onSave,
  defaultEdit = false,
}: {
  sections: { id: string; title: string; description?: string; view: ReactNode; edit?: ReactNode }[];
  onSave?: () => void;
  defaultEdit?: boolean;
}) {
  const [editing, setEditing] = useState(defaultEdit);
  const anyEditable = sections.some((s) => s.edit);

  return (
    <div className="space-y-4">
      {anyEditable && (
        <div className="flex items-center justify-end gap-2">
          {!editing ? (
            <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
              <Pencil className="mr-1.5 size-3.5" /> Edit
            </Button>
          ) : (
            <>
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                <X className="mr-1.5 size-3.5" /> Cancel
              </Button>
              <Button
                size="sm"
                className="bg-brand-secondary text-white hover:bg-brand-secondary-hover"
                onClick={() => { onSave?.(); setEditing(false); }}
              >
                <Save className="mr-1.5 size-3.5" /> Save changes
              </Button>
            </>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {sections.map((s) => (
          <section
            key={s.id}
            className={cn(
              "rounded-lg border border-slate-200 bg-white p-4",
              s.edit && editing && "ring-1 ring-brand-primary/20",
            )}
          >
            <div className="mb-3 flex items-start justify-between">
              <div>
                <h4 className="text-sm font-semibold text-slate-900">{s.title}</h4>
                {s.description && <p className="text-xs text-slate-500">{s.description}</p>}
              </div>
            </div>
            <div>{editing && s.edit ? s.edit : s.view}</div>
          </section>
        ))}
      </div>
    </div>
  );
}

export function FieldRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 py-1.5 text-sm last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-800">{children}</span>
    </div>
  );
}
