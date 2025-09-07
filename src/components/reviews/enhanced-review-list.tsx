"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ReviewCard } from "@/components/reviews/review-card";
import { Review, User } from "@/types/app";
import { ReviewFilters } from "@/types";
// Removed direct service import - using API routes instead
import { 
  Search, 
  Filter, 
  Bookmark, 
  BookmarkCheck, 
  Star, 
  Clock, 
  TrendingUp, 
  ThumbsUp,
  MessageSquare,
  Eye,
  SortAsc,
  SortDesc
} from "lucide-react";
import { useUser } from "@stackframe/stack";

interface EnhancedReviewListProps {
  toolId?: string;
  toolName?: string;
  initialReviews?: (Review & { user?: User })[];
  showFilters?: boolean;
  maxReviews?: number;
  onWriteReview?: () => void;
  showWriteReviewButton?: boolean;
}

const SORT_OPTIONS = [
  { value: 'created_at', label: 'Newest', icon: Clock },
  { value: 'helpful_votes', label: 'Most Helpful', icon: ThumbsUp },
  { value: 'overall_score', label: 'Highest Rated', icon: Star },
  { value: 'total_votes', label: 'Most Voted', icon: TrendingUp },
  { value: 'user_trust_score', label: 'Trusted Reviewers', icon: Star }
];

const RATING_FILTERS = [
  { value: 'all', label: 'All Ratings' },
  { value: '5', label: '5 Stars' },
  { value: '4', label: '4+ Stars' },
  { value: '3', label: '3+ Stars' },
  { value: '2', label: '2+ Stars' },
  { value: '1', label: '1+ Stars' }
];

const REVIEW_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'admin', label: 'Admin Reviews' },
  { value: 'verified_tester', label: 'Verified Tester' },
  { value: 'community', label: 'Community' }
];

export function EnhancedReviewList({ 
  toolId, 
  toolName,
  initialReviews = [], 
  showFilters = true,
  maxReviews = 50,
  onWriteReview,
  showWriteReviewButton = false
}: EnhancedReviewListProps) {
  const [reviews, setReviews] = useState<(Review & { user?: User })[]>(initialReviews);
  const [filteredReviews, setFilteredReviews] = useState<(Review & { user?: User })[]>(initialReviews);
  const [filters, setFilters] = useState<ReviewFilters>({
    search: '',
    reviewType: 'all',
    rating: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc',
    showBookmarked: false,
    showVerifiedOnly: false
  });
  const [loading, setLoading] = useState(false);
  const [bookmarkedReviews, setBookmarkedReviews] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const user = useUser();


  const loadReviews = useCallback(async () => {
    if (!toolId) return;
    
    try {
      setLoading(true);
      console.log('Loading reviews for tool:', toolId);
      
      const response = await fetch(`/api/community/reviews?toolId=${toolId}&limit=${maxReviews}`);
      if (response.ok) {
        const reviewsData = await response.json();
        console.log('Reviews loaded successfully:', reviewsData?.length || 0, 'reviews');
        setReviews(reviewsData || []);
      } else {
        console.error('Failed to load reviews:', response.status);
        setReviews([]);
      }
    } catch (error) {
      console.error('Error loading reviews:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        toolId,
        errorType: typeof error,
        errorKeys: error ? Object.keys(error) : []
      });
      setReviews([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, [toolId, maxReviews]);

  const loadBookmarks = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      // This would be implemented in the ReviewsService
      // const bookmarks = await ReviewsService.getUserBookmarks(user.id);
      // setBookmarkedReviews(bookmarks);
    } catch (error) {
      console.error('Error loading bookmarks:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        userId: user?.id
      });
    }
  }, [user?.id]);

  useEffect(() => {
    if (initialReviews.length === 0 && toolId) {
      loadReviews();
    }
    if (user?.id) {
      loadBookmarks();
    }
  }, [toolId, initialReviews.length, user?.id, maxReviews, loadReviews, loadBookmarks]);

  const handleReviewVote = async (reviewId: string, voteType: 'helpful' | 'not_helpful') => {
    if (!user?.id) return;
    
    try {
      const response = await fetch('/api/community/reviews/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          review_id: reviewId,
          vote_type: voteType
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to vote');
      }

      // Reload reviews to get updated vote counts
      if (toolId) {
        const reviewsResponse = await fetch(`/api/community/reviews?toolId=${toolId}&limit=${maxReviews}`);
        if (reviewsResponse.ok) {
          const newReviews = await reviewsResponse.json();
          setReviews(newReviews || []);
        }
      }
      
    } catch (error) {
      console.error('Error voting on review:', error);
    }
  };

  const applyFilters = useCallback(() => {
    let filtered = [...reviews];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(review => 
        review.title.toLowerCase().includes(searchLower) ||
        review.content.toLowerCase().includes(searchLower) ||
        review.user?.name?.toLowerCase().includes(searchLower)
      );
    }

    // Review type filter
    if (filters.reviewType && filters.reviewType !== 'all') {
      filtered = filtered.filter(review => review.type === filters.reviewType);
    }

    // Rating filter
    if (filters.rating && filters.rating !== 'all') {
      const minRating = parseInt(filters.rating);
      filtered = filtered.filter(review => (review.overall_score || 0) >= minRating);
    }

    // Verified only filter
    if (filters.showVerifiedOnly) {
      filtered = filtered.filter(review => 
        review.type === 'admin' || review.type === 'verified_tester'
      );
    }

    // Bookmarked filter
    if (filters.showBookmarked) {
      filtered = filtered.filter(review => bookmarkedReviews.includes(review.id));
    }

    // Sort reviews
    filtered.sort((a, b) => {
      let aValue: number, bValue: number;

      switch (filters.sortBy) {
        case 'helpful_votes':
          aValue = a.helpful_votes || 0;
          bValue = b.helpful_votes || 0;
          break;
        case 'overall_score':
          aValue = a.overall_score || 0;
          bValue = b.overall_score || 0;
          break;
        case 'total_votes':
          aValue = a.total_votes || 0;
          bValue = b.total_votes || 0;
          break;
        case 'user_trust_score':
          aValue = a.user?.trust_score || 0;
          bValue = b.user?.trust_score || 0;
          break;
        default:
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
      }

      if (filters.sortOrder === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });

    setFilteredReviews(filtered);
  }, [reviews, filters, bookmarkedReviews]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleFilterChange = (key: keyof ReviewFilters, value: ReviewFilters[keyof ReviewFilters]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleBookmark = async (reviewId: string) => {
    if (!user?.id) return;

    try {
      const isBookmarked = bookmarkedReviews.includes(reviewId);
      if (isBookmarked) {
        // Remove bookmark
        setBookmarkedReviews(prev => prev.filter(id => id !== reviewId));
        // await ReviewsService.removeBookmark(reviewId, user.id);
      } else {
        // Add bookmark
        setBookmarkedReviews(prev => [...prev, reviewId]);
        // await ReviewsService.addBookmark(reviewId, user.id);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      reviewType: 'all',
      rating: 'all',
      sortBy: 'created_at',
      sortOrder: 'desc',
      showBookmarked: false,
      showVerifiedOnly: false
    });
  };

  const activeFiltersCount = [
    filters.search,
    filters.reviewType !== 'all' ? filters.reviewType : null,
    filters.rating !== 'all' ? filters.rating : null,
    filters.showBookmarked,
    filters.showVerifiedOnly
  ].filter(Boolean).length;

  const getReviewStats = () => {
    const total = reviews.length;
    const adminReviews = reviews.filter(r => r.type === 'admin').length;
    const verifiedReviews = reviews.filter(r => r.type === 'verified_tester').length;
    const communityReviews = reviews.filter(r => r.type === 'community').length;
    const avgRating = reviews.length > 0 
      ? reviews.reduce((sum, r) => sum + (r.overall_score || 0), 0) / reviews.length 
      : 0;

    return { total, adminReviews, verifiedReviews, communityReviews, avgRating };
  };

  const stats = getReviewStats();

  return (
    <div className="space-y-6">
      {/* Review Stats */}
      <div className="grid grid-cols-5 gap-2">
        <div className="text-center p-2 bg-muted/50 rounded-lg">
          <div className="text-sm font-bold text-white">{stats.total}</div>
          <div className="text-xs text-muted-foreground">Total Reviews</div>
        </div>
        <div className="text-center p-2 bg-muted/50 rounded-lg">
          <div className="text-sm font-bold text-green-600">{stats.adminReviews}</div>
          <div className="text-xs text-muted-foreground">Admin Reviews</div>
        </div>
        <div className="text-center p-2 bg-muted/50 rounded-lg">
          <div className="text-sm font-bold text-blue-600">{stats.verifiedReviews}</div>
          <div className="text-xs text-muted-foreground">Verified Testers</div>
        </div>
        <div className="text-center p-2 bg-muted/50 rounded-lg">
          <div className="text-sm font-bold text-orange-600">{stats.communityReviews}</div>
          <div className="text-xs text-muted-foreground">Community</div>
        </div>
        <div className="text-center p-2 bg-muted/50 rounded-lg">
          <div className="text-sm font-bold text-yellow-600">
            {stats.avgRating.toFixed(1)}
          </div>
          <div className="text-xs text-muted-foreground">Avg Rating</div>
        </div>
      </div>

      {/* Filters and Controls */}
      {showFilters && (
        <div className="space-y-4">
              {/* Search and Basic Filters */}
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search reviews..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Advanced Filters Popup */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs"
                      >
                        <Filter className="w-3 h-3 mr-1" />
                        Advanced Filters
                        {activeFiltersCount > 0 && (
                          <Badge variant="secondary" className="ml-2 h-4 w-4 p-0 text-xs">
                            {activeFiltersCount}
                          </Badge>
                        )}
                      </Button>
                                                              </DialogTrigger>
                     <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Advanced Filters</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        {/* Review Type */}
                        <div>
                          <label className="text-sm font-medium mb-2 block">Review Type</label>
                          <Select value={filters.reviewType} onValueChange={(value) => handleFilterChange('reviewType', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="All types" />
                            </SelectTrigger>
                            <SelectContent>
                              {REVIEW_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Rating Filter */}
                        <div>
                          <label className="text-sm font-medium mb-2 block">Rating</label>
                          <Select value={filters.rating} onValueChange={(value) => handleFilterChange('rating', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="All ratings" />
                            </SelectTrigger>
                            <SelectContent>
                              {RATING_FILTERS.map((rating) => (
                                <SelectItem key={rating.value} value={rating.value}>
                                  {rating.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Sort By */}
                        <div>
                          <label className="text-sm font-medium mb-2 block">Sort by</label>
                          <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {SORT_OPTIONS.map((option) => {
                                const Icon = option.icon;
                                return (
                                  <SelectItem key={option.value} value={option.value}>
                                    <div className="flex items-center">
                                      <Icon className="w-4 h-4 mr-2" />
                                      {option.label}
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Sort Order */}
                        <div>
                          <label className="text-sm font-medium mb-2 block">Order</label>
                          <Select value={filters.sortOrder} onValueChange={(value: 'asc' | 'desc') => handleFilterChange('sortOrder', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="desc">
                                <div className="flex items-center">
                                  <SortDesc className="w-4 h-4 mr-2" />
                                  Descending
                                </div>
                              </SelectItem>
                              <SelectItem value="asc">
                                <div className="flex items-center">
                                  <SortAsc className="w-4 h-4 mr-2" />
                                  Ascending
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Additional Filters */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium block">Additional Filters</label>
                          <div className="flex gap-2">
                            <Button
                              variant={filters.showVerifiedOnly ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleFilterChange('showVerifiedOnly', !filters.showVerifiedOnly)}
                            >
                              <Star className="w-4 h-4 mr-2" />
                              Verified Only
                            </Button>
                            
                            <Button
                              variant={filters.showBookmarked ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleFilterChange('showBookmarked', !filters.showBookmarked)}
                            >
                              <BookmarkCheck className="w-4 h-4 mr-2" />
                              Bookmarked
                            </Button>
                          </div>
                        </div>

                        {/* Clear Filters */}
                        <div className="flex justify-end pt-2 border-t">
                          <Button variant="ghost" size="sm" onClick={clearFilters}>
                            Clear All Filters
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                  >
                    {viewMode === 'list' ? <Eye className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* Active Filters */}
              {activeFiltersCount > 0 && (
                <div className="flex flex-wrap gap-2 pt-4 border-t">
                  {filters.search && (
                    <Badge variant="secondary" className="cursor-pointer" onClick={() => handleFilterChange('search', '')}>
                      Search: &quot;{filters.search}&quot; ×
                    </Badge>
                  )}
                  {filters.reviewType && filters.reviewType !== 'all' && (
                    <Badge variant="secondary" className="cursor-pointer" onClick={() => handleFilterChange('reviewType', 'all')}>
                      Type: {REVIEW_TYPES.find(t => t.value === filters.reviewType)?.label} ×
                    </Badge>
                  )}
                  {filters.rating && filters.rating !== 'all' && (
                    <Badge variant="secondary" className="cursor-pointer" onClick={() => handleFilterChange('rating', 'all')}>
                      Rating: {RATING_FILTERS.find(r => r.value === filters.rating)?.label} ×
                    </Badge>
                  )}
                  {filters.showVerifiedOnly && (
                    <Badge variant="secondary" className="cursor-pointer" onClick={() => handleFilterChange('showVerifiedOnly', false)}>
                      Verified Only ×
                    </Badge>
                  )}
                  {filters.showBookmarked && (
                    <Badge variant="secondary" className="cursor-pointer" onClick={() => handleFilterChange('showBookmarked', false)}>
                      Bookmarked ×
                    </Badge>
                  )}
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear all
                  </Button>
                </div>
              )}
            </div>
          )}

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading reviews...</p>
          </div>
        ) : filteredReviews.length > 0 ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'space-y-4'}>
            {filteredReviews.map((review) => (
              <div key={review.id} className="relative">
                <ReviewCard review={review} onVote={handleReviewVote} toolName={toolName} />
                {user?.id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 h-8 w-8 p-0"
                    onClick={() => toggleBookmark(review.id)}
                  >
                    {bookmarkedReviews.includes(review.id) ? (
                      <BookmarkCheck className="w-4 h-4 text-primary" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No reviews found
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {activeFiltersCount > 0 
                ? 'Try adjusting your filters to see more reviews.'
                : toolName 
                  ? `Be the first to review ${toolName}!`
                  : 'Be the first to review this tool!'
              }
            </p>
            {showWriteReviewButton && onWriteReview && (
              <Button onClick={onWriteReview}>
                Write a Review
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
