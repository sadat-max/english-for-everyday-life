import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, Star, Check, Dumbbell, X, Layers3, RotateCcw, ChevronLeft, ChevronRight, Snail, AlertTriangle } from 'lucide-react';
import { VERBS, VERB_MAP, VERB_CATEGORIES, VERB_NOTES, Verb } from '../data/verbs';
import { TENSES_BY_ORDER, TENSES } from '../data/tenses';
import { build, SUBJECT_MAP, parseTense } from '../engine/grammar';
import { verbQuiz, shuffle } from '../lib/quiz';
import { useNav } from '../lib/nav';
import { useStore } from '../store/store';
import { Badge, Btn, Card, Chip, Ex, HUE, PageHead, Section, Select, Speak, Tr, cx, hueOfTense, ArLabel, Empty } from '../lib/ui';

// Common expressions and extra usage for frequently used verbs.
export const VERB_EXTRA: Record<string, { expr: string[]; business?: string; everyday?: string }> = {
  make: { expr: ['make a decision', 'make a mistake', 'make money', 'make a call', 'make progress'], business: 'We made a decision about the new branch.', everyday: 'My wife makes great coffee.' },
  do: { expr: ['do business', 'do your best', 'do the work', 'do the shopping'], business: 'We do business with five suppliers.', everyday: 'I do the shopping on Thursdays.' },
  take: { expr: ['take a break', 'take a decision (UK)', 'take notes', 'take a taxi', 'take part in'], business: 'Let\'s take a short break.', everyday: 'I take my children to school.' },
  get: { expr: ['get ready', 'get a discount', 'get in touch', 'get back to someone'], business: 'I will get back to you this afternoon.', everyday: 'I get home at six.' },
  have: { expr: ['have a meeting', 'have lunch', 'have a look', 'have a good day'], business: 'We have a meeting at ten.', everyday: 'We usually have dinner at eight.' },
  go: { expr: ['go shopping', 'go on a trip', 'go ahead', 'go up / go down (prices)'], business: 'Prices went up last month.', everyday: 'We go to the beach on Fridays.' },
  give: { expr: ['give a presentation', 'give a discount', 'give someone a call', 'give feedback'], business: 'She gave an excellent presentation.', everyday: 'Give me a call when you arrive.' },
  send: { expr: ['send an email', 'send a reminder', 'send an invoice', 'send regards'], business: 'Please send the invoice today.', everyday: 'I sent my brother a message.' },
  call: { expr: ['call back', 'call a meeting', 'call off (cancel)', 'make a call'], business: 'I will call the supplier back.', everyday: 'Call me when you are free.' },
  work: { expr: ['work from home', 'work on a project', 'work overtime', 'it works (it functions)'], business: 'Our team is working on a new project.', everyday: 'The new phone works well.' },
  run: { expr: ['run a company', 'run a meeting', 'run out of', 'run late'], business: 'He runs three companies.', everyday: 'We ran out of milk.' },
  pay: { expr: ['pay the bill', 'pay in cash', 'pay attention', 'pay a deposit'], business: 'The customer paid a deposit.', everyday: 'Can I pay by card?' },
  meet: { expr: ['meet a deadline', 'meet a client', 'meet the target', 'nice to meet you'], business: 'We met the sales target.', everyday: 'Nice to meet you.' },
  keep: { expr: ['keep in touch', 'keep a record', 'keep calm', 'keep going'], business: 'Keep a record of every payment.', everyday: 'Let\'s keep in touch.' },
  sell: { expr: ['sell out', 'sell online', 'sell at a discount'], business: 'The new model sold out in a week.', everyday: 'He sold his old car.' },
  buy: { expr: ['buy in bulk', 'buy online', 'buy time'], business: 'We buy materials in bulk.', everyday: 'I bought a gift for my mother.' },
  set: { expr: ['set a goal', 'set a meeting', 'set up a company', 'set a price'], business: 'We set clear goals for the year.', everyday: 'I set my alarm for five.' },
  check: { expr: ['check in', 'check out', 'check the numbers', 'double-check'], business: 'Please double-check the figures.', everyday: 'We checked in at the hotel.' },
  book: { expr: ['book a room', 'book a table', 'book a flight', 'fully booked'], business: 'I booked a room for the conference.', everyday: 'The restaurant is fully booked.' },
  look: { expr: ['look for', 'look forward to', 'look after', 'look into'], business: 'We look forward to working with you.', everyday: 'I am looking for my keys.' },
  bring: { expr: ['bring up (a topic)', 'bring in (customers)', 'bring back'], business: 'The campaign brought in new customers.', everyday: 'Bring your passport.' },
  deliver: { expr: ['deliver on time', 'deliver results', 'deliver a speech'], business: 'We always deliver on time.', everyday: 'They deliver pizza until midnight.' },
  manage: { expr: ['manage a team', 'manage time', 'manage to (succeed)'], business: 'She manages a team of twelve.', everyday: 'I managed to find a parking space.' },
  close: { expr: ['close a deal', 'close early', 'close an account'], business: 'We closed the deal yesterday.', everyday: 'The shop closes at eleven.' },
  start: { expr: ['start a business', 'start work', 'start over'], business: 'He started his business in 2010.', everyday: 'Let\'s start dinner.' },
};

const FILTERS: [string, string, (v: Verb, s: { fav: string[]; learned: string[]; practice: string[] }) => boolean][] = [
  ['regular', 'Regular', (v) => !v.irregular], ['irregular', 'Irregular', (v) => v.irregular], ['common', 'Most common', (v) => v.common],
  ['beginner', 'Beginner', (v) => v.level === 1], ['intermediate', 'Intermediate', (v) => v.level === 2], ['business', 'Business English', (v) => v.cats.some((c) => ['bu', 'fi', 'sm', 'of', 'cs'].includes(c))],
  ['s', 'Takes -s', (v) => v.sRule === 's'], ['es', 'Takes -es', (v) => v.sRule === 'es'], ['ies', 'Takes -ies', (v) => v.sRule === 'ies'],
  ['fav', 'Favourites', (v, s) => s.fav.includes(v.base)], ['learned', 'Learned', (v, s) => s.learned.includes(v.base)], ['practice', 'Need practice', (v, s) => s.practice.includes(v.base)],
];

export function VerbPanel({ base, onClose }: { base: string; onClose: () => void }) {
  const v = VERB_MAP[base];
  const { s, toggleVerb } = useStore();
  const { startQuiz } = useNav();
  useEffect(() => { const f = (e: KeyboardEvent) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', f); return () => window.removeEventListener('keydown', f); }, [onClose]);
  const fromLessons = useMemo(() => {
    if (!v) return [];
    const forms = new Set([v.base, v.v2, v.v3, v.ing, v.s3].flatMap((f) => f.split('/')));
    return TENSES.flatMap((t) => t.examples.map((e) => ({ ...e, t }))).filter((e) => e.en.toLowerCase().split(/[^a-z']+/).some((w) => forms.has(w))).slice(0, 6);
  }, [base]);
  if (!v) return null;
  const extra = VERB_EXTRA[base];
  const meanings = v.ar.split('/').map((x) => x.trim());
  const isFav = s.verbs.fav.includes(base), isLearned = s.verbs.learned.includes(base), needs = s.verbs.practice.includes(base);
  return (
    <div className="no-print fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={`Verb ${base}`}>
      <div className="absolute inset-0 bg-slate-900/30" onClick={onClose} />
      <div className="relative h-full w-full max-w-2xl overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur">
          <div className="flex-1"><p className="text-3xl font-semibold text-indigo-700">{v.base}</p><p dir="rtl" className="font-ar text-lg text-slate-600">{v.ar}</p></div>
          <Speak text={v.base} label="Listen" /><Speak text={v.base} slow label="Slow" />
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100" aria-label="Close"><X /></button>
        </div>
        <div className="space-y-6 p-5">
          <div className="flex flex-wrap gap-2"><Badge hue={v.irregular ? 'purple' : 'green'}>{v.irregular ? 'Irregular' : 'Regular'}</Badge><Badge>{v.level === 1 ? 'Beginner' : 'Intermediate'}</Badge>{v.common && <Badge hue="amber">Most common</Badge>}{v.stative !== 'no' && <Badge hue="red">{v.stative === 'yes' ? 'Stative verb' : 'Stative in some meanings'}</Badge>}{v.cats.map((c) => <Badge key={c} hue="indigo">{VERB_CATEGORIES[c]?.en}</Badge>)}</div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{[['Base V1', v.base], ['Past V2', v.v2], ['Participle V3', v.v3], ['-ing form', v.ing], ['He/She/It', v.s3], ['Future', `will ${v.base}`]].map(([l, x]) => <div key={l} className="rounded-xl border border-slate-200 p-3"><p className="text-xs text-slate-500">{l}</p><p className="flex items-center justify-between text-lg font-semibold text-slate-900">{x}<Speak text={x.replace('/', ' or ')} /></p></div>)}</div>
          <p className="text-sm text-slate-500">After <b>will</b>, English uses the base verb. There is no separate future ending. <ArLabel>بعد will نستخدم الفعل الأساسي.</ArLabel></p>
          {VERB_NOTES[base] && <p className="flex gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-900"><AlertTriangle size={18} className="shrink-0" />{VERB_NOTES[base]}</p>}
          {meanings.length > 1 && <div><p className="mb-1 font-semibold">Alternative meanings</p><div className="flex flex-wrap gap-2">{meanings.map((m) => <span key={m} dir="rtl" className="rounded-lg bg-slate-50 px-3 py-1 font-ar">{m}</span>)}</div></div>}
          {extra && <div><p className="mb-2 font-semibold">Common expressions</p><div className="flex flex-wrap gap-2">{extra.expr.map((e) => <Badge key={e} hue="indigo" className="text-sm">{e}</Badge>)}</div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">{extra.everyday && <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Everyday</p><p>{extra.everyday} <Speak text={extra.everyday} /></p></div>}{extra.business && <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Business</p><p>{extra.business} <Speak text={extra.business} /></p></div>}</div></div>}
          {fromLessons.length > 0 && <div><p className="mb-2 font-semibold">Examples from the lessons</p><ul className="space-y-2">{fromLessons.map((e) => <li key={e.en} className="rounded-xl border border-slate-100 p-3"><p>{e.en} <Speak text={e.en} /></p><Tr ar={e.ar} className="text-sm" /><p className="text-xs text-slate-400">{e.t.en} · {e.topic}</p></li>)}</ul></div>}
          <div><p className="mb-2 font-semibold">In all 12 tenses</p>
            <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">{TENSES_BY_ORDER.map((t) => { const b = build(SUBJECT_MAP.I, v, parseTense(t.id), 'aff', { comp: v.comp }); const unnatural = !!b.warning && (v.stative === 'yes' || base === 'be'); return (
              <li key={t.id} className="flex items-center gap-3 px-3 py-2"><span className={cx('w-44 shrink-0 text-xs font-semibold', HUE[hueOfTense(t.id)].text)}>{t.en}</span><span className={cx('flex-1', unnatural && 'text-slate-400 line-through decoration-slate-300')}>{b.text}</span>{!unnatural && <Speak text={b.text} />}</li>); })}</ul>
            {(v.stative === 'yes' || base === 'be') && <p className="mt-2 text-sm text-slate-500">Crossed-out forms are not natural, because “{base}” describes a state, not an action.</p>}
            {v.stative === 'mixed' && <p className="mt-2 text-sm text-slate-500">Continuous forms are natural only in the action meaning (see the note above).</p>}
          </div>
          <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
            <Btn variant={isFav ? 'primary' : 'soft'} hue="amber" onClick={() => toggleVerb('fav', base)}><Star size={18} fill={isFav ? 'currentColor' : 'none'} /> {isFav ? 'Favourite' : 'Add to favourites'}</Btn>
            <Btn variant={isLearned ? 'primary' : 'soft'} hue="green" onClick={() => { toggleVerb('learned', base); if (!isLearned) toggleVerb('practice', base, false); }}><Check size={18} /> {isLearned ? 'Learned' : 'Mark as learned'}</Btn>
            <Btn variant={needs ? 'primary' : 'soft'} hue="red" onClick={() => toggleVerb('practice', base)}>{needs ? 'Needs practice' : 'Needs more practice'}</Btn>
            <Btn variant="outline" onClick={() => { onClose(); startQuiz({ title: `Practise “${base}”`, questions: verbQuiz(v), kind: 'verb', ref: base, mode: 'practice' }); }}><Dumbbell size={18} /> Practise this verb</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

function Flashcards({ list, onClose }: { list: Verb[]; onClose: () => void }) {
  const { toggleVerb } = useStore();
  const [dir, setDir] = useState<'en-ar' | 'ar-en'>('en-ar');
  const [deck, setDeck] = useState(() => shuffle(list).slice(0, 30));
  const [i, setI] = useState(0); const [flip, setFlip] = useState(false);
  const [known, setKnown] = useState(0);
  const v = deck[i];
  const nextCard = (k?: boolean) => { if (k === true) { setKnown(known + 1); toggleVerb('learned', v.base, true); toggleVerb('practice', v.base, false); } if (k === false) toggleVerb('practice', v.base, true); setFlip(false); setI(i + 1); };
  useEffect(() => { const f = (e: KeyboardEvent) => { if (e.key === ' ') { e.preventDefault(); setFlip((x) => !x); } if (e.key === 'ArrowRight' && i < deck.length) { setFlip(false); setI(i + 1); } if (e.key === 'ArrowLeft' && i > 0) { setFlip(false); setI(i - 1); } }; window.addEventListener('keydown', f); return () => window.removeEventListener('keydown', f); }, [i, deck.length]);
  return (
    <Card className="p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><p className="font-semibold">Flashcards · {Math.min(i + 1, deck.length)} / {deck.length}</p>
        <div className="flex gap-2"><Chip on={dir === 'en-ar'} onClick={() => setDir('en-ar')}>English → Arabic</Chip><Chip on={dir === 'ar-en'} onClick={() => setDir('ar-en')}>Arabic → English</Chip><Btn variant="ghost" onClick={onClose}><X size={18} /> Close</Btn></div></div>
      {v ? (<>
        <button type="button" onClick={() => setFlip(!flip)} className={cx('grid min-h-[240px] w-full place-items-center rounded-2xl border-2 p-6 text-center transition', flip ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 bg-white hover:border-indigo-200')} aria-label="Flip card">
          {(dir === 'en-ar') !== flip ? <div><p className="text-4xl font-semibold text-slate-900">{v.base}</p>{flip && <p className="mt-2 text-slate-500">{v.v2} · {v.v3} · {v.ing}</p>}</div>
            : <div><p dir="rtl" className="font-ar text-3xl text-slate-900">{v.ar}</p>{flip && <p className="mt-2 text-slate-500">{v.base} – {v.v2} – {v.v3}</p>}</div>}
          {!flip && <p className="mt-4 text-sm text-slate-400">Tap or press space to flip</p>}
        </button>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-1"><Btn variant="ghost" disabled={i === 0} onClick={() => { setFlip(false); setI(i - 1); }} title="Previous"><ChevronLeft /></Btn><Speak text={v.base} /><Btn variant="ghost" onClick={() => { setFlip(false); setI(i + 1); }} title="Next"><ChevronRight /></Btn></div>
          {flip && <div className="flex gap-2"><Btn hue="red" variant="soft" onClick={() => nextCard(false)}>Practise again</Btn><Btn hue="green" onClick={() => nextCard(true)}><Check size={18} /> I knew it</Btn></div>}
        </div>
      </>) : <Empty title={`Deck finished — you knew ${known} of ${deck.length}.`} ar="انتهت البطاقات"><Btn onClick={() => { setDeck(shuffle(list).slice(0, 30)); setI(0); setKnown(0); }}><RotateCcw size={18} /> New deck</Btn></Empty>}
    </Card>
  );
}

export function VerbsPage() {
  const { s, visit } = useStore();
  const { verb, openVerb } = useNav();
  useEffect(() => { visit('verbs', 'verb-forms'); }, []);
  const [q, setQ] = useState(''); const [cat, setCat] = useState('all'); const [flt, setFlt] = useState<string[]>([]);
  const [limit, setLimit] = useState(60); const [cards, setCards] = useState(false);
  const list = useMemo(() => VERBS.filter((v) => {
    const t = q.trim().toLowerCase();
    if (t && !(v.base.includes(t) || v.v2.includes(t) || v.v3.includes(t) || v.ing.includes(t) || v.ar.includes(q.trim()))) return false;
    if (cat !== 'all' && !v.cats.includes(cat)) return false;
    return flt.every((f) => FILTERS.find((x) => x[0] === f)![2](v, s.verbs));
  }).sort((a, b) => (q && a.base.startsWith(q.toLowerCase()) ? -1 : 0) - (q && b.base.startsWith(q.toLowerCase()) ? -1 : 0)), [q, cat, flt, s.verbs]);
  useEffect(() => setLimit(60), [q, cat, flt]);
  return (
    <div>
      <PageHead title="Verb Library" ar="مكتبة الأفعال" hue="indigo" icon={<BookOpen />} sub={`${VERBS.length} common verbs with all their forms, Arabic meanings, pronunciation and examples. British spelling, with US variants noted.`} subAr={`${VERBS.length} فعلاً شائعاً مع جميع التصريفات والمعاني العربية والنطق والأمثلة.`}
        right={<Btn hue="indigo" onClick={() => setCards(!cards)} disabled={!list.length}><Layers3 size={18} /> {cards ? 'Back to table' : `Flashcards (${Math.min(list.length, 30)})`}</Btn>} />
      <div className="mb-4 grid gap-3 md:grid-cols-[1fr_260px]">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a verb in English or Arabic (e.g. buy, bought, يشتري)" className="h-12 rounded-xl border border-slate-300 px-4 text-base focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100" aria-label="Search verbs" />
        <Select value={cat} onChange={setCat} options={[{ v: 'all', l: 'All categories' }, ...Object.entries(VERB_CATEGORIES).map(([k, c]) => ({ v: k, l: `${c.en} · ${c.ar}` }))]} />
      </div>
      <div className="mb-4 flex flex-wrap gap-2">{FILTERS.map(([id, l]) => <Chip key={id} on={flt.includes(id)} onClick={() => setFlt(flt.includes(id) ? flt.filter((x) => x !== id) : [...flt, id])}>{l}{id === 'fav' && ` (${s.verbs.fav.length})`}{id === 'learned' && ` (${s.verbs.learned.length})`}{id === 'practice' && ` (${s.verbs.practice.length})`}</Chip>)}{flt.length > 0 && <button className="text-sm text-slate-500 underline" onClick={() => setFlt([])}>Clear filters</button>}</div>
      <p className="mb-3 text-sm text-slate-500">{list.length} verb{list.length === 1 ? '' : 's'}</p>
      {cards ? <Flashcards key={list.length + cat + flt.join()} list={list} onClose={() => setCards(false)} /> : list.length === 0 ? <Empty title="No verbs match these filters." ar="لا توجد نتائج" /> : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left">
            <thead className="text-sm text-white" style={{ background: 'linear-gradient(180deg,#0B4FBF,#062B72)' }}><tr>{['Base V1', 'Past V2', 'Participle V3', '-ing', 'He/She/It', 'Future', 'Arabic', ''].map((h) => <th key={h} className="px-3 py-2.5 font-bold">{h}</th>)}</tr></thead>
            <tbody>{list.slice(0, limit).map((v, ri) => (
              <tr key={v.base} onClick={() => openVerb(v.base)} className={cx('cursor-pointer border-t border-[#D6E3F6] font-medium hover:bg-[#DCEBFF]', ri % 2 ? 'bg-[#EEF5FF]' : 'bg-white')}>
                <td className="px-3 py-2.5"><button className="font-semibold text-indigo-700 hover:underline" onClick={(e) => { e.stopPropagation(); openVerb(v.base); }}>{v.base}</button>{s.verbs.fav.includes(v.base) && <Star size={12} className="ms-1 inline text-amber-500" fill="currentColor" />}{s.verbs.learned.includes(v.base) && <Check size={13} className="ms-1 inline text-emerald-600" />}</td>
                <td className={cx('px-3 py-2.5', v.irregular && 'font-medium text-violet-700')}>{v.v2}</td><td className={cx('px-3 py-2.5', v.irregular && 'font-medium text-violet-700')}>{v.v3}</td><td className="px-3 py-2.5">{v.ing}</td><td className="px-3 py-2.5">{v.s3}</td><td className="px-3 py-2.5 text-slate-500">will {v.base}</td>
                <td className="px-3 py-2.5"><span dir="rtl" className="font-ar">{v.ar}</span></td><td className="px-2"><Speak text={v.base} /></td>
              </tr>))}</tbody>
          </table></div>
          {list.length > limit && <div className="border-t border-slate-100 p-3 text-center"><Btn variant="soft" onClick={() => setLimit(limit + 100)}>Show more ({list.length - limit} left)</Btn></div>}
        </Card>
      )}
      <p className="mt-3 text-sm text-slate-500"><span className="font-medium text-violet-700">Purple forms</span> are irregular and must be learned. Click any verb for its full profile.</p>
      {verb && <VerbPanel base={verb} onClose={() => openVerb(null)} />}
    </div>
  );
}
