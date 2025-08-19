
"use client";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { useSidebar } from '../ui/sidebar';
import { LogOut, User, Settings } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/providers/UnifiedAuthProvider';

export function UserNav() {
    const pathname = usePathname();
    const { signOut, user, isLoading } = useAuth();

  const getProfileLink = () => {
    if (pathname.startsWith('/admin')) {
      return '/admin/profile';
    }
    if (pathname.startsWith('/hod')) {
      return '/hod/profile';
    }
    return '/student/profile';
  };

  const getUserInitials = () => {
    if (!user?.firstName && !user?.lastName) {
      return user?.email?.charAt(0).toUpperCase() || 'U';
    }
    return `${user?.firstName?.charAt(0) || ''}${user?.lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getDisplayName = () => {
    if (user?.firstName || user?.lastName) {
      return `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
    }
    return user?.email?.split('@')[0] || 'User';
  };

  if (isLoading) {
    return (
      <Button variant="ghost" className="relative h-9 w-9 rounded-full" disabled>
        <Avatar className="h-9 w-9">
          <AvatarFallback>...</AvatarFallback>
        </Avatar>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src="https://placehold.co/48x48.png" alt="@user" data-ai-hint="user avatar" />
            <AvatarFallback>{getUserInitials()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{getDisplayName()}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email || 'No email'}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={getProfileLink()}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
