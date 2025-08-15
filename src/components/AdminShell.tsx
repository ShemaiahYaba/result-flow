"use client";
import { ReactNode } from "react";
import { AuthProvider } from "@/providers/AuthProvider";

interface AdminShellProps {
  initialRole: string;
  initialUser: any;
  children: ReactNode;
}

export function AdminShell({ initialRole, initialUser, children }: AdminShellProps) {
  // Hydrate AuthProvider with SSR role/user
  return (
    <AuthProvider initialRole={initialRole} initialUser={initialUser}>
      {children}
    </AuthProvider>
  );
}
