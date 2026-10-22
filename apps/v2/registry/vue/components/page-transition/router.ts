import type { Router } from 'vue-router'
import { startTransition } from 'motion-v'

/**
 * Runs each route change of `router` in a view transition, typed `nav-back`
 * when the history goes back to the entry before, else `nav-forward`, so
 * PageTransition animates it.
 */
export function routeTransitions(router: Router) {
  return router.beforeResolve((to, from) => {
    if (!from.matched.length || to.fullPath === from.fullPath)
      return
    // On a back navigation, the history already stands on the entry whose next one we leave.
    const back = router.options.history.state?.forward === from.fullPath
    return new Promise<void>((resolve) => {
      startTransition(
        () =>
          new Promise<void>((done) => {
            const off = router.afterEach(() => {
              off()
              done()
            })
            resolve()
          }),
        { types: [back ? 'nav-back' : 'nav-forward'] },
      )
    })
  })
}
