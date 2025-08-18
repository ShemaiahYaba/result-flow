
"use client";

import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera } from "lucide-react";
import { useHodProfile } from "@/hooks/useHodProfile";

export const dynamic = 'force-dynamic';

interface FormData {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  phone: string;
}

export default function HodProfilePage() {
  const { profile, loading, error, updateProfile, updating } = useHodProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [password, setPassword] = useState({
    current: '',
    new: ''
  });

  // Update form data when profile changes
  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.first_name || '',
        middleName: profile.middle_name || '',
        lastName: profile.last_name || '',
        email: profile.email || '',
        phone: profile.phone_number || ''
      });
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      await updateProfile({
        first_name: formData.firstName,
        middle_name: formData.middleName,
        last_name: formData.lastName,
        email: formData.email,
        phone_number: formData.phone
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        firstName: profile.first_name || '',
        middleName: profile.middle_name || '',
        lastName: profile.last_name || '',
        email: profile.email || '',
        phone: profile.phone_number || ''
      });
    }
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handlePasswordChange = (field: 'current' | 'new') => (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>
                  {profile.first_name?.[0]}{profile.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <Button size="sm" variant="outline" className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0">
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid gap-1.5">
              <h2 className="text-2xl font-bold">
                {[profile.first_name, profile.middle_name, profile.last_name].filter(Boolean).join(' ')}
              </h2>
              <p className="text-muted-foreground">{profile.staff_id}</p>
              <p className="text-muted-foreground">{profile.email}</p>
              {profile.department_name && (
                <p className="text-sm text-muted-foreground">
                  Department: {profile.department_name} ({profile.department_code})
                </p>
              )}
            </div>
          </div>
          
          {!isEditing ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>First Name</Label>
                <div className="p-2 bg-muted rounded">{profile.first_name}</div>
              </div>
              <div className="space-y-2">
                <Label>Middle Name</Label>
                <div className="p-2 bg-muted rounded">{profile.middle_name || 'N/A'}</div>
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <div className="p-2 bg-muted rounded">{profile.last_name}</div>
              </div>
              <div className="space-y-2">
                <Label>Email Address</Label>
                <div className="p-2 bg-muted rounded">{profile.email}</div>
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <div className="p-2 bg-muted rounded">{profile.phone_number || 'N/A'}</div>
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
              </div>
            </div>
          ) : (
            <form className="grid gap-4 md:grid-cols-2" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input 
                  id="firstName" 
                  value={formData.firstName} 
                  onChange={handleInputChange('firstName')}
                  disabled={updating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="middleName">Middle Name</Label>
                <Input 
                  id="middleName" 
                  value={formData.middleName} 
                  onChange={handleInputChange('middleName')}
                  disabled={updating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input 
                  id="lastName" 
                  value={formData.lastName} 
                  onChange={handleInputChange('lastName')}
                  disabled={updating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={formData.email} 
                  onChange={handleInputChange('email')}
                  disabled={updating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  type="tel" 
                  value={formData.phone} 
                  onChange={handleInputChange('phone')}
                  disabled={updating}
                />
              </div>
              <div className="md:col-span-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleCancel} disabled={updating}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updating}>
                  {updating ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="grid gap-4 md:grid-cols-2" onSubmit={(e) => { e.preventDefault(); /* TODO: Implement password update */ }}>
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input 
                id="current-password" 
                type="password" 
                value={password.current} 
                onChange={handlePasswordChange('current')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input 
                id="new-password" 
                type="password" 
                value={password.new} 
                onChange={handlePasswordChange('new')}
              />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit">Update Password</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
