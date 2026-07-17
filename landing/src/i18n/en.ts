/**
 * The English dictionary defines the full key set. The other dictionaries are
 * typed against it, so a missing or extra key in ru or kk is a compile error.
 */
export const en = {
  'nav.home': 'Home',
  'nav.howItWorks': 'How it works',
  'nav.product': 'Product',
  'nav.getStarted': 'Get started',
  'nav.menu': 'Menu',

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

  'hiw.hero.title': 'How FogMind works',
  'hiw.hero.subtitle': 'From a file to a living map of your knowledge in minutes.',
  'hiw.upload.title': 'Upload your material',
  'hiw.upload.body':
    'Start with what you already have. FogMind reads PDF, DOCX, Markdown and plain text, so lecture notes, textbooks and articles all fit.',
  'hiw.reads.title': 'The AI reads and structures it',
  'hiw.reads.body':
    'FogMind finds the topics inside your material and how they relate to each other, then turns that structure into something you can see.',
  'hiw.map.title': 'Your knowledge map appears',
  'hiw.map.body':
    'Every concept becomes a node, every relationship a connection. You see the whole subject at a glance instead of a wall of pages.',
  'hiw.fog.title': 'Clear the fog',
  'hiw.fog.body':
    'New nodes start hidden in fog. Answer AI generated questions about a concept to reveal it, keep answering to master it.',
  'hiw.fog.stage1': 'Fogged',
  'hiw.fog.stage2': 'Answer questions',
  'hiw.fog.stage3': 'Mastered',
  'hiw.adaptive.title': 'Adaptive progress',
  'hiw.adaptive.body':
    'Questions adjust to how you perform, and your progress is saved so every session picks up where the last one ended.',

  'product.hero.title': 'Everything you need to actually learn',
  'product.hero.subtitle':
    'Not another flashcard app. A map of what you know and what is still in the fog.',
  'product.graph.title': 'Interactive knowledge graph',
  'product.graph.body':
    'Your material becomes a spatial map of connected concepts you can explore, rearrange and grow.',
  'product.questions.title': 'AI generated questions',
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
} as const

export type TranslationKey = keyof typeof en
export type Dictionary = Record<TranslationKey, string>
