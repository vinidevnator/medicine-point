"use client";
import {
  BarChart, Bar, PieChart, Pie, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"];

const axisStyle = { fontSize: 12, fill: "var(--muted-foreground)" };
const gridStyle = { stroke: "var(--border)" };

export function BarChartCard({
  data, dataKey, xKey, height = 260, label,
}: { data: Array<Record<string, number | string>>; dataKey: string; xKey: string; height?: number; label?: string }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" {...gridStyle} vertical={false} />
        <XAxis dataKey={xKey} tick={axisStyle} tickLine={false} />
        <YAxis tick={axisStyle} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)" }}
          labelStyle={{ color: "var(--muted-foreground)" }}
        />
        <Bar dataKey={dataKey} fill={COLORS[0]} radius={[6, 6, 0, 0]} name={label} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function LineChartCard({
  data, dataKey, xKey, height = 260, label,
}: { data: Array<Record<string, number | string>>; dataKey: string; xKey: string; height?: number; label?: string }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" {...gridStyle} vertical={false} />
        <XAxis dataKey={xKey} tick={axisStyle} tickLine={false} />
        <YAxis tick={axisStyle} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)" }}
          labelStyle={{ color: "var(--muted-foreground)" }}
        />
        <Line type="monotone" dataKey={dataKey} stroke={COLORS[1]} strokeWidth={2.5} dot={{ r: 3 }} name={label} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function PieChartCard({
  data, dataKey = "value", nameKey = "name", height = 260,
}: { data: Array<Record<string, number | string>>; dataKey?: string; nameKey?: string; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Tooltip
          contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)" }}
        />
        <Pie data={data} dataKey={dataKey} nameKey={nameKey} innerRadius={50} outerRadius={90} paddingAngle={2}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="var(--card)" />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}