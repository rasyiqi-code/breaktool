"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { 
  Heart, 
  ExternalLink, 
  Star, 
  TrendingUp, 
  DollarSign,
  Award,
  MessageSquare,
  PenTool,
  FileText,
  BarChart3,
  Plus,
  Edit3
} from "lucide-react";
// Removed direct service imports - using API routes instead
import { useUser } from "@stackframe/stack";
import { ReviewForm } from "@/components/reviews/review-form";
import { EnhancedReviewList } from "@/components/reviews/enhanced-review-list";
import { VerdictDisplay } from "@/components/verdict/verdict-display";
import { DiscussionListWithReactQuery } from "@/components/community/discussion-list-react-query";
import { DiscussionForm } from "@/components/community/discussion-form";
import { TesterReportList } from "@/components/testing/tester-report-list";
import { StructuredData } from "@/components/seo/structured-data";
import { Breadcrumb, BreadcrumbStructuredData } from "@/components/seo/breadcrumb";
import { RelatedToolsClient } from "@/components/seo/related-tools";
import Image from "next/image";
import Link from "next/link";

// Review form data interface
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

export default function ToolDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const user = useUser();
  
  const [tool, setTool] = useState<Record<string, unknown> | null>(null);
  const [reviews, setReviews] = useState<Record<string, unknown>[]>([]);
  const [toolStats, setToolStats] = useState<Record<string, unknown> | null>(null);
  const [reviewStats, setReviewStats] = useState<{keepCount: number, tryCount: number, stopCount: number}>({keepCount: 0, tryCount: 0, stopCount: 0});
  const [loading, setLoading] = useState(true);
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [upvoting, setUpvoting] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showDiscussionForm, setShowDiscussionForm] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [submittingDiscussion, setSubmittingDiscussion] = useState(false);
  const [activeTab, setActiveTab] = useState<'reviews' | 'discussions' | 'tester-reports'>('reviews');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [relatedTools, setRelatedTools] = useState<Record<string, unknown>[]>([]);
  const reviewFormRef = useRef<HTMLDivElement>(null);
  const discussionFormRef = useRef<HTMLDivElement>(null);

  const loadToolData = useCallback(async () => {
    try {
      setLoading(true);

      // Load tool details
      const toolResponse = await fetch(`/api/tools/${slug}`);
      if (!toolResponse.ok) {
        throw new Error('Tool not found');
      }
      
      const toolData = await toolResponse.json();
      setTool(toolData);

      // Load related tools
      try {
        const relatedResponse = await fetch(`/api/tools/related?category=${toolData.category}&exclude=${toolData.id}&limit=4`);
        if (relatedResponse.ok) {
          const relatedData = await relatedResponse.json();
          setRelatedTools(relatedData);
        }
      } catch (relatedError) {
        console.warn('Failed to load related tools:', relatedError);
      }

      // Load reviews and stats in parallel with error handling
      try {
        const [reviewsResponse, statsResponse, upvotesResponse] = await Promise.allSettled([
          fetch(`/api/community/reviews?toolId=${toolData.id}`),
          fetch(`/api/tools/stats?toolId=${toolData.id}`),
          user?.id ? fetch(`/api/tools/upvotes?userId=${user.id}`) : Promise.resolve(null)
        ]);

        if (reviewsResponse.status === 'fulfilled' && reviewsResponse.value.ok) {
          const reviewsData = await reviewsResponse.value.json();
          setReviews(reviewsData);
          
          // Calculate review stats
          const stats = reviewsData.reduce((acc: { keepCount: number; tryCount: number; stopCount: number; totalScore: number; count: number }, review: { recommendation: string; overallScore: number }) => {
            if (review.recommendation === 'keep') acc.keepCount++;
            else if (review.recommendation === 'try') acc.tryCount++;
            else if (review.recommendation === 'stop') acc.stopCount++;
            return acc;
          }, { keepCount: 0, tryCount: 0, stopCount: 0 });
          
          setReviewStats(stats);
        } else {
          console.warn('Failed to load reviews');
          setReviews([]);
        }

        if (statsResponse.status === 'fulfilled' && statsResponse.value.ok) {
          const statsData = await statsResponse.value.json();
          setToolStats(statsData);
        } else {
          console.warn('Failed to load stats');
          setToolStats(null);
        }

        if (upvotesResponse.status === 'fulfilled' && upvotesResponse.value?.ok) {
          const userUpvotes = await upvotesResponse.value.json();
          setIsUpvoted(userUpvotes.includes(toolData.id));
        }
      } catch (parallelError) {
        console.warn('Error loading reviews/stats:', parallelError);
        setReviews([]);
        setToolStats(null);
      }
    } catch (error) {
      console.error('Error loading tool data:', error);
    } finally {
      setLoading(false);
    }
  }, [slug, user?.id]);

  useEffect(() => {
    if (slug) {
      loadToolData();
    }
  }, [slug, loadToolData]);

  const handleUpvote = async () => {
    if (!user?.id || !tool || upvoting) return;
    
    try {
      setUpvoting(true);
      
      const response = await fetch('/api/tools/upvote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ toolId: tool.id, userId: user.id })
      });

      if (response.ok) {
        // Update local state
        setTool((prev: Record<string, unknown> | null) => ({
          ...prev,
          upvotes: isUpvoted ? (prev?.upvotes as number) - 1 : (prev?.upvotes as number) + 1
        }));
        setIsUpvoted(!isUpvoted);
      }
    } catch (error) {
      console.error('Error upvoting tool:', error);
    } finally {
      setUpvoting(false);
    }
  };

  const handleSubmitReview = async (reviewData: ReviewFormData) => {
    if (!user?.id || !tool) return;
    
    try {
      setSubmittingReview(true);
      
      const response = await fetch('/api/community/reviews/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tool_id: tool.id,
          ...reviewData
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      // Reload reviews
      const reviewsResponse = await fetch(`/api/community/reviews?toolId=${tool?.id}`);
      if (reviewsResponse.ok) {
        const newReviews = await reviewsResponse.json();
        setReviews(newReviews);
      }
      
      // Close form
      setShowReviewForm(false);
      
      // Show success message (you can add a toast here)
      alert('Review submitted successfully!');
      
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleWriteReviewClick = () => {
    setShowReviewForm(true);
    // Auto scroll to form after a short delay to ensure DOM is updated
    setTimeout(() => {
      reviewFormRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }, 200);
  };

  const getMostPopularRecommendation = () => {
    const { keepCount, tryCount, stopCount } = reviewStats;
    const maxCount = Math.max(keepCount, tryCount, stopCount);
    
    if (maxCount === 0) return null;
    
    if (keepCount === maxCount) return { type: 'keep', count: keepCount };
    if (tryCount === maxCount) return { type: 'try', count: tryCount };
    if (stopCount === maxCount) return { type: 'stop', count: stopCount };
    
    return null;
  };

  const getRecommendationBadge = (recommendation: string) => {
    switch (recommendation) {
      case 'keep':
        return { icon: '🟢', color: 'bg-green-100 border-green-200 dark:bg-green-900 dark:border-green-700' };
      case 'try':
        return { icon: '🟡', color: 'bg-yellow-100 border-yellow-200 dark:bg-yellow-900 dark:border-yellow-700' };
      case 'stop':
        return { icon: '🔴', color: 'bg-red-100 border-red-200 dark:bg-red-900 dark:border-red-700' };
      default:
        return null;
    }
  };

  const handleStartDiscussionClick = () => {
    setShowDiscussionForm(true);
    // Auto scroll to form after a short delay to ensure DOM is updated
    setTimeout(() => {
      discussionFormRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }, 200);
  };

  const handleSubmitDiscussion = async (discussionData: { title: string; content: string }) => {
    if (!user?.id || !tool?.id) return;
    
    try {
      setSubmittingDiscussion(true);
      const response = await fetch('/api/community/discussions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...discussionData,
          toolId: tool.id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create discussion');
      }

      setShowDiscussionForm(false);
      // Reload discussions by switching tabs
      setActiveTab('discussions');
    } catch (error) {
      console.error('Error creating discussion:', error);
      alert('Failed to create discussion. Please try again.');
    } finally {
      setSubmittingDiscussion(false);
    }
  };

  // Sidebar content component
  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => {
    if (!tool) return null;

    return (
      <div className={isMobile ? "space-y-4" : "space-y-4 sm:space-y-6"}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tool Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Verdict */}
                  <VerdictDisplay 
                    toolId={tool.id as string} 
                    showDetails={true} 
                    className="mb-4"
                  />
                  
                  {/* Scores */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {(tool.overallScore as number) ? (tool.overallScore as number).toFixed(1) : 'N/A'}/10
                      </div>
                      <div className="text-sm text-muted-foreground">Overall Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {(tool.totalReviews as number) || (tool.total_reviews as number) || reviews.length || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Reviews</div>
                    </div>
                  </div>
                  
                  {/* Detailed Scores */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Value for Money</span>
                      <span className="font-medium">{(tool.valueScore as number) ? (tool.valueScore as number).toFixed(1) : 'N/A'}/10</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Ease of Use</span>
                      <span className="font-medium">{(tool.usageScore as number) ? (tool.usageScore as number).toFixed(1) : 'N/A'}/10</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Integration</span>
                      <span className="font-medium">{(tool.integrationScore as number) ? (tool.integrationScore as number).toFixed(1) : 'N/A'}/10</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Overview Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Description */}
                  {(tool.long_description as string) && (
                    <div>
                      <h4 className="font-medium mb-2">About {tool.name as string}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {tool.long_description as string}
                      </p>
                    </div>
                  )}
                  
                  {/* Stats */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        <span className="text-sm">Upvotes</span>
                      </div>
                      <span className="font-medium">{(toolStats?.upvotes as number) || (tool.upvotes as number) || 0}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="w-4 h-4 text-primary" />
                        <span className="text-sm">Reviews</span>
                      </div>
                      <span className="font-medium">{(toolStats?.totalReviews as number) || (tool.total_reviews as number) || 0}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Award className="w-4 h-4 text-primary" />
                        <span className="text-sm">Verified Reviews</span>
                      </div>
                      <span className="font-medium">{(toolStats?.verifiedReviews as number) || (tool.verified_reviews as number) || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pricing Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Pricing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Pricing Model</p>
                    {((tool.pricing_model as string) || (tool.pricingModel as string)) ? (
                      <Badge variant="outline" className="text-xs">
                        {((tool.pricing_model as string) || (tool.pricingModel as string)) === 'free' && 'Free'}
                        {((tool.pricing_model as string) || (tool.pricingModel as string)) === 'freemium' && 'Freemium'}
                        {((tool.pricing_model as string) || (tool.pricingModel as string)) === 'paid' && 'Paid'}
                        {((tool.pricing_model as string) || (tool.pricingModel as string)) === 'enterprise' && 'Enterprise'}
                      </Badge>
                    ) : (
                      <div className="h-4 bg-muted rounded animate-pulse"></div>
                    )}
                  </div>
                  
                  {((tool.starting_price as number) || (tool.startingPrice as number)) ? (
                    <div>
                      <p className="text-sm font-medium mb-1">Starting Price</p>
                      <p className="text-lg font-bold text-primary">
                        ${((tool.starting_price as number) || (tool.startingPrice as number)) === 0 ? 'Free' : ((tool.starting_price as number) || (tool.startingPrice as number))}/month
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-medium mb-1">Starting Price</p>
                      <div className="h-6 bg-muted rounded animate-pulse"></div>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-sm font-medium mb-2">Details</p>
                    {(() => {
                      const pricingDetails = tool.pricing_details || tool.pricingDetails;
                      if (pricingDetails && typeof pricingDetails === 'object') {
                        return (
                          <div className="space-y-2">
                            {Object.entries(pricingDetails as Record<string, string>).map(([plan, price]) => (
                              <div key={plan} className="flex justify-between items-center text-xs">
                                <span className="capitalize text-muted-foreground">{plan}:</span>
                                <span className="font-medium">{price}</span>
                              </div>
                            ))}
                          </div>
                        );
                      } else if (typeof pricingDetails === 'string') {
                        return (
                          <p className="text-xs text-muted-foreground">
                            {pricingDetails}
                          </p>
                        );
                      } else {
                        return (
                          <p className="text-xs text-muted-foreground">
                            Visit the official website for complete pricing information and current offers.
                          </p>
                        );
                      }
                    })()}
                  </div>
                </CardContent>
              </Card>
      </div>
    );
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading tool details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold mb-4">Tool Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The tool you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Link href="/tools">
              <Button>Browse All Tools</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Structured Data for SEO */}
      {tool && <StructuredData tool={tool} reviews={reviews} />}
      {tool && <BreadcrumbStructuredData items={[
        { label: 'Tools', href: '/tools' },
        { label: tool.name as string }
      ]} />}
      
      <main className="mx-auto w-full max-w-7xl px-1 sm:px-2 lg:px-8 py-8 relative">
        {/* Breadcrumb Navigation */}
        {tool && (
          <div className="mb-6">
            <Breadcrumb items={[
              { label: 'Tools', href: '/tools' },
              { label: tool.name as string }
            ]} />
          </div>
        )}
        {/* Tool Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start gap-4 sm:gap-6">
            {/* Tool Info */}
            <div className="flex-1">
              {/* Mobile-first logo and title layout */}
              <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                {/* Logo - responsive sizing */}
                <div className="flex items-center gap-3 sm:gap-4">
                  {tool.logo_url ? (
                    <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl overflow-hidden bg-muted shrink-0">
                      <Image
                        src={tool.logo_url as string}
                        alt={`${tool.name} logo`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-lg sm:text-2xl font-bold text-primary">
                        {(tool.name as string).charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  
                  {/* Title and badges - mobile optimized */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                      <h1 className="text-2xl sm:text-3xl font-bold leading-tight">{tool.name as string}</h1>
                      <div className="flex items-center gap-2 flex-wrap">
                        {(tool.featured as boolean) && (
                          <Badge variant="secondary" className="text-xs">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                        {(() => {
                          const mostPopular = getMostPopularRecommendation();
                          if (mostPopular) {
                            const badge = getRecommendationBadge(mostPopular.type);
                            return badge ? (
                              <div 
                                className={`${badge.color} w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center`}
                              >
                                {badge.icon}
                              </div>
                            ) : null;
                          }
                          return null;
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Description */}
              <p className="text-base sm:text-lg text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
                {tool.description as string}
              </p>
              
              {/* Action Buttons - icon only, single row */}
              <div className="flex items-center justify-between mb-6">
                {/* Left side - Main action buttons */}
                <div className="flex items-center gap-2">
                  {/* Mobile drawer trigger - only visible on mobile */}
                  <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                    <SheetTrigger asChild>
                      <Button 
                        variant="default" 
                        size="sm"
                        className="lg:hidden bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        <BarChart3 className="w-4 h-4" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-full sm:w-[320px] p-0">
                      <SheetHeader className="sr-only">
                        <SheetTitle>Tool Statistics and Information</SheetTitle>
                      </SheetHeader>
                      <div className="h-full mobile-drawer-content">
                        <SidebarContent isMobile={true} />
                      </div>
                    </SheetContent>
                  </Sheet>

                  <Button 
                    onClick={handleUpvote} 
                    disabled={upvoting || !user}
                    size="sm"
                    title={`${isUpvoted ? 'Upvoted' : 'Upvote'} (${(tool.upvotes as number) || 0})`}
                  >
                    <Heart className={`w-4 h-4 ${isUpvoted ? 'fill-current' : ''}`} />
                  </Button>
                  
                  {user && (
                    <>
                      <Button 
                        variant={activeTab === 'reviews' ? 'default' : 'outline'}
                        onClick={() => setActiveTab('reviews')}
                        size="sm"
                        title="Reviews"
                      >
                        <PenTool className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant={activeTab === 'discussions' ? 'default' : 'outline'}
                        onClick={() => setActiveTab('discussions')}
                        size="sm"
                        title="Discussions"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant={activeTab === 'tester-reports' ? 'default' : 'outline'}
                        onClick={() => setActiveTab('tester-reports')}
                        size="sm"
                        title="Tester Reports"
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  
                  <Button 
                    variant="outline" 
                    asChild
                    size="sm"
                    title="Visit Website"
                  >
                    <a href={tool.website as string} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </div>

                {/* Right side - Context action buttons */}
                {user && (
                  <div className="flex items-center gap-2">
                    {/* Write Review Button - only show when reviews tab is active */}
                    {activeTab === 'reviews' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={showReviewForm ? () => setShowReviewForm(false) : handleWriteReviewClick}
                        title={showReviewForm ? 'Cancel' : 'Write Review'}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    )}
                    
                    {/* Start Discussion Button - only show when discussions tab is active */}
                    {activeTab === 'discussions' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleStartDiscussionClick}
                        title="Start Discussion"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Content Area */}
              <div className="mt-4 sm:mt-6">
                {activeTab === 'reviews' ? (
                  <div>
                    <div className="mb-4 sm:mb-6">
                      <h3 className="text-lg sm:text-xl font-semibold">Reviews</h3>
                    </div>
                    <EnhancedReviewList 
                      toolId={tool.id as string}
                      toolName={tool.name as string}
                      onWriteReview={() => setShowReviewForm(true)}
                      showWriteReviewButton={false}
                      showFilters={true}
                      maxReviews={10}
                    />
                    
                    {/* Inline Review Form */}
                    {showReviewForm && user && (
                      <div ref={reviewFormRef} className="mt-6 pt-6 border-t">
                        <ReviewForm
                          toolId={tool.id as string}
                          toolName={tool.name as string}
                          onSubmit={handleSubmitReview}
                          onCancel={() => setShowReviewForm(false)}
                          isLoading={submittingReview}
                        />
                      </div>
                    )}
                  </div>
                ) : activeTab === 'discussions' ? (
                  <div>
                    <div className="mb-4 sm:mb-6">
                      <h3 className="text-lg sm:text-xl font-semibold">Discussions</h3>
                    </div>
                    <DiscussionListWithReactQuery 
                      toolId={tool.id as string}
                      toolName={tool.name as string}
                      onStartDiscussion={undefined}
                    />
                    
                    {/* Discussion Form */}
                    {showDiscussionForm && user && (
                      <div ref={discussionFormRef}>
                        <DiscussionForm
                          toolId={tool.id as string}
                          toolName={tool.name as string}
                          onSubmit={handleSubmitDiscussion}
                          onCancel={() => setShowDiscussionForm(false)}
                          isLoading={submittingDiscussion}
                        />
                      </div>
                    )}
                  </div>
                ) : activeTab === 'tester-reports' ? (
                  <div>
                    <TesterReportList 
                      toolId={tool.id as string}
                      toolName={tool.name as string}
                    />
                  </div>
                ) : null}
              </div>
            </div>

            {/* Desktop Sidebar - Hidden on mobile, visible on lg screens */}
            <div className="hidden lg:block lg:w-80 sticky-sidebar">
              <SidebarContent />
            </div>
          </div>
        </div>

        {/* Related Tools Section */}
        {relatedTools.length > 0 && (
          <RelatedToolsClient tools={relatedTools as Array<{
            id: string
            name: string
            slug: string
            description: string
            logo_url?: string
            overall_score?: number
            category?: string
            featured?: boolean
          }>} />
        )}

      </main>
    </div>
  );
}
