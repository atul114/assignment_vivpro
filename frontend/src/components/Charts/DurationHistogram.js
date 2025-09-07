import React, { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function DurationHistogram({ songs }) {
  const histogramData = useMemo(() => {
    const binSize = 30;
    const counts = {};
    songs.forEach((s) => {
      const sec = Math.round((s.duration_ms || 0) / 1000);
      const binStart = Math.floor(sec / binSize) * binSize;
      const label = `${binStart}-${binStart + binSize}s`;
      counts[label] = (counts[label] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .map(([range, count]) => ({ range, count }));
  }, [songs]);

  return (
    <div className="my-4">
      <h4>Histogram: Song Duration (seconds)</h4>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={histogramData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="range" label={{ value: "Duration (s)", position: "insideBottom", offset: -5 }} />
          <YAxis allowDecimals={false} label={{ value: "Count", angle: -90, position: "insideLeft" }} />
          <Tooltip />
          <Bar dataKey="count" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
