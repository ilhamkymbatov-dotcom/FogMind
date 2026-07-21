import type { Dictionary } from './en'

export const kk: Dictionary = {
  'common.loading': 'Жүктелуде',
  'common.somethingWrong': 'Бірдеңе дұрыс болмады. Қайталап көріңіз.',
  'common.close': 'Жабу',

  'lang.label': 'Тіл',

  'auth.email': 'Электрондық пошта',
  'auth.password': 'Құпия сөз',
  'auth.emailPlaceholder': 'you@example.com',
  'auth.err.enterEmailPassword': 'Пошта мен құпия сөзді енгізіңіз.',
  'auth.err.passwordTooShort': 'Кемінде 6 таңбадан тұратын құпия сөз қолданыңыз.',
  'auth.err.invalidCredentials': 'Пошта немесе құпия сөз қате.',
  'auth.err.emailNotConfirmed': 'Алдымен поштаңызды растаңыз. Хаттағы сілтемені ашыңыз.',
  'auth.err.alreadyRegistered': 'Мұндай поштамен аккаунт бар. Кіріп көріңіз.',
  'auth.err.invalidEmail': 'Дұрыс пошта мекенжайын енгізіңіз.',
  'auth.err.rateLimited': 'Тым көп әрекет. Сәл күтіп, қайталаңыз.',
  'auth.err.sessionExpired': 'Сеанс аяқталды. Қайта кіріңіз.',

  'login.title': 'Кіру',
  'login.subtitle': 'FogMind жүйесіне қош келдіңіз.',
  'login.passwordPlaceholder': 'Құпия сөзіңіз',
  'login.submit': 'Кіру',
  'login.submitting': 'Кіру',
  'login.footerPrompt': 'Алғаш рет келдіңіз бе?',
  'login.footerLink': 'Аккаунт құру',

  'signup.title': 'Аккаунт құрыңыз',
  'signup.subtitle': 'Материалдарыңызды үйренуге ыңғайлы картаға айналдыра бастаңыз.',
  'signup.passwordPlaceholder': 'Кемінде 6 таңба',
  'signup.displayName': 'Көрсетілетін атау (міндетті емес)',
  'signup.displayNamePlaceholder': 'Сізге қалай жүгінейік',
  'signup.submit': 'Аккаунт құру',
  'signup.submitting': 'Аккаунт құрылуда',
  'signup.footerPrompt': 'Аккаунтыңыз бар ма?',
  'signup.footerLink': 'Кіру',
  'signup.confirmTitle': 'Поштаңызды растаңыз',
  'signup.confirmBody': 'Растау сілтемесін {email} мекенжайына жібердік. Аккаунтты аяқтау үшін оны ашып, содан кейін кіріңіз.',
  'signup.confirmFooterPrompt': 'Растап қойдыңыз ба?',
  'signup.confirmFooterLink': 'Кіру',

  'shell.signOut': 'Шығу',
  'shell.signingOut': 'Шығу',
  'shell.home': 'FogMind басты беті',

  'dash.signedInAs': '{email} ретінде кірдіңіз',
  'dash.title': 'Білім карталарыңыз',
  'dash.upload': 'Жүктеу',
  'dash.loading': 'Құжаттар жүктелуде',
  'dash.errLoad': 'Құжаттарды жүктеу мүмкін болмады.',
  'dash.emptyTitle': 'Әзірге карта жоқ',
  'dash.emptyBody': 'Алғашқы білім картасын құру үшін PDF, DOCX, Markdown немесе мәтін файлын жүктеңіз не жазбаларыңызды қойыңыз.',
  'dash.rowMeta': '{source} · түйіндер: {count} · {date}',

  'status.pending': 'Кезекте',
  'status.processing': 'Өңделуде',
  'status.ready': 'Дайын',
  'status.failed': 'Қате',
  'source.text': 'Мәтін',

  'upload.title': 'Материал қосу',
  'upload.tabFile': 'Файл жүктеу',
  'upload.tabPaste': 'Мәтін қою',
  'upload.dropzone': 'PDF, DOCX, MD немесе TXT файлын таңдаңыз',
  'upload.pastePlaceholder': 'Жазбаларыңызды немесе мақала мәтінін осында қойыңыз',
  'upload.titleLabel': 'Атауы',
  'upload.titlePlaceholder': 'Атау беріңіз',
  'upload.submit': 'Карта құру',
  'upload.working': 'Өңделуде',
  'upload.statusReading': 'Материалыңыз оқылуда',
  'upload.statusBuilding': 'Білім картасы құрылуда',
  'upload.errTitle': 'Атау беріңіз.',
  'upload.errChooseFile': 'Жүктейтін файлды таңдаңыз.',
  'upload.errPasteText': 'Картаға арналған мәтінді қойыңыз.',
  'upload.errEmpty': 'Материал бос сияқты. Басқа файл немесе мәтін байқап көріңіз.',

  'detail.allMaps': 'Барлық карталар',
  'detail.mapFallback': 'Карта',
  'detail.loading': 'Карта жүктелуде',
  'detail.noMap': 'Бұл құжатта әзірге карта жоқ.',
  'detail.summary': '{total} ішінен {mastered} меңгерілді · {percent}%',
  'detail.review': 'Сұрақтарды қайталау ({count})',
  'detail.doneNodeTitle': 'Бөлім аяқталды',
  'detail.doneNodeBody': 'Мұнда тұман сейілді, байланысқан түйіндер дайын. Түйінді меңгеру үшін барлық сұраққа дұрыс жауап беріңіз.',
  'detail.reviewTitle': 'Қайталау раунды',
  'detail.doneReviewTitle': 'Қайталау аяқталды',
  'detail.doneReviewBody': 'Мұндағы әрбір дұрыс жауап түйінді меңгеріп, тұманды одан әрі сейілтеді.',

  'panel.questionOf': 'Сұрақ {n} / {total}',
  'panel.difficulty.1': 'Оңай',
  'panel.difficulty.2': 'Орташа',
  'panel.difficulty.3': 'Қиын',
  'panel.correct': 'Дұрыс',
  'panel.correctShown': 'Дұрыс жауап жоғарыда көрсетілген',
  'panel.finish': 'Аяқтау',
  'panel.next': 'Келесі сұрақ',
  'panel.backToMap': 'Картаға оралу',
  'panel.noQuestions': 'Көрсететін сұрақ жоқ.',
  'panel.errSave': 'Жауабыңызды сақтау мүмкін болмады.',

  'graph.mapLabel': 'Білім картасы',
  'graph.open': '{title} ашу',
  'graph.answered': '{total} ішінен {answered} жауап берілді',
  'graph.zoomIn': 'Үлкейту',
  'graph.zoomOut': 'Кішірейту',
  'graph.panHint': 'Жылжыту үшін сүйреңіз, масштаб үшін дөңгелек не шымшу',

  'err.unsupportedFile': 'Қолдау көрсетілмейтін файл түрі. PDF, DOCX, MD немесе TXT жүктеңіз.',
  'err.readFile': 'Файлды оқу мүмкін болмады. Бүлінген немесе қорғалған болуы мүмкін.',
  'err.noContent': 'Бұл құжаттан картаға арналған оқылатын мазмұн табылмады.',
  'err.docNotFound': 'Құжат табылмады.',
  'err.loadMap': 'Картаны жүктеу мүмкін болмады.',

  // Landing: navigation and shared chrome -------------------------------------
  'nav.home': 'Басты бет',
  'nav.howItWorks': 'Қалай жұмыс істейді',
  'nav.product': 'Өнім',
  'nav.getStarted': 'Бастау',
  'nav.menu': 'Мәзір',

  // Landing: home page --------------------------------------------------------
  'hero.title': 'Кез келген материалды үйренуге ыңғайлы картаға айналдырыңыз',
  'hero.subtitle':
    'FogMind оқу материалдарыңызды интерактивті білім графына айналдырады. Сұрақтарға жауап беріп, тұманды сейілтіңіз және түсінігіңіздің өсуін бақылаңыз.',
  'hero.primary': 'Бастау',
  'hero.secondary': 'Қалай жұмыс істейтінін көру',

  'home.hiw.heading': 'Үдеріс',
  'home.hiw.line':
    'Материалды жүктеңіз де, оның ұғым артынан ұғым ашатын картаға айналғанын бақылаңыз.',
  'home.hiw.link': 'Қалай жұмыс істейтінін көру',

  'home.product.heading': 'Өнім',
  'home.product.line':
    'Тірі білім графы, өз беттеріңізден алынған сұрақтар және картада көрінетін меңгеру.',
  'home.product.link': 'Өнімді ашу',

  'cta.title': 'Тұманды сейілтуге дайынсыз ба',
  'cta.button': 'Бастау',

  'footer.tagline': 'Көзге көрінетін оқу.',
  'footer.home': 'Басты бет',
  'footer.howItWorks': 'Қалай жұмыс істейді',
  'footer.product': 'Өнім',

  // Landing: how it works page ------------------------------------------------
  'hiw.hero.title': 'FogMind қалай жұмыс істейді',
  'hiw.hero.subtitle': 'Файлдан білім картасына дейін бірнеше минут ішінде.',
  'hiw.upload.title': 'Материалыңызды жүктеңіз',
  'hiw.upload.body':
    'Қолыңызда барынан бастаңыз. Дәріс конспектісі, оқулық тарауы, қомақты мақала, не оқып жүрсеңіз, соның бәрі тікелей енеді.',
  'hiw.reads.title': 'Материалыңыз оқылып, құрылымдалады',
  'hiw.reads.body':
    'FogMind материалдағы тақырыптарды және олардың арасындағы байланыстарды тауып, бұл құрылымды көзбен көруге болатын түрге келтіреді.',
  'hiw.map.title': 'Білім картаңыз пайда болады',
  'hiw.map.body':
    'Әр ұғым түйінге, әр байланыс қосылымға айналады. Беттер қабырғасының орнына бүкіл пәнді бірден көресіз.',
  'hiw.fog.title': 'Тұманды сейілтіңіз',
  'hiw.fog.body':
    'Жаңа түйіндер тұманда жасырулы. Ұғымды ашу үшін материалыңыз бойынша сұрақтарға жауап беріңіз, оны меңгеру үшін жауап беруді жалғастырыңыз.',
  'hiw.fog.stage1': 'Тұманда',
  'hiw.fog.stage2': 'Сұрақтарға жауап беріңіз',
  'hiw.fog.stage3': 'Меңгерілді',
  'hiw.adaptive.title': 'Прогресіңіз сақталады',
  'hiw.adaptive.body':
    'Әр жауап есте сақталады. Кетіп қайта оралсаңыз, картаңыз тұманымен қоса дәл тоқтаған жеріңізде күтіп тұрады.',

  // Landing: product page -----------------------------------------------------
  'product.hero.title': 'Шын мәнінде үйренуге қажеттінің бәрі',
  'product.hero.subtitle':
    'Кезекті карточка қосымшасы емес. Нені білетініңіздің және ненің әлі тұманда екенінің картасы.',
  'product.graph.title': 'Интерактивті білім графы',
  'product.graph.body':
    'Материал зерттеуге, өзгертуге және кеңейтуге болатын байланысқан ұғымдардың кеңістіктік картасына айналады.',
  'product.questions.title': 'Материалыңыз бойынша сұрақтар',
  'product.questions.body':
    'Әр түйінге өз материалыңыз бойынша әртүрлі форматтағы сұрақтар бар, еркін жауаптан нұсқа таңдауға дейін.',
  'product.fog.title': 'Тұман механикасы',
  'product.fog.body':
    'Қайталау жалықтырмайды. Картаны бөлікпен ашу оқуды қайта оралғыңыз келетін ойынға айналдырады.',
  'product.adaptive.title': 'Бейімделгіш күрделілік',
  'product.adaptive.body':
    'Жүйе жауаптарыңызды бақылап, деңгейді қиын, бірақ шамаңыз жететіндей етіп баптайды.',
  'product.progress.title': 'Көрнекі прогресс',
  'product.progress.body':
    'Меңгеру кестедегі сан емес. Тұман түйін сайын сейілген сайын оның карта бойынша таралғанын көресіз.',
  'product.formats.title': 'Кез келген материал',
  'product.formats.body':
    'Файлдарды сол күйінде жүктеңіз. FogMind PDF, DOCX, Markdown және қарапайым мәтінді артық түрлендірусіз қабылдайды.',
  'product.formats.plain': 'Қарапайым мәтін',

  // Landing: eyebrow labels and the warmer supporting copy ---------------------
  'hero.eyebrow': 'Материалыңыз картада',
  'hero.demoCaption': 'Сұраққа жауап беріңіз, үйренгеніңіздің айналасындағы тұман сейіледі',

  'home.cards.eyebrow': 'Неліктен тиімді',
  'home.cards.title': 'Прогресі көрінетін оқу',
  'home.card1.title': 'Бүкіл пән көз алдыңызда',
  'home.card1.body':
    'Барлық тақырып және олардың байланысы бір картада, бір қарағанда түсінікті.',
  'home.card2.title': 'Өз беттеріңіз бойынша сұрақтар',
  'home.card2.body':
    'Жалпылама ештеңе жоқ. Әр сұрақ өз материалыңыздан алынған, сондықтан қайталау әрқашан орынды.',
  'home.card3.title': 'Көрінетін прогресс',
  'home.card3.body':
    'Сенімді жеріңізде тұман сирейді, келесі не оқу керегі әрқашан белгілі.',

  'home.answer.eyebrow': 'Жауап беріп ашыңыз',
  'home.answer.title': 'Бір сұрақтан, асықпай',
  'home.answer.body':
    'Әр түйінде материалыңыз бойынша бірнеше сұрақ бар. Оларға жауап берсеңіз, тақырып өзіне байланысты бәрімен бірге ашылады. Қателессеңіз, сұрақ қайталау раундында сізді тыныш күтеді.',

  'home.progress.eyebrow': 'Таралуын бақылаңыз',
  'home.progress.title': 'Шынымен көрінетін меңгеру',
  'home.progress.body':
    'Әр дұрыс жауап түйінді меңгеріп, тұманды тағы сәл сейілтеді. Ертең оралсаңыз, карта дәл қалдырған жеріңізде тұрады.',

  'home.explore.eyebrow': 'Жақынырақ қараңыз',
  'cta.body': 'Бір тарауды, дәрісті немесе конспект жинағын алыңыз. Алғашқы карта бірнеше минут алады.',

  'hiw.hero.eyebrow': 'Қалай жұмыс істейді',
  'hiw.intake.eyebrow': 'Бірінші қадам',
  'hiw.intake.title': 'Қолыңызда барынан бастаңыз',
  'hiw.intake.body':
    'PDF, DOCX, Markdown жүктеңіз немесе конспект қойыңыз. FogMind материалды оқып, ішіндегі тақырыптарды тауып, бірден тазарта бастауға болатын картаға жаяды.',
  'hiw.saved.eyebrow': 'Жүйе сізді есте сақтайды',

  'product.hero.eyebrow': 'Өнім',
  'product.graph.eyebrow': 'Карта',
  'product.questions.eyebrow': 'Сұрақтар',
  'product.progress.eyebrow': 'Прогресс',
  'product.more.eyebrow': 'Қалғаны',
  'product.more.title': 'Тастап кетпеуге көмектесетін бөлшектер',

  // Landing: the looping product demos ----------------------------------------
  'demo.q.prompt': 'Фотосинтез жапырақ жасушасының _____ жүреді.',
  'demo.q.a1': 'Рибосома',
  'demo.q.a2': 'Хлоропласт',
  'demo.q.a3': 'Ядро',
  'demo.q.answer': 'хлоропластында',
  'demo.upload.file': 'Дәріс конспектісі.pdf',

  // Landing: page specific structure ------------------------------------------
  'home.mood.eyebrow': 'Идея',
  'home.mood.title': 'Бәрі тұманнан басталады',
  'home.mood.body':
    'Жаңа пән әзірге оқи алмайтын ақ парақ іспетті. FogMind оған пішін беріп, жолды көрсетеді: білетініңізге жауап беріңіз, тұман шегініп, келесі не екенін ашады.',

  'product.gallery.eyebrow': 'Зерттеңіз',
  'product.gallery.title': 'Мүмкіндікті таңдап, жұмысын көріңіз',

  'hiw.stepN': '{n} қадам',
}
