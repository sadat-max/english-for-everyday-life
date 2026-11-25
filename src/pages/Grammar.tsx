import React, { useEffect, useMemo, useState } from 'react';
import { Users, Wrench, SpellCheck, Clock, PlayCircle, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { SUBJECTS, SUBJECT_MAP, build, parseTense } from '../engine/grammar';
import { arabicSentence } from '../engine/arabic';
import { VERB_MAP, VERBS } from '../data/verbs';
import { HELPERS, TIME_EXPR, SPELLING } from '../data/content';
import { TENSE_MAP } from '../data/tenses';
import { questionsFor } from '../data/questions';
import { thirdPerson, sRuleOf, ingForm, edForm } from '../engine/spelling';
import { pickQuestions, lessonQuiz } from '../lib/quiz';
import { useNav } from '../lib/nav';
import { useStore } from '../store/store';
import { KnowledgeCheck } from '../components/Quiz';
import { Badge, Btn, Card, Chip, Ex, HUE, PageHead, Section, Select, Speak, Tokens, Tr, cx, ArLabel, hueOfTense } from '../lib/ui';

function QuizCard({ lesson, title }: { lesson: string; title: string }) {
  const { startQuiz } = useNav(); const { s } = useStore();
  const l = s.lessons[lesson];
  return (
    <Card className="flex flex-wrap items-center gap-4 p-5">
      <div className="flex-1"><p className="font-semibold">{title}</p><p className="text-sm text-slate-500">8 questions · mastery 80% · {l?.best != null ? `best ${l.best}%` : 'not taken yet'}</p></div>
      <Btn hue="amber" onClick={() => startQuiz({ title, questions: lessonQuiz(lesson), kind: 'lesson', ref: lesson, mode: 'practice' })}><PlayCircle size={18} /> Practice</Btn>
      <Btn variant="outline" onClick={() => startQuiz({ title: `${title} (exam)`, questions: lessonQuiz(lesson), kind: 'lesson', ref: lesson, mode: 'exam' })}>Exam mode</Btn>
    </Card>
  );
}

const SUBJ_EXAMPLE: Record<string, [string, string]> = { company: ['sell', 'furniture'], companies: ['sell', 'furniture'] };

export function SubjectsPage() {
  const { visit } = useStore();
  useEffect(() => { visit('subjects', 'subjects'); }, []);
  const [subj, setSubj] = useState('he');
  const [verb, setVerb] = useState('work');
  const [tense, setTense] = useState('present-simple');
  const S = SUBJECT_MAP[subj];
  const groups: [string, string, string[]][] = [
    ['Singular subjects', 'الفاعل المفرد', ['I', 'you', 'he', 'she', 'it', 'ali', 'sara', 'manager', 'company']], ['Plural subjects', 'الفاعل الجمع', ['we', 'you', 'they', 'aliomar', 'employees', 'companies']],
    ['First person', 'المتكلم', ['I', 'we']], ['Second person', 'المخاطب', ['you']], ['Third person', 'الغائب', ['he', 'she', 'it', 'they', 'ali', 'sara', 'aliomar', 'manager', 'employees', 'company', 'companies']],
    ['Names of people', 'أسماء الأشخاص', ['ali', 'sara', 'aliomar']], ['Names of companies', 'أسماء الشركات', ['company', 'companies']], ['Objects & animals', 'الأشياء والحيوانات', ['it']], ['Groups of people', 'مجموعات الناس', ['employees', 'aliomar', 'they', 'we']],
  ];
  const checks = useMemo(() => pickQuestions(questionsFor('agreement'), 5), []);
  const sw = SUBJECTS.map((x) => ({ x, b: build(x, VERB_MAP[verb], parseTense(tense), 'aff', { comp: VERB_MAP[verb].comp }) }));
  return (
    <div>
      <PageHead title="Subjects & Pronouns" ar="الفاعل والضمائر" hue="teal" icon={<Users />} sub="The subject is who or what does the action. When the subject changes, the verb or the helping verb often changes too." subAr="الفاعل هو من يقوم بالفعل. وعندما يتغير الفاعل، يتغير الفعل أو الفعل المساعد غالباً." />
      <Section title="All subject types" ar="أنواع الفاعل">
        <Card className="overflow-hidden"><table className="stack w-full text-left">
          <thead className="bg-teal-50 text-sm text-teal-800"><tr><th className="px-4 py-2 font-medium">Subject</th><th className="px-4 py-2 font-medium">Arabic</th><th className="px-4 py-2 font-medium">Type</th><th className="px-4 py-2 font-medium">Example</th></tr></thead>
          <tbody>{SUBJECTS.map((x) => { const [v, c] = SUBJ_EXAMPLE[x.id] ?? ['work', '']; const b = build(x, VERB_MAP[v], parseTense('present-simple'), 'aff', { comp: c || undefined }); return (
            <tr key={x.id} className="border-t border-slate-100"><td className="px-4 py-3 font-semibold text-teal-700">{x.id === 'I' ? 'I' : x.en.replace(/^the |^my /, (m) => m)}</td><td className="px-4 py-3"><span dir="rtl" className="font-ar">{x.ar}</span></td><td className="px-4 py-3 text-sm text-slate-600">{x.kind}<ArLabel className="block text-xs text-slate-400">{x.kindAr}</ArLabel></td><td className="px-4 py-3"><span className="me-1">{b.tokens.filter((t) => t.r !== 'punct').map((t, i) => <span key={i} className={t.r === 'verb' ? (x.person === 3 && !x.plural ? 'font-semibold text-indigo-700' : 'font-semibold text-slate-800') : ''}>{t.t} </span>)}</span><Speak text={b.text} /></td></tr>); })}</tbody>
        </table></Card>
        <Card className="mt-4 border-teal-200 bg-teal-50/60 p-5"><Ex en={<span><b>Key rule:</b> one name (Ali, Sara, the manager, my company) follows the same rules as <b>he / she / it</b>. Two or more names, or a plural noun, follow the rules of <b>they</b>.</span>} ar="الاسم المفرد (علي، سارة، المدير، شركتي) يأخذ قواعد he/she/it، أما الاسمان أو أكثر والجمع فيأخذون قواعد they." /></Card>
      </Section>
      <Section title="Subject groups" ar="مجموعات الفاعل">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{groups.map(([en, ar, ids]) => <Card key={en} className="p-4"><p className="font-semibold">{en} <ArLabel className="text-sm font-normal text-slate-500">{ar}</ArLabel></p><div className="mt-2 flex flex-wrap gap-1.5">{ids.map((i) => <Badge key={i} hue="teal">{i === 'I' ? 'I' : SUBJECT_MAP[i].en}</Badge>)}</div></Card>)}</div>
      </Section>
      <Section title="Subject switcher" ar="أداة تبديل الفاعل">
        <Card className="p-5">
          <div className="mb-4 flex flex-wrap gap-3"><Select label="Verb" className="w-52" value={verb} onChange={setVerb} options={['work', 'go', 'study', 'watch', 'have', 'sell', 'speak', 'fly', 'finish', 'play'].map((v) => ({ v, l: `${v} · ${VERB_MAP[v].ar}` }))} /><Select label="Tense" className="w-56" value={tense} onChange={setTense} options={['present-simple', 'present-continuous', 'present-perfect', 'past-simple', 'past-continuous', 'future-simple'].map((t) => ({ v: t, l: TENSE_MAP[t].en }))} /></div>
          <div className="mb-4 flex flex-wrap gap-2">{SUBJECTS.map((x) => <Chip key={x.id} hue="teal" on={subj === x.id} onClick={() => setSubj(x.id)}>{x.id === 'I' ? 'I' : x.en}</Chip>)}</div>
          {(() => { const b = sw.find((y) => y.x.id === subj)!.b; const ar = arabicSentence(S, verb, parseTense(tense), 'aff', true); return (
            <div className="rounded-2xl border border-teal-200 bg-white p-5"><div className="flex items-start gap-3"><div className="flex-1"><Tokens tokens={b.tokens} big legend /></div><Speak text={b.text} /></div>{ar && <Tr ar={ar} className="mt-3 text-lg" />}
              <p className="mt-3 text-sm text-slate-600">“{S.id === 'I' ? 'I' : S.en}” = <b>{S.pron}</b> · {S.kind}. {tense === 'present-simple' && verb !== 'have' && (S.person === 3 && !S.plural ? <>Third person singular → add <b className="text-indigo-700">-s / -es / -ies</b>.</> : 'Not third person singular → base verb, no -s.')}</p></div>); })()}
          <div className="mt-4 grid gap-1.5 sm:grid-cols-2">{sw.map(({ x, b }) => <button key={x.id} onClick={() => setSubj(x.id)} className={cx('rounded-lg px-3 py-1.5 text-left text-[15px]', subj === x.id ? 'bg-teal-50 font-medium' : 'hover:bg-slate-50')}>{b.text}</button>)}</div>
        </Card>
      </Section>
      <Section title="How the subject changes the helping verb" ar="كيف يغيّر الفاعل الفعل المساعد">
        <Card className="overflow-x-auto"><table className="w-full min-w-[520px] text-left">
          <thead className="bg-slate-50 text-sm text-slate-500"><tr>{['Subject', 'Be', 'Do', 'Have', 'Past be'].map((h) => <th key={h} className="px-4 py-2 font-medium">{h}</th>)}</tr></thead>
          <tbody>{[['I', 'am', 'do', 'have', 'was'], ['You', 'are', 'do', 'have', 'were'], ['He', 'is', 'does', 'has', 'was'], ['She', 'is', 'does', 'has', 'was'], ['It', 'is', 'does', 'has', 'was'], ['We', 'are', 'do', 'have', 'were'], ['They', 'are', 'do', 'have', 'were']].map((r) => (
            <tr key={r[0]} className={cx('border-t border-slate-100', ['He', 'She', 'It'].includes(r[0]) && 'bg-indigo-50/40')}>{r.map((c, i) => <td key={i} className={cx('px-4 py-2.5', i === 0 ? 'font-semibold text-teal-700' : ['is', 'does', 'has'].includes(c) ? 'font-semibold text-indigo-700' : '')}>{c}</td>)}</tr>))}</tbody>
        </table></Card>
      </Section>
      <Section title="Practice: subject–verb agreement" ar="تدريب: توافق الفاعل والفعل">
        <KnowledgeCheck questions={checks} title="Agreement practice" />
        <div className="mt-4 grid gap-3"><QuizCard lesson="subjects" title="Subjects & pronouns — lesson quiz" /><QuizCard lesson="agreement" title="Subject–verb agreement — lesson quiz" /></div>
      </Section>
    </div>
  );
}

export function HelpingPage() {
  const { visit } = useStore();
  useEffect(() => { visit('helping', 'helping'); }, []);
  const [subj, setSubj] = useState('he');
  const S = SUBJECT_MAP[subj];
  const rows: [string, string, string][] = [['present-simple', 'q', 'Do / Does'], ['past-simple', 'q', 'Did'], ['present-continuous', 'q', 'Am / Is / Are'], ['past-continuous', 'q', 'Was / Were'], ['present-perfect', 'q', 'Have / Has'], ['past-perfect', 'q', 'Had'], ['future-simple', 'q', 'Will']];
  const checks = useMemo(() => pickQuestions(questionsFor('helping'), 5), []);
  return (
    <div>
      <PageHead title="Helping Verbs" ar="الأفعال المساعدة" hue="teal" icon={<Wrench />} sub="Helping verbs build tenses, negatives and questions. The main verb carries the meaning; the helping verb carries the time and the subject agreement." subAr="الأفعال المساعدة تكوّن الأزمنة والنفي والسؤال. الفعل الرئيسي يحمل المعنى، والمساعد يحمل الزمن والتوافق مع الفاعل." />
      <Section title="Interactive comparison" ar="مقارنة تفاعلية">
        <Card className="p-5">
          <div className="mb-4 flex flex-wrap gap-2">{SUBJECTS.map((x) => <Chip key={x.id} hue="teal" on={subj === x.id} onClick={() => setSubj(x.id)}>{x.id === 'I' ? 'I' : x.en}</Chip>)}</div>
          <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-left"><thead className="text-sm text-slate-500"><tr><th className="py-2 pe-4 font-medium">Helper</th><th className="py-2 pe-4 font-medium">Question</th><th className="py-2 pe-4 font-medium">Negative</th><th /></tr></thead>
            <tbody>{rows.map(([t, , label]) => { const T = parseTense(t); const q = build(S, VERB_MAP.work, T, 'q', { comp: 'here' }); const n = build(S, VERB_MAP.work, T, 'neg', { comp: 'here', contracted: true }); return (
              <tr key={t} className="border-t border-slate-100"><td className={cx('py-3 pe-4 text-sm font-semibold', HUE[hueOfTense(t)].text)}>{label}<span className="block text-xs font-normal text-slate-400">{TENSE_MAP[t].en}</span></td><td className="py-3 pe-4"><Tokens tokens={q.tokens} /></td><td className="py-3 pe-4 text-slate-700">{n.text}</td><td><Speak text={q.text} /></td></tr>); })}</tbody></table></div>
        </Card>
      </Section>
      {HELPERS.map((h) => (
        <Section key={h.id} id={`h-${h.id}`} title={h.words} ar={h.ar}>
          <Card className="grid gap-5 p-5 lg:grid-cols-3">
            <div><p className="mb-2 text-sm font-semibold text-slate-500">Which subjects?</p><ul className="space-y-1.5">{h.subjects.map((x) => <li key={x.s} className="flex items-start justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2"><span className="text-slate-700">{x.s}</span><b className={HUE[h.color as 'green'].text}>{x.w}</b></li>)}</ul></div>
            <div><p className="mb-2 text-sm font-semibold text-slate-500">Used in</p><ul className="list-disc space-y-1 ps-5 text-slate-700">{h.uses.map((u) => <li key={u}>{u}</li>)}</ul>
              <p className="mb-1 mt-4 text-sm font-semibold text-slate-500">Negatives</p>{h.neg.map((x) => <p key={x} className="text-slate-700">{x}</p>)}
              <p className="mb-1 mt-3 text-sm font-semibold text-slate-500">Questions</p>{h.q.map((x) => <p key={x} className="text-slate-700">{x} <Speak text={x} /></p>)}</div>
            <div><p className="mb-2 text-sm font-semibold text-slate-500">Common mistakes</p>{h.mistakes.map((m) => <div key={m.wrong} className="mb-2 rounded-lg border border-slate-100 p-2.5"><p className="flex items-center gap-1.5 text-rose-600"><XCircle size={15} /><span className="line-through">{m.wrong}</span></p><p className="flex items-center gap-1.5 font-medium text-emerald-700"><CheckCircle2 size={15} />{m.right}</p></div>)}
              <Tr ar={h.noteAr} className="mt-3 rounded-lg bg-teal-50 p-3 text-sm" /></div>
          </Card>
        </Section>
      ))}
      <Section title="Practice" ar="تدريب"><KnowledgeCheck questions={checks} title="Choose the helping verb" /><div className="mt-4"><QuizCard lesson="helping" title="Helping verbs — lesson quiz" /></div></Section>
    </div>
  );
}

export function SesIesPage() {
  const { visit } = useStore();
  useEffect(() => { visit('sesies', 'sesies'); }, []);
  const [w, setW] = useState('watch');
  const base = w.trim().toLowerCase();
  const known = VERB_MAP[base];
  const rule = base ? sRuleOf(base) : 's';
  const ruleText = { s: 'Add -s', es: 'Add -es (ends in s, ss, sh, ch, x, z or o)', ies: 'Consonant + y → change y to -ies', special: 'Special form' }[rule];
  const checks = useMemo(() => pickQuestions(questionsFor('sesies'), 5), []);
  const spellChecks = useMemo(() => pickQuestions(questionsFor('spelling'), 4), []);
  const rules: [string, string, string[], string][] = [
    ['Rule 1 — Add S', 'القاعدة 1 — نضيف S', ['work → works', 'read → reads', 'speak → speaks', 'eat → eats'], 'green'],
    ['Rule 2 — Add ES', 'القاعدة 2 — نضيف ES', ['go → goes', 'do → does', 'watch → watches', 'wash → washes', 'fix → fixes', 'pass → passes'], 'teal'],
    ['Rule 3 — Consonant + Y → IES', 'القاعدة 3 — ساكن + Y ← IES', ['study → studies', 'try → tries', 'carry → carries', 'fly → flies'], 'indigo'],
    ['Rule 4 — Vowel + Y → S', 'القاعدة 4 — علة + Y ← S', ['play → plays', 'enjoy → enjoys', 'buy → buys'], 'blue'],
    ['Rule 5 — Special forms', 'القاعدة 5 — صيغ خاصة', ['have → has', 'be → is'], 'purple'],
  ];
  return (
    <div>
      <PageHead title="S / ES / IES Rules" ar="قواعد إضافة S / ES / IES" hue="green" icon={<SpellCheck />} sub="In the affirmative Present Simple, he / she / it (and one name or thing) add -s, -es or -ies to the verb." subAr="في المضارع البسيط المثبت فقط، نضيف s أو es أو ies للفعل مع he/she/it أو الاسم المفرد." />
      <div className="mb-10 grid gap-3 md:grid-cols-2 xl:grid-cols-5">{rules.map(([t, ar, ex, h]) => <Card key={t} hue={h as 'green'} className="p-4"><p className={cx('font-semibold', HUE[h as 'green'].text)}>{t}</p><ArLabel className="block text-sm text-slate-500">{ar}</ArLabel><ul className="mt-2 space-y-1">{ex.map((e) => <li key={e} className="text-slate-800">{e}</li>)}</ul></Card>)}</div>
      <Section title="Try any verb" ar="جرّب أي فعل">
        <Card className="grid gap-4 p-5 md:grid-cols-[1fr_1.4fr] md:items-center">
          <label className="block"><span className="mb-1 block text-sm text-slate-500">Type a base verb</span><input value={w} onChange={(e) => setW(e.target.value)} className="h-12 w-full rounded-xl border border-slate-300 px-4 text-lg" placeholder="e.g. watch" /></label>
          {base && /^[a-z]+$/.test(base) ? <div className="rounded-xl bg-emerald-50 p-4"><p className="text-2xl">He <b className="text-indigo-700">{thirdPerson(base)}</b> <Speak text={`He ${thirdPerson(base)}`} /></p><p className="text-sm text-emerald-800">{ruleText}{!known && ' · not in the library, so check the spelling'}</p></div> : <p className="text-sm text-slate-500">Letters only, please.</p>}
        </Card>
      </Section>
      <Section title="Only in the affirmative Present Simple" ar="فقط في المضارع البسيط المثبت">
        <Card className="p-5"><Ex en="The -s ending is not added to every sentence with he, she or it. Only the affirmative Present Simple has it." ar="لا نضيف s لكل جملة فيها he أو she أو it، بل فقط في المضارع البسيط المثبت." />
          <div className="mt-4 grid gap-2 sm:grid-cols-5">{[['He works.', true, 'affirmative'], ["He doesn't work.", false, 'negative: does takes the s'], ['Does he work?', false, 'question'], ['He will work.', false, 'future'], ['He worked.', false, 'past']].map(([s, has, note]) => <div key={s as string} className={cx('rounded-xl border p-3', has ? 'border-indigo-200 bg-indigo-50' : 'border-slate-200')}><p className="font-semibold">{s as string}</p><p className="text-xs text-slate-500">{has ? '-s here' : 'no -s on the verb'} · {note as string}</p></div>)}</div></Card>
      </Section>
      <Section title="Practice" ar="تدريب"><KnowledgeCheck questions={checks} title="S / ES / IES practice" /><div className="mt-4"><QuizCard lesson="sesies" title="S / ES / IES — lesson quiz" /></div></Section>
      <Section id="spelling" title="ED and ING spelling" ar="قواعد إملاء ED و ING">
        <div className="grid gap-4 lg:grid-cols-2">{([['-ED (past)', SPELLING.ed, edForm], ['-ING', SPELLING.ing, ingForm]] as const).map(([t, list]) => (
          <Card key={t} className="p-5"><p className="mb-3 text-lg font-semibold">{t}</p><ul className="space-y-3">{list.map((r) => <li key={r.rule}><p className="font-medium text-slate-800">{r.rule}</p><ArLabel className="block text-sm text-slate-500">{r.ar}</ArLabel><p className="text-sm text-indigo-700">{r.ex.join(' · ')}</p></li>)}</ul></Card>))}</div>
        <Card className="mt-4 p-5"><p className="mb-2 font-semibold">Regular and irregular past forms <ArLabel className="font-normal text-slate-500">الأفعال المنتظمة والشاذة</ArLabel></p>
          <Ex en="Regular verbs add -ed for both V2 and V3 (work – worked – worked). Irregular verbs must be learned (go – went – gone). The Verb Library marks every verb." ar="الأفعال المنتظمة تضيف ed للتصريفين الثاني والثالث، أما الشاذة فتُحفظ. مكتبة الأفعال توضح نوع كل فعل." small />
          <div className="mt-3 flex flex-wrap gap-2">{VERBS.filter((v) => v.irregular && v.common).slice(0, 14).map((v) => <Badge key={v.base} hue="purple">{v.base} – {v.v2} – {v.v3}</Badge>)}</div></Card>
        <div className="mt-4"><KnowledgeCheck questions={spellChecks} title="Spelling practice" /></div>
        <div className="mt-4"><QuizCard lesson="spelling" title="ED & ING spelling — lesson quiz" /></div>
      </Section>
    </div>
  );
}

export function TimePage() {
  const { visit } = useStore(); const { go } = useNav();
  useEffect(() => { visit('time', 'time-expressions'); }, []);
  const [g, setG] = useState<'all' | 'present' | 'past' | 'future' | 'perfect'>('all');
  const checks = useMemo(() => pickQuestions(questionsFor('time-expressions'), 5), []);
  const groups = [['all', 'All', 'الكل', 'slate'], ['present', 'Present', 'الحاضر', 'green'], ['past', 'Past', 'الماضي', 'purple'], ['future', 'Future', 'المستقبل', 'orange'], ['perfect', 'Perfect', 'التام', 'blue']] as const;
  return (
    <div>
      <PageHead title="Time Expressions" ar="تعبيرات الزمن" hue="amber" icon={<Clock />} sub="Words like yesterday, now and since are strong clues for the tense — but the meaning decides. Some expressions work with several tenses." subAr="كلمات مثل yesterday وnow وsince قرائن قوية على الزمن، لكن المعنى هو الذي يحدد، وبعض التعبيرات تصلح لأكثر من زمن." />
      <div className="mb-6 flex flex-wrap gap-2">{groups.map(([id, en, ar, h]) => <Chip key={id} hue={h as 'green'} on={g === id} onClick={() => setG(id)}>{en} <ArLabel>{ar}</ArLabel></Chip>)}</div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{TIME_EXPR.filter((x) => g === 'all' || x.group === g).map((x) => {
        const h = x.group === 'present' ? 'green' : x.group === 'past' ? 'purple' : x.group === 'future' ? 'orange' : 'blue';
        return (
          <Card key={x.en} hue={h} className="p-4">
            <div className="flex items-start justify-between gap-2"><p className={cx('text-lg font-semibold', HUE[h].text)}>{x.en}</p><span dir="rtl" className="font-ar text-slate-600">{x.ar}</span></div>
            <p className="mt-2 text-slate-800">{x.ex} <Speak text={x.ex} /></p><Tr ar={x.exAr} className="text-sm" />
            <p className="mt-2 text-sm text-slate-500"><b>Position:</b> {x.place}</p>
            <div className="mt-2 flex flex-wrap gap-1">{x.tenses.map((t) => <button key={t} onClick={() => go(t)} className={cx('rounded-full px-2 py-0.5 text-xs', HUE[hueOfTense(t)].soft, HUE[hueOfTense(t)].text)}>{TENSE_MAP[t].en}</button>)}</div>
          </Card>);
      })}</div>
      <Section className="mt-10" title="Practice" ar="تدريب"><KnowledgeCheck questions={checks} title="Choose the time expression" /><div className="mt-4"><QuizCard lesson="time-expressions" title="Time expressions — lesson quiz" /></div></Section>
    </div>
  );
}
export { QuizCard };
