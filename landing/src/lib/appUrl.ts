/**
 * Absolute URL into the product app. The landing site and the app are separate
 * deployments, so the signup call to action is an external link. Configured via
 * VITE_APP_URL (for example http://localhost:5173 in dev), falling back to the
 * production app origin.
 */
const APP_URL: string = import.meta.env.VITE_APP_URL ?? 'https://app.fogmind.com'

export const SIGNUP_URL = `${APP_URL.replace(/\/$/, '')}/signup`
