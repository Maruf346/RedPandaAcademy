import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useProgress } from "../context/ProgressContext.jsx";
import { RANKS } from "../data/knowledge.js";
import { formatApiError, getApiBase } from "../lib/api.js";
import { listCallGrades, listQuizAttempts } from "../lib/records.js";

function Field({ label, children }) {
  return (
    <label className="authField">
      <span>{label}</span>
      {children}
    </label>
  );
}

function resolveMediaUrl(value) {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  if (!value.startsWith("/")) return value;
  const apiBase = getApiBase();
  if (/^https?:\/\//i.test(apiBase)) return `${new URL(apiBase).origin}${value}`;
  return value;
}

function initialsFor(user) {
  const source = user.full_name || user.username || user.email || "Player";
  return source.trim().charAt(0).toUpperCase() || "P";
}

export default function ProfilePage() {
  const auth = useAuth();
  const { user, logout } = auth;
  const { state } = useProgress();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [history, setHistory] = useState({ quizzes: [], grades: [], ready: false });

  const currentRank = RANKS[state.rank] || RANKS[0];
  const avatarPreview = useMemo(() => {
    if (!avatarFile) return "";
    return URL.createObjectURL(avatarFile);
  }, [avatarFile]);
  const avatarUrl = avatarPreview || resolveMediaUrl(user?.profile_picture || "");
  const bestScore = Math.max(...Object.values(state.best || {}).map((score) => Number(score) || 0), 0);
  const canChangePassword = user?.provider === "self";

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  useEffect(() => {
    setAvatarFile(null);
  }, [user?.id]);

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

  function openEditor() {
    setError("");
    setNotice("");
    setEditOpen(true);
  }

  function closeEditor() {
    if (busy) return;
    setEditOpen(false);
    setAvatarFile(null);
    setError("");
    setNotice("");
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
    const payload = new FormData();
    payload.append("full_name", String(form.get("full_name") || "").trim());
    payload.append("phone", String(form.get("phone") || "").trim());
    if (avatarFile) payload.append("profile_picture", avatarFile);

    try {
      await auth.updateProfile(payload);
      setAvatarFile(null);
      setEditOpen(false);
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
      <section className="card profileCard premiumProfileCard">
        <div className="profileHeader premiumProfileHeader">
          <div className="profileAvatar large">
            {avatarUrl ? <img src={avatarUrl} alt="" /> : initialsFor(user)}
          </div>
          <div className="profileIdentity">
            <span className="profileEyebrow">Academy profile</span>
            <h2>{user.full_name || user.username || "Player"}</h2>
            <p className="muted">{user.email}</p>
          </div>
          <div className="profileRankBadge" aria-label={`Current rank ${currentRank.name}`}>
            <span>{currentRank.em}</span>
            <strong>{currentRank.name}</strong>
          </div>
        </div>

        <div className="profileGrid premiumProfileGrid">
          <div className="profileItem">
            <span className="profileLabel">Username</span>
            <strong>{user.username || "Not set"}</strong>
          </div>
          <div className="profileItem">
            <span className="profileLabel">Rank</span>
            <strong>{currentRank.name}</strong>
          </div>
          <div className="profileItem">
            <span className="profileLabel">Best exam</span>
            <strong>{bestScore ? `${bestScore}%` : "Not attempted"}</strong>
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

        <div className="profileActions twoColActions">
          <button className="btn block" onClick={openEditor} disabled={busy}>
            Edit account
          </button>
          <button className="btn block danger" onClick={handleLogout} disabled={busy}>
            Log out
          </button>
        </div>
      </section>

      {editOpen && (
        <div className="drawerBackdrop" role="presentation" onClick={closeEditor}>
          <aside className="accountDrawer" role="dialog" aria-modal="true" aria-labelledby="edit-account-title" onClick={(event) => event.stopPropagation()}>
            <div className="drawerHeader">
              <div>
                <span className="profileEyebrow">Settings</span>
                <h2 id="edit-account-title">Edit account</h2>
              </div>
              <button className="btn iconBtn ghost" type="button" onClick={closeEditor} disabled={busy} aria-label="Close account editor">
                x
              </button>
            </div>
            {error ? <div className="notice">{error}</div> : null}
            {notice ? <div className="small green">{notice}</div> : null}

            <form className="authForm drawerPanel" onSubmit={submitProfile}>
              <div className="avatarEditor">
                <div className="profileAvatar">
                  {avatarUrl ? <img src={avatarUrl} alt="" /> : initialsFor(user)}
                </div>
                <label className="btn small ghost avatarPicker">
                  Change photo
                  <input
                    name="profile_picture"
                    type="file"
                    accept="image/*"
                    onChange={(event) => setAvatarFile(event.target.files?.[0] || null)}
                  />
                </label>
              </div>
              <Field label="Username">
                <input value={user.username || ""} readOnly />
              </Field>
              <Field label="Full name">
                <input name="full_name" defaultValue={user.full_name || ""} maxLength={100} />
              </Field>
              <Field label="Phone">
                <input name="phone" defaultValue={user.phone || ""} />
              </Field>
              <button className="btn block" disabled={busy}>Save profile</button>
            </form>

            {canChangePassword && (
              <form className="authForm drawerPanel" onSubmit={submitPassword}>
                <h3>Change password</h3>
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
            )}
          </aside>
        </div>
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

