'use client';

import { useUser } from "@stackframe/stack";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Shield, 
  Calendar, 
  Star, 
  Settings, 
  Save, 
  Camera,
  Trash2,
  Key,
  Bell,
  Globe,
  Building,
  MapPin,
  Link,
  Linkedin,
  CheckCircle,
  Clock,
  Award,
  TrendingUp
} from "lucide-react";

interface UserData {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: string;
  trustScore: number;
  badges: string[];
  bio: string | null;
  company: string | null;
  linkedinUrl: string | null;
  websiteUrl: string | null;
  location: string | null;
  expertise: string[];
  isVerifiedTester: boolean;
  verificationStatus: string | null;
  verifiedAt: Date | null;
  verifiedBy: string | null;
  vendorStatus: string | null;
  vendorApprovedAt: Date | null;
  vendorApprovedBy: string | null;
  helpfulVotesReceived: number;
  createdAt: Date;
  updatedAt: Date;
}

export default function AccountSettingsPage() {
  const user = useUser();
  const { toast } = useToast();
  
  const [displayName, setDisplayName] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);
  
  // Extended profile fields
  const [bio, setBio] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [expertise, setExpertise] = useState<string[]>([]);
  const [expertiseInput, setExpertiseInput] = useState('');

  // Fetch user data from database
  const fetchUserData = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoadingUserData(true);
      const response = await fetch('/api/users/me');
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
        
        // Update form fields with database data
        setBio(data.bio || '');
        setCompany(data.company || '');
        setLocation(data.location || '');
        setLinkedinUrl(data.linkedinUrl || '');
        setWebsiteUrl(data.websiteUrl || '');
        setExpertise(data.expertise || []);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoadingUserData(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setProfileImageUrl(user.profileImageUrl || '');
      fetchUserData();
    }
  }, [user, fetchUserData]);

  // Handle expertise management
  const addExpertise = () => {
    if (expertiseInput.trim() && !expertise.includes(expertiseInput.trim())) {
      setExpertise([...expertise, expertiseInput.trim()]);
      setExpertiseInput('');
    }
  };

  const removeExpertise = (item: string) => {
    setExpertise(expertise.filter(exp => exp !== item));
  };

  // Handle extended profile save
  const handleSaveExtendedProfile = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/users/sync-user-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bio,
          company,
          location,
          linkedinUrl,
          websiteUrl,
          expertise,
        }),
      });
      
      if (response.ok) {
        toast({
          title: "Profile Updated",
          description: "Your extended profile has been updated successfully.",
        });
        fetchUserData(); // Refresh data
      } else {
        throw new Error('Failed to update profile');
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
       setIsLoading(false);
     }
   };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      await user.update({ 
        displayName, 
        profileImageUrl 
      });
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      setIsLoading(true);
      try {
        await user.delete();
        toast({
          title: "Account Deleted",
          description: "Your account has been deleted successfully.",
        });
      } catch {
        toast({
          title: "Error",
          description: "Failed to delete account. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Not Authenticated</h2>
          <p className="text-muted-foreground mb-4">Please sign in to access your account settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Settings className="h-8 w-8 text-primary" />
              Account Settings
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your account settings, profile, and preferences
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Preferences
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profile Information
                  </CardTitle>
                  <CardDescription>
                    Update your profile information and display settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Profile Picture */}
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={profileImageUrl} alt={displayName || "User"} />
                      <AvatarFallback className="text-lg">
                        {(displayName || user.primaryEmail || "U").slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <Label htmlFor="profileImage">Profile Image URL</Label>
                      <div className="flex gap-2">
                        <Input
                          id="profileImage"
                          type="url"
                          placeholder="https://example.com/avatar.jpg"
                          value={profileImageUrl}
                          onChange={(e) => setProfileImageUrl(e.target.value)}
                        />
                        <Button variant="outline" size="icon">
                          <Camera className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Display Name */}
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      type="text"
                      placeholder="Enter your display name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                    />
                  </div>

                  {/* Email (Read-only) */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user.primaryEmail || ''}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-sm text-muted-foreground">
                      Email address cannot be changed
                    </p>
                  </div>

                  {/* User Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>User ID</Label>
                      <Input value={user.id} disabled className="bg-muted" />
                    </div>
                    <div className="space-y-2">
                      <Label>Account Type</Label>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          <Shield className="w-3 h-3 mr-1" />
                          User
                        </Badge>
                        <Badge variant="outline">
                          <Star className="w-3 h-3 mr-1" />
                          0 Trust Score
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Save Button */}
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleSaveProfile} 
                      disabled={isLoading}
                      className="flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Extended Profile Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Extended Profile
                  </CardTitle>
                  <CardDescription>
                    Additional profile information and professional details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {isLoadingUserData ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                        <p className="text-sm text-muted-foreground">Loading profile data...</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Bio */}
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          placeholder="Tell us about yourself..."
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          rows={4}
                        />
                      </div>

                      <Separator />

                      {/* Professional Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="company" className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            Company
                          </Label>
                          <Input
                            id="company"
                            placeholder="Your company name"
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="location" className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Location
                          </Label>
                          <Input
                            id="location"
                            placeholder="Your location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Social Links */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="linkedinUrl" className="flex items-center gap-2">
                            <Linkedin className="h-4 w-4" />
                            LinkedIn URL
                          </Label>
                          <Input
                            id="linkedinUrl"
                            type="url"
                            placeholder="https://linkedin.com/in/yourprofile"
                            value={linkedinUrl}
                            onChange={(e) => setLinkedinUrl(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="websiteUrl" className="flex items-center gap-2">
                            <Link className="h-4 w-4" />
                            Website URL
                          </Label>
                          <Input
                            id="websiteUrl"
                            type="url"
                            placeholder="https://yourwebsite.com"
                            value={websiteUrl}
                            onChange={(e) => setWebsiteUrl(e.target.value)}
                          />
                        </div>
                      </div>

                      <Separator />

                      {/* Expertise */}
                      <div className="space-y-4">
                        <Label>Expertise & Skills</Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add expertise (e.g., React, Node.js, UI/UX)"
                            value={expertiseInput}
                            onChange={(e) => setExpertiseInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addExpertise()}
                          />
                          <Button type="button" onClick={addExpertise} variant="outline">
                            Add
                          </Button>
                        </div>
                        {expertise.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {expertise.map((item, index) => (
                              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                {item}
                                <button
                                  onClick={() => removeExpertise(item)}
                                  className="ml-1 hover:text-destructive"
                                >
                                  ×
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      <Separator />

                      {/* Profile Stats & Status */}
                      {userData && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold">Profile Status & Statistics</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Role & Trust Score */}
                            <div className="space-y-2">
                              <Label>Role & Trust Score</Label>
                              <div className="flex flex-col gap-2">
                                <Badge variant={userData.role === 'super_admin' ? 'destructive' : userData.role === 'admin' ? 'default' : 'secondary'}>
                                  <Shield className="w-3 h-3 mr-1" />
                                  {userData.role.replace('_', ' ').toUpperCase()}
                                </Badge>
                                <Badge variant="outline">
                                  <Star className="w-3 h-3 mr-1" />
                                  {userData.trustScore} Trust Score
                                </Badge>
                              </div>
                            </div>

                            {/* Verification Status */}
                            <div className="space-y-2">
                              <Label>Verification Status</Label>
                              <div className="flex flex-col gap-2">
                                {userData.isVerifiedTester ? (
                                  <Badge variant="default" className="bg-green-500">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Verified Tester
                                  </Badge>
                                ) : (
                                  <Badge variant="outline">
                                    <Clock className="w-3 h-3 mr-1" />
                                    Not Verified
                                  </Badge>
                                )}
                                {userData.vendorStatus === 'approved' && (
                                  <Badge variant="default" className="bg-blue-500">
                                    <Award className="w-3 h-3 mr-1" />
                                    Approved Vendor
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Statistics */}
                            <div className="space-y-2">
                              <Label>Statistics</Label>
                              <div className="flex flex-col gap-2">
                                <Badge variant="outline">
                                  <TrendingUp className="w-3 h-3 mr-1" />
                                  {userData.helpfulVotesReceived} Helpful Votes
                                </Badge>
                                <Badge variant="outline">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  Joined {new Date(userData.createdAt).toLocaleDateString()}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <Separator />

                      {/* Save Extended Profile Button */}
                      <div className="flex justify-end">
                        <Button 
                          onClick={handleSaveExtendedProfile} 
                          disabled={isLoading}
                          className="flex items-center gap-2"
                        >
                          <Save className="h-4 w-4" />
                          {isLoading ? 'Saving...' : 'Save Extended Profile'}
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security Settings
                  </CardTitle>
                  <CardDescription>
                    Manage your account security and authentication
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Password Change */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Change Password</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input id="currentPassword" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input id="newPassword" type="password" />
                      </div>
                    </div>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Key className="h-4 w-4" />
                      Update Password
                    </Button>
                  </div>

                  <Separator />

                  {/* Two-Factor Authentication */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Two-Factor Authentication</h3>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Two-Factor Authentication</p>
                        <p className="text-sm text-muted-foreground">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <Button variant="outline">Enable 2FA</Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Connected Accounts */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Connected Accounts</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">G</span>
                          </div>
                          <div>
                            <p className="font-medium">Google</p>
                            <p className="text-sm text-muted-foreground">Connected</p>
                          </div>
                        </div>
                        <Badge variant="secondary">Connected</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription>
                    Manage how you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications via email
                        </p>
                      </div>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Push Notifications</p>
                        <p className="text-sm text-muted-foreground">
                          Receive push notifications in your browser
                        </p>
                      </div>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Testing Task Updates</p>
                        <p className="text-sm text-muted-foreground">
                          Get notified about new testing tasks and updates
                        </p>
                      </div>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Preferences
                  </CardTitle>
                  <CardDescription>
                    Customize your experience and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Language</p>
                        <p className="text-sm text-muted-foreground">
                          Choose your preferred language
                        </p>
                      </div>
                      <Button variant="outline" size="sm">English</Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Theme</p>
                        <p className="text-sm text-muted-foreground">
                          Choose your preferred theme
                        </p>
                      </div>
                      <Button variant="outline" size="sm">Dark</Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Time Zone</p>
                        <p className="text-sm text-muted-foreground">
                          Set your local time zone
                        </p>
                      </div>
                      <Button variant="outline" size="sm">UTC+7</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="border-destructive">
                <CardHeader>
                  <CardTitle className="text-destructive flex items-center gap-2">
                    <Trash2 className="h-5 w-5" />
                    Danger Zone
                  </CardTitle>
                  <CardDescription>
                    Irreversible and destructive actions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-destructive rounded-lg">
                      <div>
                        <p className="font-medium text-destructive">Delete Account</p>
                        <p className="text-sm text-muted-foreground">
                          Permanently delete your account and all associated data
                        </p>
                      </div>
                      <Button 
                        variant="destructive" 
                        onClick={handleDeleteAccount}
                        disabled={isLoading}
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
