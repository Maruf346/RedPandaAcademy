import {
  CARDS,
  DIAGNOSE,
  DRILLS,
  GLOSSARY,
  KPIS,
  PROTOCOL,
  SCENARIOS,
  STEPS
} from "../data/knowledge.js";

export function kbPrompt() {
  const steps = STEPS.map(
    (s) =>
      `STEP ${s.n} ${s.name} (${s.kpis}): ${s.task} SCRIPTS: ${s.scripts.join(
        " | "
      )} COACH: ${s.coach}`
  ).join("\n");
  const scenarios = SCENARIOS.map(
    (s) =>
      `SCENARIO ${s.n} ${s.title} (${s.kpi}): ${s.what}. FLOW: ${s.flow.join(
        " | "
      )}. FLAG: ${s.flag}`
  ).join("\n");
  const kpis = KPIS.map(
    (k, index) => `KPI ${index + 1} ${k.name}: pass=${k.pass}; fail=${k.fail}`
  ).join("\n");
  const glossary = GLOSSARY.map((g) => `${g.t}: ${g.d}`).join("\n");
  const diagnose = DIAGNOSE.map((d) => `${d.g} / ${d.cat}: ${d.play}`).join(
    "\n"
  );
  const drills = DRILLS.map((d) => `DRILL ${d.n} ${d.name}: ${d.goal}`).join(
    "\n"
  );
  const cards = CARDS.map((c) => `CARD ${c.f}: ${c.b}`).join("\n");

  return `You are Panda Bot, the Red Panda Closer Academy coach. Answer only from this playbook. Every coaching answer must name the relevant step and KPI when applicable. If the question is outside the playbook, say it is outside the playbook and route back to the academy material.

=== 12 STEP PROCESS ===
${steps}

=== PIVOT POINTS ===
${scenarios}

=== KPIS ===
${kpis}

=== DIAGNOSE THE OBJECTION ===
${diagnose}

=== GLOSSARY ===
${glossary}

=== DRILLS ===
${drills}

=== FLASHCARDS ===
${cards}

=== TRAINING PROTOCOL ===
Daily 20: ${PROTOCOL.daily.join(" | ")}
Rules: ${PROTOCOL.rules.join(" | ")}`;
}

export function weaknessPrompt(target, type) {
  return `${kbPrompt()}

=== CUSTOM TRAINING GENERATOR RULES ===
Create one ${type} for this weakness: ${target}.
Ground it only in the playbook. Include a short setup, exact rep instructions, pass/fail standard, and the relevant step/KPI.`;
}

export function gradePrompt(transcript) {
  return `${kbPrompt()}

=== CALL GRADING RULES ===
Grade this sales appointment transcript against all 22 KPIs. Return ONLY valid JSON with this shape:
{
  "overall": 0,
  "summary": "",
  "whereDealDied": "",
  "kpis": [{"n":1,"status":"pass|partial|fail","note":""}],
  "scenarios": [1],
  "drills": [{"name":"","why":"","sets":2}]
}

Transcript:
${transcript}`;
}
