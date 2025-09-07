// Extend Jest with DOM matchers (toBeInTheDocument, toHaveTextContent, etc.)
import "@testing-library/jest-dom";

// Mock ResizeObserver for Recharts (ResponsiveContainer)
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserver;
