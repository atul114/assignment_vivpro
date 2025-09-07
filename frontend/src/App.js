import React, { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Tooltip as ReTooltip,
} from "recharts";

const PAGE_SIZE = 10;

export default function App() {
  const [songs, setSongs] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Search state
  const [searchTitle, setSearchTitle] = useState("");
  const [searchActive, setSearchActive] = useState(false);

  // ⭐ Alert state
  const [alert, setAlert] = useState({ type: "", message: "" });

  // 🔹 New chart state
  const [selectedFeature, setSelectedFeature] = useState("acousticness");

  // Helper: show alert for a few seconds
  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert({ type: "", message: "" }), 3000);
  };

  // 🔹 Normalize backend responses
  const normalizeResponse = (res) => {
    if (Array.isArray(res.data)) return res.data;
    if (res.data && res.data.results) return res.data.results;
    return [];
  };

  // 🔹 Fetch all songs
  const fetchAllSongs = useCallback(() => {
    setLoading(true);
    axios
      .get("/view_songs_from_db")
      .then((res) => setSongs(normalizeResponse(res)))
      .catch(() => setErr("Failed to load songs"))
      .finally(() => {
        setLoading(false);
        setSearchActive(false);
      });
  }, []);

  // 🔹 Fetch by title
  const fetchSongByTitle = () => {
    if (!searchTitle.trim()) {
      fetchAllSongs();
      return;
    }
    setLoading(true);
    axios
      .get(`/songs/search?title=${encodeURIComponent(searchTitle)}`)
      .then((res) => {
        setSongs(normalizeResponse(res));
        setSearchActive(true);
        setPage(1);
      })
      .catch(() => setErr("No song found or API error"))
      .finally(() => setLoading(false));
  };

  // 🔹 Run once on component mount
  useEffect(() => {
    fetchAllSongs();
  }, [fetchAllSongs]);

  // 🔹 Dynamic table headers
  const headers = useMemo(() => {
    if (!songs.length) return [];
    return Object.keys(songs[0]);
  }, [songs]);

  // 🔹 Sorting
  const sortedSongs = useMemo(() => {
    if (!sortConfig.key) return [...songs];
    return [...songs].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
      }
      const compare = String(aVal).localeCompare(String(bVal));
      return sortConfig.direction === "asc" ? compare : -compare;
    });
  }, [songs, sortConfig]);

  // 🔹 Pagination
  const totalPages = Math.max(1, Math.ceil(sortedSongs.length / PAGE_SIZE));
  const currentSlice = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return sortedSongs.slice(start, start + PAGE_SIZE);
  }, [sortedSongs, page]);

  const goTo = (p) => setPage(Math.min(Math.max(1, p), totalPages));

  // 🔹 Sorting toggle
  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
    setPage(1);
  };

  const getArrow = (key) => {
    if (sortConfig.key !== key) return "";
    return sortConfig.direction === "asc" ? "▲" : "▼";
  };

  // 🔹 CSV Export
  const downloadCSV = () => {
    if (!sortedSongs.length) return;
    const rows = sortedSongs.map((song) =>
      headers.map((key) =>
        song[key] !== null && typeof song[key] === "object"
          ? JSON.stringify(song[key])
          : song[key] ?? ""
      )
    );
    let csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((r) => r.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "songs.csv";
    link.click();
  };

  // 🔹 Rate a song
  const rateSong = (songId, rating) => {
    setSongs((prevSongs) =>
      prevSongs.map((s) => (s.id === songId ? { ...s, rating } : s))
    );

    axios
      .post(`/songs/${songId}/rate`, { rating })
      .then(() => {
        showAlert("success", "Rating updated successfully!");
      })
      .catch(() => {
        showAlert("danger", "Failed to update rating");
      });
  };

  // 🔹 Histogram bins (duration in seconds)
  const histogramData = useMemo(() => {
    if (!songs.length) return [];

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

  // 🔹 Acousticness data
  const acousticData = useMemo(() => {
    return songs.map((s, idx) => ({
      name: s.title || `Song ${idx + 1}`,
      value: s.acousticness ?? 0,
    }));
  }, [songs]);

  // 🔹 Tempo data
  const tempoData = useMemo(() => {
    return songs.map((s, idx) => ({
      name: s.title || `Song ${idx + 1}`,
      value: s.tempo ?? 0,
    }));
  }, [songs]);

  // 🔹 Dynamic feature dataset
  const featureData = useMemo(() => {
    return songs.map((s, idx) => ({
      name: s.title || `Song ${idx + 1}`,
      value: s[selectedFeature] ?? 0,
    }));
  }, [songs, selectedFeature]);

  return (
    <div className="container py-4">
      {/* Header + CSV button */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Songs (10 per page, sortable)</h2>
        <button className="btn btn-success" onClick={downloadCSV}>
          ⬇ Download CSV
        </button>
      </div>

      {/* Search input */}
      <div className="input-group mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Enter song title"
          value={searchTitle}
          onChange={(e) => setSearchTitle(e.target.value)}
        />
        <button className="btn btn-primary" onClick={fetchSongByTitle}>
          Get Song
        </button>
        {searchActive && (
          <button className="btn btn-secondary" onClick={fetchAllSongs}>
            Reset
          </button>
        )}
      </div>

      {/* ⭐ Alert messages */}
      {alert.message && (
        <div className={`alert alert-${alert.type}`} role="alert">
          {alert.message}
        </div>
      )}

      {/* Status messages */}
      {loading && <div className="alert alert-info">Loading…</div>}
      {err && !loading && <div className="alert alert-danger">{err}</div>}

      {/* Table */}
      {!loading && !err && (
        <>
          <small className="text-muted d-block mb-2">
            Total items: {songs.length} | Page {page} of {totalPages}
          </small>

          <div className="table-responsive">
            <table className="table table-striped table-bordered align-middle">
              <thead className="table-light">
                <tr>
                  {headers.map((col) => (
                    <th
                      key={col}
                      onClick={() => handleSort(col)}
                      style={{ cursor: "pointer" }}
                    >
                      {col} {getArrow(col)}
                    </th>
                  ))}
                  <th>⭐ Rate</th>
                </tr>
              </thead>
              <tbody>
                {currentSlice.length === 0 ? (
                  <tr>
                    <td
                      colSpan={headers.length + 1}
                      className="text-center text-muted"
                    >
                      No data
                    </td>
                  </tr>
                ) : (
                  currentSlice.map((song, idx) => (
                    <tr key={song.id || `${page}-${idx}`}>
                      {headers.map((col) => {
                        let value = song[col];
                        if (value && typeof value === "object") {
                          value = JSON.stringify(value);
                        }
                        return <td key={col}>{value}</td>;
                      })}
                      <td>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            style={{
                              cursor: "pointer",
                              color:
                                star <= (song.rating || 0) ? "gold" : "lightgray",
                              fontSize: "1.2rem",
                              marginRight: "2px",
                            }}
                            onClick={() => rateSong(song.id, star)}
                          >
                            ★
                          </span>
                        ))}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <nav aria-label="Songs pagination">
            <ul className="pagination">
              <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => goTo(1)}>
                  « First
                </button>
              </li>
              <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => goTo(page - 1)}>
                  ‹ Prev
                </button>
              </li>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <li
                  key={p}
                  className={`page-item ${p === page ? "active" : ""}`}
                >
                  <button className="page-link" onClick={() => goTo(p)}>
                    {p}
                  </button>
                </li>
              ))}
              <li
                className={`page-item ${page === totalPages ? "disabled" : ""}`}
              >
                <button className="page-link" onClick={() => goTo(page + 1)}>
                  Next ›
                </button>
              </li>
              <li
                className={`page-item ${page === totalPages ? "disabled" : ""}`}
              >
                <button className="page-link" onClick={() => goTo(totalPages)}>
                  Last »
                </button>
              </li>
            </ul>
          </nav>

          {/* Scatter Chart */}
          <div className="my-4">
            <h4>Scatter Plot: Danceability of Songs</h4>
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid />
                <XAxis type="number" dataKey="index" name="Song Index" />
                <YAxis
                  type="number"
                  dataKey="danceability"
                  name="Danceability"
                  domain={[0, 1]}
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
                <Scatter
                  name="Songs"
                  data={songs.map((s, idx) => ({ ...s, index: idx + 1 }))}
                  fill="#8884d8"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Histogram */}
          <div className="my-4">
            <h4>Histogram: Song Duration (seconds)</h4>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={histogramData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="range"
                  label={{
                    value: "Duration (s)",
                    position: "insideBottom",
                    offset: -5,
                  }}
                />
                <YAxis
                  allowDecimals={false}
                  label={{ value: "Count", angle: -90, position: "insideLeft" }}
                />
                <ReTooltip />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Acousticness Bar Chart */}
          <div className="my-4">
            <h4>Bar Chart: Acousticness of Songs</h4>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={acousticData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tick={false}
                  label={{ value: "Songs", position: "insideBottom", offset: -5 }}
                />
                <YAxis
                  domain={[0, 1]}
                  label={{ value: "Acousticness", angle: -90, position: "insideLeft" }}
                />
                <ReTooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Tempo Bar Chart */}
          <div className="my-4">
            <h4>Bar Chart: Tempo of Songs</h4>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={tempoData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tick={false}
                  label={{ value: "Songs", position: "insideBottom", offset: -5 }}
                />
                <YAxis
                  label={{ value: "Tempo (BPM)", angle: -90, position: "insideLeft" }}
                />
                <ReTooltip />
                <Bar dataKey="value" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Dynamic Feature Bar Chart */}
          <div className="my-4">
            <h4>Bar Chart: Select Feature</h4>

            {/* Dropdown */}
            <div className="mb-3">
              <select
                className="form-select w-auto"
                value={selectedFeature}
                onChange={(e) => setSelectedFeature(e.target.value)}
              >
                <option value="acousticness">Acousticness</option>
                <option value="tempo">Tempo</option>
                <option value="energy">Energy</option>
                <option value="valence">Valence</option>
                <option value="danceability">Danceability</option>
              </select>
            </div>

            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={featureData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tick={false}
                  label={{ value: "Songs", position: "insideBottom", offset: -5 }}
                />
                <YAxis
                  label={{
                    value: selectedFeature,
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <ReTooltip />
                <Bar dataKey="value" fill="#ff7300" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
