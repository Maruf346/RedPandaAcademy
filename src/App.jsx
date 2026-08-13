import { NavLink, Navigate, Route, Routes, useLocation } from "react-router-dom";

const ranks = ["Rookie", "Apprentice", "Closer", "Top Rep"];

const navItems = [
  { to: "/", label: "Home", end: true },
  { to: "/learn", label: "Learn" },
  { to: "/drill", label: "Drill" },
  { to: "/quiz", label: "Rank Up" },
  { to: "/bot", label: "Panda Bot" },
  { to: "/grade", label: "Grade Call" }
];

const pageCopy = {
  home: {
    title: "Home",
    note: "Dashboard, assignments, rank ladder, protocol snapshot, and progress code backup will be migrated here."
  },
  learn: {
    title: "Learn",
    note: "The 12 steps, glossary, pivot points, KPIs, discovery form, scripts, and Field Kit will be migrated here."
  },
  drill: {
    title: "Drill",
    note: "Flashcards, partner drills, Train My Weakness, and Training Protocol will be migrated here."
  },
  quiz: {
    title: "Rank Up",
    note: "Apprentice, Closer, and Top Rep exams will be migrated here with the same 80 percent pass line."
  },
  bot: {
    title: "Panda Bot",
    note: "The docs-only AI coach will be migrated after the non-AI training flows are stable."
  },
  grade: {
    title: "Grade Call",
    note: "Transcript grading stays locked until Closer and will reuse the existing Netlify function path."
  }
};

function PlaceholderPage({ page }) {
  const { title, note } = pageCopy[page];

  return (
    <main className="stack">
      <section className="card">
        <p className="eyebrow">Phase 0 scaffold</p>
        <h2>{title}</h2>
        <p className="muted">{note}</p>
      </section>
      <section className="card">
        <h3>Migration status</h3>
        <p className="muted">
          This route is wired, but the legacy behavior still lives in{" "}
          <code>netlify_files/index.html</code>. Feature migration starts in
          Phase 1 with data and progress compatibility.
        </p>
      </section>
    </main>
  );
}

function Shell() {
  const location = useLocation();
  const activeRank = ranks[0];

  return (
    <>
      <div className="app">
        <header className="top">
          <img className="mark" src="/logo.png" alt="" />
          <div>
            <h1>Red Panda Closer Academy</h1>
            <p>React migration shell</p>
          </div>
          <span className="rankchip">{activeRank}</span>
        </header>

        <Routes location={location}>
          <Route path="/" element={<PlaceholderPage page="home" />} />
          <Route path="/learn" element={<PlaceholderPage page="learn" />} />
          <Route path="/learn/:tab" element={<PlaceholderPage page="learn" />} />
          <Route path="/drill" element={<PlaceholderPage page="drill" />} />
          <Route path="/drill/:tab" element={<PlaceholderPage page="drill" />} />
          <Route path="/quiz" element={<PlaceholderPage page="quiz" />} />
          <Route path="/bot" element={<PlaceholderPage page="bot" />} />
          <Route path="/grade" element={<PlaceholderPage page="grade" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      <nav className="tabs" aria-label="Primary">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => (isActive ? "on" : undefined)}
          >
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}

export default function App() {
  return <Shell />;
}
