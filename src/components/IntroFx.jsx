const LAYERS = ["Frontend", "API", "Database"];

export default function IntroFx({ fx }) {
  if (fx === "stack") {
    return (
      <div className="fx fx-stack">
        {LAYERS.map((layer, i) => (
          <span key={layer} style={{ "--i": i }}>
            <i />
          </span>
        ))}
      </div>
    );
  }

  if (fx === "ship") {
    return (
      <div className="fx fx-ship">
        {Array.from({ length: 16 }, (_, i) => (
          <span key={i} style={{ "--i": i }} />
        ))}
      </div>
    );
  }

  if (fx === "grid") {
    return (
      <div className="fx fx-grid">
        <span className="fx-grid-dots" />
        <span className="fx-grid-scan" />
      </div>
    );
  }

  return null;
}
