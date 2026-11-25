import config from "@/config";
import { JOIN_PATH_PREFIX } from "@/lib/join";

export const getLoginUrl = () =>
  process.env.NODE_ENV === "development" ? config.auth.targetLocal : config.auth.keycloakUrl;

/** The static landing page: no API calls unless the user is coming back from login */
export const isLandingPath = (pathname: string = window.location.pathname) => pathname === "/";

/** Pages a guest may see: a 401 there is expected and must not bounce the user to login */
export const isPublicPath = (pathname: string = window.location.pathname) =>
  isLandingPath(pathname) || pathname.startsWith(JOIN_PATH_PREFIX);

const LOGIN_INTENT_KEY = "login_intent";
/** An abandoned login page shouldn't make the landing call the API days later */
const LOGIN_INTENT_TTL_MS = 30 * 60 * 1000;

/**
 * The user started the OAuth flow. The backend may send them back to "/", so remember the
 * intent: the landing page then checks the session once and forwards to the app.
 */
export const markLoginIntent = () => {
  try {
    sessionStorage.setItem(LOGIN_INTENT_KEY, String(Date.now()));
  } catch {
    // Storage unavailable: the user will simply have to press "Войти" again
  }
};

export const clearLoginIntent = () => {
  try {
    sessionStorage.removeItem(LOGIN_INTENT_KEY);
  } catch {
    // ignore
  }
};

export const hasLoginIntent = () => {
  try {
    const savedAt = Number(sessionStorage.getItem(LOGIN_INTENT_KEY));
    if (savedAt && Date.now() - savedAt <= LOGIN_INTENT_TTL_MS) return true;
    clearLoginIntent();
    return false;
  } catch {
    return false;
  }
};

let redirecting = false;

/** Go to login once, no matter how many requests failed with 401 at the same time */
export const redirectToLogin = () => {
  if (redirecting) return;
  redirecting = true;
  markLoginIntent();
  window.location.assign(getLoginUrl());
};
