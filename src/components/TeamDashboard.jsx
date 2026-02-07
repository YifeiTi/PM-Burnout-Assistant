import { getMemberScores, calcDayScore } from "../App";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const getColor = (score) => {
  if (score === 0) return "#d1d5db";
  if (score < 30) return "#22c55e";
  if (score < 60) return "#f59e0b";
  return "#ef4444";
};

const getDarkColor = (score) => {
  if (score < 30) return "#15803d";
  if (score < 60) return "#b45309";
  return "#dc2626";
};

export default function TeamDashboard({ members, tasks, onSelectMember }) {
  const teamData = members.map((m) => {
    const scores = getMemberScores(m.id, tasks);
    const weekAvg = Math.round(scores.reduce((s, d) => s + d.score, 0) / 5);
    const peakDay = scores.reduce((max, d) => (d.score > max.score ? d : max), { score: 0 });
    const totalTasks = tasks.filter((t) => t.assignee === m.id).length;
    return { ...m, scores, weekAvg, peakDay, totalTasks };
  });

  const teamAvg = teamData.length
    ? Math.round(teamData.reduce((s, m) => s + m.weekAvg, 0) / teamData.length)
    : 0;
  const atRisk = teamData.filter((m) => m.weekAvg >= 60);
  const overloaded = teamData.filter((m) => m.scores.some((d) => d.score >= 80));

  return (
    <div style={{ width: "100%" }}>
      {/* Team Stats */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
        gap: "clamp(6px, 1.5vw, 12px)", marginBottom: 14
      }}>
        <div style={{ padding: "clamp(8px, 2vw, 16px)", borderRadius: 10, background: "#f3f4f6", textAlign: "center" }}>
          <div style={{ fontSize: "clamp(11px, 1.5vw, 13px)", color: "#444", fontWeight: 500 }}>Team Avg</div>
          <div style={{ fontSize: "clamp(18px, 3vw, 28px)", fontWeight: 700, color: getDarkColor(teamAvg) }}>
            {teamAvg}
          </div>
        </div>
        <div style={{ padding: "clamp(8px, 2vw, 16px)", borderRadius: 10, background: "#fee2e2", textAlign: "center" }}>
          <div style={{ fontSize: "clamp(11px, 1.5vw, 13px)", color: "#444", fontWeight: 500 }}>At Risk</div>
          <div style={{ fontSize: "clamp(18px, 3vw, 28px)", fontWeight: 700, color: "#991b1b" }}>{atRisk.length}</div>
        </div>
        <div style={{ padding: "clamp(8px, 2vw, 16px)", borderRadius: 10, background: "#fef3c7", textAlign: "center" }}>
          <div style={{ fontSize: "clamp(11px, 1.5vw, 13px)", color: "#444", fontWeight: 500 }}>Overloaded</div>
          <div style={{ fontSize: "clamp(18px, 3vw, 28px)", fontWeight: 700, color: "#92400e" }}>{overloaded.length}</div>
        </div>
      </div>

      {/* Heatmap */}
      <div style={{
        padding: "clamp(10px, 2vw, 20px)", borderRadius: 12, background: "#fff",
        border: "1px solid #d1d5db", marginBottom: 14, width: "100%", boxSizing: "border-box"
      }}>
        <h3 style={{ marginTop: 0, marginBottom: 12, color: "#111", fontSize: "clamp(0.9rem, 2.5vw, 1.1rem)" }}>
          🗓️ Team Burnout Heatmap
        </h3>

        {/* Header row */}
        <div style={{
          display: "grid", gridTemplateColumns: "minmax(60px, 20%) repeat(5, 1fr)",
          gap: "clamp(2px, 0.5vw, 4px)", marginBottom: 4
        }}>
          <div />
          {DAYS.map((d) => (
            <div key={d} style={{
              textAlign: "center", fontSize: "clamp(10px, 1.5vw, 13px)",
              fontWeight: 700, color: "#333"
            }}>
              {d.slice(0, 3)}
            </div>
          ))}
        </div>

        {/* Member rows */}
        {teamData.map((m) => (
          <div key={m.id}
            onClick={() => onSelectMember(m.id)}
            style={{
              display: "grid", gridTemplateColumns: "minmax(60px, 20%) repeat(5, 1fr)",
              gap: "clamp(2px, 0.5vw, 4px)",
              marginBottom: 3, cursor: "pointer", borderRadius: 4, padding: "1px 0"
            }}>
            <div style={{
              fontSize: "clamp(10px, 1.5vw, 13px)", fontWeight: 700, padding: "6px 2px",
              display: "flex", alignItems: "center", gap: 4, color: "#111",
              overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis"
            }}>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{m.name}</span>
            </div>
            {m.scores.map((d) => (
              <div key={d.day} style={{
                background: getColor(d.score),
                opacity: d.score === 0 ? 0.3 : 0.7 + (d.score / 100) * 0.3,
                borderRadius: 3, textAlign: "center",
                padding: "clamp(4px, 1vw, 8px) 0",
                fontSize: "clamp(10px, 1.5vw, 13px)", fontWeight: 700,
                color: d.score >= 60 ? "#fff" : d.score >= 30 ? "#78350f" : d.score > 0 ? "#14532d" : "#666",
                transition: "all 0.2s"
              }}>
                {d.score || "—"}
              </div>
            ))}
          </div>
        ))}

        <div style={{
          display: "flex", gap: "clamp(6px, 2vw, 16px)", marginTop: 10,
          fontSize: "clamp(10px, 1.3vw, 12px)", color: "#444", flexWrap: "wrap"
        }}>
          <span>🟢 Low</span>
          <span>🟡 Moderate</span>
          <span>🔴 High</span>
          <span style={{ marginLeft: "auto", fontWeight: 500 }}>Click row →</span>
        </div>
      </div>

      {/* Member Cards */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
        gap: "clamp(6px, 1.5vw, 12px)"
      }}>
        {teamData.map((m) => {
          const statusColor = getDarkColor(m.weekAvg);
          const statusBg = m.weekAvg < 30 ? "#ecfdf5" : m.weekAvg < 60 ? "#fef3c7" : "#fee2e2";
          return (
            <div key={m.id} onClick={() => onSelectMember(m.id)}
              style={{
                padding: "clamp(10px, 2vw, 16px)", borderRadius: 10, background: statusBg,
                border: `1px solid ${statusColor}44`, cursor: "pointer"
              }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ overflow: "hidden" }}>
                  <div style={{ fontWeight: 700, color: "#111", fontSize: "clamp(0.8rem, 2vw, 0.95rem)" }}>
                    {m.name}
                  </div>
                  <div style={{ fontSize: "clamp(10px, 1.3vw, 12px)", color: "#555", fontWeight: 500 }}>
                    {m.role}
                  </div>
                </div>
                <div style={{
                  fontSize: "clamp(18px, 3vw, 22px)", fontWeight: 700, color: statusColor, flexShrink: 0
                }}>{m.weekAvg}</div>
              </div>
              <div style={{
                fontSize: "clamp(10px, 1.3vw, 13px)", color: "#333", marginTop: 6, fontWeight: 500
              }}>
                {m.totalTasks} tasks · Peak: {m.peakDay.day?.slice(0, 3)} ({m.peakDay.score})
              </div>
              <div style={{ display: "flex", gap: 2, marginTop: 6, height: 20, alignItems: "flex-end" }}>
                {m.scores.map((d) => (
                  <div key={d.day} style={{
                    flex: 1, borderRadius: 2,
                    height: d.score === 0 ? 2 : `${(d.score / 100) * 100}%`,
                    background: getColor(d.score), opacity: 0.85, minHeight: 2
                  }} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}