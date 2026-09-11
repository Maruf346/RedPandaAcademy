import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
              {user.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
            </strong>
          </div>
        </div>

        <div className="profileActions">
          <button className="btn block ghost" onClick={() => navigate("/account")}>
            Edit account
          </button>
          <button className="btn block danger" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </section>
    </main>
  );
}
