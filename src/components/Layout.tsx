import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Home, Map, Users, Wrench, Sun, CalendarDays, Clock3, ArrowLeftRight, Layers, Scale, BookOpen, CaseSensitive, CalendarClock, Wand2, MessageSquareText, Target, TriangleAlert, BarChart3, Bookmark, ChevronDown, ChevronUp, PanelLeftClose, PanelLeftOpen, Search, Menu, X, Sparkles, ArrowLeft, Globe, EyeOff, Eye, Bell, BookOpenText, LucideIcon } from 'lucide-react';
import { useNav } from '../lib/nav';
import { useStore, LangMode, today } from '../store/store';
import { search, Hit, LocalAssistant } from '../lib/search';
import { TENSES_BY_ORDER, TENSE_MAP } from '../data/tenses';
import { VERBS } from '../data/verbs';
import { ALL_LESSONS } from '../data/content';
import { HUE, Hue, cx, Btn, Badge, Ex, Speak } from '../lib/ui';
import { QUESTIONS } from '../data/questions';
import { pickQuestions } from '../lib/quiz';

export interface NavItem { id: string; en: string; ar: string; icon: LucideIcon; color: string; match?: (p: string) => boolean; children?: NavItem[] }
const BLUE = '#0659D6';
const tenseMatch = (fam: string) => (p: string) => p === fam || (p.startsWith(fam + '-') && !p.includes('perfect'));
export const NAV: NavItem[] = [
  { id: 'dashboard', en: 'Dashboard', ar: 'الرئيسية', icon: Home, color: BLUE },
  { id: 'roadmap', en: 'Learning Roadmap', ar: 'خريطة التعلم', icon: Map, color: BLUE },
  { id: 'subjects', en: 'Subjects & Pronouns', ar: 'الفاعل والضمائر', icon: Users, color: BLUE },
  { id: 'helping', en: 'Helping Verbs', ar: 'الأفعال المساعدة', icon: Wrench, color: BLUE },
  { id: 'tenses', en: 'Tenses (12)', ar: 'الأزمنة', icon: Sun, color: BLUE, children: [
    { id: 'present', en: 'Present Tenses', ar: 'أزمنة المضارع', icon: CalendarDays, color: '#00B83F', match: tenseMatch('present') },
    { id: 'past', en: 'Past Tenses', ar: 'أزمنة الماضي', icon: Clock3, color: '#9333EA', match: tenseMatch('past') },
    { id: 'future', en: 'Future Tenses', ar: 'أزمنة المستقبل', icon: ArrowLeftRight, color: '#F08A00', match: tenseMatch('future') },
    { id: 'perfect', en: 'Perfect Tenses', ar: 'الأزمنة التامة', icon: Layers, color: '#1687F8', match: (p) => p === 'perfect' || p.includes('perfect') },
  ] },
  { id: 'compare', en: 'Tense Comparison', ar: 'مقارنة الأزمنة', icon: Scale, color: BLUE },
  { id: 'verbs', en: 'Verb Library', ar: 'مكتبة الأفعال', icon: BookOpen, color: BLUE },
  { id: 'sesies', en: 'S / ES / IES Rules', ar: 'قواعد S / ES / IES', icon: CaseSensitive, color: BLUE },
  { id: 'time', en: 'Time Expressions', ar: 'تعبيرات الزمن', icon: CalendarClock, color: BLUE },
  { id: 'builder', en: 'Sentence Builder', ar: 'بناء الجمل', icon: Wand2, color: BLUE },
  { id: 'conversations', en: 'Everyday Conversations', ar: 'المحادثات اليومية', icon: MessageSquareText, color: BLUE },
  { id: 'quizzes', en: 'Practice & Quizzes', ar: 'التدريب والاختبارات', icon: Target, color: BLUE, match: (p) => p === 'quizzes' || p === 'quiz' },
  { id: 'mistakes', en: 'My Mistakes', ar: 'أخطائي', icon: TriangleAlert, color: '#EF4444' },
  { id: 'progress', en: 'My Progress', ar: 'تقدّمي', icon: BarChart3, color: BLUE },
  { id: 'reference', en: 'Quick Reference', ar: 'المرجع السريع', icon: Bookmark, color: BLUE },
];

function Sidebar({ mobileOpen, closeMobile }: { mobileOpen: boolean; closeMobile: () => void }) {
  const { page, go } = useNav();
  const { s, set } = useStore();
  const wide = s.settings.sidebar;
  const [tensesOpen, setTensesOpen] = useState(true);
  const mistakes = Object.values(s.mistakes).filter((m) => !m.mastered).length;
  const item = (it: NavItem, isMobile: boolean, child = false) => {
    const active = it.match ? it.match(page) : page === it.id;
    const Icon = it.icon; const full = wide || isMobile;
    return (
      <button key={it.id} type="button" title={it.en} onClick={() => { go(it.id); closeMobile(); }} aria-current={active ? 'page' : undefined}
        className={cx('group flex w-full items-center gap-2.5 rounded-xl border border-transparent text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00D9FF]',
          child ? 'min-h-[34px] text-[14.5px]' : 'min-h-[37px] text-[14.8px]', full ? (child ? 'pl-8 pr-2' : 'px-2.5') : 'justify-center px-0',
          active ? 'nav-active font-semibold' : 'font-semibold text-[#08142F] hover:border-[#C5D8F5] hover:bg-white/80')}>
        <Icon size={child ? 18 : 20} className="shrink-0" style={{ color: active ? '#fff' : it.color }} strokeWidth={2.1} />
        {full && <span className="flex-1 truncate">{it.en}</span>}
        {full && it.id === 'mistakes' && mistakes > 0 && <span className={cx('rounded-full px-2 text-xs font-bold', active ? 'bg-white/20 text-white' : 'bg-[#FEEEEE] text-[#D42020]')}>{mistakes}</span>}
      </button>
    );
  };
  const content = (isMobile: boolean) => (
    <nav aria-label="Main" className="flex h-full flex-col">
      {isMobile && <div className="flex items-center justify-between px-4 pb-2 pt-4"><Logo /><button onClick={closeMobile} className="rounded-lg p-2 hover:bg-[#EAF2FF]" aria-label="Close menu"><X size={20} /></button></div>}
      <div className="flex-1 space-y-0.5 overflow-y-auto p-2.5">
        {NAV.map((it) => it.children ? (
          <div key={it.id} className="py-0.5">
            <button type="button" onClick={() => (wide || isMobile ? setTensesOpen(!tensesOpen) : go('compare'))} aria-expanded={tensesOpen} title={it.en}
              className={cx('flex min-h-[37px] w-full items-center gap-3 rounded-xl text-[15px] font-semibold text-[#08142F] hover:bg-white/80', wide || isMobile ? 'px-3' : 'justify-center')}>
              <it.icon size={20} style={{ color: it.color }} strokeWidth={2.1} />{(wide || isMobile) && <><span className="flex-1 text-left">{it.en}</span>{tensesOpen ? <ChevronUp size={17} /> : <ChevronDown size={17} />}</>}
            </button>
            {(tensesOpen || !(wide || isMobile)) && <div className={cx('space-y-0.5', (wide || isMobile) && 'relative before:absolute before:bottom-2 before:left-[22px] before:top-1 before:w-px before:bg-[#C5D8F5]')}>{it.children.map((c) => item(c, isMobile, true))}</div>}
          </div>
        ) : item(it, isMobile))}
      </div>
      {!isMobile && <button type="button" onClick={() => set((p) => ({ ...p, settings: { ...p.settings, sidebar: !wide } }))} className={cx('mx-2.5 mb-2 flex min-h-[36px] items-center gap-2 rounded-xl px-3 text-sm font-semibold text-[#334A7A] hover:bg-white/80', !wide && 'justify-center')} aria-label={wide ? 'Collapse sidebar' : 'Expand sidebar'}>
        {wide ? <><PanelLeftClose size={18} /> Collapse</> : <PanelLeftOpen size={18} />}
      </button>}
    </nav>
  );
  return (
    <>
      <aside className={cx('no-print sticky top-[84px] hidden h-[calc(100vh-96px)] shrink-0 py-1 transition-[width] duration-200 xl:block', wide ? 'w-[248px]' : 'w-[76px]')}>
        <div className="glass-card glass-strong h-full overflow-hidden">{content(false)}</div>
      </aside>
      {mobileOpen && <div className="no-print fixed inset-0 z-50 xl:hidden"><div className="absolute inset-0 bg-[#07163F]/30 backdrop-blur-[2px]" onClick={closeMobile} /><aside className="glass-card absolute inset-y-2 left-2 w-[290px] max-w-[85vw] !bg-white">{content(true)}</aside></div>}
    </>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white" style={{ background: 'linear-gradient(145deg,#0B5BD8,#07163F)', boxShadow: '0 0 0 1px #00D9FF, 0 0 12px rgba(0,217,255,.55)' }}><BookOpenText size={24} /></div>
      <div className="min-w-0 leading-tight"><p className="truncate text-[18px] font-extrabold tracking-tight text-[#07163F]">English for Everyday Life</p><p className="truncate text-[13px] font-semibold text-[#334A7A]">Mr. Nabegh's Learning Journey</p></div>
    </div>
  );
}

function SearchBox() {
  const { go, openVerb } = useNav();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hits = useMemo(() => search(q), [q]);
  useEffect(() => { const f = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); }; document.addEventListener('mousedown', f); return () => document.removeEventListener('mousedown', f); }, []);
  useEffect(() => { const f = (e: KeyboardEvent) => { const typing = (e.target as HTMLElement).closest('input,textarea,select'); if (((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') || (e.key === '/' && !typing)) { e.preventDefault(); ref.current?.querySelector('input')?.focus(); } }; window.addEventListener('keydown', f); return () => window.removeEventListener('keydown', f); }, []);
  const choose = (h: Hit) => { setOpen(false); setQ(''); if (h.verb) { go('verbs'); openVerb(h.verb); } else go(h.page, h.anchor); };
  return (
    <div ref={ref} className="relative w-full max-w-[620px]">
      <Search size={19} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#062B72]" />
      <input value={q} onChange={(e) => { setQ(e.target.value); setOpen(true); setSel(0); }} onFocus={() => setOpen(true)}
        onKeyDown={(e) => { if (e.key === 'ArrowDown') { e.preventDefault(); setSel(Math.min(sel + 1, hits.length - 1)); } if (e.key === 'ArrowUp') { e.preventDefault(); setSel(Math.max(sel - 1, 0)); } if (e.key === 'Enter' && hits[sel]) choose(hits[sel]); if (e.key === 'Escape') setOpen(false); }}
        placeholder="Search lessons, verbs, rules, or examples…" aria-label="Search" role="combobox" aria-expanded={open && hits.length > 0}
        className="h-12 w-full rounded-2xl border border-[#C5D8F5] bg-white/95 pl-11 pr-20 text-[15px] font-medium text-[#08142F] shadow-[inset_0_1px_2px_rgba(6,43,114,.06),0_2px_10px_rgba(32,75,145,.06)] placeholder:text-[#475569] focus:border-[#007BFF] focus:outline-none focus:ring-2 focus:ring-[#00D9FF]/40" />
      <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-lg border border-[#C5D8F5] bg-[#F3F7FF] px-2 py-0.5 text-xs font-semibold text-[#334A7A] sm:block">Ctrl + K</kbd>
      {open && q.trim().length >= 2 && (
        <div className="glass-card glass-strong absolute left-0 right-0 top-14 z-40 max-h-[70vh] overflow-y-auto !bg-white p-2" role="listbox">
          {hits.length === 0 && <p className="p-4 text-sm text-slate-500">No results for “{q}”. Try a verb (e.g. “buy”) or a rule (e.g. “since”).</p>}
          {hits.map((h, i) => (
            <button key={i} type="button" role="option" aria-selected={i === sel} onMouseEnter={() => setSel(i)} onClick={() => choose(h)} className={cx('flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left', i === sel ? 'bg-[#EAF2FF]' : 'hover:bg-[#F3F7FF]')}>
              <Badge hue={h.kind === 'Verb' ? 'indigo' : h.kind === 'Tense' ? 'green' : h.kind === 'Example' ? 'slate' : h.kind === 'Time expression' ? 'amber' : 'teal'} className="mt-0.5 shrink-0">{h.kind}</Badge>
              <span className="min-w-0 flex-1"><span className="block truncate font-semibold text-[#08142F]">{h.title}</span><span className="block truncate text-sm text-slate-500">{h.sub}</span></span>
              {h.ar && <span dir="rtl" className="hidden shrink-0 font-ar text-sm text-slate-600 sm:block">{h.ar}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Popover({ open, onClose, children, className }: { open: boolean; onClose: () => void; children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { if (!open) return; const f = (e: MouseEvent) => { if (!ref.current?.parentElement?.contains(e.target as Node)) onClose(); }; const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose(); document.addEventListener('mousedown', f); window.addEventListener('keydown', k); return () => { document.removeEventListener('mousedown', f); window.removeEventListener('keydown', k); }; }, [open]);
  if (!open) return null;
  return <div ref={ref} className={cx('glass-card glass-strong absolute right-0 top-14 z-50 !bg-white p-2', className)}>{children}</div>;
}

function Topbar({ openMobile }: { openMobile: () => void }) {
  const { s, set } = useStore();
  const { go } = useNav();
  const [bell, setBell] = useState(false); const [me, setMe] = useState(false);
  const setLang = (lang: LangMode) => set((p) => ({ ...p, settings: { ...p.settings, lang } }));
  // Notifications come only from real state: due mistakes, today's challenge, the next lesson.
  const due = Object.values(s.mistakes).filter((m) => !m.mastered && m.due <= Date.now()).length;
  const next = ALL_LESSONS.find((l) => !s.lessons[l.id]?.completed);
  const notes: { t: string; ar: string; go: string }[] = [];
  if (due) notes.push({ t: `${due} mistake${due > 1 ? 's are' : ' is'} ready for review`, ar: 'أخطاء جاهزة للمراجعة', go: 'mistakes' });
  if (s.daily[today()] == null) notes.push({ t: "Today's 5-question challenge is waiting", ar: 'تحدي اليوم بانتظارك', go: 'quizzes' });
  if (next) notes.push({ t: `Next lesson: ${next.en}`, ar: next.ar, go: next.page });
  return (
    <header className="no-print sticky top-0 z-30 px-3 pt-3 sm:px-4">
      <div className="glass-card glass-strong flex items-center gap-3 !rounded-[20px] px-3 py-2.5 sm:px-4">
        <button className="rounded-lg p-2 hover:bg-[#EAF2FF] xl:hidden" onClick={openMobile} aria-label="Open menu"><Menu size={22} /></button>
        <div className="hidden w-[300px] shrink-0 md:block xl:w-[360px]"><Logo /></div>
        <div className="flex flex-1 justify-center"><SearchBox /></div>
        <div className="flex items-center gap-2">
          <label className="relative hidden items-center xl:flex">
            <Globe size={18} className="pointer-events-none absolute left-3 text-[#0659D6]" />
            <select value={s.settings.lang} onChange={(e) => setLang(e.target.value as LangMode)} className="h-11 appearance-none rounded-2xl border border-[#C5D8F5] bg-white/95 pl-10 pr-9 text-[14.5px] font-semibold text-[#07163F] focus:outline-none focus:ring-2 focus:ring-[#00D9FF]/40" aria-label="Language mode">
              <option value="en-ar">English + Arabic</option><option value="ar-en">شرح عربي + أمثلة</option><option value="en">English only</option>
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-3 text-[#07163F]" />
          </label>
          <button type="button" onClick={() => set((p) => ({ ...p, settings: { ...p.settings, hideArabic: !p.settings.hideArabic } }))} className={cx('grid h-11 w-11 place-items-center rounded-2xl border', s.settings.hideArabic ? 'border-[#F8D47A] bg-[#FFF6DB] text-[#B45309]' : 'border-[#C5D8F5] bg-white/95 text-[#062B72] hover:bg-[#EAF2FF]')} aria-pressed={s.settings.hideArabic} title={s.settings.hideArabic ? 'Arabic hidden — click to show' : 'Hide Arabic translations'} aria-label="Hide Arabic translations">
            {s.settings.hideArabic ? <EyeOff size={19} /> : <Eye size={19} />}
          </button>
          <div className="relative">
            <button type="button" onClick={() => setBell(!bell)} className="relative grid h-11 w-11 place-items-center rounded-2xl border border-[#C5D8F5] bg-white/95 text-[#062B72] hover:bg-[#EAF2FF]" aria-label={`Notifications (${notes.length})`} aria-expanded={bell}>
              <Bell size={20} />{notes.length > 0 && <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[#F59E0B] ring-2 ring-white" />}
            </button>
            <Popover open={bell} onClose={() => setBell(false)} className="w-[320px]">
              <p className="px-2 pb-1 pt-1 text-sm font-bold text-[#07163F]">Notifications <span className="font-ar font-semibold text-[#334A7A]">· التنبيهات</span></p>
              {notes.length === 0 ? <p className="p-3 text-sm text-slate-500">You're all caught up.</p> : notes.map((n) => <button key={n.t} onClick={() => { go(n.go); setBell(false); }} className="block w-full rounded-xl px-3 py-2 text-left hover:bg-[#EAF2FF]"><span className="block text-sm font-semibold text-[#08142F]">{n.t}</span><span dir="rtl" className="block font-ar text-xs text-slate-600">{n.ar}</span></button>)}
            </Popover>
          </div>
          <div className="relative">
            <button type="button" onClick={() => setMe(!me)} className="flex items-center gap-2.5 rounded-2xl py-1 pl-1 pr-2 hover:bg-[#EAF2FF]" aria-expanded={me} aria-label="Profile menu">
              <span className="grid h-11 w-11 place-items-center rounded-full text-[15px] font-bold text-white" style={{ background: 'linear-gradient(145deg,#0B5BD8,#07163F)', boxShadow: '0 0 0 2px #fff, 0 0 0 3px #00D9FF' }}>MN</span>
              <span className="hidden text-left leading-tight lg:block"><span className="block text-[15px] font-bold text-[#07163F]">Mr. Nabegh</span><span className="block text-xs font-semibold text-[#475569]">Learner</span></span>
              <ChevronDown size={17} className="hidden text-[#07163F] lg:block" />
            </button>
            <Popover open={me} onClose={() => setMe(false)} className="w-[260px]">
              {[['progress', 'My Progress'], ['mistakes', 'My Mistakes'], ['roadmap', 'Learning Roadmap']].map(([id, l]) => <button key={id} onClick={() => { go(id); setMe(false); }} className="block w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-[#08142F] hover:bg-[#EAF2FF]">{l}</button>)}
              <div className="mt-1 border-t border-[#C5D8F5] px-3 pt-2 xl:hidden"><span className="mb-1 block text-xs font-semibold text-[#334A7A]">Language</span>
                <select value={s.settings.lang} onChange={(e) => setLang(e.target.value as LangMode)} className="h-10 w-full rounded-xl border border-[#C5D8F5] bg-white px-2 text-sm font-semibold" aria-label="Language mode (menu)"><option value="en-ar">English + Arabic</option><option value="ar-en">شرح عربي + أمثلة</option><option value="en">English only</option></select></div>
            </Popover>
          </div>
        </div>
      </div>
    </header>
  );
}

function Assistant() {
  const { go, startQuiz, openVerb } = useNav();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<'menu' | 'explain' | 'compare' | 'verb' | 'rule'>('menu');
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<Hit[]>([]);
  const [tense, setTense] = useState<string | null>(null);
  const [pair, setPair] = useState<string[]>([]);
  useEffect(() => { let live = true; if (view === 'rule' && q.length > 1) LocalAssistant.ask(q).then((h) => live && setHits(h.filter((x) => x.kind !== 'Verb'))); else setHits([]); return () => { live = false; }; }, [q, view]);
  const verbs = useMemo(() => (q.length ? VERBS.filter((v) => v.base.startsWith(q.toLowerCase()) || v.ar.includes(q) || v.v2 === q.toLowerCase() || v.v3 === q.toLowerCase()).slice(0, 6) : []), [q]);
  const reset = (v: typeof view) => { setView(v); setQ(''); setTense(null); setPair([]); };
  const actions: [string, string, () => void][] = [
    ['Explain this tense', 'اشرح زمناً', () => reset('explain')],
    ['Compare two tenses', 'قارن بين زمنين', () => reset('compare')],
    ['Find a verb', 'ابحث عن فعل', () => reset('verb')],
    ['Build a sentence', 'كوّن جملة', () => { go('builder'); setOpen(false); }],
    ['Review my mistakes', 'راجع أخطائي', () => { go('mistakes'); setOpen(false); }],
    ['Start a quick quiz', 'اختبار سريع', () => { startQuiz({ title: 'Quick quiz', questions: pickQuestions(QUESTIONS.filter((x) => x.type !== 'listen'), 5), kind: 'custom', ref: 'quick', mode: 'practice' }); setOpen(false); }],
    ['Show a grammar rule', 'اعرض قاعدة', () => reset('rule')],
  ];
  const T = tense ? TENSE_MAP[tense] : null;
  return (
    <div className="no-print fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open && (
        <div className="glass-card glass-strong w-[min(380px,calc(100vw-2rem))] overflow-hidden" role="dialog" aria-label="English Assistant">
          <div className="flex items-center gap-3 border-b border-[#00D9FF]/60 px-4 py-3 text-white" style={{ background: 'linear-gradient(100deg,#07163F,#0A2E85 60%,#0B5BD8)' }}>
            {view !== 'menu' ? <button onClick={() => reset('menu')} className="rounded-lg p-1 hover:bg-white/10" aria-label="Back"><ArrowLeft size={18} /></button> : <Sparkles size={18} />}
            <div className="flex-1"><p className="font-semibold leading-tight">English Assistant</p><p className="font-ar text-xs text-slate-300" dir="rtl">مساعد اللغة الإنجليزية</p></div>
            <button onClick={() => setOpen(false)} className="rounded-lg p-1 hover:bg-white/10" aria-label="Close assistant"><X size={18} /></button>
          </div>
          <div className="max-h-[60vh] overflow-y-auto p-3">
            {view === 'menu' && <div className="grid gap-1.5">{actions.map(([en, ar, f]) => <button key={en} onClick={f} className="flex min-h-[46px] items-center justify-between rounded-xl px-3 text-left hover:bg-[#EAF2FF]"><span className="font-medium text-slate-800">{en}</span><span className="font-ar text-sm text-slate-500" dir="rtl">{ar}</span></button>)}</div>}
            {view === 'explain' && !T && <div className="grid gap-1">{TENSES_BY_ORDER.map((t) => <button key={t.id} onClick={() => setTense(t.id)} className="flex min-h-[42px] items-center justify-between rounded-xl px-3 text-left hover:bg-[#EAF2FF]"><span>{t.en}</span><span className="font-ar text-sm text-slate-500">{t.ar}</span></button>)}</div>}
            {view === 'explain' && T && (
              <div className="space-y-3 p-1">
                <p className="text-lg font-semibold">{T.en} <span className="font-ar text-base font-normal text-slate-500">{T.ar}</span></p>
                <Ex en={T.def} ar={T.defAr} small />
                <div className="rounded-xl bg-slate-50 p-3 text-sm"><b>Formula:</b> {T.parts.map((p) => p.label).join(' + ')}</div>
                <p className="text-sm"><b>Example:</b> {T.examples[0].en} <Speak text={T.examples[0].en} /></p>
                <Btn className="w-full" onClick={() => { go(T.id); setOpen(false); }}>Open the full lesson</Btn>
              </div>
            )}
            {view === 'compare' && (
              <div className="space-y-2 p-1">
                <p className="text-sm text-slate-600">Choose two tenses ({pair.length}/2)</p>
                <div className="flex flex-wrap gap-1.5">{TENSES_BY_ORDER.map((t) => <button key={t.id} onClick={() => setPair(pair.includes(t.id) ? pair.filter((x) => x !== t.id) : [...pair, t.id].slice(-2))} className={cx('rounded-full border px-3 py-1.5 text-sm', pair.includes(t.id) ? 'border-[#007BFF] bg-[#EAF2FF] text-[#0659D6]' : 'border-slate-200')}>{t.en}</button>)}</div>
                <Btn className="w-full" disabled={pair.length < 2} onClick={() => { try { sessionStorage.setItem('cmp-preset', JSON.stringify(pair)); } catch { /* ignore */ } (window as any).__cmpPreset = pair; go('compare'); setOpen(false); }}>Compare</Btn>
              </div>
            )}
            {view === 'verb' && (
              <div className="space-y-2 p-1">
                <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type a verb (English or Arabic)" className="h-11 w-full rounded-xl border border-slate-300 px-3 text-base" />
                {verbs.map((v) => <button key={v.base} onClick={() => { go('verbs'); openVerb(v.base); setOpen(false); }} className="flex w-full items-center justify-between rounded-xl border border-slate-100 px-3 py-2 text-left hover:bg-[#EAF2FF]"><span><b>{v.base}</b> <span className="text-sm text-slate-500">{v.v2} · {v.v3} · {v.ing}</span></span><span className="font-ar text-sm text-slate-500">{v.ar}</span></button>)}
                {q && !verbs.length && <p className="text-sm text-slate-500">No verb found. Try the base form, e.g. “go”.</p>}
              </div>
            )}
            {view === 'rule' && (
              <div className="space-y-2 p-1">
                <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. since, does, past perfect" className="h-11 w-full rounded-xl border border-slate-300 px-3 text-base" />
                {hits.map((h, i) => <button key={i} onClick={() => { go(h.page, h.anchor); setOpen(false); }} className="block w-full rounded-xl border border-slate-100 px-3 py-2 text-left hover:bg-[#EAF2FF]"><span className="block font-medium">{h.title}</span><span className="block text-sm text-slate-500">{h.sub}</span></button>)}
              </div>
            )}
          </div>
          <p className="border-t border-[#C5D8F5] bg-[#F3F7FF] px-4 py-2 text-xs text-slate-500">Answers come from this course's lessons, offline. This helper is not connected to an AI model.</p>
        </div>
      )}
      <button type="button" onClick={() => setOpen(!open)} className="btn-neon flex min-h-[52px] items-center gap-2 py-2 pl-4 pr-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00D9FF]" aria-expanded={open}>
        <Sparkles size={20} /><span className="text-left leading-tight"><span className="block text-sm font-semibold">English Assistant</span><span className="block font-ar text-[11px] text-[#BFE9FF]">مساعد اللغة الإنجليزية</span></span>
      </button>
    </div>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [mobile, setMobile] = useState(false);
  const { page } = useNav();
  return (
    <div className="min-h-screen">
      <Topbar openMobile={() => setMobile(true)} />
      <div className="flex gap-3 px-3 pt-3 sm:px-4">
        <Sidebar mobileOpen={mobile} closeMobile={() => setMobile(false)} />
        <main id="main" key={page} className="page-in mx-auto min-w-0 max-w-[1640px] flex-1 pb-28 pt-1">{children}</main>
      </div>
      <Assistant />
    </div>
  );
}
