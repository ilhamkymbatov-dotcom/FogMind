import { Outlet, useLocation } from 'react-router-dom'
import { Nav } from './components/Nav'
import { Footer } from './components/Footer'
import { ScrollBehaviour } from './components/ScrollBehaviour'
import { GlobalFog } from './components/fx/GlobalFog'
import { PageTransition } from './components/motion/PageTransition'

/**
 * The marketing shell: the landing Nav, Footer and the site wide brand fog wrap
 * every public route through an Outlet. This layout is mounted only on landing
 * paths, so the auth cards and the signed in app never inherit the landing
 * chrome or its fog.
 *
 * Transitions are enter only, on purpose. Keying PageTransition by pathname
 * remounts it on every navigation, so the incoming page fades and slides in.
 * There is deliberately no AnimatePresence exit phase: React Router v7 wraps
 * navigation in startTransition, and combined with AnimatePresence mode wait
 * and lazy routes the exit never starts and the old page sticks forever. Do not
 * reintroduce AnimatePresence around the Outlet without testing navigation end
 * to end.
 */
export function LandingLayout() {
  const location = useLocation()

  return (
    <>
      <ScrollBehaviour />
      <Nav />
      <main>
        <PageTransition key={location.pathname}>
          <Outlet />
        </PageTransition>
      </main>
      <Footer />
      {/* Part of the shell, not a page: the brand fog survives navigation. */}
      <GlobalFog />
    </>
  )
}
