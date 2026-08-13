import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { loadStoredProgress, saveStoredProgress } from "../lib/storage.js";

const ProgressContext = createContext(null);

function freshProto() {
  return { phase: 1, p1: [], anchors: {}, d12: {}, weekly: [] };
}

const initialProgress = {
  rank: 0,
  best: {},
  cards: {},
  drills: {},
  assignments: [],
  kpiStats: {},
  scenStats: {},
  customDone: 0,
  proto: freshProto(),
  lastGrade: null
};

function normalize(data = {}) {
  return {
    ...initialProgress,
    rank: data.rank || 0,
    best: data.best || {},
    cards: data.cards || {},
    drills: data.drills || {},
    assignments: data.assignments || [],
    kpiStats: data.kpiStats || {},
    scenStats: data.scenStats || {},
    customDone: data.customDone || 0,
    proto: data.proto || freshProto(),
    lastGrade: data.lastGrade || null
  };
}

function snapshot(state) {
  return {
    rank: state.rank,
    best: state.best,
    cards: state.cards,
    drills: state.drills,
    assignments: state.assignments,
    kpiStats: state.kpiStats,
    scenStats: state.scenStats,
    customDone: state.customDone,
    proto: state.proto
  };
}

function bumpBucket(bucket, key, field) {
  const prev = bucket[key] || { pass: 0, partial: 0, fail: 0 };
  return { ...bucket, [key]: { ...prev, [field]: (prev[field] || 0) + 1 } };
}

function reducer(state, action) {
  switch (action.type) {
    case "IMPORT":
      return normalize(action.payload);
    case "ADD_ASSIGNMENT":
      return {
        ...state,
        assignments: [
          ...state.assignments,
          { done: false, sets: 2, ...action.assignment }
        ]
      };
    case "DONE_ASSIGNMENT":
      return {
        ...state,
        assignments: state.assignments.map((item, index) =>
          index === action.index ? { ...item, done: !item.done } : item
        )
      };
    case "MARK_CARD": {
      const current = state.cards[action.index] || 0;
      return {
        ...state,
        cards: {
          ...state.cards,
          [action.index]: action.nailed ? current + 1 : 0
        }
      };
    }
    case "LOG_DRILL":
      return {
        ...state,
        drills: {
          ...state.drills,
          [action.n]: (state.drills[action.n] || 0) + 1
        }
      };
    case "SET_BEST":
      return {
        ...state,
        best: {
          ...state.best,
          [action.qi]: Math.max(state.best[action.qi] || 0, action.score)
        }
      };
    case "CLAIM_RANK":
      return {
        ...state,
        rank: Math.max(state.rank, Math.min(3, state.rank + 1))
      };
    case "SCORE_QUIZ": {
      const best = Math.max(state.best[action.qi] || 0, action.score);
      const passed = action.score >= 80;
      return {
        ...state,
        rank: passed ? Math.max(state.rank, Math.min(3, action.qi + 1)) : state.rank,
        best: { ...state.best, [action.qi]: best },
        assignments:
          action.wrongTopics.length === 0
            ? state.assignments
            : [
                ...state.assignments,
                ...action.wrongTopics.slice(0, 3).map((topic) => ({
                  name: topic,
                  why: "Missed on rank exam",
                  sets: 2,
                  done: false
                }))
              ]
      };
    }
    case "RECORD_GRADE": {
      let kpiStats = state.kpiStats;
      let scenStats = state.scenStats;
      (action.grade.kpis || []).forEach((kpi) => {
        const status = ["pass", "partial", "fail"].includes(kpi.status)
          ? kpi.status
          : "partial";
        kpiStats = bumpBucket(kpiStats, kpi.n, status);
      });
      (action.grade.scenarios || []).forEach((n) => {
        const prev = scenStats[n] || { count: 0, fail: 0 };
        scenStats = { ...scenStats, [n]: { count: prev.count + 1, fail: prev.fail + 1 } };
      });
      return {
        ...state,
        lastGrade: action.grade,
        kpiStats,
        scenStats,
        assignments: [
          ...state.assignments,
          ...(action.grade.drills || []).slice(0, 2).map((drill) => ({
            name: drill.name || "Assigned drill",
            why: drill.why || "Assigned from graded call",
            sets: drill.sets || 2,
            done: false
          }))
        ]
      };
    }
    case "COMPLETE_CUSTOM":
      return { ...state, customDone: state.customDone + 1 };
    case "TOGGLE_PROTO_ITEM": {
      const list = state.proto[action.list] || [];
      const next = list.includes(action.value)
        ? list.filter((item) => item !== action.value)
        : [...list, action.value];
      return { ...state, proto: { ...state.proto, [action.list]: next } };
    }
    case "ADVANCE_PROTO":
      return {
        ...state,
        proto: {
          ...state.proto,
          phase: Math.min(4, (state.proto.phase || 1) + 1)
        }
      };
    case "LOG_RECALL": {
      const p1 = state.proto.p1 || [];
      return p1.includes(action.date)
        ? state
        : { ...state, proto: { ...state.proto, p1: [...p1, action.date] } };
    }
    case "INC_ANCHOR": {
      const anchors = state.proto.anchors || {};
      return {
        ...state,
        proto: {
          ...state.proto,
          anchors: {
            ...anchors,
            [action.index]: (anchors[action.index] || 0) + 1
          }
        }
      };
    }
    case "SET_D12":
      return {
        ...state,
        proto: {
          ...state.proto,
          d12: { ...(state.proto.d12 || {}), [action.n]: true }
        }
      };
    case "LOG_WEEKLY":
      return {
        ...state,
        proto: {
          ...state.proto,
          weekly: [
            ...(state.proto.weekly || []),
            { d: action.n, t: action.date }
          ]
        }
      };
    default:
      return state;
  }
}

export function ProgressProvider({ children }) {
  const [state, dispatch] = useReducer(
    reducer,
    undefined,
    () => normalize(loadStoredProgress() || {})
  );

  useEffect(() => {
    saveStoredProgress(snapshot(state));
  }, [state]);

  const value = useMemo(
    () => ({ state, dispatch, snapshot: () => snapshot(state) }),
    [state]
  );

  return (
    <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
  );
}

export function useProgress() {
  const value = useContext(ProgressContext);
  if (!value) throw new Error("useProgress must be used inside ProgressProvider");
  return value;
}
