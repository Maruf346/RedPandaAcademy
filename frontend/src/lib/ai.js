import { api } from "./api.js";

let backendAi = null;

export function aiMayWork() {
  return backendAi !== false;
}

async function aiTask(path, prompt) {
  try {
    const data = await api(path, {
      method: "POST",
      body: { prompt }
    });
    backendAi = true;
    return data.text || "";
  } catch (error) {
    backendAi = false;
    throw error;
  }
}

export function gradeCallAi(prompt) {
  return aiTask("/ai/grade-call/", prompt);
}

export function trainWeaknessAi(prompt) {
  return aiTask("/ai/train-weakness/", prompt);
}

export const AI_NOTICE =
  "AI needs login and the backend configured with ANTHROPIC_API_KEY. Reading, drills, quizzes, ranks, and progress codes work without AI.";
