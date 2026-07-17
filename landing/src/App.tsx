import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { I18nProvider } from './i18n'
import { Nav } from './components/Nav'
import { Footer } from './components/Footer'
import { PageTransition } from './components/motion/PageTransition'

const HomePage = lazy(() => import('./pages/HomePage'))
const HowItWorksPage = lazy(() => import('./pages/HowItWorksPage'))
const ProductPage = lazy(() => import('./pages/ProductPage'))

/**
 * Lives below BrowserRouter so useLocation is available.
 *
 * Transitions are enter only, on purpose. Keying PageTransition by pathname
 * remounts it on every navigation, so the incoming page fades and slides in.
 * There is deliberately no AnimatePresence exit phase: React Router v7 wraps
 * navigation in startTransition, and combined with AnimatePresence mode wait
 * and lazy routes the exit never starts and the old page sticks forever. That
 * deadlock was observed here, not just read about. Do not reintroduce
 * AnimatePresence around Routes without testing navigation end to end.
 */
function AnimatedRoutes() {
  const location = useLocation()

  return (
    <PageTransition key={location.pathname}>
      <Suspense fallback={null}>
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/product" element={<ProductPage />} />
        </Routes>
      </Suspense>
    </PageTransition>
  )
}

function App() {
  return (
    <I18nProvider>
      <BrowserRouter>
        <Nav />
        <main>
          <AnimatedRoutes />
        </main>
        <Footer />
      </BrowserRouter>
    </I18nProvider>
  )
}

export default App
