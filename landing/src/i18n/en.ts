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
} as const

export type TranslationKey = keyof typeof en
export type Dictionary = Record<TranslationKey, string>
