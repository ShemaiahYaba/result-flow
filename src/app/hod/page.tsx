"use client"
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Book, Upload } from "lucide-react";

export const dynamic = 'force-dynamic';

import { GlobalProvider } from "@/contexts/GlobalContext";

import { useGlobalContext } from '@/contexts/GlobalContext';

import { useAuth } from '@/providers/AuthProvider';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HodDashboardPage() {
  const { user, role, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on the client side before doing any redirects
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return; // Don't redirect during SSR
    
    // Only redirect if not authenticated
    if (!loading && !isAuthenticated) {
      router.push('/');
    }
  }, [isClient, loading, isAuthenticated, router, user]);

  // Show consistent loading state during SSR and initial client hydration
  if (loading || !isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Redirecting to login...</div>
      </div>
    );
  }

  return <HodDashboard />;
}

// Move the dashboard UI to a separate component for clarity
function HodDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">HOD Dashboard</h1>
        <p className="text-muted-foreground">Welcome, Head of Department. Manage your department's results here.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Registered Students
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,254</div>
            <p className="text-xs text-muted-foreground">
              In Computer Science
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Departmental Courses
            </CardTitle>
            <Book className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32</div>
            <p className="text-xs text-muted-foreground">
              Across all levels
            </p>
          </CardContent>
        </Card>
        <Card className="flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center">
            <Button asChild>
                <Link href="/hod/uploads">
                    <Upload className="mr-2 h-4 w-4" /> Upload Results
                </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      <div>
        {/* Placeholder for recent activity or notifications */}
      </div>
    </div>
  );
}

