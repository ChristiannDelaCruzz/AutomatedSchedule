// src/hooks/useRole.ts
import { useMemo } from 'react';
import { useAuth } from './useAuth';
import type { UserRole } from '../types';

// ============================================
// ROLE HOOK RETURN TYPE
// ============================================

export interface UseRoleReturn {
  /** The current user's role (defaults to 'student' if not authenticated) */
  role: UserRole;

  /** Whether the user is a SuperAdmin */
  isSuperAdmin: boolean;

  /** Whether the user is an Admin OR SuperAdmin */
  isAdmin: boolean;

  /** Whether the user is Staff */
  isStaff: boolean;

  /** Whether the user is a Professor */
  isProfessor: boolean;

  /** Whether the user is a Student */
  isStudent: boolean;

  /** Whether the user is authenticated */
  isAuthenticated: boolean;

  // ============================================
  // PERMISSION HELPERS
  // ============================================

  /** Can manage academic data (programs, sections, subjects, professors, rooms) */
  canManageAcademics: boolean;

  /** Can manage scheduling (generate, edit, publish schedules) */
  canManageScheduling: boolean;

  /** Can manage users (create, edit, delete users) */
  canManageUsers: boolean;

  /** Can manage enrollment applications (review, approve, reject) */
  canManageEnrollment: boolean;

  /** Can view schedules (all users can view their own) */
  canViewSchedules: boolean;

  /** Can request schedule changes (professors only) */
  canRequestScheduleChange: boolean;

  /** Can set availability (professors only) */
  canSetAvailability: boolean;

  /** Can view all students (admins, staff, professors of assigned sections) */
  canViewStudents: boolean;

  /** Can view audit trail (superadmin only) */
  canViewAuditTrail: boolean;

  /** Can access system settings (superadmin only) */
  canManageSystemSettings: boolean;

  /** Can access the automatic schedule generator (admin/superadmin only) */
  canGenerateSchedule: boolean;

  /** Can publish schedules (admin/superadmin only) */
  canPublishSchedule: boolean;

  /** Can manage exams and events (admin/superadmin only) */
  canManageExamsAndEvents: boolean;

  /** Can broadcast announcements (admin/superadmin/staff) */
  canBroadcastAnnouncements: boolean;

  // ============================================
  // HELPERS
  // ============================================

  /**
   * Check if the current user's role matches one or more roles
   * @example hasRole('admin') // true if user is admin
   * @example hasRole(['admin', 'superadmin']) // true if user is either
   */
  hasRole: (roles: UserRole | UserRole[]) => boolean;

  /**
   * Get a human-readable label for the current role
   * @example 'Super Admin', 'Admin', 'Professor', etc.
   */
  roleLabel: string;
}

// ============================================
// MAIN HOOK
// ============================================

export function useRole(): UseRoleReturn {
  const { user, isAuthenticated } = useAuth();

  const role: UserRole = (user?.role as UserRole) || 'student';

  return useMemo<UseRoleReturn>(() => {
    // ============================================
    // ROLE CHECKS
    // ============================================
    const isSuperAdmin = role === 'superadmin';
    const isAdmin = role === 'admin' || role === 'superadmin';
    const isStaff = role === 'staff';
    const isProfessor = role === 'professor';
    const isStudent = role === 'student';

    // ============================================
    // PERMISSION HELPERS
    // ============================================

    /** Check if role matches one or more roles */
    const hasRole = (roles: UserRole | UserRole[]): boolean => {
      if (Array.isArray(roles)) {
        return roles.includes(role);
      }
      return role === roles;
    };

    /** Human-readable role label */
    const roleLabel = (() => {
      switch (role) {
        case 'superadmin':
          return 'Super Admin';
        case 'admin':
          return 'Admin';
        case 'staff':
          return 'Staff';
        case 'professor':
          return 'Professor';
        case 'student':
          return 'Student';
        default:
          return 'User';
      }
    })();

    // ============================================
    // RETURN OBJECT
    // ============================================
    return {
      // Role flags
      role,
      isSuperAdmin,
      isAdmin,
      isStaff,
      isProfessor,
      isStudent,
      isAuthenticated,

      // Permissions
      canManageAcademics: isAdmin,
      canManageScheduling: isAdmin,
      canManageUsers: isSuperAdmin,
      canManageEnrollment: isAdmin || isStaff,
      canViewSchedules: true,
      canRequestScheduleChange: isProfessor,
      canSetAvailability: isProfessor,
      canViewStudents: isAdmin || isStaff || isProfessor,
      canViewAuditTrail: isSuperAdmin,
      canManageSystemSettings: isSuperAdmin,
      canGenerateSchedule: isAdmin,
      canPublishSchedule: isAdmin,
      canManageExamsAndEvents: isAdmin,
      canBroadcastAnnouncements: isAdmin || isStaff,

      // Helpers
      hasRole,
      roleLabel,
    };
  }, [role, isAuthenticated]);
}

export default useRole;