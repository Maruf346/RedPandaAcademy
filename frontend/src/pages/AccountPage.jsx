import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { formatApiError } from "../lib/api.js";

function Field({ label, children }) {
  return (
    <label className="authField">
      <span>{label}</span>
      {children}
    </label>
  );
}

export default function AccountPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [resetToken, setResetToken] = useState("");

  async function handle(event, fn) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await fn(new FormData(event.currentTarget));
    } catch (err) {
      setError(err.payload ? formatApiError(err.payload) : err.message);
    } finally {
      setBusy(false);
    }
  }

  if (auth.user && mode === "login") {
    return (
      <main className="stack">
        <section className="card">
          <h2>Account</h2>
          <p className="small muted">
            Signed in as {auth.user.full_name || auth.user.email}
          </p>
          <p className="small">
            Progress auto-saves to your academy account when you are online.
            Backup codes still work as an offline fallback.
          </p>
          <button
            className="btn block"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              await auth.logout();
              setBusy(false);
            }}
          >
            Sign out
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="stack">
      <section className="card">
        <h2>
          {mode === "register" || mode === "verify"
            ? "Create account"
            : mode === "reset" || mode === "resetVerify" || mode === "resetConfirm"
              ? "Reset password"
              : "Sign in"}
        </h2>
        <p className="small muted">
          Same academy, now with a server save so a new phone does not wipe your
          rank.
        </p>

        {error ? <div className="notice">{error}</div> : null}
        {notice ? <div className="small green">{notice}</div> : null}

        {mode === "login" && (
          <form
            className="authForm"
            onSubmit={(event) =>
              handle(event, async (form) => {
                await auth.login(form.get("email"), form.get("password"));
                navigate("/");
              })
            }
          >
            <Field label="Email">
              <input name="email" type="email" autoComplete="email" required />
            </Field>
            <Field label="Password">
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </Field>
            <button className="btn block" disabled={busy}>
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>
        )}

        {mode === "register" && (
          <form
            className="authForm"
            onSubmit={(event) =>
              handle(event, async (form) => {
                const email = String(form.get("email")).trim();
                await auth.registerInitiate({
                  email,
                  username: String(form.get("username")).trim(),
                  password: form.get("password"),
                  birth_date: form.get("birth_date")
                });
                setRegisterEmail(email);
                setNotice("OTP sent to your email. Check the console in local dev.");
                setMode("verify");
              })
            }
          >
            <Field label="Full username">
              <input name="username" autoComplete="username" required />
            </Field>
            <Field label="Email">
              <input name="email" type="email" autoComplete="email" required />
            </Field>
            <Field label="Password (8+ characters)">
              <input
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </Field>
            <Field label="Birth date">
              <input name="birth_date" type="date" required />
            </Field>
            <button className="btn block" disabled={busy}>
              {busy ? "Sending OTP…" : "Send verification code"}
            </button>
          </form>
        )}

        {mode === "verify" && (
          <form
            className="authForm"
            onSubmit={(event) =>
              handle(event, async (form) => {
                await auth.registerVerify(
                  registerEmail || form.get("email"),
                  form.get("otp")
                );
                navigate("/");
              })
            }
          >
            <Field label="Email">
              <input
                name="email"
                type="email"
                defaultValue={registerEmail}
                required
              />
            </Field>
            <Field label="6-digit OTP">
              <input name="otp" inputMode="numeric" maxLength={6} required />
            </Field>
            <button className="btn block" disabled={busy}>
              {busy ? "Verifying…" : "Verify and enter"}
            </button>
          </form>
        )}

        {mode === "reset" && (
          <form
            className="authForm"
            onSubmit={(event) =>
              handle(event, async (form) => {
                const email = String(form.get("email")).trim();
                await auth.requestPasswordReset(email);
                setResetEmail(email);
                setNotice("If that email exists, an OTP was sent.");
                setMode("resetVerify");
              })
            }
          >
            <Field label="Email">
              <input name="email" type="email" required />
            </Field>
            <button className="btn block" disabled={busy}>
              Send reset code
            </button>
          </form>
        )}

        {mode === "resetVerify" && (
          <form
            className="authForm"
            onSubmit={(event) =>
              handle(event, async (form) => {
                const result = await auth.verifyPasswordResetOtp(
                  resetEmail || form.get("email"),
                  form.get("otp")
                );
                setResetToken(result.reset_token);
                setNotice("OTP verified. Set a new password.");
                setMode("resetConfirm");
              })
            }
          >
            <Field label="Email">
              <input name="email" type="email" defaultValue={resetEmail} required />
            </Field>
            <Field label="6-digit OTP">
              <input name="otp" inputMode="numeric" maxLength={6} required />
            </Field>
            <button className="btn block" disabled={busy}>
              Verify code
            </button>
          </form>
        )}

        {mode === "resetConfirm" && (
          <form
            className="authForm"
            onSubmit={(event) =>
              handle(event, async (form) => {
                const password = form.get("new_password");
                await auth.confirmPasswordReset(
                  resetToken,
                  password,
                  form.get("confirm_new_password")
                );
                setNotice("Password updated. Sign in with the new password.");
                setMode("login");
              })
            }
          >
            <Field label="New password">
              <input
                name="new_password"
                type="password"
                minLength={8}
                required
              />
            </Field>
            <Field label="Confirm password">
              <input
                name="confirm_new_password"
                type="password"
                minLength={8}
                required
              />
            </Field>
            <button className="btn block" disabled={busy}>
              Save password
            </button>
          </form>
        )}

        <div className="authSwitch">
          {mode === "login" ? (
            <>
              <button className="btn small ghost" type="button" onClick={() => setMode("register")}>
                Create account
              </button>
              <button className="btn small ghost" type="button" onClick={() => setMode("reset")}>
                Forgot password
              </button>
            </>
          ) : (
            <button className="btn small ghost" type="button" onClick={() => setMode("login")}>
              Back to sign in
            </button>
          )}
        </div>
      </section>
    </main>
  );
}
