import { cn } from "@/lib/utils";

type Tone = "success" | "neutral" | "warning" | "info" | "danger" | "draft";

const styles: Record<Tone, string> = {
  success: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  neutral: "bg-slate-100 text-slate-600 ring-slate-200",
  warning: "bg-amber-50 text-amber-700 ring-amber-200",
  info: "bg-sky-50 text-sky-700 ring-sky-200",
  danger: "bg-rose-50 text-rose-700 ring-rose-200",
  draft: "bg-violet-50 text-violet-700 ring-violet-200",
};

const dotStyles: Record<Tone, string> = {
  success: "bg-emerald-500",
  neutral: "bg-slate-400",
  warning: "bg-amber-500",
  info: "bg-sky-500",
  danger: "bg-rose-500",
  draft: "bg-violet-500",
};

export function StatusChip({
  tone = "neutral",
  children,
  dot = true,
  className,
}: {
  tone?: Tone;
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset",
        styles[tone],
        className,
      )}
    >
      {dot && <span className={cn("size-1.5 rounded-full", dotStyles[tone])} />}
      {children}
    </span>
  );
}

export function statusToTone(s: string): Tone {
  const v = s.toLowerCase();
  if (v === "active") return "success";
  if (v === "expired" || v === "inactive") return "neutral";
  if (v === "draft") return "draft";
  if (v === "pending") return "warning";
  return "neutral";
}
