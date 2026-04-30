interface StatsRowProps {
  stats: {
    hours_saved: number;
    articles_contributed: number;
  };
}

export default function StatsRow({ stats }: StatsRowProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Card 1: The Action Queue */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col p-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">PENDING DRAFTS</span>
        </div>
        <div className="text-4xl font-bold text-slate-900 mt-4">3</div>
        <div className="text-sm text-slate-500 mt-2 flex items-center gap-1.5">
          Ready for your review. <span className="bg-green-500 rounded-full w-2 h-2 inline-block"></span>
        </div>
      </div>

      {/* Card 2: The Milestone Metric */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col p-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">KBs PUBLISHED</span>
        </div>
        <div className="text-4xl font-bold text-slate-900 mt-4">14</div>
        <div className="text-sm text-slate-500 mt-2">
          Approved to Confluence this month.
        </div>
      </div>

      {/* Card 3: The Social Impact Metric */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col p-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">TEAMMATES HELPED</span>
        </div>
        <div className="text-4xl font-bold text-slate-900 mt-4">6</div>
        <div className="text-sm text-slate-500 mt-2">
          Escalations deflected using your docs.
        </div>
      </div>
    </div>
  );
}
