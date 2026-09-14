import { api } from "./api.js";

export const PANDA_CONVERSATION_KEY = "rpa_panda_conversation_v1";
export const PANDA_PENDING_PROMPT_KEY = "rpa_panda_pending_prompt_v1";

function normalizeList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
}

export async function listBotConversations(limit = 20) {
  const payload = await api(`/bot/conversations/?page_size=${limit}`);
  return normalizeList(payload);
}

export async function loadBotConversation(conversationId, options = {}) {
  if (!conversationId) return null;
  const params = new URLSearchParams();
  params.set("message_limit", String(options.messageLimit || 30));
  if (options.before) params.set("before", options.before);
  return api(`/bot/conversations/${conversationId}/?${params.toString()}`);
}

export async function sendBotMessage({ message, conversationId, playbookContext }) {
  return api("/bot/messages/", {
    method: "POST",
    body: {
      message,
      conversation_id: conversationId || null,
      playbook_context: playbookContext || ""
    }
  });
}
