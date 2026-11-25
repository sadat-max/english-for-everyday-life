// Sentence engine: builds validated English sentences from (subject, verb, tense, form).
// Each sentence is returned as coloured tokens so the UI can highlight the grammar.
import { Verb, VERB_MAP } from '../data/verbs';

export type Person = 1 | 2 | 3;
export interface Subject {
  id: string; en: string; ar: string; person: Person; plural: boolean; kind: string; kindAr: string;
  gender: 'm' | 'f'; // for Arabic agreement
  arPron: 'I' | 'you' | 'he' | 'she' | 'we' | 'they' | 'dual'; // Arabic conjugation slot
  pron: string; // pronoun used in short answers
}

export const SUBJECTS: Subject[] = [
  { id: 'I', en: 'I', ar: 'أنا', person: 1, plural: false, kind: 'First person singular', kindAr: 'المتكلم المفرد', gender: 'm', arPron: 'I', pron: 'I' },
  { id: 'you', en: 'you', ar: 'أنت', person: 2, plural: false, kind: 'Second person (singular or plural)', kindAr: 'المخاطب (مفرد أو جمع)', gender: 'm', arPron: 'you', pron: 'you' },
  { id: 'he', en: 'he', ar: 'هو', person: 3, plural: false, kind: 'Third person singular', kindAr: 'الغائب المفرد', gender: 'm', arPron: 'he', pron: 'he' },
  { id: 'she', en: 'she', ar: 'هي', person: 3, plural: false, kind: 'Third person singular', kindAr: 'الغائبة المفردة', gender: 'f', arPron: 'she', pron: 'she' },
  { id: 'it', en: 'it', ar: 'هو (لغير العاقل)', person: 3, plural: false, kind: 'Third person singular – things & animals', kindAr: 'لغير العاقل: الأشياء والحيوانات', gender: 'm', arPron: 'he', pron: 'it' },
  { id: 'we', en: 'we', ar: 'نحن', person: 1, plural: true, kind: 'First person plural', kindAr: 'المتكلمون', gender: 'm', arPron: 'we', pron: 'we' },
  { id: 'they', en: 'they', ar: 'هم', person: 3, plural: true, kind: 'Third person plural', kindAr: 'الغائبون', gender: 'm', arPron: 'they', pron: 'they' },
  { id: 'ali', en: 'Ali', ar: 'علي', person: 3, plural: false, kind: 'One name = he', kindAr: 'اسم واحد = هو', gender: 'm', arPron: 'he', pron: 'he' },
  { id: 'sara', en: 'Sara', ar: 'سارة', person: 3, plural: false, kind: 'One name = she', kindAr: 'اسم واحد = هي', gender: 'f', arPron: 'she', pron: 'she' },
  { id: 'aliomar', en: 'Ali and Omar', ar: 'علي وعمر', person: 3, plural: true, kind: 'Two names = they', kindAr: 'اسمان = هم', gender: 'm', arPron: 'dual', pron: 'they' },
  { id: 'manager', en: 'the manager', ar: 'المدير', person: 3, plural: false, kind: 'Singular noun = he/she', kindAr: 'اسم مفرد = هو/هي', gender: 'm', arPron: 'he', pron: 'he' },
  { id: 'employees', en: 'the employees', ar: 'الموظفون', person: 3, plural: true, kind: 'Plural noun = they', kindAr: 'اسم جمع = هم', gender: 'm', arPron: 'they', pron: 'they' },
  { id: 'company', en: 'my company', ar: 'شركتي', person: 3, plural: false, kind: 'Company name / singular noun = it', kindAr: 'شركة واحدة = it', gender: 'f', arPron: 'she', pron: 'it' },
  { id: 'companies', en: 'my companies', ar: 'شركاتي', person: 3, plural: true, kind: 'Plural noun = they', kindAr: 'جمع = they', gender: 'f', arPron: 'she', pron: 'they' },
];
export const SUBJECT_MAP = Object.fromEntries(SUBJECTS.map((s) => [s.id, s]));

export type Time = 'present' | 'past' | 'future';
export type Aspect = 'simple' | 'continuous' | 'perfect' | 'perfect-continuous';
export type Form = 'aff' | 'neg' | 'q' | 'negq';
export const FORMS: { id: Form; en: string; ar: string }[] = [
  { id: 'aff', en: 'Affirmative', ar: 'مثبت' },
  { id: 'neg', en: 'Negative', ar: 'منفي' },
  { id: 'q', en: 'Question', ar: 'سؤال' },
  { id: 'negq', en: 'Negative question', ar: 'سؤال منفي' },
];

export interface TenseId { time: Time; aspect: Aspect }
export const tenseKey = (t: TenseId) => `${t.time}-${t.aspect}`;
export const parseTense = (k: string): TenseId => {
  const [time, ...rest] = k.split('-');
  return { time: time as Time, aspect: rest.join('-') as Aspect };
};

export type Role = 'subject' | 'aux' | 'neg' | 'verb' | 'comp' | 'time' | 'punct';
export interface Token { t: string; r: Role }

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function beForm(s: Subject, time: 'present' | 'past') {
  if (time === 'past') return s.person === 1 && !s.plural ? 'was' : s.person === 3 && !s.plural ? 'was' : 'were';
  if (s.person === 1 && !s.plural) return 'am';
  if (s.person === 3 && !s.plural) return 'is';
  return 'are';
}
const third = (s: Subject) => s.person === 3 && !s.plural;

const NEG_CONTRACT: Record<string, string> = {
  is: "isn't", are: "aren't", was: "wasn't", were: "weren't", do: "don't", does: "doesn't", did: "didn't",
  have: "haven't", has: "hasn't", had: "hadn't", will: "won't",
};

export interface BuildOpts { contracted?: boolean; comp?: string; time?: string }
export interface Built { tokens: Token[]; text: string; warning?: string; formula: string }

/**
 * Core conjugation. Produces the verb group as [aux..., main] then arranges it for the sentence form.
 * Rules: do-support for simple present/past (except main verb "be"); after do/does/did/will/modals the
 * main verb returns to the base form; only the first auxiliary moves before the subject in questions.
 */
export function build(subj: Subject, verb: Verb, tense: TenseId, form: Form, o: BuildOpts = {}): Built {
  const { time, aspect } = tense;
  const isBe = verb.base === 'be';
  let aux: string[] = []; // helping verbs in order
  let main = '';
  let formula = '';
  const negated = form === 'neg' || form === 'negq';
  const question = form === 'q' || form === 'negq';

  if (aspect === 'simple') {
    if (time === 'future') { aux = ['will']; main = verb.base; formula = 'Subject + will + V1'; }
    else if (isBe) {
      const b = beForm(subj, time);
      aux = [b]; main = ''; formula = time === 'present' ? 'Subject + am/is/are' : 'Subject + was/were';
    } else if (negated || question) {
      aux = [time === 'past' ? 'did' : third(subj) ? 'does' : 'do']; main = verb.base;
      formula = time === 'past' ? 'Subject + did + V1' : 'Subject + do/does + V1';
    } else {
      main = time === 'past' ? verb.v2.split('/')[0] : third(subj) ? verb.s3 : verb.base;
      if (time === 'past' && verb.base === 'be') main = beForm(subj, 'past');
      formula = time === 'past' ? 'Subject + V2' : third(subj) ? 'He/She/It + V1 + s/es' : 'Subject + V1';
    }
  } else if (aspect === 'continuous') {
    const b = time === 'future' ? ['will', 'be'] : [beForm(subj, time)];
    aux = b; main = verb.ing;
    formula = time === 'future' ? 'Subject + will be + V-ing' : time === 'past' ? 'Subject + was/were + V-ing' : 'Subject + am/is/are + V-ing';
  } else if (aspect === 'perfect') {
    aux = time === 'future' ? ['will', 'have'] : time === 'past' ? ['had'] : [third(subj) ? 'has' : 'have'];
    main = verb.v3;
    formula = time === 'future' ? 'Subject + will have + V3' : time === 'past' ? 'Subject + had + V3' : 'Subject + have/has + V3';
  } else {
    aux = time === 'future' ? ['will', 'have', 'been'] : time === 'past' ? ['had', 'been'] : [third(subj) ? 'has' : 'have', 'been'];
    main = verb.ing;
    formula = time === 'future' ? 'Subject + will have been + V-ing' : time === 'past' ? 'Subject + had been + V-ing' : 'Subject + have/has been + V-ing';
  }

  const tokens: Token[] = [];
  const subjTok = (atStart: boolean): Token => ({ t: atStart ? cap(subj.en) : subj.id === 'I' ? 'I' : subj.en, r: 'subject' });
  const restAux = aux.slice(1).map((t): Token => ({ t, r: 'aux' }));
  const mainTok: Token[] = main ? [{ t: main, r: 'verb' }] : [];
  // For "be" as the main verb, the be-form itself is the verb.
  const firstRole: Role = isBe && aspect === 'simple' && time !== 'future' ? 'verb' : 'aux';

  if (!question) {
    tokens.push(subjTok(true));
    if (aux.length) {
      if (negated) {
        if (o.contracted) {
          if (aux[0] === 'am') { tokens.push({ t: 'am', r: firstRole }, { t: 'not', r: 'neg' }); }
          else tokens.push({ t: NEG_CONTRACT[aux[0]] ?? aux[0] + ' not', r: 'neg' });
        } else tokens.push({ t: aux[0], r: firstRole }, { t: 'not', r: 'neg' });
      } else tokens.push({ t: aux[0], r: firstRole });
      tokens.push(...restAux);
    }
    tokens.push(...mainTok);
  } else {
    const first = aux[0];
    if (form === 'negq') {
      // Negative questions are normally contracted: Doesn't he work? / Aren't I…? (am not → aren't for I)
      const c = first === 'am' ? "aren't" : NEG_CONTRACT[first] ?? first + "n't";
      tokens.push({ t: cap(c), r: 'neg' }, subjTok(false));
    } else {
      tokens.push({ t: cap(first), r: firstRole }, subjTok(false));
    }
    tokens.push(...restAux, ...mainTok);
  }
  const comp = o.comp ?? '';
  if (comp) tokens.push({ t: comp, r: 'comp' });
  if (o.time) tokens.push({ t: o.time, r: 'time' });
  tokens.push({ t: question ? '?' : '.', r: 'punct' });

  let warning: string | undefined;
  if ((aspect === 'continuous' || aspect === 'perfect-continuous') && (verb.stative === 'yes' || isBe))
    warning = isBe ? `"Be" is rarely continuous. "Being" is used only for temporary behaviour ("He is being careful"). Use the simple form: "${cap(subj.en)} ${beForm(subj, time === 'past' ? 'past' : 'present')}…".` : `"${verb.base}" is a stative verb (a state, not an action). Native speakers normally use the simple or perfect form instead, e.g. "${cap(subj.en)} ${third(subj) ? verb.s3 : verb.base}…".`;
  else if ((aspect === 'continuous' || aspect === 'perfect-continuous') && verb.stative === 'mixed')
    warning = `"${verb.base}" changes meaning in continuous forms. Check the note in the Verb Library.`;

  return { tokens, text: joinTokens(tokens), warning, formula };
}

export function joinTokens(tokens: Token[]): string {
  return tokens.reduce((s, tk) => (tk.r === 'punct' ? s + tk.t : s ? s + ' ' + tk.t : tk.t), '');
}

export const v = (base: string) => VERB_MAP[base];
export const say = (s: string, verb: string, tense: string, form: Form = 'aff', o: BuildOpts = {}) =>
  build(SUBJECT_MAP[s], VERB_MAP[verb], parseTense(tense), form, o).text;

/** Short answers: "Yes, he does." / "No, he doesn't." */
export function shortAnswers(subj: Subject, verb: Verb, tense: TenseId): [string, string] {
  const q = build(subj, verb, tense, 'q');
  const first = q.tokens[0].t.toLowerCase();
  const p = subj.pron === 'I' ? 'I' : subj.pron;
  const pp = p === 'I' && subj.id === 'I' ? 'you' : p; // "Am I ready?" → answered as "Yes, you are."
  const askedAboutI = subj.id === 'I';
  const answerSubj = askedAboutI ? 'you' : subj.id === 'you' ? 'I' : pp;
  let aux = first;
  if (askedAboutI && first === 'am') aux = 'are';
  if (subj.id === 'you' && first === 'are') aux = 'am';
  if (subj.id === 'you' && first === 'were') aux = 'was';
  const neg = aux === 'am' ? "'m not" : NEG_CONTRACT[aux] ?? aux + "n't";
  const no = aux === 'am' ? `No, I'm not.` : `No, ${answerSubj} ${neg}.`;
  return [`Yes, ${answerSubj} ${aux}.`, no];
}
