
"use client";

import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Loader2 } from "lucide-react";
import { useStudentProfile } from "@/hooks/useStudentProfile";

export const dynamic = 'force-dynamic';

export default function ProfilePage() {
    const { data: profileData, loading, error, fetchProfile, updateProfile } = useStudentProfile();
    const [profile, setProfile] = useState({
        first_name: "",
        middle_name: "",
        last_name: "",
        phone_number: ""
    });
    const [password, setPassword] = useState({ current: "", new: "" });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    useEffect(() => {
        if (profileData) {
            setProfile({
                first_name: profileData.first_name || "",
                middle_name: profileData.middle_name || "",
                last_name: profileData.last_name || "",
                phone_number: profileData.phone_number || ""
            });
        }
    }, [profileData]);

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setProfile(prev => ({ ...prev, [id]: value }));
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setPassword(prev => ({ ...prev, [id.includes('current') ? 'current' : 'new']: value }));
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await updateProfile(profile);
            alert('Profile updated successfully!');
        } catch (err) {
            alert('Failed to update profile. Please try again.');
        } finally {
            setSaving(false);
        }
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
                    {loading && (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin" />
                            <span className="ml-2">Loading profile...</span>
                        </div>
                    )}
                    
                    {error && (
                        <div className="text-red-600 text-center py-4">
                            Error: {error}
                        </div>
                    )}

                    {profileData && !loading && (
                        <>
                            <div className="flex items-center gap-6">
                                <div className="relative">
                                    <Avatar className="h-24 w-24">
                                        <AvatarImage src="https://placehold.co/96x96.png" alt="@user" />
                                        <AvatarFallback>
                                            {(profile.first_name?.[0] || '') + (profile.last_name?.[0] || '')}
                                        </AvatarFallback>
                                    </Avatar>
                                    <Button size="icon" variant="outline" className="absolute bottom-0 right-0 rounded-full h-8 w-8">
                                        <Camera className="h-4 w-4" />
                                        <span className="sr-only">Change Photo</span>
                                    </Button>
                                </div>
                                <div className="grid gap-1.5">
                                    <h2 className="text-2xl font-bold">
                                        {[profile.first_name, profile.middle_name, profile.last_name].filter(Boolean).join(' ')}
                                    </h2>
                                    <p className="text-muted-foreground">{profileData.matric_number}</p>
                                    <p className="text-muted-foreground">{profileData.department_name}</p>
                                    <p className="text-muted-foreground">{profileData.email}</p>
                                </div>
                            </div>
                            <form onSubmit={handleSaveProfile} className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="first_name">First Name</Label>
                                    <Input 
                                        id="first_name" 
                                        value={profile.first_name} 
                                        onChange={handleProfileChange}
                                        disabled={saving}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="middle_name">Middle Name</Label>
                                    <Input 
                                        id="middle_name" 
                                        value={profile.middle_name} 
                                        onChange={handleProfileChange}
                                        disabled={saving}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="last_name">Last Name</Label>
                                    <Input 
                                        id="last_name" 
                                        value={profile.last_name} 
                                        onChange={handleProfileChange}
                                        disabled={saving}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input 
                                        id="email" 
                                        type="email" 
                                        value={profileData.email} 
                                        disabled
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone_number">Phone Number</Label>
                                    <Input 
                                        id="phone_number" 
                                        type="tel" 
                                        value={profile.phone_number} 
                                        onChange={handleProfileChange}
                                        disabled={saving}
                                    />
                                </div>
                                <div className="md:col-span-2 flex justify-end">
                                    <Button type="submit" disabled={saving}>
                                        {saving ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            'Save Changes'
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </>
                    )}
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
