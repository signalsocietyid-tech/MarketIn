"use client";

import { useRouter } from "next/navigation";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export type ChartDatum = { label: string; value: number; href?: string };

// Single-series charts: one hue (navy-600), recessive grid and axis ink.
const BAR = "#23497a";
const BAR_HOVER = "#17365d";
const GRID = "#e4e7ec";
const AXIS = "#5b6576";

function ChartTooltip({ active, payload, unit }: { active?: boolean; payload?: ReadonlyArray<{ payload?: ChartDatum }>; unit: string }) {
  const d = payload?.[0]?.payload;
  if (!active || !d) return null;
  return (
    <div className="rounded-md border border-line bg-white px-3 py-2 text-xs shadow-lift">
      <p className="font-medium text-ink">{d.label}</p>
      <p className="mt-0.5 text-subtle">
        <span className="font-semibold tabular-nums text-ink">{d.value.toLocaleString("en")}</span> {unit}
      </p>
      {d.href && <p className="mt-1 text-[11px] text-muted">Click to open the queue</p>}
    </div>
  );
}

/**
 * Horizontal bar chart for category comparisons (labels stay readable at any width).
 * Bars with an `href` navigate to the matching filtered admin queue on click.
 */
export function AdminBarChart({ data, unit, height }: { data: ChartDatum[]; unit: string; height?: number }) {
  const router = useRouter();
  const h = height ?? Math.max(160, data.length * 40 + 24);
  const summary = data.map((d) => `${d.label}: ${d.value}`).join(", ");

  return (
    <div role="img" aria-label={`${unit} — ${summary}`}>
      <ResponsiveContainer width="100%" height={h}>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, bottom: 0, left: 0 }} barCategoryGap={8}>
          <CartesianGrid horizontal={false} stroke={GRID} />
          <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: AXIS, fontSize: 12 }} />
          <YAxis
            type="category"
            dataKey="label"
            width={128}
            tickLine={false}
            axisLine={false}
            tick={{ fill: AXIS, fontSize: 12 }}
          />
          <Tooltip cursor={{ fill: "#eef3f9" }} content={(p) => <ChartTooltip active={p.active} payload={p.payload as ReadonlyArray<{ payload?: ChartDatum }>} unit={unit} />} />
          <Bar
            dataKey="value"
            fill={BAR}
            radius={[0, 4, 4, 0]}
            maxBarSize={22}
            activeBar={{ fill: BAR_HOVER }}
            isAnimationActive={false}
            style={{ cursor: data.some((d) => d.href) ? "pointer" : undefined }}
            onClick={(_, index) => {
              const href = data[index]?.href;
              if (href) router.push(href);
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
