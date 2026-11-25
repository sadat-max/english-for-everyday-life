import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ClipboardCheck, AlertCircle, BarChart3, PlayCircle, Download, Upload, Copy, Flame, Trophy, ArrowRight, Trash2, CheckCircle2 } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Cell, ReferenceLine } from 'recharts';
import { QUESTIONS, Q_MAP, MISTAKE_CATS, MistakeCat, Question, QType } from '../data/questions';
import { MODULES, ALL_LESSONS, LESSON_MAP } from '../data/content';
import { TENSES_BY_ORDER } from '../data/tenses';
import { VERB_MAP } from '../data/verbs';
import { useStore, migrate, streakOf, today, initialState } from '../store/store';
import { useNav } from '../lib/nav';
import { pickQuestions, lessonQuiz, moduleQuiz, finalQuiz, mixedChallenge, dailyChallenge, verbQuiz, prep } from '../lib/quiz';
import { QuizRunner } from '../components/Quiz';
import { Badge, Btn, Card, Chip, Ex, HUE, Hue, PageHead, Progress, Section, Select, cx, ArLabel, Empty } from '../lib/ui';
import { useProgress } from './Home';

export function resolveQ(id: string): Question | undefined {
  if (Q_MAP[id]) return Q_MAP[id];
  const m = id.match(/^vq-(.+)-(ar|s3|ing|v2|v3)$/);
  if (m && VERB_MAP[m[1]]) return verbQuiz(VERB_MAP[m[1]]).find((q) => q.id === id);
  return undefined;
}

export function QuizPage() {
  const { quiz, go } = useNav();
  if (!quiz) return <Empty title="No quiz is running." ar="لا يوجد اختبار حالياً"><Btn onClick={() => go('quizzes')}>Go to Practice & Quizzes</Btn></Empty>;
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6"><p className="text-sm text-slate-500">{quiz.mode === 'exam' ? 'Exam mode: answers are shown after you submit the whole test.' : 'Practice mode: you get feedback after every question.'}</p><h1 className="text-[28px] font-semibold text-slate-900">{quiz.title}</h1></div>
      <QuizRunner key={quiz.title + quiz.questions.map((q) => q.id).join()} questions={quiz.questions} title={quiz.title} kind={quiz.kind} refId={quiz.ref} mode={quiz.mode} />
    </div>
  );
}

const TYPE_LABEL: Record<QType, string> = { mcq: 'Multiple choice', fill: 'Fill in the blank', tf: 'True or false', match: 'Matching', reorder: 'Rearrange words', translate: 'Translate Arabic → English', listen: 'Listening', identify: 'Identify the tense', correct: 'Correct the mistake', convert: 'Convert sentences' };

export function QuizzesPage() {
  const { s, visit } = useStore(); const { startQuiz } = useNav();
  useEffect(() => { visit('quizzes'); }, []);
  const [lessons, setLessons] = useState<string[]>([]); const [types, setTypes] = useState<QType[]>([]); const [n, setN] = useState('10'); const [mode, setMode] = useState<'practice' | 'exam'>('practice');
  const pool = QUESTIONS.filter((q) => (!lessons.length || lessons.includes(q.lesson)) && (!types.length || types.includes(q.type)));
  const typeCounts = QUESTIONS.reduce((m, q) => ({ ...m, [q.type]: (m[q.type] ?? 0) + 1 }), {} as Record<string, number>);
  const best = (kind: string, ref: string) => s.quizzes.filter((q) => q.kind === kind && q.ref === ref).reduce((a, q) => Math.max(a, q.pct), -1);
  return (
    <div>
      <PageHead title="Practice & Quizzes" ar="التدريب والاختبارات" hue="amber" icon={<ClipboardCheck />} sub={`A bank of ${QUESTIONS.length} checked questions in ${Object.keys(typeCounts).length} formats. 80% is the mastery level; nothing is ever locked.`} subAr={`بنك من ${QUESTIONS.length} سؤالاً. مستوى الإتقان 80%، ولا يُغلق أي درس.`} />
      <div className="mb-10 grid gap-4 md:grid-cols-3">
        <Card hue="amber" className="p-5"><p className="font-semibold">Daily challenge</p><p className="text-sm text-slate-500">5 questions · {s.daily[today()] != null ? `done: ${s.daily[today()]}%` : 'not done today'}</p><Btn className="mt-3" hue="amber" onClick={() => startQuiz({ title: "Today's challenge", questions: dailyChallenge(), kind: 'daily', ref: today(), mode: 'practice' })}>Start</Btn></Card>
        <Card hue="orange" className="p-5"><p className="font-semibold">Mixed tense challenge</p><p className="text-sm text-slate-500">10 questions · you choose the tense</p><Btn className="mt-3" hue="orange" onClick={() => startQuiz({ title: 'Mixed tense challenge', questions: mixedChallenge(), kind: 'mixed', ref: 'mixed', mode: 'practice' })}>Start</Btn></Card>
        <Card hue="purple" className="p-5"><p className="font-semibold">Final assessment</p><p className="text-sm text-slate-500">50 questions · exam mode · detailed report{best('final', 'm10') >= 0 ? ` · best ${best('final', 'm10')}%` : ''}</p><Btn className="mt-3" hue="purple" onClick={() => startQuiz({ title: 'Final assessment', questions: finalQuiz(), kind: 'final', ref: 'm10', mode: 'exam' })}>Start</Btn></Card>
      </div>
      <Section title="Lesson quizzes" ar="اختبارات الدروس">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{ALL_LESSONS.filter((l) => l.id !== 'final').map((l) => { const st = s.lessons[l.id]; return (
          <Card key={l.id} className="flex items-center gap-3 p-3" onClick={() => startQuiz({ title: `${l.en} — lesson quiz`, questions: lessonQuiz(l.id), kind: 'lesson', ref: l.id, mode: 'practice' })}>
            <PlayCircle size={20} className="text-amber-600" /><span className="flex-1"><span className="block font-medium">{l.en}</span><span className="text-xs text-slate-400">{QUESTIONS.filter((q) => q.lesson === l.id).length} questions in bank</span></span>{st?.best != null && <Badge hue={st.best >= 80 ? 'green' : 'amber'}>{st.best}%</Badge>}
          </Card>); })}</div>
      </Section>
      <Section title="Module assessments" ar="تقييمات الوحدات">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{MODULES.filter((m) => m.id !== 'm10').map((m) => { const b = best('module', m.id); return (
          <Card key={m.id} hue={m.color as Hue} className="flex items-center gap-3 p-3" onClick={() => startQuiz({ title: `Module ${m.n} assessment: ${m.en}`, questions: moduleQuiz(m.id), kind: 'module', ref: m.id, mode: 'exam' })}>
            <span className={cx('grid h-8 w-8 place-items-center rounded-lg text-sm font-semibold', HUE[m.color as Hue].soft, HUE[m.color as Hue].text)}>{m.n}</span><span className="flex-1 font-medium">{m.en}</span>{b >= 0 && <Badge hue={b >= 80 ? 'green' : 'amber'}>{b}%</Badge>}
          </Card>); })}</div>
      </Section>
      <Section title="Build your own practice" ar="اصنع تدريبك الخاص">
        <Card className="space-y-4 p-5">
          <div><p className="mb-2 text-sm font-medium text-slate-500">Lessons (none = all)</p><div className="flex flex-wrap gap-1.5">{ALL_LESSONS.filter((l) => l.id !== 'final').map((l) => <Chip key={l.id} on={lessons.includes(l.id)} hue="amber" onClick={() => setLessons(lessons.includes(l.id) ? lessons.filter((x) => x !== l.id) : [...lessons, l.id])}>{l.en}</Chip>)}</div></div>
          <div><p className="mb-2 text-sm font-medium text-slate-500">Question types (none = all)</p><div className="flex flex-wrap gap-1.5">{(Object.keys(TYPE_LABEL) as QType[]).map((t) => <Chip key={t} on={types.includes(t)} hue="amber" onClick={() => setTypes(types.includes(t) ? types.filter((x) => x !== t) : [...types, t])}>{TYPE_LABEL[t]} ({typeCounts[t] ?? 0})</Chip>)}</div></div>
          <div className="flex flex-wrap items-end gap-3"><Select label="Questions" className="w-32" value={n} onChange={setN} options={['5', '10', '15', '20', '30'].map((x) => ({ v: x, l: x }))} /><Select label="Mode" className="w-44" value={mode} onChange={(v) => setMode(v as 'practice')} options={[{ v: 'practice', l: 'Practice' }, { v: 'exam', l: 'Exam' }]} />
            <Btn hue="amber" disabled={!pool.length} onClick={() => startQuiz({ title: 'Custom practice', questions: pickQuestions(pool, +n), kind: 'custom', ref: 'custom', mode })}>Start ({Math.min(pool.length, +n)} of {pool.length} available)</Btn></div>
        </Card>
      </Section>
    </div>
  );
}

export function MistakesPage() {
  const { s, set, visit } = useStore(); const { startQuiz, go } = useNav();
  useEffect(() => { visit('mistakes'); }, []);
  const [cat, setCat] = useState<string>('all'); const [showMastered, setShowMastered] = useState(false);
  const [single, setSingle] = useState<Question | null>(null);
  const all = Object.values(s.mistakes).sort((a, b) => b.date - a.date);
  const open = all.filter((m) => !m.mastered); const mastered = all.filter((m) => m.mastered);
  const list = (showMastered ? mastered : open).filter((m) => cat === 'all' || m.cat === cat);
  const due = open.filter((m) => m.due <= Date.now());
  const counts = open.reduce((m, x) => ({ ...m, [x.cat]: (m[x.cat] ?? 0) + 1 }), {} as Record<string, number>);
  const session = (ms: typeof open) => { const qs = ms.map((m) => resolveQ(m.qid)).filter(Boolean) as Question[]; startQuiz({ title: 'Personal review session', questions: qs.slice(0, 15).map((q) => prep(q)), kind: 'mistakes', ref: 'mistakes', mode: 'practice' }); };
  return (
    <div>
      <PageHead title="My Mistakes" ar="أخطائي" hue="red" icon={<AlertCircle />} sub="Every incorrect answer is saved here by grammar area. Answer a question correctly twice on later reviews and it counts as mastered." subAr="تُحفظ هنا كل إجابة خاطئة حسب نوع الخطأ. عندما تجيب عنها إجابة صحيحة مرتين في مراجعات لاحقة تُعتبر متقنة." />
      {all.length === 0 ? <Empty title="No mistakes saved yet." ar="لا توجد أخطاء محفوظة بعد">When you answer a question incorrectly in any quiz or check, it will appear here with an explanation.<div className="mt-4"><Btn hue="amber" onClick={() => go('quizzes')}>Go to practice</Btn></div></Empty> : <>
        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <Card className="p-4"><p className="text-sm text-slate-500">To review</p><p className="text-3xl font-semibold text-rose-600">{open.length}</p></Card>
          <Card className="p-4"><p className="text-sm text-slate-500">Due now</p><p className="text-3xl font-semibold text-amber-600">{due.length}</p></Card>
          <Card className="p-4"><p className="text-sm text-slate-500">Mastered</p><p className="text-3xl font-semibold text-emerald-600">{mastered.length}</p></Card>
        </div>
        <Card className="mb-6 flex flex-wrap items-center gap-3 p-5" hue="red"><div className="flex-1"><p className="font-semibold">Personalised practice session</p><p className="text-sm text-slate-500">{due.length ? `${Math.min(due.length, 15)} questions that are due for review` : open.length ? 'Nothing is due yet. Corrected answers come back after 1, 3 and 7 days. You can still review all of them now.' : 'All mistakes mastered.'}</p></div>
          {due.length > 0 && <Btn hue="red" onClick={() => session(due)}>Start review</Btn>}{open.length > 0 && <Btn variant="outline" onClick={() => session(open)}>Review all open</Btn>}</Card>
        <div className="mb-4 flex flex-wrap gap-2"><Chip on={cat === 'all'} hue="red" onClick={() => setCat('all')}>All ({open.length})</Chip>{(Object.keys(MISTAKE_CATS) as MistakeCat[]).filter((c) => counts[c]).map((c) => <Chip key={c} hue="red" on={cat === c} onClick={() => setCat(c)}>{MISTAKE_CATS[c].en} ({counts[c]})</Chip>)}<label className="ms-auto flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" className="h-5 w-5" checked={showMastered} onChange={(e) => setShowMastered(e.target.checked)} /> Show mastered</label></div>
        {single && <div className="mb-6"><QuizRunner questions={[prep(single)]} title="Practise again" kind={null} refId="" mode="practice" compact onClose={() => setSingle(null)} /></div>}
        <div className="space-y-3">{list.map((m) => { const q = resolveQ(m.qid); if (!q) return null; const lesson = LESSON_MAP[q.lesson]; return (
          <Card key={m.qid} className="p-4">
            <div className="flex flex-wrap items-start gap-3">
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap gap-2"><Badge hue="red">{MISTAKE_CATS[m.cat].en}</Badge>{m.mastered ? <Badge hue="green"><CheckCircle2 size={12} /> Mastered</Badge> : m.streak > 0 ? <Badge hue="amber">Correct {m.streak}× since</Badge> : null}{m.times > 1 && <Badge>wrong {m.times}×</Badge>}</div>
                <p className="text-sm text-slate-500">{q.prompt}</p>
                {q.text && q.type !== 'listen' && <p className="whitespace-pre-line font-medium" dir={q.type === 'translate' ? 'rtl' : undefined}>{q.text}</p>}
                <p className="text-sm">Your answer: <span className="text-rose-700">{m.given || '—'}</span></p>
                <p className="text-sm">Correct answer: <b className="text-emerald-700">{q.type === 'match' ? q.pairs!.map(([a, b]) => `${a} = ${b}`).join(' · ') : q.answer}</b></p>
                {q.why?.[m.given] && <Ex en={q.why[m.given].en} ar={q.why[m.given].ar} small />}
                <Ex en={q.en} ar={q.ar} small className="text-slate-500" />
              </div>
              <div className="flex flex-col gap-2">
                <Btn variant="soft" hue="red" onClick={() => setSingle(q)}>Practise again</Btn>
                {lesson && <Btn variant="ghost" onClick={() => go(lesson.page)}>Lesson: {lesson.en} <ArrowRight size={14} /></Btn>}
              </div>
            </div>
          </Card>); })}</div>
      </>}
    </div>
  );
}

export function ProgressPage() {
  const { s, set, visit } = useStore(); const { go } = useNav(); const p = useProgress();
  useEffect(() => { visit('progress'); }, []);
  const [exportText, setExportText] = useState(''); const [importText, setImportText] = useState(''); const [msg, setMsg] = useState(''); const [confirmReset, setConfirmReset] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const hist = s.quizzes.filter((q) => q.kind !== 'verb').slice(-20).map((q, i) => ({ n: i + 1, pct: q.pct, title: q.title }));
  const cats = useMemo(() => {
    const m: Record<string, [number, number]> = {};
    for (const [id, a] of Object.entries(s.answers)) { const q = resolveQ(id); if (!q) continue; const c = (m[q.cat] ??= [0, 0]); c[0] += a.right; c[1] += a.right + a.wrong; }
    return Object.entries(m).filter(([, [, t]]) => t >= 1).map(([c, [r, t]]) => ({ c, name: MISTAKE_CATS[c as MistakeCat].en, pct: Math.round((r / t) * 100), t })).sort((a, b) => b.pct - a.pct);
  }, [s.answers]);
  const days = useMemo(() => Array.from({ length: 28 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (27 - i)); const k = today(d); return { k, n: s.activity[k] ?? 0, label: d.getDate() }; }), [s.activity]);
  const doImport = (txt: string) => { try { const st = migrate(JSON.parse(txt)); if (!st || (JSON.parse(txt) as any).v !== 1) throw new Error(); set(() => st); setMsg('Progress imported successfully.'); setImportText(''); } catch { setMsg('That does not look like a valid progress backup.'); } };
  const recent = [...s.quizzes].reverse().slice(0, 12);
  return (
    <div>
      <PageHead title="My Progress" ar="تقدّمي" hue="indigo" icon={<BarChart3 />} sub="Everything here comes from your own activity in this browser." subAr="كل ما يظهر هنا مبني على نشاطك الفعلي في هذا المتصفح." />
      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[['Course completion', 'إكمال الدورة', `${p.pct}%`, 'indigo'], ['Lessons completed', 'الدروس المكتملة', `${p.done.length}/${ALL_LESSONS.length}`, 'green'], ['Average accuracy', 'متوسط الدقة', p.acc == null ? '—' : `${p.acc}%`, 'amber'], ['Learning streak', 'أيام متتالية', `${p.streak} day${p.streak === 1 ? '' : 's'}`, 'orange']].map(([l, a, v, h]) => <Card key={l} className="p-4"><p className="text-sm text-slate-500">{l} <ArLabel className="text-xs">{a}</ArLabel></p><p className={cx('mt-1 text-3xl font-semibold tabular-nums', HUE[h as Hue].text)}>{v}</p></Card>)}
      </div>
      {s.last && <Card className="mb-8 flex flex-wrap items-center gap-4 p-4" onClick={() => go(s.last!.page === 'quiz' ? 'quizzes' : s.last!.page)}><PlayCircle className="text-indigo-600" /><span className="flex-1">Resume where you stopped: <b>{ALL_LESSONS.find((l) => l.page === s.last!.page)?.en ?? s.last.page.replace(/-/g, ' ')}</b> <span className="text-sm text-slate-400">· {new Date(s.last.ts).toLocaleString()}</span></span><ArrowRight /></Card>}
      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        <Card className="p-5"><p className="mb-4 font-semibold">Module progress <ArLabel className="text-sm font-normal text-slate-500">تقدم الوحدات</ArLabel></p><ul className="space-y-3">{MODULES.map((m) => <li key={m.id}><div className="mb-1 flex justify-between text-sm"><span>{m.n}. {m.en}</span><span className="tabular-nums text-slate-500">{p.modPct(m)}%</span></div><Progress pct={p.modPct(m)} hue={m.color as Hue} /></li>)}</ul></Card>
        <Card className="p-5"><p className="mb-4 font-semibold">Quiz scores <ArLabel className="text-sm font-normal text-slate-500">نتائج الاختبارات</ArLabel></p>
          {hist.length < 1 ? <Empty title="No quizzes yet." ar="لا توجد اختبارات بعد" /> : <div className="h-64"><ResponsiveContainer><LineChart data={hist} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}><CartesianGrid stroke="#f1f5f9" /><XAxis dataKey="n" tick={{ fontSize: 12 }} /><YAxis domain={[0, 100]} tick={{ fontSize: 12 }} /><Tooltip formatter={(v: number) => `${v}%`} labelFormatter={(l, pl) => pl?.[0]?.payload?.title ?? l} /><ReferenceLine y={80} stroke="#059669" strokeDasharray="4 4" /><Line type="monotone" dataKey="pct" stroke="#d97706" strokeWidth={2.5} dot={{ r: 3 }} /></LineChart></ResponsiveContainer></div>}
          {hist.length > 0 && <p className="mt-2 text-xs text-slate-400">Last {hist.length} quizzes. The dashed green line marks the 80% mastery level.</p>}</Card>
      </div>
      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        <Card className="p-5"><p className="mb-4 font-semibold">Grammar areas <ArLabel className="text-sm font-normal text-slate-500">نقاط القوة والضعف</ArLabel></p>
          {cats.length === 0 ? <Empty title="Answer some questions to see your strengths." /> : <>
            <div style={{ height: Math.max(160, cats.length * 34) }}><ResponsiveContainer><BarChart data={cats} layout="vertical" margin={{ left: 10, right: 16 }}><XAxis type="number" domain={[0, 100]} hide /><YAxis type="category" dataKey="name" width={170} tick={{ fontSize: 12 }} /><Tooltip formatter={(v: number) => `${v}%`} /><Bar dataKey="pct" radius={[0, 6, 6, 0]}>{cats.map((c) => <Cell key={c.c} fill={c.pct >= 80 ? '#059669' : c.pct >= 50 ? '#d97706' : '#e11d48'} />)}</Bar></BarChart></ResponsiveContainer></div>
            <p className="mt-2 text-sm text-slate-600"><b>Strongest:</b> {cats[0].name} ({cats[0].pct}%) · <b>Needs work:</b> {cats[cats.length - 1].name} ({cats[cats.length - 1].pct}%)</p></>}</Card>
        <Card className="p-5"><p className="mb-4 font-semibold">Activity, last 4 weeks <ArLabel className="text-sm font-normal text-slate-500">النشاط</ArLabel></p>
          <div className="grid grid-cols-7 gap-1.5">{days.map((d) => <div key={d.k} title={`${d.k}: ${d.n} answers`} className={cx('grid aspect-square place-items-center rounded-md text-[11px]', d.n === 0 ? 'bg-slate-100 text-slate-400' : d.n < 10 ? 'bg-emerald-200 text-emerald-900' : d.n < 30 ? 'bg-emerald-400 text-white' : 'bg-emerald-600 text-white')}>{d.label}</div>)}</div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center"><div><p className="text-2xl font-semibold">{s.verbs.learned.length}</p><p className="text-xs text-slate-500">verbs learned</p></div><div><p className="text-2xl font-semibold">{s.verbs.fav.length}</p><p className="text-xs text-slate-500">favourite verbs</p></div><div><p className="text-2xl font-semibold">{p.answered}</p><p className="text-xs text-slate-500">answers given</p></div></div>
          {s.verbs.fav.length > 0 && <p className="mt-3 text-sm text-slate-600">Favourites: {s.verbs.fav.slice(0, 20).join(', ')}</p>}</Card>
      </div>
      <Section title="Assessment history" ar="سجل التقييمات">
        {recent.length === 0 ? <Empty title="No assessments yet." /> : <Card className="overflow-hidden"><table className="stack w-full text-left"><thead className="bg-slate-50 text-sm text-slate-500"><tr><th className="px-4 py-2 font-medium">Quiz</th><th className="px-4 py-2 font-medium">Mode</th><th className="px-4 py-2 font-medium">Score</th><th className="px-4 py-2 font-medium">Date</th></tr></thead>
          <tbody>{recent.map((q) => <tr key={q.id} className="border-t border-slate-100"><td className="px-4 py-2.5">{q.title}</td><td className="px-4 py-2.5 text-sm text-slate-500">{q.mode}</td><td className="px-4 py-2.5"><Badge hue={q.pct >= 80 ? 'green' : q.pct >= 50 ? 'amber' : 'red'}>{q.score}/{q.total} · {q.pct}%</Badge></td><td className="whitespace-nowrap px-4 py-2.5 text-sm text-slate-500">{new Date(q.date).toLocaleDateString()}</td></tr>)}</tbody></table></Card>}
      </Section>
      <Section title="Backup: export and import" ar="نسخ احتياطي: تصدير واستيراد">
        <Card className="grid gap-5 p-5 lg:grid-cols-2">
          <div><p className="mb-2 font-medium">Export</p><p className="mb-3 text-sm text-slate-500">Your progress is stored only in this browser. Copy the backup text and keep it somewhere safe (e.g. email it to yourself).</p>
            <div className="flex flex-wrap gap-2"><Btn variant="soft" onClick={() => { const t = JSON.stringify(s); setExportText(t); navigator.clipboard?.writeText(t).then(() => setMsg('Backup copied to the clipboard.'), () => setMsg('Select the text below and copy it.')); }}><Copy size={18} /> Copy backup</Btn></div>
            {exportText && <textarea readOnly value={exportText} onFocus={(e) => e.target.select()} className="mt-3 h-28 w-full rounded-xl border border-slate-300 p-2 font-mono text-xs" />}</div>
          <div><p className="mb-2 font-medium">Import</p><p className="mb-3 text-sm text-slate-500">Paste a backup, or choose a backup file. This replaces the current progress.</p>
            <textarea value={importText} onChange={(e) => setImportText(e.target.value)} placeholder="Paste backup text here" className="h-24 w-full rounded-xl border border-slate-300 p-2 font-mono text-xs" />
            <div className="mt-2 flex flex-wrap gap-2"><Btn variant="soft" disabled={!importText.trim()} onClick={() => doImport(importText)}><Upload size={18} /> Import text</Btn><Btn variant="outline" onClick={() => fileRef.current?.click()}><Download size={18} /> Choose file</Btn>
              <input ref={fileRef} type="file" accept=".json,.txt,application/json,text/plain" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) f.text().then(doImport); e.target.value = ''; }} /></div></div>
          {msg && <p className="rounded-xl bg-indigo-50 p-3 text-sm text-indigo-900 lg:col-span-2" role="status">{msg}</p>}
          <div className="border-t border-slate-100 pt-4 lg:col-span-2">{!confirmReset ? <Btn variant="ghost" onClick={() => setConfirmReset(true)}><Trash2 size={16} /> Reset all progress</Btn> : <div className="flex flex-wrap items-center gap-2"><span className="text-sm text-rose-700">This deletes all progress in this browser. Export a backup first if you need it.</span><Btn hue="red" onClick={() => { set(() => initialState()); setConfirmReset(false); setMsg('Progress reset.'); }}>Yes, reset</Btn><Btn variant="ghost" onClick={() => setConfirmReset(false)}>Cancel</Btn></div>}</div>
        </Card>
      </Section>
    </div>
  );
}
