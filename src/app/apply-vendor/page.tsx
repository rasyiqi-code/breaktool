'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@stackframe/stack';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Building2, Globe, Linkedin, Award, CheckCircle, Clock, XCircle } from "lucide-react";
import { useMultiRole } from '@/hooks/use-multi-role';

interface VendorApplicationFormData {
  company_name: string;
  company_size: string;
  industry: string;
  website_url: string;
  linkedin_url: string;
  company_description: string;
  products_services: string;
  target_audience: string;
  business_model: string;
  motivation: string;
}

const companySizes = [
  '1-10 employees',
  '11-50 employees', 
  '51-200 employees',
  '201-500 employees',
  '500+ employees'
];

const industries = [
  'SaaS & Technology',
  'E-commerce',
  'Healthcare',
  'Finance',
  'Education',
  'Marketing & Advertising',
  'Design & Creative',
  'Consulting',
  'Manufacturing',
  'Other'
];

const businessModels = [
  'Subscription (SaaS)',
  'One-time purchase',
  'Freemium',
  'Enterprise licensing',
  'Marketplace',
  'Other'
];

export default function ApplyVendorPage() {
  const router = useRouter();
  const user = useUser();
  const { hasRole } = useMultiRole();
  const [formData, setFormData] = useState<VendorApplicationFormData>({
    company_name: '',
    company_size: '',
    industry: '',
    website_url: '',
    linkedin_url: '',
    company_description: '',
    products_services: '',
    target_audience: '',
    business_model: '',
    motivation: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [existingApplication, setExistingApplication] = useState<{
    id: string;
    userId: string;
    companyName: string;
    companySize: string;
    industry: string;
    websiteUrl: string;
    linkedinUrl: string | null;
    companyDescription: string;
    productsServices: string;
    targetAudience: string;
    businessModel: string;
    motivation: string;
    status: string;
    reviewNotes: string | null;
    createdAt: string;
    updatedAt: string;
  } | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);

  const checkExistingApplication = useCallback(async () => {
    if (!user) return;
    
    try {
      // Check if user already has vendor role
      if (hasRole('vendor')) {
        // User already has vendor role, show approved status
        const approvedApplication = {
          id: 'vendor-' + user.id,
          userId: user.id,
          companyName: 'Vendor Account',
          companySize: 'N/A',
          industry: 'N/A',
          websiteUrl: 'N/A',
          linkedinUrl: null,
          companyDescription: 'Vendor account',
          productsServices: 'N/A',
          targetAudience: 'N/A',
          businessModel: 'N/A',
          motivation: 'N/A',
          status: 'approved',
          reviewNotes: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setExistingApplication(approvedApplication);
        return;
      }
      
      // First sync user to ensure we have latest data
      const syncResponse = await fetch('/api/users/sync', { method: 'POST' });
      if (!syncResponse.ok) {
        console.error('Failed to sync user');
      }
      
      // Then check for existing application
      const response = await fetch(`/api/users/apply-vendor?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        console.log('📋 Vendor application data:', data);
        if (data) {
          setExistingApplication(data);
        }
      } else {
        console.error('Failed to fetch vendor application:', response.status);
      }
    } catch (error) {
      console.error('Error checking existing application:', error);
    } finally {
      setCheckingStatus(false);
    }
  }, [user, hasRole]);

  useEffect(() => {
    if (user) {
      checkExistingApplication();
    }
  }, [user, checkExistingApplication]);

  const handleInputChange = (field: keyof VendorApplicationFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // First sync user to database
      await fetch('/api/users/sync', { method: 'POST' });

      if (!user) {
        setError('User not authenticated');
        return;
      }

      const response = await fetch('/api/users/apply-vendor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          ...formData
        }),
      });

             if (response.ok) {
         const responseData = await response.json();
         setSuccess(true);
         
         // Set the existing application data so user sees status immediately
         if (responseData.application) {
           setExistingApplication({
             ...responseData.application,
             reviewNotes: null
           });
         }
         
         // Don't redirect - user now sees application status
       } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      setError('Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  if (checkingStatus) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Checking application status...</p>
        </div>
      </div>
    );
  }

     if (existingApplication) {
     return (
       <div className="min-h-screen bg-background flex items-center justify-center">
         <div className="w-full max-w-2xl px-4">
           <Card>
             <CardHeader className="text-center space-y-4">
               <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                 <Award className="h-8 w-8 text-primary" />
               </div>
               <div>
                 <CardTitle className="text-2xl">Vendor Application Status</CardTitle>
                 <CardDescription>
                   Your vendor application has been submitted
                 </CardDescription>
               </div>
             </CardHeader>
             <CardContent className="space-y-6">
               <div className="text-center">
                 <Badge 
                   variant={existingApplication.status === 'approved' ? 'default' : 
                           existingApplication.status === 'rejected' ? 'destructive' : 'secondary'}
                   className="text-lg px-6 py-3"
                 >
                   {existingApplication.status === 'approved' ? (
                     <div className="flex items-center gap-2">
                       <CheckCircle className="h-5 w-5" />
                       Approved
                     </div>
                   ) : existingApplication.status === 'rejected' ? (
                     <div className="flex items-center gap-2">
                       <XCircle className="h-5 w-5" />
                       Rejected
                     </div>
                   ) : (
                     <div className="flex items-center gap-2">
                       <Clock className="h-5 w-5" />
                       Under Review
                     </div>
                   )}
                 </Badge>
               </div>

               {existingApplication.status === 'approved' && (
                 <div className="text-center space-y-4">
                   <p className="text-green-600 font-medium">
                     Congratulations! You are now a vendor and can submit tools.
                   </p>
                   <Button onClick={() => router.push('/submit')} className="px-8">
                     Submit Your First Tool
                   </Button>
                 </div>
               )}

               {existingApplication.status === 'rejected' && (
                 <div className="space-y-4">
                   <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg">
                     <h4 className="font-medium text-destructive mb-2">Application Rejected</h4>
                     {existingApplication.reviewNotes && (
                       <p className="text-destructive/80">{existingApplication.reviewNotes}</p>
                     )}
                   </div>
                   <Button onClick={() => window.location.reload()} className="w-full">
                     Apply Again
                   </Button>
                 </div>
               )}

               {existingApplication.status === 'pending' && (
                 <div className="text-center space-y-4">
                   <p className="text-blue-600">
                     Your application is currently under review. We&apos;ll notify you once a decision is made.
                   </p>
                   <Button variant="outline" onClick={() => router.push('/dashboard')} className="w-full">
                     Back to Dashboard
                   </Button>
                 </div>
               )}
             </CardContent>
           </Card>
         </div>
       </div>
     );
   }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">


        <div className="text-center mb-12">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <Building2 className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Apply as Vendor
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Become a vendor to submit and manage your SaaS tools on our platform. 
            Get access to our community of users and verified testers.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Application Form */}
          <div className="lg:col-span-2">
            <Card className="border-2">
              <CardHeader className="border-b bg-muted/50">
                <CardTitle className="text-2xl">Vendor Application</CardTitle>
                <CardDescription className="text-base">
                  Tell us about your company and why you want to join as a vendor
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Company Name *
                      </label>
                      <Input
                        required
                        value={formData.company_name}
                        onChange={(e) => handleInputChange('company_name', e.target.value)}
                        placeholder="Your company name"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Company Size *
                      </label>
                      <Select
                        value={formData.company_size}
                        onValueChange={(value) => handleInputChange('company_size', value)}
                        required
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select company size" />
                        </SelectTrigger>
                        <SelectContent>
                          {companySizes.map((size) => (
                            <SelectItem key={size} value={size}>
                              {size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Industry *
                      </label>
                      <Select
                        value={formData.industry}
                        onValueChange={(value) => handleInputChange('industry', value)}
                        required
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          {industries.map((industry) => (
                            <SelectItem key={industry} value={industry}>
                              {industry}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Business Model *
                      </label>
                      <Select
                        value={formData.business_model}
                        onValueChange={(value) => handleInputChange('business_model', value)}
                        required
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select business model" />
                        </SelectTrigger>
                        <SelectContent>
                          {businessModels.map((model) => (
                            <SelectItem key={model} value={model}>
                              {model}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Website URL *
                      </label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          required
                          type="url"
                          value={formData.website_url}
                          onChange={(e) => handleInputChange('website_url', e.target.value)}
                          placeholder="https://example.com"
                          className="pl-10 h-11"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        LinkedIn URL
                      </label>
                      <div className="relative">
                        <Linkedin className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="url"
                          value={formData.linkedin_url}
                          onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                          placeholder="https://linkedin.com/company/..."
                          className="pl-10 h-11"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Company Description *
                    </label>
                    <Textarea
                      required
                      value={formData.company_description}
                      onChange={(e) => handleInputChange('company_description', e.target.value)}
                      placeholder="Describe what your company does and its mission"
                      rows={3}
                      className="resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Products/Services *
                    </label>
                    <Textarea
                      required
                      value={formData.products_services}
                      onChange={(e) => handleInputChange('products_services', e.target.value)}
                      placeholder="What products or services does your company offer?"
                      rows={3}
                      className="resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Target Audience *
                    </label>
                    <Textarea
                      required
                      value={formData.target_audience}
                      onChange={(e) => handleInputChange('target_audience', e.target.value)}
                      placeholder="Who is your target audience? (e.g., small businesses, developers, marketers)"
                      rows={2}
                      className="resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Motivation *
                    </label>
                    <Textarea
                      required
                      value={formData.motivation}
                      onChange={(e) => handleInputChange('motivation', e.target.value)}
                      placeholder="Why do you want to join our platform as a vendor? What do you hope to achieve?"
                      rows={3}
                      className="resize-none"
                    />
                  </div>

                  {error && (
                    <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
                      {error}
                    </div>
                  )}

                                     {success && (
                     <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                       Application submitted successfully! Your application is now under review.
                     </div>
                   )}

                  <div className="flex gap-4 pt-4">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1 h-12 text-base"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Application'
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push('/dashboard')}
                      className="h-12 px-8"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Benefits Sidebar */}
          <div className="space-y-6">
            <Card className="border-2">
              <CardHeader className="border-b bg-muted/50">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Award className="h-5 w-5 text-primary" />
                  Vendor Benefits
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium text-foreground">Submit Tools</h4>
                    <p className="text-sm text-muted-foreground">Add your SaaS tools to our platform</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium text-foreground">Reach Users</h4>
                    <p className="text-sm text-muted-foreground">Connect with our community of users</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium text-foreground">Get Reviews</h4>
                    <p className="text-sm text-muted-foreground">Receive feedback from verified testers</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium text-foreground">Analytics</h4>
                    <p className="text-sm text-muted-foreground">Track tool performance and user engagement</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader className="border-b bg-muted/50">
                <CardTitle className="text-lg">Application Process</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/20 text-primary rounded-full flex items-center justify-center text-sm font-medium">1</div>
                  <span className="text-sm text-foreground">Submit your application</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/20 text-primary rounded-full flex items-center justify-center text-sm font-medium">2</div>
                  <span className="text-sm text-foreground">Our team reviews it</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/20 text-primary rounded-full flex items-center justify-center text-sm font-medium">3</div>
                  <span className="text-sm text-foreground">Get approved and start submitting tools</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
