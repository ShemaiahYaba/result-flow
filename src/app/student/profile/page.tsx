
"use client";

import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera } from "lucide-react";

const initialProfileData = {
    fullName: "Adewale Adekunle",
    email: "adekunle@university.edu",
    phone: "+234 801 234 5678",
    department: "Computer Science",
    matricNo: "F/HD/21/1234567"
};

export const dynamic = 'force-dynamic';

export default function ProfilePage() {
    const [profile, setProfile] = useState(initialProfileData);
    const [password, setPassword] = useState({ current: "", new: "" });

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setProfile(prev => ({ ...prev, [id]: value }));
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setPassword(prev => ({ ...prev, [id.includes('current') ? 'current' : 'new']: value }));
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">My Profile</h1>
                <p className="text-muted-foreground">View and update your personal information.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Profile Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <Avatar className="h-24 w-24">
                                <AvatarImage src="https://placehold.co/96x96.png" alt="@user" data-ai-hint="user avatar" />
                                <AvatarFallback>{profile.fullName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <Button size="icon" variant="outline" className="absolute bottom-0 right-0 rounded-full h-8 w-8">
                                <Camera className="h-4 w-4" />
                                <span className="sr-only">Change Photo</span>
                            </Button>
                        </div>
                        <div className="grid gap-1.5">
                            <h2 className="text-2xl font-bold">{profile.fullName}</h2>
                            <p className="text-muted-foreground">{profile.matricNo}</p>
                            <p className="text-muted-foreground">{profile.email}</p>
                        </div>
                    </div>
                    <form className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input id="fullName" value={profile.fullName} onChange={handleProfileChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input id="email" type="email" value={profile.email} onChange={handleProfileChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" type="tel" value={profile.phone} onChange={handleProfileChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="department">Department</Label>
                            <Input id="department" value={profile.department} disabled />
                        </div>
                        <div className="md:col-span-2 flex justify-end">
                            <Button>Save Changes</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Security</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <form className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="current-password">Current Password</Label>
                            <Input id="current-password" type="password" value={password.current} onChange={handlePasswordChange}/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <Input id="new-password" type="password" value={password.new} onChange={handlePasswordChange}/>
                        </div>
                        <div className="md:col-span-2 flex justify-end">
                            <Button>Update Password</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
