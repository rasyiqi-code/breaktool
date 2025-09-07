'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, CheckCircle, AlertCircle } from "lucide-react";
import { useRouter } from 'next/navigation';
import { RequireAuth } from '@/components/require-auth';
import { useUser } from '@stackframe/stack';

interface VerificationForm {
  expertise_areas: string[];
  company: string;
  job_title: string;
  linkedin_url: string;
  website_url: string;
  portfolio_url: string;
  motivation: string;
  experience_years: number;
  previous_reviews: string;
}

const EXPERTISE_AREAS = [
  'Web Development', 'Mobile Development', 'Data Science', 'AI/ML',
  'DevOps', 'Cybersecurity', 'Product Management', 'UX/UI Design',
  'Marketing Tools', 'Analytics Tools', 'Communication Tools',
  'Project Management', 'Design Tools', 'Other'
];

export default function ApplyVerificationPage() {
  const router = useRouter();
  const user = useUser();
  const [formData, setFormData] = useState<VerificationForm>({
    expertise_areas: [],
    company: '',
    job_title: '',
    linkedin_url: '',
    website_url: '',
    portfolio_url: '',
    motivation: '',
    experience_years: 1,
    previous_reviews: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [existingApplication, setExistingApplication] = useState<{
    id: string;
    userId: string;
    expertiseAreas: string[];
    company: string | null;
    jobTitle: string | null;
    linkedinUrl: string | null;
    websiteUrl: string | null;
    portfolioUrl: string | null;
    motivation: string | null;
    experienceYears: number | null;
    previousReviews: string | null;
    status: string;
    reviewedBy: string | null;
    reviewedAt: string | null;
    reviewNotes: string | null;
    createdAt: string;
    updatedAt: string;
  } | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [userData, setUserData] = useState<{
    id: string;
    name?: string;
    email: string;
    avatarUrl?: string;
    role: string;
    company?: string;
    jobTitle?: string;
    linkedinUrl?: string;
    websiteUrl?: string;
    portfolioUrl?: string;
    expertise?: string[];
    experienceYears?: number;
    previousReviews?: string;
  } | null>(null);

  const handleInputChange = (field: keyof VerificationForm, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleExpertiseToggle = (area: string) => {
    setFormData(prev => ({
      ...prev,
      expertise_areas: prev.expertise_areas.includes(area)
        ? prev.expertise_areas.filter(a => a !== area)
        : [...prev.expertise_areas, area]
    }));
  };

  // Fetch user data from database
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) return;
      
      try {
        const response = await fetch(`/api/users/get-user-profile?userId=${user.id}`);
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setUserData(result.user);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [user?.id]);

  // Check existing application status on component mount
  useEffect(() => {
    const checkExistingApplication = async () => {
      if (!user?.id) {
        setCheckingStatus(false);
        return;
      }

      try {
        const response = await fetch(`/api/users/apply-verification?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.application) {
            setExistingApplication(data.application);
            // Pre-fill form with existing data
            setFormData({
              expertise_areas: data.application.expertiseAreas || [],
              company: data.application.company || '',
              job_title: data.application.jobTitle || '',
              linkedin_url: data.application.linkedinUrl || '',
              website_url: data.application.websiteUrl || '',
              portfolio_url: data.application.portfolioUrl || '',
              motivation: data.application.motivation || '',
              experience_years: data.application.experienceYears || 1,
              previous_reviews: data.application.previousReviews || ''
            });
          }
        }
      } catch (error) {
        console.error('Error checking existing application:', error);
      } finally {
        setCheckingStatus(false);
      }
    };

    checkExistingApplication();
  }, [user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      setError('User not authenticated');
      return;
    }

    console.log('Submitting application for user:', { id: user.id, email: user.primaryEmail, name: user.displayName });

    if (formData.expertise_areas.length === 0) {
      setError('Please select at least one expertise area');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // First, sync user with database to ensure they exist
      console.log('🔄 Syncing user with database...');
      const syncResponse = await fetch('/api/users/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!syncResponse.ok) {
        const syncError = await syncResponse.json();
        console.error('Failed to sync user:', syncError);
        setError('Failed to sync user. Please try again.');
        return;
      }

      const syncResult = await syncResponse.json();
      console.log('✅ User synced:', syncResult.user);

      const requestBody = {
        userId: user.id,
        ...formData
      };
      console.log('Request body:', requestBody);

      const response = await fetch('/api/users/apply-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to submit application');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking application status or user data
  if (checkingStatus || !userData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold">Checking application status...</h2>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show message for already verified testers
  if (userData?.role === 'verified_tester') {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div>
                    <CardTitle className="text-green-600">Already Verified</CardTitle>
                    <CardDescription>
                      You are already approved as a verified tester
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Congratulations! You have already been approved as a verified tester. 
                  You now have access to premium testing tools and can participate in advanced testing activities.
                </p>
                <div className="flex gap-4">
                  <Button onClick={() => router.push('/dashboard')}>
                    Go to Dashboard
                  </Button>
                  <Button onClick={() => router.push('/apply-vendor')} variant="outline">
                    Apply as Vendor
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Show existing application status
  if (existingApplication) {
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'approved': return 'text-green-600 bg-green-50 border-green-200';
        case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
        case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        default: return 'text-gray-600 bg-gray-50 border-gray-200';
      }
    };

    const getStatusText = (status: string) => {
      switch (status) {
        case 'approved': return 'Approved';
        case 'rejected': return 'Rejected';
        case 'pending': return 'Under Review';
        default: return 'Unknown';
      }
    };

    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold">Application Status</h1>
              <p className="text-muted-foreground mt-2">
                Your verified tester application has been submitted and is currently being reviewed.
              </p>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Application Details</CardTitle>
                    <CardDescription>
                      Submitted on {new Date(existingApplication.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(existingApplication.status)}`}>
                    {getStatusText(existingApplication.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Display application data in read-only format */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Company</Label>
                    <p className="mt-1">{existingApplication.company}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Job Title</Label>
                    <p className="mt-1">{existingApplication.jobTitle}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Areas of Expertise</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {existingApplication.expertiseAreas?.map((area: string) => (
                      <Badge key={area} variant="outline">{area}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Motivation</Label>
                  <p className="mt-1">{existingApplication.motivation}</p>
                </div>

                {existingApplication.reviewNotes && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Review Notes</Label>
                    <p className="mt-1 p-3 bg-muted rounded-md">{existingApplication.reviewNotes}</p>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <Button onClick={() => router.push('/dashboard')} variant="outline">
                    Back to Dashboard
                  </Button>
                  {existingApplication.status === 'rejected' && (
                    <Button onClick={() => window.location.reload()}>
                      Apply Again
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Application Submitted!</h2>
            <p className="text-muted-foreground mb-4">
              Your verification request has been submitted successfully. 
              We&apos;ll review your application and get back to you soon.
            </p>
            <Button onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <RequireAuth redirectTo="/sign-in">
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold">Apply as Verified Tester</h1>
              <p className="text-muted-foreground mt-2">
                Complete this form to apply for verified tester status. 
                This will give you access to premium testing tools and features.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Verification Application</CardTitle>
                <CardDescription>
                  Please provide detailed information about your expertise and experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Expertise Areas */}
                  <div className="space-y-3">
                    <Label>Areas of Expertise *</Label>
                    <div className="flex flex-wrap gap-2">
                      {EXPERTISE_AREAS.map((area) => (
                        <Badge
                          key={area}
                          variant={formData.expertise_areas.includes(area) ? "default" : "outline"}
                          className="cursor-pointer hover:bg-primary/10"
                          onClick={() => handleExpertiseToggle(area)}
                        >
                          {area}
                          {formData.expertise_areas.includes(area) && (
                            <X className="h-3 w-3 ml-1" />
                          )}
                        </Badge>
                      ))}
                    </div>
                    {formData.expertise_areas.length === 0 && (
                      <p className="text-sm text-red-500">Please select at least one expertise area</p>
                    )}
                  </div>

                  {/* Company & Job Title */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company">Company *</Label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                        placeholder="Your company name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="job_title">Job Title *</Label>
                      <Input
                        id="job_title"
                        value={formData.job_title}
                        onChange={(e) => handleInputChange('job_title', e.target.value)}
                        placeholder="e.g., Senior Developer"
                        required
                      />
                    </div>
                  </div>

                  {/* Experience Years */}
                  <div className="space-y-2">
                    <Label htmlFor="experience_years">Years of Experience *</Label>
                    <Select
                      value={formData.experience_years.toString()}
                      onValueChange={(value) => handleInputChange('experience_years', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year} {year === 1 ? 'year' : 'years'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* URLs */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="linkedin_url">LinkedIn Profile URL *</Label>
                      <Input
                        id="linkedin_url"
                        type="url"
                        value={formData.linkedin_url}
                        onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                        placeholder="https://linkedin.com/in/yourprofile"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website_url">Personal Website</Label>
                      <Input
                        id="website_url"
                        type="url"
                        value={formData.website_url}
                        onChange={(e) => handleInputChange('website_url', e.target.value)}
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="portfolio_url">Portfolio URL</Label>
                      <Input
                        id="portfolio_url"
                        type="url"
                        value={formData.portfolio_url}
                        onChange={(e) => handleInputChange('portfolio_url', e.target.value)}
                        placeholder="https://yourportfolio.com"
                      />
                    </div>
                  </div>

                  {/* Motivation */}
                  <div className="space-y-2">
                    <Label htmlFor="motivation">Why do you want to be a verified tester? *</Label>
                    <Textarea
                      id="motivation"
                      value={formData.motivation}
                      onChange={(e) => handleInputChange('motivation', e.target.value)}
                      placeholder="Tell us about your motivation and what you hope to contribute..."
                      rows={4}
                      required
                    />
                  </div>

                  {/* Previous Reviews */}
                  <div className="space-y-2">
                    <Label htmlFor="previous_reviews">Previous Review Experience</Label>
                    <Textarea
                      id="previous_reviews"
                      value={formData.previous_reviews}
                      onChange={(e) => handleInputChange('previous_reviews', e.target.value)}
                      placeholder="Describe any previous experience with reviewing tools, products, or services..."
                      rows={3}
                    />
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-700">{error}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push('/dashboard')}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading || formData.expertise_areas.length === 0}
                      className="flex-1"
                    >
                      {loading ? 'Submitting...' : 'Submit Application'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
