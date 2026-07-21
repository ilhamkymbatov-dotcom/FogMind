import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '../motion/useMediaQuery'

interface DemoLoop {
  /** Attach to the demo root so visibility can be observed. */
  ref: React.RefObject<HTMLDivElement | null>
  /** The current frame of the loop. */
  step: number
  /** True when motion is off, so callers can drop transitions too. */
  reduced: boolean
}

/**
 * Drives a small looping product demo.
 *
 * The loop only runs while the demo is actually on screen and the tab is
 * visible, so a page full of demos costs nothing once scrolled past. With
 * reduced motion the loop never starts and the step is pinned to the last
 * frame, which is authored to be the meaningful finished state, never an empty
 * box.
 */
export function useDemoLoop(steps: number, intervalMs = 1600): DemoLoop {
  const reduced = usePrefersReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState(() => (reduced ? steps - 1 : 0))

  useEffect(() => {
    if (reduced) {
      setStep(steps - 1)
      return
    }

    const element = ref.current
    if (!element) return

    let timer = 0
    let onScreen = false

    const start = () => {
      if (timer === 0) timer = window.setInterval(() => setStep((s) => (s + 1) % steps), intervalMs)
    }
    const stop = () => {
      if (timer !== 0) {
        window.clearInterval(timer)
        timer = 0
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        onScreen = entries[0]?.isIntersecting ?? false
        if (onScreen && !document.hidden) start()
        else stop()
      },
      { threshold: 0.2 },
    )
    observer.observe(element)

    const onVisibility = () => {
      if (document.hidden) stop()
      else if (onScreen) start()
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      observer.disconnect()
      stop()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [reduced, steps, intervalMs])

  return { ref, step, reduced }
}
