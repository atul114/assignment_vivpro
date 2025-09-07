export default function Header({ downloadCSV }) {
  return (
    <div className="d-flex justify-content-between align-items-center mb-3">
      <h2>Songs (10 per page, sortable)</h2>
      <button className="btn btn-success" onClick={downloadCSV}>
        ⬇ Download CSV
      </button>
    </div>
  );
}
