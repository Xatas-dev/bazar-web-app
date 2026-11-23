export function getDisplayName(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  fallback = "Неизвестно"
): string {
  const name = [firstName, lastName].filter(Boolean).join(" ").trim();
  return name || fallback;
}

export function getInitials(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  fallback = "??"
): string {
  const initials = `${firstName?.charAt(0) ?? ""}${lastName?.charAt(0) ?? ""}`;
  return initials || fallback;
}

export function getInitialsFromDisplayName(
  displayName: string | null | undefined,
  fallback = "??"
): string {
  const words = (displayName ?? "").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return fallback;
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase();
}
