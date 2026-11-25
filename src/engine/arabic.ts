// Arabic sentence generation for the core verbs used in the Sentence Builder and Tense Comparison tools.
// Arabic is generated subject-first (SVO) so the verb always agrees fully with its subject.
// Only verbs listed in AR_VERBS get a full Arabic sentence; other verbs show a meaning guide instead.
import type { Subject, TenseId, Form } from './grammar';

type Slot = Subject['arPron'];
interface ArVerb {
  pres: string; past: string; comp?: string;
  pI?: string; // present 1st-person override (آكل)
  jus?: string; // 3ms jussive override for hollow verbs (يقد)
  p1?: string; // past stem before consonant suffixes (قد → قدت)
  pShe?: string; pThey?: string;
}

export const AR_VERBS: Record<string, ArVerb> = {
  work: { pres: 'يعمل', past: 'عمل', comp: 'في المكتب' },
  eat: { pres: 'يأكل', past: 'أكل', pI: 'آكل', comp: 'الفطور' },
  go: { pres: 'يذهب', past: 'ذهب', comp: 'إلى العمل' },
  speak: { pres: 'يتحدث', past: 'تحدث', comp: 'الإنجليزية' },
  buy: { pres: 'يشتري', past: 'اشترى', p1: 'اشتري', pShe: 'اشترت', pThey: 'اشتروا', comp: 'سيارة جديدة' },
  sell: { pres: 'يبيع', past: 'باع', p1: 'بع', jus: 'يبع', comp: 'الأثاث' },
  travel: { pres: 'يسافر', past: 'سافر', comp: 'إلى لندن' },
  study: { pres: 'يدرس', past: 'درس', comp: 'الإنجليزية' },
  write: { pres: 'يكتب', past: 'كتب', comp: 'تقريراً' },
  call: { pres: 'يتصل', past: 'اتصل', comp: 'بالعميل' },
  read: { pres: 'يقرأ', past: 'قرأ', comp: 'الجريدة' },
  drink: { pres: 'يشرب', past: 'شرب', comp: 'القهوة' },
  play: { pres: 'يلعب', past: 'لعب', comp: 'كرة القدم' },
  visit: { pres: 'يزور', past: 'زار', p1: 'زر', jus: 'يزر', comp: 'المصنع' },
  send: { pres: 'يرسل', past: 'أرسل', comp: 'بريداً إلكترونياً' },
  finish: { pres: 'ينهي', past: 'أنهى', p1: 'أنهي', pShe: 'أنهت', pThey: 'أنهوا', comp: 'التقرير' },
  start: { pres: 'يبدأ', past: 'بدأ', comp: 'العمل في الثامنة' },
  meet: { pres: 'يقابل', past: 'قابل', comp: 'العملاء' },
  open: { pres: 'يفتح', past: 'فتح', comp: 'المتجر' },
  prepare: { pres: 'يجهز', past: 'جهز', comp: 'العرض التقديمي' },
  learn: { pres: 'يتعلم', past: 'تعلم', comp: 'كلمات جديدة' },
  cook: { pres: 'يطبخ', past: 'طبخ', comp: 'العشاء' },
  help: { pres: 'يساعد', past: 'ساعد', comp: 'الموظف الجديد' },
  watch: { pres: 'يشاهد', past: 'شاهد', comp: 'الأخبار' },
  drive: { pres: 'يقود', past: 'قاد', p1: 'قد', jus: 'يقد', comp: 'السيارة إلى المستودع' },
  sleep: { pres: 'ينام', past: 'نام', p1: 'نم', jus: 'ينم', comp: 'ثماني ساعات' },
  live: { pres: 'يسكن', past: 'سكن', comp: 'في الرياض' },
  ask: { pres: 'يسأل', past: 'سأل', comp: 'سؤالاً' },
  answer: { pres: 'يجيب', past: 'أجاب', p1: 'أجب', jus: 'يجب', comp: 'على الهاتف' },
  discuss: { pres: 'يناقش', past: 'ناقش', comp: 'الخطة' },
  manage: { pres: 'يدير', past: 'أدار', p1: 'أدر', jus: 'يدر', comp: 'فريق المبيعات' },
  check: { pres: 'يراجع', past: 'راجع', comp: 'الأرقام' },
  sign: { pres: 'يوقع', past: 'وقع', comp: 'العقد' },
  deliver: { pres: 'يسلم', past: 'سلم', comp: 'الطلب' },
  receive: { pres: 'يستلم', past: 'استلم', comp: 'الدفعة' },
  pay: { pres: 'يدفع', past: 'دفع', comp: 'الفاتورة' },
  wait: { pres: 'ينتظر', past: 'انتظر', comp: 'الحافلة' },
  order: { pres: 'يطلب', past: 'طلب', comp: 'بيتزا' },
  plan: { pres: 'يخطط', past: 'خطط', comp: 'للميزانية' },
  clean: { pres: 'ينظف', past: 'نظف', comp: 'المطبخ' },
};

const PRE: Record<Slot, string> = { I: 'أ', you: 'ت', he: 'ي', she: 'ت', we: 'ن', they: 'ي', dual: 'ي' };
const isDef = (p: string) => /[يىو]$/.test(p);

function pres(v: ArVerb, s: Slot) {
  const stem = v.pres.slice(1);
  if (s === 'I' && v.pI) return v.pI;
  if (s === 'they') return 'ي' + (isDef(v.pres) ? stem.slice(0, -1) : stem) + 'ون';
  if (s === 'dual') return 'ي' + stem + 'ان';
  return PRE[s] + stem;
}
function jus(v: ArVerb, s: Slot) {
  const stem = v.pres.slice(1);
  if (s === 'they') return 'ي' + (isDef(v.pres) ? stem.slice(0, -1) : stem) + 'وا';
  if (s === 'dual') return 'ي' + stem + 'ا';
  if (s === 'I' && v.pI) return v.pI;
  if (v.jus) return PRE[s] + v.jus.slice(1);
  if (isDef(v.pres)) return PRE[s] + stem.slice(0, -1);
  return PRE[s] + stem;
}
const subjunctive = (v: ArVerb, s: Slot) => (s === 'they' || s === 'dual' ? jus(v, s) : pres(v, s));
function past(v: ArVerb, s: Slot) {
  const p1 = v.p1 ?? v.past;
  switch (s) {
    case 'I': case 'you': return p1 + 'ت';
    case 'he': return v.past;
    case 'she': return v.pShe ?? v.past + 'ت';
    case 'we': return p1 + 'نا';
    case 'they': return v.pThey ?? v.past + 'وا';
    case 'dual': return (v.past.endsWith('ى') ? p1 : v.past) + 'ا';
  }
}
const KAN_PAST: Record<Slot, string> = { I: 'كنت', you: 'كنت', he: 'كان', she: 'كانت', we: 'كنا', they: 'كانوا', dual: 'كانا' };
const KAN_PRES: Record<Slot, string> = { I: 'أكون', you: 'تكون', he: 'يكون', she: 'تكون', we: 'نكون', they: 'يكونون', dual: 'يكونان' };
const KAN_JUS: Record<Slot, string> = { I: 'أكن', you: 'تكن', he: 'يكن', she: 'تكن', we: 'نكن', they: 'يكونوا', dual: 'يكونا' };
const KAN_SUBJ: Record<Slot, string> = { I: 'أكون', you: 'تكون', he: 'يكون', she: 'تكون', we: 'نكون', they: 'يكونوا', dual: 'يكونا' };

export function arabicSentence(subj: Subject, verbBase: string, t: TenseId, form: Form, comp: boolean, timeAr?: string): string | null {
  const v = AR_VERBS[verbBase];
  if (!v) return null;
  const s = subj.arPron;
  const S = subj.ar.replace(' (لغير العاقل)', '');
  const neg = form === 'neg' || form === 'negq';
  const q = form === 'q' || form === 'negq';
  let core = '';
  const { time, aspect } = t;
  if (time === 'present') {
    if (aspect === 'simple' || aspect === 'continuous' || aspect === 'perfect-continuous') core = neg ? 'لا ' + pres(v, s) : pres(v, s);
    else core = neg ? 'لم ' + jus(v, s) : (q ? past(v, s) : 'قد ' + past(v, s));
  } else if (time === 'past') {
    if (aspect === 'simple') core = neg ? 'لم ' + jus(v, s) : past(v, s);
    else if (aspect === 'perfect') core = neg ? `لم ${KAN_JUS[s]} قد ${past(v, s)}` : `${KAN_PAST[s]} قد ${past(v, s)}`;
    else core = neg ? `لم ${KAN_JUS[s]} ${pres(v, s)}` : `${KAN_PAST[s]} ${pres(v, s)}`;
  } else {
    if (aspect === 'simple') core = neg ? 'لن ' + subjunctive(v, s) : 'س' + pres(v, s);
    else if (aspect === 'perfect') core = neg ? `لن ${KAN_SUBJ[s]} قد ${past(v, s)}` : `س${KAN_PRES[s]} قد ${past(v, s)}`;
    else core = neg ? `لن ${KAN_SUBJ[s]} ${pres(v, s)}` : `س${KAN_PRES[s]} ${pres(v, s)}`;
  }
  // "قد + past" after a pronoun reads better as "لقد + past" without the pronoun.
  let sentence: string;
  const isPron = ['I', 'you', 'he', 'she', 'it', 'we', 'they'].includes(subj.id);
  if (!q && !neg && time === 'present' && aspect === 'perfect' && isPron) sentence = 'لقد ' + past(v, s);
  else sentence = `${S} ${core}`;
  if (comp && v.comp) sentence += ' ' + v.comp;
  if (timeAr) sentence += ' ' + timeAr;
  sentence = sentence.replace(/أا/g, 'آ'); // hamza + alif → madda (يقرآن، بدآ)
  return q ? `هل ${sentence}؟` : sentence;
}
