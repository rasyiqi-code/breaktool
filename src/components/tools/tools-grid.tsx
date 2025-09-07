"use client";

import { useState, useEffect, useCallback } from "react";
import { ToolCard } from "./tool-card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Tool, Category } from "@/types/database";
// Removed direct service import - using API routes instead

interface ToolsGridProps {
  initialTools?: (Tool & { category?: Category })[];
  category?: string;
  search?: string;
  verdict?: string;
  featured?: boolean;
  priceRange?: string;
  features?: string[];
  showFeatured?: boolean;
  showTrending?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  showLoadMore?: boolean;
  limit?: number;
}

export function ToolsGrid({
  initialTools = [],
  category,
  search,
  verdict,
  featured,
  priceRange,
  features,
  showFeatured,
  showTrending,
  sortBy = 'created_at',
  sortOrder = 'desc',
  showLoadMore = true,
  limit = 20
}: ToolsGridProps) {
  const [tools, setTools] = useState(initialTools);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);


  // Load tools based on filters
  const loadTools = useCallback(async (pageNum = 1, append = false) => {
    if (pageNum === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: limit.toString(),
        sortBy: sortBy || 'created_at',
        sortOrder: sortOrder || 'desc'
      });

      if (category) params.append('category', category);
      if (search) params.append('search', search);
      if (verdict) params.append('verdict', verdict);
      if (featured !== undefined) params.append('featured', featured.toString());
      if (priceRange) params.append('priceRange', priceRange);
      if (features && features.length > 0) params.append('features', features.join(','));
      if (showFeatured) params.append('showFeatured', 'true');
      if (showTrending) params.append('showTrending', 'true');

      const response = await fetch(`/api/tools?${params.toString()}`);
      if (response.ok) {
        const result = await response.json();

        if (append) {
          setTools(prev => [...(prev || []), ...(result.tools || [])]);
        } else {
          setTools(result.tools || []);
        }

        setHasMore(pageNum < result.totalPages);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error loading tools:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [category, search, verdict, featured, priceRange, features, showFeatured, showTrending, sortBy, sortOrder, limit]);

  // Load more tools
  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      loadTools(page + 1, true);
    }
  }, [loadTools, loadingMore, hasMore, page]);


  // Reload when filters change
  useEffect(() => {
    if (initialTools.length === 0) {
      loadTools(1, false);
    }
  }, [loadTools, initialTools.length]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!tools || tools.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-muted-foreground mb-2">
          No tools found
        </h3>
        <p className="text-sm text-muted-foreground">
          Try adjusting your search or filters to find what you&apos;re looking for.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools?.map((tool) => (
          <ToolCard
            key={tool.id}
            tool={tool}
          />
        ))}
      </div>

      {/* Load More Button */}
      {showLoadMore && hasMore && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={loadMore}
            disabled={loadingMore}
            className="min-w-[120px]"
          >
            {loadingMore ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}

      {/* End of results */}
      {!hasMore && tools && tools.length > 0 && (
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground">
            You&apos;ve reached the end of the results.
          </p>
        </div>
      )}
    </div>
  );
}
