export default function Pagination({ page, totalPages, goTo }) {
  return (
    <nav aria-label="Songs pagination">
      <ul className="pagination">
        <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
          <button className="page-link" onClick={() => goTo(1)}>« First</button>
        </li>
        <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
          <button className="page-link" onClick={() => goTo(page - 1)}>‹ Prev</button>
        </li>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <li key={p} className={`page-item ${p === page ? "active" : ""}`}>
            <button className="page-link" onClick={() => goTo(p)}>{p}</button>
          </li>
        ))}
        <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
          <button className="page-link" onClick={() => goTo(page + 1)}>Next ›</button>
        </li>
        <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
          <button className="page-link" onClick={() => goTo(totalPages)}>Last »</button>
        </li>
      </ul>
    </nav>
  );
}
