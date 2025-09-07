import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function TempoBar({ songs }) {
  const data = songs.map((s, idx) => ({
    name: s.title || `Song ${idx + 1}`,
    value: s.tempo ?? 0,
  }));

  return (
    <div className="my-4">
      <h4>Bar Chart: Tempo of Songs</h4>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={false} label={{ value: "Songs", position: "insideBottom", offset: -5 }} />
          <YAxis label={{ value: "Tempo (BPM)", angle: -90, position: "insideLeft" }} />
          <Tooltip />
          <Bar dataKey="value" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
