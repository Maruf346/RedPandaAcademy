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
  const rules = KPIS.map(
    (k) =>
      `KPI ${k.n} ${k.name} (${k.step}) — PASS requires: ${k.pass} FAIL: ${k.fail}`
  ).join("\n");

  return `You are the New Era Roofs call grader. Grade this sales appointment transcript against the 22 KPIs below. Philosophy: grade the mechanics, not the vibe — a closed deal that broke process scores as broken process. Enforce ⚠️ ceilings (broadcast deck KPI9, skipped guarantee KPI15, question-before-mirror KPIs 16/20-22) and automatic fails (rep-side discounting, one-legger pricing, unverifiable stats, financing from memory, anything manufactured, pressuring seniors past the family conversation). KPI 4 retroactive fail if a third-party name surfaces at close that didn't surface at discovery. Use "na" ONLY when the situation never called for it.

${rules}

Additionally: tag every objection that appears in the transcript with its Pivot Points scenario number 1-20 (1 think-about-it, 2 three-estimates, 3 stone wall, 4 never-same-day, 5 bonus/tax timing, 6 price-too-much, 7 for-sale sign, 8 not-buying-today pact, 9 one-legger, 10 Mum's the Word, 11 competitor cheaper, 12 nothing down, 13 monthly payment, 14 out of budget, 15 too pushy, 16 family in trade, 17 senior's adult kids, 18 dad/uncle advisor, 19 total amount, 20 can't afford) and whether the rep handled it to methodology. These tags feed KPI 19 logging.

Respond with ONLY valid JSON, no markdown, exactly this shape:
{"summary":"one brutal sentence","scorecard":[{"n":1,"score":"pass|partial|fail|na","note":"short reason"} ... all 22],"failures":[{"kpi":16,"quote":"exact words from transcript","why":"which pass condition broke"}],"scenarioTags":[{"scenario":11,"handled":"pass|partial|fail","note":"short"}],"died":"KPI X at Step Y — one sentence why","drills":[{"name":"drill name","sets":"reps x sets","pass":"pass condition"},{"name":"...","sets":"...","pass":"..."}]}

TRANSCRIPT:
${transcript}`;
}
