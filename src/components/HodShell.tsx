"use client";
import { ReactNode } from "react";
import { AuthProvider } from "@/providers/AuthProvider";

interface HodShellProps {
  initialRole: string;
  initialUser: any;
  children: ReactNode;
}

export function HodShell({ initialRole, initialUser, children }: HodShellProps) {
  return (
    <AuthProvider initialRole={initialRole} initialUser={initialUser}>
      {children}
    </AuthProvider>
  );
}
