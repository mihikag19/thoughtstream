"use client";

import { useEffect, useState } from "react";

type DayCount = { date: string; count: number };

export function ThermalMap() {
  const [data, setData] = useState<DayCount[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/thoughts?limit=500");
        if (!res.ok) return;
        const json = await res.json();
        const counts: Record<string, number> = {};
        for (const t of json.thoughts || []) {
          const day = t.planted_at?.slice(0, 10);
          if (day) counts[day] = (counts[day] || 0) + 1;
        }
        setData(Object.entries(counts).map(([date, count]) => ({ date, count })));
      } catch {
        // silent
      }
    }
    load();
  }, []);

  // Build 8 weeks × 7 days grid
  const today = new Date();
  const cells: { date: string; count: number }[] = [];
  for (let i = 55; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const match = data.find((x) => x.date === dateStr);
    cells.push({ date: dateStr, count: match?.count || 0 });
  }

  const maxCount = Math.max(1, ...cells.map((c) => c.count));

  function intensity(count: number): string {
    if (count === 0) return "rgba(201,169,110,0.06)";
    const ratio = count / maxCount;
    const min = 0.15;
    const max = 0.85;
    const alpha = min + ratio * (max - min);
    return `rgba(201,169,110,${alpha.toFixed(2)})`;
  }

  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)] mb-8">
        8 weeks
      </p>
      <div className="grid grid-cols-8 gap-[2px]" style={{ width: "fit-content" }}>
        {cells.map((cell) => (
          <div
            key={cell.date}
            className="thermal-cell w-[8px] h-[8px] rounded-[1px]"
            style={{ backgroundColor: intensity(cell.count) }}
            title={`${cell.date}: ${cell.count} ${cell.count === 1 ? "entry" : "entries"}`}
          />
        ))}
      </div>
    </div>
  );
}
