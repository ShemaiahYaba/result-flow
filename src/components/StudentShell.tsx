"use client";
import { ReactNode } from "react";
import { AuthProvider } from "@/providers/AuthProvider";

interface StudentShellProps {
  initialRole: string;
  initialUser: any;
  children: ReactNode;
}

export function StudentShell({ initialRole, initialUser, children }: StudentShellProps) {
  return (
    <AuthProvider initialRole={initialRole} initialUser={initialUser}>
      {children}
    </AuthProvider>
  );
}
