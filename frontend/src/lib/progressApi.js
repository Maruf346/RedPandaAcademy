import { api } from "./api.js";

export function toggleAssignment(assignmentId) {
  return api(`/progression/assignments/${assignmentId}/toggle/`, {
    method: "POST"
  });
}

export function markFlashcard(cardIndex, nailed) {
  return api("/progression/cards/mark/", {
    method: "POST",
    body: { card_index: cardIndex, nailed }
  });
}

export function saveCustomDone(customDone) {
  return api("/progression/progress/", {
    method: "PATCH",
    body: { custom_done: customDone }
  });
}

export function logDrillSet(drillNumber) {
  return api("/progression/drills/log_set/", {
    method: "POST",
    body: { drill_number: drillNumber }
  });
}

export function logRecall(date) {
  return api("/protocol/log-recall/", {
    method: "POST",
    body: { date }
  });
}

export function incrementAnchor(anchorIndex) {
  return api("/protocol/inc-anchor/", {
    method: "POST",
    body: { anchor_index: anchorIndex }
  });
}

export function markD12(drillNumber) {
  return api("/protocol/set-d12/", {
    method: "POST",
    body: { drill_number: drillNumber }
  });
}

export function logWeeklyDrill(drillNumber, date) {
  return api("/protocol/log-weekly/", {
    method: "POST",
    body: { drill_number: drillNumber, date }
  });
}

export function advanceProtocolPhase() {
  return api("/protocol/advance-phase/", {
    method: "POST"
  });
}


