from flask import Flask, request, render_template, jsonify
import json
import pandas as pd
import sqlite3
import os

app = Flask(__name__)
DB_PATH = os.environ.get("DB_PATH", "songs.db")
#DB_PATH = "songs.db"


def get_db_connection():
    return sqlite3.connect(DB_PATH)


def normalize_data(json_file_path):
    # Load JSON
    with open(json_file_path, "r") as f:
        data = json.load(f)

    df = pd.DataFrame(data)
    return "True"


def store_normalized_data_in_db(json_file_path):
    # Load JSON
    with open(json_file_path, "r") as f:
        data = json.load(f)

    df = pd.DataFrame(data)

    # Add rating column (default 0)
    if "rating" not in df.columns:
        df["rating"] = 0

    conn = sqlite3.connect(DB_PATH)
    df.to_sql("songs", conn, if_exists="replace", index=False)  # auto-create schema
    conn.close()

    return f"Saved {len(df)} songs with {len(df.columns)} columns into DB!"


@app.route("/")
def home():
    return "Hello, Flask!"


@app.route("/show_data")
def show_data():
    return normalize_data('data/playlist.json')


@app.route("/save_normalized_data")
def save_normalized_data():
    return store_normalized_data_in_db('data/playlist.json')


@app.route("/view_songs_from_db")
def view_songs_from_db():
    """Return all songs from DB as JSON"""
    conn = get_db_connection()
    df = pd.read_sql("SELECT * FROM songs", conn)
    conn.close()
    return df.to_json(orient="records")  # return list of dicts


@app.route("/songs/table_without_pagination")
def view_songs_table_without_pagination():
    conn = get_db_connection()
    df = pd.read_sql("SELECT * FROM songs", conn)
    conn.close()
    return df.to_html(classes="table table-striped", index=False)


@app.route("/songs/table")
def view_songs_table():
    page = request.args.get("page", default=1, type=int)
    limit = 10
    offset = (page - 1) * limit

    conn = get_db_connection()

    total_count = pd.read_sql("SELECT COUNT(*) as cnt FROM songs", conn)["cnt"][0]
    df = pd.read_sql(f"SELECT * FROM songs LIMIT {limit} OFFSET {offset}", conn)
    conn.close()

    total_pages = (total_count + limit - 1) // limit

    table_html = df.to_html(classes="table table-bordered table-hover align-middle", index=False, border=0)

    return render_template("songs_table.html",
                           table=table_html,
                           page=page,
                           total_pages=total_pages)


@app.route("/song", methods=["GET"])
def get_song_by_title():
    title = request.args.get("title")

    if not title:
        return jsonify({"error": "Please provide a title parameter"}), 400

    conn = get_db_connection()
    query = "SELECT * FROM songs WHERE title LIKE ?"
    df = pd.read_sql(query, conn, params=(f"%{title}%",))
    conn.close()

    if df.empty:
        return jsonify({"error": f"No song found with title containing '{title}'"}), 404

    return df.to_dict(orient="records")


@app.route("/songs/search", methods=["GET"])
def search_songs_by_title():
    """
    GET /songs/search?title=<keyword>
    :return:
    """

    title = request.args.get("title")

    if not title:
        return jsonify({"error": "Please provide a title parameter"}), 400

    conn = get_db_connection()

    # Case-insensitive search across all songs
    query = "SELECT * FROM songs WHERE LOWER(title) LIKE LOWER(?)"
    df = pd.read_sql(query, conn, params=(f"%{title}%",))
    conn.close()

    if df.empty:
        return jsonify({"error": f"No songs found with title containing '{title}'"}), 404

    return jsonify({
        "count": len(df),
        "results": df.to_dict(orient="records")
    })


@app.route("/songs/<song_id>/rate", methods=["POST"])
def rate_song(song_id):
    rating = request.json.get("rating")

    if rating is None or not (1 <= rating <= 5):
        return jsonify({"error": "Rating must be between 1 and 5"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("UPDATE songs SET rating = ? WHERE id = ?", (rating, song_id))
    conn.commit()
    conn.close()

    return jsonify({"message": f"Rating updated for song {song_id}", "rating": rating})


if __name__ == "__main__":
    app.run(debug=True)
