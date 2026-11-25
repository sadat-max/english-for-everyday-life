import React, { useEffect, useMemo, useState } from 'react';
import { Puzzle, MessagesSquare, AlertTriangle, Wand2, Play, PlayCircle, CheckCircle2, XCircle, Info } from 'lucide-react';
import { SUBJECTS, SUBJECT_MAP, FORMS, Form, build, parseTense } from '../engine/grammar';
import { arabicSentence, AR_VERBS } from '../engine/arabic';
import { VERBS, VERB_MAP } from '../data/verbs';
import { TENSES_BY_ORDER, TENSE_MAP } from '../data/tenses';
import { CONVERSATIONS } from '../data/content';
import { questionsFor } from '../data/questions';
import { pickQuestions } from '../lib/quiz';
import { useNav } from '../lib/nav';
import { useStore } from '../store/store';
import { Badge, Btn, Card, Chip, Ex, HUE, PageHead, Section, Select, Speak, Tokens, Tr, cx, hueOfTense, ArLabel, canSpeak, ROLE_CLS, ROLE_NAME } from '../lib/ui';

export const BUILDER_TIMES: { en: string; ar: string; tenses: string[] }[] = [
  { en: '', ar: '', tenses: TENSES_BY_ORDER.map((t) => t.id) },
  { en: 'every day', ar: 'كل يوم', tenses: ['present-simple', 'future-simple'] },
  { en: 'on Fridays', ar: 'أيام الجمعة', tenses: ['present-simple'] },
  { en: 'now', ar: 'الآن', tenses: ['present-continuous'] },
  { en: 'at the moment', ar: 'في هذه اللحظة', tenses: ['present-continuous'] },
  { en: 'this week', ar: 'هذا الأسبوع', tenses: ['present-continuous', 'present-perfect', 'present-perfect-continuous', 'future-simple'] },
  { en: 'yesterday', ar: 'أمس', tenses: ['past-simple', 'past-continuous'] },
  { en: 'last week', ar: 'الأسبوع الماضي', tenses: ['past-simple', 'past-continuous'] },
  { en: 'two days ago', ar: 'قبل يومين', tenses: ['past-simple'] },
  { en: 'at ten yesterday', ar: 'في العاشرة أمس', tenses: ['past-continuous', 'past-simple'] },
  { en: 'tomorrow', ar: 'غداً', tenses: ['future-simple', 'future-continuous', 'present-continuous'] },
  { en: 'next week', ar: 'الأسبوع القادم', tenses: ['future-simple', 'future-continuous', 'present-continuous'] },
  { en: 'later', ar: 'لاحقاً', tenses: ['future-simple'] },
  { en: 'at ten tomorrow', ar: 'في العاشرة غداً', tenses: ['future-continuous', 'future-simple', 'present-continuous'] },
  { en: 'since Monday', ar: 'منذ يوم الإثنين', tenses: ['present-perfect', 'present-perfect-continuous'] },
  { en: 'for two hours', ar: 'منذ ساعتين', tenses: ['present-perfect', 'present-perfect-continuous', 'past-perfect-continuous', 'future-perfect-continuous'] },
  { en: 'before the meeting', ar: 'قبل الاجتماع', tenses: ['past-perfect', 'past-perfect-continuous', 'past-simple'] },
  { en: 'by tomorrow', ar: 'بحلول الغد', tenses: ['future-perfect'] },
  { en: 'by next year', ar: 'بحلول العام القادم', tenses: ['future-perfect', 'future-perfect-continuous'] },
];
const DEFAULT_TIME: Record<string, string> = { 'present-simple': 'every day', 'present-continuous': 'now', 'present-perfect': 'this week', 'present-perfect-continuous': 'for two hours', 'past-simple': 'yesterday', 'past-continuous': 'at ten yesterday', 'past-perfect': 'before the meeting', 'past-perfect-continuous': 'for two hours', 'future-simple': 'tomorrow', 'future-continuous': 'at ten tomorrow', 'future-perfect': 'by tomorrow', 'future-perfect-continuous': 'by next year' };

export function BuilderPage() {
  const { s, set, visit } = useStore();
  useEffect(() => { visit('builder'); }, []);
  const [subj, setSubj] = useState('he'); const [verb, setVerb] = useState('work'); const [tense, setTense] = useState('present-simple');
  const [form, setForm] = useState<Form>('aff'); const [compMode, setCompMode] = useState<'default' | 'none' | 'custom'>('none'); const [custom, setCustom] = useState('');
  const [time, setTime] = useState('every day');
  const auto = s.settings.autoTime; const contracted = s.settings.contracted;
  const changeTense = (t: string) => {
    setTense(t);
    const te = BUILDER_TIMES.find((x) => x.en === time)!;
    if (auto && time && !te.tenses.includes(t)) setTime(DEFAULT_TIME[t]);
  };
  const T = parseTense(tense); const S = SUBJECT_MAP[subj]; const V = VERB_MAP[verb];
  const cleanCustom = custom.replace(/[^A-Za-z0-9' ,-]/g, '').trim();
  const comp = compMode === 'default' ? V.comp : compMode === 'custom' ? cleanCustom : '';
  const b = build(S, V, T, form, { comp: comp || undefined, time: time || undefined, contracted });
  const te = BUILDER_TIMES.find((x) => x.en === time)!;
  const timeWarn = time && !te.tenses.includes(tense);
  const ar = arabicSentence(S, verb, T, form, compMode === 'default', te.ar || undefined);
  const goodTimes = BUILDER_TIMES.filter((x) => x.en && x.tenses.includes(tense));
  const verbs = useMemo(() => VERBS.filter((x) => x.base !== 'be').sort((a, c) => (AR_VERBS[c.base] ? 1 : 0) - (AR_VERBS[a.base] ? 1 : 0)), []);
  return (
    <div>
      <PageHead title="Sentence Builder" ar="بناء الجمل" hue="indigo" icon={<Puzzle />} sub="Choose the parts; the builder applies the grammar rules (agreement, helping verbs, verb forms) and warns you about combinations that do not fit." subAr="اختر أجزاء الجملة، والأداة تطبق القواعد وتنبهك إلى التراكيب غير المناسبة." />
      <Card className="mb-6 overflow-hidden">
        <div className="border-b border-slate-100 bg-gradient-to-b from-indigo-50/70 to-white p-6">
          <div className="flex items-start gap-3"><div className="min-w-0 flex-1"><Tokens tokens={b.tokens} big legend /></div><Speak text={b.text} className="mt-1" /><Speak text={b.text} slow /></div>
          {ar ? <Tr ar={ar} className="mt-4 text-xl" /> : <p dir="rtl" className="mt-4 font-ar text-slate-500">المعنى: {V.ar} · {TENSE_MAP[tense].ar}{te.ar ? ` · ${te.ar}` : ''}</p>}
          {!ar && s.settings.lang !== 'en' && <p className="mt-1 text-xs text-slate-400">Full Arabic translation is available for the {Object.keys(AR_VERBS).length} core verbs (listed first). For other verbs you see a meaning guide.</p>}
          {compMode === 'custom' && ar && <p className="mt-1 text-xs text-slate-400">The Arabic line does not include your own object text.</p>}
          <p className="mt-3 text-sm text-slate-500">Formula: <b className="text-slate-700">{b.formula}</b></p>
        </div>
        {(b.warning || timeWarn) && <div className="space-y-2 border-b border-amber-100 bg-amber-50 p-4 text-sm text-amber-900">
          {b.warning && <p className="flex gap-2"><AlertTriangle size={18} className="shrink-0" />{b.warning}</p>}
          {timeWarn && <div className="flex flex-wrap items-center gap-2"><AlertTriangle size={18} className="shrink-0" /><span>“{time}” does not usually go with the {TENSE_MAP[tense].en}. Try:</span>{goodTimes.map((x) => <button key={x.en} onClick={() => setTime(x.en)} className="rounded-full border border-amber-300 bg-white px-2.5 py-0.5 hover:bg-amber-100">{x.en}</button>)}</div>}
        </div>}
        <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
          <Select label="1 · Subject" value={subj} onChange={setSubj} options={SUBJECTS.map((x) => ({ v: x.id, l: `${x.id === 'I' ? 'I' : x.en} · ${x.ar.replace(' (لغير العاقل)', '')}` }))} />
          <Select label="2 · Verb" value={verb} onChange={setVerb} options={verbs.map((x) => ({ v: x.base, l: `${x.base} · ${x.ar}${AR_VERBS[x.base] ? '' : ''}` }))} />
          <Select label="3 · Tense" value={tense} onChange={changeTense} options={TENSES_BY_ORDER.map((t) => ({ v: t.id, l: `${t.en} · ${t.ar}` }))} />
          <div><span className="mb-1 block text-xs font-medium text-slate-500">4 · Sentence type</span><div className="flex flex-wrap gap-1.5">{FORMS.map((f) => <Chip key={f.id} on={form === f.id} onClick={() => setForm(f.id)}>{f.en}</Chip>)}</div></div>
          <div><span className="mb-1 block text-xs font-medium text-slate-500">5 · Object or complement</span><div className="flex flex-wrap gap-1.5"><Chip on={compMode === 'none'} onClick={() => setCompMode('none')}>None</Chip><Chip on={compMode === 'default'} onClick={() => setCompMode('default')}>“{V.comp || '—'}”</Chip><Chip on={compMode === 'custom'} onClick={() => setCompMode('custom')}>My own</Chip></div>
            {compMode === 'custom' && <input value={custom} onChange={(e) => setCustom(e.target.value)} maxLength={40} placeholder="e.g. the new contract" className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-base" />}</div>
          <Select label="6 · Time expression" value={time} onChange={setTime} options={BUILDER_TIMES.map((x) => ({ v: x.en, l: x.en ? `${x.en} · ${x.ar}${x.tenses.includes(tense) ? '' : '  (does not fit)'}` : 'None' }))} />
        </div>
        <div className="flex flex-wrap gap-5 border-t border-slate-100 px-5 py-3 text-sm text-slate-600">
          <label className="flex min-h-[44px] items-center gap-2"><input type="checkbox" className="h-5 w-5" checked={auto} onChange={(e) => set((p) => ({ ...p, settings: { ...p.settings, autoTime: e.target.checked } }))} /> Change the time expression automatically when I change the tense</label>
          <label className="flex min-h-[44px] items-center gap-2"><input type="checkbox" className="h-5 w-5" checked={contracted} onChange={(e) => set((p) => ({ ...p, settings: { ...p.settings, contracted: e.target.checked } }))} /> Use contractions (doesn't, won't)</label>
        </div>
      </Card>
      <Section title="The same sentence in all four forms" ar="الجملة نفسها بالأشكال الأربعة">
        <div className="grid gap-3 md:grid-cols-2">{FORMS.map((f) => { const x = build(S, V, T, f.id, { comp: comp || undefined, time: time || undefined, contracted }); return <Card key={f.id} className={cx('p-4', f.id === form && 'ring-2 ring-indigo-200')} onClick={() => setForm(f.id)}><p className="text-xs font-semibold text-slate-500">{f.en} <ArLabel>{f.ar}</ArLabel></p><p className="mt-1 text-lg">{x.text}</p></Card>; })}</div>
      </Section>
      <Section title="Colour key" ar="دليل الألوان"><div className="flex flex-wrap gap-2">{Object.entries(ROLE_NAME).map(([r, n]) => <span key={r} className={cx('rounded-lg border px-3 py-1 text-sm', ROLE_CLS[r])}>{n.en} <ArLabel>{n.ar}</ArLabel></span>)}</div></Section>
    </div>
  );
}

function speakSeq(lines: string[], rate: number) {
  if (!canSpeak) return;
  window.speechSynthesis.cancel();
  const vs = window.speechSynthesis.getVoices();
  const voice = vs.find((x) => x.lang === 'en-GB') ?? vs.find((x) => x.lang.startsWith('en'));
  lines.forEach((l) => { const u = new SpeechSynthesisUtterance(l); if (voice) u.voice = voice; u.lang = voice?.lang ?? 'en-GB'; u.rate = rate; window.speechSynthesis.speak(u); });
}

export function ConversationsPage() {
  const { s, visit, recordAnswer } = useStore(); const { startQuiz, go } = useNav();
  useEffect(() => { visit('conversations', 'conversations'); }, []);
  const [id, setId] = useState(CONVERSATIONS[0].id); const [open, setOpen] = useState<number | null>(null);
  const [cat, setCat] = useState<'all' | 'business' | 'everyday'>('all');
  const [pick, setPick] = useState<string | null>(null);
  const c = CONVERSATIONS.find((x) => x.id === id)!;
  useEffect(() => { setOpen(null); setPick(null); }, [id]);
  const blankLine = c.lines[c.blank]; const right = c.choices[0];
  const choices = useMemo(() => [...c.choices].sort(), [id]);
  const q = questionsFor('conversations').find((x) => x.id === `g-cv-${c.id}`);
  return (
    <div>
      <PageHead title="Everyday Conversations" ar="المحادثات اليومية والمهنية" hue="teal" icon={<MessagesSquare />} sub="Practical dialogues for a business leader. Every sentence is tagged with its tense — tap a sentence to see its grammar." subAr="محادثات عملية لرجل الأعمال. كل جملة موسومة بزمنها، اضغط على الجملة لترى شرحها." />
      <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <div>
          <div className="mb-3 flex gap-2">{(['all', 'business', 'everyday'] as const).map((k) => <Chip key={k} hue="teal" on={cat === k} onClick={() => setCat(k)}>{k === 'all' ? 'All' : k === 'business' ? 'Business' : 'Everyday'}</Chip>)}</div>
          <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">{CONVERSATIONS.filter((x) => cat === 'all' || x.cat === cat).map((x) => (
            <button key={x.id} onClick={() => setId(x.id)} className={cx('shrink-0 rounded-xl border px-4 py-3 text-left transition lg:w-full', id === x.id ? 'border-teal-300 bg-teal-50' : 'border-slate-200 bg-white hover:border-slate-300')}>
              <span className="block font-medium text-slate-900">{x.en}</span><ArLabel className="block text-sm text-slate-500">{x.ar}</ArLabel>
            </button>))}</div>
        </div>
        <div className="min-w-0">
          <Card className="p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2"><div><p className="text-xl font-semibold">{c.en}</p><ArLabel className="text-slate-500">{c.ar}</ArLabel></div>{canSpeak && <Btn variant="soft" hue="teal" onClick={() => speakSeq(c.lines.map((l) => l.en), s.settings.rate)}><Play size={18} /> Play conversation</Btn>}</div>
            <div className="space-y-3">{c.lines.map((l, i) => { const h = hueOfTense(l.tense); const odd = i % 2 === 1; return (
              <div key={i} className={cx('flex', odd ? 'justify-end' : 'justify-start')}>
                <div className={cx('max-w-[92%] rounded-2xl border p-4 sm:max-w-[80%]', odd ? 'rounded-tr-md border-slate-200 bg-slate-50' : 'rounded-tl-md border-teal-100 bg-white')}>
                  <p className="mb-1 text-xs font-semibold text-slate-500">{l.who}</p>
                  <button type="button" onClick={() => setOpen(open === i ? null : i)} className="text-left text-[17px] text-slate-900 hover:underline decoration-dotted underline-offset-4" aria-expanded={open === i}>{l.en}</button>
                  <Tr ar={l.ar} className="mt-1" />
                  <div className="mt-2 flex items-center gap-2"><button onClick={() => go(l.tense)} className={cx('rounded-full px-2 py-0.5 text-xs font-medium', HUE[h].soft, HUE[h].text)}>{TENSE_MAP[l.tense].en}</button><Speak text={l.en} /></div>
                  {open === i && <p className="mt-2 flex gap-2 rounded-lg bg-white p-2.5 text-sm text-slate-700 ring-1 ring-slate-200"><Info size={16} className="mt-0.5 shrink-0 text-slate-400" />{l.note}</p>}
                </div>
              </div>); })}</div>
          </Card>
          <Card className="mt-4 p-5">
            <p className="mb-1 font-semibold">Complete the conversation <ArLabel className="font-normal text-slate-500">أكمل المحادثة</ArLabel></p>
            <p className="mb-3 text-lg"><span className="text-sm font-semibold text-slate-500">{blankLine.who}: </span>{blankLine.en.replace(right, '_____')}</p>
            <div className="flex flex-wrap gap-2">{choices.map((ch) => { const st = pick ? (ch === right ? 'right' : ch === pick ? 'wrong' : '') : ''; return <button key={ch} disabled={!!pick} onClick={() => { setPick(ch); if (q) recordAnswer(q, ch, ch === right); }} className={cx('min-h-[44px] rounded-xl border px-4', st === 'right' ? 'border-emerald-400 bg-emerald-50 text-emerald-800' : st === 'wrong' ? 'border-rose-300 bg-rose-50 text-rose-800' : 'border-slate-300 bg-white hover:border-teal-300')}>{ch}</button>; })}</div>
            {pick && <div className={cx('mt-3 rounded-xl p-3 text-sm', pick === right ? 'bg-emerald-50 text-emerald-900' : 'bg-rose-50 text-rose-900')}>{pick === right ? <CheckCircle2 size={16} className="me-1 inline" /> : <XCircle size={16} className="me-1 inline" />}{pick === right ? 'Correct! ' : `Correct answer: “${right}”. `}{blankLine.note}<button className="ms-2 underline" onClick={() => setPick(null)}>Try again</button></div>}
          </Card>
          <Btn className="mt-4" hue="amber" onClick={() => startQuiz({ title: 'Conversations quiz', questions: pickQuestions(questionsFor('conversations'), 8), kind: 'lesson', ref: 'conversations', mode: 'practice' })}><PlayCircle size={18} /> Conversations quiz (8 questions)</Btn>
        </div>
      </div>
    </div>
  );
}
