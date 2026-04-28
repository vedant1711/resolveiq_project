"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";
import { useTheme } from "@/components/shared/ThemeProvider";

interface MttrChartProps {
  data: { month: string; mttr_hours: number }[];
}

export default function MttrChart({ data }: MttrChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Card className="border-border bg-card relative overflow-hidden">
      <span aria-hidden className="absolute inset-x-0 top-0 h-[2px] dark:h-px bg-gradient-to-r from-transparent via-brand-cyan/30 to-transparent" />
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-brand-cyan riq-pulse" />
          <CardTitle className="font-display text-sm font-semibold">Mean Time to Resolution (MTTR)</CardTitle>
        </div>
        <p className="text-xs text-muted-foreground font-mono">
          {data[data.length - 1]?.mttr_hours}h current vs {data[0]?.mttr_hours}h baseline
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="mttrGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isDark ? "#00d4e8" : "#0079bf"} stopOpacity={isDark ? 0.3 : 0.15} />
                <stop offset="100%" stopColor={isDark ? "#00d4e8" : "#0079bf"} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(31,41,66,0.6)" : "rgba(223,225,230,0.8)"} />
            <XAxis
              dataKey="month"
              tick={{ fill: isDark ? "#6b7796" : "#6b778c", fontSize: 11, fontFamily: "var(--font-mono)" }}
              axisLine={{ stroke: isDark ? "rgba(31,41,66,0.8)" : "rgba(223,225,230,1)" }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 20]}
              tick={{ fill: isDark ? "#6b7796" : "#6b778c", fontSize: 11, fontFamily: "var(--font-mono)" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}h`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? "rgba(14,19,30,0.95)" : "#ffffff",
                border: isDark ? "1px solid rgba(0,212,232,0.25)" : "1px solid #dfe1e6",
                borderRadius: "6px",
                fontSize: "12px",
                fontFamily: "var(--font-mono)",
                color: isDark ? "#e6ebf2" : "#172b4d",
                boxShadow: isDark ? "none" : "0 4px 12px rgba(0,0,0,0.08)",
              }}
              formatter={(value) => [`${value} hours`, "MTTR"]}
            />
            <Area
              type="monotone"
              dataKey="mttr_hours"
              stroke={isDark ? "#00d4e8" : "#0079bf"}
              strokeWidth={2.5}
              fill="url(#mttrGrad)"
              dot={{ r: 4, fill: isDark ? "#00d4e8" : "#0079bf", stroke: isDark ? "#0a0e17" : "#ffffff", strokeWidth: 2 }}
              activeDot={{ r: 6, fill: isDark ? "#00d4e8" : "#0079bf", stroke: isDark ? "#0a0e17" : "#ffffff", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
