'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@stackframe/stack';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Star, Clock, DollarSign, Users, Building, FileText, Target, ThumbsUp, ThumbsDown, Award } from "lucide-react";

interface ReviewFormData {
  title: string;
  content: string;
  value_score: number;
  usage_score: number;
  integration_score: number;
  pain_points: string;
  setup_time: string;
  roi_story: string;
  usage_recommendations: string;
  weaknesses: string;
  pros: string[];
  cons: string[];
  recommendation: 'keep' | 'try' | 'stop';
  use_case: string;
  company_size: string;
  industry: string;
  usage_duration: string;
  pricing_model: 'free' | 'freemium' | 'paid' | 'enterprise';
  starting_price: number;
  pricing_details: string;
  review_type: 'admin' | 'verified_tester' | 'community';
}

interface ReviewFormProps {
  toolId: string;
  toolName: string;
  onSubmit: (data: ReviewFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ReviewForm({ toolName, onSubmit, onCancel, isLoading = false }: ReviewFormProps) {
  const user = useUser();
  const [, setUserData] = useState<{
    id: string;
    name?: string;
    email: string;
    role: string;
    is_verified_tester?: boolean;
    verification_status?: string;
  } | null>(null);
  const [formData, setFormData] = useState<ReviewFormData>({
    title: '',
    content: '',
    value_score: 5,
    usage_score: 5,
    integration_score: 5,
    pain_points: '',
    setup_time: '',
    roi_story: '',
    usage_recommendations: '',
    weaknesses: '',
    pros: [],
    cons: [],
    recommendation: 'try',
    use_case: '',
    company_size: '',
    industry: '',
    usage_duration: '',
    pricing_model: 'free',
    starting_price: 0,
    pricing_details: '',
    review_type: 'community'
  });

  const [newPro, setNewPro] = useState('');
  const [newCon, setNewCon] = useState('');

  // Fetch user data and set review type automatically
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) return;
      
      try {
        const response = await fetch(`/api/users/get-user-profile?userId=${user.id}`);
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setUserData(result.user);
            
            // Determine review type based on user role
            let reviewType: 'admin' | 'verified_tester' | 'community' = 'community';
            
            if (result.user.role === 'admin' || result.user.role === 'super_admin') {
              reviewType = 'admin';
            } else if (result.user.is_verified_tester && result.user.verification_status === 'approved') {
              reviewType = 'verified_tester';
            }
            
            setFormData(prev => ({
              ...prev,
              review_type: reviewType
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const addPro = () => {
    if (newPro.trim()) {
      setFormData(prev => ({
        ...prev,
        pros: [...prev.pros, newPro.trim()]
      }));
      setNewPro('');
    }
  };

  const removePro = (index: number) => {
    setFormData(prev => ({
      ...prev,
      pros: prev.pros.filter((_, i) => i !== index)
    }));
  };

  const addCon = () => {
    if (newCon.trim()) {
      setFormData(prev => ({
        ...prev,
        cons: [...prev.cons, newCon.trim()]
      }));
      setNewCon('');
    }
  };

  const removeCon = (index: number) => {
    setFormData(prev => ({
      ...prev,
      cons: prev.cons.filter((_, i) => i !== index)
    }));
  };

  const overallScore = Math.round((formData.value_score + formData.usage_score + formData.integration_score) / 3);

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-4">
      {/* Header Section */}
      <div className="text-center space-y-2 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold">Write Your Review</h2>
        </div>
        <p className="text-lg text-muted-foreground">
          Share your experience with <span className="font-semibold text-blue-600">{toolName}</span>
        </p>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          Help others make informed decisions by sharing your honest and detailed experience.
        </p>
      </div>

      {/* Basic Review Info */}
      <Card className="border-2 border-blue-100 dark:border-blue-900">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
          <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
            <FileText className="w-5 h-5" />
            Basic Review Information
          </CardTitle>
          <CardDescription>
            Start with the essential details of your review
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="space-y-3">
            <div>
              <Label htmlFor="title" className="text-sm font-medium">Review Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Brief summary of your experience"
                className="mt-1 h-10 text-sm"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="content" className="text-sm font-medium">Detailed Review</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Share your detailed experience with this tool..."
                rows={4}
                className="mt-1 text-sm resize-none"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scoring Section */}
      <Card className="border-2 border-yellow-100 dark:border-yellow-900">
        <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950">
          <CardTitle className="flex items-center gap-2 text-yellow-900 dark:text-yellow-100">
            <Star className="w-5 h-5" />
            Scoring & Ratings (1-10)
          </CardTitle>
          <CardDescription>
            Rate different aspects of the tool
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                Value for Money
              </Label>
              <div className="flex items-center gap-2">
                <Slider
                  value={[formData.value_score]}
                  onValueChange={([value]) => setFormData(prev => ({ ...prev, value_score: value }))}
                  max={10}
                  min={1}
                  step={1}
                  className="flex-1"
                />
                <Badge variant="secondary" className="w-10 h-6 text-center text-sm font-semibold">
                  {formData.value_score}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                Ease of Use
              </Label>
              <div className="flex items-center gap-2">
                <Slider
                  value={[formData.usage_score]}
                  onValueChange={([value]) => setFormData(prev => ({ ...prev, usage_score: value }))}
                  max={10}
                  min={1}
                  step={1}
                  className="flex-1"
                />
                <Badge variant="secondary" className="w-10 h-6 text-center text-sm font-semibold">
                  {formData.usage_score}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-base font-medium flex items-center gap-2">
                <Building className="w-4 h-4 text-purple-600" />
                Integration
              </Label>
              <div className="flex items-center gap-2">
                <Slider
                  value={[formData.integration_score]}
                  onValueChange={([value]) => setFormData(prev => ({ ...prev, integration_score: value }))}
                  max={10}
                  min={1}
                  step={1}
                  className="flex-1"
                />
                <Badge variant="secondary" className="w-10 h-6 text-center text-sm font-semibold">
                  {formData.integration_score}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <span className="text-base font-semibold text-yellow-900 dark:text-yellow-100">Overall Score:</span>
            <Badge variant="default" className="text-lg px-4 py-1 bg-yellow-600 hover:bg-yellow-700">
                              {overallScore ? overallScore.toFixed(1) : 'N/A'}/10
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis */}
      <Card className="border-2 border-green-100 dark:border-green-900">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
          <CardTitle className="flex items-center gap-2 text-green-900 dark:text-green-100">
            <Target className="w-5 h-5" />
            Detailed Analysis
          </CardTitle>
          <CardDescription>
            Provide specific insights about your experience
          </CardDescription>
        </CardHeader>
                 <CardContent className="space-y-4 pt-4">
           <div className="space-y-3">
             <div>
               <Label htmlFor="pain_points" className="text-sm font-medium">What problem did this tool solve for you?</Label>
               <Textarea
                 id="pain_points"
                 value={formData.pain_points}
                 onChange={(e) => setFormData(prev => ({ ...prev, pain_points: e.target.value }))}
                 placeholder="Describe the specific problem or pain point this tool helped you solve..."
                 rows={2}
                 className="mt-1 text-sm resize-none"
               />
             </div>
             
             <div>
               <Label htmlFor="roi_story" className="text-sm font-medium">ROI or Time/Money Savings</Label>
               <Textarea
                 id="roi_story"
                 value={formData.roi_story}
                 onChange={(e) => setFormData(prev => ({ ...prev, roi_story: e.target.value }))}
                 placeholder="Share a specific story about how this tool saved you time or money..."
                 rows={2}
                 className="mt-1 text-sm resize-none"
               />
             </div>
             
             <div>
               <Label htmlFor="setup_time" className="text-sm font-medium flex items-center gap-2">
                 <Clock className="w-4 h-4" />
                 Setup Time
               </Label>
               <Input
                 id="setup_time"
                 value={formData.setup_time}
                 onChange={(e) => setFormData(prev => ({ ...prev, setup_time: e.target.value }))}
                 placeholder="e.g., 2 hours, 1 day, 1 week..."
                 className="mt-1 h-10 text-sm"
               />
             </div>
             
             <div>
               <Label htmlFor="usage_recommendations" className="text-sm font-medium">Who would you recommend this tool to?</Label>
               <Textarea
                 id="usage_recommendations"
                 value={formData.usage_recommendations}
                 onChange={(e) => setFormData(prev => ({ ...prev, usage_recommendations: e.target.value }))}
                 placeholder="e.g., Small marketing teams, solo entrepreneurs, enterprise companies..."
                 rows={2}
                 className="mt-1 text-sm resize-none"
               />
             </div>
             
             <div>
               <Label htmlFor="weaknesses" className="text-sm font-medium">What are the biggest weaknesses or limitations?</Label>
               <Textarea
                 id="weaknesses"
                 value={formData.weaknesses}
                 onChange={(e) => setFormData(prev => ({ ...prev, weaknesses: e.target.value }))}
                 placeholder="Be honest about the tool's limitations..."
                 rows={2}
                 className="mt-1 text-sm resize-none"
               />
             </div>
           </div>
         </CardContent>
      </Card>

      {/* Pros and Cons */}
      <Card className="border-2 border-purple-100 dark:border-purple-900">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
          <CardTitle className="flex items-center gap-2 text-purple-900 dark:text-purple-100">
            <ThumbsUp className="w-5 h-5" />
            Pros & Cons
          </CardTitle>
          <CardDescription>
            List the key advantages and disadvantages
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-green-700 dark:text-green-300 flex items-center gap-2 text-sm">
                <ThumbsUp className="w-4 h-4" />
                Pros
              </h4>
              <div className="space-y-2">
                {formData.pros.map((pro, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950 rounded border border-green-200 dark:border-green-800">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></div>
                    <span className="flex-1 text-xs">{pro}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePro(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 h-6 w-6 p-0"
                    >
                      ×
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    value={newPro}
                    onChange={(e) => setNewPro(e.target.value)}
                    placeholder="Add a pro..."
                    className="flex-1 h-8 text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPro())}
                  />
                  <Button type="button" onClick={addPro} size="sm" className="bg-green-600 hover:bg-green-700 h-8 px-3">
                    Add
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-red-700 dark:text-red-300 flex items-center gap-2 text-sm">
                <ThumbsDown className="w-4 h-4" />
                Cons
              </h4>
              <div className="space-y-2">
                {formData.cons.map((con, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-950 rounded border border-red-200 dark:border-red-800">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0"></div>
                    <span className="flex-1 text-xs">{con}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCon(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 h-6 w-6 p-0"
                    >
                      ×
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    value={newCon}
                    onChange={(e) => setNewCon(e.target.value)}
                    placeholder="Add a con..."
                    className="flex-1 h-8 text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCon())}
                  />
                  <Button type="button" onClick={addCon} size="sm" className="bg-red-600 hover:bg-red-700 h-8 px-3">
                    Add
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Context Information */}
      <Card className="border-2 border-indigo-100 dark:border-indigo-900">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950 dark:to-blue-950">
          <CardTitle className="flex items-center gap-2 text-indigo-900 dark:text-indigo-100">
            <Users className="w-5 h-5" />
            Your Context
          </CardTitle>
          <CardDescription>
            Help others understand your perspective
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company_size" className="text-sm font-medium">Company Size</Label>
              <Select
                value={formData.company_size}
                onValueChange={(value) => setFormData(prev => ({ ...prev, company_size: value }))}
              >
                <SelectTrigger className="mt-1 h-10 text-sm">
                  <SelectValue placeholder="Select company size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-10">1-10 employees</SelectItem>
                  <SelectItem value="11-50">11-50 employees</SelectItem>
                  <SelectItem value="51-200">51-200 employees</SelectItem>
                  <SelectItem value="201-1000">201-1000 employees</SelectItem>
                  <SelectItem value="1000+">1000+ employees</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="industry" className="text-sm font-medium">Industry</Label>
              <Input
                id="industry"
                value={formData.industry}
                onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                placeholder="e.g., SaaS, E-commerce, Agency..."
                className="mt-1 h-10 text-sm"
              />
            </div>
            
            <div>
              <Label htmlFor="usage_duration" className="text-sm font-medium">Usage Duration</Label>
              <Select
                value={formData.usage_duration}
                onValueChange={(value) => setFormData(prev => ({ ...prev, usage_duration: value }))}
              >
                <SelectTrigger className="mt-1 h-10 text-sm">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="less-than-1-month">Less than 1 month</SelectItem>
                  <SelectItem value="1-6-months">1-6 months</SelectItem>
                  <SelectItem value="6-12-months">6-12 months</SelectItem>
                  <SelectItem value="1-2-years">1-2 years</SelectItem>
                  <SelectItem value="2+ years">2+ years</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="use_case" className="text-sm font-medium">Primary Use Case</Label>
              <Input
                id="use_case"
                value={formData.use_case}
                onChange={(e) => setFormData(prev => ({ ...prev, use_case: e.target.value }))}
                placeholder="e.g., Project management, Customer support..."
                className="mt-1 h-10 text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Information */}
      <Card className="border-2 border-green-100 dark:border-green-900">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
          <CardTitle className="flex items-center gap-2 text-green-900 dark:text-green-100">
            <DollarSign className="w-5 h-5" />
            Pricing Information
          </CardTitle>
          <CardDescription>
            Share pricing details and cost considerations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pricing_model" className="text-sm font-medium">Pricing Model</Label>
              <Select
                value={formData.pricing_model}
                onValueChange={(value: 'free' | 'freemium' | 'paid' | 'enterprise') => setFormData(prev => ({ ...prev, pricing_model: value }))}
              >
                <SelectTrigger className="mt-1 h-10 text-sm">
                  <SelectValue placeholder="Select pricing model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="freemium">Freemium</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="starting_price" className="text-sm font-medium">Starting Price (USD/month)</Label>
              <Input
                id="starting_price"
                type="number"
                min="0"
                step="0.01"
                value={formData.starting_price}
                onChange={(e) => setFormData(prev => ({ ...prev, starting_price: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
                className="mt-1 h-10 text-sm"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="pricing_details" className="text-sm font-medium">Pricing Details</Label>
            <Textarea
              id="pricing_details"
              value={formData.pricing_details}
              onChange={(e) => setFormData(prev => ({ ...prev, pricing_details: e.target.value }))}
              placeholder="Share pricing details, plans, cost considerations, ROI insights..."
              rows={3}
              className="mt-1 text-sm resize-none"
            />
          </div>
        </CardContent>
      </Card>



      {/* Final Recommendation */}
      <Card className="border-2 border-orange-100 dark:border-orange-900">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950">
          <CardTitle className="flex items-center gap-2 text-orange-900 dark:text-orange-100">
            <Award className="w-5 h-5" />
            Final Recommendation
          </CardTitle>
          <CardDescription>
            Your overall recommendation for this tool
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
              formData.recommendation === 'keep' 
                ? 'border-green-500 bg-green-50 dark:bg-green-950 shadow-lg' 
                : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
            }`} onClick={() => setFormData(prev => ({ ...prev, recommendation: 'keep' }))}>
              <div className="text-center space-y-2">
                <div className="text-3xl">🟢</div>
                <div className="font-semibold text-base">Keep</div>
                <div className="text-xs text-muted-foreground">Highly recommend</div>
              </div>
            </div>
            
            <div className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
              formData.recommendation === 'try' 
                ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950 shadow-lg' 
                : 'border-gray-200 dark:border-gray-700 hover:border-yellow-300'
            }`} onClick={() => setFormData(prev => ({ ...prev, recommendation: 'try' }))}>
              <div className="text-center space-y-2">
                <div className="text-3xl">🟡</div>
                <div className="font-semibold text-base">Try</div>
                <div className="text-xs text-muted-foreground">Worth testing</div>
              </div>
            </div>
            
            <div className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
              formData.recommendation === 'stop' 
                ? 'border-red-500 bg-red-50 dark:bg-red-950 shadow-lg' 
                : 'border-gray-200 dark:border-gray-700 hover:border-red-300'
            }`} onClick={() => setFormData(prev => ({ ...prev, recommendation: 'stop' }))}>
              <div className="text-center space-y-2">
                <div className="text-3xl">🔴</div>
                <div className="font-semibold text-base">Stop</div>
                <div className="text-xs text-muted-foreground">Not recommended</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="px-6 py-2 text-sm font-medium"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading}
          className="px-6 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? 'Submitting...' : 'Submit Review'}
        </Button>
      </div>
    </form>
  );
}
