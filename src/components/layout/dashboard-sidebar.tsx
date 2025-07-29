"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GraduationCap } from 'lucide-react';
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { UserNav } from './user-nav';

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
};

export function DashboardSidebar({ navItems }: { navItems: NavItem[] }) {
  const pathname = usePathname();

  return (
    <>
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
              <SidebarMenuButton asChild isActive={pathname.startsWith(item.href)} tooltip={{content: item.label, side: "right", align: "center"}}>
                <Link href={item.href}>
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <UserNav />
      </SidebarFooter>
    </>
  );
}
