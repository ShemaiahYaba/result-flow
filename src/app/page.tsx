"use client";

import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGlobalContext } from "@/contexts/GlobalContext";

type RoleType = 'student' | 'hod' | 'admin';

function LoginForm({ role, cta }: { role: string; cta: string }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, state } = useGlobalContext();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Map display role to strict union type
      const roleMap: Record<string, RoleType> = {
        Student: 'student',
        HOD: 'hod',
        Admin: 'admin',
      };
      const apiRole = roleMap[role];
      if (!apiRole) throw new Error('Invalid role selected');
      await login(identifier, password, apiRole);
      
      // On success, redirect based on role
      if (role === "Student") router.push("/student");
      else if (role === "HOD") router.push("/hod");
      else if (role === "Admin") router.push("/admin");
    } catch (err: any) {
      setError(err?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CardContent className="space-y-4 pt-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`${role}-id`}>
            {role === "Student" ? "Matriculation No." : "Staff ID"}
          </Label>
          <Input
            id={`${role}-id`}
            placeholder={role === "Student" ? "F/HD/21/1234567" : "STF-001"}
            value={identifier}
            onChange={e => setIdentifier(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${role}-password`}>Password</Label>
          <Input
            id={`${role}-password`}
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full !mt-6" disabled={loading}>
          {loading ? "Logging in..." : cta}
        </Button>
        {error && <div className="text-red-600 text-sm text-center">{error}</div>}
        {role === "Student" && (
          <div className="text-center text-sm">
            Don't have an account? <a href="/register" className="underline text-primary">Sign Up</a>
          </div>
        )}
      </form>
    </CardContent>
  );
}

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
            <div className="p-3 mb-4 bg-primary rounded-full shadow-lg">
                <GraduationCap className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-extrabold font-headline text-primary">ResultFlow</h1>
            <p className="text-muted-foreground mt-2">Streamlined Result Processing for Universities</p>
        </div>

        <Tabs defaultValue="student" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="student">Student</TabsTrigger>
            <TabsTrigger value="hod">HOD</TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
          </TabsList>
          <TabsContent value="student">
            <Card>
              <CardHeader className="text-center">
                <CardTitle>Student Login</CardTitle>
                <CardDescription>
                  Access your results, track your CGPA, and more.
                </CardDescription>
              </CardHeader>
              <LoginForm role="Student" cta="Login as Student" />
            </Card>
          </TabsContent>
          <TabsContent value="hod">
            <Card>
              <CardHeader className="text-center">
                <CardTitle>HOD Login</CardTitle>
                <CardDescription>
                  Manage departmental results and student registries.
                </CardDescription>
              </CardHeader>
              <LoginForm role="HOD" cta="Login as HOD" />
            </Card>
          </TabsContent>
          <TabsContent value="admin">
            <Card>
              <CardHeader className="text-center">
                <CardTitle>Admin Login</CardTitle>
                <CardDescription>
                  Manage university settings, policies, and approvals.
                </CardDescription>
              </CardHeader>
              <LoginForm role="Admin" cta="Login as Admin" />
            </Card>
          </TabsContent>
        </Tabs>

        <p className="mt-8 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} ResultFlow. All rights reserved.
        </p>
      </div>
    </div>
  );
}