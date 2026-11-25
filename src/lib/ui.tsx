import React, { useEffect, useState } from 'react';
import { Volume2, Eye, Snail, VolumeX } from 'lucide-react';
import { useStore } from '../store/store';
import type { Token } from '../engine/grammar';
import type { TimelineSpec } from '../data/tenses';

// ───────── Colour system (full class names so Tailwind keeps them) ─────────
export type Hue = 'green' | 'purple' | 'orange' | 'blue' | 'teal' | 'indigo' | 'amber' | 'red' | 'slate';
export const HUE: Record<Hue, { soft: string; text: string; border: string; solid: string; ring: string; dot: string; hex: string; grad: string; glow: string }> = {
  green: { soft: 'bg-[#E8FBEA]', text: 'text-[#008A33]', border: 'border-[#9FE2B2]', solid: 'bg-[#00B83F]', ring: 'ring-[#9FE2B2]', dot: 'bg-[#00B83F]', hex: '#00B83F', grad: 'linear-gradient(135deg,#25D366,#00A63A)', glow: 'rgba(0,184,63,.30)' },
  purple: { soft: 'bg-[#F1E8FF]', text: 'text-[#7E22CE]', border: 'border-[#D4B7FB]', solid: 'bg-[#9333EA]', ring: 'ring-[#D4B7FB]', dot: 'bg-[#9333EA]', hex: '#9333EA', grad: 'linear-gradient(135deg,#B15CFF,#8424E0)', glow: 'rgba(147,51,234,.28)' },
  orange: { soft: 'bg-[#FFF3DF]', text: 'text-[#C25E00]', border: 'border-[#FBCF85]', solid: 'bg-[#F59E0B]', ring: 'ring-[#FBCF85]', dot: 'bg-[#F59E0B]', hex: '#F59E0B', grad: 'linear-gradient(135deg,#FFB534,#F07C00)', glow: 'rgba(245,158,11,.32)' },
  blue: { soft: 'bg-[#E5F1FF]', text: 'text-[#0A68CC]', border: 'border-[#A6CDF7]', solid: 'bg-[#1687F8]', ring: 'ring-[#A6CDF7]', dot: 'bg-[#1687F8]', hex: '#1687F8', grad: 'linear-gradient(135deg,#3DA2FF,#0B6FE0)', glow: 'rgba(22,135,248,.28)' },
  teal: { soft: 'bg-[#E0F9FF]', text: 'text-[#0784A8]', border: 'border-[#99E3F5]', solid: 'bg-[#06B6D4]', ring: 'ring-[#99E3F5]', dot: 'bg-[#06B6D4]', hex: '#06B6D4', grad: 'linear-gradient(135deg,#22D3EE,#0891B2)', glow: 'rgba(6,182,212,.28)' },
  indigo: { soft: 'bg-[#EAF2FF]', text: 'text-[#0659D6]', border: 'border-[#B1CCF6]', solid: 'bg-[#007BFF]', ring: 'ring-[#B1CCF6]', dot: 'bg-[#007BFF]', hex: '#007BFF', grad: 'linear-gradient(135deg,#2F95FF,#0547B8)', glow: 'rgba(0,123,255,.28)' },
  amber: { soft: 'bg-[#FFF6DB]', text: 'text-[#B45309]', border: 'border-[#F8D47A]', solid: 'bg-[#F59E0B]', ring: 'ring-[#F8D47A]', dot: 'bg-[#F59E0B]', hex: '#F59E0B', grad: 'linear-gradient(135deg,#FFC23D,#F08A00)', glow: 'rgba(245,158,11,.30)' },
  red: { soft: 'bg-[#FEEEEE]', text: 'text-[#D42020]', border: 'border-[#F9C0C0]', solid: 'bg-[#EF4444]', ring: 'ring-[#F9C0C0]', dot: 'bg-[#EF4444]', hex: '#EF4444', grad: 'linear-gradient(135deg,#FF6B6B,#DC2626)', glow: 'rgba(239,68,68,.28)' },
  slate: { soft: 'bg-[#EEF3FC]', text: 'text-[#062B72]', border: 'border-[#C5D8F5]', solid: 'bg-[#07163F]', ring: 'ring-[#C5D8F5]', dot: 'bg-[#062B72]', hex: '#062B72', grad: 'linear-gradient(135deg,#0B5BD8,#07163F)', glow: 'rgba(6,43,114,.25)' },
};
export const hueOfTense = (id: string): Hue => (id.includes('perfect') ? 'blue' : id.startsWith('present') ? 'green' : id.startsWith('past') ? 'purple' : 'orange');

// Token colours for sentences
export const ROLE_CLS: Record<string, string> = {
  subject: 'text-teal-700 bg-teal-50 border-teal-200',
  aux: 'text-sky-700 bg-sky-50 border-sky-200',
  neg: 'text-rose-700 bg-rose-50 border-rose-200',
  verb: 'text-indigo-700 bg-indigo-50 border-indigo-200',
  comp: 'text-slate-700 bg-slate-50 border-slate-200',
  time: 'text-amber-800 bg-amber-50 border-amber-200',
  punct: '',
};
export const ROLE_NAME: Record<string, { en: string; ar: string }> = {
  subject: { en: 'Subject', ar: 'الفاعل' }, aux: { en: 'Helping verb', ar: 'فعل مساعد' }, neg: { en: 'Negative', ar: 'نفي' },
  verb: { en: 'Main verb', ar: 'الفعل الرئيسي' }, comp: { en: 'Object / complement', ar: 'المفعول / التكملة' }, time: { en: 'Time expression', ar: 'تعبير الزمن' },
};

export const cx = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(' ');

// ───────── Speech ─────────
export const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;
let voices: SpeechSynthesisVoice[] = [];
if (canSpeak) {
  const loadV = () => { voices = window.speechSynthesis.getVoices(); };
  loadV(); window.speechSynthesis.onvoiceschanged = loadV;
}
export function speak(text: string, rate = 0.9) {
  if (!canSpeak) return false;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const v = voices.find((x) => x.lang === 'en-GB') ?? voices.find((x) => x.lang.startsWith('en'));
    if (v) u.voice = v;
    u.lang = v?.lang ?? 'en-GB'; u.rate = rate;
    window.speechSynthesis.speak(u);
    return true;
  } catch { return false; }
}
export function Speak({ text, className, label, slow }: { text: string; className?: string; label?: string; slow?: boolean }) {
  const { s } = useStore();
  if (!canSpeak) return <span className="inline-flex px-2 text-slate-300" title="Speech is not supported in this browser"><VolumeX size={16} /></span>;
  return (
    <button type="button" onClick={(e) => { e.stopPropagation(); speak(text, slow ? 0.6 : s.settings.rate); }}
      className={cx('inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400', className)}
      aria-label={label ?? (slow ? `Listen slowly: ${text}` : `Listen: ${text}`)} title={slow ? 'Listen slowly' : 'Listen'}>
      {slow ? <Snail size={16} /> : <Volume2 size={16} />}{label && <span className="text-sm">{label}</span>}
    </button>
  );
}

// ───────── Bilingual text ─────────
/** Arabic translation of an example. Hidden in English-only mode; tap-to-reveal when "hide Arabic" is on. */
export function Tr({ ar, className }: { ar?: string; className?: string }) {
  const { s } = useStore();
  const [show, setShow] = useState(false);
  useEffect(() => setShow(false), [s.settings.hideArabic]);
  if (!ar || s.settings.lang === 'en') return null;
  if (s.settings.hideArabic && !show)
    return <button type="button" onClick={(e) => { e.stopPropagation(); setShow(true); }} className={cx('inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600', className)}><Eye size={12} /> عرض الترجمة</button>;
  return <div dir="rtl" lang="ar" className={cx('font-ar text-slate-600 leading-relaxed', className)}>{ar}</div>;
}
/** Explanation: English first (en-ar), Arabic first (ar-en), or English only. */
export function Ex({ en, ar, className, small }: { en: React.ReactNode; ar?: React.ReactNode; className?: string; small?: boolean }) {
  const { s } = useStore();
  const m = s.settings.lang;
  const arEl = ar ? <div dir="rtl" lang="ar" className={cx('font-ar leading-relaxed', m === 'ar-en' ? 'text-slate-800' : 'text-slate-500', small ? 'text-sm' : '')}>{ar}</div> : null;
  const enEl = <div className={cx(m === 'ar-en' ? 'text-slate-500 text-sm' : 'text-slate-700', small && 'text-sm')}>{en}</div>;
  if (m === 'en' || !ar) return <div className={className}>{enEl}</div>;
  return <div className={cx('space-y-1', className)}>{m === 'ar-en' ? <>{arEl}{enEl}</> : <>{enEl}{arEl}</>}</div>;
}
export function ArLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  const { s } = useStore();
  if (s.settings.lang === 'en') return null;
  return <span dir="rtl" lang="ar" className={cx('font-ar ms-1.5 [unicode-bidi:isolate]', className)}>{children}</span>;
}

// ───────── Building blocks ─────────
export function Card({ children, className, hue, onClick, as }: { children: React.ReactNode; className?: string; hue?: Hue; onClick?: () => void; as?: 'button' }) {
  const cls = cx('glass-card', hue && HUE[hue].border, onClick && 'lift text-left hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00D9FF]', className);
  const style = hue ? ({ backgroundImage: `linear-gradient(145deg, rgba(255,255,255,.98), rgba(255,255,255,.9) 55%, ${HUE[hue].glow.replace(/[\d.]+\)$/, '.07)')})` } as React.CSSProperties) : undefined;
  if (onClick || as === 'button') return <button type="button" onClick={onClick} className={cls} style={style}>{children}</button>;
  return <div className={cls} style={style}>{children}</div>;
}
export function Badge({ children, hue = 'slate', className }: { children: React.ReactNode; hue?: Hue; className?: string }) {
  return <span className={cx('inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold', HUE[hue].soft, HUE[hue].text, HUE[hue].border, className)}>{children}</span>;
}
export function PageHead({ title, ar, sub, subAr, hue = 'slate', icon, right }: { title: string; ar?: string; sub?: string; subAr?: string; hue?: Hue; icon?: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="glass-card glass-strong relative mb-6 overflow-hidden p-5 sm:p-6">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1.5" style={{ background: HUE[hue].grad }} />
      <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full opacity-60 blur-3xl" style={{ background: HUE[hue].glow }} />
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {icon && <div className="mt-0.5 grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-white [&_svg]:h-6 [&_svg]:w-6" style={{ background: HUE[hue].grad, boxShadow: `0 6px 16px ${HUE[hue].glow}` }}>{icon}</div>}
          <div>
            <h1 className="text-[26px] font-extrabold leading-tight tracking-tight text-[#07163F] sm:text-[30px]" style={{ textWrap: 'balance' } as React.CSSProperties}>{title}</h1>
            {ar && <div><ArLabel className={cx('mt-0.5 inline-block text-lg font-semibold !ms-0', HUE[hue].text)}>{ar}</ArLabel></div>}
            {sub && <Ex className="mt-2 max-w-3xl" en={sub} ar={subAr} />}
          </div>
        </div>
        {right}
      </div>
    </div>
  );
}
export function Section({ title, ar, children, className, id, letter, hue = 'slate' }: { title: string; ar?: string; children: React.ReactNode; className?: string; id?: string; letter?: string; hue?: Hue }) {
  return (
    <section id={id} className={cx('mb-9 scroll-mt-28', className)}>
      <div className="mb-3.5 flex flex-wrap items-center gap-x-3 gap-y-1">
        {letter ? <span className="grid h-8 w-8 place-items-center rounded-xl text-sm font-bold text-white" style={{ background: HUE[hue].grad, boxShadow: `0 4px 10px ${HUE[hue].glow}` }}>{letter}</span>
          : <span className="h-6 w-1.5 rounded-full" style={{ background: HUE[hue === 'slate' ? 'indigo' : hue].grad }} />}
        <h2 className="text-xl font-bold text-[#07163F]">{title}</h2>
        {ar && <ArLabel className="text-base font-semibold text-[#334A7A]">{ar}</ArLabel>}
      </div>
      {children}
    </section>
  );
}
export function Btn({ children, onClick, variant = 'primary', hue = 'indigo', className, disabled, type = 'button', title }: { children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'soft' | 'ghost' | 'outline'; hue?: Hue; className?: string; disabled?: boolean; type?: 'button' | 'submit'; title?: string }) {
  // Every primary learning action uses the same neon navy button; red stays for destructive actions.
  const v = variant === 'primary' ? (hue === 'red' ? 'btn-danger' : 'btn-neon') : variant === 'soft' ? cx(HUE[hue].soft, HUE[hue].text, 'border', HUE[hue].border, 'rounded-full hover:brightness-95') : variant === 'outline' ? 'rounded-full border border-[#9BBEF0] bg-white/90 text-[#062B72] hover:bg-[#EEF5FF]' : 'rounded-xl text-[#1E2A47] hover:bg-[#EAF2FF]';
  return <button type={type} title={title} disabled={disabled} onClick={onClick} className={cx('inline-flex min-h-[44px] items-center justify-center gap-2 px-5 text-[15px] font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00D9FF] disabled:cursor-not-allowed disabled:opacity-45', v, className)}>{children}</button>;
}
export function Chip({ on, onClick, children, hue = 'indigo', className }: { on?: boolean; onClick?: () => void; children: React.ReactNode; hue?: Hue; className?: string }) {
  return <button type="button" aria-pressed={on} onClick={onClick} className={cx('inline-flex min-h-[36px] items-center gap-1.5 rounded-full border px-3 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00D9FF]', on ? cx(HUE[hue].soft, HUE[hue].text, HUE[hue].border, 'font-semibold shadow-[0_0_0_2px_rgba(0,217,255,.18)]') : 'border-[#C5D8F5] bg-white/90 text-[#1E2A47] hover:border-[#9BBEF0]', className)}>{children}</button>;
}
export function Select({ value, onChange, options, label, className, id }: { value: string; onChange: (v: string) => void; options: { v: string; l: string }[]; label?: string; className?: string; id?: string }) {
  return (
    <label className={cx('block', className)}>
      {label && <span className="mb-1 block text-xs font-semibold text-[#334A7A]">{label}</span>}
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="h-11 w-full rounded-xl border border-[#C5D8F5] bg-white/95 px-3 text-[15px] font-medium text-[#08142F] shadow-[inset_0_1px_2px_rgba(6,43,114,.06)] focus:border-[#007BFF] focus:outline-none focus:ring-2 focus:ring-[#00D9FF]/40">
        {options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </label>
  );
}
export function Progress({ pct, hue = 'indigo', className }: { pct: number; hue?: Hue; className?: string }) {
  return <div className={cx('h-2 w-full overflow-hidden rounded-full bg-[#E3ECFA]', className)} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}><div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.max(0, Math.min(100, pct))}%`, background: HUE[hue].grad, boxShadow: `0 0 6px ${HUE[hue].glow}` }} /></div>;
}
/** Animated circular progress ring. */
export function Ring({ pct, size = 64, stroke = 7, hue = 'green', label }: { pct: number; size?: number; stroke?: number; hue?: Hue; label?: React.ReactNode }) {
  const r = (size - stroke) / 2; const c = 2 * Math.PI * r; const [shown, setShown] = useState(0);
  useEffect(() => { const t = setTimeout(() => setShown(pct), 40); return () => clearTimeout(t); }, [pct]);
  const id = `rg-${hue}-${size}`;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={`${Math.round(pct)}%`}>
      <svg width={size} height={size} className="-rotate-90"><defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={HUE[hue].hex} stopOpacity={0.75} /><stop offset="1" stopColor={HUE[hue].hex} /></linearGradient></defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E3ECFA" strokeWidth={stroke} />
        <circle className="ring-anim" cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`url(#${id})`} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - Math.max(0, Math.min(100, shown)) / 100)} />
      </svg>
      <div className="absolute inset-0 grid place-items-center font-extrabold text-[#07163F]">{label ?? `${Math.round(pct)}%`}</div>
    </div>
  );
}
export function Empty({ title, ar, children }: { title: string; ar?: string; children?: React.ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-[#9BBEF0] bg-white/70 p-8 text-center"><p className="font-medium text-slate-700">{title}</p>{ar && <ArLabel className="mt-1 block text-slate-500">{ar}</ArLabel>}{children && <div className="mt-4">{children}</div>}</div>;
}

/** A sentence with each grammatical part coloured. */
export function Tokens({ tokens, big, legend }: { tokens: Token[]; big?: boolean; legend?: boolean }) {
  const roles = Array.from(new Set(tokens.map((t) => t.r).filter((r) => r !== 'punct')));
  return (
    <div>
      <p className={cx('flex flex-wrap items-center gap-1.5', big ? 'text-2xl sm:text-3xl' : 'text-lg')}>
        {tokens.map((t, i) => t.r === 'punct'
          ? <span key={i} className="-ml-1 text-slate-500">{t.t}</span>
          : <span key={i} title={ROLE_NAME[t.r]?.en} className={cx('rounded-lg border px-1.5 py-0.5 font-medium', ROLE_CLS[t.r])}>{t.t}</span>)}
      </p>
      {legend && <div className="mt-3 flex flex-wrap gap-2">{roles.map((r) => <span key={r} className={cx('rounded-md border px-2 py-0.5 text-xs', ROLE_CLS[r])}>{ROLE_NAME[r].en}<ArLabel className="ms-1">{ROLE_NAME[r].ar}</ArLabel></span>)}</div>}
    </div>
  );
}

/** Simple timeline: Past ── Now ── Future, with the action drawn on it. */
export function Timeline({ spec, hue = 'green', label }: { spec: TimelineSpec; hue?: Hue; label?: string }) {
  const W = 640, H = 150, y = 82;
  const X = (v: number) => 40 + ((v + 1) / 2) * (W - 80);
  const c = HUE[hue].hex;
  const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const anim = reduced ? undefined : 'tl-draw';
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={label ?? 'Timeline'}>
      <defs><marker id={`ah-${hue}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 10 5 0 10z" fill="#94a3b8" /></marker></defs>
      <line x1={24} y1={y} x2={W - 18} y2={y} stroke="#cbd5e1" strokeWidth={2} markerEnd={`url(#ah-${hue})`} />
      <text x={40} y={H - 12} fontSize={13} fill="#64748b">Past · الماضي</text>
      <text x={X(0)} y={H - 12} fontSize={13} fill="#0f172a" textAnchor="middle" fontWeight={600}>Now · الآن</text>
      <text x={W - 40} y={H - 12} fontSize={13} fill="#64748b" textAnchor="end">Future · المستقبل</text>
      <line x1={X(0)} y1={y - 34} x2={X(0)} y2={y + 14} stroke="#0f172a" strokeDasharray="3 4" strokeWidth={1.5} />
      {spec.kind === 'point' && <g className={anim}><circle cx={X(spec.at)} cy={y} r={11} fill={c} /><text x={X(spec.at)} y={y - 22} fontSize={13} fill={c} textAnchor="middle" fontWeight={600}>finished action</text></g>}
      {spec.kind === 'repeat' && [-0.75, -0.4, 0, 0.4, 0.75].map((v, i) => <path key={i} className={anim} style={{ animationDelay: `${i * 90}ms` }} d={`M${X(v) - 8} ${y + 6} l8 -16 l8 16`} fill="none" stroke={c} strokeWidth={3} strokeLinejoin="round" />)}
      {spec.kind === 'repeat' && <text x={X(0)} y={y - 30} fontSize={13} fill={c} textAnchor="middle" fontWeight={600}>again and again</text>}
      {(spec.kind === 'span' || spec.kind === 'span-to-now' || spec.kind === 'span-to-ref') && (() => {
        const from = X(spec.from ?? spec.at - 0.2);
        const to = spec.kind === 'span-to-now' ? X(0) : spec.kind === 'span' ? X(spec.at + (spec.at - (spec.from ?? spec.at - 0.2))) : X(spec.ref ?? spec.at);
        const n = Math.max(3, Math.round((to - from) / 18));
        const d = Array.from({ length: n }, (_, i) => `${i === 0 ? 'M' : 'Q'}${i === 0 ? from : from + (i - 0.5) * ((to - from) / n)} ${i === 0 ? y : y + (i % 2 ? -10 : 10)}${i === 0 ? '' : ` ${from + i * ((to - from) / n)} ${y}`}`).join(' ');
        return <g><path className={anim} d={d} fill="none" stroke={c} strokeWidth={4} strokeLinecap="round" /><circle cx={from} cy={y} r={6} fill={c} />{spec.kind !== 'span' && <circle cx={to} cy={y} r={6} fill="#fff" stroke={c} strokeWidth={3} />}<text x={(from + to) / 2} y={y - 22} fontSize={13} fill={c} textAnchor="middle" fontWeight={600}>in progress</text></g>;
      })()}
      {spec.kind === 'span-to-now' && <text x={X(0) + 8} y={y + 32} fontSize={12} fill="#64748b">result / still true now</text>}
      {spec.kind === 'before-ref' && <g><circle className={anim} cx={X(spec.at)} cy={y} r={11} fill={c} /><text x={X(spec.at)} y={y - 22} fontSize={13} fill={c} textAnchor="middle" fontWeight={600}>1 · first</text><rect x={X(spec.ref!) - 5} y={y - 14} width={10} height={28} rx={3} fill="#0f172a" /><text x={X(spec.ref!)} y={y - 22} fontSize={13} fill="#0f172a" textAnchor="middle" fontWeight={600}>2 · {spec.refLabel}</text><path d={`M${X(spec.at) + 16} ${y + 22} Q ${(X(spec.at) + X(spec.ref!)) / 2} ${y + 40} ${X(spec.ref!) - 10} ${y + 22}`} fill="none" stroke="#94a3b8" strokeDasharray="4 4" /></g>}
      {spec.kind === 'span-to-ref' && spec.refLabel && <g><rect x={X(spec.ref!) - 5} y={y - 14} width={10} height={28} rx={3} fill="#0f172a" /><text x={X(spec.ref!)} y={y + 34} fontSize={12} fill="#0f172a" textAnchor="middle" fontWeight={600}>{spec.refLabel}</text></g>}
    </svg>
  );
}

export function useLocal<T>(key: string, init: T): [T, (v: T) => void] {
  const [v, setV] = useState<T>(() => { try { const r = sessionStorage.getItem(key); return r ? JSON.parse(r) : init; } catch { return init; } });
  return [v, (x: T) => { setV(x); try { sessionStorage.setItem(key, JSON.stringify(x)); } catch { /* ignore */ } }];
}
