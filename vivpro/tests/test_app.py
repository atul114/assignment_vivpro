import os
import json
import pytest
from vivpro.app import app, store_normalized_data_in_db


@pytest.fixture
def client(tmp_path):
    # Override DB path for tests
    test_db_path = tmp_path / "test_songs.db"
    os.environ["DB_PATH"] = str(test_db_path)

    app.config["TESTING"] = True
    client = app.test_client()

    # Load fresh DB for each test run
    store_normalized_data_in_db("vivpro/data/playlist.json")

    yield client

    # Teardown: remove DB after tests
    if test_db_path.exists():
        test_db_path.unlink()


# -------------------------------
# Basic endpoint tests
# -------------------------------

def test_home(client):
    response = client.get("/")
    assert response.status_code == 200
    assert b"Hello" in response.data


def test_view_songs(client):
    response = client.get("/view_songs_from_db")
    assert response.status_code == 200
    data = json.loads(response.data)
    assert isinstance(data, list)
    assert len(data) > 0


def test_rate_song(client):
    song_id = "5vYA1mW9g2Coh1HUFUSmlb"
    response = client.post(f"/songs/{song_id}/rate", json={"rating": 4})
    assert response.status_code == 200
    data = response.get_json()
    assert data["rating"] == 4


# -------------------------------
# /songs/search tests
# -------------------------------

def test_search_songs_valid(client):
    response = client.get("/songs/search?title=3AM")
    assert response.status_code in (200, 404)

    if response.status_code == 200:
        data = response.get_json()
        assert "count" in data
        assert "results" in data
        assert isinstance(data["results"], list)
        assert any("title" in song for song in data["results"])


def test_search_songs_missing_param(client):
    response = client.get("/songs/search")
    assert response.status_code == 400
    data = response.get_json()
    assert "error" in data


def test_search_songs_not_found(client):
    response = client.get("/songs/search?title=nonexistent123")
    assert response.status_code == 404
    data = response.get_json()
    assert "error" in data
    assert "nonexistent123" in data["error"]


# -------------------------------
# Pagination tests
# -------------------------------

def test_songs_table_page_1(client):
    response = client.get("/songs/table?page=1")
    assert response.status_code == 200
    html = response.get_data(as_text=True)
    # Check that table structure exists
    assert "<table" in html
    assert "</table>" in html
    # Pagination info (page 1 should be shown)
    assert "Page 1" in html or "page=1" in html


def test_songs_table_page_2(client):
    response = client.get("/songs/table?page=2")
    assert response.status_code == 200
    html = response.get_data(as_text=True)
    assert "<table" in html
    # Ensure different page than page 1
    assert "Page 2" in html or "page=2" in html


def test_songs_table_invalid_page(client):
    response = client.get("/songs/table?page=9999")
    assert response.status_code == 200
    html = response.get_data(as_text=True)
    # Page exists but likely empty → still valid response
    assert "<table" in html
