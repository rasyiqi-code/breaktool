"use client";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Star } from "lucide-react";
import { Tool, Category } from "@/types/database";

interface ToolCardProps {
  tool: Tool & {
    category?: Category;
  };
  showCategory?: boolean;
}

export function ToolCard({ 
  tool, 
  showCategory = true
}: ToolCardProps) {

  const getVerdictColor = (verdict?: string) => {
    switch (verdict) {
      case 'keep':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'try':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'stop':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getVerdictText = (verdict?: string) => {
    switch (verdict) {
      case 'keep':
        return '🟢 KEEP';
      case 'try':
        return '🟡 TRY';
      case 'stop':
        return '🔴 STOP';
      default:
        return '⚪ NOT RATED';
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-border/50 hover:border-border w-full flex flex-col relative p-0">
      {/* Visit Website Icon - Top Right Corner */}
      <div className="absolute top-3 right-3 z-10">
        <div className="flex items-center space-x-1 text-muted-foreground hover:text-primary transition-colors">
          <ExternalLink className="w-4 h-4" />
          <span className="text-xs">Visit</span>
        </div>
      </div>

      <Link href={`/tools/${tool.slug}`}>
        <CardHeader className="pb-2 px-3 sm:px-4 pt-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              {(tool.logo_url || (tool as { logoUrl?: string }).logoUrl) ? (
                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={tool.logo_url || (tool as { logoUrl?: string }).logoUrl || ''}
                    alt={`${tool.name} logo`}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">
                    {tool.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <CardTitle className="text-lg group-hover:text-primary transition-colors truncate">
                    {tool.name}
                  </CardTitle>
                  {tool.featured && (
                    <Badge variant="secondary" className="text-xs">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>
                
                {showCategory && tool.category && (
                  <Badge variant="outline" className="text-xs mt-1">
                    {tool.category.name}
                  </Badge>
                )}
              </div>
            </div>

          </div>
        </CardHeader>

        <CardContent className="pt-0 pb-4 px-3 sm:px-4 flex-1 flex flex-col">
          <CardDescription className="text-sm text-muted-foreground line-clamp-2 mb-2 flex-1">
            {tool.description}
          </CardDescription>

          <div className="space-y-1 mt-auto">
            {/* Verdict Badge */}
            {tool.verdict && (
              <Badge 
                variant="outline" 
                className={`text-xs font-medium ${getVerdictColor(tool.verdict)}`}
              >
                {getVerdictText(tool.verdict)}
              </Badge>
            )}

            {/* Stats */}
            {tool.overall_score && tool.overall_score > 0 && (
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <Star className="w-4 h-4 fill-current text-yellow-400" />
                <span>{tool.overall_score.toFixed(1)}</span>
              </div>
            )}

            {/* Pricing */}
            {tool.pricing_model && (
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">
                  {tool.pricing_model === 'free' && 'Free'}
                  {tool.pricing_model === 'freemium' && 'Freemium'}
                  {tool.pricing_model === 'paid' && 'Paid'}
                  {tool.pricing_model === 'enterprise' && 'Enterprise'}
                </Badge>
                
                {tool.starting_price && (
                  <span className="text-sm font-medium">
                    From ${tool.starting_price}/mo
                  </span>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
