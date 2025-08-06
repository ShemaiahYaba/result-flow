// ================================================
// 🔐 Permissions Helper
// Centralized role-based access control for ResultFlow
// ================================================

export type Role = "admin" | "hod" | "student" | null;

export type PermissionKey =
  | "view_results"
  | "approve_results"
  | "manage_departments"
  | "manage_courses"
  | "manage_students"
  | "upload_results"
  | "download_broadsheet"
  | "generate_transcripts"
  | "view_dashboard"
  | "update_settings"
  | "view_students";

// Define permissions for each role
const permissions: Record<Exclude<Role, null>, PermissionKey[]> = {
  admin: [
    "view_results",
    "approve_results",
    "manage_departments",
    "manage_courses",
    "manage_students",
    "upload_results",
    "download_broadsheet",
    "generate_transcripts",
    "view_dashboard",
    "update_settings",
    "view_students",
  ],
  hod: [
    "view_results",
    "approve_results",
    "manage_courses",
    "manage_students",
    "upload_results",
    "download_broadsheet",
    "generate_transcripts",
    "view_dashboard",
    "view_students",
  ],
  student: ["view_results", "view_students"],
};

/**
 * Check if a role has permission for a specific action.
 * @param action - The action/permission key
 * @param role - The current user's role
 * @returns boolean
 */
export function canAccess(action: PermissionKey, role: Role): boolean {
  if (!role) return false;
  return permissions[role]?.includes(action) ?? false;
}

/**
 * Get all allowed permissions for a given role.
 * @param role - The current user's role
 * @returns PermissionKey[]
 */
export function getPermissions(role: Role): PermissionKey[] {
  if (!role) return [];
  return permissions[role] ?? [];
}

/**
 * Check if user is admin.
 * @param role - The current user's role
 * @returns boolean
 */
export function isAdmin(role: Role): boolean {
  return role === "admin";
}

/**
 * Check if user is HOD.
 * @param role - The current user's role
 * @returns boolean
 */
export function isHOD(role: Role): boolean {
  return role === "hod";
}

/**
 * Check if user is Student.
 * @param role - The current user's role
 * @returns boolean
 */
export function isStudent(role: Role): boolean {
  return role === "student";
}
