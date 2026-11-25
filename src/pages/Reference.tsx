import React, { useEffect, useState } from 'react';
import { FileText, Printer } from 'lucide-react';
import { SUBJECTS } from '../engine/grammar';
import { TENSES, TENSE_MAP } from '../data/tenses';
import { TIME_EXPR, BUSINESS_SENTENCES } from '../data/content';
import { VERBS } from '../data/verbs';
import { useStore } from '../store/store';
import { Btn, Card, HUE, PageHead, cx, hueOfTense } from '../lib/ui';

const H = ({ children }: { children: React.ReactNode }) => <h2 className="mb-2 mt-1 text-base font-semibold text-slate-900">{children}</h2>;

export function ReferencePage() {
  const { visit } = useStore();
  const [note, setNote] = useState(false);
  useEffect(() => { visit('reference'); }, []);
  const rows = ['simple', 'continuous', 'perfect', 'perfect-continuous'];
  const irr = VERBS.filter((v) => v.irregular && v.common).slice(0, 18);
  const reg = VERBS.filter((v) => !v.irregular && v.common).slice(0, 8);
  return (
    <div className="ref">
      <PageHead title="Quick Reference" ar="المرجع السريع" hue="slate" icon={<FileText />} sub="Everything on one page. Print it or keep it open while you work." subAr="كل القواعد في صفحة واحدة للطباعة أو المراجعة السريعة."
        right={<div className="no-print text-right"><Btn variant="outline" onClick={() => { try { window.print(); } catch { /* blocked */ } setNote(true); }}><Printer size={18} /> Print</Btn>{note && <p className="mt-2 max-w-xs text-xs text-slate-500">If nothing opened, press Ctrl + P (⌘ + P on a Mac). For the cleanest print, open this page in its own browser tab first.</p>}</div>} />
      <div className="grid gap-4 text-[14px] lg:grid-cols-2 print:grid-cols-2 print:gap-3 print:text-[11px]">
        <Card className="p-4 lg:col-span-2 print:col-span-2"><H>The 12 tenses · formulas and examples</H>
          <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left"><thead><tr><th className="py-1 pe-2" />{['present', 'past', 'future'].map((c) => <th key={c} className={cx('px-2 py-1 font-semibold', HUE[c === 'present' ? 'green' : c === 'past' ? 'purple' : 'orange'].text)}>{c[0].toUpperCase() + c.slice(1)}</th>)}</tr></thead>
            <tbody>{rows.map((a) => <tr key={a} className="border-t border-slate-100 align-top"><td className="py-1.5 pe-2 font-semibold capitalize text-slate-600">{a.replace('-', ' ')}</td>{['present', 'past', 'future'].map((c) => { const t = TENSE_MAP[`${c}-${a}`]; return <td key={c} className="px-2 py-1.5"><span className={cx('block font-medium', HUE[hueOfTense(t.id)].text)}>{t.parts.slice(1).map((p) => p.label).join(' + ')}</span><span className="block">{t.examples[0].en}</span><span dir="rtl" className="block font-ar text-slate-500">{t.ar}</span></td>; })}</tr>)}</tbody></table></div></Card>
        <Card className="p-4"><H>Subject pronouns</H><table className="w-full"><tbody>{SUBJECTS.slice(0, 7).map((s) => <tr key={s.id} className="border-t border-slate-100"><td className="py-1 font-semibold text-teal-700">{s.id === 'I' ? 'I' : s.en}</td><td className="py-1 font-ar" dir="rtl">{s.ar}</td><td className="py-1 text-slate-500">{s.kind}</td></tr>)}</tbody></table><p className="mt-2 text-slate-600">One name/thing = he/she/it · two names or plural = they.</p></Card>
        <Card className="p-4"><H>Helping verbs</H><table className="w-full text-left"><thead className="text-slate-500"><tr>{['', 'Be', 'Do', 'Have', 'Past be'].map((h) => <th key={h} className="py-1 font-medium">{h}</th>)}</tr></thead><tbody>{[['I', 'am', 'do', 'have', 'was'], ['you / we / they', 'are', 'do', 'have', 'were'], ['he / she / it', 'is', 'does', 'has', 'was']].map((r) => <tr key={r[0]} className="border-t border-slate-100">{r.map((c, i) => <td key={i} className={cx('py-1', i === 0 && 'font-semibold text-teal-700')}>{c}</td>)}</tr>)}</tbody></table><p className="mt-2 text-slate-600">After do/does/did, will and modals → V1. After have/has/had → V3. After am/is/are/was/were → V-ing.</p></Card>
        <Card className="p-4"><H>S / ES / IES (he/she/it, affirmative present simple only)</H><ul className="space-y-0.5"><li>Most verbs + s: works, reads</li><li>s, sh, ch, x, z, o + es: watches, fixes, goes, does</li><li>consonant + y → ies: studies, tries</li><li>vowel + y + s: plays, buys</li><li>have → has · be → is</li></ul></Card>
        <Card className="p-4"><H>Time expressions</H>{(['present', 'past', 'future', 'perfect'] as const).map((g) => <p key={g} className="mb-1"><b className={HUE[g === 'present' ? 'green' : g === 'past' ? 'purple' : g === 'future' ? 'orange' : 'blue'].text}>{g[0].toUpperCase() + g.slice(1)}:</b> {TIME_EXPR.filter((x) => x.group === g).map((x) => x.en).join(', ')}</p>)}<p className="text-slate-500">Clues, not rules — the meaning decides.</p></Card>
        <Card className="p-4"><H>Regular and irregular verbs</H><p className="mb-1"><b>Regular (+ed):</b> {reg.map((v) => `${v.base} – ${v.v2}`).join(' · ')}</p><p><b>Irregular:</b> {irr.map((v) => `${v.base} – ${v.v2} – ${v.v3}`).join(' · ')}</p></Card>
        <Card className="p-4"><H>Common mistakes</H><ul className="space-y-1">{TENSES.slice(0, 9).map((t) => <li key={t.id}><span className="text-rose-600 line-through">{t.mistakes[0].wrong}</span> → <span className="font-medium text-emerald-700">{t.mistakes[0].right}</span></li>)}</ul></Card>
        <Card className="p-4 lg:col-span-2 print:col-span-2"><H>Frequently used business sentences</H><div className="grid gap-x-6 gap-y-1 sm:grid-cols-2">{BUSINESS_SENTENCES.map((b) => <p key={b.en}>{b.en} <span dir="rtl" className="font-ar text-slate-500">— {b.ar}</span></p>)}</div></Card>
      </div>
    </div>
  );
}
