import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { AppShell } from './components/AppShell'
import { ProtectedRoute, PublicOnlyRoute } from './components/RouteGuards'
import { LandingLayout } from './landing/LandingLayout'
import { I18nProvider } from './i18n'

// Landing (public marketing site)
const HomePage = lazy(() => import('./landing/pages/HomePage'))
const HowItWorksPage = lazy(() => import('./landing/pages/HowItWorksPage'))
const ProductPage = lazy(() => import('./landing/pages/ProductPage'))
const WhoItsForPage = lazy(() => import('./landing/pages/WhoItsForPage'))
const WhyItWorksPage = lazy(() => import('./landing/pages/WhyItWorksPage'))
const AboutPage = lazy(() => import('./landing/pages/AboutPage'))
const FaqPage = lazy(() => import('./landing/pages/FaqPage'))

// Auth and the signed in app
const LoginPage = lazy(() => import('./pages/LoginPage'))
const SignupPage = lazy(() => import('./pages/SignupPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const DocumentDetailPage = lazy(() => import('./pages/DocumentDetailPage'))

function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={null}>
            <Routes>
              {/* Public marketing site: landing chrome and the global fog. */}
              <Route element={<LandingLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />
                <Route path="/product" element={<ProductPage />} />
                <Route path="/who-its-for" element={<WhoItsForPage />} />
                <Route path="/why-it-works" element={<WhyItWorksPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/faq" element={<FaqPage />} />
              </Route>

              {/* Auth: bare centered cards, no landing chrome. */}
              <Route
                path="/login"
                element={
                  <PublicOnlyRoute>
                    <LoginPage />
                  </PublicOnlyRoute>
                }
              />
              <Route
                path="/signup"
                element={
                  <PublicOnlyRoute>
                    <SignupPage />
                  </PublicOnlyRoute>
                }
              />

              {/* Signed in app: its own shell, no landing fog. */}
              <Route
                path="/app"
                element={
                  <ProtectedRoute>
                    <AppShell />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardPage />} />
                <Route path="documents/:id" element={<DocumentDetailPage />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </I18nProvider>
  )
}

export default App
