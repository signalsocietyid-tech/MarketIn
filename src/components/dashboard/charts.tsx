"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const BRAND = "#F47735";
const NAVY = "#17365D";
const AXIS = { fontSize: 12, fill: "#8A94A6" };
const GRID = "#EEF0F3";

export const CHART_COLORS = ["#17365D", "#F47735", "#3478C8", "#8A94A6", "#079455", "#B3C6DE"];

function TooltipBox({ active, payload, label, format }: { active?: boolean; payload?: { name?: string; value?: number; color?: string }[]; label?: string; format?: (v: number) => string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-line bg-white px-3 py-2 text-xs shadow-lift">
      {label && <p className="mb-1 font-medium text-ink">{label}</p>}
      {payload.map((p) => (
        <p key={p.name} className="flex items-center gap-2 text-subtle">
          <span className="size-2 rounded-full" style={{ background: p.color }} />
          {p.name}: <span className="font-semibold text-ink">{format ? format(Number(p.value)) : p.value}</span>
        </p>
      ))}
    </div>
  );
}

export function TrendChart({
  data,
  dataKey,
  name,
  height = 220,
  color = BRAND,
}: {
  data: Record<string, string | number>[];
  dataKey: string;
  name: string;
  height?: number;
  color?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id={`fill-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.18} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="label" tick={AXIS} axisLine={false} tickLine={false} />
        <YAxis tick={AXIS} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip content={<TooltipBox />} cursor={{ stroke: GRID }} />
        <Area type="monotone" dataKey={dataKey} name={name} stroke={color} strokeWidth={2} fill={`url(#fill-${dataKey})`} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function BarsChart({
  data,
  bars,
  height = 240,
  currency,
}: {
  data: Record<string, string | number>[];
  bars: { key: string; name: string; color?: string }[];
  height?: number;
  currency?: boolean;
}) {
  const fmt = currency ? (v: number) => `Rp${(v / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} jt` : undefined;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: currency ? 0 : -16, bottom: 0 }}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="label" tick={AXIS} axisLine={false} tickLine={false} interval={0} />
        <YAxis tick={AXIS} axisLine={false} tickLine={false} allowDecimals={false} tickFormatter={fmt} width={currency ? 64 : undefined} />
        <Tooltip content={<TooltipBox format={fmt} />} cursor={{ fill: "#F5F6F8" }} />
        {bars.map((b, i) => (
          <Bar key={b.key} dataKey={b.key} name={b.name} fill={b.color ?? (i === 0 ? NAVY : BRAND)} radius={[4, 4, 0, 0]} maxBarSize={36} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DonutChart({ data, height = 200 }: { data: { name: string; value: number }[]; height?: number }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="relative shrink-0" style={{ width: height, height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="95%" paddingAngle={2} stroke="none">
              {data.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<TooltipBox />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-2xl font-bold text-navy-900">{total}</span>
          <span className="text-[11px] text-muted">total</span>
        </div>
      </div>
      <ul className="w-full space-y-2">
        {data.map((d, i) => (
          <li key={d.name} className="flex items-center justify-between gap-3 text-[13px]">
            <span className="flex items-center gap-2 text-subtle">
              <span className="size-2.5 rounded-sm" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
              {d.name}
            </span>
            <span className="font-medium text-ink">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
