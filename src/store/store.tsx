// Learner progress, saved in localStorage. All statistics shown in the app come from this state only.
// The shape is versioned and plain JSON so it can later be synced to a server account without changes.
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { MistakeCat } from '../data/questions';

export type LangMode = 'en' | 'en-ar' | 'ar-en';
export interface QuizRecord { id: string; kind: 'lesson' | 'module' | 'final' | 'daily' | 'mistakes' | 'custom' | 'mixed' | 'verb'; ref: string; title: string; score: number; total: number; pct: number; date: number; mode: 'practice' | 'exam'; cats: Record<string, [number, number]> }
export interface AnswerStat { right: number; wrong: number; last: number; lastRight: boolean }
export interface MistakeRec { qid: string; given: string; date: number; cat: MistakeCat; lesson: string; streak: number; due: number; mastered: boolean; times: number }
export interface State {
  v: 1;
  settings: { lang: LangMode; hideArabic: boolean; autoTime: boolean; contracted: boolean; sidebar: boolean; rate: number };
  lessons: Record<string, { visited: number; completed?: number; best?: number; attempts: number }>;
  quizzes: QuizRecord[];
  answers: Record<string, AnswerStat>;
  mistakes: Record<string, MistakeRec>;
  verbs: { fav: string[]; learned: string[]; practice: string[] };
  activity: Record<string, number>; // yyyy-mm-dd → answers given
  last?: { page: string; ts: number };
  daily: Record<string, number>; // date → score of daily challenge
}

const KEY = 'efel-progress-v1';
export const initialState = (): State => ({
  v: 1,
  settings: { lang: 'en-ar', hideArabic: false, autoTime: false, contracted: false, sidebar: true, rate: 0.9 },
  lessons: {}, quizzes: [], answers: {}, mistakes: {}, verbs: { fav: [], learned: [], practice: [] }, activity: {}, daily: {},
});

export const today = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const DAY = 86400000;
const INTERVALS = [1, 3, 7]; // days until a corrected mistake is reviewed again

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initialState();
    return migrate(JSON.parse(raw));
  } catch { return initialState(); }
}
export function migrate(x: any): State {
  const base = initialState();
  if (!x || x.v !== 1) return base;
  return { ...base, ...x, settings: { ...base.settings, ...x.settings }, verbs: { ...base.verbs, ...x.verbs } };
}

interface Ctx {
  s: State;
  set: (f: (s: State) => State) => void;
  storageOk: boolean;
  recordAnswer: (q: { id: string; cat: MistakeCat; lesson: string }, given: string, right: boolean) => void;
  recordQuiz: (r: Omit<QuizRecord, 'id' | 'date'>) => void;
  visit: (page: string, lesson?: string) => void;
  toggleVerb: (list: 'fav' | 'learned' | 'practice', base: string, on?: boolean) => void;
  completeLesson: (id: string, score?: number) => void;
}
const C = createContext<Ctx>(null as unknown as Ctx);
export const useStore = () => useContext(C);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [s, setS] = useState<State>(load);
  const storageOk = useRef(true);
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { storageOk.current = false; }
  }, [s]);
  const api = useMemo<Ctx>(() => ({
    s, set: setS, storageOk: storageOk.current,
    recordAnswer: (q, given, right) => setS((p) => {
      const now = Date.now();
      const a = p.answers[q.id] ?? { right: 0, wrong: 0, last: 0, lastRight: false };
      const answers = { ...p.answers, [q.id]: { right: a.right + (right ? 1 : 0), wrong: a.wrong + (right ? 0 : 1), last: now, lastRight: right } };
      const mistakes = { ...p.mistakes };
      const m = mistakes[q.id];
      if (!right) mistakes[q.id] = { qid: q.id, given, date: now, cat: q.cat, lesson: q.lesson, streak: 0, due: now, mastered: false, times: (m?.times ?? 0) + 1 };
      else if (m && !m.mastered) {
        const streak = m.streak + 1;
        mistakes[q.id] = { ...m, streak, due: now + INTERVALS[Math.min(streak - 1, 2)] * DAY, mastered: streak >= 2 };
      }
      const d = today();
      return { ...p, answers, mistakes, activity: { ...p.activity, [d]: (p.activity[d] ?? 0) + 1 } };
    }),
    recordQuiz: (r) => setS((p) => {
      const rec: QuizRecord = { ...r, id: Math.random().toString(36).slice(2, 10), date: Date.now() };
      const lessons = { ...p.lessons };
      const lid = r.kind === 'lesson' ? r.ref : r.kind === 'final' ? 'final' : '';
      if (lid) {
        const l = lessons[lid] ?? { visited: Date.now(), attempts: 0 };
        lessons[lid] = { ...l, attempts: l.attempts + 1, completed: l.completed ?? Date.now(), best: Math.max(l.best ?? 0, r.pct) };
      }
      const daily = r.kind === 'daily' ? { ...p.daily, [today()]: r.pct } : p.daily;
      return { ...p, quizzes: [...p.quizzes, rec].slice(-300), lessons, daily };
    }),
    visit: (page, lesson) => setS((p) => {
      const lessons = lesson && !p.lessons[lesson] ? { ...p.lessons, [lesson]: { visited: Date.now(), attempts: 0 } } : p.lessons;
      const nav = ['dashboard', 'progress', 'quizzes', 'mistakes', 'quiz', 'roadmap'].includes(page);
      return { ...p, last: nav ? p.last : { page, ts: Date.now() }, lessons };
    }),
    toggleVerb: (list, base, on) => setS((p) => {
      const cur = p.verbs[list];
      const has = cur.includes(base);
      const want = on ?? !has;
      const next = want ? (has ? cur : [...cur, base]) : cur.filter((x) => x !== base);
      return { ...p, verbs: { ...p.verbs, [list]: next } };
    }),
    completeLesson: (id, score) => setS((p) => {
      const l = p.lessons[id] ?? { visited: Date.now(), attempts: 0 };
      return { ...p, lessons: { ...p.lessons, [id]: { ...l, completed: l.completed ?? Date.now(), best: score != null ? Math.max(l.best ?? 0, score) : l.best } } };
    }),
  }), [s]);
  return <C.Provider value={api}>{children}</C.Provider>;
}

export function streakOf(activity: Record<string, number>) {
  let n = 0; const d = new Date();
  if (!activity[today(d)]) d.setDate(d.getDate() - 1); // today not started yet: count from yesterday
  while (activity[today(d)]) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
