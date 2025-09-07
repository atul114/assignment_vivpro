import React, { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import AlertMessage from "./components/AlertMessage";
import SongsTable from "./components/SongsTable";
import Pagination from "./components/Pagination";

import DanceabilityScatter from "./components/Charts/DanceabilityScatter";
import DurationHistogram from "./components/Charts/DurationHistogram";
import AcousticnessBar from "./components/Charts/AcousticnessBar";
import TempoBar from "./components/Charts/TempoBar";
import FeatureBar from "./components/Charts/FeatureBar";

const PAGE_SIZE = 10;

export default function App() {
  const [songs, setSongs] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const [searchTitle, setSearchTitle] = useState("");
  const [searchActive, setSearchActive] = useState(false);

  const [alert, setAlert] = useState({ type: "", message: "" });
  const [selectedFeature, setSelectedFeature] = useState("acousticness");

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert({ type: "", message: "" }), 3000);
  };


  const normalizeResponse = (res) => {
    if (Array.isArray(res.data)) return res.data;
    if (res.data && res.data.results) return res.data.results;
    return [];
  };

  // Fetch all songs
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

  // Fetch song by title
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

  useEffect(() => {
    fetchAllSongs();
  }, [fetchAllSongs]);

  const headers = useMemo(() => {
    if (!songs.length) return [];
    return Object.keys(songs[0]);
  }, [songs]);

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

  const totalPages = Math.max(1, Math.ceil(sortedSongs.length / PAGE_SIZE));
  const currentSlice = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return sortedSongs.slice(start, start + PAGE_SIZE);
  }, [sortedSongs, page]);

  const goTo = (p) => setPage(Math.min(Math.max(1, p), totalPages));

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

  const rateSong = (songId, rating) => {
    setSongs((prevSongs) =>
      prevSongs.map((s) => (s.id === songId ? { ...s, rating } : s))
    );
    axios
      .post(`/songs/${songId}/rate`, { rating })
      .then(() => showAlert("success", "Rating updated successfully!"))
      .catch(() => showAlert("danger", "Failed to update rating"));
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <Header downloadCSV={downloadCSV} />

      {/* Search */}
      <SearchBar
        searchTitle={searchTitle}
        setSearchTitle={setSearchTitle}
        fetchSongByTitle={fetchSongByTitle}
        fetchAllSongs={fetchAllSongs}
        searchActive={searchActive}
      />

      {/* Alert messages */}
      {alert.message && <AlertMessage message={alert.message} type={alert.type} />}

      {/* Loading and error */}
      {loading && <div className="alert alert-info">Loading…</div>}
      {err && !loading && <div className="alert alert-danger">{err}</div>}

      {/* Songs table */}
      <SongsTable
        songs={currentSlice}
        headers={headers}
        rateSong={rateSong}
        handleSort={handleSort}
        getArrow={getArrow}
      />

      <Pagination page={page} totalPages={totalPages} goTo={goTo} />

      {/* Charts */}
      <DanceabilityScatter songs={songs} />
      <DurationHistogram songs={songs} />
      <AcousticnessBar songs={songs} />
      <TempoBar songs={songs} />


      <FeatureBar
        songs={songs}
        selectedFeature={selectedFeature}
        setSelectedFeature={setSelectedFeature}
      />
    </div>
  );
}
