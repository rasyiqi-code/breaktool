import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Category } from "@/types/app";
import { CategoriesService } from "@/lib/services/tools/categories.service";
import { ToolsService } from "@/lib/services/tools/tools.service";
import { 
  Database, 
  MessageSquare, 
  TrendingUp, 
  Star, 
  ArrowRight,
  Palette,
  Code,
  BarChart3,
  Users,
  Shield,
  Zap,
  Globe
} from "lucide-react";
import Link from "next/link";

interface CategoryWithStats extends Category {
  toolCount: number;
  avgRating: number;
  featuredTools: number;
}

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  'productivity': Palette,
  'development': Code,
  'analytics': BarChart3,
  'collaboration': Users,
  'security': Shield,
  'automation': Zap,
  'marketing': TrendingUp,
  'communication': MessageSquare,
  'database': Database,
  'web': Globe,
  'default': Star
};

export async function ToolCategories() {
  let categories: CategoryWithStats[] = [];

  try {
    const categoriesData = await CategoriesService.getCategories();
    
    // Get stats for each category
    const categoriesWithStats = await Promise.all(
      categoriesData.map(async (category) => {
        try {
          const tools = await ToolsService.getToolsByCategory(category.slug, 100);
          const avgRating = tools.length > 0 
            ? tools.reduce((sum, tool) => sum + (Number(tool.overall_score) || 0), 0) / tools.length 
            : 0;
          const featuredTools = tools.filter(tool => tool.featured).length;
          
          return {
            ...category,
            toolCount: tools.length,
            avgRating: Math.round(avgRating * 10) / 10,
            featuredTools
          };
        } catch (error) {
          console.error(`Error loading stats for category ${category.name}:`, error);
          return {
            ...category,
            toolCount: 0,
            avgRating: 0,
            featuredTools: 0
          };
        }
      })
    );

    // Sort by tool count (most popular first)
    categoriesWithStats.sort((a, b) => b.toolCount - a.toolCount);
    categories = categoriesWithStats;
  } catch (error) {
    console.error('Error loading categories:', error);
  }

  const getCategoryIcon = (categorySlug: string) => {
    const iconKey = Object.keys(CATEGORY_ICONS).find(key => 
      categorySlug.toLowerCase().includes(key)
    );
    return CATEGORY_ICONS[iconKey || 'default'];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Browse by Category</h2>
          <p className="text-muted-foreground">
            Discover tools organized by category and find what you need faster
          </p>
        </div>
        <Link href="/tools">
          <Button variant="outline">
            View All Tools
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => {
          const Icon = getCategoryIcon(category.slug);
          
          return (
            <Link key={category.id} href={`/tools?category=${category.slug}`}>
              <Card className="h-32 hover:shadow-md transition-shadow cursor-pointer group">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Database className="w-3 h-3" />
                        {category.toolCount} tools
                      </span>
                      {category.avgRating > 0 && (
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          {category.avgRating}/5
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {category.featuredTools > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {category.featuredTools} featured
                        </Badge>
                      )}
                      {category.toolCount > 10 && (
                        <Badge variant="outline" className="text-xs">
                          Popular
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Database className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            No categories found
          </h3>
          <p className="text-sm text-muted-foreground">
            Categories will appear here once tools are added to the platform.
          </p>
        </div>
      )}
    </div>
  );
}
