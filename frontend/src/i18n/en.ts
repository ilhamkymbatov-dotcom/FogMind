/**
 * The English dictionary defines the full key set. The other dictionaries are
 * typed against it, so a missing or extra key in ru or kk is a compile error.
 *
 * Values may contain {placeholders} that call sites replace, since the app has
 * no formatting library.
 */
export const en = {
  'common.loading': 'Loading',
  'common.somethingWrong': 'Something went wrong. Please try again.',
  'common.close': 'Close',

  'lang.label': 'Language',

  // Auth ---------------------------------------------------------------------
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.emailPlaceholder': 'you@example.com',
  'auth.err.enterEmailPassword': 'Please enter your email and password.',
  'auth.err.passwordTooShort': 'Please use a password of at least 6 characters.',
  'auth.err.invalidCredentials': 'That email or password is not correct.',
  'auth.err.emailNotConfirmed': 'Please confirm your email first. Open the link we sent to your inbox.',
  'auth.err.alreadyRegistered': 'An account with this email already exists. Try signing in instead.',
  'auth.err.invalidEmail': 'Please enter a valid email address.',
  'auth.err.rateLimited': 'Too many attempts. Please wait a moment and try again.',
  'auth.err.sessionExpired': 'Your session expired. Please sign in again.',

  'login.title': 'Sign in',
  'login.subtitle': 'Welcome back to FogMind.',
  'login.passwordPlaceholder': 'Your password',
  'login.submit': 'Sign in',
  'login.submitting': 'Signing in',
  'login.footerPrompt': 'New here?',
  'login.footerLink': 'Create an account',

  'signup.title': 'Create your account',
  'signup.subtitle': 'Start turning your material into maps you can learn.',
  'signup.passwordPlaceholder': 'At least 6 characters',
  'signup.displayName': 'Display name (optional)',
  'signup.displayNamePlaceholder': 'How should we greet you',
  'signup.submit': 'Create account',
  'signup.submitting': 'Creating account',
  'signup.footerPrompt': 'Already have an account?',
  'signup.footerLink': 'Sign in',
  'signup.confirmTitle': 'Confirm your email',
  'signup.confirmBody': 'We sent a confirmation link to {email}. Open it to finish setting up your account, then sign in.',
  'signup.confirmFooterPrompt': 'Already confirmed?',
  'signup.confirmFooterLink': 'Sign in',

  // App shell ----------------------------------------------------------------
  'shell.signOut': 'Sign out',
  'shell.signingOut': 'Signing out',
  'shell.home': 'FogMind home',

  // Dashboard ----------------------------------------------------------------
  'dash.signedInAs': 'Signed in as {email}',
  'dash.title': 'Your knowledge maps',
  'dash.upload': 'Upload',
  'dash.loading': 'Loading your documents',
  'dash.errLoad': 'Could not load your documents.',
  'dash.emptyTitle': 'No maps yet',
  'dash.emptyBody': 'Upload a PDF, DOCX, Markdown or text file, or paste your notes, to build your first knowledge map.',
  'dash.rowMeta': '{source} · {count} nodes · {date}',

  'status.pending': 'Pending',
  'status.processing': 'Processing',
  'status.ready': 'Ready',
  'status.failed': 'Failed',
  'source.text': 'Text',

  // Upload modal -------------------------------------------------------------
  'upload.title': 'Add material',
  'upload.tabFile': 'Upload a file',
  'upload.tabPaste': 'Paste text',
  'upload.dropzone': 'Choose a PDF, DOCX, MD or TXT file',
  'upload.pastePlaceholder': 'Paste your notes or article text here',
  'upload.titleLabel': 'Title',
  'upload.titlePlaceholder': 'Give this a name',
  'upload.submit': 'Create map',
  'upload.working': 'Working',
  'upload.statusReading': 'Reading your material',
  'upload.statusBuilding': 'Building your knowledge map',
  'upload.errTitle': 'Please give this a title.',
  'upload.errChooseFile': 'Please choose a file to upload.',
  'upload.errPasteText': 'Please paste some text to map.',
  'upload.errEmpty': 'That material looks empty. Please try a different file or text.',

  // Document detail ----------------------------------------------------------
  'detail.allMaps': 'All maps',
  'detail.mapFallback': 'Map',
  'detail.loading': 'Loading your map',
  'detail.noMap': 'This document has no map yet.',
  'detail.summary': '{mastered} of {total} mastered · {percent}%',
  'detail.review': 'Review questions ({count})',
  'detail.doneNodeTitle': 'Section complete',
  'detail.doneNodeBody': 'The fog has cleared here and connected nodes are ready. Answer every question correctly to master it.',
  'detail.reviewTitle': 'Review round',
  'detail.doneReviewTitle': 'Review complete',
  'detail.doneReviewBody': 'Every question you get right here masters its node and clears more fog.',

  // Question panel -----------------------------------------------------------
  'panel.questionOf': 'Question {n} of {total}',
  'panel.difficulty.1': 'Easy',
  'panel.difficulty.2': 'Medium',
  'panel.difficulty.3': 'Hard',
  'panel.correct': 'Correct',
  'panel.correctShown': 'The correct answer is shown above',
  'panel.finish': 'Finish',
  'panel.next': 'Next question',
  'panel.backToMap': 'Back to the map',
  'panel.noQuestions': 'There are no questions to show.',
  'panel.errSave': 'Could not save your answer.',

  // Graph --------------------------------------------------------------------
  'graph.mapLabel': 'Knowledge map',
  'graph.open': 'Open {title}',
  'graph.answered': '{answered} of {total} answered',
  'graph.zoomIn': 'Zoom in',
  'graph.zoomOut': 'Zoom out',
  'graph.panHint': 'Drag to pan, scroll or pinch to zoom',

  // Errors thrown from the data layer ----------------------------------------
  'err.unsupportedFile': 'Unsupported file type. Please upload a PDF, DOCX, MD or TXT file.',
  'err.readFile': 'Could not read that file. It may be corrupted or protected.',
  'err.noContent': 'We could not find any readable content to map in that document.',
  'err.docNotFound': 'That document was not found.',
  'err.loadMap': 'Could not load this map.',

  // Landing: navigation and shared chrome -------------------------------------
  'nav.home': 'Home',
  'nav.howItWorks': 'How it works',
  'nav.product': 'Product',
  'nav.getStarted': 'Get started',
  'nav.menu': 'Menu',

  // Landing: home page --------------------------------------------------------
  'hero.title': 'Turn any material into a map you can actually learn',
  'hero.subtitle':
    'FogMind turns your study material into an interactive knowledge graph. Answer questions to clear the fog and watch your understanding grow.',
  'hero.primary': 'Get started',
  'hero.secondary': 'See how it works',

  'home.hiw.heading': 'The process',
  'home.hiw.line':
    'Upload your material and watch it turn into a map you clear one concept at a time.',
  'home.hiw.link': 'See how it works',

  'home.product.heading': 'The product',
  'home.product.line':
    'A living knowledge graph, questions drawn from your own pages, and mastery you can watch spread.',
  'home.product.link': 'Explore the product',

  'cta.title': 'Ready to clear the fog',
  'cta.button': 'Get started',

  'footer.tagline': 'Learning you can see.',
  'footer.home': 'Home',
  'footer.howItWorks': 'How it works',
  'footer.product': 'Product',

  // Landing: how it works page ------------------------------------------------
  'hiw.hero.title': 'How FogMind works',
  'hiw.hero.subtitle': 'From a file to a living map of your knowledge in minutes.',
  'hiw.upload.title': 'Upload your material',
  'hiw.upload.body':
    'Start with what you already have. Lecture notes, a textbook chapter, a dense article, whatever you are studying goes straight in.',
  'hiw.reads.title': 'Your material is read and structured',
  'hiw.reads.body':
    'FogMind finds the topics inside your material and how they relate to each other, then turns that structure into something you can see.',
  'hiw.map.title': 'Your knowledge map appears',
  'hiw.map.body':
    'Every concept becomes a node, every relationship a connection. You see the whole subject at a glance instead of a wall of pages.',
  'hiw.fog.title': 'Clear the fog',
  'hiw.fog.body':
    'New nodes start hidden in fog. Answer questions from your material about a concept to reveal it, keep answering to master it.',
  'hiw.fog.stage1': 'Fogged',
  'hiw.fog.stage2': 'Answer questions',
  'hiw.fog.stage3': 'Mastered',
  'hiw.adaptive.title': 'Your progress is saved',
  'hiw.adaptive.body':
    'Every answer is remembered. Leave and come back, and your map waits exactly where you left it, fog and all.',

  // Landing: product page -----------------------------------------------------
  'product.hero.title': 'Everything you need to actually learn',
  'product.hero.subtitle':
    'Not another flashcard app. A map of what you know and what is still in the fog.',
  'product.graph.title': 'Interactive knowledge graph',
  'product.graph.body':
    'Your material becomes a spatial map of connected concepts you can explore, rearrange and grow.',
  'product.questions.title': 'Questions from your material',
  'product.questions.body':
    'Every node comes with questions written from your own material, in multiple formats from free recall to multiple choice.',
  'product.fog.title': 'The fog mechanic',
  'product.fog.body':
    'Review stops being a chore. Revealing the map piece by piece turns studying into a game you want to keep playing.',
  'product.adaptive.title': 'Adaptive difficulty',
  'product.adaptive.body':
    'The system watches how you answer and tunes the challenge, so you are always stretched but never stuck.',
  'product.progress.title': 'Visual progress',
  'product.progress.body':
    'Mastery is not a number in a table. You watch it spread across your map as the fog lifts node by node.',
  'product.formats.title': 'Any material in',
  'product.formats.body':
    'Bring files as they are. FogMind takes PDF, DOCX, Markdown and plain text with no conversion dance.',
  'product.formats.plain': 'Plain text',

  // Landing: eyebrow labels and the warmer supporting copy ---------------------
  'hero.eyebrow': 'Your material, mapped',
  'hero.demoCaption': 'Answer a question and the fog lifts around what you just learned',

  'home.card1.title': 'See the whole subject',
  'home.card2.title': 'Questions from your own pages',
  'home.card3.title': 'Progress you can watch',



  'home.explore.eyebrow': 'Look closer',
  'cta.body': 'Bring a chapter, a lecture or a pile of notes. Your first map takes a couple of minutes.',

  'hiw.hero.eyebrow': 'How it works',
  'hiw.intake.eyebrow': 'Step one',
  'hiw.intake.title': 'Bring what you already have',
  'hiw.intake.body':
    'Drop in a PDF, a DOCX, some Markdown or a block of pasted notes. FogMind reads it, finds the topics inside and lays them out as a map you can start clearing straight away.',

  'product.hero.eyebrow': 'The product',
  'product.more.eyebrow': 'And the rest',
  'product.more.title': 'Details that keep you going',

  // Landing: the looping product demos ----------------------------------------
  'demo.q.prompt': 'Photosynthesis happens inside the _____ of a leaf cell.',
  'demo.q.a1': 'Ribosome',
  'demo.q.a2': 'Chloroplast',
  'demo.q.a3': 'Nucleus',
  'demo.q.answer': 'chloroplast',
  'demo.upload.file': 'Lecture notes.pdf',

  // Landing: page specific structure ------------------------------------------
  'home.mood.eyebrow': 'The idea',
  'home.mood.title': 'Everything starts in the fog',
  'home.mood.body':
    'A new subject is a white sheet you cannot read yet. FogMind gives it shape, then hands you the way through: answer what you know, and the mist pulls back to show what comes next.',

  'product.gallery.eyebrow': 'Explore',
  'product.gallery.title': 'Pick a capability and watch it run',

  'hiw.stepN': 'Step {n}',

  // Navigation for seven pages -------------------------------------------------
  'nav.who': 'Who it is for',
  'nav.why': 'Why it works',
  'nav.about': 'About',
  'nav.faq': 'Questions',
  'footer.colExplore': 'Explore',
  'footer.colMore': 'More',

  // Who it is for: audiences and situations only -------------------------------
  'who.hero.eyebrow': 'Who it is for',
  'who.hero.title': 'Different lives, the same wall',
  'who.hero.subtitle':
    'Studying looks nothing alike at sixteen and at thirty. These are the situations FogMind was shaped around.',

  'who.p1.role': 'School student',
  'who.p1.when': 'The chapter is due tomorrow',
  'who.p1.situation':
    'It is late, there are thirty pages of biology, and reading them twice has not made any of it stay. The panic is not about effort. It is about not knowing which parts actually matter.',
  'who.p1.outcome':
    'The night stops being one wall of text and becomes a short list of things to clear, in an order that makes sense.',

  'who.p2.role': 'University student',
  'who.p2.when': 'A semester of lecture notes',
  'who.p2.situation':
    'Twelve weeks of slides and scribbles, none of it joined up, and an exam that will ask how the pieces relate rather than what week four happened to say.',
  'who.p2.outcome':
    'The term stops being a folder and becomes one structure, so revision starts from the shape of the subject instead of page one again.',

  'who.p3.role': 'Exam candidate',
  'who.p3.when': 'Months out from the big one',
  'who.p3.situation':
    'The date is far enough away that nothing feels urgent and close enough to sit in the back of your mind. The hard part is knowing what to do on an ordinary Tuesday.',
  'who.p3.outcome':
    'Every session has an obvious next move, and the months accumulate into something you can point at rather than blurring together.',

  'who.p4.role': 'Self learner',
  'who.p4.when': 'A hard book and nobody to ask',
  'who.p4.situation':
    'Working through something difficult alone, with no lecturer, no seminar, and no one to tell you whether any of it actually landed.',
  'who.p4.outcome':
    'The material starts asking you the questions, so understanding gets checked instead of assumed.',

  'who.p5.role': 'Working professional',
  'who.p5.when': 'A certification around a full job',
  'who.p5.situation':
    'Studying happens in the gaps: a commute, half a lunch break, an hour once the house is quiet. The thing that keeps breaking is momentum.',
  'who.p5.outcome':
    'Twenty minutes is worth spending, because every session picks up exactly where the last one stopped.',

  'who.next.title': 'See what you would actually be using',
  'who.next.body': 'Every capability behind these situations is shown, running, on the product page.',
  'who.next.link': 'Explore the product',

  // Why it works: the learning science, no interface ---------------------------
  'why.hero.eyebrow': 'Why it works',
  'why.hero.title': 'The thinking behind the method',
  'why.hero.subtitle':
    'FogMind rests on a few findings about memory that have held up for a long time. Here they are plainly, with no product talk.',

  'why.lead':
    'Studying tends to fail in a predictable way. It feels productive while it is happening and leaves almost nothing behind a week later. The reason is uncomfortable: comfort and learning pull in opposite directions, and the methods that feel smoothest are usually the ones doing the least work.',

  'why.p1.title': 'Retrieving beats reviewing',
  'why.p1.fails':
    'Rereading a page makes it familiar, and familiarity feels exactly like knowledge from the inside. That is the trap. Recognising a sentence when it is in front of you is a different skill from producing the idea when it is not.',
  'why.p1.holds':
    'Pulling something out of memory strengthens it far more than putting it in again. The effort of retrieval is the part doing the work, which is why it feels harder and returns more.',
  'why.p1.us': 'Nothing here can be finished by reading. Progress only comes from producing an answer.',
  'why.p1.a': 'Reading again',
  'why.p1.b': 'Recalling',

  'why.p2.title': 'Spacing beats cramming',
  'why.p2.fails':
    'One long session can carry you to an exam the next morning and very little further. Everything packed in together also decays together.',
  'why.p2.holds':
    'The same total hours, spread out and revisited as memory begins to fade, produce something durable. Forgetting a little before you return is not wasted time. It is what makes the return count.',
  'why.p2.us':
    'The design assumes you will forget, and plans for the return rather than treating it as a failure.',
  'why.p2.a': 'One long block',
  'why.p2.b': 'Spread out',

  'why.p3.title': 'Structure beats a list',
  'why.p3.fails':
    'Facts held as a flat list have nothing holding them up. Recall one and nothing else arrives with it, so the whole subject has to be carried by effort alone.',
  'why.p3.holds':
    'Connected knowledge behaves differently. Each idea is reachable from several directions, and understanding one part makes its neighbours easier to place and much harder to lose.',
  'why.p3.us': 'Material is never presented as a flat list. It arrives with its relationships intact.',
  'why.p3.a': 'Loose facts',
  'why.p3.b': 'Connected',

  'why.p4.title': 'Seeing progress is what keeps you going',
  'why.p4.fails':
    'The honest problem with studying alone is not knowing whether it is working. Effort with no visible result is the fastest route to stopping.',
  'why.p4.holds':
    'Progress you can see changes the arithmetic of starting. A session that visibly moves something is worth beginning, and the one after it is easier to begin than the last.',
  'why.p4.us': 'Effort is always tied to something you can watch change.',
  'why.p4.a': 'No signal',
  'why.p4.b': 'Visible',

  'why.quote': 'If studying feels easy, that is usually the sound of nothing being learned.',

  'why.next.title': 'How this becomes a study session',
  'why.next.body': 'The mechanics, step by step, are on the how it works page.',
  'why.next.link': 'See how it works',

  // About: the story and the philosophy ----------------------------------------
  'about.hero.eyebrow': 'About',
  'about.hero.title': 'Why this exists',
  'about.hero.subtitle': 'A short note on what FogMind is for, and the belief sitting underneath it.',

  'about.s1.label': 'The start',
  'about.s1.body':
    'I built FogMind because I kept watching people work hard and get very little back. Hours with a highlighter, a chapter read three times, then a blank page when it counted. The effort was never the problem. The effort was going somewhere that could not hold it.',

  'about.s2.label': 'The belief',
  'about.s2.body':
    'Understanding is not a pile of facts you accumulate. It is a shape you build, and it is strongest where the pieces touch. If that is true, the job of a study tool is not to store more on your behalf. It is to help you build the shape, and to be straight with you about where it is still thin.',

  'about.s3.label': 'Why fog',
  'about.s3.body':
    'The metaphor arrived before the product did. Fog is simply the most honest description of a new subject: you can tell something is there, you just cannot make out the edges yet. What decided it was that fog does not flatter you. It does not lift because you looked at it, and it does not pretend a place is clear when you have never been there. It clears where you have actually walked. That is the fairest picture of your own understanding I could find.',

  'about.s4.label': 'What it is not',
  'about.s4.body':
    'It is not a place to keep notes, and it is not trying to make studying effortless. Effortless studying does not work, and anything promising it is selling comfort instead of learning. This is meant to make the effort land somewhere.',

  'about.s5.label': 'Where it is going',
  'about.s5.body':
    'It is early, and I would rather say so. The map, the questions and the progress all work today. The next stretch is about the material itself: richer kinds of question, better handling of long and messy sources, and shared maps so a class or a study group can clear one together. It will keep being built by someone who studies, for people who do.',

  'about.pull': 'Fog clears where you have actually walked, and stays where you have not.',

  'about.next.title': 'The reasoning, in more detail',
  'about.next.body': 'The findings this is built on are set out on the why it works page.',
  'about.next.link': 'Read why it works',

  // Questions: practical answers only ------------------------------------------
  'faq.hero.eyebrow': 'Questions',
  'faq.hero.title': 'The practical answers',
  'faq.hero.subtitle':
    'What FogMind does today, in plain terms. If anything here reads as unclear, that is worth fixing.',

  'faq.g1': 'Getting started',
  'faq.g2': 'Your material',
  'faq.g3': 'Practical matters',

  'faq.q1': 'How do I start?',
  'faq.a1':
    'Create an account, add one piece of material, and your first map is a couple of minutes away. There is nothing to install and nothing to set up first.',
  'faq.q2': 'Which formats can I bring?',
  'faq.a2':
    'PDF, DOCX, Markdown and plain text files, or you can paste text straight in. Notes sitting in a document somewhere are already enough to start.',
  'faq.q3': 'How long does processing take?',
  'faq.a3':
    'Seconds for most material. The reading and the mapping both happen in your own browser, so there is no queue to wait in. A long PDF takes a little longer, because pulling the text out of it is the slow part.',

  'faq.q4': 'What happens to the material I add?',
  'faq.a4':
    'The file itself never leaves your browser. It is read and mapped on your own machine, and what gets saved to your account is the result: the topics, the links between them, the questions and your progress. The original document is never uploaded or stored.',
  'faq.q5': 'Is my material private?',
  'faq.a5':
    'Yes. Everything saved belongs to your account and the database enforces that row by row, so no other account can reach your documents, maps or answers. Nothing you bring is used to train anything, and nothing is shared.',
  'faq.q6': 'Does it work in languages other than English?',
  'faq.a6':
    'The interface is in English, Russian and Kazakh, and material in those three is handled properly. Text in other languages will still be mapped, because the analysis works from the text itself, and questions come back in the language you brought.',

  'faq.q7': 'Is my progress saved?',
  'faq.a7':
    'Yes. Every answer is recorded against your account, so you can close the tab and return to a map exactly as you left it, the cleared parts and the fog alike.',
  'faq.q8': 'What does it cost?',
  'faq.a8':
    'Nothing at the moment. FogMind is early and free to use while it is being built, with no card required. If that ever changes, it will not change quietly.',

  'faq.next.title': 'Still curious how it actually works',
  'faq.next.body': 'The whole process, from a file to a cleared map, is on the how it works page.',
  'faq.next.link': 'See how it works',
} as const

export type TranslationKey = keyof typeof en
export type Dictionary = Record<TranslationKey, string>
