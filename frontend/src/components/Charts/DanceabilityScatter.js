import React from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function DanceabilityScatter({ songs }) {
  const data = songs.map((s, idx) => ({ ...s, index: idx + 1 }));

  return (
    <div className="my-4">
      <h4>Scatter Plot: Danceability of Songs</h4>
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid />
          <XAxis
            type="number"
            dataKey="index"
            name="Song Index"
            label={{ value: "Song Index", position: "insideBottom", offset: -5 }}
          />
          <YAxis
            type="number"
            dataKey="danceability"
            name="Danceability"
            domain={[0, 1]}
            label={{ value: "Danceability", angle: -90, position: "insideLeft" }}
          />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const song = payload[0].payload;
                return (
                  <div className="p-2 bg-white border rounded shadow-sm">
                    <strong>{song.title}</strong>
                    <div>Danceability: {song.danceability}</div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Scatter name="Songs" data={data} fill="#8884d8" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
