/**
 * Authentication against oauth2-proxy.
 *
 * There is no Auth0 SDK here any more, and no token in this file or anywhere
 * else the page can reach. oauth2-proxy sits in front of the backend, performs
 * the OIDC flow itself, and hands the browser an httpOnly session cookie scoped
 * to the parent domain. Logging in is a navigation, not an API call, and the
 * session is something only the server can read - an XSS cannot steal it the
 * way it could steal a token in web storage.
 *
 * That is also why nothing here caches "is the user logged in". The page cannot
 * see the cookie, so it asks: `whoAmI()` returns the identity oauth2-proxy
 * derived from the session. Callers should go through `useAuth`, which wraps it
 * in the TanStack Query cache the rest of the app already uses.
 *
 * The endpoints are same-origin on purpose. oauth2-proxy adds no CORS headers
 * to its own /oauth2/... routes (unlike /api/..., where Django's middleware
 * does), so a cross-origin fetch would be blocked by the browser. The frontend
 * ingress therefore routes /oauth2 to the same service the backend host uses.
 */

export interface Identity {
  email: string;
  user: string;
  preferredUsername?: string;
}

/** Where oauth2-proxy is reachable from the browser - always same-origin. */
const OAUTH2_PREFIX = "/oauth2";

/**
 * Who the current session belongs to, or null when nobody is signed in.
 *
 * oauth2-proxy answers with `{}` rather than a 401 for an anonymous caller, so
 * an empty email is the signal, not the status code.
 */
export async function whoAmI(): Promise<Identity | null> {
  const response = await fetch(`${OAUTH2_PREFIX}/userinfo`, {
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  if (!response.ok) return null;

  // Anything that is not JSON means oauth2-proxy is not in front of this origin
  // - the dev server answers /oauth2/... with the SPA fallback HTML. Treat that
  // as "nobody is signed in" rather than throwing, so the site still works when
  // it is served without the proxy.
  try {
    const identity = (await response.json()) as Partial<Identity>;
    return identity.email ? (identity as Identity) : null;
  } catch {
    return null;
  }
}

/**
 * Starts the login. This deliberately leaves the SPA: the OIDC flow is a series
 * of full-page redirects through Auth0 and back, which is what removes the need
 * for the SDK, the silent-renew iframe and the token handling that came with it.
 *
 * `rd` is where oauth2-proxy sends the browser afterwards. It is absolute
 * because the callback is served by the backend host, and it has to be inside
 * the whitelisted domain or oauth2-proxy will refuse it and fall back to `/`.
 */
export function login(returnTo: string = window.location.href): void {
  window.location.assign(
    `${OAUTH2_PREFIX}/start?rd=${encodeURIComponent(returnTo)}`,
  );
}

/** Ends the session and returns to the landing page. */
export function logout(): void {
  window.location.assign(
    `${OAUTH2_PREFIX}/sign_out?rd=${encodeURIComponent(window.location.origin)}`,
  );
}
