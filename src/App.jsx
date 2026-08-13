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
import { gradePrompt, kbPrompt, weaknessPrompt } from "./lib/prompts.js";

const navItems = [
  { to: "/", label: "Home", end: true },
  { to: "/learn", label: "Learn" },
  { to: "/drill", label: "Drill" },
  { to: "/quiz", label: "Rank Up" },
  { to: "/bot", label: "Panda Bot" },
  { to: "/grade", label: "Grade Call" }
];

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function Card({ children, className }) {
  return <section className={cx("card", className)}>{children}</section>;
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

  return (
    <>
      <div className="app">
        <header className="top">
          <img className="mark" src="/logo.png" alt="" />
          <div>
            <h1>Red Panda Closer Academy</h1>
            <p>Sales training loop</p>
          </div>
          <span className="rankchip">{RANKS[state.rank]?.name || "Rookie"}</span>
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
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}

function HomePage() {
  const { state, dispatch, snapshot } = useProgress();
  const [code, setCode] = useState("");
  const mastered = Object.values(state.cards).filter((n) => n >= 2).length;
  const nextRank = RANKS[Math.min(3, state.rank + 1)];

  function exportNow() {
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
      <Card>
        <p className="eyebrow">Current rank</p>
        <h2>
          {RANKS[state.rank]?.name || "Rookie"}{" "}
          <span className="muted">of Top Rep</span>
        </h2>
        <p>{RANKS[state.rank]?.unlock}</p>
        {state.rank < 3 ? (
          <p className="muted">Next unlock: {nextRank?.name}</p>
        ) : (
          <p className="gold">Top of the ladder. Now keep it sharp.</p>
        )}
      </Card>

      <Card>
        <h2>Assigned Drills</h2>
        {state.assignments.length === 0 ? (
          <p className="muted">Nothing assigned yet. Miss a quiz or grade a call to generate work.</p>
        ) : (
          state.assignments.map((item, index) => (
            <div className={cx("assign", item.done && "done")} key={`${item.name}-${index}`}>
              <label>
                <input
                  type="checkbox"
                  checked={!!item.done}
                  onChange={() => dispatch({ type: "DONE_ASSIGNMENT", index })}
                />{" "}
                <b>{item.name}</b>
              </label>
              <p>{item.why}</p>
              <p className="muted">{item.sets || 2} clean sets</p>
            </div>
          ))
        )}
      </Card>

      <div className="grid2">
        <Card>
          <h3>Flashcards</h3>
          <div className="big">{mastered}/{CARDS.length}</div>
          <p className="muted">Nailed twice = mastered.</p>
        </Card>
        <Card>
          <h3>Drills</h3>
          <div className="big">{Object.values(state.drills).reduce((a, b) => a + b, 0)}</div>
          <p className="muted">Completed sets logged.</p>
        </Card>
      </div>

      <Card>
        <h2>Rank Ladder</h2>
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
              <b>{rank.name}</b>
              <p className="muted">{rank.unlock}</p>
            </div>
          </div>
        ))}
      </Card>

      <Card>
        <h2>Progress Code</h2>
        <p className="muted">Backup and restore use the same code format as the legacy Netlify app.</p>
        <div className="row">
          <button className="btn" onClick={exportNow}>Export</button>
          <button className="btn ghost" onClick={importNow}>Import</button>
        </div>
        <textarea
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="Export or paste a progress code"
        />
      </Card>
    </main>
  );
}

const learnTabs = [
  { id: "steps", label: "12 Steps" },
  { id: "gloss", label: "Glossary" },
  { id: "pivot", label: "Pivot" },
  { id: "kpis", label: "KPIs" },
  { id: "disc", label: "Discovery" },
  { id: "scripts", label: "Scripts" },
  { id: "kit", label: "Field Kit" }
];

function LearnPage() {
  const { tab = "steps" } = useParams();
  const { state } = useProgress();
  const active = learnTabs.some((item) => item.id === tab) ? tab : "steps";

  return (
    <main className="stack">
      <Tabs items={learnTabs} active={active} base="/learn" />
      {active === "steps" && <StepsLearn />}
      {active === "gloss" && <GlossaryLearn />}
      {active === "pivot" && (state.rank >= 1 ? <PivotLearn /> : <Locked>Pivot Points unlock at Apprentice.</Locked>)}
      {active === "kpis" && <KpisLearn />}
      {active === "disc" && <DiscoveryLearn />}
      {active === "scripts" && <ScriptsLearn />}
      {active === "kit" && <FieldKit />}
    </main>
  );
}

function StepsLearn() {
  return (
    <>
      {STEPS.map((step) => (
        <details className="acc" key={step.n}>
          <summary>
            <span>Step {step.n}: {step.name}</span>
            <span className="tag">{step.time}</span>
          </summary>
          <div className="body">
            <Pill hot>{PHASES[step.n - 1]}</Pill> <Pill>{step.kpis}</Pill>
            <p>{step.task}</p>
            {step.scripts.map((script, index) => <Script key={index}>{script}</Script>)}
            <Notice>{step.coach}</Notice>
          </div>
        </details>
      ))}
    </>
  );
}

function GlossaryLearn() {
  const [query, setQuery] = useState("");
  const results = GLOSSARY.filter((item) =>
    `${item.t} ${item.d}`.toLowerCase().includes(query.toLowerCase())
  );
  return (
    <Card>
      <h2>Glossary</h2>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search terms"
      />
      <div className="list">
        {results.map((item) => (
          <div className="listrow" key={item.t}>
            <b>{item.t}</b>
            <p>{item.d}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function PivotLearn() {
  return (
    <>
      <Card>
        <h2>Diagnose The Objection</h2>
        <p>{DIAG_MODEL}</p>
        {DIAG_STEPS.map((step) => (
          <div className="listrow" key={step.s}>
            <b>{step.s}</b>
            <p>{step.q} {step.m}</p>
          </div>
        ))}
        {DIAG_TOOLS.map((tool) => (
          <Notice key={tool.t}>
            <b>{tool.t}</b>: {tool.say} {tool.when}
          </Notice>
        ))}
        <p className="muted">{DIAG_STOP}</p>
        <p className="muted">{DIAG_TEST}</p>
        <p className="gold">{DIAG_END}</p>
      </Card>
      <Card>
        <h2>Eight Conditions</h2>
        {DIAGNOSE.map((item) => (
          <div className="listrow" key={item.cat}>
            <Pill hot={item.g === "MONEY"}>{item.g}</Pill> <b>{item.cat}</b>
            <p><b>Sounds like:</b> {item.sounds}</p>
            <p><b>Play:</b> {item.play}</p>
          </div>
        ))}
      </Card>
      {SCENARIOS.map((scenario) => (
        <details className="acc" id={`scenario-${scenario.n}`} key={scenario.n}>
          <summary>
            <span>{scenario.n}. {scenario.title}</span>
            <span className="tag">{scenario.kpi}</span>
          </summary>
          <div className="body">
            <p>{scenario.what}</p>
            <ol>
              {scenario.flow.map((item, index) => <li key={index}>{item}</li>)}
            </ol>
            <Notice>{scenario.flag}</Notice>
          </div>
        </details>
      ))}
    </>
  );
}

function KpisLearn() {
  return (
    <Card>
      <h2>22 KPI Scoring Definitions</h2>
      {KPIS.map((kpi, index) => (
        <div className="kpirow" key={kpi.name}>
          <div className="mk">{index + 1}</div>
          <div>
            <b>{kpi.name}</b>
            <p><span className="green">Pass:</span> {kpi.pass}</p>
            <p><span className="red">Fail:</span> {kpi.fail}</p>
          </div>
        </div>
      ))}
    </Card>
  );
}

function DiscoveryLearn() {
  return (
    <Card>
      <h2>Homeowner Discovery Form</h2>
      <ol>
        {DISCOVERY.map((item, index) => <li key={index}>{item}</li>)}
      </ol>
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
          <p className="muted">{item.when}</p>
        </Card>
      ))}
    </>
  );
}

function FieldKit() {
  const [docs, setDocs] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/docs/manifest.json")
      .then((response) => {
        if (!response.ok) throw new Error("Manifest not found");
        return response.json();
      })
      .then(setDocs)
      .catch(() => setError("Field Kit manifest could not be loaded."));
  }, []);

  return (
    <Card>
      <h2>Field Kit</h2>
      {error && <Notice>{error}</Notice>}
      {docs.map((doc) => (
        <a className="doclink" href={`/docs/${doc.file}`} key={doc.file}>
          <b>{doc.name}</b>
          <span>{doc.desc}</span>
        </a>
      ))}
    </Card>
  );
}

const drillTabs = [
  { id: "cards", label: "Flashcards" },
  { id: "live", label: "Partner Drills" },
  { id: "train", label: "Train Weakness" },
  { id: "proto", label: "Protocol" }
];

function DrillPage() {
  const { tab = "cards" } = useParams();
  const { state } = useProgress();
  const active = drillTabs.some((item) => item.id === tab) ? tab : "cards";

  return (
    <main className="stack">
      <Tabs items={drillTabs} active={active} base="/drill" />
      {active === "cards" && <Flashcards />}
      {active === "live" && (state.rank >= 1 ? <PartnerDrills /> : <Locked>Partner Drills unlock at Apprentice.</Locked>)}
      {active === "train" && <TrainWeakness />}
      {active === "proto" && <ProtocolPage />}
    </main>
  );
}

function Flashcards() {
  const { state, dispatch } = useProgress();
  const deck = useMemo(
    () =>
      CARDS.map((card, index) => ({ ...card, index, score: state.cards[index] || 0 }))
        .sort((a, b) => a.score - b.score || a.index - b.index),
    [state.cards]
  );
  const [position, setPosition] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = deck[position % deck.length];

  function mark(nailed) {
    dispatch({ type: "MARK_CARD", index: card.index, nailed });
    setFlipped(false);
    setPosition((value) => value + 1);
  }

  return (
    <Card>
      <h2>Flashcards</h2>
      <p className="muted">Weakest cards appear first. Nail a card twice to master it.</p>
      <button className="flash" onClick={() => setFlipped((value) => !value)}>
        <span className="front">{flipped ? "Answer" : "Prompt"}</span>
        <span className="back">{flipped ? card.b : card.f}</span>
        <span className="muted">Current score: {card.score}/2</span>
      </button>
      <div className="row">
        <button className="btn ghost" onClick={() => mark(false)}>Missed</button>
        <button className="btn" onClick={() => mark(true)}>Nailed</button>
      </div>
    </Card>
  );
}

function PartnerDrills() {
  const { dispatch } = useProgress();
  const navigate = useNavigate();

  return (
    <>
      {DRILLS.map((drill) => (
        <Card key={drill.n}>
          <h2>{drill.n}. {drill.name}</h2>
          <p>{drill.goal}</p>
          <p className="muted">{drill.how}</p>
          {(DRILL_LINKS[drill.n] || []).map((n) => (
            <button
              className="btn ghost small"
              key={n}
              onClick={() => navigate(`/learn/pivot#scenario-${n}`)}
            >
              Scenario {n}
            </button>
          ))}
          <div>
            <button className="btn" onClick={() => dispatch({ type: "LOG_DRILL", n: drill.n })}>
              Log clean set
            </button>
          </div>
        </Card>
      ))}
    </>
  );
}

function TrainWeakness() {
  const { dispatch } = useProgress();
  const [target, setTarget] = useState("");
  const [type, setType] = useState("drill");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState("");

  async function generate() {
    if (!target.trim()) {
      alert("Name a weakness first.");
      return;
    }
    setBusy(true);
    setResult("");
    try {
      const text = await aiComplete(weaknessPrompt(target, type));
      setResult(text);
      dispatch({ type: "COMPLETE_CUSTOM" });
    } catch {
      setResult(AI_NOTICE);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <h2>Train My Weakness</h2>
      {!aiMayWork() && <Notice>{AI_NOTICE}</Notice>}
      <input
        value={target}
        onChange={(event) => setTarget(event.target.value)}
        placeholder="Example: price too much, Step 8 bridge, KPI 15"
      />
      <select value={type} onChange={(event) => setType(event.target.value)}>
        <option value="drill">Drill</option>
        <option value="quiz">Quiz</option>
        <option value="roleplay">Roleplay</option>
      </select>
      <button className="btn block" disabled={busy} onClick={generate}>
        {busy ? "Generating..." : "Generate"}
      </button>
      {result && <pre className="aiout">{result}</pre>}
    </Card>
  );
}

function ProtocolPage() {
  const { state, dispatch } = useProgress();

  return (
    <>
      <Card>
        <h2>Training Protocol</h2>
        <p>{PROTOCOL.motto}</p>
        <Notice>{PROTOCOL.loop}</Notice>
      </Card>
      <Card>
        <h2>Daily 20</h2>
        {PROTOCOL.daily.map((item, index) => (
          <label className="checkrow" key={item}>
            <input
              type="checkbox"
              checked={(state.proto.p1 || []).includes(index)}
              onChange={() => dispatch({ type: "TOGGLE_PROTO_ITEM", list: "p1", value: index })}
            />
            <span>{item}</span>
          </label>
        ))}
      </Card>
      <Card>
        <h2>Rules</h2>
        {PROTOCOL.rules.map((rule) => <p key={rule}>{rule}</p>)}
      </Card>
      <Card>
        <h2>Phases</h2>
        {PROTOCOL.phases.map((phase) => (
          <div className="listrow" key={phase.n}>
            <b>Phase {phase.n}: {phase.name}</b>
            <p>{phase.goal}</p>
          </div>
        ))}
      </Card>
    </>
  );
}

function QuizPage() {
  const { state, dispatch } = useProgress();
  const [qi, setQi] = useState(Math.min(state.rank, QUIZZES.length - 1));
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const quiz = QUIZZES[qi];
  const correct = quiz.qs.filter((question, index) => answers[index] === question.a).length;
  const score = Math.round((correct / quiz.qs.length) * 100);

  function submit() {
    const wrongTopics = quiz.qs
      .filter((question, index) => answers[index] !== question.a)
      .map((question) => question.w || question.q);
    dispatch({ type: "SCORE_QUIZ", qi, score, wrongTopics });
    setSubmitted(true);
  }

  return (
    <main className="stack">
      <Card>
        <h2>Rank Up</h2>
        <select
          value={qi}
          onChange={(event) => {
            setQi(Number(event.target.value));
            setAnswers({});
            setSubmitted(false);
          }}
        >
          {QUIZZES.map((item, index) => (
            <option key={item.name} value={index}>{item.name}</option>
          ))}
        </select>
        <p className="muted">80 percent passes. Failed questions become assigned drills.</p>
        <p>Best: {state.best[qi] || 0}%</p>
      </Card>

      {quiz.qs.map((question, index) => (
        <Card key={`${question.q}-${index}`}>
          <h3>{index + 1}. {question.q}</h3>
          {question.o.map((option, oi) => (
            <button
              className={cx(
                "qopt",
                answers[index] === oi && "sel",
                submitted && question.a === oi && "right",
                submitted && answers[index] === oi && question.a !== oi && "wrong"
              )}
              key={option}
              onClick={() => !submitted && setAnswers({ ...answers, [index]: oi })}
            >
              {option}
            </button>
          ))}
          {submitted && question.w && <p className="muted">{question.w}</p>}
        </Card>
      ))}

      <Card>
        {!submitted ? (
          <button
            className="btn block"
            disabled={Object.keys(answers).length < quiz.qs.length}
            onClick={submit}
          >
            Submit Exam
          </button>
        ) : (
          <div className="center">
            <div className={cx("big", score >= 80 ? "green" : "red")}>{score}%</div>
            <p>{score >= 80 ? "Passed. Rank unlocked." : "Not yet. Drill the misses and retake."}</p>
          </div>
        )}
      </Card>
    </main>
  );
}

function BotPage() {
  const [messages, setMessages] = useState([
    { who: "bot", text: "Ask me from the playbook. I will route answers back to steps, KPIs, and drills." }
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  async function send() {
    if (!input.trim()) return;
    const next = [...messages, { who: "user", text: input.trim() }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const hist = next.map((m) => `${m.who.toUpperCase()}: ${m.text}`).join("\n");
      const text = await aiComplete(`${kbPrompt()}\n\n=== CONVERSATION ===\n${hist}\nCOACH:`);
      setMessages([...next, { who: "bot", text }]);
    } catch {
      setMessages([...next, { who: "bot", text: AI_NOTICE }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="stack">
      <Card>
        <h2>Panda Bot</h2>
        {!aiMayWork() && <Notice>{AI_NOTICE}</Notice>}
        <div className="chat">
          {messages.map((message, index) => (
            <div className={cx("msg", message.who)} key={index}>{message.text}</div>
          ))}
        </div>
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask about a step, KPI, objection, or drill"
        />
        <button className="btn block" disabled={busy} onClick={send}>
          {busy ? "Thinking..." : "Send"}
        </button>
      </Card>
    </main>
  );
}

function parseGrade(text) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < start) throw new Error("No JSON returned");
  return JSON.parse(text.slice(start, end + 1));
}

function GradePage() {
  const { state, dispatch } = useProgress();
  const [transcript, setTranscript] = useState("");
  const [busy, setBusy] = useState(false);
  const grade = state.lastGrade;

  async function gradeCall() {
    if (transcript.trim().length < 200) {
      alert("Paste the full transcript. Short snippets cannot be graded against 22 KPIs.");
      return;
    }
    setBusy(true);
    try {
      const text = await aiComplete(gradePrompt(transcript));
      dispatch({ type: "RECORD_GRADE", grade: parseGrade(text) });
    } catch {
      alert(AI_NOTICE);
    } finally {
      setBusy(false);
    }
  }

  if (state.rank < 2) {
    return (
      <main className="stack">
        <Locked>Grade My Call unlocks at Closer. Earn the right by passing the Closer exam.</Locked>
      </main>
    );
  }

  return (
    <main className="stack">
      <Card>
        <h2>Grade My Call</h2>
        {!aiMayWork() && <Notice>{AI_NOTICE}</Notice>}
        <textarea
          value={transcript}
          onChange={(event) => setTranscript(event.target.value)}
          placeholder="Paste full appointment transcript"
        />
        <button className="btn block" disabled={busy} onClick={gradeCall}>
          {busy ? "Grading..." : "Grade it"}
        </button>
      </Card>

      {grade && (
        <Card>
          <h2>Scorecard: {grade.overall ?? "N/A"}%</h2>
          <p>{grade.summary}</p>
          {grade.whereDealDied && <Notice><b>Where the deal died:</b> {grade.whereDealDied}</Notice>}
          {(grade.kpis || []).map((kpi) => (
            <div className="kpirow" key={kpi.n}>
              <div className="mk">{kpi.n}</div>
              <div>
                <b className={kpi.status === "pass" ? "green" : kpi.status === "fail" ? "red" : "gold"}>
                  {kpi.status}
                </b>
                <p>{kpi.note}</p>
              </div>
            </div>
          ))}
        </Card>
      )}
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
