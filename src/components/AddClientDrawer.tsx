import { useState } from "react";
import { Check, ChevronRight } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const steps = [
  { id: 1, label: "Client Details" },
  { id: 2, label: "Contract" },
  { id: 3, label: "Operational Units" },
  { id: 4, label: "Review" },
];

export function AddClientDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [step, setStep] = useState(1);
  const [units, setUnits] = useState<{ name: string; region: string }[]>([{ name: "", region: "" }]);

  const next = () => setStep((s) => Math.min(4, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader className="border-b border-slate-100 pb-4">
          <SheetTitle className="text-xl">Add New Client</SheetTitle>
          <SheetDescription>Set up the client, primary contract, and any operational units.</SheetDescription>
        </SheetHeader>

        <div className="flex items-center justify-between px-1 py-5">
          {steps.map((s, i) => {
            const done = step > s.id;
            const active = step === s.id;
            return (
              <div key={s.id} className="flex flex-1 items-center">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "grid size-7 place-items-center rounded-full text-xs font-semibold ring-1",
                      done && "bg-emerald-500 text-white ring-emerald-500",
                      active && "bg-brand-primary text-white ring-brand-primary",
                      !done && !active && "bg-white text-slate-400 ring-slate-200",
                    )}
                  >
                    {done ? <Check className="size-3.5" /> : s.id}
                  </span>
                  <span className={cn("hidden text-xs font-medium md:inline", active ? "text-slate-900" : "text-slate-500")}>
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && <div className={cn("mx-2 h-px flex-1", done ? "bg-emerald-300" : "bg-slate-200")} />}
              </div>
            );
          })}
        </div>

        <div className="space-y-5 px-1">
          {step === 1 && (
            <div className="grid grid-cols-2 gap-4">
              <Field label="Client Name" required><Input placeholder="Acme Logistics" /></Field>
              <Field label="Client Reference ID"><Input placeholder="CRI00204" /></Field>
              <Field label="Segment">
                <Select>
                  <SelectTrigger><SelectValue placeholder="Choose segment" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                    <SelectItem value="mid">Mid-Market</SelectItem>
                    <SelectItem value="smb">SMB</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Account Owner"><Input placeholder="J. Doe" /></Field>
              <Field label="Billing Address" className="col-span-2"><Input placeholder="731 Main Street, Suite 110" /></Field>
              <Field label="City"><Input placeholder="Phoenix" /></Field>
              <Field label="State"><Input placeholder="AZ" /></Field>
              <Field label="Zip Code"><Input placeholder="85001" /></Field>
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-2 gap-4">
              <Field label="Contract ID"><Input placeholder="CONT-2025-0002" /></Field>
              <Field label="Source">
                <Select>
                  <SelectTrigger><SelectValue placeholder="Direct Sales" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="direct">Direct Sales</SelectItem>
                    <SelectItem value="partner">Partner Referral</SelectItem>
                    <SelectItem value="renewal">Renewal</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Start Date"><Input type="date" /></Field>
              <Field label="End Date"><Input type="date" /></Field>
              <Field label="Base Pricing Plan" className="col-span-2">
                <Select>
                  <SelectTrigger><SelectValue placeholder="Premium Global Tier" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="premium">Premium Global Tier</SelectItem>
                    <SelectItem value="standard">Standard Tier</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Monthly Value"><Input placeholder="$1,200" /></Field>
              <Field label="Term"><Input placeholder="12 Months" /></Field>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              {units.map((u, i) => (
                <div key={i} className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-slate-50/60 p-4">
                  <Field label={`Unit ${i + 1} Name`}>
                    <Input value={u.name} onChange={(e) => {
                      const c = [...units]; c[i].name = e.target.value; setUnits(c);
                    }} placeholder="West Coast Fulfillment" />
                  </Field>
                  <Field label="Region">
                    <Input value={u.region} onChange={(e) => {
                      const c = [...units]; c[i].region = e.target.value; setUnits(c);
                    }} placeholder="Pacific (CA, WA)" />
                  </Field>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => setUnits([...units, { name: "", region: "" }])}>
                + Add another unit
              </Button>
            </div>
          )}

          {step === 4 && (
            <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-6 text-sm">
              <h4 className="text-base font-semibold text-slate-900">Ready to create</h4>
              <p className="mt-1 text-slate-500">
                The client, its primary contract, and {units.filter((u) => u.name).length || units.length} operational unit(s) will be created.
                You can refine pricing overrides and CAG associations from Client Configuration.
              </p>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 mt-6 flex items-center justify-between border-t border-slate-100 bg-white pt-4">
          <Button variant="ghost" onClick={back} disabled={step === 1}>Back</Button>
          {step < 4 ? (
            <Button onClick={next} className="bg-brand-primary text-white hover:bg-brand-primary-hover">
              Continue <ChevronRight className="ml-1 size-4" />
            </Button>
          ) : (
            <Button onClick={() => onOpenChange(false)} className="bg-emerald-600 text-white hover:bg-emerald-700">
              Create Client
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Field({ label, required, className, children }: { label: string; required?: boolean; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-xs font-medium text-slate-600">
        {label} {required && <span className="text-brand-primary">*</span>}
      </Label>
      {children}
    </div>
  );
}
