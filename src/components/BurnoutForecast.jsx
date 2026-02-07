const getColor = (score) => {
  if (score < 30) return "#22c55e";
  if (score < 60) return "#f59e0b";
  return "#ef4444";
};

const getDarkColor = (score) => {
  if (score < 30) return "#15803d";
  if (score < 60) return "#b45309";
  return "#dc2626";
};

const getEmoji = (score) => {
  if (score === 0) return "—";
  if (score < 30) return "😌";
  if (score < 60) return "😐";
  return "🔥";
};

export default function BurnoutForecast({ dailyScores, selectedDay, onSelectDay }) {
  return (
    <div style={{
      padding: "clamp(10px, 2vw, 20px)", borderRadius: 12, background: "#fff",
      border: "1px solid #d1d5db", marginTop: 14, width: "100%", boxSizing: "border-box"
    }}>
      <h3 style={{
        marginTop: 0, marginBottom: 12, color: "#111",
        fontSize: "clamp(0.9rem, 2.5vw, 1.1rem)"
      }}>📊 Weekly Burnout Forecast</h3>

      <div style={{
        display: "flex", alignItems: "flex-end", gap: "clamp(3px, 1vw, 8px)",
        height: "clamp(120px, 20vw, 180px)", marginBottom: 6
      }}>
        {dailyScores.map((d) => {
          const h = d.score === 0 ? 4 : (d.score / 100) * 90 + "%";
          const isSelected = selectedDay === d.day;
          return (
            <div key={d.day}
              onClick={() => onSelectDay(d.day === selectedDay ? null : d.day)}
              style={{
                flex: 1, display: "flex", flexDirection: "column",
                alignItems: "center", cursor: "pointer", height: "100%",
                justifyContent: "flex-end",
                transition: "transform 0.15s",
                transform: isSelected ? "scale(1.05)" : "scale(1)"
              }}>
              <div style={{ fontSize: "clamp(12px, 2vw, 18px)", marginBottom: 2 }}>{getEmoji(d.score)}</div>
              <div style={{
                fontSize: "clamp(11px, 1.5vw, 14px)", fontWeight: 700, marginBottom: 2,
                color: getDarkColor(d.score)
              }}>
                {d.score}
              </div>
              <div style={{
                width: "100%",
                height: d.score === 0 ? 4 : `${(d.score / 100) * 100}%`,
                maxHeight: "70%",
                borderRadius: "4px 4px 0 0",
                background: `linear-gradient(to top, ${getColor(d.score)}cc, ${getColor(d.score)}55)`,
                border: isSelected ? `2px solid ${getDarkColor(d.score)}` : "2px solid transparent",
                transition: "height 0.4s ease, border 0.2s"
              }} />
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: "clamp(3px, 1vw, 8px)" }}>
        {dailyScores.map((d) => (
          <div key={d.day} style={{
            flex: 1, textAlign: "center",
            fontSize: "clamp(10px, 1.5vw, 13px)", fontWeight: 700,
            color: selectedDay === d.day ? "#111" : "#555"
          }}>
            {d.day.slice(0, 3)}
          </div>
        ))}
      </div>

      <div style={{ position: "relative", marginTop: 10 }}>
        <div style={{ height: 1, background: "#ef444466", width: "100%" }}>
          <span style={{
            position: "absolute", right: 0, top: -10,
            fontSize: "clamp(9px, 1.2vw, 11px)", color: "#dc2626", fontWeight: 700
          }}>
            ⚠️ Burnout Zone (60+)
          </span>
        </div>
      </div>

      <p style={{
        fontSize: "clamp(10px, 1.3vw, 13px)", color: "#555",
        marginTop: 12, marginBottom: 0, fontWeight: 500
      }}>
        Click a day to see details
      </p>
    </div>
  );
}