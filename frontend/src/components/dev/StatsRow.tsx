import { Card, CardContent } from "@/components/ui/card";

interface StatsRowProps {
  stats: {
    hours_saved: number;
    articles_contributed: number;
  };
}

export default function StatsRow({ stats }: StatsRowProps) {
  return (
    <div className="riq-fade-up riq-stagger-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Card className="border-border bg-card relative overflow-hidden">
        <span aria-hidden className="absolute inset-x-0 top-0 h-[2px] dark:h-px bg-gradient-to-r from-transparent via-brand-cyan/30 to-transparent" />
        <CardContent className="p-5 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-brand-cyan/10">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-cyan">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Hours Saved This Month</p>
            <p className="font-display text-3xl font-bold text-brand-cyan">-{stats.hours_saved}</p>
          </div>
        </CardContent>
      </Card>
      <Card className="border-border bg-card relative overflow-hidden">
        <span aria-hidden className="absolute inset-x-0 top-0 h-[2px] dark:h-px bg-gradient-to-r from-transparent via-brand-blue/30 to-transparent" />
        <CardContent className="p-5 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-brand-blue/10">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-blue dark:text-brand-blue-soft">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Articles Contributed</p>
            <p className="font-display text-3xl font-bold text-brand-blue dark:text-brand-blue-soft">{stats.articles_contributed}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
