// Verb database. One verb per line:
// base | past V2 | participle V3 | Arabic | categories | level (1 beginner, 2 intermediate) | flags | example complement
// Empty V2/V3 = regular verb (forms computed by the spelling rules in engine/spelling.ts).
// Flags: c = most common, d = doubles final consonant (stop → stopped, stopping), s = stative (no continuous),
//        m = mixed (stative in one meaning, dynamic in another).
// Spelling: British (travelled, cancelled, practise) with -ize endings (Oxford style). US variants in VERB_NOTES.
// Categories: ev everyday, bu business, co communication, tr travel, sh shopping, fi finance, sm sales & marketing,
//   fo food, fa family & home, mo movement, ft feelings & thoughts, te technology, of office, cs customer service

export const VERB_CATEGORIES: Record<string, { en: string; ar: string }> = {
  ev: { en: 'Everyday activities', ar: 'أنشطة يومية' },
  bu: { en: 'Business & management', ar: 'الأعمال والإدارة' },
  co: { en: 'Communication', ar: 'التواصل' },
  tr: { en: 'Travel', ar: 'السفر' },
  sh: { en: 'Shopping', ar: 'التسوق' },
  fi: { en: 'Finance', ar: 'المالية' },
  sm: { en: 'Sales & marketing', ar: 'المبيعات والتسويق' },
  fo: { en: 'Food & restaurants', ar: 'الطعام والمطاعم' },
  fa: { en: 'Family & home', ar: 'العائلة والمنزل' },
  mo: { en: 'Movement', ar: 'الحركة' },
  ft: { en: 'Feelings & thoughts', ar: 'المشاعر والأفكار' },
  te: { en: 'Technology', ar: 'التقنية' },
  of: { en: 'Office activities', ar: 'أعمال المكتب' },
  cs: { en: 'Customer service', ar: 'خدمة العملاء' },
};

const RAW = `
be|was/were|been|يكون|ev|1|cm|ready
have|had|had|يملك / لديه|ev,fa|1|cm|a meeting today
do|did|done|يفعل / يعمل|ev|1|c|the work
go|went|gone|يذهب|ev,mo,tr|1|c|to work
get|got|got|يحصل على|ev|1|cd|a good price
make|made|made|يصنع / يُعِدّ|ev,bu|1|c|a decision
take|took|taken|يأخذ|ev|1|c|a short break
come|came|come|يأتي|ev,mo|1|c|to the office
see|saw|seen|يرى|ev|1|cm|the manager
know|knew|known|يعرف|ft|1|cs|the answer
think|thought|thought|يفكر / يعتقد|ft|1|cm|about the plan
say|said|said|يقول|co|1|c|hello
tell|told|told|يخبر|co|1|c|the team the news
give|gave|given|يعطي|ev|1|c|a presentation
find|found|found|يجد|ev|1|c|a solution
leave|left|left|يغادر / يترك|ev,mo|1|c|the office at five
feel|felt|felt|يشعر|ft|1|cm|confident
bring|brought|brought|يُحضِر|ev|1|c|the documents
buy|bought|bought|يشتري|sh|1|c|a new car
sell|sold|sold|يبيع|sm,sh,bu|1|c|furniture
pay|paid|paid|يدفع|fi,sh|1|c|the bill
send|sent|sent|يرسل|co,of|1|c|an email
spend|spent|spent|ينفق / يقضي|fi,ev|1|c|money on training
lend|lent|lent|يُقرِض|fi|2||money to a friend
build|built|built|يبني|bu|1||a new branch
keep|kept|kept|يحتفظ / يُبقي|ev|1|c|the receipts
meet|met|met|يقابل / يلتقي|bu,co|1|c|the clients
sit|sat|sat|يجلس|ev,mo|1|d|in the meeting room
stand|stood|stood|يقف|mo|1||near the door
understand|understood|understood|يفهم|ft|1|cs|the problem
run|ran|run|يركض / يدير|mo,bu|1|cd|the company
begin|began|begun|يبدأ|ev|1|d|the meeting
drink|drank|drunk|يشرب|fo|1||coffee
eat|ate|eaten|يأكل|fo|1|c|breakfast
speak|spoke|spoken|يتحدث|co|1|c|English
write|wrote|written|يكتب|co,of|1|c|a report
drive|drove|driven|يقود السيارة|tr,mo|1||to the warehouse
ride|rode|ridden|يركب|tr,mo|2||the train
fly|flew|flown|يطير / يسافر جواً|tr|1||to Dubai
break|broke|broken|يكسر|ev|1||the rules
choose|chose|chosen|يختار|ev,sh|1||a supplier
forget|forgot|forgotten|ينسى|ft|1|d|the password
forgive|forgave|forgiven|يسامح|ft|2||the mistake
wake|woke|woken|يستيقظ|ev,fa|1||up early
wear|wore|worn|يرتدي|ev|1||a suit
win|won|won|يفوز|bu|1|d|the contract
lose|lost|lost|يخسر / يفقد|bu,ev|1||the keys
hold|held|held|يمسك / يعقد|bu|1||a meeting
read|read|read|يقرأ|co,ev|1|c|the newspaper
lead|led|led|يقود|bu|2||the team
hear|heard|heard|يسمع|co|1|s|the news
put|put|put|يضع|ev|1|d|the files on the desk
cut|cut|cut|يقطع / يخفض|ev,fi|1|d|costs
set|set|set|يحدد / يضع|bu|1|d|clear goals
let|let|let|يسمح / يدع|ev|2|d|the team decide
cost|cost|cost|يكلف|fi,sh|1|s|a lot of money
hit|hit|hit|يضرب / يحقق|bu|2|d|the sales target
hurt|hurt|hurt|يؤذي / يؤلم|ft|2||his back
quit|quit|quit|يترك / يستقيل|bu|2|d|his job
shut|shut|shut|يغلق|ev|2|d|the door
spread|spread|spread|ينشر|co|2||the news
fall|fell|fallen|يسقط / ينخفض|mo,fi|1||by ten percent
grow|grew|grown|ينمو|bu|1||quickly
draw|drew|drawn|يرسم|ev|2||a chart
show|showed|shown|يُري / يعرض|co|1|c|the results
throw|threw|thrown|يرمي|mo|2||the old papers away
teach|taught|taught|يُعلِّم|co|1||English
learn|||يتعلم|ev|1|c|new words
catch|caught|caught|يلحق / يمسك|tr|1||the flight
fight|fought|fought|يقاتل / يكافح|ft|2||for the deal
seek|sought|sought|يسعى / يبحث عن|bu|2||new investors
sleep|slept|slept|ينام|ev,fa|1||eight hours
swim|swam|swum|يسبح|ev|1|d|in the sea
sing|sang|sung|يغني|ev|2||a song
mean|meant|meant|يعني / يقصد|co|1|s|it
deal|dealt|dealt|يتعامل|bu,cs|2||with the complaint
hang|hung|hung|يعلّق|fa|2||the picture on the wall
feed|fed|fed|يطعم|fa|2||the cat
shake|shook|shaken|يهز / يصافح|co|2||hands with the client
steal|stole|stolen|يسرق|ev|2||the idea
hide|hid|hidden|يخفي|ev|2||the problem
rise|rose|risen|يرتفع|fi|2||every year
become|became|become|يصبح|ev|1||a manager
overcome|overcame|overcome|يتغلب على|ft|2||the problem
undertake|undertook|undertaken|يتولى / يضطلع|bu|2||the project
withdraw|withdrew|withdrawn|يسحب|fi|2||cash
forecast|forecast|forecast|يتوقع / يتنبأ|fi,bu|2||higher sales
oversee|oversaw|overseen|يشرف على|bu|2||the project
lay|laid|laid|يضع / يسرّح|bu|2||the foundations
bend|bent|bent|ينحني / يثني|mo|2||the rules
dig|dug|dug|يحفر|ev|2|d|deeper into the data
stick|stuck|stuck|يلتزم / يلصق|ev|2||to the plan
strike|struck|struck|يضرب / يُبرِم|bu|2||a deal
freeze|froze|frozen|يجمد|fi|2||the budget
tear|tore|torn|يمزق|ev|2||the paper
blow|blew|blown|ينفخ / يهب|ev|2||out the candles
split|split|split|يقسم|fi|2|d|the bill
broadcast|broadcast|broadcast|يبث|sm,co|2||the advertisement
rebuild|rebuilt|rebuilt|يعيد بناء|bu|2||the website
rewrite|rewrote|rewritten|يعيد كتابة|of|2||the contract
misunderstand|misunderstood|misunderstood|يسيء الفهم|co|2|s|the question
sweep|swept|swept|يكنس|fa|2||the floor
light|lit|lit|يشعل / يضيء|fa|2||the candles
bite|bit|bitten|يعض|ev|2||his nails
arise|arose|arisen|ينشأ / يظهر|bu|2||
upset|upset|upset|يزعج|ft|2|d|the customer
ring|rang|rung|يرنّ / يتصل|co|2||the bell
work|||يعمل|ev,bu,of|1|c|at the office
play|||يلعب|ev,fa|1|c|football
study|||يدرس|ev|1|c|English
call|||يتصل|co,cs|1|c|the customer
ask|||يسأل|co|1|c|a question
answer|||يجيب|co,cs|1|c|the phone
help|||يساعد|ev,cs|1|c|the new employee
want|||يريد|ft|1|cs|a coffee
need|||يحتاج|ft|1|cs|more time
like|||يحب / يُعجَب|ft|1|cs|the new design
love|||يحب|ft,fa|1|s|his family
hate|||يكره|ft|1|s|traffic
live|||يعيش / يسكن|fa|1|c|in Riyadh
move|||ينتقل / يحرك|mo|1|c|to a new office
open|||يفتح|ev|1|c|the store
close|||يغلق|ev|1|c|the deal
start|||يبدأ|ev|1|c|work at eight
finish|||ينهي|ev,of|1|c|the report
stop|||يتوقف|ev|1|cd|working
plan|||يخطط|bu|1|cd|the budget
visit|||يزور|tr,fa|1|c|the factory
travel|||يسافر|tr|1|cd|to London
arrive|||يصل|tr,mo|1|c|at the airport
book|||يحجز|tr|1||a hotel room
cancel|||يلغي|tr,bu|1|d|the meeting
check|||يتحقق / يفحص|of|1|c|the numbers
clean|||ينظف|fa|1||the kitchen
cook|||يطبخ|fo,fa|1||dinner
order|||يطلب|fo,sh|1|c|a pizza
wash|||يغسل|fa|1||the car
watch|||يشاهد|ev|1|c|the news
listen|||يستمع|co|1|c|to the customer
look|||ينظر / يبدو|ev|1|cm|at the report
talk|||يتحدث|co|1|c|to the team
wait|||ينتظر|ev|1|c|for the bus
walk|||يمشي|mo|1||to the mosque
use|||يستخدم|ev,te|1|c|the new system
try|||يحاول / يجرب|ev|1|c|a new method
carry|||يحمل|mo|1||the boxes
cry|||يبكي|ft|2||
enjoy|||يستمتع|ft|1||the trip
stay|||يبقى / يقيم|tr|1|c|at a hotel
pray|||يصلي|ev,fa|1||at the mosque
prepare|||يُعِد / يجهز|of,fo|1|c|the presentation
organize|||ينظم|bu,of|1||an event
manage|||يدير|bu|1|c|the sales team
discuss|||يناقش|bu,co|1|c|the plan
decide|||يقرر|bu|1|c|the price
agree|||يوافق|bu,co|1|s|with the proposal
explain|||يشرح|co|1|c|the process
present|||يعرض / يقدم|bu,co|2||the results
report|||يُبلغ / يقدم تقريراً|bu,of|2||the figures
review|||يراجع|of,bu|2||the contract
approve|||يوافق على / يعتمد|bu|2||the budget
sign|||يوقّع|bu,of|1||the contract
hire|||يوظف|bu|2||new staff
train|||يدرب|bu|1||new employees
improve|||يحسّن|bu|1|c|the service
increase|||يزيد|bu,fi|1|c|sales
reduce|||يقلل|bu,fi|1||expenses
deliver|||يوصّل / يسلّم|bu,cs|1|c|the order
export|||يصدّر|bu|2||dates to Europe
import|||يستورد|bu|2||furniture from Italy
produce|||ينتج|bu|2||high-quality products
offer|||يعرض / يقدم|sm,cs|1||a discount
provide|||يوفر / يقدم|bu,cs|2||good service
receive|||يستلم|bu,of|1|c|the payment
accept|||يقبل|bu|1||the offer
refuse|||يرفض|bu|1||the offer
complain|||يشتكي|cs|1||about the delay
apologize|||يعتذر|cs,co|1||for the mistake
invite|||يدعو|co,fa|1||the clients to dinner
thank|||يشكر|co|1||the team
promise|||يَعِد|co|2||a quick delivery
remember|||يتذكر|ft|1|cs|the address
believe|||يعتقد / يؤمن|ft|1|s|the report
hope|||يأمل|ft|1||for good results
prefer|||يفضّل|ft|1|ds|tea
seem|||يبدو|ft|2|s|tired
belong|||ينتمي / يخص|ft|2|s|to the company
own|||يمتلك|bu|2|s|three companies
contain|||يحتوي|ev|2|s|important information
include|||يشمل|bu|2|s|delivery
require|||يتطلب|bu|2|s|approval
depend|||يعتمد|bu|2|m|on the price
follow|||يتبع|ev|1||the instructions
reply|||يرد|co|1||to the email
print|||يطبع|of,te|1||the invoice
scan|||يمسح ضوئياً|of,te|2|d|the documents
save|||يحفظ / يوفر|te,fi|1|c|money
download|||يُنزّل|te|1||the file
upload|||يرفع|te|1||the photos
install|||يثبّت|te|2||the app
update|||يحدّث|te|1||the software
delete|||يحذف|te|1||the old files
type|||يكتب على الحاسوب|te,of|1||the letter
click|||ينقر|te|1||the button
share|||يشارك|te,co|1||the file
post|||ينشر|te,sm|1||an update
search|||يبحث|te|1||for information
connect|||يتصل / يربط|te|2||to the internet
invest|||يستثمر|fi|2||in real estate
borrow|||يقترض / يستعير|fi|1||money from the bank
earn|||يكسب|fi|1||a good salary
transfer|||يحوّل|fi|2|d|the money
deposit|||يودع|fi|2||the cheque
owe|||يدين بـ|fi|2|s|the bank money
charge|||يتقاضى / يشحن|fi,sh|2||a fee
count|||يعدّ|fi|1||the money
calculate|||يحسب|fi|2||the total cost
budget|||يضع ميزانية|fi|2||for the project
negotiate|||يفاوض|bu,sm|2||the price
market|||يسوّق|sm|2||the product
advertise|||يعلن|sm|2||on social media
promote|||يروّج / يرقّي|sm,bu|2||the new product
launch|||يطلق|sm,bu|2||a new product
compete|||ينافس|bu|2||with other companies
compare|||يقارن|bu|1||the prices
analyze|||يحلل|bu|2||the data
measure|||يقيس|bu|2||the results
schedule|||يجدول|of,bu|2||a meeting
arrange|||يرتب|of,bu|1||a meeting
confirm|||يؤكد|bu,cs|1||the booking
postpone|||يؤجل|bu|2||the meeting
attend|||يحضر|bu|1||the meeting
join|||ينضم|bu|1||the team
delegate|||يفوّض|bu|2||the task
assign|||يكلّف / يسند|bu|2||the task to Ali
support|||يدعم|bu,cs|1||the team
solve|||يحل|bu|1|c|the problem
fix|||يصلح|ev|1||the printer
repair|||يصلح|ev|1||the car
return|||يعود / يُرجِع|tr,sh|1|c|the product
exchange|||يستبدل|sh|2||the shirt
replace|||يستبدل|ev|2||the old machine
pack|||يحزم|tr|1||the suitcase
unpack|||يفرّغ الحقيبة|tr|2||the boxes
park|||يركن|tr|1||the car
rent|||يستأجر|tr,fa|1||a car
land|||يهبط|tr|2||at noon
depart|||يغادر|tr|2||at nine
cross|||يعبر|mo|1||the street
climb|||يتسلق|mo|2||the stairs
jump|||يقفز|mo|1||
push|||يدفع|mo|1||the door
pull|||يسحب|mo|1||the door
lift|||يرفع|mo|2||the box
drop|||يُسقِط / ينخفض|mo,fi|1|d|the price
turn|||يستدير / يُدير|mo|1||left
enter|||يدخل|mo|1||the building
hurry|||يستعجل|mo|1||
rest|||يرتاح|ev|1||after work
relax|||يسترخي|ev|1||at the weekend
smile|||يبتسم|ft|1||at the customer
laugh|||يضحك|ft|1||at the joke
worry|||يقلق|ft|1||about the deadline
care|||يهتم|ft|2||about quality
miss|||يفتقد / يفوّت|ev,tr|1||the flight
marry|||يتزوج|fa|2||
raise|||يرفع / يربي|bu,fa|2||prices
celebrate|||يحتفل|fa|1||the success
shop|||يتسوق|sh|1|d|online
pick|||يختار / يلتقط|sh|1||a colour
fill|||يملأ|of|1||the form
taste|||يتذوق|fo|2|m|the food
smell|||يشم|fo|2|m|the coffee
bake|||يخبز|fo|2||a cake
boil|||يغلي|fo|2||the water
fry|||يقلي|fo|2||the fish
serve|||يقدم / يخدم|fo,cs|1||the customers
wish|||يتمنى|ft|2||you success
wonder|||يتساءل|ft|2||about the price
imagine|||يتخيل|ft|2||the future
guess|||يخمّن|ft|1||the answer
notice|||يلاحظ|ft|2||the mistake
realize|||يدرك|ft|2|s|the problem
recognize|||يتعرف على|ft|2|s|the voice
suggest|||يقترح|co,bu|1||a new idea
recommend|||يوصي|co,cs|2||this hotel
advise|||ينصح|co|2||the client
warn|||يحذّر|co|2||the staff
mention|||يذكر|co|2||the price
describe|||يصف|co|1||the problem
introduce|||يقدّم / يعرّف|co|1||the new manager
greet|||يحيّي|co|1||the guests
translate|||يترجم|co|1||the letter
spell|||يتهجى|co|1||your name
pronounce|||ينطق|co|2||the word
repeat|||يكرر|co|1||the question
practise|||يتدرب / يمارس|ev|1||English every day
test|||يختبر|of,te|1||the system
pass|||ينجح / يمرر|ev|1||the exam
fail|||يفشل / يرسب|ev|1||the test
graduate|||يتخرج|ev|2||from university
apply|||يتقدم بطلب|bu|2||for the job
interview|||يجري مقابلة|bu|2||the candidates
employ|||يوظف|bu|2||fifty people
retire|||يتقاعد|bu|2||next year
resign|||يستقيل|bu|2||from his job
contact|||يتواصل مع|co,cs|1||the supplier
inform|||يُبلغ|co|2||the staff
request|||يطلب|bu,cs|2||more information
expect|||يتوقع|ft,bu|1||good results
achieve|||يحقق|bu|2||the target
complete|||يكمل / ينجز|of|1||the task
develop|||يطور|bu,te|2||a new app
design|||يصمم|te,bu|2||the new logo
create|||ينشئ / يخلق|bu|1||a new plan
focus|||يركز|bu|2||on quality
handle|||يتعامل مع|cs,bu|2||the complaint
process|||يعالج / يجهز|cs,of|2||the order
record|||يسجل|of|2||the sales
monitor|||يراقب|bu|2||the performance
control|||يتحكم / يراقب|bu|2|d|the costs
maintain|||يحافظ على / يصون|bu|2||the equipment
ship|||يشحن|bu|2|d|the goods
store|||يخزّن|bu|2||the products
supply|||يورّد|bu|2||raw materials
purchase|||يشتري|sh,bu|2||new equipment
refund|||يعيد المبلغ|cs,sh|2||the money
assist|||يساعد|cs|2||the customer
respond|||يستجيب / يرد|cs|2||to the request
appreciate|||يقدّر|ft|2|m|your help
deserve|||يستحق|ft|2|s|a reward
respect|||يحترم|ft|2||his colleagues
trust|||يثق|ft|2||the supplier
doubt|||يشك|ft|2|s|the numbers
admire|||يُعجَب بـ|ft|2||his work
happen|||يحدث|ev|1||
appear|||يظهر / يبدو|ev|2|m|on the screen
sound|||يبدو (من الصوت)|ev|2|s|good
change|||يغيّر / يتغير|ev|1|c|the plan
reach|||يصل / يبلغ|ev|1||the target
cover|||يغطي|ev|2||the costs
add|||يضيف|ev|1||sugar
mix|||يخلط|fo|2||the ingredients
dress|||يرتدي ملابسه|fa|2||quickly
brush|||ينظف بالفرشاة|fa|1||his teeth
shower|||يستحم|fa|1||in the morning
iron|||يكوي|fa|2||his shirt
water|||يسقي|fa|2||the plants
plant|||يزرع|fa|2||trees
hug|||يعانق|fa|2|d|his children
admit|||يعترف|co|2|d|the mistake
refer|||يحيل / يشير|co|2|d|to the report
commit|||يلتزم|bu|2|d|to the plan
regret|||يندم|ft|2|d|the decision
chat|||يدردش|co|1|d|with colleagues
submit|||يقدّم / يسلّم|of|2|d|the application
occur|||يحدث|ev|2|d|
permit|||يسمح|bu|2|d|visitors
jog|||يهرول|mo|2|d|every morning
step|||يخطو|mo|2|d|outside
wrap|||يغلف|sh|2|d|the gift
plug|||يوصل بالكهرباء|te|2|d|in the laptop
grab|||يمسك / يتناول بسرعة|fo|2|d|a sandwich
beg|||يتوسل|co|2|d|for help
ban|||يحظر|bu|2|d|smoking
equip|||يجهّز|bu|2|d|the office
label|||يضع ملصقاً|of|2|d|the boxes
allow|||يسمح|bu|1||photos
enroll|||يسجّل / يلتحق|ev|2||in a course
register|||يسجّل|ev|2||for the conference
attach|||يُرفق|of,te|2||the file
copy|||ينسخ|of,te|1||the file
paste|||يلصق|te|2||the text
log|||يسجل (الدخول)|te|2|d|in to the system
reset|reset|reset|يعيد الضبط|te|2|d|the password
browse|||يتصفح|te,sh|2||the website
fax|||يرسل فاكساً|of|2||the document
file|||يحفظ في ملف|of|2||the papers
sort|||يرتب / يصنف|of|2||the documents
note|||يلاحظ / يدوّن|of|2||the details
list|||يُدرِج في قائمة|of|2||the tasks
estimate|||يقدّر|fi|2||the cost
afford|||يستطيع تحمّل التكلفة|fi|2||a new house
lease|||يؤجّر / يستأجر|fi,bu|2||an office
profit|||يربح|fi|2||from the deal
finance|||يموّل|fi|2||the project
audit|||يدقق الحسابات|fi|2||the accounts
target|||يستهدف|sm|2||young customers
brand|||يضع علامة تجارية|sm|2||the product
attract|||يجذب|sm|2||new customers
convince|||يقنع|sm,co|2||the client
persuade|||يقنع|sm,co|2||the manager
discount|||يخفّض السعر|sm,sh|2||the old stock
welcome|||يرحب|cs,co|1||the guests
explore|||يستكشف|tr|2||the city
tour|||يتجول|tr|2||the factory
wander|||يتجول|tr|2||around the market
dine|||يتناول العشاء|fo|2||at a restaurant
chew|||يمضغ|fo|2||
pour|||يصب|fo|2||the tea
slice|||يقطّع شرائح|fo|2||the bread
heat|||يسخّن|fo|2||the food
`;

export interface Verb {
  base: string;
  v2: string;
  v3: string;
  ing: string;
  s3: string;
  ar: string;
  cats: string[];
  level: 1 | 2;
  irregular: boolean;
  common: boolean;
  stative: 'no' | 'yes' | 'mixed';
  comp: string;
  sRule: 's' | 'es' | 'ies' | 'special';
}

import { ingForm, edForm, thirdPerson, sRuleOf } from '../engine/spelling';

export const VERBS: Verb[] = RAW.trim().split('\n')
  .map((l) => l.split('|'))
  .filter((p) => p[3] && p[3].trim() !== '')
  .map((p) => {
    const [base, v2r, v3r, ar, cats, lvl, flags = '', comp = ''] = p;
    const dbl = flags.includes('d');
    const irregular = !!v2r;
    const reg = edForm(base, dbl);
    return {
      base,
      v2: v2r || reg,
      v3: v3r || reg,
      ing: ingForm(base, dbl),
      s3: thirdPerson(base),
      ar,
      cats: cats.split(','),
      level: (lvl === '2' ? 2 : 1) as 1 | 2,
      irregular,
      common: flags.includes('c'),
      stative: flags.includes('s') ? 'yes' : flags.includes('m') ? 'mixed' : 'no',
      comp,
      sRule: sRuleOf(base),
    } as Verb;
  });

export const VERB_MAP: Record<string, Verb> = Object.fromEntries(VERBS.map((v) => [v.base, v]));

// Notes shown on the verb panel (US variants, pronunciation tips, meaning changes).
export const VERB_NOTES: Record<string, string> = {
  get: 'US English often uses "gotten" as the past participle: "I have gotten". British English uses "got".',
  travel: 'US spelling: traveled, traveling. British spelling doubles the L: travelled, travelling.',
  cancel: 'US spelling: canceled, canceling. British: cancelled, cancelling.',
  label: 'US spelling: labeled, labeling. British: labelled, labelling.',
  practise: 'British English: "practise" is the verb and "practice" is the noun. US English uses "practice" for both.',
  read: 'The spelling stays "read", but the past forms are pronounced "red".',
  learn: 'British English also uses "learnt".',
  spell: 'British English also uses "spelt".',
  be: 'Present: I am / he is / we are. Past: I was, he was, we were. "Be" is both a main verb and a helping verb.',
  have: 'Stative when it means "own": "I have a car" (not "I am having a car"). Dynamic for actions: "I am having lunch."',
  think: 'Stative for opinions: "I think it is good." Dynamic for the mental activity: "I am thinking about the offer."',
  see: 'Stative for sight: "I see the problem." Dynamic for meetings: "I am seeing the doctor tomorrow."',
  feel: 'Both are natural for emotions: "I feel tired" / "I am feeling tired."',
  look: 'Stative when it means "seem": "You look tired." Dynamic for the action: "I am looking at the report."',
  taste: 'Stative for flavour: "It tastes good." Dynamic for the action: "The chef is tasting the soup."',
  smell: 'Stative for a smell: "The coffee smells good." Dynamic for the action: "She is smelling the flowers."',
  depend: 'Usually simple: "It depends on the price." "It is depending" is rare.',
  appear: 'Stative when it means "seem": "He appears tired." Dynamic for showing up: "The logo is appearing on the screen."',
  appreciate: 'Usually simple: "I appreciate your help." In business letters "We are appreciating" is unnatural.',
  lay: 'Do not confuse with "lie" (lie – lay – lain). "Lay" needs an object: "lay the papers on the desk."',
  fly: 'He flies (consonant + y → ies).',
  quit: 'Some speakers also use "quitted" in British English, but "quit" is most common.',
  forecast: '"Forecasted" is also used, but "forecast" is the more common past form.',
  log: 'Usually used as "log in" or "log out": "I logged in to the system."',
};

// British IPA for the core verbs (used by Word of the Day and the verb panel).
export const VERB_IPA: Record<string, string> = {
  work: '/wɜːk/', eat: '/iːt/', go: '/ɡəʊ/', speak: '/spiːk/', buy: '/baɪ/', sell: '/sel/', travel: '/ˈtrævl/', study: '/ˈstʌdi/', write: '/raɪt/',
  call: '/kɔːl/', read: '/riːd/', drink: '/drɪŋk/', play: '/pleɪ/', visit: '/ˈvɪzɪt/', send: '/send/', finish: '/ˈfɪnɪʃ/', start: '/stɑːt/', meet: '/miːt/',
  open: '/ˈəʊpən/', prepare: '/prɪˈpeə(r)/', learn: '/lɜːn/', cook: '/kʊk/', help: '/help/', watch: '/wɒtʃ/', drive: '/draɪv/', sleep: '/sliːp/', live: '/lɪv/',
  ask: '/ɑːsk/', answer: '/ˈɑːnsə(r)/', discuss: '/dɪˈskʌs/', manage: '/ˈmænɪdʒ/', check: '/tʃek/', sign: '/saɪn/', deliver: '/dɪˈlɪvə(r)/', receive: '/rɪˈsiːv/',
  pay: '/peɪ/', wait: '/weɪt/', order: '/ˈɔːdə(r)/', plan: '/plæn/', clean: '/kliːn/',
};
