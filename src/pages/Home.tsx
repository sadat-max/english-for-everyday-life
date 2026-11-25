import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BookOpen, Flame, CheckCircle2, Target, PlayCircle, Circle, Layers, BookOpenText, Zap, XCircle, Wand2, TriangleAlert, Crosshair, Play, CheckSquare, Square, ChevronRight, TrendingUp } from 'lucide-react';
import { MODULES, ALL_LESSONS, LESSON_MAP } from '../data/content';
import { VERBS, VERB_MAP, VERB_IPA } from '../data/verbs';
import { TENSES, TENSES_BY_ORDER, TENSE_MAP } from '../data/tenses';
import { QUESTIONS } from '../data/questions';
import { SUBJECTS, SUBJECT_MAP, build, parseTense } from '../engine/grammar';
import { arabicSentence, AR_VERBS } from '../engine/arabic';
import { BUILDER_TIMES } from './Tools';
import { useStore, streakOf, today } from '../store/store';
import { useNav } from '../lib/nav';
import { dailyChallenge, dateSeed, moduleQuiz, finalQuiz, lessonQuiz, prep, rng } from '../lib/quiz';
import { questionsFor } from '../data/questions';
import { Badge, Btn, Card, Ex, HUE, Hue, Progress, Ring, Speak, Tr, cx, ArLabel } from '../lib/ui';
import { TenseMatrix } from './Tenses';

export function useProgress() {
  const { s } = useStore();
  return useMemo(() => {
    const done = ALL_LESSONS.filter((l) => s.lessons[l.id]?.completed);
    const answered = Object.values(s.answers).reduce((a, x) => a + x.right + x.wrong, 0);
    const right = Object.values(s.answers).reduce((a, x) => a + x.right, 0);
    const next = ALL_LESSONS.find((l) => !s.lessons[l.id]?.completed);
    const mod = next ? MODULES.find((m) => m.id === next.module)! : MODULES[MODULES.length - 1];
    const modPct = (m: typeof MODULES[number]) => Math.round((m.lessons.filter((l) => s.lessons[l.id]?.completed).length / m.lessons.length) * 100);
    return { done, pct: Math.round((done.length / ALL_LESSONS.length) * 100), answered, right, acc: answered ? Math.round((right / answered) * 100) : null, next, mod, modPct, streak: streakOf(s.activity), todayCount: s.activity[today()] ?? 0 };
  }, [s]);
}

function Banner() {
  return (
    <div className="banner relative overflow-hidden rounded-[20px] px-6 py-3 text-white sm:px-7">
      <div className="pointer-events-none absolute inset-0 opacity-40" style={{ background: 'radial-gradient(500px 160px at 75% 0%, rgba(0,217,255,.45), transparent 70%), radial-gradient(300px 140px at 10% 120%, rgba(147,51,234,.4), transparent 70%)' }} />
      <div className="relative grid items-center gap-x-6 gap-y-2 md:grid-cols-[auto_1fr] 2xl:grid-cols-[auto_1fr_230px]">
        <div>
          <h1 className="whitespace-nowrap text-[27px] font-extrabold leading-tight tracking-tight sm:text-[30px]">Welcome, Mr. Nabegh!</h1>
          <p className="mt-1 text-[16px] font-medium text-[#DCEBFF]">Let's improve your English, one sentence at a time.</p>
        </div>
        <div dir="rtl" className="font-ar md:pe-2">
          <p className="whitespace-nowrap text-[22px] font-bold leading-tight 2xl:text-[25px]">مرحباً أستاذ نابغ!</p>
          <p className="mt-1 whitespace-nowrap text-[15px] font-semibold text-[#DCEBFF] 2xl:text-[16px]">لنتعلم اللغة الإنجليزية خطوة بخطوة</p>
        </div>
        <BannerArt className="hidden h-[92px] w-[230px] 2xl:block" />
      </div>
    </div>
  );
}

/** Banner illustration: stacked English books, glowing globe, plant and pen cup (vector, no external images). */
function BannerArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 260 120" className={className} aria-hidden>
      <defs>
        <radialGradient id="ba-globe" cx="35%" cy="30%" r="75%"><stop offset="0" stopColor="#9BE7FF" /><stop offset=".45" stopColor="#1E9BFF" /><stop offset="1" stopColor="#0A3A9E" /></radialGradient>
        <radialGradient id="ba-halo" cx="50%" cy="50%" r="50%"><stop offset=".55" stopColor="#00D9FF" stopOpacity=".55" /><stop offset="1" stopColor="#00D9FF" stopOpacity="0" /></radialGradient>
        <linearGradient id="ba-b1" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#2F7BFF" /><stop offset="1" stopColor="#0B3EA8" /></linearGradient>
        <linearGradient id="ba-b2" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#7C5CFF" /><stop offset="1" stopColor="#4B22C9" /></linearGradient>
        <linearGradient id="ba-pot" x1="0" x2="1"><stop offset="0" stopColor="#F2F6FF" /><stop offset="1" stopColor="#B9CBEA" /></linearGradient>
        <linearGradient id="ba-leaf" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#6EE7A0" /><stop offset="1" stopColor="#0E9F4F" /></linearGradient>
      </defs>
      <ellipse cx="140" cy="112" rx="112" ry="7" fill="#020B2A" opacity=".35" />
      <circle cx="150" cy="44" r="44" fill="url(#ba-halo)" />
      <rect x="146" y="70" width="8" height="12" rx="2" fill="#B9CBEA" /><ellipse cx="150" cy="83" rx="16" ry="4" fill="#DDE7F8" />
      <circle cx="150" cy="42" r="30" fill="url(#ba-globe)" />
      <g fill="none" stroke="#E6FBFF" strokeOpacity=".7" strokeWidth="1.2"><ellipse cx="150" cy="42" rx="30" ry="11" /><ellipse cx="150" cy="42" rx="13" ry="30" /><path d="M120 42h60M150 12v60" /></g>
      <path d="M134 30c6-6 14-4 16 2s-6 8-10 12-10 2-10-4 2-8 4-10zM158 48c6-2 12 2 10 8s-10 6-12 2 0-8 2-10z" fill="#7CF0C0" opacity=".85" />
      <path d="M150 12a30 30 0 0 1 28 18" stroke="#fff" strokeOpacity=".8" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M38 98h20l-3 14H41z" fill="url(#ba-pot)" />
      <path d="M48 98c-8-16-22-20-26-34 12 2 22 12 26 34zM48 98c2-18 10-30 22-36-2 14-10 26-22 36zM48 98c-2-22 0-36 6-46 6 14 2 30-6 46z" fill="url(#ba-leaf)" />
      <g transform="translate(76 86)"><rect width="104" height="16" rx="3" fill="url(#ba-b2)" /><rect x="6" y="3" width="92" height="3" fill="#fff" opacity=".85" /><rect y="13" width="104" height="3" fill="#2A1080" opacity=".5" /></g>
      <g transform="translate(70 66) rotate(-3)"><rect width="116" height="21" rx="3" fill="url(#ba-b1)" stroke="#00D9FF" strokeWidth="1" /><rect x="5" y="4" width="106" height="3" fill="#fff" opacity=".9" /><rect x="34" y="8" width="54" height="10" rx="2" fill="#0A2E85" stroke="#7FDFFF" strokeWidth=".8" /><text x="61" y="16" textAnchor="middle" fontSize="8.5" fontWeight="800" fill="#fff" letterSpacing=".5">ENGLISH</text></g>
      <g transform="translate(206 62)"><path d="M0 8h30l-3 42H3z" fill="#1E4FC2" stroke="#7FDFFF" strokeWidth="1" /><path d="M6 8L2-20M14 8l4-30M22 8l10-24" stroke="#F5F7FF" strokeWidth="3.4" strokeLinecap="round" /><path d="M2-20l-1-4M18-22l1-5M32-16l2-4" stroke="#F59E0B" strokeWidth="3.4" strokeLinecap="round" /><path d="M10 8l-6-22" stroke="#9333EA" strokeWidth="3.4" strokeLinecap="round" /></g>
    </svg>
  );
}

function Stat({ label, ar, icon, color, children, aside }: { label: string; ar: string; icon: React.ReactNode; color: string; children?: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="glass-card flex items-center gap-2.5 px-3 py-2.5" style={{ backgroundImage: `linear-gradient(145deg,#fff,rgba(255,255,255,.92) 55%,${color}14)` }}>
      <span className="shrink-0" style={{ color }}>{icon}</span>
      <div className="min-w-0 flex-1 leading-tight"><p className="text-[13.5px] font-bold text-[#07163F]">{label}</p><p dir="rtl" className="truncate font-ar text-[12.5px] font-semibold text-[#334A7A]" style={{ textAlign: 'left' }}>{ar}</p>{children}</div>{aside}
    </div>
  );
}

const FAMILIES: { en: string; ar: string; hue: Hue; ids: string[] }[] = [
  { en: 'Present', ar: 'المضارع', hue: 'green', ids: ['present-simple', 'present-continuous', 'sesies'] },
  { en: 'Past', ar: 'الماضي', hue: 'purple', ids: ['past-simple', 'past-continuous'] },
  { en: 'Future', ar: 'المستقبل', hue: 'orange', ids: ['future-simple', 'future-ways', 'future-continuous'] },
  { en: 'Perfect', ar: 'التام', hue: 'blue', ids: ['present-perfect', 'present-perfect-continuous', 'past-perfect', 'past-perfect-continuous', 'future-perfect', 'future-perfect-continuous', 'perfect'] },
];

function WidgetTitle({ icon, en, ar, color = '#007BFF' }: { icon: React.ReactNode; en: string; ar: string; color?: string }) {
  return <div className="mb-2.5 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0"><span className="shrink-0" style={{ color }}>{icon}</span><h3 className="whitespace-nowrap text-[16px] font-extrabold text-[#07163F]">{en}</h3><ArLabel className="whitespace-nowrap text-[13.5px] font-bold text-[#07163F]">{ar}</ArLabel></div>;
}

function QuickPractice() {
  const { recordAnswer } = useStore(); const { startQuiz } = useNav();
  // Short, everyday sentences only, so the widget stays compact.
  const pool = useMemo(() => QUESTIONS.filter((q) => ((q.id.startsWith('g-cs-') && q.level === 1 && /present-simple|past-simple|present-continuous|future-simple/.test(q.id)) || q.id.startsWith('g-agr-')) && q.choices!.every((c) => c.length <= 34)), []);
  const [i, setI] = useState(() => dateSeed() % pool.length);
  const q = useMemo(() => prep(pool[i % pool.length], rng(i + 11)), [i]);
  const [pick, setPick] = useState<string | null>(null); const [done, setDone] = useState(false);
  const ok = pick === q.answer;
  const check = () => { if (!pick) return; setDone(true); recordAnswer(q, pick, ok); };
  const next = () => { setI(i + 1); setPick(null); setDone(false); };
  return (
    <div className="glass-card p-3.5">
      <WidgetTitle icon={<Zap size={22} fill="currentColor" />} en="Quick Practice" ar="تدريب سريع" />
      <p className="text-[14px] font-semibold leading-snug text-[#08142F]">{q.text ? 'Choose the verb that fits:' : 'Choose the correct sentence:'} <bdi className="font-ar text-[13px] text-[#334A7A]">{q.text ? 'اختر الفعل المناسب' : 'اختر الجملة الصحيحة'}</bdi></p>
      {q.text && <p className="mb-1 text-[15px] font-bold text-[#07163F]">{q.text}</p>}
      <div role="radiogroup" className="mt-1 space-y-0.5">
        {q.choices!.map((c) => {
          const sel = pick === c; const st = done ? (c === q.answer ? 'ok' : sel ? 'bad' : '') : sel ? 'sel' : '';
          return (
            <button key={c} type="button" role="radio" aria-checked={sel} disabled={done} onClick={() => setPick(c)}
              className={cx('flex w-full items-center gap-2.5 rounded-xl border px-2.5 py-1 text-left text-[14.5px] font-semibold transition', st === 'ok' ? 'border-[#7FD99A] bg-[#E8FBEA] text-[#006B28]' : st === 'bad' ? 'border-[#F9C0C0] bg-[#FEEEEE] text-[#B91C1C]' : st === 'sel' ? 'border-[#007BFF] bg-[#EAF2FF] text-[#07163F]' : 'border-transparent text-[#08142F] hover:bg-[#F3F7FF]')}>
              <span className={cx('grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full border-2', sel || st === 'ok' ? 'border-current' : 'border-[#94A3B8]')}>{(sel || st === 'ok') && <span className="h-2 w-2 rounded-full bg-current" />}</span>
              <span className="flex-1">{c}</span>
              {st === 'ok' && <CheckCircle2 size={18} className="text-[#00B83F]" />}{st === 'bad' && <XCircle size={18} className="text-[#EF4444]" />}
            </button>
          );
        })}
      </div>
      {done && <div className={cx('mt-2 rounded-xl px-3 py-2 text-[13.5px]', ok ? 'bg-[#E8FBEA] text-[#064E25]' : 'bg-[#FEEEEE] text-[#7F1D1D]')} role="status">
        <b>{ok ? 'Correct!' : 'Not quite.'}</b> {!ok && q.why?.[pick!]?.en} <span className="block">{q.en}</span>
        <span dir="rtl" className="mt-0.5 block font-ar font-semibold">{!ok && q.why?.[pick!]?.ar} {q.ar}</span>
      </div>}
      <button type="button" onClick={done ? next : check} disabled={!pick && !done} className="btn-neon mt-2.5 flex min-h-[40px] w-full items-center justify-center gap-2 text-[14.5px] font-semibold disabled:opacity-50">
        {done ? <>Next question <ArrowRight size={16} /></> : <>Check Answer <span className="hidden font-ar 2xl:inline">تحقق من الإجابة</span></>}
      </button>
    </div>
  );
}

function MiniBuilder() {
  const { go } = useNav();
  const [subj, setSubj] = useState('he'); const [tense, setTense] = useState('present-simple'); const [verb, setVerb] = useState('work'); const [time, setTime] = useState('every day');
  const te = BUILDER_TIMES.find((x) => x.en === time)!; const fits = te.tenses.includes(tense);
  const T = parseTense(tense);
  const b = build(SUBJECT_MAP[subj], VERB_MAP[verb], T, 'aff', { time });
  const ar = arabicSentence(SUBJECT_MAP[subj], verb, T, 'aff', false, te.ar);
  const sel = (label: string, ar: string, value: string, onChange: (v: string) => void, opts: { v: string; l: string }[]) => (
    <label className="min-w-0"><span className="block text-[13px] font-bold leading-tight text-[#07163F]">{label}</span><span dir="rtl" className="block font-ar text-[12px] font-semibold text-[#334A7A]" style={{ textAlign: 'left' }}>{ar}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-[#C5D8F5] bg-white px-1.5 text-[13.5px] font-semibold text-[#08142F] focus:outline-none focus:ring-2 focus:ring-[#00D9FF]/40">{opts.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}</select></label>
  );
  return (
    <div className="glass-card glass-strong p-3.5">
      <div className="flex items-center justify-between"><WidgetTitle icon={<Wand2 size={22} />} en="Sentence Builder" ar="منشئ الجمل" /><button onClick={() => go('builder')} className="mb-3 text-[13px] font-semibold text-[#0659D6] hover:underline">Full builder →</button></div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {sel('Subject', 'الفاعل', subj, setSubj, SUBJECTS.map((x) => ({ v: x.id, l: x.id === 'I' ? 'I' : x.en.replace(/^./, (c) => c.toUpperCase()) })))}
        {sel('Tense', 'الزمن', tense, setTense, TENSES_BY_ORDER.map((t) => ({ v: t.id, l: t.en.replace(' (will)', '') })))}
        {sel('Verb', 'الفعل', verb, setVerb, Object.keys(AR_VERBS).map((v) => ({ v, l: v })))}
        {sel('Time', 'الوقت', time, setTime, BUILDER_TIMES.filter((x) => x.en).map((x) => ({ v: x.en, l: x.en })))}
      </div>
      <div className={cx('mt-3 flex items-center gap-3 rounded-2xl border px-3 py-2.5', fits && !b.warning ? 'border-[#9FE2B2] bg-[#E8FBEA]' : 'border-[#F8D47A] bg-[#FFF6DB]')}>
        {fits && !b.warning ? <CheckCircle2 size={26} className="shrink-0 text-[#00B83F]" /> : <TriangleAlert size={24} className="shrink-0 text-[#D97706]" />}
        <div className="min-w-0 flex-1"><p className="text-[18px] font-extrabold leading-snug text-[#07163F]">{b.text}</p>{ar && <Tr ar={ar} className="text-[14px] font-semibold !text-[#1E2A47]" />}
          {!fits && <p className="text-[12.5px] font-semibold text-[#92400E]">“{time}” does not usually go with the {TENSE_MAP[tense].en}.</p>}
          {b.warning && <p className="text-[12.5px] font-semibold text-[#92400E]">{b.warning}</p>}</div>
        <Speak text={b.text} className="!h-10 !w-10 shrink-0 justify-center !rounded-full !bg-[#EAF2FF] !text-[#007BFF]" />
      </div>
    </div>
  );
}

export function Dashboard() {
  const { s, visit } = useStore();
  const { go, openVerb } = useNav();
  const p = useProgress();
  useEffect(() => { visit('dashboard'); }, []);
  const seed = dateSeed();
  const core = Object.keys(AR_VERBS);
  const word = VERB_MAP[core[seed % core.length]];
  const wordStat = word.base === 'live';
  const wT = parseTense(wordStat ? 'present-simple' : 'future-simple');
  const wEx = build(SUBJECT_MAP.I, word, wT, 'aff', { comp: word.comp, time: wordStat ? undefined : 'today' }).text;
  const wAr = arabicSentence(SUBJECT_MAP.I, word.base, wT, 'aff', true, wordStat ? undefined : 'اليوم');
  const allEx = TENSES.flatMap((t) => t.examples.map((e) => ({ ...e, t })));
  const sent = allEx[(seed * 7) % allEx.length];
  const famPct = (ids: string[]) => Math.round((ids.filter((id) => s.lessons[id]?.completed).length / ids.length) * 100);
  const focus = p.next;
  const focusHue: Hue = focus ? (focus.id.includes('perfect') ? 'blue' : focus.id.startsWith('present') || focus.id === 'sesies' ? 'green' : focus.id.startsWith('past') ? 'purple' : focus.id.startsWith('future') ? 'orange' : 'green') : 'green';
  const idx = focus ? ALL_LESSONS.findIndex((l) => l.id === focus.id) : ALL_LESSONS.length - 1;
  const steps = ALL_LESSONS.slice(Math.max(0, Math.min(idx - 2, ALL_LESSONS.length - 5)), Math.max(0, Math.min(idx - 2, ALL_LESSONS.length - 5)) + 5);
  return (
    <div className="space-y-3.5">
      <div className="grid gap-3.5 xl:grid-cols-[minmax(0,1fr)_266px] 2xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-3.5">
          <Banner />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
            <Stat label="Overall Progress" ar="التقدم العام" icon={<Target size={28} strokeWidth={2.2} />} color="#00B83F" aside={<Ring pct={p.pct} size={50} stroke={6} hue="green" label={<span className="text-[13px]">{p.pct}%</span>} />} />
            <Stat label="Lessons Completed" ar="الدروس المكتملة" icon={<BookOpen size={30} strokeWidth={2.2} />} color="#007BFF"><p className="text-[25px] font-extrabold leading-tight text-[#0659D6]">{p.done.length}<span className="text-[18px] text-[#334A7A]"> / {ALL_LESSONS.length}</span></p></Stat>
            <Stat label="Quiz Accuracy" ar="دقة الاختبارات" icon={<Layers size={30} strokeWidth={2.2} />} color="#9333EA"><p className="text-[25px] font-extrabold leading-tight text-[#00A63A]">{p.acc == null ? '—' : `${p.acc}%`}</p>{p.acc == null && <p className="text-[11.5px] font-semibold text-[#475569]">No answers yet</p>}</Stat>
            <Stat label="Verbs Learned" ar="الأفعال المتعلمة" icon={<BookOpenText size={30} strokeWidth={2.2} />} color="#9333EA"><p className="text-[25px] font-extrabold leading-tight text-[#7E22CE]">{s.verbs.learned.length}</p></Stat>
            <Stat label="Learning Streak" ar="سلسلة التعلم" icon={<Flame size={30} strokeWidth={2.2} fill="#FDBA74" />} color="#F07C00"><p className="text-[25px] font-extrabold leading-tight text-[#E25F00]">{p.streak} {p.streak === 1 ? 'Day' : 'Days'}</p></Stat>
          </div>
          <div className="grid gap-3.5 lg:grid-cols-[minmax(0,1fr)_236px] 2xl:grid-cols-[minmax(0,1fr)_258px]">
            <TenseMatrix />
            <div className="space-y-3.5">
              <div className="glass-card glass-strong p-3.5">
                <WidgetTitle icon={<Crosshair size={22} />} en="Today's Focus" ar="تركيز اليوم" />
                {focus ? <button onClick={() => go(focus.page)} className={cx('flex w-full items-center gap-3 rounded-2xl border p-3 text-left', HUE[focusHue].soft, HUE[focusHue].border)}>
                  <BookOpen size={34} className={cx('shrink-0', HUE[focusHue].text)} strokeWidth={2} />
                  <span><span className="block text-[17px] font-extrabold leading-tight text-[#07163F]">{focus.en}</span><span dir="rtl" className="block font-ar text-[15px] font-bold text-[#07163F]" style={{ textAlign: 'left' }}>{focus.ar}</span></span>
                </button> : <p className="rounded-2xl bg-[#E8FBEA] p-3 font-bold text-[#064E25]">Every lesson is complete. Excellent work!</p>}
                <button type="button" onClick={() => go(focus?.page ?? 'quizzes')} className="btn-neon mx-auto mt-2.5 flex min-h-[46px] w-[92%] items-center justify-center gap-2.5 px-4">
                  <Play size={18} fill="currentColor" /><span className="leading-tight"><span className="block text-[15px] font-bold">{s.lessons[focus?.id ?? '']?.visited ? 'Continue Lesson' : 'Start Lesson'}</span><span className="block font-ar text-[12.5px] font-semibold text-[#CDEBFF]">{s.lessons[focus?.id ?? '']?.visited ? 'متابعة الدرس' : 'ابدأ الدرس'}</span></span>
                </button>
              </div>
              <QuickPractice />
            </div>
          </div>
        </div>

        <div className="grid content-start gap-3.5 md:grid-cols-3 xl:grid-cols-1">
          <div className="glass-card glass-strong p-3.5">
            <WidgetTitle icon={<Crosshair size={22} />} en="Your Progress" ar="تقدمك" />
            <div className="flex items-center gap-4">
              <Ring pct={p.pct} size={104} stroke={11} hue="green" label={<span className="text-[24px]">{p.pct}%</span>} />
              <ul className="flex-1 space-y-2">{FAMILIES.map((f) => { const v = famPct(f.ids); return (
                <li key={f.en} className="flex items-center gap-2 text-[14px] font-bold text-[#07163F]"><span className={cx('h-2.5 w-2.5 rounded-full', HUE[f.hue].dot)} /><span className="flex-1">{f.en}</span><span className="hidden 2xl:inline">{v === 100 ? <CheckSquare size={15} className={HUE[f.hue].text} /> : <Square size={15} className="text-[#94A3B8]" />}</span><span className={cx('w-10 text-right tabular-nums', HUE[f.hue].text)}>{v}%</span></li>); })}</ul>
            </div>
          </div>
          <div className="glass-card glass-strong p-3.5">
            <WidgetTitle icon={<BookOpen size={22} />} en="Word of the Day" ar="كلمة اليوم" />
            <div className="flex items-start justify-between gap-2">
              <div><p className="flex flex-wrap items-baseline gap-x-3"><button onClick={() => { go('verbs'); openVerb(word.base); }} className="text-[26px] font-extrabold leading-none text-[#00A63A] hover:underline">{word.base}</button><span className="text-[15px] font-semibold text-[#1E2A47]">{VERB_IPA[word.base]}</span></p>
                <p className="mt-1 text-[14px] font-semibold"><span className="text-[#E25F00]">(v)</span> <span dir="rtl" className="font-ar text-[15px] font-bold text-[#07163F]">{word.ar}</span></p>
                <p className="text-[12.5px] font-semibold text-[#475569]">{word.base} – {word.v2} – {word.v3}</p></div>
              <Speak text={word.base} className="!h-10 !w-10 justify-center !rounded-full !bg-[#EAF2FF] !text-[#007BFF]" />
            </div>
            <div className="relative mt-3 rounded-2xl border border-[#C5D8F5] bg-[#EEF5FF] px-4 py-2.5">
              <span className="absolute left-2 top-0 font-serif text-[30px] font-black leading-none text-[#007BFF]">“</span>
              <p className="pl-3 pr-2 text-[14.5px] font-semibold text-[#07163F]">{wEx}</p>
              {wAr && <Tr ar={wAr} className="text-[14px] font-semibold !text-[#1E2A47]" />}
              <span className="absolute bottom-0 right-2 font-serif text-[30px] font-black leading-none text-[#007BFF]">”</span>
            </div>
          </div>
          <div className="glass-card glass-strong p-3.5">
            <WidgetTitle icon={<Crosshair size={22} />} en="Sentence of the Day" ar="جملة اليوم" color="#9333EA" />
            <div className="flex items-start gap-2 rounded-2xl border border-[#C5D8F5] bg-white/80 p-3">
              <button onClick={() => go(sent.t.id, 'examples')} className="min-w-0 flex-1 text-left" title="Explore this tense">
                <span className="block text-[16.5px] font-extrabold leading-snug text-[#07163F]">{sent.en}</span>
                <Tr ar={sent.ar} className="text-[14px] font-semibold !text-[#1E2A47]" />
                <span className={cx('mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-bold', HUE[sent.t.aspect.startsWith('perfect') ? 'blue' : sent.t.time === 'present' ? 'green' : sent.t.time === 'past' ? 'purple' : 'orange'].soft, HUE[sent.t.aspect.startsWith('perfect') ? 'blue' : sent.t.time === 'present' ? 'green' : sent.t.time === 'past' ? 'purple' : 'orange'].text)}>{sent.t.en} · explore <ArrowRight size={12} /></span>
              </button>
              <Speak text={sent.en} className="!h-10 !w-10 shrink-0 justify-center !rounded-full !bg-[#EAF2FF] !text-[#007BFF]" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3.5 lg:grid-cols-2 2xl:grid-cols-3">
        <MiniBuilder />
        <div className="glass-card glass-strong p-3.5">
          <div className="flex items-center justify-between"><WidgetTitle icon={<Layers size={22} />} en="Verb Library" ar="مكتبة الأفعال" /><button onClick={() => go('verbs')} className="mb-3 text-[13px] font-semibold text-[#0659D6] hover:underline">All {VERBS.length} verbs →</button></div>
          <div className="overflow-hidden rounded-xl border border-[#9BBEF0]">
            <table className="w-full text-center text-[14.5px]">
              <thead style={{ background: 'linear-gradient(180deg,#0B4FBF,#062B72)' }} className="text-white"><tr>{[['V1 (Base)', 'المصدر'], ['V2 (Past)', 'الماضي'], ['V3 (Participle)', 'التصريف الثالث'], ['Meaning', 'المعنى']].map(([a, b]) => <th key={a} className="px-2 py-1.5 font-bold leading-tight">{a}<span className="block font-ar text-[11.5px] font-semibold text-[#CDEBFF]">{b}</span></th>)}<th className="w-9" /></tr></thead>
              <tbody>{['work', 'go', 'eat', 'buy'].map((b, i) => { const v = VERB_MAP[b]; return (
                <tr key={b} className={cx('border-t border-[#D6E3F6] font-semibold text-[#08142F]', i % 2 ? 'bg-[#EEF5FF]' : 'bg-white')}>
                  <td className="px-2 py-1.5">{v.base}</td><td className={cx('px-2', v.irregular && 'text-[#7E22CE]')}>{v.v2}</td><td className={cx('px-2', v.irregular && 'text-[#7E22CE]')}>{v.v3}</td><td dir="rtl" className="px-2 font-ar">{v.ar}</td>
                  <td className="pr-2"><button onClick={() => { go('verbs'); openVerb(b); }} className="grid h-6 w-6 place-items-center rounded-full bg-[#EAF2FF] text-[#007BFF] hover:bg-[#007BFF] hover:text-white" aria-label={`Open ${b}`}><ChevronRight size={15} strokeWidth={2.8} /></button></td>
                </tr>); })}</tbody>
            </table>
          </div>
        </div>
        <div className="glass-card glass-strong p-4 lg:col-span-2 2xl:col-span-1">
          <WidgetTitle icon={<TrendingUp size={22} />} en="Next Steps" ar="الخطوات التالية" />
          <ul className="space-y-1">{steps.map((l) => { const done = !!s.lessons[l.id]?.completed; const cur = focus?.id === l.id; return (
            <li key={l.id}><button onClick={() => go(l.page)} className={cx('flex w-full items-center gap-3 rounded-xl px-2.5 py-1.5 text-left text-[14.5px] font-bold text-[#07163F]', cur ? 'border border-[#9BBEF0] bg-[#E3EEFF]' : 'hover:bg-[#F3F7FF]')}>
              {done ? <CheckCircle2 size={20} className="shrink-0 text-[#00B83F]" fill="#E8FBEA" /> : cur ? <PlayCircle size={20} className="shrink-0 text-[#007BFF]" fill="#D6E7FF" /> : <Circle size={20} className="shrink-0 text-[#94A3B8]" />}
              <span className="flex-1">{l.en}{cur && <span className="ms-1 font-semibold text-[#0659D6]">(In Progress)</span>}</span><span dir="rtl" className="font-ar text-[14px] font-semibold">{l.ar}</span>
            </button></li>); })}</ul>
        </div>
      </div>
    </div>
  );
}

export function Roadmap() {
  const { s, visit } = useStore(); const { go, startQuiz } = useNav(); const p = useProgress();
  useEffect(() => { visit('roadmap'); }, []);
  return (
    <div>
      <div className="mb-8"><h1 className="text-[34px] font-semibold tracking-tight text-slate-900">Learning Roadmap</h1><ArLabel className="text-lg text-indigo-700">خريطة التعلم</ArLabel>
        <Ex className="mt-2 max-w-2xl" en="Ten modules, from foundations to confident use. Each module has lessons, examples, practice and an assessment. Every lesson stays open — you can revisit anything at any time." ar="عشر وحدات من الأساسيات حتى الاستخدام بثقة. كل وحدة فيها دروس وأمثلة وتدريبات وتقييم، وكل الدروس متاحة دائماً." /></div>
      <ol className="relative space-y-4 border-s-2 border-dashed border-slate-200 ps-6">
        {MODULES.map((m) => { const pct = p.modPct(m); const h = m.color as Hue; const best = s.quizzes.filter((q) => q.kind === (m.id === 'm10' ? 'final' : 'module') && q.ref === m.id).reduce((a, q) => Math.max(a, q.pct), -1); return (
          <li key={m.id} id={m.id} className="scroll-mt-24">
            <span className={cx('absolute -start-[17px] mt-5 grid h-8 w-8 place-items-center rounded-full border-4 border-[#fbfbf9] text-xs font-semibold', pct === 100 ? 'bg-emerald-600 text-white' : cx(HUE[h].solid, 'text-white'))}>{m.n}</span>
            <Card hue={m.id === p.mod.id ? h : undefined} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><p className="text-xs font-medium text-slate-500">Module {m.n}</p><p className="text-xl font-semibold text-slate-900">{m.en} <ArLabel className="text-base font-normal text-slate-500">{m.ar}</ArLabel></p><Ex className="mt-1" en={m.desc} ar={m.descAr} small /></div>
                <div className="w-40"><p className="mb-1 text-right text-sm tabular-nums text-slate-500">{pct}%</p><Progress pct={pct} hue={h} /></div>
              </div>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">{m.lessons.map((l) => { const st = s.lessons[l.id]; return (
                <li key={l.id}><button onClick={() => l.id === 'final' ? startQuiz({ title: 'Final assessment', questions: finalQuiz(), kind: 'final', ref: 'm10', mode: 'exam' }) : go(l.page, l.id === 'spelling' ? 'spelling' : l.id === 'future-ways' ? 'ways' : undefined)} className="flex min-h-[48px] w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 text-left hover:border-slate-300">
                  {st?.completed ? <CheckCircle2 size={18} className="text-emerald-600" /> : st?.visited ? <Circle size={18} className="text-amber-500" /> : <Circle size={18} className="text-slate-300" />}
                  <span className="flex-1"><span className="block text-[15px] font-medium text-slate-800">{l.en}</span><ArLabel className="text-xs text-slate-500">{l.ar}</ArLabel></span>
                  {st?.best != null && <Badge hue={st.best >= 80 ? 'green' : 'amber'}>{st.best}%</Badge>}
                </button></li>); })}</ul>
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
                {m.id !== 'm10' ? <>
                  <Btn variant="soft" hue="amber" onClick={() => startQuiz({ title: `Module ${m.n} assessment: ${m.en}`, questions: moduleQuiz(m.id), kind: 'module', ref: m.id, mode: 'exam' })}>Module assessment (18 questions)</Btn>
                  {m.lessons.length === 1 && questionsFor(m.lessons[0].id).length > 0 && <Btn variant="ghost" onClick={() => startQuiz({ title: `${m.lessons[0].en} — lesson quiz`, questions: lessonQuiz(m.lessons[0].id), kind: 'lesson', ref: m.lessons[0].id, mode: 'practice' })}>Lesson quiz</Btn>}
                </> : <Btn hue="amber" onClick={() => startQuiz({ title: 'Final assessment', questions: finalQuiz(), kind: 'final', ref: 'm10', mode: 'exam' })}>Start final assessment (50 questions)</Btn>}
                {best >= 0 && <span className="text-sm text-slate-500">Best score: {best}%</span>}
              </div>
            </Card>
          </li>); })}
      </ol>
    </div>
  );
}
