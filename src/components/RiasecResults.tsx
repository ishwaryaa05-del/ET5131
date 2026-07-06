"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DIMENSION_LABELS, DIMENSION_BLURBS, type RiasecDimension } from "@/lib/riasec";

export function RiasecResults({
  code,
  scores,
  interpretation,
  market,
}: {
  code: string;
  scores: Record<RiasecDimension, number>;
  interpretation: {
    summary: string;
    strengths: string[];
    watchOuts: string[];
    marketNotes: string[];
  };
  market: string;
}) {
  const chartData = (Object.keys(scores) as RiasecDimension[]).map((d) => ({
    dimension: d,
    label: DIMENSION_LABELS[d],
    score: scores[d],
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="card p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Validated Holland Code (RIASEC) result
        </p>
        <h2 className="mt-1 text-3xl font-semibold tracking-tight">{code}</h2>
        <p className="mt-1 text-sm text-muted">
          {code
            .split("")
            .map((d) => DIMENSION_LABELS[d as RiasecDimension])
            .join(" · ")}
        </p>

        <div className="mt-5 h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 12, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="dimension" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="score" fill="var(--brand)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <dl className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {chartData.map((d) => (
            <div key={d.dimension} className="text-xs text-muted">
              <span className="font-medium text-foreground">{d.label}:</span> {DIMENSION_BLURBS[d.dimension]}
            </div>
          ))}
        </dl>
      </div>

      <div className="card border-2 border-dashed border-accent/50 bg-brand-soft/40 p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">
          AI-generated interpretation — for {market}, not part of the validated test
        </p>
        {interpretation.summary ? (
          <>
            <p className="mt-2 text-sm leading-6">{interpretation.summary}</p>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-semibold">Strengths</p>
                <ul className="mt-2 flex flex-col gap-1.5">
                  {interpretation.strengths.map((s, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <span className="text-brand">•</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm font-semibold">Watch-outs</p>
                <ul className="mt-2 flex flex-col gap-1.5">
                  {interpretation.watchOuts.map((s, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <span className="text-accent">•</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm font-semibold">How this reads in {market} workplaces</p>
              <ul className="mt-2 flex flex-col gap-1.5">
                {interpretation.marketNotes.map((s, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <span className="text-brand">•</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <p className="mt-2 text-sm text-muted">
            Cultural interpretation unavailable right now (AI features need an ANTHROPIC_API_KEY).
          </p>
        )}
      </div>
    </div>
  );
}
