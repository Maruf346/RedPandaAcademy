// Red Panda Academy — AI backend for Netlify
// Set ANTHROPIC_API_KEY in Netlify: Site settings → Environment variables
export default async (req) => {
  if (req.method !== "POST") return new Response("POST only", { status: 405 });
  const { prompt } = await req.json();
  if (!prompt || prompt.length > 200000) return new Response("bad prompt", { status: 400 });
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: 3000,
      messages: [{ role: "user", content: prompt }]
    })
  });
  if (!r.ok) return new Response("upstream error", { status: 502 });
  const d = await r.json();
  return Response.json({ text: d.content?.[0]?.text || "" });
};
