"use client";

import { useState } from "react";

import { ToolsGrid } from "@/components/tools/tools-grid";
import { EnhancedSearch } from "@/components/tools/enhanced-search";
import { SearchFilters } from "@/types";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function ToolsPage() {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: '',
    verdict: '',
    priceRange: '',
    features: [],
    sortBy: 'created_at',
    sortOrder: 'desc',
    showFeatured: false,
    showTrending: false
  });

  const handleSearch = (searchFilters: SearchFilters) => {
    setFilters(searchFilters);
  };

  const handleClear = () => {
    setFilters({
      query: '',
      category: '',
      verdict: '',
      priceRange: '',
      features: [],
      sortBy: 'created_at',
      sortOrder: 'desc',
      showFeatured: false,
      showTrending: false
    });
  };

  return (
    <div className="min-h-screen bg-background">
      
      
      <main className="container mx-auto px-0 sm:px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              SaaS Tools Directory
            </h1>
            <p className="text-muted-foreground">
              Discover and compare the best SaaS tools with expert reviews and community insights.
            </p>
          </div>
          
          <Link href="/submit">
            <Button className="w-full lg:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Submit a Tool
            </Button>
          </Link>
        </div>

        {/* Enhanced Search and Filters */}
        <EnhancedSearch
          onSearch={handleSearch}
          onClear={handleClear}
          initialFilters={filters}
        />

        {/* Tools Grid */}
        <ToolsGrid
          category={filters.category}
          search={filters.query}
          verdict={filters.verdict}
          priceRange={filters.priceRange}
          features={filters.features}
          showFeatured={filters.showFeatured}
          showTrending={filters.showTrending}
          sortBy={filters.sortBy}
          sortOrder={filters.sortOrder}
          limit={24}
        />
      </main>
    </div>
  );
}
