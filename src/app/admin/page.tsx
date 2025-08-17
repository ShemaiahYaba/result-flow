'use client';

import { useGlobalContext } from '@/contexts/GlobalContext';
import { useAuth } from '@/providers/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Book, CheckSquare, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

import { GlobalProvider } from '@/contexts/GlobalContext';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboardPage() {
    const { user, role, loading, logout, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !isAuthenticated) {
        router.push('/');
      } else if (!loading && role && role !== 'admin') {
        router.push('/unauthorized');
      }
    }, [loading, isAuthenticated, role, router]);

    if (loading) {
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

    if (role !== 'admin') {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div>Unauthorized. Redirecting...</div>
        </div>
      );
    }

    return <AdminDashboard />;
}

function AdminDashboard() {
  const { logout } = useAuth();
  
  // Example stats, replace with real data as needed
  const stats = {
    totalHods: 3,
    departments: 5,
    courses: 20,
    pendingApprovals: 2,
  };
  
  return (      
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome! Here's an overview of your university's status.</p>
        </div>
        <Button variant="outline" onClick={logout} className="flex items-center gap-2">
          <LogOut className="w-4 h-4" /> Logout
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total HODs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHods}</div>
            <p className="text-xs text-muted-foreground">Heads of Department</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Book className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.departments}</div>
            <p className="text-xs text-muted-foreground">Academic departments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Courses</CardTitle>
            <Book className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.courses}</div>
            <p className="text-xs text-muted-foreground">Courses offered</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">Departmental results waiting</p>
          </CardContent>
        </Card>
      </div>
    </div>
    );
}

