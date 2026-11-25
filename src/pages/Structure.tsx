// Sentence Structure: a labelled diagram of a sentence — each part in a box, an arrow down to its name,
// and a bar across the top naming the tense. Built on the grammar engine, so every sentence is correct.
import React, { useEffect, useMemo, useState } from 'react';
import { Network, Shuffle, Eye, EyeOff, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { SUBJECTS, SUBJECT_MAP, FORMS, Form, build, parseTense, Token, Subject } from '../engine/grammar';
import { arabicSentence, AR_VERBS } from '../engine/arabic';
import { VERBS, VERB_MAP, Verb } from '../data/verbs';
import { TENSES_BY_ORDER, TENSE_MAP } from '../data/tenses';
import { BUILDER_TIMES } from './Tools';
import { useStore } from '../store/store';
import { useNav } from '../lib/nav';
import { Btn, Chip, HUE, Hue, PageHead, Section, Select, Speak, Tr, cx, hueOfTense, ArLabel } from '../lib/ui';

type PartName = 'Subject' | 'Helping verb' | 'Negative' | 'Main verb' | 'Object' | 'Place' | 'Complement' | 'Time expression';
const PART: Record<PartName, { ar: string; hue: Hue; short: string }> = {
  Subject: { ar: 'الفاعل', hue: 'teal', short: 'S' },
  'Helping verb': { ar: 'الفعل المساعد', hue: 'blue', short: 'HV' },
  Negative: { ar: 'أداة النفي', hue: 'red', short: 'not' },
  'Main verb': { ar: 'الفعل الرئيسي', hue: 'indigo', short: 'V' },
  Object: { ar: 'المفعول به', hue: 'purple', short: 'O' },
  Place: { ar: 'المكان', hue: 'green', short: 'Place' },
  Complement: { ar: 'التكملة', hue: 'purple', short: 'C' },
  'Time expression': { ar: 'تعبير الزمن', hue: 'amber', short: 'Time' },
};

interface Part { text: string; name: PartName; detail: string; detailAr: string; verbGroup: boolean }
const PRONOUNS = ['I', 'you', 'he', 'she', 'it', 'we', 'they'];
const PREP = /^(to|at|in|into|on|from|for|with|near|around|by|under|over)\b/i;

function subjectDetail(s: Subject): [string, string] {
  if (PRONOUNS.includes(s.id)) return [`Subject pronoun · ${s.kind.toLowerCase()}`, `ضمير فاعل · ${s.kindAr}`];
  if (s.id === 'ali' || s.id === 'sara') return [`A name · follows the rules of “${s.pron}”`, `اسم علم · يأخذ قواعد ${s.pron}`];
  if (s.id === 'aliomar') return ['Two names · follow the rules of “they”', 'اسمان · يأخذان قواعد they'];
  return [`Noun · follows the rules of “${s.pron}”`, `اسم · يأخذ قواعد ${s.pron}`];
}
function auxDetail(w: string, subj: string): [string, string] {
  const x = w.toLowerCase();
  if (['am', 'is', 'are'].includes(x)) return [`“be” in the present · agrees with “${subj}”`, `فعل be في المضارع · يتوافق مع ${subj}`];
  if (['was', 'were'].includes(x)) return [`“be” in the past · agrees with “${subj}”`, `فعل be في الماضي · يتوافق مع ${subj}`];
  if (['do', 'does'].includes(x)) return [`“${x}” makes questions and negatives in the present`, `${x} لتكوين السؤال والنفي في المضارع`];
  if (x === 'did') return ['“did” shows the past in questions and negatives', 'did تدل على الماضي في السؤال والنفي'];
  if (['have', 'has'].includes(x)) return [`“${x}” + V3 makes a perfect tense (present)`, `${x} + التصريف الثالث = زمن تام (مضارع)`];
  if (x === 'had') return ['“had” + V3 makes the past perfect', 'had + التصريف الثالث = الماضي التام'];
  if (x === 'will') return ['“will” shows the future', 'will تدل على المستقبل'];
  if (x === 'been') return ['“been” (V3 of be) + V-ing = perfect continuous', 'been + ing = تام مستمر'];
  if (x === 'be') return ['“be” after will + V-ing = continuous', 'be بعد will مع ing = مستمر'];
  return ['Helping verb', 'فعل مساعد'];
}
function negDetail(w: string): [string, string] {
  const x = w.toLowerCase();
  if (x === 'not') return ['“not” makes the sentence negative', 'not تجعل الجملة منفية'];
  const full: Record<string, string> = { "don't": 'do not', "doesn't": 'does not', "didn't": 'did not', "isn't": 'is not', "aren't": 'are not', "wasn't": 'was not', "weren't": 'were not', "haven't": 'have not', "hasn't": 'has not', "hadn't": 'had not', "won't": 'will not' };
  return [`Helping verb + not, short form of “${full[x] ?? x}”`, `فعل مساعد + نفي، اختصار ${full[x] ?? x}`];
}
function verbDetail(w: string, v: Verb, prev: string | undefined): [string, string] {
  const x = w.toLowerCase(); const p = prev?.toLowerCase();
  const afterHave = !!p && ['have', 'has', 'had', "haven't", "hasn't", "hadn't"].includes(p);
  if (x === v.ing) return ['V-ing · the action is in progress', 'الفعل + ing · حدث مستمر'];
  if (afterHave && x === v.v3) return ['V3 (past participle) after have/has/had', 'التصريف الثالث بعد have/has/had'];
  if (x === v.s3 && x !== v.base) return ['V1 + s/es · for he, she, it or one name', 'الفعل + s/es مع المفرد الغائب'];
  if (v.v2.split('/').includes(x) && !p) return [`V2 (past) · ${v.irregular ? 'irregular' : 'regular, + ed'}`, `التصريف الثاني · ${v.irregular ? 'فعل شاذ' : 'منتظم'}`];
  if (x === v.base) return [p ? `V1 (base form) after “${p}”` : 'V1 (base form)', 'الفعل في صورته الأساسية'];
  return ['Main verb', 'الفعل الرئيسي'];
}

/** Turns engine tokens into labelled parts. Punctuation is attached to the last part. */
function analyse(tokens: Token[], s: Subject, v: Verb, isBe: boolean): Part[] {
  const out: Part[] = [];
  let prevVerbWord: string | undefined;
  for (const tk of tokens) {
    if (tk.r === 'punct') { if (out.length) out[out.length - 1].text += tk.t; continue; }
    if (tk.r === 'subject') { const [d, a] = subjectDetail(s); out.push({ text: tk.t, name: 'Subject', detail: d, detailAr: a, verbGroup: false }); continue; }
    if (tk.r === 'aux' || (tk.r === 'verb' && isBe && ['am', 'is', 'are', 'was', 'were'].includes(tk.t.toLowerCase()))) {
      const [d, a] = auxDetail(tk.t, s.id === 'I' ? 'I' : s.en);
      if (tk.r === 'verb') out.push({ text: tk.t, name: 'Main verb', detail: `“be” is the main verb here · agrees with “${s.id === 'I' ? 'I' : s.en}”`, detailAr: 'be هو الفعل الرئيسي هنا', verbGroup: true });
      else out.push({ text: tk.t, name: 'Helping verb', detail: d, detailAr: a, verbGroup: true });
      prevVerbWord = tk.t; continue;
    }
    if (tk.r === 'neg') { const [d, a] = negDetail(tk.t); out.push({ text: tk.t, name: 'Negative', detail: d, detailAr: a, verbGroup: true }); prevVerbWord = tk.t; continue; }
    if (tk.r === 'verb') { const [d, a] = verbDetail(tk.t, v, prevVerbWord); out.push({ text: tk.t, name: 'Main verb', detail: d, detailAr: a, verbGroup: true }); continue; }
    if (tk.r === 'comp') {
      if (isBe) out.push({ text: tk.t, name: 'Complement', detail: 'Describes the subject', detailAr: 'يصف الفاعل', verbGroup: false });
      else if (PREP.test(tk.t)) out.push({ text: tk.t, name: 'Place', detail: 'Where? · a phrase that starts with a preposition', detailAr: 'أين؟ · شبه جملة تبدأ بحرف جر', verbGroup: false });
      else out.push({ text: tk.t, name: 'Object', detail: 'What? / Whom? · receives the action', detailAr: 'ماذا؟ / من؟ · يقع عليه الفعل', verbGroup: false });
      continue;
    }
    if (tk.r === 'time') out.push({ text: tk.t, name: 'Time expression', detail: 'When? · a clue to the tense', detailAr: 'متى؟ · قرينة على الزمن', verbGroup: false });
  }
  return out;
}

interface Example { s: string; v: string; t: string; f: Form; comp?: string; time?: string; ar: string }
const EXAMPLES: Example[] = [
  { s: 'I', v: 'go', t: 'present-continuous', f: 'aff', comp: 'to the office', ar: 'أنا ذاهب إلى المكتب.' },
  { s: 'she', v: 'work', t: 'present-simple', f: 'aff', comp: 'in a bank', time: 'every day', ar: 'هي تعمل في بنك كل يوم.' },
  { s: 'they', v: 'finish', t: 'present-perfect', f: 'aff', comp: 'the report', ar: 'لقد أنهوا التقرير.' },
  { s: 'you', v: 'call', t: 'past-simple', f: 'q', comp: 'the supplier', time: 'yesterday', ar: 'هل اتصلت بالمورد أمس؟' },
  { s: 'he', v: 'travel', t: 'future-simple', f: 'neg', comp: 'to London', time: 'next week', ar: 'هو لن يسافر إلى لندن الأسبوع القادم.' },
  { s: 'aliomar', v: 'wait', t: 'past-continuous', f: 'aff', comp: 'for the bus', ar: 'كان علي وعمر ينتظران الحافلة.' },
  { s: 'manager', v: 'sign', t: 'past-perfect', f: 'aff', comp: 'the contract', time: 'before the meeting', ar: 'كان المدير قد وقّع العقد قبل الاجتماع.' },
  { s: 'company', v: 'sell', t: 'present-simple', f: 'neg', comp: 'cars', ar: 'شركتي لا تبيع السيارات.' },
  { s: 'we', v: 'work', t: 'present-perfect-continuous', f: 'aff', comp: 'on this project', time: 'for two hours', ar: 'نحن نعمل على هذا المشروع منذ ساعتين.' },
  { s: 'sara', v: 'finish', t: 'future-perfect', f: 'aff', comp: 'the presentation', time: 'by tomorrow', ar: 'ستكون سارة قد أنهت العرض بحلول الغد.' },
  { s: 'employees', v: 'eat', t: 'present-continuous', f: 'q', comp: 'lunch', time: 'now', ar: 'هل يتناول الموظفون الغداء الآن؟' },
  { s: 'he', v: 'speak', t: 'present-simple', f: 'negq', comp: 'English', ar: 'ألا يتحدث الإنجليزية؟' },
];

function Arrow({ color }: { color: string }) {
  return <svg width="28" height="38" viewBox="0 0 28 38" aria-hidden className="mx-auto block"><path d="M14 2v26" stroke={color} strokeWidth="3" strokeLinecap="round" /><path d="M5 22l9 12 9-12" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

const ALL_NAMES = Object.keys(PART) as PartName[];

export function Diagram({ parts, tenseId, formula, quiz, answers, setAnswer, checked }: {
  parts: Part[]; tenseId: string; formula: string; quiz: boolean; answers: Record<number, string>; setAnswer: (i: number, v: string) => void; checked: boolean;
}) {
  const vg = parts.map((p, i) => (p.verbGroup ? i : -1)).filter((i) => i >= 0);
  const a = vg[0] ?? 0, b = vg[vg.length - 1] ?? 0;
  const th = hueOfTense(tenseId); const T = TENSE_MAP[tenseId];
  const label = (p: Part, i: number) => {
    const c = PART[p.name];
    if (quiz) {
      const ok = answers[i] === p.name;
      return (
        <div className={cx('rounded-2xl border-2 p-2.5', checked ? (ok ? 'border-[#7FD99A] bg-[#E8FBEA]' : 'border-[#F9C0C0] bg-[#FEEEEE]') : 'border-dashed border-[#9BBEF0] bg-white/90')}>
          <select aria-label={`Name of “${p.text}”`} value={answers[i] ?? ''} disabled={checked} onChange={(e) => setAnswer(i, e.target.value)} className="h-10 w-full rounded-xl border border-[#C5D8F5] bg-white px-2 text-[14px] font-semibold text-[#07163F]">
            <option value="">Choose…</option>{ALL_NAMES.map((n) => <option key={n} value={n}>{n} · {PART[n].ar}</option>)}
          </select>
          {checked && <p className={cx('mt-1.5 flex items-center gap-1 text-[13px] font-bold', ok ? 'text-[#006B28]' : 'text-[#B91C1C]')}>{ok ? <CheckCircle2 size={15} /> : <XCircle size={15} />}{ok ? 'Correct' : p.name}</p>}
        </div>
      );
    }
    return (
      <div className={cx('rounded-2xl border-2 bg-white/95 p-3 shadow-sm', HUE[c.hue].border)}>
        <p className={cx('text-[15px] font-extrabold leading-tight', HUE[c.hue].text)}>{p.name}</p>
        <p dir="rtl" className="font-ar text-[14px] font-bold text-[#07163F]" style={{ textAlign: 'left' }}>{c.ar}</p>
        <p className="mt-1 text-[13px] font-medium leading-snug text-[#1E2A47]">{p.detail}</p>
        <Tr ar={p.detailAr} className="text-[12.5px] font-semibold !leading-snug !text-[#334A7A]" />
      </div>
    );
  };
  return (
    <>
      {/* Wide screens: boxes in a row, arrows down to labels, tense bar on top */}
      <div className="hidden overflow-x-auto pb-2 md:block">
        <div className="grid min-w-max gap-x-0" style={{ gridTemplateColumns: `repeat(${parts.length}, minmax(150px, auto))` }}>
          <div style={{ gridColumn: `${a + 1} / ${b + 2}`, gridRow: 1 }} className="mx-2 mb-2">
            <div className="relative rounded-xl px-3 py-1.5 text-center text-white" style={{ background: HUE[th].grad, boxShadow: `0 4px 12px ${HUE[th].glow}` }}>
              <p className="text-[15px] font-extrabold leading-tight">Tense: {T.en} · <bdi className="font-ar font-bold">{T.ar}</bdi></p>
              <p className="text-[12.5px] font-semibold text-white/90">{formula}</p>
            </div>
            <div className="mx-6 h-2.5 rounded-b-md border-x-2 border-b-2" style={{ borderColor: HUE[th].hex }} />
          </div>
          {parts.map((p, i) => {
            const c = PART[p.name];
            return (
              <div key={`b${i}`} style={{ gridRow: 2, gridColumn: i + 1 }} className={cx('flex min-h-[78px] items-center justify-center border-y-[3px] border-l-[3px] border-[#07163F] px-5 text-center', HUE[c.hue].soft, i === 0 && 'rounded-l-2xl', i === parts.length - 1 && 'rounded-r-2xl border-r-[3px]')} >
                <span className={cx('whitespace-nowrap text-[26px] font-extrabold', HUE[c.hue].text)}>{p.text}</span>
              </div>
            );
          })}
          {parts.map((p, i) => <div key={`a${i}`} style={{ gridRow: 3, gridColumn: i + 1 }} className="py-1"><Arrow color={HUE[PART[p.name].hue].hex} /></div>)}
          {parts.map((p, i) => <div key={`l${i}`} style={{ gridRow: 4, gridColumn: i + 1 }} className="px-1.5">{label(p, i)}</div>)}
        </div>
      </div>
      {/* Phones: one part per row */}
      <div className="space-y-2 md:hidden">
        <div className="rounded-xl px-3 py-2 text-white" style={{ background: HUE[th].grad }}><p className="text-[15px] font-extrabold">Tense: {T.en}</p><p className="text-[12.5px] font-semibold text-white/90">{formula}</p></div>
        {parts.map((p, i) => {
          const c = PART[p.name];
          return (
            <div key={i} className="grid grid-cols-[minmax(0,40%)_24px_minmax(0,1fr)] items-center gap-1.5">
              <div className={cx('rounded-xl border-2 border-[#07163F] px-2 py-3 text-center', HUE[c.hue].soft)}><span className={cx('text-[19px] font-extrabold', HUE[c.hue].text)}>{p.text}</span></div>
              <svg width="24" height="20" viewBox="0 0 24 20" aria-hidden><path d="M2 10h16M12 4l7 6-7 6" fill="none" stroke={HUE[c.hue].hex} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
              {label(p, i)}
            </div>
          );
        })}
      </div>
    </>
  );
}

export function StructurePage() {
  const { s, visit } = useStore();
  const { go } = useNav();
  useEffect(() => { visit('structure'); }, []);
  const [ex, setEx] = useState(0);
  const [mode, setMode] = useState<'examples' | 'custom'>('examples');
  // custom sentence
  const [subj, setSubj] = useState('I'); const [verb, setVerb] = useState('go'); const [tense, setTense] = useState('present-continuous');
  const [form, setForm] = useState<Form>('aff'); const [compMode, setCompMode] = useState<'default' | 'none' | 'custom'>('custom');
  const [custom, setCustom] = useState('to the office'); const [time, setTime] = useState('');
  const [quiz, setQuiz] = useState(false); const [answers, setAnswers] = useState<Record<number, string>>({}); const [checked, setChecked] = useState(false);

  const cfg = mode === 'examples' ? EXAMPLES[ex] : null;
  const S = SUBJECT_MAP[cfg ? cfg.s : subj]; const V = VERB_MAP[cfg ? cfg.v : verb]; const tid = cfg ? cfg.t : tense; const T = parseTense(tid); const F = cfg ? cfg.f : form;
  const cleanCustom = custom.replace(/[^A-Za-z0-9' ,-]/g, '').trim();
  const comp = cfg ? cfg.comp : compMode === 'default' ? V.comp : compMode === 'custom' ? cleanCustom : '';
  const tm = cfg ? cfg.time : time;
  const b = build(S, V, T, F, { comp: comp || undefined, time: tm || undefined, contracted: s.settings.contracted });
  const parts = useMemo(() => analyse(b.tokens, S, V, V.base === 'be'), [b.text]);
  const te = BUILDER_TIMES.find((x) => x.en === (tm ?? ''));
  const arabic = cfg ? cfg.ar : (compMode !== 'custom' ? arabicSentence(S, V.base, T, F, compMode === 'default', te?.ar || undefined) : null);
  const timeWarn = !cfg && time && te && !te.tenses.includes(tense);
  const pattern = parts.map((p) => (p.name === 'Main verb' ? (/ing$/.test(p.text.replace(/[.?]$/, '')) ? 'V-ing' : p.detail.startsWith('V3') ? 'V3' : p.detail.startsWith('V2') ? 'V2' : p.detail.startsWith('V1 +') ? 'V1+s' : V.base === 'be' ? 'be' : 'V1') : p.name === 'Helping verb' || p.name === 'Negative' ? p.text.replace(/[.?]$/, '').replace(/^./, (c) => c.toLowerCase()) : PART[p.name].short));
  useEffect(() => { setAnswers({}); setChecked(false); }, [b.text, quiz]);
  const score = parts.filter((p, i) => answers[i] === p.name).length;

  return (
    <div>
      <PageHead title="Sentence Structure" ar="تركيب الجملة" hue="indigo" icon={<Network />} sub="See how a sentence is built: every part in its own box, with an arrow to its name. The bar on top shows which words make the tense." subAr="شاهد كيف تُبنى الجملة: كل جزء في مربع، وسهم يشير إلى اسمه، والشريط في الأعلى يوضح الكلمات التي تكوّن الزمن." />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Chip on={mode === 'examples'} onClick={() => setMode('examples')}>Example sentences <ArLabel>أمثلة</ArLabel></Chip>
        <Chip on={mode === 'custom'} onClick={() => setMode('custom')}>Build my own <ArLabel>كوّن جملتك</ArLabel></Chip>
        <div className="ms-auto flex flex-wrap gap-2">
          <Btn variant={quiz ? 'primary' : 'outline'} onClick={() => setQuiz(!quiz)}>{quiz ? <><Eye size={18} /> Show labels</> : <><EyeOff size={18} /> Quiz me</>}</Btn>
          {mode === 'examples' && <Btn variant="soft" onClick={() => setEx((ex + 1 + Math.floor(Math.random() * (EXAMPLES.length - 1))) % EXAMPLES.length)}><Shuffle size={18} /> Random</Btn>}
        </div>
      </div>

      {mode === 'examples' ? (
        <div className="-mx-1 mb-5 flex gap-2 overflow-x-auto px-1 pb-1 md:flex-wrap md:overflow-visible">{EXAMPLES.map((e, i) => {
          const t = build(SUBJECT_MAP[e.s], VERB_MAP[e.v], parseTense(e.t), e.f, { comp: e.comp, time: e.time, contracted: s.settings.contracted }).text;
          return <button key={i} type="button" onClick={() => setEx(i)} className={cx('shrink-0 whitespace-nowrap rounded-xl border px-3 py-2 text-left text-[14px] font-semibold transition', ex === i ? 'nav-active' : 'border-[#C5D8F5] bg-white/90 text-[#08142F] hover:border-[#9BBEF0]')}>{t}</button>;
        })}</div>
      ) : (
        <div className="glass-card mb-5 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
          <Select label="Subject · الفاعل" value={subj} onChange={setSubj} options={SUBJECTS.map((x) => ({ v: x.id, l: `${x.id === 'I' ? 'I' : x.en} · ${x.ar.replace(' (لغير العاقل)', '')}` }))} />
          <Select label="Verb · الفعل" value={verb} onChange={setVerb} options={VERBS.map((x) => ({ v: x.base, l: `${x.base} · ${x.ar}` }))} />
          <Select label="Tense · الزمن" value={tense} onChange={setTense} options={TENSES_BY_ORDER.map((t) => ({ v: t.id, l: `${t.en} · ${t.ar}` }))} />
          <div><span className="mb-1 block text-xs font-semibold text-[#334A7A]">Sentence type · نوع الجملة</span><div className="flex flex-wrap gap-1.5">{FORMS.map((f) => <Chip key={f.id} on={form === f.id} onClick={() => setForm(f.id)}>{f.en}</Chip>)}</div></div>
          <div><span className="mb-1 block text-xs font-semibold text-[#334A7A]">Object / place · المفعول أو المكان</span>
            <div className="flex flex-wrap gap-1.5"><Chip on={compMode === 'none'} onClick={() => setCompMode('none')}>None</Chip><Chip on={compMode === 'default'} onClick={() => setCompMode('default')}>“{V.comp || '—'}”</Chip><Chip on={compMode === 'custom'} onClick={() => setCompMode('custom')}>My own</Chip></div>
            {compMode === 'custom' && <input value={custom} onChange={(e) => setCustom(e.target.value)} maxLength={40} placeholder="e.g. to the office" className="mt-2 h-11 w-full rounded-xl border border-[#C5D8F5] px-3 text-base" />}</div>
          <Select label="Time expression · تعبير الزمن" value={time} onChange={setTime} options={BUILDER_TIMES.map((x) => ({ v: x.en, l: x.en ? `${x.en} · ${x.ar}` : 'None' }))} />
        </div>
      )}

      <div className="glass-card glass-strong mb-6 p-5 sm:p-6">
        <div className="mb-5 flex flex-wrap items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[26px] font-extrabold leading-tight text-[#07163F]">{b.text}</p>
            {arabic && <Tr ar={arabic} className="mt-1 text-[17px] font-semibold !text-[#1E2A47]" />}
          </div>
          <Speak text={b.text} className="!h-11 !w-11 justify-center !rounded-full !bg-[#EAF2FF] !text-[#007BFF]" />
          <Speak text={b.text} slow className="!h-11 !w-11 justify-center !rounded-full !bg-[#EAF2FF] !text-[#007BFF]" />
        </div>
        {(b.warning || timeWarn) && <p className="mb-4 rounded-xl border border-[#F8D47A] bg-[#FFF6DB] px-3 py-2 text-[14px] font-semibold text-[#92400E]">{b.warning ?? `“${time}” does not usually go with the ${TENSE_MAP[tense].en}.`}</p>}
        <Diagram parts={parts} tenseId={tid} formula={b.formula} quiz={quiz} answers={answers} setAnswer={(i, v) => setAnswers({ ...answers, [i]: v })} checked={checked} />
        {quiz && <div className="mt-4 flex flex-wrap items-center gap-3">
          {!checked ? <Btn onClick={() => setChecked(true)} disabled={Object.keys(answers).length < parts.length}>Check my labels</Btn>
            : <><p className={cx('text-[16px] font-extrabold', score === parts.length ? 'text-[#006B28]' : 'text-[#B45309]')}>{score} / {parts.length} correct</p><Btn variant="outline" onClick={() => { setAnswers({}); setChecked(false); }}><RotateCcw size={16} /> Try again</Btn></>}
          {!checked && <span className="text-sm font-semibold text-[#334A7A]">Name every box, then check.</span>}
        </div>}
        <div className="mt-6 flex flex-wrap items-center gap-2 rounded-2xl border border-[#C5D8F5] bg-[#F3F7FF] px-4 py-3">
          <span className="text-[14px] font-bold text-[#334A7A]">Pattern · النمط:</span>
          {pattern.map((p, i) => { const c = PART[parts[i].name]; return <React.Fragment key={i}>{i > 0 && <span className="font-bold text-[#64748B]">+</span>}<span className={cx('rounded-lg border px-2.5 py-1 text-[14px] font-extrabold', HUE[c.hue].soft, HUE[c.hue].text, HUE[c.hue].border)}>{p}</span></React.Fragment>; })}
        </div>
      </div>

      <Section title="What each part does" ar="وظيفة كل جزء">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{ALL_NAMES.map((n) => {
          const c = PART[n];
          const info: Record<PartName, [string, string, string]> = {
            Subject: ['Who or what does the action. A pronoun (I, he, they), a name or a noun.', 'من يقوم بالفعل: ضمير أو اسم.', 'I · Ali · the manager'],
            'Helping verb': ['Carries the tense and agrees with the subject: am/is/are, do/does/did, have/has/had, will.', 'يحمل الزمن ويتوافق مع الفاعل.', 'am · does · has · will'],
            Negative: ['“not” (or n\'t) after the first helping verb.', 'not بعد أول فعل مساعد.', "not · doesn't · won't"],
            'Main verb': ['Carries the meaning. Its form (V1, V1+s, V2, V3, V-ing) depends on the tense.', 'يحمل المعنى، وشكله يتغير حسب الزمن.', 'work · works · worked · working'],
            Object: ['What or whom the action is done to.', 'ما يقع عليه الفعل.', 'the report · English'],
            Place: ['Where the action happens. Usually starts with a preposition.', 'مكان الحدث، ويبدأ غالباً بحرف جر.', 'to the office · in a bank'],
            Complement: ['After “be”, it describes the subject.', 'بعد be يصف الفاعل.', 'ready · tired'],
            'Time expression': ['When it happens. A strong clue for the tense.', 'وقت الحدث، وقرينة قوية على الزمن.', 'every day · yesterday · now'],
          };
          return <div key={n} className={cx('glass-card border-2 p-4', HUE[c.hue].border)}><p className={cx('text-[16px] font-extrabold', HUE[c.hue].text)}>{n} <ArLabel className="text-[15px] text-[#07163F]">{c.ar}</ArLabel></p><p className="mt-1 text-[14px] font-medium text-[#1E2A47]">{info[n][0]}</p><Tr ar={info[n][1]} className="text-[13.5px] font-semibold" /><p className="mt-1.5 text-[13px] font-bold text-[#334A7A]">e.g. {info[n][2]}</p></div>;
        })}</div>
      </Section>
      <p className="text-sm font-semibold text-[#334A7A]">Want to change one part and see the others react? Try the <button className="text-[#0659D6] underline" onClick={() => go('builder')}>Sentence Builder</button>.</p>
    </div>
  );
}
