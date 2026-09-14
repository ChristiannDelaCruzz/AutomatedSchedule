// src/config/navigation.ts
import type { UserRole } from '../types';

export interface NavItem {
  label: string;
  icon: string;
  path: string;
  badge?: 'notifications' | 'messages' | 'requests' | 'conflicts';
}

export interface NavSection {
  section: string;
  items: NavItem[];
}

// ============================================
// SUPERADMIN NAVIGATION
// ============================================
export const superAdminNav: NavSection[] = [
  {
    section: 'Dashboard',
    items: [
      { label: 'Dashboard', icon: 'LayoutDashboard', path: '/dashboard' },
    ],
  },
  {
    section: 'Academic Management',
    items: [
      { label: 'Programs', icon: 'GraduationCap', path: '/admin/programs' },
      { label: 'Sections', icon: 'Users', path: '/admin/sections' },
      { label: 'Subjects / Courses', icon: 'BookOpen', path: '/admin/subjects' },
      { label: 'Semester Courses', icon: 'Calendar', path: '/admin/semester-courses' },
      { label: 'Professor Assignment', icon: 'UserCheck', path: '/admin/professor-assignment' },
      { label: 'Professor Availability', icon: 'Clock', path: '/admin/professor-availability' },
      { label: 'Rooms', icon: 'DoorOpen', path: '/admin/rooms' },
    ],
  },
  {
    section: 'Scheduling',
    items: [
      { label: 'Automatic Schedule Generator', icon: 'Wand2', path: '/scheduling/generator' },
      { label: 'Class Schedule', icon: 'CalendarDays', path: '/scheduling/class' },
      { label: 'Professor Schedule', icon: 'UserCog', path: '/scheduling/professor' },
      { label: 'Room Schedule', icon: 'Building2', path: '/scheduling/room' },
      { label: 'Exam Schedule', icon: 'FileText', path: '/scheduling/exam' },
      { label: 'Event Schedule', icon: 'PartyPopper', path: '/scheduling/event' },
      { label: 'Conflicts', icon: 'AlertTriangle', path: '/scheduling/conflicts', badge: 'conflicts' },
    ],
  },
  {
    section: 'Enrollment',
    items: [
      { label: 'Applications', icon: 'FileCheck', path: '/admin/enrollments' },
      { label: 'Enrolled Students', icon: 'UserGraduate', path: '/admin/enrolled-students' },
      { label: 'Section Capacity', icon: 'Gauge', path: '/admin/section-capacity' },
    ],
  },
  {
    section: 'Users',
    items: [
      { label: 'Students', icon: 'Users', path: '/users/students' },
      { label: 'Professors', icon: 'UserTie', path: '/users/professors' },
      { label: 'Staff', icon: 'Briefcase', path: '/users/staff' },
      { label: 'Admins', icon: 'Shield', path: '/users/admins' },
    ],
  },
  {
    section: 'Communication',
    items: [
      { label: 'Announcements', icon: 'Megaphone', path: '/communication/announcements' },
      { label: 'Notifications', icon: 'Bell', path: '/communication/notifications', badge: 'notifications' },
      { label: 'Messages', icon: 'MessageSquare', path: '/communication/messages', badge: 'messages' },
      { label: 'Sent Emails', icon: 'Mail', path: '/admin/sent-emails' },
    ],
  },
  {
    section: 'System',
    items: [
      { label: 'Audit Trail', icon: 'History', path: '/system/audit' },
      { label: 'Settings', icon: 'Settings', path: '/system/settings' },
    ],
  },
];

// ============================================
// ADMIN NAVIGATION
// ============================================
export const adminNav: NavSection[] = [
  {
    section: 'Dashboard',
    items: [
      { label: 'Dashboard', icon: 'LayoutDashboard', path: '/dashboard' },
    ],
  },
  {
    section: 'Academic Management',
    items: [
      { label: 'Programs', icon: 'GraduationCap', path: '/admin/programs' },
      { label: 'Sections', icon: 'Users', path: '/admin/sections' },
      { label: 'Subjects / Courses', icon: 'BookOpen', path: '/admin/subjects' },
      { label: 'Semester Courses', icon: 'Calendar', path: '/admin/semester-courses' },
      { label: 'Professor Assignment', icon: 'UserCheck', path: '/admin/professor-assignment' },
      { label: 'Professor Availability', icon: 'Clock', path: '/admin/professor-availability' },
      { label: 'Rooms', icon: 'DoorOpen', path: '/admin/rooms' },
    ],
  },
  {
    section: 'Scheduling',
    items: [
      { label: 'Automatic Schedule Generator', icon: 'Wand2', path: '/scheduling/generator' },
      { label: 'Class Schedule', icon: 'CalendarDays', path: '/scheduling/class' },
      { label: 'Professor Schedule', icon: 'UserCog', path: '/scheduling/professor' },
      { label: 'Room Schedule', icon: 'Building2', path: '/scheduling/room' },
      { label: 'Exam Schedule', icon: 'FileText', path: '/scheduling/exam' },
      { label: 'Event Schedule', icon: 'PartyPopper', path: '/scheduling/event' },
      { label: 'Conflicts', icon: 'AlertTriangle', path: '/scheduling/conflicts', badge: 'conflicts' },
    ],
  },
  {
    section: 'Enrollment',
    items: [
      { label: 'Applications', icon: 'FileCheck', path: '/admin/enrollments' },
      { label: 'Enrolled Students', icon: 'UserGraduate', path: '/admin/enrolled-students' },
      { label: 'Section Capacity', icon: 'Gauge', path: '/admin/section-capacity' },
    ],
  },
  {
    section: 'Users',
    items: [
      { label: 'Students', icon: 'Users', path: '/users/students' },
      { label: 'Professors', icon: 'UserTie', path: '/users/professors' },
      { label: 'Staff', icon: 'Briefcase', path: '/users/staff' },
    ],
  },
  {
    section: 'Communication',
    items: [
      { label: 'Announcements', icon: 'Megaphone', path: '/communication/announcements' },
      { label: 'Notifications', icon: 'Bell', path: '/communication/notifications', badge: 'notifications' },
      { label: 'Messages', icon: 'MessageSquare', path: '/communication/messages', badge: 'messages' },
    ],
  },
];

// ============================================
// STAFF NAVIGATION
// ============================================
export const staffNav: NavSection[] = [
  {
    section: 'Dashboard',
    items: [
      { label: 'Dashboard', icon: 'LayoutDashboard', path: '/dashboard' },
    ],
  },
  {
    section: 'Academic',
    items: [
      { label: 'Sections', icon: 'Users', path: '/admin/sections' },
      { label: 'Subjects', icon: 'BookOpen', path: '/admin/subjects' },
      { label: 'Rooms', icon: 'DoorOpen', path: '/admin/rooms' },
    ],
  },
  {
    section: 'Enrollment',
    items: [
      { label: 'Applications', icon: 'FileCheck', path: '/admin/enrollments' },
      { label: 'Enrolled Students', icon: 'UserGraduate', path: '/admin/enrolled-students' },
    ],
  },
  {
    section: 'Scheduling',
    items: [
      { label: 'Class Schedule', icon: 'CalendarDays', path: '/scheduling/class' },
      { label: 'Professor Schedule', icon: 'UserCog', path: '/scheduling/professor' },
      { label: 'Room Schedule', icon: 'Building2', path: '/scheduling/room' },
    ],
  },
  {
    section: 'Communication',
    items: [
      { label: 'Announcements', icon: 'Megaphone', path: '/communication/announcements' },
      { label: 'Notifications', icon: 'Bell', path: '/communication/notifications', badge: 'notifications' },
    ],
  },
];

// ============================================
// PROFESSOR NAVIGATION
// ============================================
export const professorNav: NavSection[] = [
  {
    section: 'Dashboard',
    items: [
      { label: 'Dashboard', icon: 'LayoutDashboard', path: '/dashboard' },
    ],
  },
  {
    section: 'My Teaching',
    items: [
      { label: 'My Schedule', icon: 'CalendarDays', path: '/professor/schedule' },
      { label: 'My Sections', icon: 'Users', path: '/professor/sections' },
      { label: 'My Students', icon: 'UserGraduate', path: '/professor/students' },
      { label: 'Assigned Subjects', icon: 'BookOpen', path: '/professor/subjects' },
    ],
  },
  {
    section: 'Requests & Availability',
    items: [
      { label: 'Request Schedule Change', icon: 'RefreshCw', path: '/professor/change-request' },
      { label: 'My Availability', icon: 'Clock', path: '/professor/availability' },
      { label: 'My Exams', icon: 'FileText', path: '/professor/exams' },
    ],
  },
  {
    section: 'Communication',
    items: [
      { label: 'Announcements', icon: 'Megaphone', path: '/communication/announcements' },
      { label: 'Notifications', icon: 'Bell', path: '/communication/notifications', badge: 'notifications' },
    ],
  },
];

// ============================================
// STUDENT NAVIGATION
// ============================================
export const studentNav: NavSection[] = [
  {
    section: 'Dashboard',
    items: [
      { label: 'Dashboard', icon: 'LayoutDashboard', path: '/dashboard' },
    ],
  },
  {
    section: 'My Academics',
    items: [
      { label: 'My Schedule', icon: 'CalendarDays', path: '/student/schedule' },
      { label: 'Enrolled Subjects', icon: 'BookOpen', path: '/student/subjects' },
      { label: 'My Section', icon: 'Users', path: '/student/section' },
      { label: 'Exam Schedule', icon: 'FileText', path: '/student/exams' },
    ],
  },
  {
    section: 'Enrollment',
    items: [
      { label: 'My Application', icon: 'FileCheck', path: '/student/enrollment' },
    ],
  },
  {
    section: 'Communication',
    items: [
      { label: 'Announcements', icon: 'Megaphone', path: '/communication/announcements' },
      { label: 'Notifications', icon: 'Bell', path: '/communication/notifications', badge: 'notifications' },
    ],
  },
];

// ============================================
// GET NAVIGATION BY ROLE
// ============================================
export function getNavigationByRole(role: UserRole): NavSection[] {
  switch (role) {
    case 'superadmin':
      return superAdminNav;
    case 'admin':
      return adminNav;
    case 'staff':
      return staffNav;
    case 'professor':
      return professorNav;
    case 'student':
      return studentNav;
    default:
      return [];
  }
}