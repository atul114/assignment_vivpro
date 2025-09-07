import React from "react";

export default function SongsTable({ songs, headers, handleSort, getArrow, rateSong }) {
  return (
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
          {songs.length === 0 ? (
            <tr>
              <td colSpan={headers.length + 1} className="text-center text-muted">
                No data
              </td>
            </tr>
          ) : (
            songs.map((song, idx) => (
              <tr key={song.id || idx}>
                {headers.map((col) => {
                  let value = song[col];
                  if (value && typeof value === "object") value = JSON.stringify(value);
                  return <td key={col}>{value}</td>;
                })}
                <td>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      style={{
                        cursor: "pointer",
                        color: star <= (song.rating || 0) ? "gold" : "lightgray",
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
  );
}
