import React, { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function FeatureBar({ songs, selectedFeature, setSelectedFeature }) {
  const data = useMemo(() => {
    return songs.map((s, idx) => ({
      name: s.title || `Song ${idx + 1}`,
      value: s[selectedFeature] ?? 0,
    }));
  }, [songs, selectedFeature]);

  return (
    <div className="my-4">
      <h4>Bar Chart: Select Feature</h4>

      <div className="mb-3">
        <select className="form-select w-auto" value={selectedFeature} onChange={(e) => setSelectedFeature(e.target.value)}>
          <option value="acousticness">Acousticness</option>
          <option value="tempo">Tempo</option>
          <option value="energy">Energy</option>
          <option value="valence">Valence</option>
          <option value="danceability">Danceability</option>
        </select>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={false} label={{ value: "Songs", position: "insideBottom", offset: -5 }} />
          <YAxis label={{ value: selectedFeature, angle: -90, position: "insideLeft" }} />
          <Tooltip />
          <Bar dataKey="value" fill="#ff7300" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
