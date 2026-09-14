import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { formatApiError } from "../lib/api.js";
import { listCallGrades, listQuizAttempts } from "../lib/records.js";

function Field({ label, children }) {
  return (
    <label className="authField">
      <span>{label}</span>
      {children}
    </label>
  );
}

export default function ProfilePage() {
  const auth = useAuth();
  const { user, logout } = auth;
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [history, setHistory] = useState({ quizzes: [], grades: [], ready: false });


  useEffect(() => {
    let cancelled = false;
    async function loadHistory() {
      if (!user) return;
      try {
        const [quizzes, grades] = await Promise.all([
          listQuizAttempts(5),
          listCallGrades(5)
        ]);
        if (!cancelled) setHistory({ quizzes, grades, ready: true });
      } catch {
        if (!cancelled) setHistory({ quizzes: [], grades: [], ready: true });
      }
    }
    loadHistory();
    return () => {
      cancelled = true;
    };
  }, [user]);
  if (!user) {
    return (
      <main className="stack">
        <section className="card">
          <h2>Profile</h2>
          <p className="muted">You are not signed in yet.</p>
          <button className="btn block" onClick={() => navigate("/account")}>
            Go to sign in
          </button>
        </section>
      </main>
    );
  }

  async function handleLogout() {
    await logout();
    navigate("/account");
  }

  async function submitProfile(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    const form = new FormData(event.currentTarget);
    try {
      await auth.updateProfile({
        full_name: String(form.get("full_name")).trim(),
        phone: String(form.get("phone")).trim()
      });
      setNotice("Profile updated.");
    } catch (err) {
      setError(err.payload ? formatApiError(err.payload) : err.message);
    } finally {
      setBusy(false);
    }
  }

  async function submitPassword(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    const form = new FormData(event.currentTarget);
    try {
      await auth.changePassword(
        form.get("old_password"),
        form.get("new_password"),
        form.get("confirm_new_password")
      );
      event.currentTarget.reset();
      setNotice("Password changed.");
    } catch (err) {
      setError(err.payload ? formatApiError(err.payload) : err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Delete this account and sign out? This cannot be undone.")) return;
    setBusy(true);
    setError("");
    try {
      await auth.deleteAccount();
      navigate("/account");
    } catch (err) {
      setError(err.payload ? formatApiError(err.payload) : err.message);
      setBusy(false);
    }
  }

  return (
    <main className="stack">
      <section className="card profileCard">
        <div className="profileHeader">
          <div className="profileAvatar">
            {user.full_name ? user.full_name.charAt(0).toUpperCase() : "P"}
          </div>
          <div>
            <h2>{user.full_name || "Player"}</h2>
            <p className="muted">{user.email}</p>
          </div>
        </div>

        <div className="profileGrid">
          <div className="profileItem">
            <span className="profileLabel">Provider</span>
            <strong>{user.provider || "Email"}</strong>
          </div>
          <div className="profileItem">
            <span className="profileLabel">Status</span>
            <strong>{user.is_active ? "Active" : "Inactive"}</strong>
          </div>
          <div className="profileItem wide">
            <span className="profileLabel">Joined</span>
            <strong>
              {user.created_at ? new Date(user.created_at).toLocaleDateString() : "-"}
            </strong>
          </div>
        </div>

        <div className="profileActions">
          <button className="btn block danger" onClick={handleLogout} disabled={busy}>
            Log out
          </button>
        </div>
      </section>

      <section className="card">
        <h2>Edit account</h2>
        {error ? <div className="notice">{error}</div> : null}
        {notice ? <div className="small green">{notice}</div> : null}
        <form className="authForm" onSubmit={submitProfile}>
          <Field label="Full name">
            <input name="full_name" defaultValue={user.full_name || ""} maxLength={100} />
          </Field>
          <Field label="Phone">
            <input name="phone" defaultValue={user.phone || ""} />
          </Field>
          <button className="btn block" disabled={busy}>Save profile</button>
        </form>
      </section>

      {user.provider === "self" && (
        <section className="card">
          <h2>Change password</h2>
          <form className="authForm" onSubmit={submitPassword}>
            <Field label="Current password">
              <input name="old_password" type="password" autoComplete="current-password" required />
            </Field>
            <Field label="New password">
              <input name="new_password" type="password" autoComplete="new-password" minLength={8} required />
            </Field>
            <Field label="Confirm password">
              <input name="confirm_new_password" type="password" autoComplete="new-password" minLength={8} required />
            </Field>
            <button className="btn block" disabled={busy}>Change password</button>
          </form>
        </section>
      )}

      <section className="card">
        <h2>Danger zone</h2>
        <button className="btn block danger" disabled={busy} onClick={handleDelete}>
          Delete account
        </button>
      </section>
    </main>
  );
}
