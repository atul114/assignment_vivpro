export default function AlertMessage({ message, type }) {
  if (!message) return null; // Prevent undefined access
  return (
    <div className={`alert alert-${type || "info"}`} role="alert">
      {message}
    </div>
  );
}
