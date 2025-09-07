export default function SearchBar({
  searchTitle,
  setSearchTitle,
  fetchSongByTitle,
  fetchAllSongs,
  searchActive,
}) {
  return (
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
  );
}
