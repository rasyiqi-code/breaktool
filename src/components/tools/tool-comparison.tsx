"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tool, Category } from "@/types/app";
// Remove service imports - we'll use API routes instead
import { 
  Star, 
  TrendingUp, 
  MessageSquare, 
  X, 
  Plus,
  Check,
  X as XIcon,
  Minus,
  DollarSign,
  Shield,
  Zap,
  Award,
  BarChart3,
  Download,
  Share2,
  Filter,
  SortAsc,
  SortDesc,
  Search,
  Eye,
  ThumbsUp,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface ToolComparisonProps {
  maxTools?: number;
}

interface ComparisonTool extends Tool {
  category?: Category;
  features?: string;
  pros?: string;
  cons?: string;
  logoUrl?: string; // Support both snake_case and camelCase
}

export function ToolComparison({ maxTools = 4 }: ToolComparisonProps) {
  const [selectedTools, setSelectedTools] = useState<ComparisonTool[]>([]);
  const [availableTools, setAvailableTools] = useState<ComparisonTool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [showDetailedComparison, setShowDetailedComparison] = useState(false);
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showRecommendations, setShowRecommendations] = useState(false);

  useEffect(() => {
    loadCategories();
    loadAvailableTools();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      setCategories(data.categories);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadAvailableTools = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tools?limit=50');
      if (!response.ok) {
        throw new Error('Failed to fetch tools');
      }
      const data = await response.json();
      setAvailableTools(data.tools);
    } catch (error) {
      console.error('Error loading tools:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTool = (tool: ComparisonTool) => {
    if (selectedTools.length >= maxTools) {
      return;
    }
    if (!selectedTools.find(t => t.id === tool.id)) {
      setSelectedTools([...selectedTools, tool]);
    }
  };

  const removeTool = (toolId: string) => {
    setSelectedTools(selectedTools.filter(t => t.id !== toolId));
  };

  const clearAll = () => {
    setSelectedTools([]);
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'keep': return 'bg-green-100 text-green-800';
      case 'try': return 'bg-yellow-100 text-yellow-800';
      case 'stop': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'keep': return <Check className="w-3 h-3" />;
      case 'try': return <Minus className="w-3 h-3" />;
      case 'stop': return <XIcon className="w-3 h-3" />;
      default: return null;
    }
  };

  const filteredTools = availableTools
    .filter(tool => {
      const matchesCategory = selectedCategory === 'all' || tool.category_id === selectedCategory;
      const matchesSearch = searchQuery === '' || 
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      let aValue: string | number, bValue: string | number;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'rating':
          aValue = a.overall_score || 0;
          bValue = b.overall_score || 0;
          break;
        case 'upvotes':
          aValue = a.upvotes || 0;
          bValue = b.upvotes || 0;
          break;
        case 'reviews':
          aValue = a.total_reviews || 0;
          bValue = b.total_reviews || 0;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const getRecommendation = () => {
    if (selectedTools.length < 2) return null;
    
    const sortedByRating = [...selectedTools].sort((a, b) => (b.overall_score || 0) - (a.overall_score || 0));
    const bestTool = sortedByRating[0];
    const worstTool = sortedByRating[sortedByRating.length - 1];
    
    // Calculate additional insights
    const avgRating = selectedTools.reduce((sum, tool) => sum + (tool.overall_score || 0), 0) / selectedTools.length;
    const totalVotes = selectedTools.reduce((sum, tool) => sum + (tool.upvotes || 0), 0);
    const totalReviews = selectedTools.reduce((sum, tool) => sum + (tool.total_reviews || 0), 0);
    
    // Find most popular by votes
    const mostPopular = selectedTools.reduce((prev, current) => 
      (prev.upvotes || 0) > (current.upvotes || 0) ? prev : current
    );
    
    // Find most reviewed
    const mostReviewed = selectedTools.reduce((prev, current) => 
      (prev.total_reviews || 0) > (current.total_reviews || 0) ? prev : current
    );
    
    return {
      best: bestTool,
      worst: worstTool,
      mostPopular,
      mostReviewed,
      avgRating,
      totalVotes,
      totalReviews,
      summary: `Based on ratings, ${bestTool.name} scores highest with ${bestTool.overall_score?.toFixed(1) || 'N/A'} points, while ${worstTool.name} has the lowest score.`,
      insights: {
        ratingGap: (bestTool.overall_score || 0) - (worstTool.overall_score || 0),
        popularityLeader: mostPopular.name,
        reviewLeader: mostReviewed.name,
        overallQuality: avgRating > 7 ? 'High' : avgRating > 5 ? 'Medium' : 'Low'
      }
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Compare Tools</h2>
          <p className="text-muted-foreground">
            Select up to {maxTools} tools to compare their features and ratings
          </p>
        </div>
        {selectedTools.length > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              {selectedTools.length} selected
            </Badge>
            <Button variant="outline" onClick={clearAll} size="sm">
              <X className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          </div>
        )}
      </div>

      {/* Selected Tools Preview */}
      {selectedTools.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="w-5 h-5" />
              Selected Tools ({selectedTools.length}/{maxTools})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {selectedTools.map((tool) => (
                <div
                  key={tool.id}
                  className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border"
                >
                  <div className="w-6 h-6 bg-muted rounded flex items-center justify-center">
                    {tool.logo_url ? (
                      <Image src={tool.logo_url} alt={tool.name} width={20} height={20} className="w-5 h-5 rounded" />
                    ) : (
                      <span className="text-xs font-bold">{tool.name.charAt(0)}</span>
                    )}
                  </div>
                  <span className="font-medium text-sm">{tool.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTool(tool.id)}
                    className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tool Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Tools to Compare
            <Badge variant="secondary">
              {selectedTools.length}/{maxTools}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search tools by name or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              {/* Category Filter */}
              <div className="w-full sm:w-48">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Sort */}
              <div className="w-full sm:w-48">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="upvotes">Upvotes</SelectItem>
                    <SelectItem value="reviews">Reviews</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Sort Order */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="w-full sm:w-auto"
              >
                {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
              </Button>
            </div>

            {/* Search Results Info */}
            {searchQuery && (
              <div className="text-sm text-muted-foreground mb-2">
                Found {filteredTools.filter(tool => !selectedTools.find(t => t.id === tool.id)).length} tools matching &quot;{searchQuery}&quot;
              </div>
            )}

            {/* Available Tools */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
              {loading ? (
                <div className="col-span-full text-center py-8">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <div className="text-muted-foreground">Loading tools...</div>
                  </div>
                </div>
              ) : filteredTools.filter(tool => !selectedTools.find(t => t.id === tool.id)).length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                      <Search className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="text-muted-foreground">
                      {searchQuery ? `No tools found matching "${searchQuery}"` : 'No tools available in this category.'}
                    </div>
                    {searchQuery && (
                      <Button variant="outline" size="sm" onClick={() => setSearchQuery('')}>
                        Clear Search
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                filteredTools
                  .filter(tool => !selectedTools.find(t => t.id === tool.id))
                  .map((tool) => (
                    <div
                      key={tool.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => addTool(tool)}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                          {(tool.logo_url || tool.logoUrl) ? (
                            <Image src={(tool.logo_url || tool.logoUrl)!} alt={tool.name} width={24} height={24} className="w-6 h-6 rounded" />
                          ) : (
                            <span className="text-xs font-bold">{tool.name.charAt(0)}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{tool.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {tool.category?.name}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {tool.overall_score && (
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                <span className="text-xs font-medium">{tool.overall_score.toFixed(1)}</span>
                              </div>
                            )}
                            {tool.upvotes && tool.upvotes > 0 && (
                              <div className="flex items-center gap-1">
                                <TrendingUp className="w-3 h-3 text-green-500" />
                                <span className="text-xs">{tool.upvotes}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <Plus className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    </div>
                  ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Table */}
      {selectedTools.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Comparison</span>
              <Badge variant="secondary" className="ml-2">
                {selectedTools.length} tools selected
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {(selectedTools.reduce((sum, tool) => sum + (tool.overall_score || 0), 0) / selectedTools.length).toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">Avg Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {selectedTools.reduce((sum, tool) => sum + (tool.upvotes || 0), 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Votes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {selectedTools.reduce((sum, tool) => sum + (tool.total_reviews || 0), 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Reviews</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {new Set(selectedTools.map(tool => tool.pricing_model)).size}
                </div>
                <div className="text-sm text-muted-foreground">Pricing Models</div>
              </div>
            </div>
            <div className="overflow-x-auto relative">
              <div className="absolute top-0 right-0 bg-gradient-to-l from-background to-transparent w-8 h-full pointer-events-none z-10"></div>
              <div className="absolute top-0 left-0 bg-gradient-to-r from-background to-transparent w-8 h-full pointer-events-none z-10"></div>
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Feature</th>
                    {selectedTools.map((tool) => (
                      <th key={tool.id} className="text-left p-2 min-w-[180px] sm:min-w-[200px]">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                              {tool.logo_url ? (
                                <Image src={tool.logo_url} alt={tool.name} width={24} height={24} className="w-6 h-6 rounded" />
                              ) : (
                                <span className="text-xs font-bold">{tool.name.charAt(0)}</span>
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{tool.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {tool.category?.name}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTool(tool.id)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Overall Rating */}
                  <tr className="border-b">
                    <td className="p-2 font-medium">Overall Rating</td>
                    {selectedTools.map((tool) => (
                      <td key={tool.id} className="p-2">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="font-medium">
                            {tool.overall_score ? tool.overall_score.toFixed(1) : 'N/A'}
                          </span>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Verdict */}
                  <tr className="border-b">
                    <td className="p-2 font-medium">Verdict</td>
                    {selectedTools.map((tool) => (
                      <td key={tool.id} className="p-2">
                        {tool.verdict ? (
                          <Badge className={`${getVerdictColor(tool.verdict)} flex items-center gap-1 w-fit`}>
                            {getVerdictIcon(tool.verdict)}
                            {tool.verdict.toUpperCase()}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">Not rated</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Upvotes */}
                  <tr className="border-b">
                    <td className="p-2 font-medium">Community Votes</td>
                    {selectedTools.map((tool) => (
                      <td key={tool.id} className="p-2">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          <span>{tool.upvotes || 0}</span>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Reviews */}
                  <tr className="border-b">
                    <td className="p-2 font-medium">Total Reviews</td>
                    {selectedTools.map((tool) => (
                      <td key={tool.id} className="p-2">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-blue-500" />
                          <span>{tool.total_reviews || 0}</span>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Pricing */}
                  <tr className="border-b">
                    <td className="p-2 font-medium">Pricing Model</td>
                    {selectedTools.map((tool) => (
                      <td key={tool.id} className="p-2">
                        <Badge variant="outline">
                          {tool.pricing_model || 'Not specified'}
                        </Badge>
                      </td>
                    ))}
                  </tr>

                  {/* Pricing Model */}
                  <tr className="border-b">
                    <td className="p-2 font-medium">Pricing Model</td>
                    {selectedTools.map((tool) => (
                      <td key={tool.id} className="p-2">
                        <Badge variant="outline" className="flex items-center gap-1 w-fit">
                          <DollarSign className="w-3 h-3" />
                          {tool.pricing_model || 'Not specified'}
                        </Badge>
                      </td>
                    ))}
                  </tr>

                  {/* Trust Score */}
                  <tr className="border-b">
                    <td className="p-2 font-medium">Trust Score</td>
                    {selectedTools.map((tool) => (
                      <td key={tool.id} className="p-2">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-blue-500" />
                          <span className="font-medium">
                            {tool.overall_score ? Math.round(tool.overall_score * 10) : 'N/A'}%
                          </span>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Performance Score */}
                  <tr className="border-b">
                    <td className="p-2 font-medium">Performance</td>
                    {selectedTools.map((tool) => (
                      <td key={tool.id} className="p-2">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-yellow-500" />
                          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${(tool.overall_score || 0) * 10}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium min-w-[2rem] text-right">
                            {tool.overall_score?.toFixed(1) || 'N/A'}
                          </span>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Website */}
                  <tr>
                    <td className="p-2 font-medium">Website</td>
                    {selectedTools.map((tool) => (
                      <td key={tool.id} className="p-2">
                        {tool.website ? (
                          <Link 
                            href={tool.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1"
                          >
                            <Share2 className="w-3 h-3" />
                            Visit Site
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">Not available</span>
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 mt-6">
              <Button onClick={() => setShowDetailedComparison(!showDetailedComparison)}>
                <Eye className="w-4 h-4 mr-2" />
                {showDetailedComparison ? 'Hide Detailed Comparison' : 'Detailed Comparison'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowRecommendations(!showRecommendations)}
                disabled={selectedTools.length < 2}
              >
                <Award className="w-4 h-4 mr-2" />
                Get Recommendations
              </Button>
              <Button variant="outline" onClick={clearAll}>
                <X className="w-4 h-4 mr-2" />
                Start Over
              </Button>
              <Button variant="outline" onClick={() => {
                const data = selectedTools.map(tool => ({
                  name: tool.name,
                  rating: tool.overall_score,
                  verdict: tool.verdict,
                  upvotes: tool.upvotes,
                  reviews: tool.total_reviews,
                  pricing: tool.pricing_model,
                  website: tool.website
                }));
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'tool-comparison.json';
                a.click();
              }}>
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Comparison Section */}
      {showDetailedComparison && selectedTools.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Detailed Features Comparison */}
              <div className="overflow-x-auto relative">
                <div className="absolute top-0 right-0 bg-gradient-to-l from-background to-transparent w-8 h-full pointer-events-none z-10"></div>
                <div className="absolute top-0 left-0 bg-gradient-to-r from-background to-transparent w-8 h-full pointer-events-none z-10"></div>
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Feature</th>
                      {selectedTools.map((tool) => (
                        <th key={tool.id} className="text-left p-2 min-w-[180px] sm:min-w-[200px]">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                              {tool.logo_url ? (
                                <Image src={tool.logo_url} alt={tool.name} width={24} height={24} className="w-6 h-6 rounded" />
                              ) : (
                                <span className="text-xs font-bold">{tool.name.charAt(0)}</span>
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{tool.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {tool.category?.name}
                              </div>
                            </div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Description */}
                    <tr className="border-b">
                      <td className="p-2 font-medium">Description</td>
                      {selectedTools.map((tool) => (
                        <td key={tool.id} className="p-2">
                          <p className="text-sm text-muted-foreground">
                            {tool.description || 'No description available'}
                          </p>
                        </td>
                      ))}
                    </tr>

                    {/* Category */}
                    <tr className="border-b">
                      <td className="p-2 font-medium">Category</td>
                      {selectedTools.map((tool) => (
                        <td key={tool.id} className="p-2">
                          <Badge variant="outline">
                            {tool.category?.name || 'Uncategorized'}
                          </Badge>
                        </td>
                      ))}
                    </tr>

                    {/* Pricing */}
                    <tr className="border-b">
                      <td className="p-2 font-medium">Pricing Model</td>
                      {selectedTools.map((tool) => (
                        <td key={tool.id} className="p-2">
                          <Badge variant="outline">
                            {tool.pricing_model || 'Not specified'}
                          </Badge>
                        </td>
                      ))}
                    </tr>

                    {/* Features */}
                    <tr className="border-b">
                      <td className="p-2 font-medium">Key Features</td>
                      {selectedTools.map((tool) => (
                        <td key={tool.id} className="p-2">
                          <div className="space-y-1">
                            {tool.features ? (
                              tool.features.split(',').map((feature, index) => (
                                <div key={index} className="text-sm flex items-center gap-1">
                                  <Check className="w-3 h-3 text-green-500" />
                                  {feature.trim()}
                                </div>
                              ))
                            ) : (
                              <span className="text-muted-foreground text-sm">No features listed</span>
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Pros and Cons */}
                    <tr className="border-b">
                      <td className="p-2 font-medium">Pros & Cons</td>
                      {selectedTools.map((tool) => (
                        <td key={tool.id} className="p-2">
                          <div className="space-y-2">
                            {tool.pros && (
                              <div>
                                <div className="text-sm font-medium text-green-600">Pros:</div>
                                <ul className="text-xs text-muted-foreground space-y-1">
                                  {tool.pros.split(',').map((pro, index) => (
                                    <li key={index}>• {pro.trim()}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {tool.cons && (
                              <div>
                                <div className="text-sm font-medium text-red-600">Cons:</div>
                                <ul className="text-xs text-muted-foreground space-y-1">
                                  {tool.cons.split(',').map((con, index) => (
                                    <li key={index}>• {con.trim()}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Website */}
                    <tr>
                      <td className="p-2 font-medium">Website</td>
                      {selectedTools.map((tool) => (
                        <td key={tool.id} className="p-2">
                          {tool.website ? (
                            <Link 
                              href={tool.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline text-sm"
                            >
                              Visit Site
                            </Link>
                          ) : (
                            <span className="text-muted-foreground text-sm">Not available</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations Section */}
      {showRecommendations && selectedTools.length >= 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Expert Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const recommendation = getRecommendation();
              if (!recommendation) return null;
              
              return (
                <div className="space-y-6">
                  {/* Best Tool */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                        <ThumbsUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
                        Recommended Choice
                      </h3>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center shadow-sm">
                        {recommendation.best.logo_url ? (
                          <Image 
                            src={recommendation.best.logo_url} 
                            alt={recommendation.best.name} 
                            width={32} 
                            height={32} 
                            className="w-8 h-8 rounded" 
                          />
                        ) : (
                          <span className="text-lg font-bold text-green-600">
                            {recommendation.best.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-green-900 dark:text-green-100">
                          {recommendation.best.name}
                        </h4>
                        <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                          {recommendation.best.description || 'No description available'}
                        </p>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="font-medium">
                              {recommendation.best.overall_score?.toFixed(1) || 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-4 h-4 text-green-500" />
                            <span>{recommendation.best.upvotes || 0} votes</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4 text-blue-500" />
                            <span>{recommendation.best.total_reviews || 0} reviews</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Comparison Summary */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                        <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                        Comparison Summary
                      </h3>
                    </div>
                    <p className="text-blue-800 dark:text-blue-200 mb-4">
                      {recommendation.summary}
                    </p>
                    
                    {/* Advanced Insights */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          Popularity Insights
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Most Popular:</span>
                            <span className="font-medium text-sm">{recommendation.mostPopular.name}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Total Votes:</span>
                            <span className="font-medium text-sm">{recommendation.totalVotes}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Most Reviewed:</span>
                            <span className="font-medium text-sm">{recommendation.mostReviewed.name}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          Quality Insights
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Average Rating:</span>
                            <span className="font-medium text-sm">{recommendation.avgRating.toFixed(1)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Rating Gap:</span>
                            <span className="font-medium text-sm">{recommendation.insights.ratingGap.toFixed(1)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Overall Quality:</span>
                            <Badge variant={recommendation.insights.overallQuality === 'High' ? 'default' : recommendation.insights.overallQuality === 'Medium' ? 'secondary' : 'destructive'}>
                              {recommendation.insights.overallQuality}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Key Metrics Comparison */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">Rating Comparison</h4>
                        <div className="space-y-2">
                          {selectedTools.map((tool) => (
                            <div key={tool.id} className="flex items-center justify-between">
                              <span className="text-sm">{tool.name}</span>
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                <span className="text-sm font-medium">
                                  {tool.overall_score?.toFixed(1) || 'N/A'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">Community Support</h4>
                        <div className="space-y-2">
                          {selectedTools.map((tool) => (
                            <div key={tool.id} className="flex items-center justify-between">
                              <span className="text-sm">{tool.name}</span>
                              <div className="flex items-center gap-1">
                                <TrendingUp className="w-3 h-3 text-green-500" />
                                <span className="text-sm font-medium">
                                  {tool.upvotes || 0}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">Review Count</h4>
                        <div className="space-y-2">
                          {selectedTools.map((tool) => (
                            <div key={tool.id} className="flex items-center justify-between">
                              <span className="text-sm">{tool.name}</span>
                              <div className="flex items-center gap-1">
                                <MessageSquare className="w-3 h-3 text-blue-500" />
                                <span className="text-sm font-medium">
                                  {tool.total_reviews || 0}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
