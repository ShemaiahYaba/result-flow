"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GraduationCap } from 'lucide-react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
};

export function DashboardSidebar({ navItems }: { navItems: NavItem[] }) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" className="hidden border-r bg-card md:flex">
      <SidebarHeader>
          <SidebarMenuButton asChild className="h-12 justify-start" size="lg">
              <Link href="/">
                <GraduationCap className="size-6 shrink-0 text-primary" />
                <span className="font-headline text-lg font-semibold">ResultFlow</span>
              </Link>
          </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.label}>
                <Link href={item.href}>
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
