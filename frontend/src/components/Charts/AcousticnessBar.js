import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function AcousticnessBar({ songs }) {
  const data = songs.map((s, idx) => ({
    name: s.title || `Song ${idx + 1}`,
    value: s.acousticness ?? 0,
  }));

  return (
    <div className="my-4">
      <h4>Bar Chart: Acousticness of Songs</h4>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={false} label={{ value: "Songs", position: "insideBottom", offset: -5 }} />
          <YAxis domain={[0, 1]} label={{ value: "Acousticness", angle: -90, position: "insideLeft" }} />
          <Tooltip />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
