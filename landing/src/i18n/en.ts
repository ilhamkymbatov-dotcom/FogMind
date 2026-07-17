/**
 * The English dictionary defines the full key set. The other dictionaries are
 * typed against it, so a missing or extra key in ru or kk is a compile error.
 */
export const en = {
  'nav.home': 'Home',
  'nav.howItWorks': 'How it works',
  'nav.product': 'Product',
  'nav.getStarted': 'Get started',

  'hero.title': 'Turn any material into a map you can actually learn',
  'hero.subtitle':
    'FogMind turns your PDFs, DOCX, Markdown and plain text into an interactive knowledge graph. Answer questions to clear the fog and watch your understanding grow.',
  'hero.primary': 'Get started',
  'hero.secondary': 'See how it works',

  'steps.title': 'How it works',
  'steps.upload.title': 'Upload your material',
  'steps.upload.body': 'Drop in a PDF, DOCX, Markdown or plain text file.',
  'steps.map.title': 'We build your knowledge map',
  'steps.map.body': 'AI extracts the key concepts and connects them into a graph.',
  'steps.clear.title': 'Clear the fog by answering',
  'steps.clear.body': 'Answer questions on each concept to reveal the map piece by piece.',

  'features.title': 'Built for real learning',
  'features.questions.title': 'AI generated questions',
  'features.questions.body': 'Every concept comes with questions written from your own material.',
  'features.adaptive.title': 'Adaptive difficulty',
  'features.adaptive.body': 'Questions grow harder as you improve, so you are always challenged.',
  'features.progress.title': 'Visual progress',
  'features.progress.body': 'The fog lifts as you learn, so you always see what is left.',

  'cta.title': 'Ready to clear the fog',
  'cta.button': 'Get started',

  'footer.tagline': 'Learning you can see.',
  'footer.home': 'Home',
  'footer.howItWorks': 'How it works',
  'footer.product': 'Product',

  'placeholder.howItWorks': 'A detailed walkthrough is coming in the next phase.',
  'placeholder.product': 'The full product story is coming in the next phase.',
} as const

export type TranslationKey = keyof typeof en
export type Dictionary = Record<TranslationKey, string>
