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
} as const

export type TranslationKey = keyof typeof en
export type Dictionary = Record<TranslationKey, string>
