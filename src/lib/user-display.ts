export function getDisplayName(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  fallback = "Unknown"
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
