/**
 * Auth stub guard. `authed` lives in localStorage (client only), so we enforce
 * on the client and let the server render the shell. Public routes: landing,
 * login, and the read-only share view.
 */
export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return
  const session = useSessionStore()
  const localePath = useLocalePath()
  // compare on the locale-stripped path so /en/* is treated the same as /*
  const base = to.path.replace(/^\/en(?=\/|$)/, '') || '/'
  const isPublic =
    to.meta.public === true ||
    base === '/' ||
    base === '/masuk' ||
    base.startsWith('/share')

  if (!session.authed && !isPublic) return navigateTo(localePath('/masuk'))
  if (session.authed && base === '/masuk') return navigateTo(localePath('/beranda'))
})
