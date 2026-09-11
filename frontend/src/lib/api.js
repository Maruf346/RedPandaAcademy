const TOKEN_KEY = "rpa_tokens_v1";

export function getApiBase() {
  return String(import.meta.env.VITE_API_BASE || "/api").replace(/\/$/, "");
}

export function loadTokens() {
  try {
    const raw = window.localStorage.getItem(TOKEN_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveTokens(tokens) {
  if (!tokens) {
    window.localStorage.removeItem(TOKEN_KEY);
    return;
  }
  window.localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
}

export function formatApiError(data) {
  if (!data) return "Request failed";
  if (typeof data === "string") return data;
  if (data.detail) {
    return Array.isArray(data.detail) ? data.detail.join(" ") : String(data.detail);
  }
  if (data.error) return String(data.error);
  const parts = [];
  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) parts.push(`${key}: ${value.join(" ")}`);
    else if (typeof value === "string") parts.push(value);
  }
  return parts.join(" ") || "Request failed";
}

class ApiError extends Error {
  constructor(status, payload) {
    super(formatApiError(payload));
    this.status = status;
    this.payload = payload;
  }
}

let refreshInFlight = null;

async function parseBody(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function refreshTokens() {
  const tokens = loadTokens();
  if (!tokens?.refresh) return null;
  const response = await fetch(`${getApiBase()}/users/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: tokens.refresh })
  });
  const payload = await parseBody(response);
  if (!response.ok) {
    saveTokens(null);
    return null;
  }
  const next = {
    access: payload.access,
    refresh: payload.refresh || tokens.refresh
  };
  saveTokens(next);
  return next;
}

export async function api(path, options = {}) {
  const { skipAuth = false, retry = true, headers, body, ...rest } = options;
  const tokens = loadTokens();
  const requestHeaders = { ...(headers || {}) };

  if (body !== undefined && !(body instanceof FormData) && !requestHeaders["Content-Type"]) {
    requestHeaders["Content-Type"] = "application/json";
  }
  if (!skipAuth && tokens?.access) {
    requestHeaders.Authorization = `Bearer ${tokens.access}`;
  }

  const response = await fetch(`${getApiBase()}${path}`, {
    ...rest,
    headers: requestHeaders,
    body:
      body === undefined || body instanceof FormData || typeof body === "string"
        ? body
        : JSON.stringify(body)
  });

  if (response.status === 401 && !skipAuth && retry && tokens?.refresh) {
    if (!refreshInFlight) refreshInFlight = refreshTokens().finally(() => {
      refreshInFlight = null;
    });
    const refreshed = await refreshInFlight;
    if (refreshed?.access) {
      return api(path, { ...options, retry: false });
    }
  }

  const payload = await parseBody(response);
  if (!response.ok) {
    throw new ApiError(response.status, payload);
  }
  return payload;
}
