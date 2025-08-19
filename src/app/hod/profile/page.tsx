
"use client";

import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Loader2 } from "lucide-react";
import { useHodProfile } from "@/hooks/useHodProfile";
import { useToast } from "@/hooks/use-toast";

export const dynamic = 'force-dynamic';

export default function HodProfilePage() {
  const { profile, loading, error, updating, updateProfile } = useHodProfile();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    phone_number: ''
  });
  const [password, setPassword] = useState({ current: "", new: "" });

  // Update form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        middle_name: profile.middle_name || '',
        last_name: profile.last_name || '',
        phone_number: profile.phone_number || ''
      });
    }
  }, [profile]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setPassword(prev => ({ ...prev, [id.includes('current') ? 'current' : 'new']: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No profile data found.</p>
      </div>
    );
  }

  const getInitials = () => {
    const firstName = profile.first_name || '';
    const lastName = profile.last_name || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  };

  const getFullName = () => {
    const parts = [
      profile.first_name,
      profile.middle_name,
      profile.last_name
    ].filter(Boolean);
    return parts.join(' ') || 'No name set';
  };

  const getStaffId = () => {
    return profile.staff_id || 'No staff ID set';
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
                <AvatarFallback>{getInitials()}</AvatarFallback>
              </Avatar>
              <Button size="icon" variant="outline" className="absolute bottom-0 right-0 rounded-full h-8 w-8">
                <Camera className="h-4 w-4" />
                <span className="sr-only">Change Photo</span>
              </Button>
            </div>
            <div className="grid gap-1.5">
              <h2 className="text-2xl font-bold">{getFullName()}</h2>
              <p className="text-muted-foreground">HOD ID: {getStaffId()}</p>
              <p className="text-muted-foreground">{profile.email}</p>
              {profile.department_name && (
                <p className="text-sm text-muted-foreground">
                  Department: {profile.department_name} ({profile.department_code})
                </p>
              )}
            </div>
          </div>
          <form onSubmit={handleSaveProfile} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input 
                id="first_name" 
                value={formData.first_name} 
                onChange={handleProfileChange} 
                disabled={updating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="middle_name">Middle Name</Label>
              <Input 
                id="middle_name" 
                value={formData.middle_name} 
                onChange={handleProfileChange} 
                disabled={updating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input 
                id="last_name" 
                value={formData.last_name} 
                onChange={handleProfileChange} 
                disabled={updating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                value={profile.email} 
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input 
                id="phone_number" 
                type="tel" 
                value={formData.phone_number} 
                onChange={handleProfileChange} 
                disabled={updating}
              />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" disabled={updating}>
                {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
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
