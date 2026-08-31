/**
 * Auth stub guard. `authed` lives in localStorage (client only), so we enforce
 * on the client and let the server render the shell. Public routes: landing,
 * login, and the read-only share view.
 */
export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return
  const session = useSessionStore()
  const isPublic =
    to.meta.public === true ||
    to.path === '/' ||
    to.path === '/masuk' ||
    to.path.startsWith('/share')

  if (!session.authed && !isPublic) return navigateTo('/masuk')
  if (session.authed && to.path === '/masuk') return navigateTo('/beranda')
})
