/**
 * Permission model recap (see backend rbac/guards/*):
 * - Every school-scoped route requires the caller to belong to the school
 *   (SchoolContextGuard) and, for most routes, an explicit permission key
 *   like "payments:create" (PermissionsGuard).
 * - The Owner role always has every permission (seeded at registration).
 * - Non-Owner roles have whatever subset of permissions an Owner granted.
 *
 * The backend is the real enforcement boundary — every mutation still
 * gets checked server-side regardless of what the UI shows. This helper
 * only decides what to SHOW: Owners see everything; for other roles we
 * use the permission set loaded from GET /schools/:id/roles/:roleId when
 * available. If that set can't be loaded (e.g. the caller's role also
 * lacks roles:view), we fail OPEN for display purposes rather than
 * hiding the whole app — any action that's actually disallowed will
 * still be rejected by the API and surfaced as a friendly 403 message.
 */
export function hasPermission(
  key: string,
  opts: { isOwner: boolean; permissionKeys: string[] | null },
): boolean {
  if (opts.isOwner) return true;
  if (opts.permissionKeys === null) return true; // unknown -> fail open on display
  return opts.permissionKeys.includes(key);
}
