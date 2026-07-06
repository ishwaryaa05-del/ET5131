"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export type ProgressPoint = {
  session: string;
  date: string;
  englishPct: number;
  avgCulturalFit: number;
};

export function InterviewProgressChart({ data }: { data: ProgressPoint[] }) {
  if (data.length < 2) return null;

  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold">Language mix & cultural-fit trend over time</h3>
      <p className="mt-1 text-xs text-muted">
        Track your shift from native-language-first toward English-first, alongside cultural-fit
        coaching scores.
      </p>
      <div className="mt-4 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 12, left: -18, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="englishPct" name="% answered in English" stroke="var(--brand)" strokeWidth={2} />
            <Line
              type="monotone"
              dataKey="avgCulturalFit"
              name="Avg cultural fit (×10)"
              stroke="var(--accent)"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
