let netlifyAi = null;

export function aiMayWork() {
  return (
    (typeof window !== "undefined" &&
      window.claude &&
      typeof window.claude.complete === "function") ||
    netlifyAi !== false
  );
}

export async function aiComplete(prompt) {
  if (
    typeof window !== "undefined" &&
    window.claude &&
    typeof window.claude.complete === "function"
  ) {
    return window.claude.complete(prompt);
  }

  const response = await fetch("/.netlify/functions/claude", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ prompt })
  });

  if (!response.ok) {
    netlifyAi = false;
    throw new Error("AI backend unavailable");
  }

  netlifyAi = true;
  const data = await response.json();
  return data.text || "";
}

export const AI_NOTICE =
  "AI needs the Netlify function deployed with ANTHROPIC_API_KEY. Reading, drills, quizzes, ranks, and progress codes work without AI.";
