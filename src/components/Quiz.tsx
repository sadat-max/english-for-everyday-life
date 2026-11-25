import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, XCircle, Lightbulb, RotateCcw, ArrowRight, ListChecks, Volume2, Undo2, Trophy, Target, Snail } from 'lucide-react';
import { Question, MISTAKE_CATS } from '../data/questions';
import { LESSON_MAP } from '../data/content';
import { isCorrect, shuffle, prep } from '../lib/quiz';
import { useStore } from '../store/store';
import { useNav } from '../lib/nav';
import { Btn, Card, Ex, Progress, cx, speak, canSpeak, Badge, ArLabel, Chip } from '../lib/ui';

type Ans = { given: string; ok: boolean };

function MatchInput({ q, onChange, disabled }: { q: Question; onChange: (v: string, ok: boolean, complete: boolean) => void; disabled: boolean }) {
  const right = useMemo(() => shuffle(q.pairs!.map((p) => p[1])), [q.id]);
  const [sel, setSel] = useState<string | null>(null);
  const [map, setMap] = useState<Record<string, string>>({});
  useEffect(() => { setMap({}); setSel(null); }, [q.id]);
  const used = new Set(Object.values(map));
  const pick = (r: string) => {
    if (!sel || disabled) return;
    const m = { ...map, [sel]: r };
    setMap(m); setSel(null);
    const complete = Object.keys(m).length === q.pairs!.length;
    const ok = q.pairs!.every(([l, rr]) => m[l] === rr);
    onChange(q.pairs!.map(([l]) => `${l} = ${m[l] ?? '?'}`).join(' · '), ok, complete);
  };
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-2">{q.pairs!.map(([l]) => (
        <button key={l} data-left type="button" disabled={disabled} onClick={() => setSel(l)} className={cx('flex min-h-[48px] w-full items-center justify-between rounded-xl border px-3 text-left', sel === l ? 'border-indigo-400 bg-indigo-50 ring-2 ring-indigo-200' : map[l] ? 'border-slate-200 bg-slate-50' : 'border-slate-300 bg-white hover:border-indigo-300')}>
          <span className="font-medium">{l}</span>{map[l] && <span dir="rtl" className="font-ar text-sm text-slate-500">{map[l]}</span>}
        </button>))}</div>
      <div className="space-y-2">{right.map((r) => (
        <button key={r} data-right type="button" disabled={disabled || !sel} onClick={() => pick(r)} dir="rtl" className={cx('min-h-[48px] w-full rounded-xl border px-3 text-right font-ar', used.has(r) ? 'border-slate-200 bg-slate-50 text-slate-400' : 'border-slate-300 bg-white hover:border-indigo-300', !sel && 'cursor-default')}>{r}</button>))}
        {!disabled && Object.keys(map).length > 0 && <button type="button" onClick={() => { setMap({}); onChange('', false, false); }} className="text-sm text-slate-500 hover:text-slate-800"><Undo2 size={14} className="inline" /> Reset</button>}
      </div>
      <p className="col-span-2 text-sm text-slate-500">Tap an English word, then its meaning. <ArLabel>اختر الكلمة ثم معناها.</ArLabel></p>
    </div>
  );
}

function ReorderInput({ q, value, setValue, disabled }: { q: Question; value: number[]; setValue: (v: number[]) => void; disabled: boolean }) {
  const w = q.words!;
  return (
    <div>
      <div className="mb-3 flex min-h-[56px] flex-wrap items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-3">
        {value.length === 0 && <span className="text-sm text-slate-400">Tap the words below in order…</span>}
        {value.map((i, k) => <button key={k} type="button" disabled={disabled} onClick={() => setValue(value.filter((_, j) => j !== k))} className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 font-medium text-indigo-800">{w[i]}</button>)}
      </div>
      <div className="flex flex-wrap gap-2">
        {w.map((x, i) => <button key={i} data-word type="button" disabled={disabled || value.includes(i)} onClick={() => setValue([...value, i])} className={cx('min-h-[44px] rounded-lg border px-3 py-1.5', value.includes(i) ? 'border-slate-100 bg-slate-50 text-slate-300' : 'border-slate-300 bg-white hover:border-indigo-300')}>{x}</button>)}
      </div>
    </div>
  );
}

export function QuizRunner({ questions: initial, title, titleAr, kind, refId, mode: initialMode, compact, record = true, onClose }: {
  questions: Question[]; title: string; titleAr?: string; kind: any; refId: string; mode: 'practice' | 'exam'; compact?: boolean; record?: boolean; onClose?: () => void;
}) {
  const { recordAnswer, recordQuiz } = useStore();
  const { go, startQuiz } = useNav();
  const [questions, setQuestions] = useState(initial);
  const [mode] = useState(initialMode);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Ans>>({});
  const [input, setInput] = useState('');
  const [order, setOrder] = useState<number[]>([]);
  const [match, setMatch] = useState<{ v: string; ok: boolean; complete: boolean }>({ v: '', ok: false, complete: false });
  const [checked, setChecked] = useState(false);
  const [hint, setHint] = useState(false);
  const [phase, setPhase] = useState<'run' | 'report' | 'review'>('run');
  const inputRef = useRef<HTMLInputElement>(null);
  const q = questions[idx];

  useEffect(() => { setQuestions(initial); setIdx(0); setAnswers({}); setPhase('run'); }, [initial]);
  useEffect(() => { setInput(''); setOrder([]); setMatch({ v: '', ok: false, complete: false }); setChecked(false); setHint(false); if (q?.type === 'listen' && canSpeak && !compact) { /* user starts audio with the button */ } }, [idx, q?.id]);

  if (!q && phase === 'run') return null;
  const total = questions.length;
  const isText = q && ['fill', 'translate', 'convert', 'correct'].includes(q.type);
  const ready = q && (isText ? input.trim().length > 0 : q.type === 'reorder' ? order.length === q.words!.length : q.type === 'match' ? match.complete : input !== '');

  const submit = () => {
    if (!ready || checked) return;
    let given = input; let ok = false;
    if (q.type === 'reorder') { given = order.map((i) => q.words![i]).join(' '); ok = isCorrect(q, given); }
    else if (q.type === 'match') { given = match.v; ok = match.ok; }
    else ok = isCorrect(q, given.trim());
    setAnswers((a) => ({ ...a, [q.id]: { given, ok } }));
    if (mode === 'practice') { setChecked(true); if (record) recordAnswer(q, given, ok); }
    else next({ ...answers, [q.id]: { given, ok } });
  };
  const finish = (all: Record<string, Ans>) => {
    const score = questions.filter((x) => all[x.id]?.ok).length;
    const cats: Record<string, [number, number]> = {};
    questions.forEach((x) => { const c = (cats[x.cat] ??= [0, 0]); c[1]++; if (all[x.id]?.ok) c[0]++; });
    if (mode === 'exam' && record) questions.forEach((x) => all[x.id] && recordAnswer(x, all[x.id].given, all[x.id].ok));
    if (record && kind) recordQuiz({ kind, ref: refId, title, score, total, pct: Math.round((score / total) * 100), mode, cats });
    setPhase('report');
  };
  const next = (all = answers) => { if (idx + 1 < total) setIdx(idx + 1); else finish(all); };

  if (phase !== 'run') {
    const score = questions.filter((x) => answers[x.id]?.ok).length;
    const pct = Math.round((score / total) * 100);
    const wrong = questions.filter((x) => !answers[x.id]?.ok);
    const weakCats = Array.from(new Set(wrong.map((x) => x.cat)));
    const weakLessons = Array.from(new Set(wrong.map((x) => x.lesson))).filter((l) => LESSON_MAP[l]);
    const pass = pct >= 80;
    return (
      <div className={cx('space-y-6', compact && 'space-y-4')}>
        <Card className="overflow-hidden">
          <div className={cx('flex flex-wrap items-center gap-6 p-6', pass ? 'bg-emerald-50' : 'bg-amber-50')}>
            <div className={cx('grid h-24 w-24 place-items-center rounded-full border-4 bg-white text-3xl font-semibold', pass ? 'border-emerald-500 text-emerald-700' : 'border-amber-500 text-amber-700')}>{pct}%</div>
            <div className="flex-1">
              <p className="text-sm text-slate-500">{title}</p>
              <p className="text-2xl font-semibold text-slate-900">{score} / {total} correct</p>
              <Ex className="mt-1" en={pass ? 'Mastery reached (80% or more). Well done!' : 'Below the 80% mastery level. Review the lessons below and practise again — every lesson stays open.'}
                ar={pass ? 'أحسنت! وصلت إلى مستوى الإتقان (80% أو أكثر).' : 'أقل من مستوى الإتقان 80%. راجع الدروس المقترحة وتدرّب مرة أخرى.'} />
            </div>
            {pass ? <Trophy className="text-emerald-600" size={40} /> : <Target className="text-amber-600" size={40} />}
          </div>
          {!compact && (
            <div className="grid gap-6 p-6 md:grid-cols-2">
              <div>
                <h3 className="mb-3 font-semibold text-slate-800">By grammar area <ArLabel className="text-sm font-normal text-slate-500">حسب المهارة</ArLabel></h3>
                <ul className="space-y-3">{Object.entries(questions.reduce((m, x) => { const c = (m[x.cat] ??= [0, 0]); c[1]++; if (answers[x.id]?.ok) c[0]++; return m; }, {} as Record<string, number[]>)).map(([c, [r, t]]) => (
                  <li key={c}><div className="mb-1 flex justify-between text-sm"><span>{MISTAKE_CATS[c as keyof typeof MISTAKE_CATS].en}</span><span className="tabular-nums text-slate-500">{r}/{t}</span></div><Progress pct={(r / t) * 100} hue={r / t >= 0.8 ? 'green' : r / t >= 0.5 ? 'amber' : 'red'} /></li>))}</ul>
              </div>
              <div>
                <h3 className="mb-3 font-semibold text-slate-800">{weakLessons.length ? 'Recommended review' : 'Strengths'} <ArLabel className="text-sm font-normal text-slate-500">{weakLessons.length ? 'مراجعة مقترحة' : 'نقاط القوة'}</ArLabel></h3>
                {weakLessons.length ? <div className="flex flex-wrap gap-2">{weakLessons.map((l) => <Chip key={l} onClick={() => go(LESSON_MAP[l].page)}>{LESSON_MAP[l].en} <ArrowRight size={14} /></Chip>)}</div>
                  : <p className="text-slate-600">No mistakes in this set. Try a harder challenge or the next lesson.</p>}
                {weakCats.length > 0 && <p className="mt-3 text-sm text-slate-500">Your incorrect answers were saved in <button className="text-indigo-700 underline" onClick={() => go('mistakes')}>My Mistakes</button> for later review.</p>}
              </div>
            </div>
          )}
          <div className="flex flex-wrap gap-2 border-t border-slate-100 p-4">
            <Btn variant="soft" onClick={() => setPhase(phase === 'review' ? 'report' : 'review')}><ListChecks size={18} /> {phase === 'review' ? 'Hide answers' : 'Review answers'}</Btn>
            {wrong.length > 0 && <Btn variant="soft" hue="amber" onClick={() => { if (compact) { setQuestions(wrong.map((x) => prep(x))); setIdx(0); setAnswers({}); setPhase('run'); } else startQuiz({ title: `Retry: ${title}`, questions: wrong.map((x) => prep(x)), kind: 'mistakes', ref: refId, mode: 'practice' }); }}><RotateCcw size={18} /> Retry incorrect ({wrong.length})</Btn>}
            <Btn variant="outline" onClick={() => { setQuestions(questions.map((x) => prep(x))); setIdx(0); setAnswers({}); setPhase('run'); }}><RotateCcw size={18} /> Retake</Btn>
            {onClose && <Btn variant="ghost" onClick={onClose}>Close</Btn>}
          </div>
        </Card>
        {phase === 'review' && <div className="space-y-3">{questions.map((x, i) => <ReviewItem key={x.id} q={x} n={i + 1} a={answers[x.id]} />)}</div>}
      </div>
    );
  }

  const fb = answers[q.id];
  const wrongWhy = checked && fb && !fb.ok && q.why?.[fb.given];
  return (
    <Card className={cx('overflow-hidden', compact && 'shadow-none')}>
      <div className="border-b border-slate-100 px-5 pb-4 pt-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="font-medium text-slate-500">Question {idx + 1} of {total}</span>
          <div className="flex items-center gap-2">
            <Badge hue={mode === 'exam' ? 'purple' : 'amber'}>{mode === 'exam' ? 'Exam mode' : 'Practice mode'}</Badge>
            <span className="tabular-nums text-slate-500">Score {questions.filter((x) => answers[x.id]?.ok).length}{mode === 'exam' ? ' (hidden)' : ''}</span>
          </div>
        </div>
        <Progress pct={((idx + (checked ? 1 : 0)) / total) * 100} hue="amber" />
      </div>
      <div className="space-y-5 p-5">
        <div>
          <Ex en={<span className="text-[19px] font-bold text-[#07163F]">{q.prompt}</span>} ar={q.promptAr} />
          {q.text && q.type !== 'listen' && (
            <div className={cx('mt-3 whitespace-pre-line rounded-xl border border-[#C5D8F5] bg-[#EEF5FF] px-4 py-3 text-[19px] font-semibold text-[#07163F]', q.type === 'translate' && 'font-ar text-right text-xl')} dir={q.type === 'translate' ? 'rtl' : undefined}>{q.text}</div>
          )}
          {q.type === 'listen' && (
            <div className="mt-3 flex flex-wrap gap-2">
              {canSpeak ? <><Btn variant="soft" onClick={() => speak(q.text!, 0.9)}><Volume2 size={18} /> Play</Btn><Btn variant="ghost" onClick={() => speak(q.text!, 0.6)}><Snail size={18} /> Slow</Btn></>
                : <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Speech is not available in this browser. The sentence is: <b>{q.text}</b></p>}
            </div>
          )}
        </div>

        {q.choices && (
          <div className="grid gap-2">
            {q.choices.map((c, i) => {
              const chosen = input === c; const isAns = c === q.answer;
              const state = checked ? (isAns ? 'right' : chosen ? 'wrong' : 'idle') : chosen ? 'sel' : 'idle';
              return (
                <button key={c} type="button" disabled={checked} onClick={() => setInput(c)}
                  className={cx('flex min-h-[52px] items-center gap-3 rounded-xl border px-4 py-2 text-left text-[16px] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400',
                    state === 'sel' && 'border-amber-400 bg-amber-50 ring-2 ring-amber-200', state === 'right' && 'border-emerald-400 bg-emerald-50 text-emerald-900', state === 'wrong' && 'border-rose-300 bg-rose-50 text-rose-900', state === 'idle' && 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50')}>
                  <span className={cx('grid h-7 w-7 shrink-0 place-items-center rounded-lg text-sm font-semibold', state === 'right' ? 'bg-emerald-600 text-white' : state === 'wrong' ? 'bg-rose-400 text-white' : 'bg-slate-100 text-slate-500')}>{String.fromCharCode(65 + i)}</span>
                  <span className="flex-1">{c}</span>
                  {state === 'right' && <CheckCircle2 className="text-emerald-600" size={20} />}{state === 'wrong' && <XCircle className="text-rose-500" size={20} />}
                </button>
              );
            })}
          </div>
        )}
        {isText && (
          <input ref={inputRef} value={input} disabled={checked} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} autoCapitalize="off" autoCorrect="off" spellCheck={false}
            placeholder={q.type === 'fill' ? 'Type the missing words…' : 'Type your answer…'} aria-label="Your answer"
            className={cx('h-12 w-full rounded-xl border px-4 text-base focus:outline-none focus:ring-2', checked ? (fb?.ok ? 'border-emerald-400 bg-emerald-50' : 'border-rose-300 bg-rose-50') : 'border-slate-300 focus:border-amber-400 focus:ring-amber-200')} />
        )}
        {q.type === 'reorder' && <ReorderInput q={q} value={order} setValue={setOrder} disabled={checked} />}
        {q.type === 'match' && <MatchInput q={q} disabled={checked} onChange={(v, ok, complete) => setMatch({ v, ok, complete })} />}

        {hint && !checked && <div className="flex gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-900"><Lightbulb size={18} className="shrink-0" /><span>{q.hint ?? (q.rule && LESSON_MAP[q.rule] ? `Think about: ${LESSON_MAP[q.rule].en}.` : 'Look carefully at the subject and the helping verb.')}</span></div>}

        {checked && fb && (
          <div className={cx('rounded-xl border p-4', fb.ok ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50')} role="status">
            <p className={cx('mb-2 flex items-center gap-2 font-semibold', fb.ok ? 'text-emerald-800' : 'text-rose-800')}>
              {fb.ok ? <><CheckCircle2 size={20} /> Correct! <ArLabel>إجابة صحيحة</ArLabel></> : <><XCircle size={20} /> Not quite. <ArLabel>إجابة غير صحيحة</ArLabel></>}
            </p>
            {!fb.ok && <p className="mb-2 text-slate-800">Correct answer: <b>{q.type === 'match' ? q.pairs!.map(([l, r]) => `${l} = ${r}`).join(' · ') : q.answer}</b>{canSpeak && q.type !== 'match' && <button className="ms-2 inline-flex text-slate-500" onClick={() => speak(q.answer)} aria-label="Listen to the answer"><Volume2 size={16} /></button>}</p>}
            {wrongWhy && <Ex className="mb-2" en={<span><b>Why your answer is wrong:</b> {wrongWhy.en}</span>} ar={wrongWhy.ar} small />}
            <Ex en={q.en} ar={q.ar} small />
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <button type="button" onClick={() => setHint(!hint)} disabled={checked} className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl px-3 text-sm text-slate-500 hover:bg-slate-100 disabled:opacity-40"><Lightbulb size={16} /> {hint ? 'Hide hint' : 'Hint'}</button>
          {!checked ? <Btn hue="amber" onClick={submit} disabled={!ready}>{mode === 'exam' ? (idx + 1 === total ? 'Submit test' : 'Save & next') : 'Submit answer'}</Btn>
            : <Btn hue="amber" onClick={() => next()}>{idx + 1 === total ? 'See results' : 'Next question'} <ArrowRight size={18} /></Btn>}
        </div>
      </div>
    </Card>
  );
}

function ReviewItem({ q, n, a }: { q: Question; n: number; a?: Ans }) {
  const why = a && !a.ok ? q.why?.[a.given] : undefined;
  return (
    <Card className={cx('p-4', a?.ok ? 'border-emerald-200' : 'border-rose-200')}>
      <div className="flex items-start gap-3">
        {a?.ok ? <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={20} /> : <XCircle className="mt-0.5 shrink-0 text-rose-500" size={20} />}
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-sm text-slate-500">{n}. {q.prompt}</p>
          {q.text && q.type !== 'listen' && <p className="whitespace-pre-line font-medium" dir={q.type === 'translate' ? 'rtl' : undefined}>{q.text}</p>}
          <p className="text-sm">Your answer: <span className={a?.ok ? 'text-emerald-700' : 'text-rose-700'}>{a?.given || '—'}</span></p>
          {!a?.ok && <p className="text-sm">Correct: <b className="text-emerald-700">{q.type === 'match' ? q.pairs!.map(([l, r]) => `${l} = ${r}`).join(' · ') : q.answer}</b></p>}
          {why && <Ex en={why.en} ar={why.ar} small />}
          <Ex en={q.en} ar={q.ar} small className="text-slate-500" />
        </div>
      </div>
    </Card>
  );
}

/** Short checks embedded in lessons (practice mode, answers recorded, no quiz record). */
export function KnowledgeCheck({ questions, title = 'Quick check' }: { questions: Question[]; title?: string }) {
  const [open, setOpen] = useState(false);
  if (!questions.length) return null;
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><p className="font-semibold text-amber-900">{title} · {questions.length} question{questions.length > 1 ? 's' : ''}</p><ArLabel className="text-sm text-amber-800">اختبر فهمك سريعاً</ArLabel></div>
        {!open && <Btn hue="amber" variant="soft" onClick={() => setOpen(true)}>Start</Btn>}
      </div>
      {open && <div className="mt-4"><QuizRunner questions={questions} title={title} kind={null} refId="" mode="practice" compact record onClose={() => setOpen(false)} /></div>}
    </div>
  );
}
