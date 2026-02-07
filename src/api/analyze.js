const API_URL = import.meta.env.VITE_API_URL || "/api/analyze";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export async function analyzeTeam(teamData) {
  const schedule = teamData.map((m) => {
    const dayBreakdown = DAYS.map((day) => {
      const dayTasks = m.tasks.filter((t) => t.day === day);
      const score = m.scores.find((s) => s.day === day)?.score || 0;
      const list = dayTasks.length
        ? dayTasks
            .sort((a, b) => a.time.localeCompare(b.time))
            .map((t) => `    - ${t.time} | ${t.title} | ${t.duration}min | ${t.type} | ${t.priority}`)
            .join("\n")
        : "    (no tasks)";
      return `  ${day} (risk: ${score}/100):\n${list}`;
    }).join("\n");

    const avg = Math.round(m.scores.reduce((s, d) => s + d.score, 0) / 5);
    return `## ${m.name} (${m.role}) — Weekly avg: ${avg}/100\n${dayBreakdown}`;
  }).join("\n\n");

  const prompt = `You are an AI assistant helping a product manager prevent team burnout and optimize workload distribution.

Here is the full team schedule with daily burnout risk scores (0-100):

${schedule}

Provide a comprehensive analysis:

1. **TEAM OVERVIEW**: Overall team health. Who is at risk? Who has capacity?

2. **DAY-BY-DAY HOTSPOTS**: Which days are danger zones for which team members? Flag any day with 60+ risk.

3. **WORKLOAD IMBALANCE**: Compare team members. Is work distributed fairly? Who is overloaded vs underutilized?

4. **REASSIGNMENT RECOMMENDATIONS**: Suggest specific task moves:
   - "Move [Task X] from [Person A] on [Day] to [Person B] on [Day]"
   - Explain why (reduces A's overload, B has capacity, skills match)

5. **STRUCTURAL SUGGESTIONS**: Meeting consolidation, focus time blocks, deadline spreading.

Be specific — reference actual task names, people, and days. Be concise and actionable.`;

  // --- Option A: Direct OpenAI call ---
  /*
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_OPENAI_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
    }),
  });
  const data = await res.json();
  return { text: data.choices[0].message.content };
  */

  // --- Option B: Direct Anthropic call ---
  /*
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": import.meta.env.VITE_ANTHROPIC_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json();
  return { text: data.content[0].text };
  */

  // --- Option C: Call your backend ---
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ teamData, prompt }),
  });
  const data = await res.json();
  return { text: data.analysis || data.text || JSON.stringify(data) };
}