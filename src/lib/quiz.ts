import { QUESTIONS, Question, questionsFor } from '../data/questions';
import { MODULES } from '../data/content';
import { VERBS, Verb } from '../data/verbs';

export function normalize(s: string) {
  return s.toLowerCase().replace(/[’‘`]/g, "'")
    .replace(/\bwon't\b/g, 'will not').replace(/\bcan't\b/g, 'cannot').replace(/\bshan't\b/g, 'shall not')
    .replace(/n't\b/g, ' not').replace(/'m\b/g, ' am').replace(/'re\b/g, ' are').replace(/'ve\b/g, ' have').replace(/'ll\b/g, ' will')
    .replace(/[.?!,;:"]/g, ' ').replace(/\s+/g, ' ').trim();
}
export function isCorrect(q: Question, given: string): boolean {
  if (['mcq', 'tf', 'identify', 'listen'].includes(q.type)) return given === q.answer;
  if (q.type === 'match') return given === q.answer;
  const ok = [q.answer, ...(q.accept ?? [])].map(normalize);
  return ok.includes(normalize(given));
}

export function rng(seed: number) { let s = seed >>> 0 || 1; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
export function shuffle<T>(a: T[], r: () => number = Math.random): T[] { const x = [...a]; for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; }
export const dateSeed = (d = new Date()) => d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();

/** Picks n questions with a mix of types; shuffles answer choices (except true/false). */
export function pickQuestions(pool: Question[], n: number, r: () => number = Math.random): Question[] {
  const byType: Record<string, Question[]> = {};
  for (const q of shuffle(pool, r)) (byType[q.type] ??= []).push(q);
  const out: Question[] = []; const types = shuffle(Object.keys(byType), r);
  while (out.length < n && types.some((t) => byType[t].length)) for (const t of types) { const q = byType[t].shift(); if (q && out.length < n) out.push(q); }
  return out.map((q) => prep(q, r));
}
export const prep = (q: Question, r: () => number = Math.random): Question =>
  q.choices && q.type !== 'tf' ? { ...q, choices: shuffle(q.choices, r) } : q;

export const lessonQuiz = (lesson: string) => pickQuestions(questionsFor(lesson), 8);
export function moduleQuiz(moduleId: string) {
  const m = MODULES.find((x) => x.id === moduleId)!;
  const pool = QUESTIONS.filter((q) => m.lessons.some((l) => l.id === q.lesson));
  return pickQuestions(pool, 18);
}
/** Final assessment: ~50 questions spread across every module. */
export function finalQuiz() {
  const mods = MODULES.filter((m) => m.id !== 'm10');
  const per = Math.ceil(50 / mods.length);
  const out: Question[] = [];
  for (const m of mods) out.push(...pickQuestions(QUESTIONS.filter((q) => m.lessons.some((l) => l.id === q.lesson) && q.type !== 'listen'), per));
  out.push(...pickQuestions(QUESTIONS.filter((q) => q.id.startsWith('mix-')), 5));
  return shuffle(out).slice(0, 50);
}
export const mixedChallenge = () => pickQuestions(QUESTIONS.filter((q) => q.id.startsWith('mix-') || q.id.startsWith('perf-') || q.id.startsWith('fut-') || q.id.startsWith('g-li-')), 10);
export const dailyChallenge = () => pickQuestions(QUESTIONS.filter((q) => q.level <= 2 && q.type !== 'listen'), 5, rng(dateSeed()));

/** A short quiz about one verb, generated from the verb's validated forms. */
export function verbQuiz(v: Verb): Question[] {
  const others = VERBS.filter((x) => x.base !== v.base);
  const r = rng(v.base.length * 97 + v.base.charCodeAt(0));
  const mean = shuffle(others, r).slice(0, 3).map((x) => x.ar);
  const base = { lesson: 'verb-forms', level: 1 as const, rule: 'verb-forms' };
  const qs: Question[] = [
    { ...base, id: `vq-${v.base}-ar`, type: 'mcq', cat: 'vocabulary', prompt: `What does "${v.base}" mean?`, promptAr: `ما معنى "${v.base}"؟`, choices: [v.ar, ...mean], answer: v.ar, en: `${v.base} = ${v.ar}`, ar: `${v.base} تعني ${v.ar}` },
    { ...base, id: `vq-${v.base}-s3`, type: 'fill', cat: 's-es', prompt: `He/she/it form of "${v.base}" (present simple).`, text: `He ___ ${v.comp}.`, answer: v.s3, en: `He ${v.s3}.`, ar: `مع he نستخدم ${v.s3}.` },
    { ...base, id: `vq-${v.base}-ing`, type: 'fill', cat: 'structure', prompt: `-ing form of "${v.base}".`, text: `I am ___ ${v.comp}.`, answer: v.ing, en: `${v.base} → ${v.ing}`, ar: `${v.base} ← ${v.ing}` },
  ];
  if (v.base !== 'be') {
    const w2 = [v.base + (v.base.endsWith('e') ? 'd' : 'ed'), v.ing, v.s3].filter((x, i, a) => x !== v.v2 && a.indexOf(x) === i).slice(0, 3);
    qs.push({ ...base, id: `vq-${v.base}-v2`, type: 'mcq', cat: 'past-form', prompt: `Past simple (V2) of "${v.base}"?`, choices: [v.v2, ...w2], answer: v.v2, en: `${v.base} – ${v.v2} – ${v.v3}${v.irregular ? ' (irregular)' : ' (regular)'}`, ar: v.irregular ? 'فعل شاذ' : 'فعل منتظم' });
    qs.push({ ...base, id: `vq-${v.base}-v3`, type: 'fill', cat: 'participle', prompt: `Past participle (V3) of "${v.base}".`, text: `I have ___ ${v.comp}.`, answer: v.v3, en: `have + V3: ${v.v3}`, ar: `have + التصريف الثالث: ${v.v3}` });
  }
  return qs.map((q) => prep(q, r));
}
