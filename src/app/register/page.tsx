import Link from "next/link";
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

export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
            <div className="p-3 mb-4 bg-primary rounded-full shadow-lg">
                <GraduationCap className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-extrabold font-headline text-primary">ResultFlow</h1>
            <p className="text-muted-foreground mt-2">Create Your Student Account</p>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Student Registration</CardTitle>
                <CardDescription>Enter your details below to create an account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                    <Label htmlFor="full-name">Full Name</Label>
                    <Input id="full-name" placeholder="e.g., Adewale Adekunle" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="matric-no">Matriculation No.</Label>
                    <Input id="matric-no" placeholder="e.g., F/HD/21/1234567" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="e.g., adewale.adekunle@university.edu" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input id="confirm-password" type="password" />
                </div>
                <Button asChild className="w-full !mt-6">
                    <Link href="/student">Create Account</Link>
                </Button>
                <div className="text-center text-sm">
                    Already have an account? <Link href="/" className="underline text-primary">Login</Link>
                </div>
            </CardContent>
        </Card>

        <p className="mt-8 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} ResultFlow. All rights reserved.
        </p>
      </div>
    </div>
  );
}
