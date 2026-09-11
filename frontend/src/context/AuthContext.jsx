import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, loadTokens, saveTokens } from "../lib/api.js";

const AuthContext = createContext(null);

function normalizeSession(payload) {
  if (!payload) return { user: null, tokens: null };
  const tokens = payload.tokens
    ? payload.tokens
    : payload.access_token
      ? { access: payload.access_token, refresh: payload.refresh_token }
      : loadTokens();
  return {
    user: payload.user || payload,
    tokens
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      const tokens = loadTokens();
      if (!tokens?.access) {
        if (!cancelled) setReady(true);
        return;
      }
      try {
        const me = await api("/users/me/");
        if (!cancelled) setUser(me);
      } catch {
        saveTokens(null);
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setReady(true);
      }
    }
    boot();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      ready,
      async login(email, password) {
        const payload = await api("/users/login/", {
          method: "POST",
          skipAuth: true,
          body: { email, password }
        });
        const session = normalizeSession(payload);
        saveTokens(session.tokens);
        setUser(session.user);
        return session.user;
      },
      async registerInitiate(fields) {
        return api("/users/register/initiate/", {
          method: "POST",
          skipAuth: true,
          body: fields
        });
      },
      async registerVerify(email, otp) {
        const payload = await api("/users/register/verify/", {
          method: "POST",
          skipAuth: true,
          body: { email, otp }
        });
        const session = normalizeSession(payload);
        saveTokens(session.tokens);
        setUser(session.user);
        return session.user;
      },
      async requestPasswordReset(email) {
        return api("/users/password-reset/initiate/", {
          method: "POST",
          skipAuth: true,
          body: { email }
        });
      },
      async verifyPasswordResetOtp(email, otp) {
        return api("/users/password-reset/verify/", {
          method: "POST",
          skipAuth: true,
          body: { email, otp }
        });
      },
      async confirmPasswordReset(reset_token, new_password, confirm_new_password) {
        return api("/users/password-reset/confirm/", {
          method: "POST",
          skipAuth: true,
          body: { reset_token, new_password, confirm_new_password }
        });
      },
      async logout() {
        const tokens = loadTokens();
        try {
          if (tokens?.refresh) {
            await api("/users/logout/", {
              method: "POST",
              body: { refresh: tokens.refresh }
            });
          }
        } catch {
          // Local sign-out still proceeds.
        }
        saveTokens(null);
        setUser(null);
      }
    }),
    [user, ready]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
