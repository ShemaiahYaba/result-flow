"use client";

import { SidebarTrigger } from '@/components/ui/sidebar';
import { GraduationCap } from 'lucide-react';
import { UserNav } from './user-nav';
import { useUniversityInfo } from '@/hooks/useUniversityInfo';
import { useEffect } from 'react';

export function Header() {
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
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2 md:hidden">
        <SidebarTrigger />
        <div className="flex items-center gap-2 font-headline text-lg font-semibold">
          <div className="p-1.5 bg-primary rounded-md">
            <GraduationCap className="size-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-headline text-base font-bold leading-tight">ResultFlow</span>
            <span className="text-xs text-muted-foreground leading-tight">
              {getUniversityName()}
            </span>
          </div>
        </div>
      </div>
      <div className="flex-1" />
      <UserNav />
    </header>
  );
}
