import React, { useEffect, useMemo, useState } from 'react';
import { Sun, History, Rocket, Layers, GitCompare, ArrowRight, CheckCircle2, XCircle, PlayCircle, Info, AlertTriangle, List, Waves, CircleCheck, Infinity as InfinityIcon, CalendarDays, Clock3, FastForward, ChevronRight, MousePointerClick } from 'lucide-react';
import { TENSES, TENSE_MAP, TENSES_BY_ORDER, Tense, FUTURE_WAYS } from '../data/tenses';
import { VERBS, VERB_MAP } from '../data/verbs';
import { build, SUBJECTS, SUBJECT_MAP, FORMS, parseTense, shortAnswers, Form } from '../engine/grammar';
import { arabicSentence, AR_VERBS } from '../engine/arabic';
import { questionsFor, QUESTIONS } from '../data/questions';
import { TIME_EXPR } from '../data/content';
import { pickQuestions, lessonQuiz } from '../lib/quiz';
import { useNav } from '../lib/nav';
import { useStore } from '../store/store';
import { Badge, Btn, Card, Chip, Ex, HUE, Hue, PageHead, Section, Select, Speak, Timeline, Tokens, Tr, cx, hueOfTense, ArLabel } from '../lib/ui';
import { KnowledgeCheck } from '../components/Quiz';

export const MATRIX_VERBS = ['work', 'eat', 'go', 'speak', 'buy', 'sell', 'travel', 'call', 'write', 'study', 'visit', 'meet'];
const verbOptions = (list: string[]) => list.map((v) => ({ v, l: `${v} · ${VERB_MAP[v].ar}` }));
const ALL_VERB_OPTS = VERBS.filter((v) => v.base !== 'be').map((v) => ({ v: v.base, l: `${v.base} · ${v.ar}` }));

const ROWS: { a: string; en: string; ar: string; icon: React.ReactNode }[] = [
  { a: 'simple', en: 'Simple', ar: 'البسيط', icon: <List size={18} /> },
  { a: 'continuous', en: 'Continuous', ar: 'المستمر', icon: <Waves size={18} /> },
  { a: 'perfect', en: 'Perfect', ar: 'التام', icon: <CircleCheck size={18} /> },
  { a: 'perfect-continuous', en: 'Perfect Continuous', ar: 'التام المستمر', icon: <InfinityIcon size={18} /> },
];
const COLS: { t: 'present' | 'past' | 'future'; en: string; ar: string; sub: string; subAr: string; hue: Hue; icon: React.ReactNode }[] = [
  { t: 'present', en: 'Present', ar: 'المضارع', sub: 'Now', subAr: 'الآن', hue: 'green', icon: <CalendarDays size={20} /> },
  { t: 'past', en: 'Past', ar: 'الماضي', sub: 'Before', subAr: 'سابقاً', hue: 'purple', icon: <Clock3 size={20} /> },
  { t: 'future', en: 'Future', ar: 'المستقبل', sub: 'Later', subAr: 'لاحقاً', hue: 'orange', icon: <FastForward size={20} /> },
];

/** The 12-tense matrix with arrow-shaped timeline headers; each cell opens its lesson. */
export function TenseMatrix({ className }: { className?: string }) {
  const { go } = useNav();
  const [verb, setVerb] = useState('work');
  const [subj, setSubj] = useState('I');
  return (
    <div className={cx('glass-card glass-strong flex flex-col p-3.5 sm:p-4', className)}>
      <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2">
        <CalendarDays className="text-[#00B83F]" size={24} strokeWidth={2.2} />
        <h2 className="text-[20px] font-extrabold tracking-tight text-[#07163F]">The 12 English Tenses</h2>
        <ArLabel className="text-[18px] font-bold text-[#07163F]">الأزمنة الإنجليزية الاثنا عشر</ArLabel>
        <div className="ms-auto flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#C5D8F5] bg-[#F3F7FF] px-3 py-1 text-xs font-semibold text-[#334A7A]"><MousePointerClick size={14} /> Click any tense to start learning</span>
          <span className="text-xs font-semibold text-[#334A7A]">Example:</span>
          <select aria-label="Example subject" value={subj} onChange={(e) => setSubj(e.target.value)} className="h-8 rounded-lg border border-[#C5D8F5] bg-white px-2 text-sm font-semibold text-[#07163F]">{SUBJECTS.map((x) => <option key={x.id} value={x.id}>{x.id === 'I' ? 'I' : x.en}</option>)}</select>
          <select aria-label="Example verb" value={verb} onChange={(e) => setVerb(e.target.value)} className="h-8 rounded-lg border border-[#C5D8F5] bg-white px-2 text-sm font-semibold text-[#07163F]">{Object.keys(AR_VERBS).map((v) => <option key={v} value={v}>{v}</option>)}<optgroup label="All verbs">{ALL_VERB_OPTS.filter((o) => !AR_VERBS[o.v]).map((o) => <option key={o.v} value={o.v}>{o.v}</option>)}</optgroup></select>
        </div>
      </div>
      <div className="-mx-1 flex flex-1 flex-col overflow-x-auto px-1 pb-1"><div className="grid min-w-[560px] flex-1 grid-cols-[minmax(90px,118px)_repeat(3,minmax(0,1fr))] grid-rows-[auto_repeat(4,minmax(52px,1fr))] gap-[7px]">
        <div />
        <div className="col-span-3 flex">
          {COLS.map((c, i) => (
            <div key={c.t} className={cx('flex-1', i > 0 && '-ml-3')} style={{ filter: `drop-shadow(0 3px 7px ${HUE[c.hue].glow})` }}>
              <div className={cx('arrow-head flex h-[50px] items-center justify-center gap-2 text-white', i === 0 && 'first', i > 0 ? 'pl-6 pr-5' : 'pl-2 pr-5')} style={{ background: HUE[c.hue].grad }}>
                <span className="hidden shrink-0 2xl:inline">{c.icon}</span><div className="min-w-0 text-center leading-tight"><p className="whitespace-nowrap text-[13px] font-bold 2xl:text-[14.5px]">{c.en} – <bdi className="font-ar">{c.ar}</bdi></p><p className="whitespace-nowrap text-[12px] font-semibold text-white/90">({c.sub} / <bdi className="font-ar">{c.subAr}</bdi>)</p></div>
              </div>
            </div>
          ))}
        </div>
        {ROWS.map((r) => (
          <React.Fragment key={r.a}>
            <div className="flex items-center gap-1.5 rounded-xl border border-[#C5D8F5] bg-[#EAF2FF] px-2 py-1.5"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-white text-[#0659D6] shadow-sm [&_svg]:h-4 [&_svg]:w-4">{r.icon}</span><span className="min-w-0 leading-tight"><span className="block text-[13.5px] font-bold text-[#07163F]">{r.en}</span><span dir="rtl" className="block whitespace-nowrap font-ar text-[12.5px] font-semibold text-[#334A7A]" style={{ textAlign: 'left' }}>{r.ar}</span></span></div>
            {COLS.map((c) => {
              const id = `${c.t}-${r.a}`; const h = HUE[c.hue];
              const b = build(SUBJECT_MAP[subj], VERB_MAP[verb], parseTense(id), 'aff');
              const ar = arabicSentence(SUBJECT_MAP[subj], verb, parseTense(id), 'aff', false);
              return (
                <button key={id} type="button" onClick={() => go(id)} title={`Open ${TENSE_MAP[id].en}`} style={{ ['--glow' as string]: h.glow, ['--edge' as string]: h.hex } as React.CSSProperties}
                  className={cx('tcell flex min-h-[54px] items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-left focus-visible:outline-none', h.soft, h.border)}>
                  <span className="min-w-0 flex-1 leading-snug">
                    <span className={cx('block text-[14px] font-bold leading-snug 2xl:text-[15px]', h.text)}>{b.text}</span>
                    {ar && <Tr ar={ar} className="text-[13px] font-semibold !leading-snug !text-[#334155]" />}
                    {b.warning && <span className="block text-[11px] font-semibold text-[#B45309]">Unnatural with “{verb}”</span>}
                  </span>
                  <ChevronRight size={18} className={cx('arr shrink-0', h.text)} strokeWidth={2.6} />
                </button>
              );
            })}
          </React.Fragment>
        ))}
      </div></div>
    </div>
  );
}

function FormsTable({ t, verb, comp }: { t: Tense; verb: string; comp: string }) {
  const { s } = useStore();
  const [subj, setSubj] = useState('he');
  const S = SUBJECT_MAP[subj]; const T = parseTense(t.id); const V = VERB_MAP[verb];
  const [yes, no] = shortAnswers(S, V, T);
  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">{SUBJECTS.map((x) => <Chip key={x.id} hue="teal" on={subj === x.id} onClick={() => setSubj(x.id)}>{x.id === 'I' ? 'I' : x.en}</Chip>)}</div>
      <div className="grid gap-3 md:grid-cols-2">
        {FORMS.map((f) => {
          const full = build(S, V, T, f.id, { comp });
          const short = build(S, V, T, f.id, { comp, contracted: true });
          const ar = arabicSentence(S, verb, T, f.id, true);
          return (
            <Card key={f.id} className="p-4">
              <div className="mb-2 flex items-center justify-between"><span className="text-sm font-semibold text-slate-500">{f.en} <ArLabel className="font-normal">{f.ar}</ArLabel></span><Speak text={full.text} /></div>
              <Tokens tokens={s.settings.contracted ? short.tokens : full.tokens} />
              {f.id === 'neg' && short.text !== full.text && <p className="mt-2 text-sm text-slate-500">Short form: <b className="text-slate-700">{short.text}</b></p>}
              {ar && <Tr ar={ar} className="mt-2" />}
            </Card>
          );
        })}
      </div>
      <Card className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 p-4">
        <span className="text-sm font-semibold text-slate-500">Short answers · <ArLabel>الإجابات القصيرة</ArLabel></span>
        <span className="text-emerald-700">✓ {yes}</span><span className="text-rose-700">✗ {no}</span>
      </Card>
    </div>
  );
}

export function TenseLesson({ id }: { id: string }) {
  const t = TENSE_MAP[id];
  const { go, startQuiz } = useNav();
  const { s, set, visit } = useStore();
  const hue = hueOfTense(id);
  const [verb, setVerb] = useState(t.verb);
  const [topic, setTopic] = useState('All');
  useEffect(() => { visit(id, id); setVerb(t.verb); }, [id]);
  const comp = verb === t.verb ? t.comp : VERB_MAP[verb].comp;
  const T = parseTense(id);
  const checks = useMemo(() => pickQuestions(questionsFor(id).filter((q) => q.level <= 2 && q.type !== 'listen'), 3), [id]);
  const checks2 = useMemo(() => pickQuestions(questionsFor(id).filter((q) => q.type === 'identify' || q.type === 'reorder'), 2), [id]);
  const order = TENSES_BY_ORDER.findIndex((x) => x.id === id);
  const nextT = TENSES_BY_ORDER[order + 1];
  const lesson = s.lessons[id];
  const topics = ['All', ...Array.from(new Set(t.examples.map((e) => e.topic)))];
  const formula = build(SUBJECT_MAP.he, VERB_MAP[verb], T, 'aff').formula;
  const verbChoices = Array.from(new Set([t.verb, ...Object.keys(AR_VERBS).slice(0, 20)]));
  const stat = VERB_MAP[verb].stative;
  const relTimes = TIME_EXPR.filter((x) => x.tenses.includes(id));

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
        <button className="hover:text-slate-800" onClick={() => go(t.aspect.startsWith('perfect') ? 'perfect' : t.time)}>{t.time[0].toUpperCase() + t.time.slice(1)} tenses</button><span>/</span><span>{t.en}</span>
      </div>
      <PageHead title={t.en} ar={t.ar} hue={hue} icon={t.time === 'present' ? <Sun /> : t.time === 'past' ? <History /> : <Rocket />}
        right={<div className="flex flex-wrap items-center gap-2"><Badge hue={hue}>{t.frequency}</Badge>{lesson?.completed && <Badge hue="green"><CheckCircle2 size={12} /> Completed · best {lesson.best ?? 0}%</Badge>}</div>} />

      <nav className="no-print mb-8 flex gap-2 overflow-x-auto pb-2 text-sm">{[['intro', 'Introduction'], ['timeline', 'Timeline'], ['formula', 'Formula'], ['subjects', 'All subjects'], ['forms', 'Four forms'], ['time', 'Time words'], ['examples', 'Examples'], ['mistakes', 'Mistakes'], ['practice', 'Practice'], ['quiz', 'Lesson quiz']].map(([a, l]) => <button key={a} onClick={() => go(id, a)} className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-slate-600 hover:border-slate-300">{l}</button>)}</nav>

      <Section id="intro" letter="A" hue={hue} title="What is it?" ar="ما هو هذا الزمن؟">
        <Card className={cx('mb-4 p-6', HUE[hue].soft, HUE[hue].border)}>
          <Ex en={<span className="text-xl text-slate-900">{t.def}</span>} ar={<span className="text-lg">{t.defAr}</span>} />
          <div className="mt-4 border-t border-black/5 pt-4"><Ex en={<span><b>Why it matters:</b> {t.why}</span>} ar={t.whyAr} small /></div>
        </Card>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{t.uses.map((u) => (
          <Card key={u.en} className="p-4"><p className="font-semibold text-slate-900">{u.en}</p><ArLabel className="block text-sm text-slate-500">{u.ar}</ArLabel><p className="mt-2 flex items-start gap-1 text-slate-700"><span className="flex-1">{u.ex}</span><Speak text={u.ex} /></p></Card>
        ))}</div>
        <p className="mt-4 text-sm text-slate-500">Real-life situations: {t.situations.join(' · ')}</p>
      </Section>

      <Section id="timeline" letter="B" hue={hue} title="Visual timeline" ar="الخط الزمني">
        <Card className="p-5"><Timeline spec={t.timeline} hue={hue} label={t.timelineNote} /><Ex className="mt-2 text-center" en={t.timelineNote} ar={t.timelineNoteAr} small /></Card>
      </Section>

      <Section id="formula" letter="C" hue={hue} title="Sentence formula" ar="صيغة الجملة">
        <Card className="p-5">
          <p className={cx('mb-5 text-center text-2xl font-semibold', HUE[hue].text)}>{formula}</p>
          <div className="grid gap-3 md:grid-cols-3">{t.parts.map((p, i) => (
            <div key={i} className={cx('rounded-xl border p-4', i === 0 ? 'border-teal-200 bg-teal-50/60' : i === 1 ? 'border-sky-200 bg-sky-50/60' : 'border-indigo-200 bg-indigo-50/60')}>
              <p className={cx('font-semibold', i === 0 ? 'text-teal-800' : i === 1 ? 'text-sky-800' : 'text-indigo-800')}>{p.label}</p><Ex className="mt-1" en={p.en} ar={p.ar} small />
            </div>))}</div>
          <div className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
            {(['neg', 'q', 'negq'] as Form[]).map((f) => <div key={f} className="rounded-lg bg-slate-50 px-3 py-2"><span className="text-slate-500">{FORMS.find((x) => x.id === f)!.en}: </span><b>{build(SUBJECT_MAP.he, VERB_MAP[t.verb], T, f, { comp: t.comp, contracted: f !== 'neg' }).text}</b></div>)}
          </div>
        </Card>
        <div className="mt-4"><KnowledgeCheck questions={checks.slice(0, 2)} title="Quick check" /></div>
      </Section>

      <Section id="subjects" letter="D" hue={hue} title="With every subject" ar="مع جميع الضمائر">
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <Select label="Verb" className="w-56" value={verb} onChange={setVerb} options={verbOptions(verbChoices)} />
          <Select label="Any verb" className="w-56" value={verb} onChange={setVerb} options={ALL_VERB_OPTS} />
          <label className="flex min-h-[44px] items-center gap-2 text-sm text-slate-600"><input type="checkbox" className="h-5 w-5" checked={s.settings.contracted} onChange={(e) => set((p) => ({ ...p, settings: { ...p.settings, contracted: e.target.checked } }))} /> Show contractions</label>
        </div>
        {(t.aspect === 'continuous' || t.aspect === 'perfect-continuous') && stat !== 'no' && <p className="mb-3 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-900"><AlertTriangle size={18} className="shrink-0" />{build(SUBJECT_MAP.I, VERB_MAP[verb], T, 'aff').warning}</p>}
        <Card className="overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-sm text-slate-500"><tr><th className="px-4 py-2 font-medium">Subject</th><th className="px-4 py-2 font-medium">Sentence</th><th className="hidden px-4 py-2 font-medium md:table-cell">Arabic</th><th /></tr></thead>
            <tbody>{SUBJECTS.map((x) => { const b = build(x, VERB_MAP[verb], T, 'aff', { comp, contracted: s.settings.contracted }); const ar = arabicSentence(x, verb, T, 'aff', verb !== t.verb || true); return (
              <tr key={x.id} className="border-t border-slate-100 align-top">
                <td className="px-4 py-3"><span className="font-medium text-teal-700">{x.id === 'I' ? 'I' : x.en}</span><span className="block text-xs text-slate-400">{x.kind}</span></td>
                <td className="px-4 py-3"><Tokens tokens={b.tokens} /></td>
                <td className="hidden px-4 py-3 md:table-cell">{ar ? <Tr ar={ar} /> : <span className="text-xs text-slate-400">—</span>}</td>
                <td className="px-2 py-3"><Speak text={b.text} /></td>
              </tr>); })}</tbody>
          </table>
        </Card>
        {!AR_VERBS[verb] && <p className="mt-2 text-xs text-slate-400">Full Arabic sentences are available for the {Object.keys(AR_VERBS).length} core verbs. Meaning of “{verb}”: {VERB_MAP[verb].ar}</p>}
      </Section>

      <Section id="forms" letter="E" hue={hue} title="Four sentence forms" ar="أشكال الجملة الأربعة">
        <FormsTable t={t} verb={verb} comp={comp} />
        <div className="mt-4"><KnowledgeCheck questions={checks2} title="Check the forms" /></div>
      </Section>

      <Section id="time" letter="F" hue={hue} title="Time expressions" ar="تعبيرات الزمن">
        <div className="flex flex-wrap gap-2">{t.timeWords.map((w) => <Badge key={w} hue="amber" className="text-sm">{w}</Badge>)}</div>
        {relTimes.length > 0 && <div className="mt-4 grid gap-2 sm:grid-cols-2">{relTimes.slice(0, 6).map((x) => <div key={x.en} className="rounded-xl border border-slate-200 bg-white p-3"><p><b>{x.en}</b> <ArLabel className="text-sm text-slate-500">{x.ar}</ArLabel></p><p className="text-sm text-slate-600">{x.ex}</p></div>)}</div>}
        <p className="mt-4 flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-600"><Info size={18} className="shrink-0 text-slate-400" /><Ex en="Time words are useful clues, but they do not always decide the tense. The meaning decides. For example, “today” works with several tenses." ar="تعبيرات الزمن قرائن مفيدة، لكنها لا تحدد الزمن دائماً. المعنى هو الذي يحدد." small /></p>
      </Section>

      <Section id="examples" letter="G" hue={hue} title={`Real-life examples (${t.examples.length})`} ar="أمثلة من الحياة">
        <div className="mb-4 flex flex-wrap gap-2">{topics.map((x) => <Chip key={x} on={topic === x} hue={hue} onClick={() => setTopic(x)}>{x}</Chip>)}</div>
        <div className="grid gap-2 md:grid-cols-2">{t.examples.filter((e) => topic === 'All' || e.topic === topic).map((e) => (
          <Card key={e.en} className="flex items-start gap-3 p-4"><div className="min-w-0 flex-1"><p className="text-[17px] text-slate-900">{e.en}</p><Tr ar={e.ar} className="mt-1" /><p className="mt-1 text-xs text-slate-400">{e.topic}</p></div><Speak text={e.en} /></Card>
        ))}</div>
      </Section>

      <Section id="mistakes" letter="H" hue={hue} title="Common mistakes" ar="أخطاء شائعة">
        <div className="space-y-3">{t.mistakes.map((m) => (
          <Card key={m.wrong} className="grid gap-3 p-4 md:grid-cols-[1fr_1fr_1.3fr] md:items-center">
            <p className="flex items-start gap-2 text-rose-700"><XCircle size={18} className="mt-1 shrink-0" /><span className="line-through decoration-rose-300">{m.wrong}</span></p>
            <p className="flex items-start gap-2 font-medium text-emerald-700"><CheckCircle2 size={18} className="mt-1 shrink-0" />{m.right}</p>
            <Ex en={m.en} ar={m.ar} small />
          </Card>))}</div>
      </Section>

      <Section id="practice" letter="I" hue={hue} title="Interactive practice" ar="تدريب تفاعلي">
        <KnowledgeCheck questions={checks} title="Practise this tense" />
      </Section>

      <Section id="quiz" letter="J" hue="amber" title="Lesson quiz" ar="اختبار الدرس">
        <Card className="flex flex-wrap items-center gap-4 p-5">
          <div className="flex-1"><p className="font-semibold">8 questions on {t.en}</p><p className="text-sm text-slate-500">Mastery level: 80%. {lesson?.best != null ? `Your best: ${lesson.best}%.` : 'Not taken yet.'}</p></div>
          <Btn hue="amber" onClick={() => startQuiz({ title: `${t.en} — lesson quiz`, questions: lessonQuiz(id), kind: 'lesson', ref: id, mode: 'practice' })}><PlayCircle size={18} /> Practice mode</Btn>
          <Btn variant="outline" onClick={() => startQuiz({ title: `${t.en} — lesson quiz (exam)`, questions: lessonQuiz(id), kind: 'lesson', ref: id, mode: 'exam' })}>Exam mode</Btn>
        </Card>
        {nextT && <Card className={cx('mt-4 flex flex-wrap items-center gap-4 p-5', lesson?.completed ? 'border-emerald-200' : '')} onClick={() => go(nextT.id)}>
          <div className="flex-1"><p className="text-sm text-slate-500">{lesson?.completed ? 'Recommended next lesson' : 'Next lesson (take the quiz first for best results)'}</p><p className="text-lg font-semibold">{nextT.en} <ArLabel className="text-base font-normal text-slate-500">{nextT.ar}</ArLabel></p></div><ArrowRight />
        </Card>}
      </Section>
    </div>
  );
}

const FAMILY: Record<string, { en: string; ar: string; hue: Hue; icon: React.ReactNode; intro: string; introAr: string }> = {
  present: { en: 'Present Tenses', ar: 'أزمنة المضارع', hue: 'green', icon: <Sun />, intro: 'Habits, current actions and situations connected to the present.', introAr: 'العادات والأفعال الحالية والمواقف المرتبطة بالحاضر.' },
  past: { en: 'Past Tenses', ar: 'أزمنة الماضي', hue: 'purple', icon: <History />, intro: 'Completed actions, actions in progress in the past, and actions before another past event.', introAr: 'الأفعال المنتهية، والأفعال المستمرة في الماضي، والأفعال التي سبقت حدثاً ماضياً آخر.' },
  future: { en: 'Future Tenses', ar: 'أزمنة المستقبل', hue: 'orange', icon: <Rocket />, intro: 'Plans, predictions, intentions and future actions. Not every future sentence uses "will".', introAr: 'الخطط والتوقعات والنوايا. ليست كل جملة مستقبلية تستخدم will.' },
};

export function FamilyPage({ time }: { time: 'present' | 'past' | 'future' }) {
  const f = FAMILY[time];
  const { go } = useNav();
  const { s, visit } = useStore();
  useEffect(() => { visit(time); }, [time]);
  const list = TENSES.filter((t) => t.time === time);
  const [subj, setSubj] = useState('I'); const [verb, setVerb] = useState('work');
  const mixQs = useMemo(() => pickQuestions(QUESTIONS.filter((q) => (q.id.startsWith('mix-') || q.id.startsWith('fut-')) && q.tense?.startsWith(time)), 5), [time]);
  const futQs = useMemo(() => pickQuestions(questionsFor('future-ways'), 4), []);
  return (
    <div>
      <PageHead title={f.en} ar={f.ar} hue={f.hue} icon={f.icon} sub={f.intro} subAr={f.introAr} />
      <div className="mb-10 grid gap-4 md:grid-cols-2">
        {list.map((t) => { const h = hueOfTense(t.id); const l = s.lessons[t.id]; return (
          <Card key={t.id} hue={h} className="p-5" onClick={() => go(t.id)}>
            <div className="flex items-start justify-between gap-2"><div><p className={cx('text-lg font-semibold', HUE[h].text)}>{t.en}</p><ArLabel className="text-slate-500">{t.ar}</ArLabel></div>{l?.completed ? <Badge hue="green"><CheckCircle2 size={12} /> {l.best ?? 0}%</Badge> : <Badge>{t.frequency}</Badge>}</div>
            <div className="my-2"><Timeline spec={t.timeline} hue={h} /></div>
            <p className="font-medium text-slate-800">{t.examples[0].en}</p><Tr ar={t.examples[0].ar} className="text-sm" />
            <p className="mt-2 text-sm text-slate-500">{t.def}</p>
          </Card>); })}
      </div>

      {time === 'present' && <Section title="Habit or now? Four key sentences" ar="عادة أم الآن؟">
        <div className="grid gap-3 md:grid-cols-2">{[
          ['I work every day.', 'أنا أعمل كل يوم', 'A regular habit', 'present-simple'], ['I am working now.', 'أنا أعمل الآن', 'An action happening at the moment', 'present-continuous'],
          ['I have finished my work.', 'لقد أنهيت عملي', 'A completed action with present relevance', 'present-perfect'], ['I have been working for two hours.', 'أنا أعمل منذ ساعتين', 'An activity continuing over a period of time', 'present-perfect-continuous'],
        ].map(([en, ar, note, id]) => <Card key={en} hue={hueOfTense(id)} className="p-4" onClick={() => go(id)}><p className="text-lg font-semibold">{en} <Speak text={en} /></p><Tr ar={ar} /><p className={cx('mt-1 text-sm', HUE[hueOfTense(id)].text)}>{note} · {TENSE_MAP[id].en}</p></Card>)}</div>
      </Section>}
      {time === 'past' && <Section title="Order of events in the past" ar="ترتيب الأحداث في الماضي">
        <div className="grid gap-3 md:grid-cols-2">{[
          ['I called the customer yesterday.', 'اتصلت بالعميل أمس.', 'Completed past action', 'past-simple'], ['I was calling the customer when you arrived.', 'كنت أتصل بالعميل عندما وصلت.', 'In progress in the past', 'past-continuous'],
          ['I had called the customer before the meeting started.', 'كنت قد اتصلت بالعميل قبل أن يبدأ الاجتماع.', 'Before another past event', 'past-perfect'], ['I had been working for two hours before the meeting started.', 'كنت أعمل منذ ساعتين قبل أن يبدأ الاجتماع.', 'Duration before a past event', 'past-perfect-continuous'],
        ].map(([en, ar, note, id]) => <Card key={en} hue={hueOfTense(id)} className="p-4" onClick={() => go(id)}><p className="text-lg font-semibold">{en} <Speak text={en} /></p><Tr ar={ar} /><p className={cx('mt-1 text-sm', HUE[hueOfTense(id)].text)}>{note} · {TENSE_MAP[id].en}</p><div className="mt-2"><Timeline spec={TENSE_MAP[id].timeline} hue={hueOfTense(id)} /></div></Card>)}</div>
        <Card className="mt-4 p-5"><p className="mb-2 font-semibold">After did / didn't, the verb returns to the base form <ArLabel className="font-normal text-slate-500">بعد did يعود الفعل لصورته الأساسية</ArLabel></p>
          <div className="grid gap-2 sm:grid-cols-4"><p className="text-emerald-700">✓ He went.</p><p className="text-emerald-700">✓ Did he go?</p><p className="text-emerald-700">✓ He didn't go.</p><p className="text-rose-600 line-through">Did he went?</p></div></Card>
      </Section>}
      {time === 'future' && <Section id="ways" title="Practical ways to talk about the future" ar="طرق عملية للحديث عن المستقبل">
        <Card className="overflow-hidden"><table className="stack w-full text-left">
          <thead className="bg-slate-50 text-sm text-slate-500"><tr><th className="px-4 py-2 font-medium">Form</th><th className="px-4 py-2 font-medium">Use it for</th><th className="px-4 py-2 font-medium">Example</th></tr></thead>
          <tbody>{FUTURE_WAYS.map((w) => <tr key={w.form} className="border-t border-slate-100 align-top"><td className="px-4 py-3 font-semibold text-orange-700">{w.form}</td><td className="px-4 py-3"><Ex en={w.en} ar={w.ar} small /></td><td className="px-4 py-3"><p>{w.ex} <Speak text={w.ex} /></p><Tr ar={w.exAr} className="text-sm" /></td></tr>)}</tbody>
        </table></Card>
        <div className="mt-4"><KnowledgeCheck questions={futQs} title="Will, going to or present?" /></div>
      </Section>}

      <Section title="Same verb, four tenses" ar="الفعل نفسه في أربعة أزمنة">
        <div className="mb-4 flex flex-wrap gap-3"><Select label="Subject" className="w-48" value={subj} onChange={setSubj} options={SUBJECTS.map((x) => ({ v: x.id, l: x.id === 'I' ? 'I' : x.en }))} /><Select label="Verb" className="w-56" value={verb} onChange={setVerb} options={verbOptions(Object.keys(AR_VERBS))} /></div>
        <div className="grid gap-3 md:grid-cols-2">{list.map((t) => { const b = build(SUBJECT_MAP[subj], VERB_MAP[verb], parseTense(t.id), 'aff', { comp: VERB_MAP[verb].comp }); return (
          <Card key={t.id} hue={hueOfTense(t.id)} className="p-4"><p className={cx('text-sm font-semibold', HUE[hueOfTense(t.id)].text)}>{t.en}</p><div className="mt-1 flex items-start gap-2"><div className="flex-1"><Tokens tokens={b.tokens} /></div><Speak text={b.text} /></div><Tr ar={arabicSentence(SUBJECT_MAP[subj], verb, parseTense(t.id), 'aff', true) ?? undefined} className="mt-1" /></Card>); })}</div>
      </Section>
      <Section title="Comparison exercise" ar="تمرين المقارنة"><KnowledgeCheck questions={mixQs} title={`Choose the right ${time} tense`} /></Section>
    </div>
  );
}

export function PerfectPage() {
  const { go, startQuiz } = useNav();
  const { visit } = useStore();
  useEffect(() => { visit('perfect', 'perfect'); }, []);
  const perf = TENSES.filter((t) => t.aspect.startsWith('perfect'));
  const pairs: { t: string; ar: string; a: [string, string, string]; b: [string, string, string]; en: string; enAr: string }[] = [
    { t: 'Present Perfect vs Past Simple', ar: 'المضارع التام مقابل الماضي البسيط', a: ['I have lost my keys.', 'لقد أضعت مفاتيحي (وما زلت بدونها).', 'Result now'], b: ['I lost my keys yesterday.', 'أضعت مفاتيحي أمس.', 'Finished time'], en: 'Use the Past Simple with a finished time (yesterday, in 2020). Use the Present Perfect when the time is not stated or not finished and the result matters now.', enAr: 'نستخدم الماضي البسيط مع زمن منتهٍ ومحدد، والمضارع التام عندما لا يُذكر الوقت أو لم ينتهِ والنتيجة مهمة الآن.' },
    { t: 'Present Perfect vs Present Perfect Continuous', ar: 'المضارع التام مقابل التام المستمر', a: ['I have written three reports.', 'كتبت ثلاثة تقارير.', 'How many / finished'], b: ['I have been writing reports all morning.', 'أكتب التقارير طوال الصباح.', 'How long / activity'], en: 'The simple form focuses on the result or the number; the continuous form focuses on the activity and how long.', enAr: 'البسيط يركز على النتيجة أو العدد، والمستمر يركز على النشاط ومدته.' },
    { t: 'Past Simple vs Past Perfect', ar: 'الماضي البسيط مقابل الماضي التام', a: ['When I arrived, the meeting started.', 'عندما وصلت، بدأ الاجتماع (بعد وصولي).', 'Arrived → then started'], b: ['When I arrived, the meeting had started.', 'عندما وصلت، كان الاجتماع قد بدأ.', 'Started → then arrived'], en: 'The Past Perfect shows which past action happened first.', enAr: 'الماضي التام يوضح أي الفعلين حدث أولاً.' },
    { t: 'Since vs For', ar: 'since مقابل for', a: ['I have worked here since 2018.', 'أعمل هنا منذ 2018.', 'since + starting point'], b: ['I have worked here for six years.', 'أعمل هنا منذ ست سنوات.', 'for + period'], en: 'Since + the moment it started (Monday, 2018, I joined). For + the length of time (two hours, six years).', enAr: 'since + نقطة البداية، و for + المدة. وكلاهما يُترجم غالباً بـ "منذ".' },
    { t: 'Already, Yet, Just, Ever, Never', ar: 'already وyet وjust وever وnever', a: ['I have already sent it. / It has just arrived.', 'أرسلته بالفعل. / وصل للتو.', 'already, just: between have and V3'], b: ['Have you finished yet? / Have you ever been to Japan? / I have never seen it.', 'هل انتهيت؟ / هل سبق أن زرت اليابان؟ / لم أره أبداً.', 'yet: end · ever: questions · never: negative meaning'], en: 'Already = sooner than expected. Yet = until now (questions/negatives). Just = very recently. Ever = at any time in your life. Never = at no time.', enAr: 'already: بالفعل · yet: بعد/حتى الآن · just: للتو · ever: في أي وقت · never: أبداً.' },
  ];
  return (
    <div>
      <PageHead title="Perfect Tenses" ar="الأزمنة التامة" hue="blue" icon={<Layers />} sub="Perfect tenses are not just another time. They show the relationship between an action and a reference point: now, a moment in the past, or a moment in the future." subAr="الأزمنة التامة ليست مجرد زمن آخر، بل تبين علاقة الفعل بنقطة مرجعية: الآن، أو لحظة في الماضي، أو لحظة في المستقبل." />
      <Section title="The six perfect forms" ar="الصيغ التامة الست">
        <div className="grid gap-3 md:grid-cols-3">{perf.map((t) => (
          <Card key={t.id} hue="blue" className="p-4" onClick={() => go(t.id)}><p className="text-sm font-semibold text-sky-700">{t.en}</p><p className="mt-1 text-lg font-semibold">{t.parts.slice(1).map((p) => p.label).join(' + ')}</p><p className="mt-1 text-slate-700">{t.examples[0].en}</p><Tr ar={t.examples[0].ar} className="text-sm" /></Card>))}</div>
      </Section>
      <Section title="One action, three reference points" ar="فعل واحد وثلاث نقاط مرجعية">
        <Card className="overflow-hidden"><table className="w-full text-left"><tbody>{[
          ['I have finished the report.', 'لقد أنهيت التقرير.', 'present-perfect'], ['I had finished the report before he arrived.', 'كنت قد أنهيت التقرير قبل وصوله.', 'past-perfect'], ['I will have finished the report by tomorrow.', 'سأكون قد أنهيت التقرير بحلول الغد.', 'future-perfect'],
        ].map(([en, ar, id]) => <tr key={id} className="border-t border-slate-100 first:border-0"><td className="w-1/2 px-4 py-4"><p className="text-lg font-medium">{en} <Speak text={en} /></p><Tr ar={ar} /><p className="text-sm text-sky-700">{TENSE_MAP[id].en} — reference: {id.startsWith('present') ? 'now' : id.startsWith('past') ? 'a past moment' : 'a future moment'}</p></td><td className="hidden px-4 py-2 md:table-cell"><Timeline spec={TENSE_MAP[id].timeline} hue="blue" /></td></tr>)}</tbody></table></Card>
      </Section>
      <Section title="Key comparisons" ar="مقارنات مهمة">
        <div className="space-y-4">{pairs.map((p) => (
          <Card key={p.t} className="p-5">
            <p className="text-lg font-semibold">{p.t} <ArLabel className="text-base font-normal text-slate-500">{p.ar}</ArLabel></p>
            <div className="my-3 grid gap-3 md:grid-cols-2">{[p.a, p.b].map(([en, ar, note]) => <div key={en} className="rounded-xl bg-sky-50/70 p-4"><p className="font-medium text-slate-900">{en}</p><Tr ar={ar} className="text-sm" /><p className="mt-1 text-sm font-medium text-sky-700">{note}</p></div>)}</div>
            <Ex en={p.en} ar={p.enAr} small />
          </Card>))}</div>
      </Section>
      <Section title="Practice" ar="تدريب">
        <KnowledgeCheck questions={useMemo(() => pickQuestions(questionsFor('perfect'), 4), [])} title="Perfect tenses check" />
        <Btn className="mt-4" hue="amber" onClick={() => startQuiz({ title: 'Perfect tenses — lesson quiz', questions: lessonQuiz('perfect'), kind: 'lesson', ref: 'perfect', mode: 'practice' })}><PlayCircle size={18} /> Take the lesson quiz</Btn>
      </Section>
    </div>
  );
}

export function ComparePage() {
  const { visit } = useStore();
  const { startQuiz, go } = useNav();
  const preset = (() => { try { const w = (window as any).__cmpPreset; if (w) { (window as any).__cmpPreset = null; return w; } const r = sessionStorage.getItem('cmp-preset'); sessionStorage.removeItem('cmp-preset'); return r ? JSON.parse(r) : null; } catch { return null; } })();
  const [sel, setSel] = useState<string[]>(preset ?? ['present-simple', 'present-continuous', 'past-simple', 'future-simple']);
  const [subj, setSubj] = useState('I'); const [verb, setVerb] = useState('work');
  useEffect(() => { visit('compare', 'comparison'); }, []);
  const timeFor: Record<string, string> = { 'present-simple': 'every day', 'present-continuous': 'now', 'present-perfect': 'already', 'present-perfect-continuous': 'for two hours', 'past-simple': 'yesterday', 'past-continuous': 'at ten yesterday', 'past-perfect': 'before the meeting', 'past-perfect-continuous': 'for two hours before the meeting', 'future-simple': 'tomorrow', 'future-continuous': 'at ten tomorrow', 'future-perfect': 'by tomorrow', 'future-perfect-continuous': 'for two years by June' };
  const timeAr: Record<string, string> = { 'present-simple': 'كل يوم', 'present-continuous': 'الآن', 'present-perfect': 'بالفعل', 'present-perfect-continuous': 'منذ ساعتين', 'past-simple': 'أمس', 'past-continuous': 'في العاشرة أمس', 'past-perfect': 'قبل الاجتماع', 'past-perfect-continuous': 'منذ ساعتين قبل الاجتماع', 'future-simple': 'غداً', 'future-continuous': 'في العاشرة غداً', 'future-perfect': 'بحلول الغد', 'future-perfect-continuous': 'لمدة عامين بحلول يونيو' };
  return (
    <div>
      <PageHead title="Tense Comparison" ar="مقارنة الأزمنة" hue="amber" icon={<GitCompare />} sub="Choose two or more tenses and compare them side by side. Change the subject and verb to update every card at once." subAr="اختر زمنين أو أكثر وقارن بينها، وغيّر الفاعل والفعل لتتحدث جميع البطاقات معاً." />
      <div className="mb-9"><TenseMatrix /></div>
      <Section title="Compare side by side" ar="قارن جنباً إلى جنب">
        <Card className="mb-4 p-4">
          <div className="mb-3 flex flex-wrap gap-2">{TENSES_BY_ORDER.map((t) => <Chip key={t.id} hue={hueOfTense(t.id)} on={sel.includes(t.id)} onClick={() => setSel(sel.includes(t.id) ? sel.filter((x) => x !== t.id) : [...sel, t.id])}>{t.en}</Chip>)}</div>
          <div className="flex flex-wrap gap-3"><Select label="Subject (all cards)" className="w-52" value={subj} onChange={setSubj} options={SUBJECTS.map((x) => ({ v: x.id, l: x.id === 'I' ? 'I' : x.en }))} /><Select label="Verb (all cards)" className="w-60" value={verb} onChange={setVerb} options={verbOptions(Object.keys(AR_VERBS))} /></div>
        </Card>
        {sel.length < 2 && <p className="mb-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">Select at least two tenses to compare.</p>}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{TENSES_BY_ORDER.filter((t) => sel.includes(t.id)).map((t) => {
          const h = hueOfTense(t.id); const T = parseTense(t.id);
          const b = build(SUBJECT_MAP[subj], VERB_MAP[verb], T, 'aff', { comp: VERB_MAP[verb].comp, time: timeFor[t.id] });
          const ar = arabicSentence(SUBJECT_MAP[subj], verb, T, 'aff', true, timeAr[t.id]);
          return (
            <Card key={t.id} hue={h} className="flex flex-col p-5">
              <p className={cx('text-lg font-semibold', HUE[h].text)}>{t.en} <ArLabel className="text-sm font-normal text-slate-500">{t.ar}</ArLabel></p>
              <p className="mt-1 text-sm font-medium text-slate-500">{b.formula}</p>
              <div className="mt-3 flex items-start gap-2"><div className="flex-1"><Tokens tokens={b.tokens} /></div><Speak text={b.text} /></div>
              {ar && <Tr ar={ar} className="mt-1" />}
              <Timeline spec={t.timeline} hue={h} />
              <Ex en={<span><b>Meaning:</b> {t.def}</span>} ar={t.defAr} small />
              <p className="mt-2 text-sm"><b>When:</b> {t.uses.map((u) => u.en).join('; ')}</p>
              <p className="mt-2 text-sm"><b>Time words:</b> {t.timeWords.slice(0, 5).join(', ')}</p>
              <p className="mt-2 text-sm"><b>Mistake:</b> <span className="text-rose-600 line-through">{t.mistakes[0].wrong}</span> → <span className="text-emerald-700">{t.mistakes[0].right}</span></p>
              <button className="mt-auto pt-3 text-left text-sm font-medium text-indigo-700 hover:underline" onClick={() => go(t.id)}>Open lesson →</button>
            </Card>);
        })}</div>
      </Section>
      <Section id="same-verb" title="Same Verb, Different Tenses" ar="الفعل نفسه في أزمنة مختلفة">
        <Card className="overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left">
          <thead className="bg-slate-50 text-sm text-slate-500"><tr><th className="px-4 py-2 font-medium">Tense</th><th className="px-4 py-2 font-medium">Sentence ({subj === 'I' ? 'I' : SUBJECT_MAP[subj].en} + {verb})</th><th className="px-4 py-2 font-medium">Arabic</th><th /></tr></thead>
          <tbody>{TENSES_BY_ORDER.map((t) => { const T = parseTense(t.id); const b = build(SUBJECT_MAP[subj], VERB_MAP[verb], T, 'aff', { comp: VERB_MAP[verb].comp, time: timeFor[t.id] }); return (
            <tr key={t.id} className="border-t border-slate-100"><td className={cx('px-4 py-3 text-sm font-semibold', HUE[hueOfTense(t.id)].text)}>{t.en}</td><td className="px-4 py-3">{b.text}</td><td className="px-4 py-3"><Tr ar={arabicSentence(SUBJECT_MAP[subj], verb, T, 'aff', true, timeAr[t.id]) ?? undefined} className="text-sm" /></td><td className="px-2"><Speak text={b.text} /></td></tr>); })}</tbody>
        </table></div></Card>
      </Section>
      <Section title="Which tense? Challenge" ar="أي زمن؟ تحدٍ">
        <Card className="flex flex-wrap items-center gap-4 p-5"><p className="flex-1 text-slate-700">10 mixed questions where you decide the tense yourself, including listening questions.</p><Btn hue="amber" onClick={() => startQuiz({ title: 'Mixed tense challenge', questions: pickQuestions(QUESTIONS.filter((q) => q.id.startsWith('mix-') || q.id.startsWith('g-li-') || q.id.startsWith('perf-')), 10), kind: 'mixed', ref: 'comparison', mode: 'practice' })}><PlayCircle size={18} /> Start</Btn></Card>
      </Section>
    </div>
  );
}
