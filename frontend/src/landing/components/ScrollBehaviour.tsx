import { useEffect, useLayoutEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

/**
 * Scroll handling for client side navigation.
 *
 * A new page must start at the top. Following a link and landing halfway down
 * the next page is the bug this fixes, and it applies to every link on the
 * site: the top bar, the mobile panel, the footer sitemap and any in page
 * cross link.
 *
 * Back and forward keep their normal meaning and return to where the reader
 * was. Browser managed restoration is turned off because it cannot see a client
 * rendered route, so positions are recorded per history entry and replayed
 * here instead.
 *
 * Both halves live in one layout effect on purpose. React runs the cleanup of
 * the outgoing route and the setup of the incoming one back to back in the
 * layout phase, so the outgoing position is captured before anything scrolls,
 * and the incoming reset lands before the browser paints. A passive scroll
 * listener cannot give that guarantee: the scroll event raised by resetting one
 * route can arrive while the previous route is still the current one and
 * overwrite its saved position with zero.
 *
 * Resetting before paint also matters because these pages animate in. The
 * entrance should begin at the top of the page rather than scrolling there once
 * it has already started.
 */
export function ScrollBehaviour() {
  const location = useLocation()
  const navigationType = useNavigationType()
  const positions = useRef(new Map<string, number>())

  useEffect(() => {
    if (!('scrollRestoration' in window.history)) return
    const previous = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'
    return () => {
      window.history.scrollRestoration = previous
    }
  }, [])

  useLayoutEffect(() => {
    const key = location.key
    // Held in a local so the cleanup does not read the ref after it changes.
    const store = positions.current
    let raf = 0

    if (navigationType === 'POP') {
      const saved = store.get(key)
      if (saved === undefined || saved === 0) {
        window.scrollTo(0, 0)
      } else {
        // Routes are lazy, so the document can still be short when this runs.
        // Retry across a few frames until the page is tall enough to hold the
        // old offset, then stop.
        let frames = 0
        const settle = () => {
          window.scrollTo(0, saved)
          frames += 1
          if (Math.abs(window.scrollY - saved) > 2 && frames < 24) {
            raf = requestAnimationFrame(settle)
          }
        }
        settle()
      }
    } else {
      // Any push or replace starts the new page at the very top.
      window.scrollTo(0, 0)
    }

    return () => {
      cancelAnimationFrame(raf)
      // Runs before the next route resets the scroll, so this is still the
      // position the reader was actually looking at.
      store.set(key, window.scrollY)
    }
  }, [location.key, navigationType])

  return null
}
