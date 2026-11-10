import { ArrowLeftRight, CircleHelp, LayoutDashboard, LifeBuoy, Settings, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/accounts", label: "Accounts", icon: Wallet },
  { href: "/activity", label: "Account Activity", icon: ArrowLeftRight },
  { href: "/help", label: "Help Center", icon: CircleHelp },
  { href: "/support", label: "Support Requests", icon: LifeBuoy },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
