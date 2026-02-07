import { useState } from "react";
import TaskForm from "./components/TaskForm";
import TeamDashboard from "./components/TeamDashboard";
import BurnoutForecast from "./components/BurnoutForecast";
import DaySummary from "./components/DaySummary";
import { analyzeTeam } from "./api/analyze";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const DEFAULT_MEMBERS = [
  { id: "you", name: "You (PM)", role: "Product Manager" },
  { id: "m1", name: "Alex", role: "Engineer" },
  { id: "m2", name: "Jordan", role: "Designer" },
  { id: "m3", name: "Sam", role: "Engineer" },
];

export function calcDayScore(tasks) {
  if (!tasks.length) return 0;
  const base = tasks.reduce((sum, t) => {
    const typeW = { meeting: 15, "deep-work": 10, deadline: 25, admin: 5 };
    const prioW = { high: 2, medium: 1.5, low: 1 };
    return sum + (typeW[t.type] || 10) * (prioW[t.priority] || 1);
  }, 0);
  const totalMin = tasks.reduce((s, t) => s + t.duration, 0);
  const overload = totalMin > 360 ? 15 : totalMin > 480 ? 30 : 0;
  const meetings = tasks.filter((t) => t.type === "meeting").length;
  const b2b = meetings > 3 ? meetings * 5 : 0;
  return Math.min(Math.round(base + overload + b2b), 100);
}

export function getMemberScores(memberId, tasks) {
  return DAYS.map((day) => {
    const dayTasks = tasks.filter((t) => t.assignee === memberId && t.day === day);
    return { day, score: calcDayScore(dayTasks), tasks: dayTasks.length };
  });
}

export default function App() {
  const [members, setMembers] = useState(DEFAULT_MEMBERS);
  const [tasks, setTasks] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("dashboard");
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [newMember, setNewMember] = useState({ name: "", role: "" });
  const [showAddMember, setShowAddMember] = useState(false);

  const addTask = (task) => setTasks([...tasks, { ...task, id: Date.now() }]);
  const removeTask = (id) => setTasks(tasks.filter((t) => t.id !== id));

  const addMember = () => {
    if (!newMember.name.trim()) return;
    setMembers([...members, { id: `m${Date.now()}`, ...newMember }]);
    setNewMember({ name: "", role: "" });
    setShowAddMember(false);
  };

  const viewMember = (id) => {
    setSelectedMember(id);
    setSelectedDay(null);
    setView("member");
  };

  const memberTasks = selectedMember
    ? tasks.filter((t) => t.assignee === selectedMember)
    : [];
  const memberScores = selectedMember ? getMemberScores(selectedMember, tasks) : [];
  const memberInfo = members.find((m) => m.id === selectedMember);
  const tasksByDay = selectedMember
    ? DAYS.reduce((acc, day) => {
        acc[day] = tasks.filter((t) => t.assignee === selectedMember && t.day === day);
        return acc;
      }, {})
    : {};

  const handleAnalyze = async () => {
    if (tasks.length === 0) return;
    setLoading(true);
    try {
      const teamData = members.map((m) => ({
        ...m,
        scores: getMemberScores(m.id, tasks),
        tasks: tasks.filter((t) => t.assignee === m.id),
      }));
      const result = await analyzeTeam(teamData);
      setAnalysis(result);
    } catch (err) {
      console.error(err);
      setAnalysis({ error: "Analysis failed. Check your API connection." });
    }
    setLoading(false);
  };

  const inputStyle = {
    padding: "8px 10px", borderRadius: 6, border: "1px solid #9ca3af",
    fontSize: 14, boxSizing: "border-box", color: "#111"
  };

  return (
    <div style={{
      width: "100vw", minHeight: "100vh", boxSizing: "border-box",
      padding: "16px clamp(12px, 3vw, 24px)",
      fontFamily: "system-ui", color: "#111", overflow: "hidden"
    }}>
      {/* Header */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: 4, flexWrap: "wrap", gap: 8
      }}>
        <h1 style={{ margin: 0, fontSize: "clamp(1.2rem, 3.5vw, 1.8rem)" }}>🔥 PM Burnout Assistant</h1>
        {view === "member" && (
          <button onClick={() => { setView("dashboard"); setSelectedDay(null); setAnalysis(null); }}
            style={{
              padding: "6px 14px", fontSize: 13, background: "#e5e7eb", color: "#111",
              border: "1px solid #9ca3af", borderRadius: 6, cursor: "pointer", fontWeight: 600
            }}>
            ← Dashboard
          </button>
        )}
      </div>
      <p style={{ color: "#444", marginTop: 2, marginBottom: 16, fontSize: "clamp(0.8rem, 2vw, 0.95rem)" }}>
        {view === "dashboard"
          ? "Monitor your team's workload — prevent burnout before it happens."
          : `Viewing ${memberInfo?.name}'s schedule`}
      </p>

      {/* Team Members Bar */}
      <div style={{
        display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap", alignItems: "center"
      }}>
        {members.map((m) => {
          const weekAvg = Math.round(
            getMemberScores(m.id, tasks).reduce((s, d) => s + d.score, 0) / 5
          );
          const color = weekAvg < 30 ? "#15803d" : weekAvg < 60 ? "#b45309" : "#dc2626";
          const isActive = selectedMember === m.id && view === "member";
          return (
            <div key={m.id} onClick={() => viewMember(m.id)}
              style={{
                padding: "6px 10px", borderRadius: 6, cursor: "pointer",
                background: isActive ? "#4f46e5" : "#f3f4f6",
                color: isActive ? "#fff" : "#111",
                border: `1px solid ${isActive ? "#4f46e5" : "#9ca3af"}`,
                fontSize: 13, transition: "all 0.15s", whiteSpace: "nowrap"
              }}>
              <strong>{m.name}</strong>
              <span style={{
                marginLeft: 4, fontSize: 11, padding: "1px 5px", borderRadius: 4,
                fontWeight: 700,
                background: isActive ? "#ffffff33" : `${color}18`,
                color: isActive ? "#fff" : color
              }}>
                {weekAvg}
              </span>
            </div>
          );
        })}
        {showAddMember ? (
          <div style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" }}>
            <input placeholder="Name" value={newMember.name}
              onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && addMember()}
              style={{ ...inputStyle, width: 100 }} />
            <input placeholder="Role" value={newMember.role}
              onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && addMember()}
              style={{ ...inputStyle, width: 100 }} />
            <button onClick={addMember} style={{
              padding: "6px 10px", background: "#111", color: "#fff",
              border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600
            }}>Add</button>
            <button onClick={() => setShowAddMember(false)} style={{
              padding: "4px 6px", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#333"
            }}>✕</button>
          </div>
        ) : (
          <button onClick={() => setShowAddMember(true)} style={{
            padding: "6px 10px", borderRadius: 6, cursor: "pointer",
            background: "#fff", border: "1px dashed #888", fontSize: 13, color: "#444", fontWeight: 500
          }}>+ Add Member</button>
        )}
      </div>

      {/* Dashboard View */}
      {view === "dashboard" && (
        <>
          <TeamDashboard members={members} tasks={tasks} onSelectMember={viewMember} />
          <button onClick={handleAnalyze} disabled={loading || tasks.length === 0}
            style={{
              width: "100%", padding: 12, fontSize: 15, fontWeight: 600,
              background: loading || tasks.length === 0 ? "#9ca3af" : "#4f46e5", color: "#fff",
              border: "none", borderRadius: 8,
              cursor: loading || tasks.length === 0 ? "default" : "pointer", marginTop: 12
            }}>
            {loading ? "Analyzing team..." : "🤖 AI Team Analysis & Reassignment Suggestions"}
          </button>
        </>
      )}

      {/* Member View */}
      {view === "member" && selectedMember && (
        <>
          <TaskForm onAdd={addTask} members={members} defaultAssignee={selectedMember} />
          {memberTasks.length > 0 && (
            <>
              <BurnoutForecast dailyScores={memberScores} selectedDay={selectedDay} onSelectDay={setSelectedDay} />
              {selectedDay && (
                <DaySummary
                  day={selectedDay}
                  tasks={tasksByDay[selectedDay] || []}
                  score={calcDayScore(tasksByDay[selectedDay] || [])}
                  onRemove={removeTask}
                  onClose={() => setSelectedDay(null)}
                />
              )}
            </>
          )}
          {memberTasks.length === 0 && (
            <div style={{
              textAlign: "center", padding: 30, color: "#444",
              background: "#f3f4f6", borderRadius: 12, marginTop: 12, fontWeight: 500
            }}>
              No tasks assigned to {memberInfo?.name} yet. Add some above!
            </div>
          )}
        </>
      )}

      {/* AI Analysis */}
      {analysis && !analysis.error && (
        <div style={{
          marginTop: 16, padding: 16, borderRadius: 12,
          background: "#ecfdf5", border: "1px solid #6ee7b7"
        }}>
          <h3 style={{ marginTop: 0, color: "#064e3b", fontSize: "clamp(0.95rem, 2.5vw, 1.2rem)" }}>
            🧠 AI Team Analysis & Reassignment Plan
          </h3>
          <pre style={{
            whiteSpace: "pre-wrap", fontFamily: "system-ui", lineHeight: 1.5,
            color: "#1e293b", fontSize: "clamp(0.8rem, 2vw, 0.9rem)", margin: 0
          }}>
            {analysis.text}
          </pre>
        </div>
      )}
      {analysis?.error && (
        <div style={{
          marginTop: 16, padding: 16, borderRadius: 12,
          background: "#fef2f2", border: "1px solid #fca5a5", color: "#991b1b", fontWeight: 500
        }}>
          {analysis.error}
        </div>
      )}
    </div>
  );
}