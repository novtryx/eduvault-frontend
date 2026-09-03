import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Users,
  Wallet,
  Receipt,
  FileBarChart,
  UserCog,
  Settings,
  HelpCircle,
  GraduationCap,
  AlertCircle,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Permission key required to see this item; null = always visible to any staff member. */
  permission: string | null;
}

export const primaryNav: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, permission: null },
  { label: 'Students', href: '/students', icon: Users, permission: 'students:view' },
  { label: 'Classes', href: '/classes', icon: GraduationCap, permission: 'classes:view' },
  { label: 'Fee Structure', href: '/fee-structure', icon: Wallet, permission: 'fees:view' },
  { label: 'Payments', href: '/payments', icon: Receipt, permission: 'payments:view' },
  { label: 'Outstanding', href: '/outstanding', icon: AlertCircle, permission: 'payments:view' },
  { label: 'Reports', href: '/reports', icon: FileBarChart, permission: 'reports:view' },
];

export const secondaryNav: NavItem[] = [
  { label: 'Staff', href: '/staff', icon: UserCog, permission: 'staff:view' },
  { label: 'Settings', href: '/settings', icon: Settings, permission: null },
];

export const supportNav: NavItem[] = [
  { label: 'Help & Support', href: '/help', icon: HelpCircle, permission: null },
];
