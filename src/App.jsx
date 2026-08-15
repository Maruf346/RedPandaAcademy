import { useEffect, useMemo, useState } from "react";
import {
  NavLink,
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams
} from "react-router-dom";
import {
  CARDS,
  DIAGNOSE,
  DIAG_END,
  DIAG_MODEL,
  DIAG_STEPS,
  DIAG_STOP,
  DIAG_TEST,
  DIAG_TOOLS,
  DISCOVERY,
  DRILL_LINKS,
  DRILLS,
  FOURCS,
  GLOSSARY,
  KEYSCRIPTS,
  KPIS,
  PHASES,
  PROTOCOL,
  QUIZZES,
  RANKS,
  SCENARIOS,
  STEPS
} from "./data/knowledge.js";
import { ProgressProvider, useProgress } from "./context/ProgressContext.jsx";
import { AI_NOTICE, aiComplete, aiMayWork } from "./lib/ai.js";
import { decodeProgress, encodeProgress } from "./lib/progressCode.js";
import { canUseStorage } from "./lib/storage.js";
import { gradePrompt, kbPrompt, weaknessPrompt } from "./lib/prompts.js";

const navItems = [
  { to: "/", icon: "🏠", label: "Home", end: true },
  { to: "/learn", icon: "📖", label: "Learn" },
  { to: "/drill", icon: "🥊", label: "Drill" },
  { to: "/quiz", icon: "🎓", label: "Rank Up" },
  { to: "/bot", icon: "logo", label: "Panda Bot" },
  { to: "/grade", icon: "📝", label: "Grade Call" }
];

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function Card({ children, className, ...props }) {
  return (
    <section className={cx("card", className)} {...props}>
      {children}
    </section>
  );
}

function Pill({ children, hot }) {
  return <span className={cx("pill", hot && "hot")}>{children}</span>;
}

function Script({ children }) {
  return <div className="script">{children}</div>;
}

function Notice({ children }) {
  return <div className="notice">{children}</div>;
}

function Flag({ label, children }) {
  return (
    <div className="flag">
      <b>{label}:</b> {children}
    </div>
  );
}

function Accordion({ id, title, tag, children }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (id && window.location.hash === `#${id}`) setOpen(true);
  }, [id]);

  return (
    <div className={cx("acc", open && "open")} id={id}>
      <button type="button" onClick={() => setOpen((value) => !value)}>
        <span>{title}</span>
        {tag && <span className="tag">{tag}</span>}
      </button>
      <div className="body">{children}</div>
    </div>
  );
}

function today() {
  return new Date().toDateString();
}

function weakestKpis(state) {
  return Object.entries(state.kpiStats || {})
    .map(([n, stats]) => ({
      n: Number(n),
      score: (stats.fail || 0) * 2 + (stats.partial || 0) - (stats.pass || 0)
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

function Tabs({ items, active, base }) {
  return (
    <div className="tabbtns">
      {items.map((item) => (
        <NavLink
          key={item.id}
          to={`${base}/${item.id}`}
          className={({ isActive }) =>
            cx("btn ghost small", (active === item.id || isActive) && "on")
          }
        >
          {item.label}
        </NavLink>
      ))}
    </div>
  );
}

function Locked({ children }) {
  return (
    <Card>
      <h2>Locked</h2>
      <p className="muted">{children}</p>
    </Card>
  );
}

function Shell() {
  const { state } = useProgress();
  const currentRank = RANKS[state.rank] || RANKS[0];

  return (
    <>
      <div className="app">
        <header className="top">
          <img className="mark" src="/logo.png" alt="" />
          <div>
            <h1>Red Panda Closer Academy</h1>
            <p>Red Panda Roofing · Turn average reps into great ones</p>
          </div>
          <span className="rankchip">
            <span aria-hidden="true">{currentRank.em}</span> {currentRank.name}
          </span>
        </header>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/learn" element={<Navigate to="/learn/steps" replace />} />
          <Route path="/learn/:tab" element={<LearnPage />} />
          <Route path="/drill" element={<Navigate to="/drill/cards" replace />} />
          <Route path="/drill/:tab" element={<DrillPage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/bot" element={<BotPage />} />
          <Route path="/grade" element={<GradePage />} />
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
            {item.icon === "logo" ? (
              <img className="ico tabLogo" src="/logo.png" alt="" />
            ) : (
              <span className="ico">{item.icon}</span>
            )}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}

function HomePage() {
  const { state, dispatch, snapshot } = useProgress();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [codeMode, setCodeMode] = useState("");
  const mastered = Object.values(state.cards).filter((n) => n >= 2).length;
  const nextExam = state.rank < 3 ? QUIZZES[state.rank] : null;
  const openAssigns = state.assignments.filter((item) => !item.done);
  const drillTotal =
    Object.values(state.drills).reduce((a, b) => a + b, 0) +
    (state.customDone || 0);
  const phase = PROTOCOL.phases[state.proto.phase - 1] || PROTOCOL.phases[0];
  const weak = weakestKpis(state);
  const storageOn = canUseStorage();

  function exportNow() {
    setCodeMode("backup");
    setCode(encodeProgress(snapshot()));
  }

  function importNow() {
    try {
      dispatch({ type: "IMPORT", payload: decodeProgress(code) });
      alert("Progress restored.");
    } catch {
      alert("That code did not work. Paste the exact saved code.");
    }
  }

  return (
    <main className="stack">
      {state.rank === 0 && (
        <div className="homeHero">
          <img src="/RedPanda.png" alt="Red Panda Roofing" />
        </div>
      )}

      <Card className="rankHero">
        <div className="rankEmoji">{RANKS[state.rank].em}</div>
        <div className="big">{RANKS[state.rank].name}</div>
        <div className="muted">{RANKS[state.rank].unlock}</div>
        {nextExam ? (
          <>
            <div className="bar">
              <i style={{ width: `${state.best[state.rank] || 0}%` }} />
            </div>
            <div className="small muted">
              Next rank: pass the {nextExam.name} at 80%+{" "}
              {state.best[state.rank]
                ? `(best so far: ${state.best[state.rank]}%)`
                : ""}
            </div>
            <button className="btn rankCta" onClick={() => navigate("/quiz")}>
              Take the {nextExam.name}
            </button>
          </>
        ) : (
          <div className="small gold rankTop">
            Top of the ladder. Now keep it — grade every call.
          </div>
        )}
      </Card>

      <Card>
        <h2>📌 Assigned Drills{openAssigns.length ? ` (${openAssigns.length})` : ""}</h2>
        {openAssigns.length === 0 ? (
          <p className="muted">
            Nothing assigned. Fail a quiz or grade a call and this fills itself —
            your misses become your workout.
          </p>
        ) : (
          openAssigns.map((item) => {
            const realIndex = state.assignments.indexOf(item);
            return (
              <div className="assign" key={`${item.name}-${realIndex}`}>
                <b>{item.name}</b> — {item.sets || ""}
                <br />
                <span className="muted">{item.why || ""}</span>
                <br />
                <span className="small">Pass: {item.pass || "—"}</span>
                <br />
                <button
                  className="btn small assignBtn"
                  onClick={() =>
                    dispatch({ type: "DONE_ASSIGNMENT", index: realIndex })
                  }
                >
                  Mark complete
                </button>
              </div>
            );
          })
        )}
      </Card>

      <div className="grid2">
        <Card className="center">
          <div className="big orange">{mastered}/{CARDS.length}</div>
          <div className="small muted">
            Scripts mastered
            <br />
            (nailed ×2)
          </div>
        </Card>
        <Card className="center">
          <div className="big orange">{drillTotal}</div>
          <div className="small muted">
            Drill sets + custom
            <br />
            sessions logged
          </div>
        </Card>
      </div>

      <Card className="splitCard">
        <div>
          <h2>📅 Protocol — Phase {state.proto.phase}: {phase.name}</h2>
          <span className="small muted">
            {state.proto.phase === 1
              ? (state.proto.p1 || []).includes(today())
                ? "✓ Today's recall logged."
                : "Today's 90-second recall is waiting."
              : "Run the Daily 20: recall → reps → misses."}
          </span>
        </div>
        <button className="btn small" onClick={() => navigate("/drill/proto")}>
          Today's 20
        </button>
      </Card>

      <Card>
        <h2>💪 Train My Weakness</h2>
        {weak.length ? (
          <>
            <div className="small muted weaknessLine">
              Your weakest KPIs right now:{" "}
              {weak.map((w) => (
                <Pill hot key={w.n}>
                  KPI {w.n} {KPIS[w.n - 1]?.name || ""}
                </Pill>
              ))}
            </div>
            <button className="btn block" onClick={() => navigate("/drill/train")}>
              🎯 Train my weakest area
            </button>
          </>
        ) : (
          <>
            <div className="small muted weaknessLine">
              Generate a quiz, drill, or roleplay aimed at exactly what’s beating
              you. Grade a call or take a quiz and this starts aiming itself.
            </div>
            <button
              className="btn block ghost"
              onClick={() => navigate("/drill/train")}
            >
              Open the generator
            </button>
          </>
        )}
      </Card>

      <Card>
        <h2>The Ladder — earn the right</h2>
        {RANKS.map((rank, index) => (
          <div
            className={cx(
              "rankcard",
              index === state.rank && "now",
              index < state.rank && "done"
            )}
            key={rank.name}
          >
            <div className="em">{rank.em}</div>
            <div>
              <b>{rank.name}</b>{" "}
              {index < state.rank ? (
                <span className="green small">✓ earned</span>
              ) : index === state.rank ? (
                <span className="orange small">← you are here</span>
              ) : (
                <span className="muted small">
                  🔒 pass {QUIZZES[index - 1].name}
                </span>
              )}
              <br />
              <span className="small muted">{rank.unlock}</span>
            </div>
          </div>
        ))}
      </Card>

      <Card className="splitCard">
        <div>
          <h2>🧰 The Field Kit</h2>
          <span className="small muted">
            Discovery Form, 12-Step, Glossary & more — download to your device.
          </span>
        </div>
        <button className="btn small ghost" onClick={() => navigate("/learn/kit")}>
          Open
        </button>
      </Card>

      <Card>
        <h2>💾 Progress</h2>
        {storageOn ? (
          <>
            <div className="small green">
              ✓ Auto-save is ON — your progress stays on this device.
            </div>
            <div className="small muted progressHelp">
              Getting a new phone? Grab a backup code here and paste it on the
              new device.
            </div>
          </>
        ) : (
          <div className="small muted">
            Auto-save isn’t available in this view. Copy a backup code before you
            close; paste it next time.
          </div>
        )}
        <div className="progressBtns">
          <button className="btn small ghost" onClick={exportNow}>
            Backup code
          </button>
          <button
            className="btn small ghost"
            onClick={() => {
              setCode("");
              setCodeMode("restore");
            }}
          >
            Restore from code
          </button>
        </div>
        {codeMode === "backup" && (
          <>
            <textarea
              readOnly
              value={code}
              onClick={(event) => event.currentTarget.select()}
            />
            <div className="small muted">Tap, copy, keep it somewhere.</div>
          </>
        )}
        {codeMode === "restore" && (
          <>
            <textarea
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="Paste your progress code"
            />
            <button className="btn small" onClick={importNow}>
              Restore
            </button>
          </>
        )}
      </Card>
    </main>
  );
}

const learnTabs = [
  { id: "steps", label: "12 Steps" },
  { id: "gloss", label: "Glossary" },
  { id: "pivot", label: "Pivot Points" },
  { id: "kpis", label: "22 KPIs" },
  { id: "disc", label: "Discovery Form" },
  { id: "scripts", label: "Key Scripts" },
  { id: "kit", label: "🧰 Field Kit" }
];

function LearnPage() {
  const { tab = "steps" } = useParams();
  const { state } = useProgress();
  const active = learnTabs.some((item) => item.id === tab) ? tab : "steps";
  const tabs = learnTabs.map((item) =>
    item.id === "pivot" && state.rank < 1
      ? { ...item, label: `🔒 ${item.label}` }
      : item
  );

  return (
    <main className="stack">
      <Tabs items={tabs} active={active} base="/learn" />
      {active === "steps" && <StepsLearn />}
      {active === "gloss" && <GlossaryLearn />}
      {active === "pivot" &&
        (state.rank >= 1 ? (
          <PivotLearn />
        ) : (
          <>
            <div className="card locked center lockedLearn">
              <div className="lockIcon">🔒</div>
              <p className="small">
                Pivot Points unlock at 🔥 Apprentice. Pass the Apprentice Exam
                first — you can’t handle objections to a process you can’t run.
              </p>
            </div>
            <NavLink className="btn block" to="/quiz">
              Take the Apprentice Exam
            </NavLink>
          </>
        ))}
      {active === "kpis" && <KpisLearn />}
      {active === "disc" && <DiscoveryLearn />}
      {active === "scripts" && <ScriptsLearn />}
      {active === "kit" && <FieldKit />}
    </main>
  );
}

function StepsLearn() {
  let phase = "";
  return (
    <>
      {STEPS.map((step, index) => {
        const heading =
          PHASES[index] !== phase ? (
            <h3 className="phaseHead">{PHASES[index]}</h3>
          ) : null;
        phase = PHASES[index];
        return (
          <div key={step.n}>
            {heading}
            <Accordion
              id={`acc-s${step.n}`}
              title={`${step.n}. ${step.name}`}
              tag={`${step.time} · ${step.kpis}`}
            >
              <p className="small muted">{step.task}</p>
              {step.scripts.map((script, scriptIndex) => (
                <Script key={scriptIndex}>{script}</Script>
              ))}
              <Flag label="COACH">{step.coach}</Flag>
            </Accordion>
          </div>
        );
      })}
    </>
  );
}

function GlossaryLearn() {
  const [query, setQuery] = useState("");
  const results = GLOSSARY.filter((item) =>
    `${item.t} ${item.d}`.toLowerCase().includes(query.toLowerCase())
  );
  return (
    <>
      <Card>
        <h2>📚 Sales Vocabulary Glossary</h2>
        <p className="small muted">
          Every term across the 12-Step, Pivot Points, and KPI docs. Definitions
          live here; scripts live in their owning documents. A rep who knows the
          word without the rule only half-knows it.
        </p>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search terms…"
        />
      </Card>
      {results.length ? (
        results.map((item) => (
          <div className="card glossCard" key={item.t}>
            <b className="orange">{item.t}</b>
            <p className="small glossDef">{item.d}</p>
          </div>
        ))
      ) : (
        <div className="card center muted small">
          No term matches “{query}” — ask Panda Bot.
        </div>
      )}
    </>
  );
}

function PivotLearn() {
  const parts = [
    "Part I — Close-Time Objections",
    "Part II — Pre-Close Situations",
    "Part III — Money Objections & Reads",
    "Part IV — Outside Voices & The Value Gap"
  ];
  let part = 0;

  return (
    <>
      <Card id="diagnose">
        <h2>🩺 Diagnose the Objection</h2>
        <p className="small muted">{DIAG_MODEL}</p>
        <h3>The Four Steps</h3>
        {DIAG_STEPS.map((step) => (
          <div className="kpirow" key={step.s}>
            <span className="mk">▸</span>
            <span className="small">
              <b>{step.s}</b> — {step.q}{" "}
              <span className="muted">{step.m}</span>
            </span>
          </div>
        ))}
        <Flag label="THE TEST">{DIAG_TEST}</Flag>
        <h3>The Three Tools — how you dig</h3>
        {DIAG_TOOLS.map((tool) => (
          <div className="assign" key={tool.t}>
            <b>{tool.t}</b>
            <span className="script diagTool">{tool.say}</span>
            <span className="small muted">{tool.when}</span>
          </div>
        ))}
        <Flag label="STOP DIGGING">{DIAG_STOP}</Flag>
        <h3 className="diagEight">The Eight Conditions</h3>
        {DIAGNOSE.map((item, index) => (
          <div key={item.cat}>
            {(index === 0 || DIAGNOSE[index - 1].g !== item.g) && (
              <h3 className="phaseHead">{item.g}</h3>
            )}
            <h3>{index + 1}. {item.cat}</h3>
            <div className="kpirow">
              <span className="mk">🗣</span>
              <span>
                <b>Sounds like:</b> {item.sounds}
              </span>
            </div>
            <div className="kpirow">
              <span className="mk">✅</span>
              <span>
                <b>The play:</b> {item.play}
              </span>
            </div>
          </div>
        ))}
        <Flag label="ONE ENDING">{DIAG_END}</Flag>
      </Card>

      <Card>
        <h2>The 4 C’s — mapped to our flow</h2>
        {FOURCS.map((item) => (
          <p className="small fourC" key={item.c}>
            <b className="orange">{item.c}</b> — {item.map}
          </p>
        ))}
      </Card>

      {SCENARIOS.map((scenario) => {
        const heading =
          scenario.part !== part ? (
            <h3 className="partHead">{parts[scenario.part - 1]}</h3>
          ) : null;
        part = scenario.part;
        return (
          <div key={scenario.n}>
            {heading}
            <Accordion
              id={`acc-p${scenario.n}`}
              title={`${scenario.n}. ${scenario.title}`}
              tag={scenario.kpi}
            >
              <p className="small muted">{scenario.what}</p>
              {scenario.flow.map((item, index) => (
                <Script key={index}>{item}</Script>
              ))}
              <Flag label="FLAG">{scenario.flag}</Flag>
            </Accordion>
          </div>
        );
      })}
    </>
  );
}

function KpisLearn() {
  return (
    <>
      <Notice>
        Grade the mechanics, not the vibe. ✅ every pass condition met · ⚠️
        partial (some KPIs carry a ⚠️ ceiling) · ❌ missed or off-methodology ·
        ➖ situation never called for it.
      </Notice>
      {KPIS.map((kpi, index) => (
        <Accordion
          id={`acc-k${kpi.n}`}
          key={kpi.n}
          title={`KPI ${kpi.n} — ${kpi.name}`}
          tag={kpi.step}
        >
          <div className="kpirow">
            <span className="mk">✅</span>
            <span>{kpi.pass}</span>
          </div>
          <div className="kpirow">
            <span className="mk">❌</span>
            <span>{kpi.fail}</span>
          </div>
        </Accordion>
      ))}
    </>
  );
}

function DiscoveryLearn() {
  return (
    <Card>
      <h2>Homeowner Discovery Form — Step 2, verbatim</h2>
      {DISCOVERY.map((item, index) => (
        <Script key={index}>{item}</Script>
      ))}
      <Flag label="RULE">
        If a third-party name surfaces at the close that didn’t surface here,
        KPI 4 broke two hours earlier.
      </Flag>
    </Card>
  );
}

function ScriptsLearn() {
  return (
    <>
      {KEYSCRIPTS.map((item) => (
        <Card key={item.t}>
          <h2>{item.t}</h2>
          <Script>{item.s}</Script>
        </Card>
      ))}
    </>
  );
}

function FieldKit() {
  const [docs, setDocs] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/docs/manifest.json", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Manifest not found");
        return response.json();
      })
      .then((data) => setDocs(data))
      .catch(() => setDocs([]))
      .finally(() => setLoaded(true));
  }, []);

  if (!loaded) {
    return (
      <Card className="center">
        <div className="muted small">Opening the Field Kit…</div>
      </Card>
    );
  }

  if (!docs.length) {
    return (
      <Card>
        <h2>🧰 The Field Kit</h2>
        <Notice>
          Document downloads live on the team site. Open the app from your
          Netlify link — this copy can’t reach the documents folder.
        </Notice>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <h2>🧰 The Field Kit</h2>
        <p className="small muted">
          The documents you carry into the home. Tap ⬇ to save the PDF to your
          device — works offline once downloaded.
        </p>
      </Card>
      {docs.map((doc) => (
        <div className="card kitDoc" key={doc.file}>
          <div>
            <b>{doc.name}</b>
            <br />
            <span className="small muted">{doc.desc || ""}</span>
          </div>
          <a className="btn small kitBtn" href={`/docs/${encodeURIComponent(doc.file)}`} download>
            ⬇ PDF
          </a>
        </div>
      ))}
    </>
  );
}

const drillTabs = [
  { id: "cards", label: "Flashcards" },
  { id: "live", label: "Partner Drills" },
  { id: "train", label: "💪 Train My Weakness" },
  { id: "proto", label: "📅 Protocol" }
];

function DrillPage() {
  const { tab = "cards" } = useParams();
  const { state } = useProgress();
  const active = drillTabs.some((item) => item.id === tab) ? tab : "cards";
  const tabs = drillTabs.map((item) =>
    item.id === "live" && state.rank < 1
      ? { ...item, label: `🔒 ${item.label}` }
      : item
  );

  return (
    <main className="stack">
      <Tabs items={tabs} active={active} base="/drill" />
      {active === "cards" && <Flashcards />}
      {active === "live" &&
        (state.rank >= 1 ? (
          <PartnerDrills />
        ) : (
          <>
            <div className="card locked center lockedLearn">
              <div className="lockIcon">🔒</div>
              <p className="small">
                Partner drills unlock at 🔥 Apprentice. Master the flashcards
                and pass the Apprentice Exam first.
              </p>
            </div>
            <NavLink className="btn block" to="/quiz">
              Take the Apprentice Exam
            </NavLink>
          </>
        ))}
      {active === "train" && <TrainWeakness />}
      {active === "proto" && <ProtocolPage />}
    </main>
  );
}

function Flashcards() {
  const { state, dispatch } = useProgress();
  const [run, setRun] = useState(null);
  const mastered = Object.values(state.cards).filter((value) => value >= 2).length;

  function startCards() {
    const deck = CARDS.map((card, index) => ({ ...card, index }))
      .sort((a, b) => (state.cards[a.index] || 0) - (state.cards[b.index] || 0))
      .slice(0, 10);
    setRun({ deck, i: 0, flipped: false });
  }

  function scoreCard(hit) {
    const card = run.deck[run.i];
    dispatch({ type: "MARK_CARD", index: card.index, nailed: hit });
    if (run.i + 1 >= run.deck.length) setRun(null);
    else setRun({ ...run, i: run.i + 1, flipped: false });
  }

  if (!run) {
    return (
      <Card className="center">
        <h2>Script Flashcards</h2>
        <p className="small muted">
          Situation on the front. Verbatim line on the back. Nail a card twice
          and it’s mastered. Missed cards come back until they don’t.
        </p>
        <div className="big orange flashMastered">{mastered}/{CARDS.length}</div>
        <div className="muted small">mastered</div>
        <button className="btn flashStart" onClick={startCards}>
          Start a round (10 cards)
        </button>
      </Card>
    );
  }

  const card = run.deck[run.i];
  return (
    <>
      <div className="small muted center cardCount">
        Card {run.i + 1} of {run.deck.length}
      </div>
      <button className="flash" onClick={() => setRun({ ...run, flipped: true })}>
        <span className="front">{card.f}</span>
        {run.flipped ? (
          <>
            <hr className="hr" />
            <span className="back">{card.b}</span>
          </>
        ) : (
          <span className="muted small">tap to reveal</span>
        )}
      </button>
      {run.flipped && (
        <div className="grid2 drillScoreGrid">
          <button className="btn ghost" onClick={() => scoreCard(false)}>
            ✗ Missed it
          </button>
          <button className="btn" onClick={() => scoreCard(true)}>
            ✓ Nailed it
          </button>
        </div>
      )}
    </>
  );
}

function PartnerDrills() {
  const { state, dispatch } = useProgress();
  const navigate = useNavigate();

  return (
    <>
      <Notice>
        These are partner drills from the Pivot Points Playbook. Run them live,
        log your sets here. Pass conditions are non-negotiable.
      </Notice>
      {DRILLS.map((drill) => {
        const done = state.drills[drill.n] || 0;
        return (
          <Accordion
            id={`acc-d${drill.n}`}
            key={drill.n}
            title={`Drill ${drill.n} — ${drill.name}`}
            tag={`${drill.sets} · ${done} logged`}
          >
            <p className="small">
              <b>Covers:</b> {drill.covers}
            </p>
            <p className="small drillHow">{drill.how}</p>
            <Flag label="PASS">{drill.pass}</Flag>
            <div className="scenarioBtns">
              {(DRILL_LINKS[drill.n] || []).map((n) => (
                <button
                  className="btn ghost small"
                  key={n}
                  onClick={() => navigate(`/learn/pivot#acc-p${n}`)}
                >
                  S{n}
                </button>
              ))}
              {drill.n === 2 && (
                <button
                  className="btn ghost small"
                  onClick={() => navigate("/learn/pivot#diagnose")}
                >
                  🩺 Diagnose the Objection
                </button>
              )}
            </div>
            <button
              className="btn small"
              onClick={() => dispatch({ type: "LOG_DRILL", n: drill.n })}
            >
              Log a completed set
            </button>
          </Accordion>
        );
      })}
    </>
  );
}

function weaknessAutoText(state) {
  const parts = [];
  weakestKpis(state).forEach((w) =>
    parts.push(
      `KPI ${w.n} (${KPIS[w.n - 1]?.name}) keeps scoring partial/fail on graded calls`
    )
  );
  Object.entries(state.scenStats || {})
    .filter(([, stats]) => stats.fail > 0)
    .sort((a, b) => b[1].fail - a[1].fail)
    .slice(0, 2)
    .forEach(([n]) =>
      parts.push(`Scenario ${n} (${SCENARIOS[n - 1]?.title}) handled off-methodology`)
    );
  state.assignments
    .filter((item) => !item.done && /Study & re-drill/.test(item.name))
    .slice(0, 2)
    .forEach((item) =>
      parts.push(item.name.replace("Study & re-drill: ", "missed quiz topic: "))
    );
  return parts.join("; ");
}

function TrainWeakness() {
  const { state, dispatch } = useProgress();
  const [tt, setTt] = useState("scenario");
  const [tv, setTv] = useState("1");
  const [free, setFree] = useState("");
  const [format, setFormat] = useState("quiz");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState("");
  const autoText = weaknessAutoText(state);

  function targetDesc() {
    if (tt === "auto") return autoText || null;
    if (tt === "scenario") {
      const scenario = SCENARIOS[Number(tv) - 1];
      return `Pivot Scenario ${scenario.n} — ${scenario.title} (${scenario.kpi})`;
    }
    if (tt === "kpi") {
      const kpi = KPIS[Number(tv) - 1];
      return `KPI ${kpi.n} — ${kpi.name} (${kpi.step}). Pass conditions: ${kpi.pass}`;
    }
    if (tt === "term") {
      const term = GLOSSARY[Number(tv)];
      return `Glossary term: ${term.t} — ${term.d}`;
    }
    return free.trim() || null;
  }

  async function generate() {
    const target = targetDesc();
    if (!target) {
      alert(
        tt === "auto"
          ? "No weakness data yet — take a quiz or grade a call first, or pick a target manually."
          : "Describe or pick what you want to train."
      );
      return;
    }
    setBusy(true);
    setResult("");
    try {
      const text = await aiComplete(weaknessPrompt(target, format));
      setResult(text);
      dispatch({ type: "COMPLETE_CUSTOM" });
    } catch {
      setResult(`Couldn’t generate — the AI backend isn’t reachable. ${AI_NOTICE}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Card>
        <h2>💪 Train My Weakness</h2>
        <p className="small muted">
          Pick what’s beating you — or let your own numbers pick. Everything
          generated comes from the six source documents only. Completed sessions
          log to your dashboard.
        </p>
        <div className="tabbtns trainPicker">
          {[
            ["auto", "🎯 My weakest area"],
            ["scenario", "Scenario"],
            ["kpi", "KPI"],
            ["term", "Term"],
            ["free", "In my own words"]
          ].map(([id, label]) => (
            <button
              className={cx("btn small ghost", tt === id && "on")}
              key={id}
              onClick={() => {
                setTt(id);
                setTv(id === "term" ? "0" : "1");
                setResult("");
              }}
            >
              {label}
            </button>
          ))}
        </div>
        {tt === "auto" &&
          (autoText ? (
            <Notice>Your data says: {autoText}</Notice>
          ) : (
            <Notice>
              No weakness data yet — take a quiz, grade a call, or pick a target
              manually.
            </Notice>
          ))}
        {tt === "scenario" && (
          <select value={tv} onChange={(event) => setTv(event.target.value)}>
            {SCENARIOS.map((scenario) => (
              <option value={scenario.n} key={scenario.n}>
                S{scenario.n} — {scenario.title}
              </option>
            ))}
          </select>
        )}
        {tt === "kpi" && (
          <select value={tv} onChange={(event) => setTv(event.target.value)}>
            {KPIS.map((kpi) => (
              <option value={kpi.n} key={kpi.n}>
                KPI {kpi.n} — {kpi.name}
              </option>
            ))}
          </select>
        )}
        {tt === "term" && (
          <select value={tv} onChange={(event) => setTv(event.target.value)}>
            {GLOSSARY.map((term, index) => (
              <option value={index} key={term.t}>
                {term.t}
              </option>
            ))}
          </select>
        )}
        {tt === "free" && (
          <input
            value={free}
            onChange={(event) => setFree(event.target.value)}
            placeholder="e.g. I keep talking after the mirror… I panic when they name a competitor’s number…"
          />
        )}
        <div className="grid3 trainFormat">
          {[
            ["quiz", "📝 Quiz"],
            ["drill", "🥊 Drill card"],
            ["role", "🎭 Roleplay"]
          ].map(([id, label]) => (
            <button
              className={cx("btn", format !== id && "ghost")}
              key={id}
              onClick={() => {
                setFormat(id);
                setResult("");
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <button className="btn block trainGenerate" disabled={busy} onClick={generate}>
          {busy ? "Generating…" : "Generate my session"}
        </button>
        <div className="small muted trainDone">
          Sessions completed: {state.customDone || 0}
        </div>
      </Card>
      {result && (
        <Card>
          <h2>
            {format === "quiz"
              ? "📝 Custom Quiz"
              : format === "drill"
                ? "🥊 Custom Drill"
                : "🎭 Solo Roleplay"}
          </h2>
          <pre className="aiout">{result}</pre>
        </Card>
      )}
    </>
  );
}

function p1Streak(p1 = []) {
  const days = [...new Set(p1)].map((d) => new Date(d)).sort((a, b) => a - b);
  let streak = 0;
  for (let i = days.length - 1; i >= 0; i -= 1) {
    const expect = new Date(days[days.length - 1]);
    expect.setDate(expect.getDate() - (days.length - 1 - i));
    if (days[i].toDateString() === expect.toDateString()) streak += 1;
    else break;
  }
  return streak;
}

function anchorsDone(proto) {
  return PROTOCOL.anchors.filter((anchor, index) => (proto.anchors?.[index] || 0) >= 5).length;
}

function protoGateMet(proto) {
  if (proto.phase === 1) return p1Streak(proto.p1) >= 3;
  if (proto.phase === 2) return anchorsDone(proto) >= 4;
  if (proto.phase === 3) return proto.d12?.[1] && proto.d12?.[2];
  return false;
}

function ProtocolPage() {
  const { state, dispatch } = useProgress();
  const navigate = useNavigate();
  const [recall, setRecall] = useState(null);
  const proto = state.proto;
  const phase = PROTOCOL.phases[proto.phase - 1] || PROTOCOL.phases[0];

  useEffect(() => {
    if (!recall || recall.revealed) return undefined;
    const timer = window.setInterval(() => {
      setRecall((current) => {
        if (!current) return current;
        if (current.left <= 1) return { ...current, left: 0, revealed: true };
        return { ...current, left: current.left - 1 };
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [recall]);

  function finishRecall(pass) {
    if (pass) {
      dispatch({ type: "LOG_RECALL", date: today() });
    } else {
      dispatch({
        type: "ADD_ASSIGNMENT",
        assignment: {
          name: "Rebuild the skeleton",
          why: "Missed the blank-page recall",
          sets: "Reread the 12 Steps once, then recall again tomorrow",
          pass: "Cold, in order, 90 seconds",
          done: false
        }
      });
    }
    setRecall(null);
  }

  return (
    <>
      <Card className="protoHead">
        <h2>📅 The Training Protocol — Phase {proto.phase}: {phase.name}</h2>
        <p className="small muted">
          {phase.focus} <b>Pass:</b> {phase.pass}
        </p>
        {protoGateMet(proto) && proto.phase < 4 && (
          <button className="btn block" onClick={() => dispatch({ type: "ADVANCE_PROTO" })}>
            ✓ Pass condition met — advance to Phase {proto.phase + 1}
          </button>
        )}
        <p className="small gold protoMotto">{PROTOCOL.motto}</p>
      </Card>
      {proto.phase === 1 && (
        <Card>
          <h2>Phase 1 — Skeleton</h2>
          <p className="small muted">
            Blank page. 90 seconds. 4 phases, 12 steps in order. Pass 3 days in
            a row to unlock Phase 2.
          </p>
          <div className="big orange center">{p1Streak(proto.p1)}/3</div>
          <div className="small muted center">consecutive days</div>
          {!recall ? (
            <button className="btn block recallStart" onClick={() => setRecall({ left: 90, revealed: false })}>
              Start today’s 90-second recall
            </button>
          ) : recall.revealed ? (
            <>
              <Notice>Check yourself — the skeleton, in order:</Notice>
              <div className="small skeletonList">
                {STEPS.map((step, index) => (
                  <div key={step.n}>
                    {PHASES[index] !== (index > 0 ? PHASES[index - 1] : "") && (
                      <>
                        <b className="orange">{PHASES[index]}</b>
                        <br />
                      </>
                    )}
                    {step.n}. {step.name}
                  </div>
                ))}
              </div>
              <div className="grid2 drillScoreGrid">
                <button className="btn ghost" onClick={() => finishRecall(false)}>
                  ✗ Missed some
                </button>
                <button className="btn" onClick={() => finishRecall(true)}>
                  ✓ Cold, in order
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="center recallBox">
                <div className="big orange">{recall.left}s</div>
                <div className="small muted">
                  Write or say all 4 phases and 12 steps — in order, from nothing.
                </div>
              </div>
              <textarea placeholder="Type them here, or say them out loud standing up…" />
              <button className="btn block ghost" onClick={() => setRecall({ ...recall, left: 0, revealed: true })}>
                I’m done — check me
              </button>
            </>
          )}
          {(proto.p1 || []).includes(today()) && (
            <p className="small green center recallLogged">✓ Logged today</p>
          )}
        </Card>
      )}
      {proto.phase === 2 && (
        <Card>
          <h2>Phase 2 — Verbatim Anchors</h2>
          <p className="small muted">
            One anchor script per week. Out loud, standing, in the voice. 5
            clean reps, zero reads. Silent reading does not count as a rep.
          </p>
          {PROTOCOL.anchors.map((anchor, index) => {
            const reps = proto.anchors?.[index] || 0;
            return (
              <div className="assign" key={anchor.name}>
                <b>Week {anchor.w}: {anchor.name}</b>{" "}
                <span className="muted small">· {anchor.own}</span>
                <br />
                <div className="bar anchorBar">
                  <i style={{ width: `${Math.min(100, reps * 20)}%` }} />
                </div>
                <span className={cx("small", reps >= 5 ? "green" : "muted")}>
                  {reps}/5 clean reps {reps >= 5 ? "✓" : ""}
                </span>
                {reps < 5 && (
                  <button className="btn small anchorBtn" onClick={() => dispatch({ type: "INC_ANCHOR", index })}>
                    +1 clean rep
                  </button>
                )}
              </div>
            );
          })}
          <p className="small muted">
            Scripts live in Learn → Key Scripts. One anchor per week — stacking
            two is how retention halves.
          </p>
        </Card>
      )}
      {proto.phase === 3 && (
        <Card>
          <h2>Phase 3 — Universal Flow</h2>
          <p className="small muted">
            Mirror + 4-second silence to automaticity, then diagnosis speed.
            Pass conditions live in Drills 1 and 2.
          </p>
          {[
            [1, "Drill 1 — Mirror Discipline: zero talk inside 4 seconds, zero pitch rise"],
            [2, "Drill 2 — Diagnosis Speed: 7 of 8 routed correctly"]
          ].map(([n, label]) => (
            <div className="assign" key={n}>
              <b>{label}</b>
              <br />
              {proto.d12?.[n] ? (
                <span className="green small">✓ Pass condition met</span>
              ) : (
                <button className="btn small assignBtn" onClick={() => dispatch({ type: "SET_D12", n })}>
                  Met the pass condition today
                </button>
              )}
            </div>
          ))}
          <button className="btn small ghost" onClick={() => navigate("/drill/live")}>
            Open the drills
          </button>
        </Card>
      )}
      {proto.phase === 4 && (
        <Card>
          <h2>Phase 4 — Interleaved Routing (ongoing)</h2>
          <p className="small muted">
            One 30-minute live session per week: partner throws randomized
            objections from all 20 scenarios. Log it here.
          </p>
          <div className="weeklyBtns">
            {DRILLS.map((drill) => (
              <button
                className="btn small ghost"
                key={drill.n}
                onClick={() => dispatch({ type: "LOG_WEEKLY", n: drill.n, date: today() })}
              >
                Log Drill {drill.n}
              </button>
            ))}
          </div>
          {(proto.weekly || []).length > 0 && (
            <p className="small muted weeklyLast">
              Last sessions:{" "}
              {(proto.weekly || [])
                .slice(-5)
                .map((w) => `Drill ${w.d} (${w.t.slice(0, 10)})`)
                .join(" · ")}
            </p>
          )}
        </Card>
      )}
      <Card>
        <h2>⏱ The Daily 20 — non-negotiable split</h2>
        {PROTOCOL.daily.map((item) => (
          <div className="kpirow" key={item}>
            <span className="mk">▸</span>
            <span className="small">{item}</span>
          </div>
        ))}
        <div className="grid3 dailyBtns">
          <button className="btn small ghost" onClick={() => setRecall({ left: 90, revealed: false })}>
            1–5 Recall
          </button>
          <button className="btn small ghost" onClick={() => navigate("/learn/scripts")}>
            6–15 Reps
          </button>
          <button className="btn small ghost" onClick={() => navigate("/drill/cards")}>
            16–20 Misses
          </button>
        </div>
        <p className="small muted dailySpacing">{PROTOCOL.spacing}</p>
      </Card>
      <Card>
        <h2>The Six Principles</h2>
        {PROTOCOL.principles.map((principle, index) => (
          <p className="small principle" key={principle.t}>
            <b className="orange">
              {index + 1}. {principle.t}.
            </b>{" "}
            {principle.d}
          </p>
        ))}
      </Card>
      <Card>
        <h2>The Closed Loop</h2>
        <p className="small">{PROTOCOL.loop}</p>
      </Card>
      <Card>
        <h2>Burnout Rules</h2>
        {PROTOCOL.rules.map((rule) => (
          <div className="kpirow" key={rule}>
            <span className="mk">■</span>
            <span className="small">{rule}</span>
          </div>
        ))}
      </Card>
    </>
  );
}

function QuizPage() {
  const { state, dispatch } = useProgress();
  const navigate = useNavigate();
  const [quizRun, setQuizRun] = useState(null);
  const quiz = QUIZZES[state.rank];

  function startQuiz() {
    setQuizRun({ idx: 0, correct: 0, picked: null, review: [] });
  }

  function pick(i) {
    if (quizRun.picked != null) return;
    const question = quiz.qs[quizRun.idx];
    setQuizRun({
      ...quizRun,
      picked: i,
      correct: i === question.a ? quizRun.correct + 1 : quizRun.correct,
      review:
        i === question.a
          ? quizRun.review
          : [
              ...quizRun.review,
              {
                q: question.q,
                you: question.o[i],
                ans: question.o[question.a],
                w: question.w || ""
              }
            ]
    });
  }

  function nextQuestion() {
    setQuizRun({ ...quizRun, idx: quizRun.idx + 1, picked: null });
  }

  function score() {
    return Math.round((100 * quizRun.correct) / quiz.qs.length);
  }

  function assignMisses() {
    quizRun.review.slice(0, 3).forEach((miss) =>
      dispatch({
        type: "ADD_ASSIGNMENT",
        assignment: {
          name: `Study & re-drill: ${miss.q.slice(0, 60)}`,
          why: `Missed on the ${quiz.name}`,
          sets: "Flashcards + reread the module",
          pass: "Answer it cold, twice",
          done: false
        }
      })
    );
    navigate("/");
  }

  function claimRank() {
    dispatch({ type: "CLAIM_RANK" });
    setQuizRun(null);
    navigate("/");
  }

  useEffect(() => {
    if (quizRun && quiz && quizRun.idx >= quiz.qs.length) {
      dispatch({
        type: "SET_BEST",
        qi: state.rank,
        score: Math.round((100 * quizRun.correct) / quiz.qs.length)
      });
    }
  }, [dispatch, quiz, quizRun, state.rank]);

  if (state.rank >= 3 && !quizRun) {
    return (
      <main className="stack">
        <Card className="center">
          <div className="topRepIcon">🏆</div>
          <h2>Top Rep</h2>
          <p className="small muted">
            You’ve passed every exam. The scoreboard now is your call grades —
            go to Grade Call.
          </p>
        </Card>
      </main>
    );
  }

  if (!quizRun) {
    return (
      <main className="stack">
        <Card className="center">
          <h2>{quiz.name}</h2>
          <p className="small muted">{quiz.desc}</p>
          <p className="small quizMeta">
            {quiz.qs.length} questions · 80% passes · fail and the missed topics
            become assigned drills
          </p>
          {state.best[state.rank] ? (
            <p className="small gold">Best so far: {state.best[state.rank]}%</p>
          ) : null}
          <button className="btn quizBegin" onClick={startQuiz}>
            Begin
          </button>
        </Card>
      </main>
    );
  }

  if (quizRun.idx >= quiz.qs.length) {
    const pct = score();
    const passed = pct >= 80;

    return (
      <main className="stack">
        <Card className="center">
          {passed ? (
            <img className="quizPassLogo" src="/RedPanda.png" alt="Red Panda Roofing" />
          ) : (
            <div className="quizFailIcon">🥊</div>
          )}
          <div className={cx("big", passed ? "green" : "red")}>{pct}%</div>
          <p className="small muted">
            {quizRun.correct} of {quiz.qs.length} correct —{" "}
            {passed ? "PASSED" : "below the 80% line"}
          </p>
          {passed ? (
            <button className="btn quizClaim" onClick={claimRank}>
              Claim your rank: {RANKS[state.rank + 1].em}{" "}
              {RANKS[state.rank + 1].name}
            </button>
          ) : (
            <>
              <p className="small quizFailText">
                Missed topics are now on your dashboard as drills. Study, drill,
                come back.
              </p>
              <button className="btn quizAction" onClick={assignMisses}>
                Accept assignments
              </button>{" "}
              <button className="btn ghost quizAction" onClick={startQuiz}>
                Retake now
              </button>
            </>
          )}
        </Card>
        {quizRun.review.length ? (
          <Card>
            <h2>Review your misses</h2>
            {quizRun.review.map((miss) => (
              <div className="assign" key={miss.q}>
                <b>{miss.q}</b>
                <br />
                <span className="red small">You: {miss.you}</span>
                <br />
                <span className="green small">Ours: {miss.ans}</span>
                {miss.w ? (
                  <>
                    <br />
                    <span className="muted small">{miss.w}</span>
                  </>
                ) : null}
              </div>
            ))}
          </Card>
        ) : null}
      </main>
    );
  }

  const question = quiz.qs[quizRun.idx];

  return (
    <main className="stack">
      <div className="small muted quizCount">
        Question {quizRun.idx + 1} of {quiz.qs.length} · {quiz.name}
      </div>
      <div className="bar quizBar">
        <i style={{ width: `${(100 * quizRun.idx) / quiz.qs.length}%` }} />
      </div>
      <Card>
        <h2 className="quizQuestion">{question.q}</h2>
        {question.o.map((option, i) => {
          const cls =
            quizRun.picked == null
              ? ""
              : i === question.a
                ? "right"
                : i === quizRun.picked
                  ? "wrong"
                  : "";
          return (
            <button
              className={cx("qopt", cls)}
              disabled={quizRun.picked != null}
              key={option}
              onClick={() => pick(i)}
            >
              {option}
            </button>
          );
        })}
        {quizRun.picked != null && (
          <>
            {question.w && <Flag label="WHY">{question.w}</Flag>}
            <button className="btn block quizNext" onClick={nextQuestion}>
              {quizRun.idx + 1 >= quiz.qs.length ? "See results" : "Next"}
            </button>
          </>
        )}
      </Card>
    </main>
  );
}

function BotPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  async function send() {
    if (!input.trim()) return;
    const text = input.trim();
    const next = [...messages, { who: "user", text }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const hist = next
        .slice(-6)
        .map((m) => `${m.who === "user" ? "REP" : "COACH"}: ${m.text}`)
        .join("\n");
      const response = await aiComplete(
        `${kbPrompt()}\n\n=== CONVERSATION ===\n${hist}\nCOACH:`
      );
      setMessages([...next, { who: "bot", text: response.trim() }]);
    } catch {
      setMessages([
        ...next,
        { who: "bot", text: `I can’t reach the AI from here. ${AI_NOTICE}` }
      ]);
    } finally {
      setBusy(false);
      window.setTimeout(() => window.scrollTo(0, document.body.scrollHeight), 0);
    }
  }

  return (
    <main className="stack">
      <Card>
        <h2 className="botTitle">
          <img src="/logo.png" alt="" /> Red Panda Bot
        </h2>
        <p className="small muted">
          Docs-only coach. Ask about any step, script, scenario, or KPI. If it’s
          not in the playbook, it says so.
        </p>
      </Card>
      {!aiMayWork() && <Notice>{AI_NOTICE}</Notice>}
      <div className="chat">
        {messages.length ? (
          messages.map((message, index) => (
            <div className={cx("msg", message.who)} key={index}>
              {message.text}
            </div>
          ))
        ) : (
          <div className="msg bot">
            What do you want to sharpen? Try: “Give me the parachute script” ·
            “What breaks KPI 15?” · “Homeowner said her brother roofs — what’s
            the play?”
          </div>
        )}
        {busy && <div className="msg bot">…thinking</div>}
      </div>
      <div className="botInputRow">
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") send();
          }}
          placeholder="Ask the playbook…"
        />
        <button className="btn" disabled={busy} onClick={send}>
          Send
        </button>
      </div>
    </main>
  );
}

function parseGrade(text) {
  const clean = text.replace(/```json|```/g, "").trim();
  const start = clean.indexOf("{");
  const end = clean.lastIndexOf("}");
  if (start < 0 || end < start) throw new Error("No JSON returned");
  return JSON.parse(clean.slice(start, end + 1));
}

function gradeMark(score) {
  if (score === "pass") return "✅";
  if (score === "partial") return "⚠️";
  if (score === "na") return "➖";
  return "❌";
}

function RenderGrade({ grade }) {
  return (
    <Card>
      <div className="scorehead">Brutal summary</div>
      <p className="small">{grade.summary || ""}</p>

      <div className="scorehead">Scorecard</div>
      {(grade.scorecard || []).map((row) => (
        <div className="kpirow" key={row.n}>
          <span className="mk">{gradeMark(row.score)}</span>
          <span>
            <b>KPI {row.n}</b> {KPIS[row.n - 1]?.name || ""} —{" "}
            <span className="muted">{row.note || ""}</span>
          </span>
        </div>
      ))}

      {grade.failures?.length ? (
        <>
          <div className="scorehead">Critical failures</div>
          {grade.failures.map((failure, index) => (
            <div className="assign" key={`${failure.kpi}-${index}`}>
              <b>KPI {failure.kpi}</b> — “{failure.quote}”
              <br />
              <span className="muted small">{failure.why}</span>
            </div>
          ))}
        </>
      ) : null}

      {grade.scenarioTags?.length ? (
        <>
          <div className="scorehead">Objections tagged (KPI 19 log)</div>
          {grade.scenarioTags.map((tag, index) => (
            <div className="kpirow" key={`${tag.scenario}-${index}`}>
              <span className="mk">
                {tag.handled === "pass"
                  ? "✅"
                  : tag.handled === "partial"
                    ? "⚠️"
                    : "❌"}
              </span>
              <span>
                <b>Scenario {tag.scenario}</b> —{" "}
                {SCENARIOS[tag.scenario - 1]?.title || ""}{" "}
                <span className="muted">{tag.note || ""}</span>
              </span>
            </div>
          ))}
        </>
      ) : null}

      <div className="scorehead">Where the deal died</div>
      <p className="small red">{grade.died || ""}</p>

      <div className="scorehead">Assigned drills</div>
      {(grade.drills || []).map((drill, index) => (
        <div className="assign" key={`${drill.name}-${index}`}>
          <b>{drill.name}</b> — {drill.sets || ""}
          <br />
          <span className="small">Pass: {drill.pass || ""}</span>
        </div>
      ))}
      <p className="small green gradeAdded">✓ Drills added to your dashboard.</p>
    </Card>
  );
}

function GradePage() {
  const { state, dispatch } = useProgress();
  const [transcript, setTranscript] = useState("");
  const [busy, setBusy] = useState(false);
  const grade = state.lastGrade;

  async function gradeCall() {
    if (transcript.trim().length < 200) {
      alert("Paste the full transcript — a real one. Short snippets can’t be graded on 22 KPIs.");
      return;
    }
    setBusy(true);
    try {
      const text = await aiComplete(gradePrompt(transcript));
      dispatch({ type: "RECORD_GRADE", grade: parseGrade(text) });
    } catch {
      alert(`Grading didn’t come back. ${AI_NOTICE}`);
    } finally {
      setBusy(false);
      window.scrollTo(0, 0);
    }
  }

  if (state.rank < 2) {
    return (
      <main className="stack">
        <div className="card locked center lockedLearn">
          <div className="lockIcon">🔒</div>
          <p className="small">
            Grade My Call unlocks at 🎯 Closer. Earn the right: own the scripts
            before the scoreboard owns you.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="stack">
      <Card>
        <h2>📝 Grade My Call</h2>
        <p className="small muted">
          Paste your appointment transcript. It gets scored on all 22 KPIs
          against the scoring definitions — brutal summary, scorecard, where the
          deal died, and two drills that go straight to your dashboard.
        </p>
        {!aiMayWork() && (
          <Notice>
            {AI_NOTICE} Alternative: paste the transcript in the 12-Step Project
            chat and it will be graded the same way.
          </Notice>
        )}
        <textarea
          value={transcript}
          onChange={(event) => setTranscript(event.target.value)}
          placeholder="Paste the full transcript here…"
        />
        <button className="btn block gradeButton" disabled={busy} onClick={gradeCall}>
          Grade it
        </button>
        {busy && (
          <Notice>Grading against all 22 KPIs… 30–60 seconds.</Notice>
        )}
      </Card>

      {grade && <RenderGrade grade={grade} />}
    </main>
  );
}

export default function App() {
  return (
    <ProgressProvider>
      <Shell />
    </ProgressProvider>
  );
}
