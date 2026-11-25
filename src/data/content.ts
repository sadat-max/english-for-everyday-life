// Lesson content other than the 12 tenses: modules, helping verbs, spelling rules, time expressions, conversations.

export interface Module { id: string; n: number; en: string; ar: string; desc: string; descAr: string; color: string; lessons: { id: string; en: string; ar: string; page: string }[] }

export const MODULES: Module[] = [
  { id: 'm1', n: 1, en: 'Subjects and pronouns', ar: 'الفاعل والضمائر', desc: 'Understanding who performs an action.', descAr: 'من الذي يقوم بالفعل؟', color: 'teal', lessons: [
    { id: 'subjects', en: 'Subject pronouns and nouns', ar: 'ضمائر الفاعل والأسماء', page: 'subjects' },
    { id: 'agreement', en: 'Subject–verb agreement', ar: 'توافق الفاعل مع الفعل', page: 'subjects' } ] },
  { id: 'm2', n: 2, en: 'Essential helping verbs', ar: 'الأفعال المساعدة الأساسية', desc: 'am, is, are, do, does, did, have, has, had and will.', descAr: 'الأفعال المساعدة وكيفية استخدامها.', color: 'teal', lessons: [
    { id: 'helping', en: 'Helping verbs guide', ar: 'دليل الأفعال المساعدة', page: 'helping' } ] },
  { id: 'm3', n: 3, en: 'Present tenses', ar: 'أزمنة المضارع', desc: 'Habits, current actions and situations connected to the present.', descAr: 'العادات والأفعال الحالية والمواقف المرتبطة بالحاضر.', color: 'green', lessons: [
    { id: 'present-simple', en: 'Present Simple', ar: 'المضارع البسيط', page: 'present-simple' },
    { id: 'sesies', en: 'S / ES / IES rules', ar: 'قواعد S / ES / IES', page: 'sesies' },
    { id: 'present-continuous', en: 'Present Continuous', ar: 'المضارع المستمر', page: 'present-continuous' },
    { id: 'present-perfect', en: 'Present Perfect', ar: 'المضارع التام', page: 'present-perfect' },
    { id: 'present-perfect-continuous', en: 'Present Perfect Continuous', ar: 'المضارع التام المستمر', page: 'present-perfect-continuous' } ] },
  { id: 'm4', n: 4, en: 'Past tenses', ar: 'أزمنة الماضي', desc: 'Completed actions, past experiences and past situations.', descAr: 'الأفعال المنتهية والتجارب والمواقف الماضية.', color: 'purple', lessons: [
    { id: 'past-simple', en: 'Past Simple', ar: 'الماضي البسيط', page: 'past-simple' },
    { id: 'past-continuous', en: 'Past Continuous', ar: 'الماضي المستمر', page: 'past-continuous' },
    { id: 'past-perfect', en: 'Past Perfect', ar: 'الماضي التام', page: 'past-perfect' },
    { id: 'past-perfect-continuous', en: 'Past Perfect Continuous', ar: 'الماضي التام المستمر', page: 'past-perfect-continuous' } ] },
  { id: 'm5', n: 5, en: 'Future tenses', ar: 'أزمنة المستقبل', desc: 'Plans, predictions, intentions and future actions.', descAr: 'الخطط والتوقعات والنوايا.', color: 'orange', lessons: [
    { id: 'future-simple', en: 'Future Simple (will)', ar: 'المستقبل البسيط', page: 'future-simple' },
    { id: 'future-ways', en: 'Will, going to & present forms', ar: 'طرق التعبير عن المستقبل', page: 'future' },
    { id: 'future-continuous', en: 'Future Continuous', ar: 'المستقبل المستمر', page: 'future-continuous' },
    { id: 'future-perfect', en: 'Future Perfect', ar: 'المستقبل التام', page: 'future-perfect' },
    { id: 'future-perfect-continuous', en: 'Future Perfect Continuous', ar: 'المستقبل التام المستمر', page: 'future-perfect-continuous' } ] },
  { id: 'm6', n: 6, en: 'Perfect tenses', ar: 'الأزمنة التامة', desc: 'How actions relate to different points in time.', descAr: 'العلاقة بين الأفعال ونقاط الزمن المختلفة.', color: 'blue', lessons: [
    { id: 'perfect', en: 'Perfect tenses compared', ar: 'مقارنة الأزمنة التامة', page: 'perfect' } ] },
  { id: 'm7', n: 7, en: 'Verb mastery', ar: 'إتقان الأفعال', desc: 'Regular verbs, irregular verbs and their forms.', descAr: 'الأفعال المنتظمة والشاذة وتصريفاتها.', color: 'indigo', lessons: [
    { id: 'verb-forms', en: 'V1, V2, V3 and irregular verbs', ar: 'التصريفات الثلاثة والأفعال الشاذة', page: 'verbs' },
    { id: 'spelling', en: 'ED and ING spelling', ar: 'قواعد إملاء ED و ING', page: 'sesies' } ] },
  { id: 'm8', n: 8, en: 'Tense comparison', ar: 'المقارنة بين الأزمنة', desc: 'Choosing the correct tense in real conversations.', descAr: 'اختيار الزمن المناسب في المحادثات الحقيقية.', color: 'amber', lessons: [
    { id: 'comparison', en: 'Choosing the right tense', ar: 'اختيار الزمن الصحيح', page: 'compare' },
    { id: 'time-expressions', en: 'Time expressions', ar: 'تعبيرات الزمن', page: 'time' } ] },
  { id: 'm9', n: 9, en: 'Practical English', ar: 'الإنجليزية العملية', desc: 'Everyday and professional conversations.', descAr: 'المحادثات اليومية والمهنية.', color: 'teal', lessons: [
    { id: 'conversations', en: 'Business & everyday conversations', ar: 'محادثات العمل والحياة اليومية', page: 'conversations' } ] },
  { id: 'm10', n: 10, en: 'Final assessment', ar: 'التقييم النهائي', desc: 'Overall understanding and practical application.', descAr: 'اختبار شامل للفهم والتطبيق.', color: 'amber', lessons: [
    { id: 'final', en: 'Final assessment (50 questions)', ar: 'الاختبار النهائي (50 سؤالاً)', page: 'quizzes' } ] },
];
export const ALL_LESSONS = MODULES.flatMap((m) => m.lessons.map((l) => ({ ...l, module: m.id })));
export const LESSON_MAP = Object.fromEntries(ALL_LESSONS.map((l) => [l.id, l]));

// ───────── Helping verbs ─────────
export interface Helper { id: string; words: string; en: string; ar: string; subjects: { s: string; w: string }[]; uses: string[]; neg: string[]; q: string[]; mistakes: { wrong: string; right: string }[]; noteAr: string; color: string }
export const HELPERS: Helper[] = [
  { id: 'be-present', words: 'am · is · are', en: 'The verb "be" in the present', ar: 'فعل الكون في المضارع', color: 'green',
    subjects: [{ s: 'I', w: 'am' }, { s: 'he / she / it / Ali / the manager', w: 'is' }, { s: 'you / we / they / Ali and Omar / the employees', w: 'are' }],
    uses: ['Main verb: I am ready. She is a manager.', 'Present Continuous: He is working.', 'Passive (later): The order is delivered.', 'Going to: I am going to call him.'],
    neg: ['I am not late.', 'He is not (isn\'t) here.', 'They are not (aren\'t) working.'],
    q: ['Am I late?', 'Is she working?', 'Are you ready?'],
    mistakes: [{ wrong: 'He are busy.', right: 'He is busy.' }, { wrong: 'I is ready.', right: 'I am ready.' }, { wrong: 'They is coming.', right: 'They are coming.' }],
    noteAr: 'لا يوجد في العربية فعل مقابل لـ am/is/are في الجملة الاسمية ("أنا جاهز")، لكن الإنجليزية تحتاجه دائماً: I am ready.' },
  { id: 'be-past', words: 'was · were', en: 'The verb "be" in the past', ar: 'فعل الكون في الماضي (كان)', color: 'purple',
    subjects: [{ s: 'I / he / she / it / Ali', w: 'was' }, { s: 'you / we / they / the employees', w: 'were' }],
    uses: ['Main verb: I was tired. They were at the meeting.', 'Past Continuous: She was driving.'],
    neg: ['I was not (wasn\'t) there.', 'They were not (weren\'t) ready.'],
    q: ['Was he at the office?', 'Were they waiting?'],
    mistakes: [{ wrong: 'They was late.', right: 'They were late.' }, { wrong: 'You was right.', right: 'You were right.' }],
    noteAr: 'was وwere تعنيان "كان". مع I وhe وshe وit نستخدم was، ومع you وwe وthey نستخدم were.' },
  { id: 'do', words: 'do · does · did', en: 'Do-support for questions and negatives', ar: 'أفعال المساعدة للسؤال والنفي في الأزمنة البسيطة', color: 'green',
    subjects: [{ s: 'I / you / we / they (present)', w: 'do' }, { s: 'he / she / it / one name (present)', w: 'does' }, { s: 'all subjects (past)', w: 'did' }],
    uses: ['Present Simple questions and negatives', 'Past Simple questions and negatives', 'After do/does/did the main verb is always V1'],
    neg: ['I do not (don\'t) work on Fridays.', 'He does not (doesn\'t) work here.', 'They did not (didn\'t) call.'],
    q: ['Do you work here?', 'Does he work here?', 'Did they work here?'],
    mistakes: [{ wrong: 'Does he works here?', right: 'Does he work here?' }, { wrong: 'Did you went?', right: 'Did you go?' }, { wrong: 'He don\'t know.', right: 'He doesn\'t know.' }],
    noteAr: 'لا نترجم do/does/did في السؤال والنفي؛ وظيفتها فقط تكوين السؤال أو النفي. وبعدها يعود الفعل دائماً لصورته الأساسية.' },
  { id: 'have', words: 'have · has · had', en: 'Have for perfect tenses', ar: 'have للأزمنة التامة', color: 'blue',
    subjects: [{ s: 'I / you / we / they', w: 'have' }, { s: 'he / she / it / one name', w: 'has' }, { s: 'all subjects (past)', w: 'had' }],
    uses: ['Present Perfect: have/has + V3', 'Past Perfect: had + V3', 'Future Perfect: will have + V3', 'Also a main verb meaning "own": I have a car.'],
    neg: ['I have not (haven\'t) finished.', 'She has not (hasn\'t) called.', 'We had not (hadn\'t) seen it.'],
    q: ['Have you finished?', 'Has he finished?', 'Had they left?'],
    mistakes: [{ wrong: 'He have finished.', right: 'He has finished.' }, { wrong: 'Have you finish?', right: 'Have you finished?' }],
    noteAr: 'have كفعل مساعد لا تعني "يملك"، بل تُكوّن الأزمنة التامة مع التصريف الثالث: I have finished = لقد أنهيت.' },
  { id: 'will', words: 'will', en: 'Will for the future', ar: 'will للمستقبل', color: 'orange',
    subjects: [{ s: 'all subjects', w: 'will' }],
    uses: ['Future Simple: will + V1', 'Future Continuous: will be + V-ing', 'Future Perfect: will have + V3'],
    neg: ['I will not (won\'t) be late.', 'He won\'t call today.'],
    q: ['Will you send it?', 'Will she be working?', 'Will they have finished?'],
    mistakes: [{ wrong: 'He will goes.', right: 'He will go.' }, { wrong: 'I will to call.', right: 'I will call.' }],
    noteAr: 'will تعادل حرف السين أو "سوف" في العربية: I will call = سأتصل. ولا تتغير مع الضمائر.' },
  { id: 'be-forms', words: 'be · been · being', en: 'Other forms of "be"', ar: 'صيغ أخرى لفعل be', color: 'blue',
    subjects: [{ s: 'after will / modals', w: 'be' }, { s: 'after have / has / had', w: 'been' }, { s: 'continuous of "be"', w: 'being' }],
    uses: ['be: I will be ready. / will be working', 'been: I have been busy. / have been working', 'being: He is being careful. (temporary behaviour)'],
    neg: ['I won\'t be late.', 'She hasn\'t been here.'],
    q: ['Will you be there?', 'Have you been to Jeddah?'],
    mistakes: [{ wrong: 'I have be busy.', right: 'I have been busy.' }, { wrong: 'I will been there.', right: 'I will be there.' }],
    noteAr: 'be بعد will، وbeen بعد have/has/had، وbeing بعد am/is/are.' },
];

// ───────── Time expressions ─────────
export interface TimeExpr { en: string; ar: string; group: 'present' | 'past' | 'future' | 'perfect'; tenses: string[]; ex: string; exAr: string; place: string }
export const TIME_EXPR: TimeExpr[] = [
  { en: 'every day', ar: 'كل يوم', group: 'present', tenses: ['present-simple', 'past-simple'], ex: 'I check my email every day.', exAr: 'أتفقد بريدي كل يوم.', place: 'Usually at the end of the sentence.' },
  { en: 'usually', ar: 'عادةً', group: 'present', tenses: ['present-simple', 'past-simple'], ex: 'We usually meet on Sundays.', exAr: 'نجتمع عادةً أيام الأحد.', place: 'Before the main verb, after am/is/are: "He is usually late."' },
  { en: 'always', ar: 'دائماً', group: 'present', tenses: ['present-simple', 'past-simple', 'present-perfect'], ex: 'She always answers quickly.', exAr: 'هي دائماً ترد بسرعة.', place: 'Before the main verb.' },
  { en: 'often', ar: 'غالباً / كثيراً', group: 'present', tenses: ['present-simple', 'past-simple'], ex: 'Customers often ask for discounts.', exAr: 'كثيراً ما يطلب العملاء خصومات.', place: 'Before the main verb.' },
  { en: 'sometimes', ar: 'أحياناً', group: 'present', tenses: ['present-simple', 'past-simple'], ex: 'I sometimes work on Saturdays.', exAr: 'أعمل أحياناً يوم السبت.', place: 'Before the verb, or at the start/end.' },
  { en: 'rarely', ar: 'نادراً', group: 'present', tenses: ['present-simple', 'past-simple'], ex: 'He rarely takes a holiday.', exAr: 'نادراً ما يأخذ إجازة.', place: 'Before the main verb.' },
  { en: 'never', ar: 'أبداً / لم يسبق', group: 'present', tenses: ['present-simple', 'present-perfect', 'past-simple'], ex: 'I never drink coffee at night.', exAr: 'لا أشرب القهوة ليلاً أبداً.', place: 'Before the main verb. Do not use "not" with never.' },
  { en: 'now', ar: 'الآن', group: 'present', tenses: ['present-continuous'], ex: 'He is talking to a client now.', exAr: 'هو يتحدث مع عميل الآن.', place: 'End of sentence.' },
  { en: 'at the moment', ar: 'في هذه اللحظة', group: 'present', tenses: ['present-continuous'], ex: 'The manager is busy at the moment.', exAr: 'المدير مشغول في هذه اللحظة.', place: 'Start or end.' },
  { en: 'currently', ar: 'حالياً', group: 'present', tenses: ['present-continuous', 'present-simple'], ex: 'We are currently hiring.', exAr: 'نحن نوظف حالياً.', place: 'After am/is/are or at the start.' },
  { en: 'yesterday', ar: 'أمس', group: 'past', tenses: ['past-simple', 'past-continuous'], ex: 'I called the supplier yesterday.', exAr: 'اتصلت بالمورد أمس.', place: 'Start or end.' },
  { en: 'last week', ar: 'الأسبوع الماضي', group: 'past', tenses: ['past-simple', 'past-continuous'], ex: 'We signed the contract last week.', exAr: 'وقّعنا العقد الأسبوع الماضي.', place: 'Start or end.' },
  { en: 'last month', ar: 'الشهر الماضي', group: 'past', tenses: ['past-simple'], ex: 'Sales went up last month.', exAr: 'ارتفعت المبيعات الشهر الماضي.', place: 'Start or end.' },
  { en: 'last year', ar: 'العام الماضي', group: 'past', tenses: ['past-simple'], ex: 'They opened a branch last year.', exAr: 'افتتحوا فرعاً العام الماضي.', place: 'Start or end.' },
  { en: 'ago', ar: 'منذ / قبل', group: 'past', tenses: ['past-simple'], ex: 'He left two hours ago.', exAr: 'غادر قبل ساعتين.', place: 'After the time period: two days ago.' },
  { en: 'previously', ar: 'سابقاً', group: 'past', tenses: ['past-simple', 'past-perfect'], ex: 'I previously worked in a bank.', exAr: 'عملت سابقاً في بنك.', place: 'Before the main verb.' },
  { en: 'in the past', ar: 'في الماضي', group: 'past', tenses: ['past-simple'], ex: 'In the past, we sold only furniture.', exAr: 'في الماضي كنا نبيع الأثاث فقط.', place: 'Start or end.' },
  { en: 'tomorrow', ar: 'غداً', group: 'future', tenses: ['future-simple', 'future-continuous', 'present-continuous'], ex: 'I will call you tomorrow.', exAr: 'سأتصل بك غداً.', place: 'Start or end.' },
  { en: 'next week', ar: 'الأسبوع القادم', group: 'future', tenses: ['future-simple', 'present-continuous'], ex: 'We are flying to Cairo next week.', exAr: 'سنسافر إلى القاهرة الأسبوع القادم.', place: 'Start or end.' },
  { en: 'soon', ar: 'قريباً', group: 'future', tenses: ['future-simple'], ex: 'The new store will open soon.', exAr: 'سيفتح المتجر الجديد قريباً.', place: 'End, or before the main verb.' },
  { en: 'later', ar: 'لاحقاً', group: 'future', tenses: ['future-simple'], ex: 'I will reply later.', exAr: 'سأرد لاحقاً.', place: 'End.' },
  { en: 'in the future', ar: 'في المستقبل', group: 'future', tenses: ['future-simple'], ex: 'We will export more in the future.', exAr: 'سنصدّر أكثر في المستقبل.', place: 'Start or end.' },
  { en: 'by tomorrow', ar: 'بحلول الغد', group: 'future', tenses: ['future-perfect', 'future-simple'], ex: 'I will have finished it by tomorrow.', exAr: 'سأكون قد أنهيته بحلول الغد.', place: 'End.' },
  { en: 'since', ar: 'منذ (نقطة زمنية)', group: 'perfect', tenses: ['present-perfect', 'present-perfect-continuous', 'past-perfect'], ex: 'I have worked here since 2018.', exAr: 'أعمل هنا منذ 2018.', place: 'Since + a starting point: since Monday, since 2018, since I joined.' },
  { en: 'for', ar: 'لمدة', group: 'perfect', tenses: ['present-perfect', 'present-perfect-continuous', 'past-simple', 'past-perfect-continuous'], ex: 'We have been waiting for two hours.', exAr: 'ننتظر منذ ساعتين.', place: 'For + a period: for two hours, for ten years.' },
  { en: 'already', ar: 'بالفعل / سبق', group: 'perfect', tenses: ['present-perfect', 'past-perfect'], ex: 'She has already sent the file.', exAr: 'لقد أرسلت الملف بالفعل.', place: 'Between have/has and V3, or at the end.' },
  { en: 'yet', ar: 'بعد (في النفي والسؤال)', group: 'perfect', tenses: ['present-perfect'], ex: 'Have you finished yet? I haven\'t finished yet.', exAr: 'هل انتهيت؟ لم أنتهِ بعد.', place: 'At the end, in questions and negatives.' },
  { en: 'just', ar: 'للتو', group: 'perfect', tenses: ['present-perfect', 'past-perfect'], ex: 'The shipment has just arrived.', exAr: 'وصلت الشحنة للتو.', place: 'Between have/has and V3.' },
  { en: 'ever', ar: 'من قبل (في السؤال)', group: 'perfect', tenses: ['present-perfect'], ex: 'Have you ever been to Japan?', exAr: 'هل سبق أن زرت اليابان؟', place: 'Before V3, mostly in questions.' },
  { en: 'never (experience)', ar: 'لم يسبق أبداً', group: 'perfect', tenses: ['present-perfect'], ex: 'I have never seen such good results.', exAr: 'لم يسبق أن رأيت نتائج بهذه الجودة.', place: 'Between have/has and V3.' },
  { en: 'so far', ar: 'حتى الآن', group: 'perfect', tenses: ['present-perfect'], ex: 'We have sold 300 units so far.', exAr: 'بعنا 300 وحدة حتى الآن.', place: 'End.' },
  { en: 'recently', ar: 'مؤخراً', group: 'perfect', tenses: ['present-perfect', 'present-perfect-continuous', 'past-simple'], ex: 'Prices have increased recently.', exAr: 'ارتفعت الأسعار مؤخراً.', place: 'End, or before V3.' },
];

// ───────── Conversations ─────────
export interface ConvLine { who: string; en: string; ar: string; tense: string; note: string }
export interface Conversation { id: string; en: string; ar: string; cat: 'business' | 'everyday'; lines: ConvLine[]; blank: number; choices: string[] }
const L = (who: string, en: string, ar: string, tense: string, note: string): ConvLine => ({ who, en, ar, tense, note });

export const CONVERSATIONS: Conversation[] = [
  { id: 'c1', en: 'Asking for a sales report', ar: 'طلب تقرير المبيعات', cat: 'business', blank: 2, choices: ['Will you send', 'Did you send', 'Are you sending yesterday'], lines: [
    L('Manager', 'Have you finished the sales report?', 'هل انتهيت من تقرير المبيعات؟', 'present-perfect', 'Present Perfect: checking a completed task. Have + you + V3?'),
    L('Employee', 'Yes, I finished it this morning.', 'نعم، أنهيته هذا الصباح.', 'past-simple', 'Past Simple: "this morning" is a finished time.'),
    L('Manager', 'Will you send it to me today?', 'هل سترسله لي اليوم؟', 'future-simple', 'Future Simple question: Will + subject + V1?'),
    L('Employee', 'Yes, I will send it after the meeting.', 'نعم، سأرسله بعد الاجتماع.', 'future-simple', 'Future Simple: a promise.') ] },
  { id: 'c2', en: 'Discussing yesterday\'s performance', ar: 'مناقشة أداء الأمس', cat: 'business', blank: 1, choices: ['sold', 'have sold', 'sell'], lines: [
    L('Manager', 'How were sales yesterday?', 'كيف كانت المبيعات أمس؟', 'past-simple', 'Past of "be": were (plural "sales").'),
    L('Employee', 'We sold 85 units, which is more than last week.', 'بعنا 85 وحدة، وهذا أكثر من الأسبوع الماضي.', 'past-simple', 'Past Simple with "yesterday": sold (irregular: sell – sold – sold).'),
    L('Manager', 'Good. Which product sold best?', 'ممتاز. أي منتج بيع أكثر؟', 'past-simple', 'Past Simple question with a question-word subject: no "did" needed.'),
    L('Employee', 'The new office chairs. Customers really like them.', 'الكراسي المكتبية الجديدة. العملاء معجبون بها كثيراً.', 'present-simple', 'Present Simple with a stative verb: like.') ] },
  { id: 'c3', en: 'Planning tomorrow\'s meeting', ar: 'التخطيط لاجتماع الغد', cat: 'business', blank: 1, choices: ['starts', 'started', 'is start'], lines: [
    L('Manager', 'What time is the meeting tomorrow?', 'متى موعد الاجتماع غداً؟', 'present-simple', 'Present Simple of "be" for a schedule.'),
    L('Assistant', 'It starts at ten in the main meeting room.', 'يبدأ في العاشرة في غرفة الاجتماعات الرئيسية.', 'present-simple', 'Present Simple for timetables: it starts.'),
    L('Manager', 'Are the suppliers coming too?', 'هل سيحضر الموردون أيضاً؟', 'present-continuous', 'Present Continuous for an arrangement.'),
    L('Assistant', 'Yes, two of them are joining us online.', 'نعم، اثنان منهم سينضمان إلينا عبر الإنترنت.', 'present-continuous', 'Present Continuous for a fixed future plan.'),
    L('Manager', 'Great. I am going to present the new prices.', 'رائع. سأعرض الأسعار الجديدة.', 'future-simple', '"Be going to" for a plan already decided.') ] },
  { id: 'c4', en: 'Calling a supplier', ar: 'الاتصال بالمورد', cat: 'business', blank: 2, choices: ['hasn\'t arrived', 'didn\'t arrive yet', 'doesn\'t arrive'], lines: [
    L('You', 'Good morning, this is Nabegh from the furniture company.', 'صباح الخير، معك نابغ من شركة الأثاث.', 'present-simple', 'Present Simple of "be" on the phone: "This is…".'),
    L('Supplier', 'Good morning! How can I help you?', 'صباح الخير! كيف يمكنني مساعدتك؟', 'present-simple', '"Can" + V1: a modal verb.'),
    L('You', 'Our order hasn\'t arrived yet. We ordered it two weeks ago.', 'لم يصل طلبنا بعد. طلبناه قبل أسبوعين.', 'present-perfect', 'Present Perfect negative with "yet", then Past Simple with "ago".'),
    L('Supplier', 'I am sorry. I will check it and call you back in an hour.', 'أعتذر. سأتحقق من الأمر وأعاود الاتصال بك خلال ساعة.', 'future-simple', 'Future Simple: a promise.') ] },
  { id: 'c5', en: 'Speaking with a customer', ar: 'التحدث مع عميل', cat: 'business', blank: 1, choices: ['are looking', 'looking', 'look now'], lines: [
    L('Salesperson', 'Welcome! Can I help you?', 'أهلاً بك! هل يمكنني مساعدتك؟', 'present-simple', 'Modal "can" + V1.'),
    L('Customer', 'Yes, we are looking for a dining table for eight people.', 'نعم، نبحث عن طاولة طعام لثمانية أشخاص.', 'present-continuous', 'Present Continuous: what they are doing now.'),
    L('Salesperson', 'This one is very popular. It comes in three colours.', 'هذه رائجة جداً، وتتوفر بثلاثة ألوان.', 'present-simple', 'Present Simple for facts about a product.'),
    L('Customer', 'Do you deliver to Khobar?', 'هل توصلون إلى الخبر؟', 'present-simple', 'Present Simple question: Do + you + V1?'),
    L('Salesperson', 'Yes, we deliver within three days.', 'نعم، نوصل خلال ثلاثة أيام.', 'present-simple', 'Present Simple: a regular service.') ] },
  { id: 'c6', en: 'Discussing delivery delays', ar: 'مناقشة تأخر التسليم', cat: 'business', blank: 0, choices: ['did my order arrive', 'did my order arrived', 'my order did arrive'], lines: [
    L('Customer', 'Why did my order arrive late?', 'لماذا وصل طلبي متأخراً؟', 'past-simple', 'Past Simple question: did + subject + V1 (arrive, not arrived).'),
    L('Manager', 'I apologize. The truck was waiting at the border for two days.', 'أعتذر. كانت الشاحنة تنتظر على الحدود لمدة يومين.', 'past-continuous', 'Past Continuous: an action in progress in the past.'),
    L('Customer', 'Will this happen again?', 'هل سيحدث هذا مرة أخرى؟', 'future-simple', 'Future Simple question.'),
    L('Manager', 'We have changed our shipping company, so it should not happen again.', 'غيّرنا شركة الشحن، لذا يُفترض ألا يتكرر ذلك.', 'present-perfect', 'Present Perfect: a past action with a result now.') ] },
  { id: 'c7', en: 'Visiting a warehouse', ar: 'زيارة المستودع', cat: 'business', blank: 3, choices: ['are unloading', 'unloads', 'unloaded now'], lines: [
    L('Manager', 'How many items do we have in stock?', 'كم قطعة لدينا في المخزون؟', 'present-simple', 'Present Simple with "have" meaning own (stative).'),
    L('Supervisor', 'We have about 1,200 items. We counted them yesterday.', 'لدينا حوالي 1,200 قطعة. عددناها أمس.', 'past-simple', 'Present Simple, then Past Simple with "yesterday".'),
    L('Manager', 'What are those workers doing?', 'ماذا يفعل أولئك العمال؟', 'present-continuous', 'Present Continuous question about now.'),
    L('Supervisor', 'They are unloading the new shipment.', 'إنهم يفرغون الشحنة الجديدة.', 'present-continuous', 'Present Continuous: happening now.') ] },
  { id: 'c8', en: 'Giving instructions', ar: 'إعطاء التعليمات', cat: 'business', blank: 1, choices: ['Check', 'Checks', 'Checking'], lines: [
    L('Manager', 'Please call every customer on this list today.', 'من فضلك اتصل بكل عميل في هذه القائمة اليوم.', 'present-simple', 'Imperative: the base verb with no subject.'),
    L('Manager', 'Check the prices before you send any offer.', 'راجع الأسعار قبل أن ترسل أي عرض.', 'present-simple', 'Imperative + Present Simple after "before".'),
    L('Employee', 'Should I copy you on the emails?', 'هل أضعك في نسخة من الرسائل؟', 'present-simple', 'Modal "should" + V1.'),
    L('Manager', 'Yes, and tell me when you have finished.', 'نعم، وأخبرني عندما تنتهي.', 'present-perfect', 'Present Perfect after "when" for a completed future task.') ] },
  { id: 'c9', en: 'Asking about completed tasks', ar: 'السؤال عن المهام المنجزة', cat: 'business', blank: 0, choices: ['Has Sara booked', 'Did Sara booked', 'Has Sara book'], lines: [
    L('Manager', 'Has Sara booked the hotel for the conference?', 'هل حجزت سارة الفندق للمؤتمر؟', 'present-perfect', 'Present Perfect question: Has + one name + V3?'),
    L('Assistant', 'Let me check… Yes, she booked it on Monday.', 'هل أكدته؟ دعني أتحقق… نعم، حجزته يوم الإثنين.', 'past-simple', 'Past Simple with a finished time: "on Monday".'),
    L('Manager', 'And have we paid the deposit yet?', 'وهل دفعنا العربون؟', 'present-perfect', '"Yet" in a Present Perfect question.'),
    L('Assistant', 'Not yet. I will pay it today.', 'ليس بعد. سأدفعه اليوم.', 'future-simple', 'Future Simple: a decision.') ] },
  { id: 'c10', en: 'Making business arrangements', ar: 'ترتيبات العمل', cat: 'business', blank: 1, choices: ['am meeting', 'meet yesterday', 'met tomorrow'], lines: [
    L('Partner', 'Are you free on Tuesday afternoon?', 'هل أنت متفرغ يوم الثلاثاء بعد الظهر؟', 'present-simple', 'Present Simple of "be".'),
    L('You', 'Sorry, I am meeting the bank manager on Tuesday.', 'آسف، لدي موعد مع مدير البنك يوم الثلاثاء.', 'present-continuous', 'Present Continuous for a fixed arrangement.'),
    L('Partner', 'What about Wednesday at eleven?', 'ما رأيك بالأربعاء الساعة الحادية عشرة؟', 'present-simple', 'Suggestion: What about + time?'),
    L('You', 'Wednesday works for me. I will send you an invitation.', 'الأربعاء مناسب لي. سأرسل لك دعوة.', 'future-simple', 'Present Simple + Future Simple.') ] },
  { id: 'c11', en: 'Booking a hotel', ar: 'حجز فندق', cat: 'everyday', blank: 1, choices: ['would like', 'am like', 'likes'], lines: [
    L('Receptionist', 'Good evening. How can I help you?', 'مساء الخير. كيف يمكنني مساعدتك؟', 'present-simple', 'Modal "can".'),
    L('You', 'I would like to book a room for three nights.', 'أود حجز غرفة لثلاث ليالٍ.', 'present-simple', '"Would like" is a polite way to say "want".'),
    L('Receptionist', 'When are you arriving?', 'متى ستصل؟', 'present-continuous', 'Present Continuous for a future arrangement.'),
    L('You', 'I am arriving on Thursday, and I will leave on Sunday morning.', 'سأصل يوم الخميس، وسأغادر صباح الأحد.', 'present-continuous', 'Present Continuous + Future Simple.') ] },
  { id: 'c12', en: 'Ordering food', ar: 'طلب الطعام', cat: 'everyday', blank: 3, choices: ['\'ll have', 'have had', 'am having yesterday'], lines: [
    L('Waiter', 'Are you ready to order?', 'هل أنتم مستعدون للطلب؟', 'present-simple', 'Present Simple of "be".'),
    L('You', 'Yes. What do you recommend?', 'نعم. ماذا تقترح؟', 'present-simple', 'Present Simple question: do + you + V1.'),
    L('Waiter', 'The grilled fish is excellent today.', 'السمك المشوي ممتاز اليوم.', 'present-simple', 'Present Simple of "be".'),
    L('You', 'Great, I\'ll have the fish and a fresh juice, please.', 'رائع، سآخذ السمك وعصيراً طازجاً من فضلك.', 'future-simple', '"I\'ll have…" = instant decision when ordering.') ] },
  { id: 'c13', en: 'Travelling: at the airport', ar: 'السفر: في المطار', cat: 'everyday', blank: 1, choices: ['has been delayed', 'delays', 'is delay'], lines: [
    L('You', 'Excuse me, is flight SV105 on time?', 'عذراً، هل الرحلة SV105 في موعدها؟', 'present-simple', 'Present Simple of "be".'),
    L('Agent', 'I\'m afraid it has been delayed by one hour.', 'للأسف تأخرت ساعة واحدة.', 'present-perfect', 'Present Perfect passive: news with a result now.'),
    L('You', 'When does boarding start?', 'متى يبدأ الصعود إلى الطائرة؟', 'present-simple', 'Present Simple for schedules: does + it + V1.'),
    L('Agent', 'Boarding starts at 7:30 at gate 12.', 'يبدأ الصعود في 7:30 عند البوابة 12.', 'present-simple', 'Present Simple for a timetable.') ] },
  { id: 'c14', en: 'Talking with family', ar: 'الحديث مع العائلة', cat: 'everyday', blank: 0, choices: ['did you do', 'do you did', 'have you do'], lines: [
    L('Father', 'What did you do at school today?', 'ماذا فعلت في المدرسة اليوم؟', 'past-simple', 'Past Simple question: did + you + V1 (do).'),
    L('Son', 'We had a maths test, and I think I did well.', 'كان لدينا اختبار رياضيات، وأظن أنني أبليت حسناً.', 'past-simple', 'Past Simple: had, did.'),
    L('Father', 'Well done! Are you going to play football this evening?', 'أحسنت! هل ستلعب كرة القدم هذا المساء؟', 'future-simple', '"Be going to" for plans.'),
    L('Son', 'Yes, my friends are waiting for me now.', 'نعم، أصدقائي ينتظرونني الآن.', 'present-continuous', 'Present Continuous: now.') ] },
  { id: 'c15', en: 'Speaking with employees', ar: 'التحدث مع الموظفين', cat: 'business', blank: 2, choices: ['have been working', 'are working since', 'work since'], lines: [
    L('Manager', 'Good morning, everyone. How is the new system working?', 'صباح الخير جميعاً. كيف يعمل النظام الجديد؟', 'present-continuous', 'Present Continuous for a current situation.'),
    L('Employee', 'It is faster, but some customers don\'t like the new forms.', 'إنه أسرع، لكن بعض العملاء لا يحبون النماذج الجديدة.', 'present-simple', 'Present Simple negative: don\'t + like.'),
    L('Employee 2', 'We have been working on a simpler version since Sunday.', 'نعمل على نسخة أبسط منذ الأحد.', 'present-perfect-continuous', 'Present Perfect Continuous: started Sunday, still continuing.'),
    L('Manager', 'Excellent. Show it to me when it is ready.', 'ممتاز. أروني إياها عندما تكون جاهزة.', 'present-simple', 'Imperative + Present Simple after "when".') ] },
];

// ───────── Quick reference: business sentences ─────────
export const BUSINESS_SENTENCES = [
  { en: 'Could you send me the report by Thursday?', ar: 'هل يمكنك إرسال التقرير لي بحلول الخميس؟' },
  { en: 'Have you received my email?', ar: 'هل استلمت بريدي الإلكتروني؟' },
  { en: 'I will get back to you this afternoon.', ar: 'سأعود إليك بعد الظهر.' },
  { en: 'We are currently reviewing the contract.', ar: 'نحن نراجع العقد حالياً.' },
  { en: 'Let\'s schedule a meeting for next week.', ar: 'لنحدد موعد اجتماع للأسبوع القادم.' },
  { en: 'Our sales increased by 10% last quarter.', ar: 'ارتفعت مبيعاتنا 10% في الربع الماضي.' },
  { en: 'I am sorry for the delay.', ar: 'أعتذر عن التأخير.' },
  { en: 'What is the delivery date?', ar: 'ما موعد التسليم؟' },
  { en: 'Can you give us a better price?', ar: 'هل يمكنك أن تعطينا سعراً أفضل؟' },
  { en: 'The payment has been transferred.', ar: 'تم تحويل الدفعة.' },
  { en: 'Please confirm the order.', ar: 'يرجى تأكيد الطلب.' },
  { en: 'I have been working on this project since January.', ar: 'أعمل على هذا المشروع منذ يناير.' },
];

// Spelling lessons
export const SPELLING = {
  ed: [
    { rule: 'Most verbs: add -ed', ar: 'معظم الأفعال: نضيف ed', ex: ['work → worked', 'call → called', 'visit → visited'] },
    { rule: 'Ends in -e: add -d', ar: 'ينتهي بـ e: نضيف d فقط', ex: ['arrive → arrived', 'like → liked', 'agree → agreed'] },
    { rule: 'Consonant + y: change y to -ied', ar: 'حرف ساكن + y: نحذف y ونضيف ied', ex: ['study → studied', 'try → tried', 'carry → carried'] },
    { rule: 'Vowel + y: add -ed', ar: 'حرف علة + y: نضيف ed', ex: ['play → played', 'stay → stayed', 'enjoy → enjoyed'] },
    { rule: 'Short verb ending consonant–vowel–consonant (stressed): double the last letter', ar: 'فعل قصير ينتهي بساكن–علة–ساكن: نضاعف الحرف الأخير', ex: ['stop → stopped', 'plan → planned', 'prefer → preferred'] },
    { rule: 'British English doubles final -l', ar: 'الإنجليزية البريطانية تضاعف l', ex: ['travel → travelled', 'cancel → cancelled'] },
  ],
  ing: [
    { rule: 'Most verbs: add -ing', ar: 'معظم الأفعال: نضيف ing', ex: ['work → working', 'go → going', 'study → studying'] },
    { rule: 'Ends in -e: drop the e', ar: 'ينتهي بـ e: نحذف e', ex: ['make → making', 'write → writing', 'drive → driving'] },
    { rule: 'Ends in -ee: keep both e', ar: 'ينتهي بـ ee: نبقيها', ex: ['see → seeing', 'agree → agreeing'] },
    { rule: 'Ends in -ie: change to -ying', ar: 'ينتهي بـ ie: نحولها إلى ying', ex: ['lie → lying', 'die → dying'] },
    { rule: 'Consonant–vowel–consonant (stressed): double', ar: 'ساكن–علة–ساكن: نضاعف الأخير', ex: ['stop → stopping', 'sit → sitting', 'begin → beginning', 'run → running'] },
    { rule: 'Do not double w, x, y', ar: 'لا نضاعف w وx وy', ex: ['fix → fixing', 'show → showing', 'play → playing'] },
    { rule: 'Do not double when the last syllable is not stressed', ar: 'لا نضاعف إذا لم يكن المقطع الأخير منبوراً', ex: ['open → opening', 'visit → visiting', 'listen → listening'] },
  ],
};
