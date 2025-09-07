// ✅ Mock axios before anything else
jest.mock("axios", () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

import axios from "axios";
import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "./App";

// 🔹 Fake songs data
const mockSongs = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  title: `Song ${i + 1}`,
  acousticness: 0.5,
  tempo: 120,
  danceability: 0.6,
  duration_ms: 200000,
  rating: 0,
}));

describe("App Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockResolvedValue({ data: mockSongs }); // default response
  });

  test("renders and fetches songs", async () => {
    render(<App />);
    expect(await screen.findByText(/^Song 1$/i)).toBeInTheDocument();
  });

  test("search works and shows results", async () => {
    axios.get.mockResolvedValueOnce({ data: { results: [mockSongs[0]] } });
    render(<App />);

    fireEvent.change(screen.getByPlaceholderText(/Enter song title/i), {
      target: { value: "Song 1" },
    });
    fireEvent.click(screen.getByText(/Get Song/i));

    expect(await screen.findByText(/^Song 1$/i)).toBeInTheDocument();
  });

  test("pagination works", async () => {
    render(<App />);
    await screen.findByText(/^Song 1$/i);

    // go to page 2
    fireEvent.click(await screen.findByText(/Next ›/i));
    expect(await screen.findByText(/^Song 11$/i)).toBeInTheDocument();
  });

  test("sorting toggles column order", async () => {
    render(<App />);
    await screen.findByText(/^Song 1$/i);

    const colHeader = screen.getByText(/title/i);

    fireEvent.click(colHeader); // sort asc
    expect(colHeader).toHaveTextContent(/▲/);

    fireEvent.click(colHeader); // sort desc
    expect(colHeader).toHaveTextContent(/▼/);
  });

  test("rating updates a song", async () => {
    axios.post.mockResolvedValueOnce({ data: { rating: 5 } });
    render(<App />);
    await screen.findByText(/^Song 1$/i);

    const row = screen.getByText(/^Song 1$/i).closest("tr");
    const starsInRow = within(row).getAllByText("★");

    fireEvent.click(starsInRow[4]); // 5th star

    await waitFor(() => {
      expect(starsInRow[4]).toHaveStyle("color: gold");
    });
  });

  test("charts render", async () => {
    render(<App />);
    await screen.findByText(/^Song 1$/i);

    // check chart headings
    expect(screen.getByText(/Danceability of Songs/i)).toBeInTheDocument();
    expect(screen.getByText(/Histogram: Song Duration/i)).toBeInTheDocument();
    expect(screen.getByText(/Bar Chart: Acousticness/i)).toBeInTheDocument();
    expect(screen.getByText(/Bar Chart: Tempo/i)).toBeInTheDocument();
    expect(screen.getByText(/Bar Chart: Select Feature/i)).toBeInTheDocument();
  });

  test("CSV download triggers file creation", async () => {
    render(<App />);
    await screen.findByText(/^Song 1$/i);

    const mockClick = jest.fn();
    const mockLink = { setAttribute: jest.fn(), click: mockClick };
    document.createElement = jest.fn(() => mockLink);

    fireEvent.click(screen.getByText(/Download CSV/i));

    expect(document.createElement).toHaveBeenCalledWith("a");
    expect(mockClick).toHaveBeenCalled();
  });
});
