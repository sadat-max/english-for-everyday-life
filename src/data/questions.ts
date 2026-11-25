// Question bank: hand-written questions + questions generated from the validated grammar engine.
// Every question has an ID, lesson, difficulty, type, answer, explanations (EN + AR) and a grammar rule.
import { VERBS, VERB_MAP } from './verbs';
import { TENSES, TENSE_MAP } from './tenses';
import { CONVERSATIONS } from './content';
import { build, SUBJECT_MAP, FORMS, Form, parseTense, joinTokens, Token } from '../engine/grammar';
import { arabicSentence, AR_VERBS } from '../engine/arabic';

export type QType = 'mcq' | 'fill' | 'tf' | 'match' | 'reorder' | 'translate' | 'listen' | 'identify' | 'correct' | 'convert';
export type MistakeCat = 'tense' | 'agreement' | 's-es' | 'helping' | 'past-form' | 'participle' | 'structure' | 'question' | 'time' | 'vocabulary';
export const MISTAKE_CATS: Record<MistakeCat, { en: string; ar: string; lesson: string }> = {
  tense: { en: 'Incorrect tense selection', ar: 'اختيار زمن غير مناسب', lesson: 'comparison' },
  agreement: { en: 'Subject–verb agreement', ar: 'توافق الفاعل مع الفعل', lesson: 'agreement' },
  's-es': { en: 'Missing or wrong S / ES / IES', ar: 'خطأ في إضافة S / ES / IES', lesson: 'sesies' },
  helping: { en: 'Incorrect helping verb', ar: 'فعل مساعد غير صحيح', lesson: 'helping' },
  'past-form': { en: 'Incorrect past verb form (V2)', ar: 'خطأ في التصريف الثاني', lesson: 'verb-forms' },
  participle: { en: 'Incorrect past participle (V3)', ar: 'خطأ في التصريف الثالث', lesson: 'verb-forms' },
  structure: { en: 'Incorrect sentence structure', ar: 'خطأ في تركيب الجملة', lesson: 'subjects' },
  question: { en: 'Incorrect question formation', ar: 'خطأ في تكوين السؤال', lesson: 'helping' },
  time: { en: 'Incorrect time expression', ar: 'خطأ في تعبيرات الزمن', lesson: 'time-expressions' },
  vocabulary: { en: 'Vocabulary and meaning', ar: 'المفردات والمعاني', lesson: 'verb-forms' },
};

export interface Question {
  id: string; lesson: string; tense?: string; level: 1 | 2 | 3; type: QType; cat: MistakeCat;
  prompt: string; promptAr?: string; text?: string; // text = sentence shown (with ___ for blanks)
  choices?: string[]; answer: string; accept?: string[]; pairs?: [string, string][]; words?: string[];
  en: string; ar: string; rule: string; hint?: string;
  why?: Record<string, { en: string; ar: string }>; // explanation for specific wrong choices
}

export const FORMULA_AR: Record<string, string> = {
  'present-simple': 'الفاعل + الفعل الأساسي (ومع he/she/it نضيف s/es)، وفي النفي والسؤال do/does + الفعل الأساسي',
  'present-continuous': 'الفاعل + am/is/are + الفعل مع ing',
  'present-perfect': 'الفاعل + have/has + التصريف الثالث',
  'present-perfect-continuous': 'الفاعل + have/has been + الفعل مع ing',
  'past-simple': 'الفاعل + التصريف الثاني، وفي النفي والسؤال did + الفعل الأساسي',
  'past-continuous': 'الفاعل + was/were + الفعل مع ing',
  'past-perfect': 'الفاعل + had + التصريف الثالث',
  'past-perfect-continuous': 'الفاعل + had been + الفعل مع ing',
  'future-simple': 'الفاعل + will + الفعل الأساسي',
  'future-continuous': 'الفاعل + will be + الفعل مع ing',
  'future-perfect': 'الفاعل + will have + التصريف الثالث',
  'future-perfect-continuous': 'الفاعل + will have been + الفعل مع ing',
};

const Q: Question[] = [];
const add = (q: Question) => Q.push(q);

// ───── Hand-written helpers ─────
type HW = Partial<Question> & { id: string; lesson: string; cat: MistakeCat; en: string; ar: string };
const mc = (o: HW & { prompt: string; choices: string[] }) =>
  add({ level: 2, type: 'mcq', rule: o.rule ?? o.lesson, answer: o.choices[0], ...o } as Question);
const fill = (o: HW & { text: string; answer: string }) =>
  add({ level: 2, type: 'fill', prompt: 'Complete the sentence.', rule: o.rule ?? o.lesson, ...o } as Question);
const tf = (o: HW & { text: string; answer: 'True' | 'False' }) =>
  add({ level: 1, type: 'tf', prompt: 'True or false?', choices: ['True', 'False'], rule: o.rule ?? o.lesson, ...o } as Question);
const fix = (o: HW & { text: string; answer: string }) =>
  add({ level: 2, type: 'correct', prompt: 'Correct the mistake. Type the full correct sentence.', rule: o.rule ?? o.lesson, ...o } as Question);

// Level 4 — mixed tense challenges (no tense given)
const MIX: [string, string[], string, string, string][] = [
  ['I usually work in the office, but today I ___ from home.', ['am working', 'work', 'worked', 'will work'], 'present-continuous', '"Today" contrasts with the usual habit: an action happening now/temporarily.', 'كلمة today تقابل العادة usually، فنستخدم المضارع المستمر لموقف مؤقت.'],
  ['She ___ to the gym three times a week.', ['goes', 'is going', 'went', 'has gone'], 'present-simple', '"Three times a week" is a routine → Present Simple. She → goes.', 'عبارة three times a week تدل على عادة ← مضارع بسيط.'],
  ['We ___ the contract yesterday.', ['signed', 'have signed', 'sign', 'are signing'], 'past-simple', '"Yesterday" is a finished time → Past Simple.', 'yesterday زمن منتهٍ ← ماضٍ بسيط.'],
  ['Look! The truck ___.', ['is arriving', 'arrives', 'arrived yesterday', 'has arrive'], 'present-continuous', '"Look!" shows something happening now.', 'كلمة Look! تدل على شيء يحدث الآن.'],
  ['I ___ in this company since 2015.', ['have worked', 'work', 'worked', 'am working'], 'present-perfect', '"Since 2015" + still true now → Present Perfect.', 'since 2015 مع استمرار الحالة حتى الآن ← مضارع تام.'],
  ['When the manager called, I ___ a report.', ['was writing', 'wrote', 'am writing', 'have written'], 'past-continuous', 'Longer action in progress interrupted by "called" → Past Continuous.', 'فعل طويل كان مستمراً وقطعه فعل آخر ← ماضٍ مستمر.'],
  ['Don\'t worry, I ___ you with the boxes.', ['will help', 'help', 'helped', 'had helped'], 'future-simple', 'An offer made now → will + V1.', 'عرض للمساعدة الآن ← will + الفعل.'],
  ['By the time we arrived, the meeting ___.', ['had started', 'started', 'has started', 'starts'], 'past-perfect', 'The meeting started before we arrived (earlier past) → had + V3.', 'بدأ الاجتماع قبل وصولنا ← ماضٍ تام.'],
  ['The shop ___ at 9 am every day.', ['opens', 'is opening', 'opened', 'will be opening'], 'present-simple', 'A fixed daily schedule → Present Simple.', 'جدول يومي ثابت ← مضارع بسيط.'],
  ['Have you ever ___ to Japan?', ['been', 'went', 'go', 'going'], 'present-perfect', 'Have + V3: been (life experience).', 'have + التصريف الثالث: been.'],
  ['This time tomorrow, I ___ to Dubai.', ['will be flying', 'fly', 'flew', 'have flown'], 'future-continuous', '"This time tomorrow" = in progress at a future moment.', 'في مثل هذا الوقت غداً ← مستقبل مستمر.'],
  ['I ___ the report by Thursday, I promise.', ['will have finished', 'finished', 'have finished', 'was finishing'], 'future-perfect', '"By Thursday" = completed before a future deadline.', 'by Thursday ← مكتمل قبل موعد مستقبلي.'],
  ['She is tired because she ___ all day.', ['has been working', 'works', 'will work', 'had work'], 'present-perfect-continuous', 'An activity that continued until now and explains a present result.', 'نشاط استمر حتى الآن ويفسر نتيجة حالية.'],
  ['Prices ___ every year.', ['rise', 'rises', 'rising', 'are rise'], 'present-simple', 'A general truth; "prices" is plural → rise (no s).', 'حقيقة عامة، و prices جمع ← rise بدون s.'],
  ['Ali ___ his car last week.', ['sold', 'sells', 'has sold', 'is selling'], 'past-simple', '"Last week" = finished time → V2.', 'last week ← ماضٍ بسيط.'],
  ['We ___ for the supplier for an hour when he finally called.', ['had been waiting', 'have been waiting', 'are waiting', 'wait'], 'past-perfect-continuous', 'Duration before a past moment (he called) → had been + V-ing.', 'مدة استمرت قبل لحظة ماضية ← ماضٍ تام مستمر.'],
  ['I think it ___ tomorrow.', ['will rain', 'rains', 'rained', 'has rained'], 'future-simple', 'A prediction about tomorrow → will + V1.', 'توقع للغد ← will + الفعل.'],
  ['The children ___ TV at the moment.', ['are watching', 'watch', 'watches', 'watched'], 'present-continuous', '"At the moment" → Present Continuous; children = they → are.', 'at the moment ← مضارع مستمر.'],
  ['My father ___ in a bank for thirty years. He retired in 2010.', ['worked', 'has worked', 'works', 'is working'], 'past-simple', 'He retired: the situation is finished → Past Simple.', 'تقاعد، فالحالة انتهت ← ماضٍ بسيط.'],
  ['I ___ my keys. I can\'t open the door.', ['have lost', 'lose', 'was losing', 'will lose'], 'present-perfect', 'A past action with a result now (I can\'t open the door).', 'فعل ماضٍ نتيجته الآن ← مضارع تام.'],
  ['The flight ___ at 6:40 tomorrow morning.', ['leaves', 'left', 'has left', 'was leaving'], 'present-simple', 'Timetables use Present Simple, even for the future.', 'الجداول الرسمية تستخدم المضارع البسيط حتى للمستقبل.'],
  ['I ___ the manager tomorrow at ten. It\'s in my calendar.', ['am meeting', 'met', 'have met', 'meets'], 'present-continuous', 'A fixed arrangement → Present Continuous.', 'موعد مؤكد ← مضارع مستمر.'],
  ['What ___ you doing when the lights went out?', ['were', 'did', 'are', 'have'], 'past-continuous', 'Past Continuous question: were + you + V-ing.', 'سؤال في الماضي المستمر: were + you + ing.'],
  ['She ___ English since she joined the company.', ['has been learning', 'learns', 'learned since', 'is learn'], 'present-perfect-continuous', '"Since" + continuing activity → have/has been + V-ing.', 'since مع نشاط مستمر ← مضارع تام مستمر.'],
  ['He ___ coffee. He prefers tea.', ['doesn\'t drink', 'don\'t drink', 'isn\'t drink', 'not drinks'], 'present-simple', 'Present Simple negative: he + doesn\'t + V1.', 'النفي مع he: doesn\'t + الفعل الأساسي.'],
  ['___ you call the customer yesterday?', ['Did', 'Do', 'Have', 'Were'], 'past-simple', 'Past Simple question with "yesterday": Did + subject + V1.', 'سؤال في الماضي البسيط: Did + الفاعل + الفعل.'],
  ['Next year, our company ___ for 20 years.', ['will have been operating', 'operates', 'operated', 'is operating'], 'future-perfect-continuous', 'Duration up to a future point → will have been + V-ing.', 'مدة حتى نقطة مستقبلية ← مستقبل تام مستمر.'],
  ['I ___ him for ten years. We are old friends.', ['have known', 'am knowing', 'know since', 'knew'], 'present-perfect', '"Know" is stative, so use Present Perfect (not continuous) for duration.', 'know فعل حالة، فنستخدم المضارع التام للمدة.'],
  ['The phone ___. Can you answer it?', ['is ringing', 'rings', 'rang', 'has rung'], 'present-continuous', 'Happening now → Present Continuous.', 'يحدث الآن ← مضارع مستمر.'],
  ['They ___ the warehouse two months ago.', ['opened', 'have opened', 'open', 'had open'], 'past-simple', '"Ago" always goes with the Past Simple.', 'ago تأتي دائماً مع الماضي البسيط.'],
  ['Our sales ___ by 20% so far this year.', ['have increased', 'increased', 'increase', 'are increase'], 'present-perfect', '"So far this year" = unfinished period → Present Perfect.', 'so far this year فترة لم تنتهِ ← مضارع تام.'],
  ['When I got to the airport, my flight ___.', ['had already left', 'already left', 'has already left', 'leaves'], 'past-perfect', 'The flight left before I got there → Past Perfect.', 'غادرت الطائرة قبل وصولي ← ماضٍ تام.'],
  ['Please be quiet. The manager ___ on the phone.', ['is talking', 'talks', 'talked', 'has talk'], 'present-continuous', 'Right now → Present Continuous.', 'الآن ← مضارع مستمر.'],
  ['I ___ to Riyadh last month for a conference.', ['went', 'have gone', 'go', 'was go'], 'past-simple', '"Last month" → Past Simple (go – went).', 'last month ← ماضٍ بسيط.'],
  ['Wait, I ___ the door for you.', ['\'ll open', 'open', 'opened', 'have opened'], 'future-simple', 'An instant offer → I\'ll + V1.', 'عرض فوري ← I\'ll + الفعل.'],
  ['At 8 pm yesterday, we ___ dinner.', ['were having', 'had had', 'have', 'are having'], 'past-continuous', 'In progress at a specific past time → Past Continuous.', 'مستمر في وقت محدد في الماضي ← ماضٍ مستمر.'],
  ['He usually ___ by car, but today he is taking the metro.', ['travels', 'is travelling', 'travelled', 'travel'], 'present-simple', '"Usually" = habit → Present Simple; he → travels.', 'usually عادة ← مضارع بسيط.'],
  ['We ___ the new product next month. The date is fixed.', ['are launching', 'launched', 'have launched', 'launch yesterday'], 'present-continuous', 'Fixed future arrangement → Present Continuous.', 'ترتيب مستقبلي مؤكد ← مضارع مستمر.'],
  ['I\'m sorry, I ___ your email yet.', ['haven\'t read', 'didn\'t read yet', 'don\'t read', 'am not reading yet'], 'present-perfect', '"Yet" in negatives → Present Perfect.', 'yet في النفي ← مضارع تام.'],
  ['By the time he retires, he ___ here for 35 years.', ['will have worked', 'works', 'worked', 'has worked'], 'future-perfect', 'Completed by a future point → will have + V3.', 'مكتمل بحلول نقطة مستقبلية ← مستقبل تام.'],
];
MIX.forEach(([text, choices, tense, en, ar], i) => mc({ id: `mix-${i + 1}`, lesson: 'comparison', tense, cat: 'tense', level: 3, prompt: 'Choose the best answer. Which tense fits?', promptAr: 'اختر الإجابة الأنسب. أي زمن يناسب الجملة؟', text, choices, en, ar, rule: tense }));

// Time expressions
const TX: [string, string[], string, string][] = [
  ['I have worked here ___ 2018.', ['since', 'for', 'ago', 'during'], '"Since" + a starting point (2018).', 'since + نقطة البداية.'],
  ['I have worked here ___ six years.', ['for', 'since', 'ago', 'from'], '"For" + a period of time.', 'for + مدة زمنية.'],
  ['He left the office two hours ___.', ['ago', 'before now', 'since', 'for'], '"Ago" comes after the time period with the Past Simple.', 'ago تأتي بعد المدة مع الماضي البسيط.'],
  ['Have you finished the report ___?', ['yet', 'already now', 'since', 'ago'], '"Yet" is used at the end of Present Perfect questions.', 'yet في نهاية السؤال في المضارع التام.'],
  ['The shipment has ___ arrived. It\'s at the gate now.', ['just', 'yet', 'ago', 'since'], '"Just" = a very short time ago; it goes between has and V3.', 'just تعني للتو وتأتي بين has والتصريف الثالث.'],
  ['We sold 300 units ___.', ['last month', 'since last month', 'for last month', 'yet'], 'Past Simple + a finished time: last month.', 'الماضي البسيط مع زمن منتهٍ.'],
  ['She is talking to a customer ___.', ['at the moment', 'every day', 'yesterday', 'last week'], 'Present Continuous + now / at the moment.', 'المضارع المستمر مع at the moment.'],
  ['I visit my parents ___.', ['every Friday', 'right now', 'two days ago', 'yesterday'], 'Present Simple + a routine time: every Friday.', 'المضارع البسيط مع عادة.'],
  ['I will send the invoice ___.', ['tomorrow', 'yesterday', 'last week', 'ago'], 'Future Simple + a future time.', 'المستقبل مع زمن مستقبلي.'],
  ['Have you ___ eaten Lebanese food?', ['ever', 'yet', 'ago', 'since'], '"Ever" asks about life experience.', 'ever للسؤال عن التجربة.'],
  ['I have ___ finished. Here is the file.', ['already', 'yet', 'ago', 'for'], '"Already" = sooner than expected, in positive sentences.', 'already = بالفعل في الجمل المثبتة.'],
  ['We ___ meet on Sundays. It\'s our routine.', ['usually', 'yesterday', 'now', 'ago'], 'Adverbs of frequency (usually) go before the main verb.', 'ظروف التكرار تأتي قبل الفعل الرئيسي.'],
  ['He is ___ late for meetings.', ['never', 'yesterday', 'ago', 'since'], 'With "be", the frequency adverb goes after it: is never late.', 'مع is يأتي ظرف التكرار بعدها.'],
  ['We have sold 50 cars ___.', ['so far', 'last year', 'two days ago', 'yesterday'], '"So far" = up to now → Present Perfect.', 'so far = حتى الآن ← مضارع تام.'],
  ['I will have finished the project ___ Friday.', ['by', 'since', 'ago', 'for'], '"By Friday" = not later than Friday.', 'by Friday = في موعد أقصاه الجمعة.'],
];
TX.forEach(([text, choices, en, ar], i) => mc({ id: `time-${i + 1}`, lesson: 'time-expressions', cat: 'time', prompt: 'Choose the correct time expression.', promptAr: 'اختر تعبير الزمن الصحيح.', text, choices, en, ar }));

// Perfect tenses comparison
const PF: [string, string[], string, string, string][] = [
  ['I ___ the report. Here it is.', ['have finished', 'finished yesterday', 'had finish', 'finish'], 'present-perfect', 'Result now ("Here it is") → Present Perfect.', 'النتيجة ظاهرة الآن ← مضارع تام.'],
  ['I ___ the report yesterday.', ['finished', 'have finished', 'had finished', 'finishing'], 'past-simple', 'A finished time (yesterday) → Past Simple, not Present Perfect.', 'مع yesterday نستخدم الماضي البسيط لا المضارع التام.'],
  ['I ___ the report before the manager arrived.', ['had finished', 'have finished', 'finish', 'will finish'], 'past-perfect', 'Before another past event → Past Perfect.', 'قبل حدث ماضٍ آخر ← ماضٍ تام.'],
  ['I ___ the report by tomorrow.', ['will have finished', 'have finished', 'had finished', 'finished'], 'future-perfect', 'Completed before a future time → Future Perfect.', 'مكتمل قبل وقت مستقبلي ← مستقبل تام.'],
  ['I ___ on this report for three hours, and I\'m still not finished.', ['have been working', 'have worked yesterday', 'worked', 'had work'], 'present-perfect-continuous', 'Focus on duration of an unfinished activity → Present Perfect Continuous.', 'التركيز على مدة نشاط لم ينتهِ ← مضارع تام مستمر.'],
  ['She ___ three reports this week.', ['has written', 'has been writing three', 'wrote yesterday', 'writes now'], 'present-perfect', 'A number of completed things (three reports) → Present Perfect simple.', 'عدد من الأشياء المكتملة ← المضارع التام البسيط.'],
  ['They ___ for the bus for 40 minutes when it finally came.', ['had been waiting', 'have been waiting', 'are waiting', 'will wait'], 'past-perfect-continuous', 'Duration before a past moment → Past Perfect Continuous.', 'مدة قبل لحظة ماضية ← ماضٍ تام مستمر.'],
  ['Which sentence shows a result now?', ['I have lost my phone.', 'I lost my phone in 2019.', 'I was losing my phone.', 'I had lost my phone before the trip.'], 'present-perfect', 'Present Perfect connects a past action to now.', 'المضارع التام يربط الماضي بالحاضر.'],
  ['Which word goes with "have/has + V3" for a starting point?', ['since', 'ago', 'yesterday', 'last year'], 'present-perfect', '"Since" gives the start point of a period continuing to now.', 'since تحدد بداية فترة مستمرة حتى الآن.'],
  ['"I had finished the report before he arrived." Which happened first?', ['Finishing the report', 'His arrival', 'Both at the same time', 'We don\'t know'], 'past-perfect', 'The Past Perfect action (had finished) happened first.', 'فعل الماضي التام هو الذي حدث أولاً.'],
  ['He ___ in Jeddah since he was a child.', ['has lived', 'lived since', 'lives since', 'is living since'], 'present-perfect', 'Since + still true now → Present Perfect.', 'since مع حالة مستمرة ← مضارع تام.'],
  ['"Perfect" tenses mainly show…', ['how an action relates to a reference time', 'that an action is perfect', 'only the past', 'only the future'], 'present-perfect', 'Perfect tenses link an action to another point in time (now, a past moment or a future moment).', 'الأزمنة التامة تربط الفعل بنقطة زمنية أخرى.'],
];
PF.forEach(([text, choices, tense, en, ar], i) => mc({ id: `perf-${i + 1}`, lesson: 'perfect', tense, cat: i === 1 || i === 2 ? 'tense' : 'participle', prompt: 'Choose the best answer.', text, choices, en, ar, rule: tense }));

// Future ways
const FW: [string, string[], string, string][] = [
  ['A: The phone is ringing. B: I ___ it.', ['\'ll answer', 'am going to answer last week', 'answered', 'answers'], 'A decision made at the moment of speaking → will.', 'قرار لحظي ← will.'],
  ['I have decided. I ___ a new car next month.', ['am going to buy', 'buy yesterday', 'bought', 'have bought'], 'A plan already decided → be going to.', 'خطة مقررة مسبقاً ← be going to.'],
  ['Look at those black clouds. It ___ rain.', ['is going to', 'rains', 'rained', 'has'], 'A prediction based on evidence you can see → going to.', 'توقع مبني على دليل ظاهر ← going to.'],
  ['The train ___ at 7:15 tomorrow.', ['leaves', 'left', 'has left', 'is leave'], 'Timetables → Present Simple.', 'الجداول ← مضارع بسيط.'],
  ['I ___ the dentist on Monday at 4 pm.', ['am seeing', 'saw', 'see yesterday', 'have seen'], 'An arrangement with a fixed time → Present Continuous.', 'موعد محدد ← مضارع مستمر.'],
  ['Which is correct?', ['English uses will + base verb for the future.', 'English adds -will to the end of verbs.', 'English future verbs end in -ed.', 'English has no way to talk about the future.'], 'English has no future verb ending. We use will + V1, going to, and present forms.', 'لا توجد نهاية خاصة للمستقبل في الإنجليزية.'],
  ['Don\'t worry, I promise I ___ late.', ['won\'t be', 'am not', 'wasn\'t', 'haven\'t been'], 'A promise → will / won\'t.', 'وعد ← will / won\'t.'],
  ['She ___ to visit the factory. She told me yesterday.', ['is going', 'goes', 'went', 'will going'], 'An intention → be going to + V1.', 'نية ← be going to.'],
  ['The conference ___ on 3 March. It\'s in the official programme.', ['starts', 'is going start', 'started', 'will starting'], 'Official schedule → Present Simple.', 'جدول رسمي ← مضارع بسيط.'],
  ['I think our customers ___ the new design.', ['will like', 'liked', 'are liking', 'have like'], 'An opinion/prediction with "I think" → will.', 'رأي أو توقع مع I think ← will.'],
];
FW.forEach(([text, choices, en, ar], i) => mc({ id: `fut-${i + 1}`, lesson: 'future-ways', tense: 'future-simple', cat: 'tense', prompt: 'Choose the best way to talk about the future.', promptAr: 'اختر الطريقة الأنسب للتعبير عن المستقبل.', text, choices, en, ar, rule: 'future-ways' }));

// True / false
const TF: [string, 'True' | 'False', MistakeCat, string, string][] = [
  ['After "does", the main verb takes -s: "Does he works?"', 'False', 'helping', 'After does, use the base verb: Does he work?', 'بعد does نستخدم الفعل الأساسي.'],
  ['One name (Ali) follows the same rules as "he".', 'True', 'agreement', 'Ali = he → Ali works.', 'اسم واحد = he.'],
  ['"Ali and Omar" follows the same rules as "they".', 'True', 'agreement', 'Two names = they → Ali and Omar work.', 'اسمان = they.'],
  ['"My company" follows the same rules as "it".', 'True', 'agreement', 'One company = it → My company sells furniture.', 'شركة واحدة = it.'],
  ['We add -s to the verb after "will": "He will goes."', 'False', 's-es', 'After will, use the base verb: He will go.', 'بعد will نستخدم الفعل الأساسي.'],
  ['"Yesterday" usually goes with the Past Simple.', 'True', 'time', 'Yesterday is a finished time.', 'yesterday زمن منتهٍ.'],
  ['"I am knowing the answer" is natural English.', 'False', 'tense', '"Know" is stative: I know the answer.', 'know فعل حالة.'],
  ['"Since" is followed by a period of time, like "two hours".', 'False', 'time', '"Since" + starting point; "for" + period.', 'since + نقطة بداية، و for + مدة.'],
  ['The s/es rule applies to "He doesn\'t work" too.', 'False', 's-es', 'Only the affirmative present simple adds s. In negatives, "does" takes it.', 'تُضاف s فقط في المثبت، أما في النفي فتأخذها does.'],
  ['"Study" becomes "studies" with he/she/it.', 'True', 's-es', 'Consonant + y → ies.', 'ساكن + y ← ies.'],
  ['"Play" becomes "plaies" with he/she/it.', 'False', 's-es', 'Vowel + y → just add s: plays.', 'علة + y ← نضيف s فقط.'],
  ['The past participle (V3) of "go" is "went".', 'False', 'participle', 'go – went – gone. V3 = gone.', 'التصريف الثالث هو gone.'],
  ['"Had + V3" shows an action before another past action.', 'True', 'tense', 'That is the Past Perfect.', 'هذا هو الماضي التام.'],
  ['"Did he went?" is correct.', 'False', 'past-form', 'After did use V1: Did he go?', 'بعد did نستخدم الفعل الأساسي.'],
  ['"You" uses "are" in the present and "were" in the past.', 'True', 'helping', 'You are / you were — even for one person.', 'you تأخذ are وwere حتى للمفرد.'],
  ['Time expressions always decide the tense by themselves.', 'False', 'time', 'They are useful clues, but the meaning decides. "Today" can go with several tenses.', 'تعبيرات الزمن قرائن مفيدة، لكن المعنى هو الذي يحدد الزمن.'],
];
TF.forEach(([text, answer, cat, en, ar], i) => tf({ id: `tf-${i + 1}`, lesson: i < 4 ? 'agreement' : ['s-es'].includes(cat) ? 'sesies' : cat === 'time' ? 'time-expressions' : cat === 'participle' || cat === 'past-form' ? 'verb-forms' : cat === 'helping' ? 'helping' : 'comparison', cat, text, answer, en, ar }));

// Correct the mistake
const FX: [string, string, string[], string, MistakeCat, string, string][] = [
  ['He go to work every day.', 'He goes to work every day.', [], 'present-simple', 's-es', 'He + V1 + es: goes.', 'مع he نضيف es: goes.'],
  ['She doesn\'t works here.', 'She doesn\'t work here.', ['She does not work here.'], 'present-simple', 'helping', 'After doesn\'t use V1.', 'بعد doesn\'t نستخدم الفعل الأساسي.'],
  ['Did you called the supplier?', 'Did you call the supplier?', [], 'past-simple', 'question', 'After did use V1.', 'بعد did نستخدم الفعل الأساسي.'],
  ['They is waiting for you.', 'They are waiting for you.', ['They\'re waiting for you.'], 'present-continuous', 'agreement', 'They → are.', 'they تأخذ are.'],
  ['I have finish the report.', 'I have finished the report.', ['I\'ve finished the report.'], 'present-perfect', 'participle', 'Have + V3: finished.', 'have + التصريف الثالث.'],
  ['He will calls you later.', 'He will call you later.', ['He\'ll call you later.'], 'future-simple', 's-es', 'After will use V1.', 'بعد will نستخدم الفعل الأساسي.'],
  ['My companies sells furniture.', 'My companies sell furniture.', [], 'present-simple', 'agreement', 'Plural subject → no s.', 'الفاعل جمع ← بدون s.'],
  ['I am work now.', 'I am working now.', ['I\'m working now.'], 'present-continuous', 'structure', 'am + V-ing.', 'am + ing.'],
  ['She has went home.', 'She has gone home.', ['She\'s gone home.'], 'present-perfect', 'participle', 'Has + V3: gone.', 'has + gone.'],
  ['We was in the meeting.', 'We were in the meeting.', [], 'past-simple', 'agreement', 'We → were.', 'we تأخذ were.'],
  ['Ali study English every day.', 'Ali studies English every day.', [], 'present-simple', 's-es', 'One name = he → studies (y → ies).', 'اسم واحد = he ← studies.'],
  ['I buyed a new phone.', 'I bought a new phone.', [], 'past-simple', 'past-form', 'Buy is irregular: bought.', 'buy فعل شاذ: bought.'],
  ['Does the manager knows?', 'Does the manager know?', [], 'present-simple', 'question', 'Does + subject + V1.', 'does + الفاعل + الفعل الأساسي.'],
  ['When I arrived, the meeting already started.', 'When I arrived, the meeting had already started.', [], 'past-perfect', 'tense', 'Earlier past action → had + V3.', 'الفعل الأسبق ← had + التصريف الثالث.'],
  ['I work here since 2019.', 'I have worked here since 2019.', ['I\'ve worked here since 2019.', 'I have been working here since 2019.', 'I\'ve been working here since 2019.'], 'present-perfect', 'tense', 'Since + until now → Present Perfect.', 'since حتى الآن ← مضارع تام.'],
];
FX.forEach(([text, answer, accept, tense, cat, en, ar], i) => fix({ id: `fix-${i + 1}`, lesson: tense, tense, cat, text, answer, accept, en, ar, rule: tense, hint: 'Look at the verb after the subject or the helping verb.' }));

// Subjects & pronouns
const SB: [string, string[], string, string][] = [
  ['Which pronoun can replace "Ali and Omar"?', ['They', 'He', 'We', 'It'], 'Two or more names = they.', 'اسمان أو أكثر = they.'],
  ['Which pronoun can replace "Sara"?', ['She', 'They', 'It', 'He'], 'One woman\'s name = she.', 'اسم امرأة واحدة = she.'],
  ['Which pronoun can replace "my company"?', ['It', 'They', 'He', 'We'], 'One company = it.', 'شركة واحدة = it.'],
  ['Which pronoun can replace "the employees"?', ['They', 'It', 'He', 'You'], 'Plural people = they.', 'جمع = they.'],
  ['Which pronoun can replace "my wife and I"?', ['We', 'They', 'I', 'She'], 'A group that includes the speaker = we.', 'مجموعة تشمل المتكلم = we.'],
  ['Which pronoun can replace "the car"?', ['It', 'He', 'They', 'She'], 'One thing = it.', 'شيء واحد = it.'],
  ['"I" is…', ['first person singular', 'third person singular', 'second person', 'third person plural'], 'I = the speaker = first person singular.', 'I = المتكلم المفرد.'],
  ['Which subjects take -s in the Present Simple?', ['he, she, it and one name or thing', 'I and you', 'we and they', 'all subjects'], 'Only third person singular subjects take -s.', 'فقط الغائب المفرد.'],
];
SB.forEach(([prompt, choices, en, ar], i) => mc({ id: `subj-${i + 1}`, lesson: 'subjects', cat: 'structure', level: 1, prompt, choices, en, ar }));

// Spelling (ED / ING)
const SP: [string, string[], string, string][] = [
  ['Past form of "stop":', ['stopped', 'stoped', 'stopt', 'stopping'], 'CVC verb: double the last consonant.', 'نضاعف الحرف الأخير.'],
  ['Past form of "study":', ['studied', 'studyed', 'studed', 'studyied'], 'Consonant + y → ied.', 'ساكن + y ← ied.'],
  ['Past form of "play":', ['played', 'plaied', 'plaid', 'playd'], 'Vowel + y → add ed.', 'علة + y ← ed.'],
  ['Past form of "arrive":', ['arrived', 'arriveed', 'arrivd', 'arrove'], 'Ends in e → add d.', 'ينتهي بـ e ← نضيف d.'],
  ['-ing form of "make":', ['making', 'makeing', 'makking', 'maked'], 'Drop the final e.', 'نحذف e.'],
  ['-ing form of "sit":', ['sitting', 'siting', 'sitteing', 'sat'], 'CVC: double the t.', 'نضاعف t.'],
  ['-ing form of "see":', ['seeing', 'seing', 'sing', 'seen'], 'Ends in ee → keep both.', 'ee تبقى.'],
  ['-ing form of "open":', ['opening', 'openning', 'opned', 'openeing'], 'Stress is on the first syllable: no doubling.', 'المقطع الأخير غير منبور: لا مضاعفة.'],
  ['-ing form of "lie":', ['lying', 'lieing', 'liing', 'lyeing'], 'ie → ying.', 'ie ← ying.'],
  ['Past form of "plan":', ['planned', 'planed', 'plannd', 'planted'], 'CVC: double the n.', 'نضاعف n.'],
  ['-ing form of "travel" (British):', ['travelling', 'traveling only', 'travelleing', 'travling'], 'British English doubles l: travelling. (US: traveling.)', 'البريطانية تضاعف l.'],
  ['-ing form of "fix":', ['fixing', 'fixxing', 'fixeing', 'fixed'], 'Never double x.', 'لا نضاعف x.'],
];
SP.forEach(([prompt, choices, en, ar], i) => mc({ id: `spell-${i + 1}`, lesson: 'spelling', cat: i < 4 || i === 9 ? 'past-form' : 'structure', level: 1, prompt, choices, en, ar }));

// ───── Generated questions ─────
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const GEN_VERBS = ['work', 'call', 'finish', 'send', 'buy', 'write', 'visit', 'go', 'meet', 'prepare', 'sell', 'eat', 'speak', 'drive', 'pay', 'travel', 'check', 'deliver', 'sign', 'discuss', 'open', 'study', 'watch', 'help'];
const GEN_SUBJ = ['he', 'they', 'I', 'sara', 'employees', 'we', 'company', 'you', 'aliomar', 'manager', 'she', 'ali'];
const allValid = (subj: string, verb: string, comp: string) => {
  const set = new Set<string>();
  for (const t of TENSES) for (const f of FORMS) for (const c of [false, true]) set.add(build(SUBJECT_MAP[subj], VERB_MAP[verb], parseTense(t.id), f.id, { comp, contracted: c }).text.toLowerCase());
  return set;
};
type Mut = { text: string; en: string; ar: string; cat: MistakeCat };
const SWAP: Record<string, string> = { is: 'are', are: 'is', am: 'is', was: 'were', were: 'was', has: 'have', have: 'has', does: 'do', do: 'does', Is: 'Are', Are: 'Is', Am: 'Is', Was: 'Were', Were: 'Was', Has: 'Have', Have: 'Has', Does: 'Do', Do: 'Does', "doesn't": "don't", "don't": "doesn't", "Doesn't": "Don't", "Don't": "Doesn't", "isn't": "aren't", "aren't": "isn't", "Isn't": "Aren't", "Aren't": "Isn't", "wasn't": "weren't", "weren't": "wasn't", "Wasn't": "Weren't", "Weren't": "Wasn't", "hasn't": "haven't", "haven't": "hasn't", "Hasn't": "Haven't", "Haven't": "Hasn't" };
function mutations(tokens: Token[], verb: string, tenseId: string): Mut[] {
  const vb = VERB_MAP[verb]; const out: Mut[] = [];
  const mainIdx = tokens.findIndex((t) => t.r === 'verb');
  // 1. wrong agreement of a helping verb
  tokens.forEach((t, i) => {
    if ((t.r === 'aux' || t.r === 'neg') && SWAP[t.t]) {
      const nt = tokens.map((x, j) => (j === i ? { ...x, t: SWAP[t.t] } : x));
      out.push({ text: joinTokens(nt), en: `"${SWAP[t.t]}" does not agree with the subject. Use "${t.t.toLowerCase()}".`, ar: `"${SWAP[t.t]}" لا تتوافق مع الفاعل، والصحيح "${t.t.toLowerCase()}".`, cat: 'helping' });
    }
  });
  // 2. wrong main-verb form
  if (mainIdx >= 0) {
    const right = tokens[mainIdx].t;
    const prevTok = tokens.slice(0, mainIdx).filter((t) => t.r !== 'subject').map((t) => t.t).pop();
    const prev = prevTok?.toLowerCase();
    const afterBe = !!prev && ['am', 'is', 'are', 'was', 'were', 'be', 'been', "isn't", "aren't", "wasn't", "weren't"].includes(prev);
    // After a be-form, V2/V3 could form a passive, so those are never used as distractors there.
    const cands = [vb.base, vb.s3, vb.ing, afterBe ? '' : vb.v2, afterBe ? '' : vb.v3, vb.irregular ? vb.base + 'ed' : ''].filter((w) => w && w !== right);
    for (const w of cands) {
      const nt = tokens.map((x, j) => (j === mainIdx ? { ...x, t: w } : x));
      const cat: MistakeCat = tenseId.includes('perfect') && !tenseId.includes('continuous') ? 'participle' : tenseId === 'past-simple' ? 'past-form' : tenseId === 'present-simple' ? 's-es' : 'structure';
      const subj = tokens.find((t) => t.r === 'subject')!.t;
      out.push(prev
        ? { text: joinTokens(nt), en: `After "${prev}" the correct form is "${right}", not "${w}".`, ar: `بعد "${prev}" نستخدم "${right}" وليس "${w}".`, cat }
        : { text: joinTokens(nt), en: `With the subject "${subj}" the correct form is "${right}", not "${w}".`, ar: `مع الفاعل "${subj}" نستخدم "${right}" وليس "${w}".`, cat });
    }
  }
  // 3. missing first helping verb (only for continuous forms, where the result is always wrong)
  const firstAux = tokens.findIndex((t) => t.r === 'aux');
  if (tenseId.endsWith('-continuous') && firstAux === 1) {
    const nt = tokens.filter((_, j) => j !== firstAux);
    out.push({ text: joinTokens(nt), en: `The helping verb "${tokens[firstAux].t}" is missing.`, ar: `الفعل المساعد "${tokens[firstAux].t}" ناقص.`, cat: 'helping' });
  }
  return out;
}

let gi = 0;
const pick = <T,>(arr: T[], n: number) => arr[n % arr.length];

// G1: choose the correct sentence (8 per tense)
TENSES.forEach((t, ti) => {
  const forms: Form[] = ['aff', 'neg', 'q', 'aff', 'negq', 'aff', 'q', 'neg'];
  for (let k = 0; k < 8; k++) {
    const subj = pick(GEN_SUBJ, ti * 3 + k); const verb = pick(GEN_VERBS, ti * 5 + k * 3); const comp = VERB_MAP[verb].comp; const form = forms[k];
    const b = build(SUBJECT_MAP[subj], VERB_MAP[verb], parseTense(t.id), form, { comp, contracted: k % 2 === 1 });
    const valid = allValid(subj, verb, comp);
    const muts = mutations(b.tokens, verb, t.id).filter((m) => !valid.has(m.text.toLowerCase()) && m.text !== b.text);
    const uniq: Mut[] = []; for (const m of muts) if (!uniq.find((u) => u.text === m.text)) uniq.push(m);
    const picked = [uniq[k % uniq.length], uniq[(k + 1) % uniq.length], uniq[(k + 2) % uniq.length]].filter((m, i, a) => m && a.findIndex((x) => x.text === m.text) === i);
    if (picked.length < 2) continue;
    const formName = FORMS.find((f) => f.id === form)!.en.toLowerCase();
    add({ id: `g-cs-${t.id}-${k}`, lesson: t.id, tense: t.id, level: form === 'negq' ? 3 : form === 'aff' ? 1 : 2, type: 'mcq', cat: picked[0].cat,
      prompt: `Choose the correct ${t.en} sentence (${formName}).`, promptAr: `اختر الجملة الصحيحة في زمن ${t.ar}.`,
      choices: [b.text, ...picked.map((m) => m.text)], answer: b.text,
      en: `${t.en}: ${b.formula}. Correct: "${b.text}"`, ar: `${t.ar}: ${FORMULA_AR[t.id]}.`, rule: t.id,
      why: Object.fromEntries(picked.map((m) => [m.text, { en: m.en, ar: m.ar }])) });
    gi++;
  }
});

// G2: fill in the verb group (5 per tense), tense named so the answer is unambiguous
TENSES.forEach((t, ti) => {
  for (let k = 0; k < 5; k++) {
    const subj = pick(GEN_SUBJ, ti + k * 5); const verb = pick(GEN_VERBS, ti * 7 + k * 2 + 1); const comp = VERB_MAP[verb].comp; const form: Form = k === 3 ? 'neg' : 'aff';
    const full = build(SUBJECT_MAP[subj], VERB_MAP[verb], parseTense(t.id), form, { comp });
    const short = build(SUBJECT_MAP[subj], VERB_MAP[verb], parseTense(t.id), form, { comp, contracted: true });
    const group = (b: typeof full) => b.tokens.filter((x) => x.r === 'aux' || x.r === 'neg' || x.r === 'verb').map((x) => x.t).join(' ');
    const subjText = full.tokens[0].t;
    const text = `${subjText} ___ ${comp}${form === 'neg' ? '' : ''}.`.replace(' .', '.');
    add({ id: `g-fill-${t.id}-${k}`, lesson: t.id, tense: t.id, level: 2, type: 'fill', cat: t.id === 'present-simple' ? 's-es' : t.id === 'past-simple' ? 'past-form' : t.aspect === 'perfect' ? 'participle' : 'helping',
      prompt: `Complete with the ${form === 'neg' ? 'negative ' : ''}${t.en} of "${verb}".`, promptAr: `أكمل بصيغة ${form === 'neg' ? 'النفي في ' : ''}${t.ar} للفعل "${verb}".`,
      text, answer: group(full), accept: [group(short)],
      en: `${t.en}: ${full.formula} → "${full.text}"`, ar: `${t.ar}: ${FORMULA_AR[t.id]}.`, rule: t.id, hint: full.formula });
  }
});

// G3 / G4: irregular V2 and V3
const NO_V2Q = new Set(['hang', 'light', 'forecast', 'quit', 'broadcast', 'be', 'have', 'upset', 'split', 'bet', 'reset', 'spread', 'hurt', 'cost', 'set', 'let', 'put', 'cut', 'hit', 'shut', 'read']);
const IRR = VERBS.filter((v) => v.irregular && !NO_V2Q.has(v.base));
IRR.slice(0, 45).forEach((v, i) => {
  const wrong = [v.base + (v.base.endsWith('e') ? 'd' : 'ed'), v.v3 !== v.v2 ? v.v3 : v.ing, v.base !== v.v2 ? v.base : v.s3].filter((w, j, a) => w !== v.v2 && a.indexOf(w) === j);
  add({ id: `g-v2-${v.base}`, lesson: 'verb-forms', level: i < 20 ? 1 : 2, type: 'mcq', cat: 'past-form', prompt: `What is the past simple (V2) of "${v.base}"?`, promptAr: `ما التصريف الثاني (الماضي) للفعل "${v.base}" (${v.ar})؟`,
    choices: [v.v2, ...wrong], answer: v.v2, en: `${v.base} – ${v.v2} – ${v.v3}. "${v.base}" is irregular.`, ar: `${v.base} – ${v.v2} – ${v.v3}. فعل شاذ يجب حفظه.`, rule: 'verb-forms' });
});
IRR.filter((v) => v.v3 !== v.v2).slice(0, 35).forEach((v, i) => {
  const wrong = [v.v2, v.base + (v.base.endsWith('e') ? 'd' : 'ed'), v.v3 === v.base ? v.ing : v.base].filter((w, j, a) => w !== v.v3 && a.indexOf(w) === j);
  add({ id: `g-v3-${v.base}`, lesson: 'verb-forms', level: i < 15 ? 2 : 3, type: 'mcq', cat: 'participle', prompt: `Complete: "I have ___ (${v.base})."`, promptAr: `أكمل بالتصريف الثالث للفعل "${v.base}".`,
    choices: [v.v3, ...wrong], answer: v.v3, en: `After have/has use V3: ${v.base} – ${v.v2} – ${v.v3}.`, ar: `بعد have/has نستخدم التصريف الثالث: ${v.v3}.`, rule: 'verb-forms' });
});

// G5: S / ES / IES
const SES = ['watch', 'wash', 'fix', 'finish', 'go', 'push', 'teach', 'catch', 'miss', 'pass', 'relax', 'mix', 'brush', 'search', 'reach', 'cross', 'discuss', 'study', 'try', 'carry', 'worry', 'reply', 'apply', 'copy', 'hurry', 'supply', 'play', 'enjoy', 'buy', 'stay', 'pray', 'work', 'read', 'speak', 'have', 'do'];
const SES_SUBJ = ['He', 'She', 'Ali', 'The manager', 'My company', 'Sara'];
SES.forEach((b, i) => {
  const v = VERB_MAP[b]; if (!v) return;
  const s = SES_SUBJ[i % SES_SUBJ.length];
  const rule = v.sRule === 'ies' ? 'consonant + y → ies' : v.sRule === 'es' ? 'ends in s, sh, ch, x, z or o → es' : v.sRule === 'special' ? 'special form' : /[aeiou]y$/.test(b) ? 'vowel + y → s' : 'most verbs → s';
  const ruleAr = v.sRule === 'ies' ? 'ساكن + y ← ies' : v.sRule === 'es' ? 'ينتهي بـ s أو sh أو ch أو x أو z أو o ← es' : v.sRule === 'special' ? 'صيغة خاصة' : /[aeiou]y$/.test(b) ? 'علة + y ← s' : 'معظم الأفعال ← s';
  const raw = b === 'have' ? ['haves', 'have', 'having'] : b === 'do' ? ['dos', 'do', 'doing'] : [b + 's', b + 'es', /y$/.test(b) ? b.slice(0, -1) + 'ies' : b + 'ing', b];
  const wrongs = raw.filter((w, j, a) => w !== v.s3 && a.indexOf(w) === j).slice(0, 3);
  add({ id: `g-ses-${b}`, lesson: 'sesies', level: 1, type: i % 2 ? 'fill' : 'mcq', cat: 's-es', prompt: i % 2 ? `Write the correct form of "${b}".` : `Choose the correct form of "${b}".`, promptAr: 'اختر/اكتب الصيغة الصحيحة مع الفاعل المفرد الغائب.',
    text: `${s} usually ___ ${v.comp}.`, choices: i % 2 ? undefined : [v.s3, ...wrongs], answer: v.s3,
    en: `${s} = he/she/it → ${b} → ${v.s3} (${rule}).`, ar: `${s} = غائب مفرد ← ${v.s3} (${ruleAr}).`, rule: 'sesies' });
});

// G6: helping verbs
const HV: { tense: string; form: Form; set: string[]; time?: string }[] = [
  { tense: 'present-continuous', form: 'q', set: ['Am', 'Is', 'Are'], time: 'now' },
  { tense: 'present-simple', form: 'q', set: ['Do', 'Does', 'Is'], time: 'every day' },
  { tense: 'present-perfect', form: 'q', set: ['Have', 'Has', 'Does'], time: 'yet' },
  { tense: 'past-continuous', form: 'q', set: ['Was', 'Were', 'Did'], time: 'at ten yesterday' },
  { tense: 'present-continuous', form: 'aff', set: ['am', 'is', 'are'], time: 'now' },
  { tense: 'present-simple', form: 'neg', set: ["don't", "doesn't", "isn't"], time: 'on Fridays' },
  { tense: 'present-perfect', form: 'aff', set: ['have', 'has', 'does'], time: 'already' },
];
let hvn = 0;
HV.forEach((h) => {
  ['I', 'he', 'they', 'sara', 'aliomar', 'we'].forEach((s, si) => {
    const verb = pick(GEN_VERBS, hvn * 7 + si);
    const b = build(SUBJECT_MAP[s], VERB_MAP[verb], parseTense(h.tense), h.form, { comp: VERB_MAP[verb].comp, contracted: h.form === 'neg' });
    const helpIdx = b.tokens.findIndex((t) => t.r === 'aux' || t.r === 'neg' || (t.r === 'verb' && false));
    if (helpIdx < 0) return;
    const right = b.tokens[helpIdx].t;
    if (!h.set.map((x) => x.toLowerCase()).includes(right.toLowerCase())) return;
    let tk = b.tokens.map((t, j) => (j === helpIdx ? { ...t, t: '___' } : t));
    if (h.time === 'already') tk = tk.flatMap((t) => (t.t === '___' ? [t, { t: 'already', r: 'time' as const }] : [t]));
    else if (h.time === 'yet') tk = tk.flatMap((t) => (t.r === 'punct' ? [{ t: 'yet', r: 'time' as const }, t] : [t]));
    else tk = tk.flatMap((t) => (t.r === 'punct' ? [{ t: h.time!, r: 'time' as const }, t] : [t]));
    add({ id: `g-hv-${hvn++}`, lesson: 'helping', tense: h.tense, level: 1, type: 'mcq', cat: h.form === 'q' ? 'question' : 'helping', prompt: 'Choose the correct helping verb.', promptAr: 'اختر الفعل المساعد الصحيح.',
      text: joinTokens(tk), choices: h.set, answer: h.set.find((x) => x.toLowerCase() === right.toLowerCase())!,
      en: `${TENSE_MAP[h.tense].en}: ${b.formula}. With "${SUBJECT_MAP[s].en}" use "${right}".`, ar: `${TENSE_MAP[h.tense].ar}: مع "${SUBJECT_MAP[s].en}" نستخدم "${right}".`, rule: 'helping' });
  });
});

// G7: subject–verb agreement
['I', 'you', 'he', 'she', 'it', 'we', 'they', 'ali', 'sara', 'aliomar', 'manager', 'employees', 'company', 'companies'].forEach((s, i) => {
  (s === 'it' ? [['work', 'well']] : [['work', 'in the sales department'], ['sell', 'furniture'], ['have', 'a meeting today']].slice(0, i % 2 ? 2 : 3)).forEach(([verb, comp], k) => {
    const vb = VERB_MAP[verb]; const S = SUBJECT_MAP[s];
    const right = S.person === 3 && !S.plural ? vb.s3 : vb.base;
    const wrong = right === vb.base ? vb.s3 : vb.base;
    add({ id: `g-agr-${s}-${verb}`, lesson: k === 0 ? 'agreement' : 'subjects', level: 1, type: 'mcq', cat: 'agreement', prompt: 'Choose the verb that agrees with the subject.', promptAr: 'اختر الفعل الذي يتوافق مع الفاعل.',
      text: `${cap(S.en)} ___ ${comp}.`, choices: [right, wrong, vb.ing], answer: right,
      en: `"${cap(S.en)}" = ${S.pron} (${S.kind}). ${right === vb.base ? 'No -s.' : 'Add -s/-es.'}`, ar: `"${S.en}" = ${S.pron} (${S.kindAr}). ${right === vb.base ? 'بدون s.' : 'نضيف s/es.'}`, rule: 'agreement' });
  });
});

// G8: identify the tense (3 per tense)
TENSES.forEach((t, ti) => {
  for (let k = 0; k < 3; k++) {
    const subj = pick(GEN_SUBJ, ti * 2 + k * 4); const verb = pick(GEN_VERBS, ti * 3 + k * 5 + 2);
    const b = build(SUBJECT_MAP[subj], VERB_MAP[verb], parseTense(t.id), k === 1 ? 'q' : 'aff', { comp: VERB_MAP[verb].comp });
    const others = TENSES.filter((o) => o.id !== t.id && (o.time === t.time || o.aspect === t.aspect));
    const ch = [t.en, ...[others[k % others.length], others[(k + 1) % others.length], others[(k + 2) % others.length]].map((o) => o.en)].filter((x, j, a) => a.indexOf(x) === j);
    add({ id: `g-id-${t.id}-${k}`, lesson: t.id, tense: t.id, level: 2, type: 'identify', cat: 'tense', prompt: 'Which tense is this sentence?', promptAr: 'ما زمن هذه الجملة؟',
      text: b.text, choices: ch, answer: t.en, en: `${b.formula} → ${t.en}.`, ar: `${FORMULA_AR[t.id]} ← ${t.ar}.`, rule: t.id });
  }
});

// G9: convert affirmative → question; present → past
TENSES.forEach((t, ti) => {
  for (let k = 0; k < 2; k++) {
    const subj = pick(GEN_SUBJ, ti + k * 6 + 1); const verb = pick(GEN_VERBS, ti * 2 + k * 9);
    const a = build(SUBJECT_MAP[subj], VERB_MAP[verb], parseTense(t.id), 'aff', { comp: VERB_MAP[verb].comp });
    const q = build(SUBJECT_MAP[subj], VERB_MAP[verb], parseTense(t.id), 'q', { comp: VERB_MAP[verb].comp });
    add({ id: `g-cq-${t.id}-${k}`, lesson: t.id, tense: t.id, level: 3, type: 'convert', cat: 'question', prompt: 'Change this sentence into a question.', promptAr: 'حوّل هذه الجملة إلى سؤال.',
      text: a.text, answer: q.text, en: `Move the first helping verb before the subject${t.aspect === 'simple' && t.time !== 'future' ? ' (add do/does/did and use V1)' : ''}: ${q.text}`, ar: `ننقل الفعل المساعد الأول قبل الفاعل${t.aspect === 'simple' && t.time !== 'future' ? ' (ونضيف do/does/did مع الفعل الأساسي)' : ''}.`, rule: 'helping', hint: 'Start with the helping verb.' });
  }
});
for (let k = 0; k < 12; k++) {
  const subj = pick(GEN_SUBJ, k * 5 + 2); const verb = pick(GEN_VERBS, k * 7 + 3);
  const a = build(SUBJECT_MAP[subj], VERB_MAP[verb], parseTense('present-simple'), 'aff', { comp: VERB_MAP[verb].comp, time: 'every day' });
  const p = build(SUBJECT_MAP[subj], VERB_MAP[verb], parseTense('past-simple'), 'aff', { comp: VERB_MAP[verb].comp, time: 'yesterday' });
  add({ id: `g-cp-${k}`, lesson: 'past-simple', tense: 'past-simple', level: 2, type: 'convert', cat: 'past-form', prompt: 'Change this sentence into the past simple. Replace "every day" with "yesterday".', promptAr: 'حوّل الجملة إلى الماضي البسيط، واستبدل every day بـ yesterday.',
    text: a.text, answer: p.text, en: `Past Simple uses V2 for every subject: ${VERB_MAP[verb].base} → ${VERB_MAP[verb].v2}.`, ar: `الماضي البسيط يستخدم التصريف الثاني مع جميع الضمائر: ${VERB_MAP[verb].v2}.`, rule: 'past-simple' });
}

// G10: rearrange words (2 per tense)
const shuffleDet = <T,>(a: T[], seed: number) => { const r = [...a]; let s = seed + 7; for (let i = r.length - 1; i > 0; i--) { s = (s * 9301 + 49297) % 233280; const j = Math.floor((s / 233280) * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };
TENSES.forEach((t, ti) => {
  for (let k = 0; k < 2; k++) {
    const subj = pick(GEN_SUBJ, ti * 3 + k * 7 + 2); const verb = pick(GEN_VERBS, ti * 4 + k * 11 + 5);
    const b = build(SUBJECT_MAP[subj], VERB_MAP[verb], parseTense(t.id), k ? 'q' : 'aff', { comp: VERB_MAP[verb].comp });
    const words = b.text.replace(/[.?]$/, '').split(' ');
    let sh = shuffleDet(words, ti * 10 + k); if (sh.join(' ') === words.join(' ')) sh = [...words].reverse();
    add({ id: `g-ro-${t.id}-${k}`, lesson: t.id, tense: t.id, level: 2, type: 'reorder', cat: k ? 'question' : 'structure', prompt: 'Put the words in the correct order.', promptAr: 'رتّب الكلمات لتكوين جملة صحيحة.',
      words: sh.map((w) => (w === 'I' || ['Ali', 'Sara', 'Omar', 'English', 'Dubai', 'London', 'Riyadh'].includes(w) ? w : w.toLowerCase())), answer: b.text,
      en: `${k ? 'Question order: helping verb + subject + verb.' : 'Statement order: subject + verb group + object.'} ${b.text}`, ar: k ? 'ترتيب السؤال: الفعل المساعد + الفاعل + الفعل.' : 'ترتيب الجملة: الفاعل + الفعل + المفعول.', rule: t.id });
  }
});

// G11: listening
const LISTEN_T = ['present-simple', 'past-simple', 'present-continuous', 'future-simple', 'present-perfect', 'past-continuous'];
for (let k = 0; k < 15; k++) {
  const subj = pick(['he', 'she', 'they', 'we', 'I', 'manager'], k); const verb = pick(['work', 'call', 'sell', 'travel', 'visit', 'finish', 'write', 'buy', 'meet', 'speak'], k);
  const opts = [0, 1, 2, 3].map((j) => LISTEN_T[(k + j) % LISTEN_T.length]).map((tid) => build(SUBJECT_MAP[subj], VERB_MAP[verb], parseTense(tid), 'aff', { comp: VERB_MAP[verb].comp }).text);
  const ans = opts[k % 4];
  add({ id: `g-li-${k}`, lesson: 'comparison', level: 2, type: 'listen', cat: 'tense', prompt: 'Listen and choose the sentence you hear.', promptAr: 'استمع واختر الجملة التي تسمعها.',
    text: ans, choices: opts, answer: ans, en: `You heard: "${ans}". Listen for the helping verb and the ending of the main verb.`, ar: 'انتبه للفعل المساعد ونهاية الفعل الرئيسي.', rule: 'comparison' });
}

// G12 / G13: matching
const MATCHABLE = VERBS.filter((v) => v.common && v.base !== 'be' && v.base !== 'have' && v.base !== 'do');
for (let k = 0; k < 12; k++) {
  const vs = [0, 1, 2, 3].map((j) => MATCHABLE[(k * 4 + j) % MATCHABLE.length]);
  add({ id: `g-ma-${k}`, lesson: 'verb-forms', level: 1, type: 'match', cat: 'vocabulary', prompt: 'Match each English verb with its Arabic meaning.', promptAr: 'صِل كل فعل إنجليزي بمعناه العربي.',
    pairs: vs.map((v) => [v.base, v.ar] as [string, string]), answer: vs.map((v) => v.base).join(','), en: vs.map((v) => `${v.base} = ${v.ar}`).join(' · '), ar: 'راجع معاني الأفعال في مكتبة الأفعال.', rule: 'verb-forms' });
}
const IRR2 = VERBS.filter((v) => v.irregular && v.base !== 'be' && v.v2 !== v.base);
for (let k = 0; k < 10; k++) {
  const vs = [0, 1, 2, 3].map((j) => IRR2[(k * 4 + j) % IRR2.length]);
  add({ id: `g-mp-${k}`, lesson: 'verb-forms', level: 2, type: 'match', cat: 'past-form', prompt: 'Match each verb with its past simple (V2).', promptAr: 'صِل كل فعل بتصريفه الثاني.',
    pairs: vs.map((v) => [v.base, v.v2] as [string, string]), answer: vs.map((v) => v.base).join(','), en: vs.map((v) => `${v.base} → ${v.v2}`).join(' · '), ar: 'هذه أفعال شاذة يجب حفظ تصريفها.', rule: 'verb-forms' });
}

// G14: translate Arabic → English
const TR: { s: string; v: string; t: string; time: string; timeAr: string }[] = [
  { s: 'I', v: 'work', t: 'present-simple', time: 'every day', timeAr: 'كل يوم' },
  { s: 'he', v: 'drink', t: 'present-simple', time: 'every day', timeAr: 'كل يوم' },
  { s: 'she', v: 'speak', t: 'present-simple', time: '', timeAr: '' },
  { s: 'we', v: 'eat', t: 'present-continuous', time: 'now', timeAr: 'الآن' },
  { s: 'they', v: 'watch', t: 'present-continuous', time: 'now', timeAr: 'الآن' },
  { s: 'I', v: 'call', t: 'past-simple', time: 'yesterday', timeAr: 'أمس' },
  { s: 'manager', v: 'sign', t: 'past-simple', time: 'yesterday', timeAr: 'أمس' },
  { s: 'they', v: 'buy', t: 'past-simple', time: 'yesterday', timeAr: 'أمس' },
  { s: 'we', v: 'travel', t: 'future-simple', time: 'tomorrow', timeAr: 'غداً' },
  { s: 'I', v: 'send', t: 'future-simple', time: 'tomorrow', timeAr: 'غداً' },
  { s: 'ali', v: 'visit', t: 'future-simple', time: 'tomorrow', timeAr: 'غداً' },
  { s: 'sara', v: 'study', t: 'present-simple', time: 'every day', timeAr: 'كل يوم' },
  { s: 'employees', v: 'help', t: 'present-simple', time: '', timeAr: '' },
  { s: 'he', v: 'cook', t: 'present-continuous', time: 'now', timeAr: 'الآن' },
  { s: 'company', v: 'sell', t: 'present-simple', time: '', timeAr: '' },
  { s: 'I', v: 'read', t: 'past-simple', time: 'yesterday', timeAr: 'أمس' },
  { s: 'they', v: 'play', t: 'present-simple', time: 'every day', timeAr: 'كل يوم' },
  { s: 'we', v: 'open', t: 'future-simple', time: 'tomorrow', timeAr: 'غداً' },
  { s: 'she', v: 'prepare', t: 'present-continuous', time: 'now', timeAr: 'الآن' },
  { s: 'he', v: 'finish', t: 'past-simple', time: 'yesterday', timeAr: 'أمس' },
];
TR.forEach((x, k) => {
  const T = parseTense(x.t); const S = SUBJECT_MAP[x.s];
  if (!AR_VERBS[x.v]) return;
  const ar = arabicSentence(S, x.v, T, 'aff', true, x.timeAr || undefined)!;
  const o = { comp: VERB_MAP[x.v].comp, time: x.time || undefined };
  const en = build(S, VERB_MAP[x.v], T, 'aff', o).text;
  const enC = build(S, VERB_MAP[x.v], T, 'aff', { ...o, contracted: true }).text;
  const accept = [enC];
  // Arabic present with no time word can mean simple or continuous: accept both.
  if (x.t === 'present-simple' && !x.time) accept.push(build(S, VERB_MAP[x.v], parseTense('present-continuous'), 'aff', o).text);
  add({ id: `g-tr-${k}`, lesson: x.t, tense: x.t, level: 3, type: 'translate', cat: 'tense', prompt: 'Translate into English.', promptAr: 'ترجم إلى الإنجليزية.',
    text: ar, answer: en, accept, en: `${TENSE_MAP[x.t].en}: ${en}`, ar: `${TENSE_MAP[x.t].ar}. انتبه للفاعل ونهاية الفعل.`, rule: x.t, hint: `Use the ${TENSE_MAP[x.t].en}. Words: ${x.v} → ${VERB_MAP[x.v].comp}` });
});

// G15: conversation completion
CONVERSATIONS.forEach((c) => {
  const line = c.lines[c.blank];
  const right = c.choices[0];
  const idx = line.en.indexOf(right);
  if (idx < 0) return;
  const text = line.en.slice(0, idx) + '___' + line.en.slice(idx + right.length);
  add({ id: `g-cv-${c.id}`, lesson: 'conversations', tense: line.tense, level: 2, type: 'mcq', cat: 'tense', prompt: `Complete the conversation: ${c.en}.`, promptAr: `أكمل المحادثة: ${c.ar}.`,
    text: `${c.lines[Math.max(0, c.blank - 1)] !== line ? c.lines[Math.max(0, c.blank - 1)].who + ': ' + c.lines[Math.max(0, c.blank - 1)].en + '\n' : ''}${line.who}: ${text}`, choices: c.choices, answer: right,
    en: line.note, ar: line.ar, rule: line.tense });
});

// Short knowledge checks shown inside lessons (Level 1) are drawn from level-1/2 questions of the same lesson.
export const QUESTIONS: Question[] = Q;
export const Q_MAP: Record<string, Question> = Object.fromEntries(Q.map((q) => [q.id, q]));
export const questionsFor = (lesson: string) => Q.filter((q) => q.lesson === lesson);
