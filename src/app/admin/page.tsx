'use client';

import { useGlobalContext } from '@/contexts/GlobalContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Book, CheckSquare, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

import { GlobalProvider } from '@/contexts/GlobalContext';

export default function AdminDashboardPage() {
    const { state } = useGlobalContext();
    // Wait for loading to finish before checking auth
    if (state.auth.isLoading) {
      return <div>Loading...</div>;
    }
    if (!state.auth.user || state.auth.profile?.role !== 'admin') {
      if (typeof window !== 'undefined') {
        window.location.href = '/unauthorized';
      }
      return <div>Unauthorized. Redirecting...</div>;
    }
    return (
      <GlobalProvider>
        <AdminDashboard />
      </GlobalProvider>
    );
  }
  // Example stats, replace with real data as needed
  const stats = {
    totalHods: 3,
    departments: 5,
    courses: 20,
    pendingApprovals: 2,
  };

  function AdminDashboard() {
    const { logout } = useGlobalContext();
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

