"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from "recharts";

interface Props {
  data: { date: string; revenue: number }[];
}

export function RevenueChart({ data }: Props) {
  const maxRev = Math.max(0, ...data.map((d) => d.revenue));
  const hasData = maxRev > 0;

  if (!hasData) {
    return (
      <div className="h-56 w-full flex items-center justify-center text-xs text-muted-foreground">
        Сүүлийн 7 хоногт орлого алга.
      </div>
    );
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11 }}
            stroke="#9ca3af"
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tickFormatter={(v) =>
              v >= 1000000
                ? `${(v / 1000000).toFixed(1)}M`
                : v >= 1000
                ? `${(v / 1000).toFixed(0)}K`
                : String(v)
            }
            tick={{ fontSize: 11 }}
            stroke="#9ca3af"
            width={48}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ fill: "rgba(0,0,0,0.04)" }}
            formatter={(value) =>
              new Intl.NumberFormat("mn-MN").format(Number(value)) + " ₮"
            }
            contentStyle={{
              background: "#0a0a0a",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 12,
              padding: "8px 12px",
            }}
            labelStyle={{ color: "#fff", fontWeight: 600 }}
            itemStyle={{ color: "#fff" }}
          />
          <Bar dataKey="revenue" radius={[6, 6, 0, 0]} maxBarSize={48}>
            {data.map((d, i) => (
              <Cell
                key={i}
                fill={d.revenue === maxRev ? "#0a0a0a" : "#d4d4d8"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
