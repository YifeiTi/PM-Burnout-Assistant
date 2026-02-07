import { useState } from "react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function TaskForm({ onAdd, members = [], defaultAssignee = "" }) {
  const [form, setForm] = useState({
    title: "", day: "Monday", time: "09:00", duration: "30",
    type: "meeting", priority: "medium", assignee: defaultAssignee
  });

  const update = (field, val) => setForm({ ...form, [field]: val });

  const handleAdd = () => {
    if (!form.title.trim()) return;
    onAdd({ ...form, duration: Number(form.duration), assignee: form.assignee || defaultAssignee });
    setForm({ ...form, title: "", time: "09:00" });
  };

  const s = {
    padding: "8px 10px", borderRadius: 6, border: "1px solid #9ca3af",
    fontSize: "clamp(12px, 1.5vw, 14px)", width: "100%", boxSizing: "border-box",
    color: "#111", background: "#fff"
  };

  const labelStyle = {
    fontSize: "clamp(10px, 1.3vw, 12px)", color: "#333",
    fontWeight: 600, marginBottom: 2, display: "block"
  };

  return (
    <div style={{
      padding: "clamp(10px, 2vw, 20px)", borderRadius: 12, background: "#f3f4f6",
      border: "1px solid #d1d5db", width: "100%", boxSizing: "border-box"
    }}>
      <div style={{ marginBottom: 10 }}>
        <input placeholder="Task title (e.g. Sprint Planning)"
          value={form.title} onChange={(e) => update("title", e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          style={{ ...s, fontSize: "clamp(13px, 1.8vw, 15px)" }}
        />
      </div>

      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 100px), 1fr))",
        gap: "clamp(4px, 1vw, 10px)", marginBottom: 10
      }}>
        <div>
          <label style={labelStyle}>Assignee</label>
          <select value={form.assignee} onChange={(e) => update("assignee", e.target.value)} style={s}>
            {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Day</label>
          <select value={form.day} onChange={(e) => update("day", e.target.value)} style={s}>
            {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Time</label>
          <input type="time" value={form.time}
            onChange={(e) => update("time", e.target.value)} style={s} />
        </div>
      </div>

      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
        gap: "clamp(4px, 1vw, 10px)", marginBottom: 10
      }}>
        <div>
          <label style={labelStyle}>Duration</label>
          <select value={form.duration} onChange={(e) => update("duration", e.target.value)} style={s}>
            {[15, 30, 45, 60, 90, 120].map((d) => (
              <option key={d} value={d}>{d}m</option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Type</label>
          <select value={form.type} onChange={(e) => update("type", e.target.value)} style={s}>
            <option value="meeting">Meeting</option>
            <option value="deep-work">Deep Work</option>
            <option value="deadline">Deadline</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Priority</label>
          <select value={form.priority} onChange={(e) => update("priority", e.target.value)} style={s}>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      <button onClick={handleAdd} style={{
        width: "100%", padding: "clamp(8px, 1.5vw, 12px)",
        fontSize: "clamp(13px, 1.8vw, 15px)", fontWeight: 700,
        background: "#111", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer"
      }}>
        + Add Task
      </button>
    </div>
  );
}