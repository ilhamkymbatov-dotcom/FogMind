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

  'home.cards.eyebrow': 'Why it works',
  'home.cards.title': 'Studying that feels like progress',
  'home.card1.title': 'See the whole subject',
  'home.card1.body':
    'Every topic and the links between them, laid out as one map you can take in at a glance.',
  'home.card2.title': 'Questions from your own pages',
  'home.card2.body':
    'Nothing generic. Every question comes from the material you brought, so revision always feels relevant.',
  'home.card3.title': 'Progress you can watch',
  'home.card3.body':
    'The fog thins where you are confident, so you always know what to study next.',

  'home.answer.eyebrow': 'Answer and reveal',
  'home.answer.title': 'One question at a time, no pressure',
  'home.answer.body':
    'Each node asks a few questions drawn from your material. Answer them and the topic opens up, along with everything it connects to. Miss one and it simply waits for you in the review round.',

  'home.progress.eyebrow': 'Watch it spread',
  'home.progress.title': 'Mastery you can actually see',
  'home.progress.body':
    'Every correct answer masters a node and clears a little more of the map. Come back tomorrow and it is exactly where you left it.',

  'home.explore.eyebrow': 'Look closer',
  'cta.body': 'Bring a chapter, a lecture or a pile of notes. Your first map takes a couple of minutes.',

  'hiw.hero.eyebrow': 'How it works',
  'hiw.intake.eyebrow': 'Step one',
  'hiw.intake.title': 'Bring what you already have',
  'hiw.intake.body':
    'Drop in a PDF, a DOCX, some Markdown or a block of pasted notes. FogMind reads it, finds the topics inside and lays them out as a map you can start clearing straight away.',
  'hiw.saved.eyebrow': 'It keeps up with you',

  'product.hero.eyebrow': 'The product',
  'product.graph.eyebrow': 'The map',
  'product.questions.eyebrow': 'The questions',
  'product.progress.eyebrow': 'The progress',
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
} as const

export type TranslationKey = keyof typeof en
export type Dictionary = Record<TranslationKey, string>
