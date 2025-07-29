import { SidebarTrigger } from '@/components/ui/sidebar';
import Link from 'next/link';
import { GraduationCap } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <div className="flex items-center gap-2 md:hidden">
            <SidebarTrigger />
            <Link href="/" className="flex items-center gap-2 font-headline text-lg font-semibold">
                <GraduationCap className="size-6 text-primary" />
                <span>ResultFlow</span>
            </Link>
        </div>
        <div className="flex-1" />
    </header>
  );
}
