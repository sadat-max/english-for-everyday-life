// Local search index over lessons, verbs, grammar rules and examples.
// The English Assistant uses the same index through the AssistantProvider interface, so a real AI
// provider can replace LocalAssistant later without changing the UI.
import { TENSES } from '../data/tenses';
import { VERBS } from '../data/verbs';
import { HELPERS, TIME_EXPR, ALL_LESSONS, SPELLING } from '../data/content';

export interface Hit { kind: 'Lesson' | 'Tense' | 'Verb' | 'Rule' | 'Time expression' | 'Example'; title: string; sub: string; ar?: string; page: string; verb?: string; anchor?: string }

const PAGES: Hit[] = [
  { kind: 'Lesson', title: 'Subjects & Pronouns', sub: 'I, you, he, she, it, we, they, names and nouns', ar: 'الفاعل والضمائر', page: 'subjects' },
  { kind: 'Lesson', title: 'Helping Verbs', sub: 'am, is, are, do, does, did, have, has, had, will', ar: 'الأفعال المساعدة', page: 'helping' },
  { kind: 'Lesson', title: 'S / ES / IES Rules', sub: 'He works, he watches, he studies', ar: 'قواعد إضافة s', page: 'sesies' },
  { kind: 'Lesson', title: 'Time Expressions', sub: 'every day, yesterday, since, for, already, yet', ar: 'تعبيرات الزمن', page: 'time' },
  { kind: 'Lesson', title: 'Perfect Tenses', sub: 'have/has/had/will have + V3', ar: 'الأزمنة التامة', page: 'perfect' },
  { kind: 'Lesson', title: 'Tense Comparison', sub: 'Compare tenses side by side', ar: 'مقارنة الأزمنة', page: 'compare' },
  { kind: 'Lesson', title: 'Sentence Structure', sub: 'Labelled diagram: subject, helping verb, main verb, object, time', ar: 'تركيب الجملة', page: 'structure' },
  { kind: 'Lesson', title: 'Sentence Builder', sub: 'Build correct sentences', ar: 'بناء الجمل', page: 'builder' },
  { kind: 'Lesson', title: 'Everyday Conversations', sub: 'Business and daily dialogues', ar: 'المحادثات', page: 'conversations' },
  { kind: 'Lesson', title: 'Quick Reference', sub: 'Printable grammar summary', ar: 'المرجع السريع', page: 'reference' },
];

let INDEX: Hit[] | null = null;
function index(): Hit[] {
  if (INDEX) return INDEX;
  const h: Hit[] = [...PAGES];
  for (const t of TENSES) h.push({ kind: 'Tense', title: t.en, sub: t.def, ar: t.ar, page: t.id });
  for (const l of ALL_LESSONS) if (!h.find((x) => x.page === l.page && x.title === l.en)) h.push({ kind: 'Lesson', title: l.en, sub: 'Lesson', ar: l.ar, page: l.page });
  for (const v of VERBS) h.push({ kind: 'Verb', title: v.base, sub: `${v.base} – ${v.v2} – ${v.v3} · ${v.ing} · ${v.s3}`, ar: v.ar, page: 'verbs', verb: v.base });
  for (const x of HELPERS) h.push({ kind: 'Rule', title: x.words, sub: x.en, ar: x.ar, page: 'helping', anchor: `h-${x.id}` });
  for (const x of TIME_EXPR) h.push({ kind: 'Time expression', title: x.en, sub: x.ex, ar: x.ar, page: 'time' });
  for (const r of [...SPELLING.ed, ...SPELLING.ing]) h.push({ kind: 'Rule', title: r.rule, sub: r.ex.join(', '), ar: r.ar, page: 'sesies' });
  for (const t of TENSES) for (const m of t.mistakes) h.push({ kind: 'Rule', title: m.right, sub: `Not: ${m.wrong} — ${m.en}`, ar: m.ar, page: t.id, anchor: 'mistakes' });
  for (const t of TENSES) for (const e of t.examples) h.push({ kind: 'Example', title: e.en, sub: `${t.en} · ${e.topic}`, ar: e.ar, page: t.id, anchor: 'examples' });
  INDEX = h;
  return h;
}

export function search(q: string, limit = 24): Hit[] {
  const s = q.trim().toLowerCase();
  if (s.length < 2) return [];
  const words = s.split(/\s+/);
  const scored: [number, Hit][] = [];
  for (const h of index()) {
    const t = h.title.toLowerCase(); const hay = `${t} ${h.sub.toLowerCase()} ${h.ar ?? ''}`;
    if (!words.every((w) => hay.includes(w))) continue;
    let sc = 0;
    if (t === s) sc += 100; else if (t.startsWith(s)) sc += 50; else if (t.includes(s)) sc += 20;
    if (h.kind === 'Verb' && h.sub.toLowerCase().split(/[\s–·/]+/).includes(s)) sc += 70;
    sc += { Lesson: 8, Tense: 9, Verb: 6, Rule: 5, 'Time expression': 5, Example: 0 }[h.kind];
    scored.push([sc, h]);
  }
  return scored.sort((a, b) => b[0] - a[0]).slice(0, limit).map((x) => x[1]);
}

// ── Assistant provider interface ──
export interface AssistantProvider { name: string; isAI: boolean; ask(query: string): Promise<Hit[]> }
export const LocalAssistant: AssistantProvider = { name: 'Course content (offline)', isAI: false, ask: async (q) => search(q, 8) };
