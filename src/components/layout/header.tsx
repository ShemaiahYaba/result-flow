import { SidebarTrigger } from '@/components/ui/sidebar';
import Link from 'next/link';
import { GraduationCap } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <div className="flex items-center gap-2 md:hidden">
            <SidebarTrigger />
            <Link href="/" className="flex items-center gap-2 font-headline text-lg font-semibold">
                <div className="p-1.5 bg-primary rounded-md">
                    <GraduationCap className="size-5 text-primary-foreground" />
                </div>
                <div className="flex flex-col">
                    <span className="font-headline text-base font-bold leading-tight">ResultFlow</span>
                    <span className="text-xs text-muted-foreground leading-tight">University of Lagos</span>
                </div>
            </Link>
        </div>
        <div className="flex-1" />
    </header>
  );
}
