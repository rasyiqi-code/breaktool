"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@stackframe/stack";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  Plus, 
  CheckCircle, 
  Info,
  Lightbulb,
  Target,
  Users,
  Building2,
  Shield,
  ArrowRight,
  Loader2
} from "lucide-react";
import { SubmissionsService } from "@/lib/services/vendor/submissions.service";
import type { Category } from "@/types/app";
import { useToast } from "@/hooks/use-toast";
import { ActivityIntegration } from "@/lib/utils/activity-integration";

export default function SubmitPage() {
  const router = useRouter();
  const user = useUser();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    website: "",
    description: "",
    long_description: "",
    category_id: "",
    logo_url: "",
    submitter_relationship: "",
    additional_info: "",
    agree_to_review: false
  });

  const checkUserAccess = useCallback(async () => {
    if (!user) return;
    
    try {
      // First sync user to database
      await fetch('/api/users/sync', { method: 'POST' });
      
      // Get user role from database
      const response = await fetch(`/api/users/${user.id}`);
      if (response.ok) {
        const userData = await response.json();
        setUserRole(userData.role);
      }
    } catch (error) {
      console.error('Error checking user access:', error);
    } finally {
      setCheckingAccess(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      checkUserAccess();
      loadCategories();
    } else {
      setCheckingAccess(false);
    }
  }, [user, checkUserAccess]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      setCategories(data.categories);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.agree_to_review) {
      toast({
        title: "Agreement Required",
        description: "Please agree to the review process before submitting.",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmitting(true);
      
      // Submit tool to API
      console.log('Submitting tool:', formData);

      // Production submission logic would go here
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "User not authenticated",
          variant: "destructive"
        });
        return;
      }
      
      const submissionData = {
        ...formData,
        submitted_by: user.id
      };

      await SubmissionsService.submitTool(submissionData);
      
      // Log the activity
      ActivityIntegration.logToolSubmissionFromPage(
        formData.name,
        ('name' in user ? (user as { name?: string }).name : null) || ('email' in user ? (user as { email?: string }).email : null) || 'Unknown User'
      );
      
      toast({
        title: "Tool Submitted Successfully",
        description: "Your tool has been submitted for review. We&apos;ll notify you once it&apos;s been processed.",
        variant: "default"
      });
      
      router.push('/dashboard');
      
    } catch (error) {
      console.error('Error submitting tool:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your tool. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (checkingAccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Checking access...</p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">


          <div className="max-w-2xl mx-auto">
            <Card className="border-2">
              <CardHeader className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Authentication Required</CardTitle>
                  <CardDescription>
                    You need to be logged in to submit tools
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Please sign in to your account to submit SaaS tools to our platform.
                </p>
                <Button onClick={() => router.push('/sign-in')} className="px-8">
                  Sign In
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Not a vendor
  if (userRole !== 'vendor' && userRole !== 'admin' && userRole !== 'super_admin') {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">


          <div className="max-w-2xl mx-auto">
            <Card className="border-2">
              <CardHeader className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Vendor Access Required</CardTitle>
                  <CardDescription>
                    You need vendor status to submit tools
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center space-y-4">
                  <p className="text-muted-foreground">
                    To submit tools to our platform, you need to apply for vendor status first.
                  </p>
                  
                  {userRole === 'user' && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-800 mb-2">Current Status: Regular User</h4>
                      <p className="text-blue-700 text-sm">
                        As a regular user, you can review tools and participate in discussions, 
                        but you need vendor status to submit your own tools.
                      </p>
                    </div>
                  )}

                  {userRole === 'verified_tester' && (
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h4 className="font-medium text-green-800 mb-2">Current Status: Verified Tester</h4>
                      <p className="text-green-700 text-sm">
                        Great! You&apos;re already a verified tester. Now apply for vendor status 
                        to submit your own tools to the platform, or Switch if you have applied as a vendor.
                      </p>
                    </div>
                  )}

                  <div className="space-y-3">
                    <Button 
                      onClick={() => router.push('/apply-vendor')}
                      className="w-full h-12"
                    >
                      <Building2 className="w-4 h-4 mr-2" />
                      Apply as Vendor
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={() => router.push('/dashboard')}
                      className="w-full h-12"
                    >
                      Back to Dashboard
                    </Button>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-medium mb-4">Vendor Benefits</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">Submit unlimited tools</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">Manage your tool listings</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">Access analytics dashboard</span>
                    </div>
                    {/* TODO: Featured placement feature - not implemented yet */}
                    {/* <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">Featured placement options</span>
                    </div> */}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Vendor access granted - show submit form
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        

        <div className="text-center mb-12">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <Plus className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Submit a SaaS Tool
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Help the community discover great SaaS tools by submitting your recommendation
          </p>
          
          {/* Vendor Status Badge */}
          <div className="mt-6">
            <Badge variant="default" className="text-sm px-4 py-2">
              <Building2 className="w-4 h-4 mr-2" />
              Vendor Access Granted
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Tool Information Form */}
          <div className="lg:col-span-2">
            <Card className="border-2">
              <CardHeader className="border-b bg-muted/50">
                <CardTitle className="text-2xl">Tool Information</CardTitle>
                <CardDescription className="text-base">
                  Provide details about the SaaS tool you&apos;d like to submit
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Tool Name *</Label>
                    <Input
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Notion, Figma, Slack"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website URL *</Label>
                    <Input
                      id="website"
                      required
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="https://example.com"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      required
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of what this tool does and its main benefits"
                      rows={4}
                      className="resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="long_description">Detailed Description</Label>
                    <Textarea
                      id="long_description"
                      value={formData.long_description}
                      onChange={(e) => setFormData(prev => ({ ...prev, long_description: e.target.value }))}
                      placeholder="Provide a more detailed description of the tool, its features, use cases, and benefits. This will be shown on the tool's detail page."
                      rows={6}
                      className="resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category_id}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="logo_url">Logo URL (Optional)</Label>
                    <Input
                      id="logo_url"
                      type="url"
                      value={formData.logo_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, logo_url: e.target.value }))}
                      placeholder="https://example.com/logo.png"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Submitter Relationship *</Label>
                    <RadioGroup
                      value={formData.submitter_relationship}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, submitter_relationship: value }))}
                      className="space-y-3"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="developer" id="developer" />
                        <Label htmlFor="developer">I&apos;m a developer/creator of this tool</Label>
                  </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="employee" id="employee" />
                        <Label htmlFor="employee">I work for the company that makes this tool</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="user" id="user" />
                        <Label htmlFor="user">I&apos;m a user of this tool</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="other" id="other" />
                        <Label htmlFor="other">Other relationship</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="additional_info">Additional Information</Label>
                    <Textarea
                      id="additional_info"
                      value={formData.additional_info}
                      onChange={(e) => setFormData(prev => ({ ...prev, additional_info: e.target.value }))}
                      placeholder="Any additional details, use cases, or specific features you&apos;d like to highlight"
                      rows={3}
                      className="resize-none"
                    />
                  </div>

                  <div className="flex items-start space-x-2 pt-4">
                    <Checkbox
                      id="agree_to_review"
                      checked={formData.agree_to_review}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, agree_to_review: checked as boolean }))
                      }
                    />
                    <Label htmlFor="agree_to_review" className="text-sm text-foreground">
                      I agree to the review process and understand that my submission will be reviewed 
                      by our team before being published
                    </Label>
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting || loading}
                    className="w-full h-12 text-base"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Submitting Tool...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Submit Tool
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Review Process Sidebar */}
          <div className="space-y-6">
            <Card className="border-2">
              <CardHeader className="border-b bg-muted/50">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Info className="h-5 w-5 text-primary" />
                  Review Process
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/20 text-primary rounded-full flex items-center justify-center text-sm font-medium">1</div>
                  <div>
                    <h4 className="font-medium text-foreground">Submission Review</h4>
                    <p className="text-sm text-muted-foreground">Our team reviews your submission for completeness and relevance</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/20 text-primary rounded-full flex items-center justify-center text-sm font-medium">2</div>
                  <div>
                    <h4 className="font-medium text-foreground">Expert Testing</h4>
                    <p className="text-sm text-muted-foreground">Admin and verified testers conduct in-depth reviews</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/20 text-primary rounded-full flex items-center justify-center text-sm font-medium">3</div>
                  <div>
                    <h4 className="font-medium text-foreground">Community Discussion</h4>
                    <p className="text-sm text-muted-foreground">Tool goes live for community reviews and discussions</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader className="border-b bg-muted/50">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Lightbulb className="h-5 w-5 text-yellow-600" />
                  Tips for Better Submissions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                <div className="flex items-start gap-2">
                  <Target className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-foreground">Be specific about what the tool does</span>
                </div>
                <div className="flex items-start gap-2">
                  <Users className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-foreground">Explain who would benefit from it</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-foreground">Include real use cases and examples</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
