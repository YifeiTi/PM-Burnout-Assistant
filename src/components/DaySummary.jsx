const getLevel = (score) => {
  if (score < 30) return { label: "Low Risk", color: "#15803d", bg: "#ecfdf5" };
  if (score < 60) return { label: "Moderate Risk", color: "#b45309", bg: "#fef3c7" };
  return { label: "High Risk", color: "#dc2626", bg: "#fee2e2" };
};

export default function DaySummary({ day, tasks, score, onRemove, onClose }) {
  const { label, color, bg } = getLevel(score);
  const totalMin = tasks.reduce((s, t) => s + t.duration, 0);
  const hours = Math.floor(totalMin / 60);
  const mins = totalMin % 60;

  return (
    <div style={{
      padding: "clamp(10px, 2vw, 20px)", borderRadius: 12, background: bg,
      border: `1px solid ${color}44`, marginTop: 12,
      width: "100%", boxSizing: "border-box"
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 6
      }}>
        <h3 style={{
          margin: 0, color: "#111",
          fontSize: "clamp(0.85rem, 2.5vw, 1.1rem)"
        }}>
          {day} — <span style={{ color }}>{label}</span> ({score}/100)
        </h3>
        <button onClick={onClose} style={{
          background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#333"
        }}>✕</button>
      </div>

      <p style={{
        fontSize: "clamp(11px, 1.5vw, 14px)", color: "#444",
        margin: "6px 0", fontWeight: 500
      }}>
        {tasks.length} tasks · {hours}h {mins > 0 ? `${mins}m` : ""} total
      </p>

      {tasks.length === 0 ? (
        <p style={{ color: "#555", fontStyle: "italic", fontSize: "clamp(11px, 1.5vw, 14px)" }}>
          No tasks scheduled
        </p>
      ) : (
        tasks
          .sort((a, b) => a.time.localeCompare(b.time))
          .map((t) => (
            <div key={t.id} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "6px 10px", marginTop: 5, borderRadius: 6,
              background: "#fff", border: "1px solid #d1d5db",
              flexWrap: "wrap", gap: 4
            }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <strong style={{ color: "#111", fontSize: "clamp(11px, 1.5vw, 14px)" }}>{t.time}</strong>
                <span style={{
                  marginLeft: 6, color: "#111",
                  fontSize: "clamp(11px, 1.5vw, 14px)"
                }}>{t.title}</span>
                <span style={{
                  marginLeft: 6, fontSize: "clamp(9px, 1.2vw, 12px)",
                  padding: "1px 5px", borderRadius: 3,
                  background: "#e5e7eb", color: "#333", fontWeight: 500
                }}>
                  {t.type} · {t.duration}m · {t.priority}
                </span>
              </div>
              <button onClick={() => onRemove(t.id)} style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: 14, color: "#555", flexShrink: 0
              }}>✕</button>
            </div>
          ))
      )}
    </div>
  );
}