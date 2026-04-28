import { Card, CardContent } from "@/components/ui/card";

interface MetricCardProps {
  label: string;
  value: string;
  unit?: string;
  prefix?: string;
  subtext?: string;
  icon?: "clock" | "dollar" | "team";
  tone?: "cyan" | "blue";
}

export default function MetricCard({
  label,
  value,
  unit,
  prefix,
  subtext,
  icon,
  tone = "cyan",
}: MetricCardProps) {
  const toneColors = {
    cyan: { text: "text-brand-cyan", bg: "bg-brand-cyan/10", border: "border-brand-cyan/20" },
    blue: { text: "text-brand-blue dark:text-brand-blue-soft", bg: "bg-brand-blue/10", border: "border-brand-blue/20" },
  };
  const t = toneColors[tone];

  return (
    <Card className="border-border bg-card hover:border-border-strong transition-all duration-300 group relative overflow-hidden">
      {/* Top accent line */}
      <span
        aria-hidden
        className={`absolute inset-x-0 top-0 h-[2px] dark:h-px bg-gradient-to-r from-transparent ${tone === "cyan" ? "via-brand-cyan/30" : "via-brand-blue/30"} to-transparent`}
      />
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-2">{label}</p>
            <div className="flex items-baseline gap-1">
              {prefix && <span className={`font-display text-2xl font-bold ${t.text}`}>{prefix}</span>}
              <span className={`font-display text-4xl font-bold tracking-tight ${t.text}`}>{value}</span>
              {unit && <span className="text-sm text-muted-foreground/60 font-mono ml-1">{unit}</span>}
            </div>
            {subtext && (
              <p className="text-xs text-muted-foreground/50 mt-1 font-mono">{subtext}</p>
            )}
          </div>
          {icon && (
            <div className={`p-2.5 rounded-lg ${t.bg} ${t.text} group-hover:scale-110 transition-transform duration-300`}>
              {icon === "clock" && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
              )}
              {icon === "dollar" && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              )}
              {icon === "team" && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
