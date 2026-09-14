import { api } from "./api.js";

export function saveQuizAttempt({ quiz, quizIndex, correctCount, scorePercent, passed, missedTopics }) {
  return api("/grades/quiz-attempts/", {
    method: "POST",
    body: {
      quiz_name: quiz.name,
      quiz_index: quizIndex,
      total_questions: quiz.qs.length,
      correct_count: correctCount,
      score_percent: scorePercent,
      passed,
      missed_topics: missedTopics || []
    }
  });
}

export function saveCallGrade(grade) {
  return api("/grades/call-grades/", {
    method: "POST",
    body: {
      transcript: grade.transcript || "",
      summary: grade.summary || "",
      died: grade.died || "",
      scorecard: grade.scorecard || [],
      failures: grade.failures || [],
      scenarioTags: grade.scenarioTags || grade.scenario_tags || [],
      drills: grade.drills || grade.assigned_drills || [],
      overall_pass: Boolean(grade.overall_pass)
    }
  });
}

function normalizeList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
}

export async function listQuizAttempts(limit = 5) {
  return normalizeList(await api(`/grades/quiz-attempts/?page_size=${limit}`));
}

export async function listCallGrades(limit = 5) {
  return normalizeList(await api(`/grades/call-grades/?page_size=${limit}`));
}
