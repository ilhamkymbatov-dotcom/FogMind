import { useCallback, useSyncExternalStore } from 'react'

/** Reactive media query state, updating when the match changes. */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mq = window.matchMedia(query)
      mq.addEventListener('change', onChange)
      return () => mq.removeEventListener('change', onChange)
    },
    [query],
  )

  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches)
}

/**
 * Whether every animation should be replaced with static, fully visible
 * content. Reads the OS setting; the `?reduced` query parameter forces it on,
 * which is how the static rendering is exercised in tests without an OS toggle.
 */
export function usePrefersReducedMotion(): boolean {
  const system = useMediaQuery('(prefers-reduced-motion: reduce)')
  return system || new URLSearchParams(window.location.search).has('reduced')
}

/** Coarse pointer means touch: no hover, no pointer tracking effects. */
export function useCoarsePointer(): boolean {
  return useMediaQuery('(pointer: coarse)')
}
