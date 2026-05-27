"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";

interface Props {
  data: { date: string; revenue: number }[];
}

export function RevenueChart({ data }: Props) {
  const maxRev = Math.max(0, ...data.map((d) => d.revenue));
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#999" />
          <YAxis
            tickFormatter={(v) =>
              v >= 1000000
                ? `${(v / 1000000).toFixed(1)}M`
                : v >= 1000
                ? `${(v / 1000).toFixed(0)}K`
                : String(v)
            }
            tick={{ fontSize: 11 }}
            stroke="#999"
            width={48}
          />
          <Tooltip
            formatter={(value) =>
              new Intl.NumberFormat("mn-MN").format(Number(value)) + " ₮"
            }
            contentStyle={{
              background: "#0a0a0a",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              fontSize: 12,
            }}
            labelStyle={{ color: "#fff" }}
          />
          <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
            {data.map((d, i) => (
              <Cell
                key={i}
                fill={d.revenue === maxRev && maxRev > 0 ? "#0a0a0a" : "#999"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
