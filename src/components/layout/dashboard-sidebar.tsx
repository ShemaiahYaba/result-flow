
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
import { useUniversityInfo } from '@/hooks/useUniversityInfo';
import { useEffect } from 'react';

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
};

export function DashboardSidebar({ navItems }: { navItems: NavItem[] }) {
  const pathname = usePathname();
  const { data: universityInfo, loading, error, fetchUniversityInfo } = useUniversityInfo();

  useEffect(() => {
    fetchUniversityInfo();
  }, [fetchUniversityInfo]);

  const getUniversityName = () => {
    if (loading) return 'Loading...';
    if (error) return 'University';
    return universityInfo?.university_name || 'University';
  };

  return (
    <>
      <SidebarHeader>
          <SidebarMenuButton className="h-auto justify-start py-2" size="lg">
                <div className="p-2 bg-primary rounded-lg">
                    <GraduationCap className="size-6 shrink-0 text-primary-foreground" />
                </div>
                <div className="flex flex-col">
                    <span className="font-headline text-lg font-bold">ResultFlow</span>
                    <span className="text-xs text-muted-foreground">{getUniversityName()}</span>
                </div>
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
        {/* UserNav is now in the header */}
      </SidebarFooter>
    </>
  );
}
