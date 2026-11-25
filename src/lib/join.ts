/** Public invite page path; the backend builds invite links as `<origin>/join/<code>` */
export const JOIN_PATH_PREFIX = "/join/";

const PENDING_JOIN_KEY = "pending_join_code";
/** A guest who abandons the login page shouldn't get a surprise request days later */
const PENDING_JOIN_TTL_MS = 30 * 60 * 1000;

/**
 * A guest pressed "Отправить заявку": remember the invite code across the OAuth
 * round trip, so after login the user lands back on the invite page and the
 * request is sent automatically.
 */
export const setPendingJoinCode = (code: string) => {
  try {
    localStorage.setItem(PENDING_JOIN_KEY, JSON.stringify({ code, savedAt: Date.now() }));
  } catch {
    // Storage unavailable: the user will simply have to press the button again
  }
};

export const clearPendingJoinCode = () => {
  try {
    localStorage.removeItem(PENDING_JOIN_KEY);
  } catch {
    // ignore
  }
};

export const getPendingJoinCode = (): string | null => {
  try {
    const raw = localStorage.getItem(PENDING_JOIN_KEY);
    if (!raw) return null;
    const { code, savedAt } = JSON.parse(raw) as { code?: unknown; savedAt?: unknown };
    if (typeof code !== "string" || typeof savedAt !== "number" || Date.now() - savedAt > PENDING_JOIN_TTL_MS) {
      clearPendingJoinCode();
      return null;
    }
    return code;
  } catch {
    clearPendingJoinCode();
    return null;
  }
};

const dateTimeFormat = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
});

/** "25 ноября, 14:05" — falls back to the raw value for unparseable dates */
export const formatJoinDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : dateTimeFormat.format(date);
};
