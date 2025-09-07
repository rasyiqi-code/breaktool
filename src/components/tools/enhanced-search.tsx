"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Filter, X, TrendingUp, Star, Clock, Zap, Target } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tool, Category } from "@/types/app";
import { SearchFilters } from "@/types";
// Removed direct service imports - using API routes instead
import Image from "next/image";

interface EnhancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onClear: () => void;
  initialFilters?: Partial<SearchFilters>;
}

const PRICE_RANGES = [
  { value: '', label: 'Any Price' },
  { value: 'free', label: 'Free' },
  { value: 'freemium', label: 'Freemium' },
  { value: 'paid', label: 'Paid' },
  { value: 'enterprise', label: 'Enterprise' }
];

const FEATURES = [
  { value: 'api', label: 'API Access' },
  { value: 'mobile', label: 'Mobile App' },
  { value: 'integrations', label: 'Integrations' },
  { value: 'analytics', label: 'Analytics' },
  { value: 'collaboration', label: 'Collaboration' },
  { value: 'automation', label: 'Automation' },
  { value: 'ai', label: 'AI/ML' },
  { value: 'security', label: 'Security' }
];

const SORT_OPTIONS = [
  { value: 'created_at', label: 'Newest', icon: Clock },
  { value: 'upvotes', label: 'Most Popular', icon: TrendingUp },
  { value: 'overall_score', label: 'Highest Rated', icon: Star },
  { value: 'name', label: 'Name A-Z', icon: Target },
  { value: 'total_reviews', label: 'Most Reviewed', icon: Zap }
];

export function EnhancedSearch({ onSearch, onClear, initialFilters }: EnhancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: '',
    verdict: '',
    priceRange: '',
    features: [],
    sortBy: 'created_at',
    sortOrder: 'desc',
    showFeatured: false,
    showTrending: false,
    ...initialFilters
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [suggestions, setSuggestions] = useState<Tool[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Load categories
  useEffect(() => {
    loadCategories();
  }, []);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/tools/categories');
      if (response.ok) {
        const categoriesData = await response.json();
        setCategories(categoriesData);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleSearchInput = async (value: string) => {
    setFilters(prev => ({ ...prev, query: value }));
    
    if (value.length >= 2) {
      setLoading(true);
      try {
        const response = await fetch(`/api/tools/search?q=${encodeURIComponent(value)}&limit=5`);
        if (response.ok) {
          const results = await response.json();
          setSuggestions(results);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (tool: Tool) => {
    setFilters(prev => ({ ...prev, query: tool.name }));
    setShowSuggestions(false);
    onSearch({ ...filters, query: tool.name });
  };

  const handleFilterChange = (key: keyof SearchFilters, value: SearchFilters[keyof SearchFilters]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleFeatureToggle = (feature: string) => {
    setFilters(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const handleSearch = () => {
    onSearch(filters);
    setShowSuggestions(false);
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
    onClear();
  };

  const activeFiltersCount = [
    filters.query,
    filters.category,
    filters.verdict,
    filters.priceRange,
    filters.features.length,
    filters.showFeatured,
    filters.showTrending
  ].filter(Boolean).length;

  return (
    <Card className="mb-6">
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4">
          {/* Main Search Bar */}
          <div className="relative" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search tools by name, description, or features..."
                value={filters.query}
                onChange={(e) => handleSearchInput(e.target.value)}
                onFocus={() => filters.query.length >= 2 && setShowSuggestions(true)}
                className="pl-10 pr-20"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="h-8 px-2"
                >
                  <Filter className="w-4 h-4" />
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
                {filters.query && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFilterChange('query', '')}
                    className="h-8 px-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Search Suggestions */}
            {showSuggestions && (suggestions.length > 0 || loading) && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Searching...
                  </div>
                ) : (
                  <div className="py-2">
                    {suggestions.map((tool) => (
                      <button
                        key={tool.id}
                        onClick={() => handleSuggestionClick(tool)}
                        className="w-full px-4 py-2 text-left hover:bg-muted flex items-center gap-3"
                      >
                        <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                          {(tool.logo_url || (tool as { logoUrl?: string }).logoUrl) ? (
                            <Image src={tool.logo_url || (tool as { logoUrl?: string }).logoUrl || ''} alt={tool.name} width={24} height={24} className="w-6 h-6 rounded" />
                          ) : (
                            <span className="text-xs font-bold">{tool.name.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{tool.name}</div>
                          <div className="text-sm text-muted-foreground truncate">
                            {tool.description}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filters.showFeatured ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange('showFeatured', !filters.showFeatured)}
            >
              <Star className="w-4 h-4 mr-1" />
              Featured
            </Button>
            <Button
              variant={filters.showTrending ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange('showTrending', !filters.showTrending)}
            >
              <TrendingUp className="w-4 h-4 mr-1" />
              Trending
            </Button>
            {filters.verdict && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => handleFilterChange('verdict', '')}>
                Verdict: {filters.verdict} ×
              </Badge>
            )}
            {filters.category && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => handleFilterChange('category', '')}>
                Category: {categories.find(c => c.id === filters.category)?.name} ×
              </Badge>
            )}
            {filters.features.map(feature => (
              <Badge 
                key={feature} 
                variant="secondary" 
                className="cursor-pointer"
                onClick={() => handleFeatureToggle(feature)}
              >
                {FEATURES.find(f => f.value === feature)?.label} ×
              </Badge>
            ))}
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
              {/* Category Filter */}
              <div>
                <Label className="text-sm font-medium">Category</Label>
                <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Verdict Filter */}
              <div>
                <Label className="text-sm font-medium">Verdict</Label>
                <Select value={filters.verdict} onValueChange={(value) => handleFilterChange('verdict', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All verdicts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All verdicts</SelectItem>
                    <SelectItem value="keep">🟢 Keep</SelectItem>
                    <SelectItem value="try">🟡 Try</SelectItem>
                    <SelectItem value="stop">🔴 Stop</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range Filter */}
              <div>
                <Label className="text-sm font-medium">Price Range</Label>
                <Select value={filters.priceRange} onValueChange={(value) => handleFilterChange('priceRange', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any price" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRICE_RANGES.map((range) => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Options */}
              <div>
                <Label className="text-sm font-medium">Sort by</Label>
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

              {/* Features Filter */}
              <div className="md:col-span-2 lg:col-span-4">
                <Label className="text-sm font-medium mb-2 block">Features</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {FEATURES.map((feature) => (
                    <div key={feature.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={feature.value}
                        checked={filters.features.includes(feature.value)}
                        onCheckedChange={() => handleFeatureToggle(feature.value)}
                      />
                      <Label htmlFor={feature.value} className="text-sm">
                        {feature.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={handleSearch} className="flex-1">
              <Search className="w-4 h-4 mr-2" />
              Search Tools
            </Button>
            {activeFiltersCount > 0 && (
              <Button variant="outline" onClick={handleClear}>
                <X className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
