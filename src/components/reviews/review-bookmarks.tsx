"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ReviewCard } from "@/components/reviews/review-card";
import { Review, User, Tool } from "@/types/app";
import { 
  Bookmark, 
  Search, 
  Trash2, 
  Share2,
  Star,
  Clock,
  MessageSquare,
  X
} from "lucide-react";
import { useUser } from "@stackframe/stack";
import Link from "next/link";

interface BookmarkedReview extends Review {
  user?: User;
  tool?: Tool;
}

interface ReviewBookmarksProps {
  showFilters?: boolean;
}

export function ReviewBookmarks({ showFilters = true }: ReviewBookmarksProps) {
  const [bookmarkedReviews, setBookmarkedReviews] = useState<BookmarkedReview[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<BookmarkedReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTool, setSelectedTool] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const user = useUser();



  const loadBookmarks = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      // Fetch bookmarked reviews from API
      const response = await fetch(`/api/community/reviews/bookmarks?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setBookmarkedReviews(data.bookmarks || []);
      } else {
        setBookmarkedReviews([]);
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      loadBookmarks();
    }
  }, [user?.id, loadBookmarks]);

  const applyFilters = useCallback(() => {
    let filtered = [...bookmarkedReviews];

    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(review => 
        review.title.toLowerCase().includes(searchLower) ||
        review.content.toLowerCase().includes(searchLower) ||
        review.tool?.name.toLowerCase().includes(searchLower) ||
        review.user?.name?.toLowerCase().includes(searchLower)
      );
    }

    // Tool filter
    if (selectedTool) {
      filtered = filtered.filter(review => review.tool_id === selectedTool);
    }

    // Sort reviews
    filtered.sort((a, b) => {
      let aValue: string | number | Date, bValue: string | number | Date;

      switch (sortBy) {
        case 'helpful_votes':
          aValue = a.helpful_votes || 0;
          bValue = b.helpful_votes || 0;
          break;
        case 'overall_score':
          aValue = a.overall_score || 0;
          bValue = b.overall_score || 0;
          break;
        case 'tool_name':
          aValue = a.tool?.name || '';
          bValue = b.tool?.name || '';
          break;
        default:
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredReviews(filtered);
  }, [bookmarkedReviews, searchQuery, selectedTool, sortBy, sortOrder]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const removeBookmark = async (reviewId: string) => {
    if (!user?.id) return;

    try {
      // This would be implemented in the ReviewsService
      // await ReviewsService.removeBookmark(reviewId, user.id);
      
      // Update local state
      setBookmarkedReviews(prev => prev.filter(review => review.id !== reviewId));
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  const clearAllBookmarks = async () => {
    if (!user?.id) return;

    try {
      // This would be implemented in the ReviewsService
      // await ReviewsService.clearAllBookmarks(user.id);
      
      setBookmarkedReviews([]);
    } catch (error) {
      console.error('Error clearing bookmarks:', error);
    }
  };

  const shareBookmarks = () => {
    // Implementation for sharing bookmarks
    const bookmarksUrl = `${window.location.origin}/bookmarks?user=${user?.id}`;
    navigator.clipboard.writeText(bookmarksUrl);
    // Show toast notification
  };

  const getUniqueTools = () => {
    const tools = bookmarkedReviews
      .map(review => review.tool)
      .filter((tool, index, self) => tool && self.findIndex(t => t?.id === tool.id) === index);
    return tools;
  };

  const getBookmarkStats = () => {
    const total = bookmarkedReviews.length;
    const uniqueTools = getUniqueTools().length;
    const avgRating = bookmarkedReviews.length > 0 
      ? bookmarkedReviews.reduce((sum, r) => sum + (r.overall_score || 0), 0) / bookmarkedReviews.length 
      : 0;

    return { total, uniqueTools, avgRating };
  };

  const stats = getBookmarkStats();

  if (!user?.id) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Bookmark className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-muted-foreground mb-2">
          Sign in to view bookmarks
        </h3>
        <p className="text-sm text-muted-foreground">
          Create an account to save and organize your favorite reviews.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Bookmarked Reviews</h2>
          <p className="text-muted-foreground">
            Your saved reviews for quick access and reference
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={shareBookmarks}>
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          {bookmarkedReviews.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearAllBookmarks}>
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Bookmarked Reviews</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.uniqueTools}</div>
            <div className="text-sm text-muted-foreground">Unique Tools</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.avgRating.toFixed(1)}
            </div>
            <div className="text-sm text-muted-foreground">Average Rating</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      {showFilters && bookmarkedReviews.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search bookmarks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Tool Filter */}
              <Select value={selectedTool} onValueChange={setSelectedTool}>
                <SelectTrigger>
                  <SelectValue placeholder="All tools" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All tools</SelectItem>
                  {getUniqueTools().map((tool) => (
                    <SelectItem key={tool?.id} value={tool?.id || ''}>
                      {tool?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort By */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      Date Bookmarked
                    </div>
                  </SelectItem>
                  <SelectItem value="helpful_votes">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 mr-2" />
                      Most Helpful
                    </div>
                  </SelectItem>
                  <SelectItem value="overall_score">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 mr-2" />
                      Highest Rated
                    </div>
                  </SelectItem>
                  <SelectItem value="tool_name">
                    <div className="flex items-center">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Tool Name
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Sort Order */}
              <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Newest First</SelectItem>
                  <SelectItem value="asc">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bookmarks List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading bookmarks...</p>
          </div>
        ) : filteredReviews.length > 0 ? (
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <div key={review.id} className="relative">
                <ReviewCard review={review} />
                <div className="absolute top-2 right-2 flex gap-1">
                  {review.tool && (
                    <Link href={`/tools/${review.tool.slug}`}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    onClick={() => removeBookmark(review.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : bookmarkedReviews.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Bookmark className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No bookmarks yet
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Start bookmarking reviews to save them for later reference.
            </p>
            <Link href="/tools">
              <Button>
                Browse Tools
              </Button>
            </Link>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No matching bookmarks
            </h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or filters to find what you&apos;re looking for.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
