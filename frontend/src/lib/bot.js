import { api } from "./api.js";

export const PANDA_CONVERSATION_KEY = "rpa_panda_conversation_v1";
export const PANDA_PENDING_PROMPT_KEY = "rpa_panda_pending_prompt_v1";

export async function loadBotConversation(conversationId) {
  if (!conversationId) return null;
  return api(`/bot/conversations/${conversationId}/`);
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
