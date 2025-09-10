'use client';

import { useState } from 'react';
// Removed Card imports - no longer using Card wrapper
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  Clock, 
  Users, 
  Shield,
  Award,
  MessageSquare,
  BarChart3
} from "lucide-react";
import ReviewAnalyticsParagraph from '@/components/review-analytics/review-analytics-paragraph';

interface ReviewCardProps {
  review: {
    id: string;
    title: string;
    content: string;
    overall_score?: number;
    value_score?: number;
    usage_score?: number;
    integration_score?: number;
    pain_points?: string;
    setup_time?: string;
    roi_story?: string;
    usage_recommendations?: string;
    weaknesses?: string;
    pros?: string[];
    cons?: string[];
    recommendation?: 'keep' | 'try' | 'stop';
    use_case?: string;
    company_size?: string;
    industry?: string;
    usage_duration?: string;
    helpful_votes: number;
    total_votes: number;
    helpfulVotes?: number;
    totalVotes?: number;
    type: 'admin' | 'verified_tester' | 'community';
    created_at: string;
    user?: {
      id: string;
      name?: string;
      avatar_url?: string;
      role: string;
      trust_score: number;
      badges?: string[];
      is_verified_tester?: boolean;
    };
  };
  onVote?: (reviewId: string, voteType: 'helpful' | 'not_helpful') => Promise<void>;
  showVoteButtons?: boolean;
  toolName?: string;
}

export function ReviewCard({ review, onVote, showVoteButtons = true, toolName = "VS Code" }: ReviewCardProps) {
  const [voting, setVoting] = useState(false);

  const handleVote = async (voteType: 'helpful' | 'not_helpful') => {
    if (!onVote || voting) return;
    
    try {
      setVoting(true);
      await onVote(review.id, voteType);
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setVoting(false);
    }
  };


  const getReviewTypeBadge = (type: string) => {
    switch (type) {
      case 'admin':
        return (
          <Badge variant="destructive" className="text-xs">
            <Shield className="w-3 h-3 mr-1" />
            Admin Review
          </Badge>
        );
      case 'verified_tester':
        return (
          <Badge variant="secondary" className="text-xs">
            <Award className="w-3 h-3 mr-1" />
            Verified Tester
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-xs">
            <MessageSquare className="w-3 h-3 mr-1" />
            Community
          </Badge>
        );
    }
  };

  const getUserBadges = (badges?: string[]) => {
    if (!badges || badges.length === 0) return null;
    
    return (
      <div className="flex gap-1">
        {badges.map((badge, index) => {
          switch (badge) {
            case 'verified_tester':
              return (
                <Badge key={index} variant="secondary" className="text-xs">
                  <Award className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              );
            case 'top_reviewer':
              return (
                <Badge key={index} variant="default" className="text-xs">
                  <Star className="w-3 h-3 mr-1" />
                  Top Reviewer
                </Badge>
              );
            default:
              if (badge.endsWith('_expert')) {
                const expertise = badge.replace('_expert', '');
                return (
                  <Badge key={index} variant="outline" className="text-xs">
                    {expertise} Expert
                  </Badge>
                );
              }
              return (
                <Badge key={index} variant="outline" className="text-xs">
                  {badge}
                </Badge>
              );
          }
        })}
      </div>
    );
  };

  const formatDate = (dateString: string | Date) => {
    if (!dateString) return 'Unknown Date';
    
    try {
      let date: Date;
      
      // Handle different input types
      if (dateString instanceof Date) {
        date = dateString;
      } else if (typeof dateString === 'string') {
        // Handle ISO string, timestamp, or other string formats
        date = new Date(dateString);
      } else {
        return 'Invalid Date';
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      
      // Format the date
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Date formatting error:', error, 'Input:', dateString);
      return 'Invalid Date';
    }
  };




  // const generateProsConsParagraph = () => {
  //   let prosConsText = '';
    
  //   if (review.pros && review.pros.length > 0) {
  //     const prosText = review.pros.map(pro => `"${pro}"`).join('", ');
  //     prosConsText += `Keunggulan utama dari ${toolName} meliputi ${prosText}. `;
  //   }
    
  //   if (review.cons && review.cons.length > 0) {
  //     const consText = review.cons.map(con => `"${con}"`).join('", ');
  //     prosConsText += `Di sisi lain, beberapa kelemahan yang ditemukan adalah ${consText}.`;
  //   }
    
  //   return prosConsText || 'Tidak ada informasi pros dan cons yang tersedia untuk review ini.';
  // };

  // const generateContextParagraph = () => {
  //   let contextText = '';
    
  //   if (review.company_size) {
  //     contextText += `Review ini ditulis oleh pengguna dari perusahaan dengan ukuran ${review.company_size}. `;
  //   }
    
  //   if (review.industry) {
  //     contextText += `Bidang industri yang dijalani adalah ${review.industry}. `;
  //   }
    
  //   if (review.usage_duration) {
  //     contextText += `Durasi penggunaan tool ini adalah ${review.usage_duration}. `;
  //   }
    
  //   if (review.use_case) {
  //     contextText += `Use case utama yang dijalankan adalah ${review.use_case}.`;
  //   }
    
  //   return contextText || 'Tidak ada informasi konteks yang tersedia untuk review ini.';
  // };

  const generateCombinedReviewArticle = () => {
    if (!review.content) {
      return <p>No review content available.</p>;
    }

    const overallScore = review.overall_score || 0;
    const valueScore = review.value_score || 0;
    const usageScore = review.usage_score || 0;
    const integrationScore = review.integration_score || 0;

    return (
      <>
        {/* Main Review Content */}
        <p className="text-base leading-relaxed">
          {review.content}
        </p>

        {/* Natural Flow Analysis */}
        <div className="space-y-3">
          {/* Scoring Section */}
          {overallScore > 0 && (
            <p>
              Based on my experience using {toolName}, I give it an overall score of <strong>{overallScore.toFixed(1)}/10</strong>. 
              {valueScore > 0 && ` In terms of value for money, this tool scores ${valueScore.toFixed(1)}/10.`}
              {usageScore > 0 && ` Ease of use scores ${usageScore.toFixed(1)}/10.`}
              {integrationScore > 0 && ` As for integration with other tools, it scores ${integrationScore.toFixed(1)}/10.`}
            </p>
          )}

          {/* Pros Section */}
          {review.pros && review.pros.length > 0 && (
            <p>
              The <strong>main advantages</strong> I found with {toolName} are {review.pros.map((pro, index) => {
                if (index === review.pros!.length - 1) return `and ${pro}`;
                if (index === review.pros!.length - 2) return `${pro} `;
                return `${pro}, `;
              }).join('')}. 
              {review.pros.length === 1 ? 'This feature is very helpful in increasing productivity.' : 'These features are very helpful in increasing productivity.'}
            </p>
          )}

          {/* Cons Section */}
          {review.cons && review.cons.length > 0 && (
            <p>
              However, there are some <strong>limitations</strong> to consider: {review.cons.map((con, index) => {
                if (index === review.cons!.length - 1) return `and ${con}`;
                if (index === review.cons!.length - 2) return `${con} `;
                return `${con}, `;
              }).join('')}. 
              Nevertheless, these limitations do not diminish the overall value of this tool.
            </p>
          )}

          {/* Pain Points & ROI */}
          {(review.pain_points || review.roi_story) && (
            <p>
              {review.pain_points && `This tool is very helpful in addressing ${review.pain_points}. `}
              {review.roi_story && review.roi_story}
            </p>
          )}

          {/* Setup & Usage */}
          {(review.setup_time || review.usage_recommendations) && (
            <p>
              {review.setup_time && `Untuk setup awal, tool ini membutuhkan waktu sekitar ${review.setup_time}. `}
              {review.usage_recommendations && `Saya sangat merekomendasikan {toolName} untuk ${review.usage_recommendations}.`}
            </p>
          )}

          {/* Context Information */}
          {(review.company_size || review.industry || review.usage_duration) && (
            <p className="text-sm text-muted-foreground italic">
              <strong>Konteks penggunaan:</strong> 
              {review.company_size && ` Saya menggunakan tool ini di perusahaan dengan ukuran ${review.company_size}.`}
              {review.industry && ` Bidang industri yang saya jalani adalah ${review.industry}.`}
              {review.usage_duration && ` Saya telah menggunakan tool ini selama ${review.usage_duration}.`}
            </p>
          )}

          {/* Final Recommendation */}
          {review.recommendation && (
            <p className="font-medium">
              <strong>Rekomendasi akhir:</strong> Berdasarkan pengalaman saya, {toolName} adalah tool yang {
                review.recommendation === 'keep' ? 'sangat direkomendasikan untuk terus digunakan' :
                review.recommendation === 'try' ? 'layak untuk dicoba dan dievaluasi lebih lanjut' :
                'tidak direkomendasikan untuk saat ini'
              }.
            </p>
          )}
        </div>
      </>
    );
  };

  // const generateReviewContentParagraph = () => {
  //   if (!review.content) {
  //     return 'Tidak ada konten review yang tersedia.';
  //   }
    
  //   // Return the actual review content directly without wrapping text
  //   return review.content;
  // };



  return (
    <div className="border-b border-border pb-6 mb-6">
      <div className="flex items-start gap-3 mb-4">
        <Avatar className="h-8 w-8">
          <AvatarImage src={review.user?.avatar_url} />
          <AvatarFallback>
            {review.user?.name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">
              {review.user?.name || 'Anonymous User'}
            </span>
            {getReviewTypeBadge(review.type)}
            {getUserBadges(review.user?.badges)}
            {review.user?.trust_score && (
              <Badge variant="outline" className="text-xs">
                <Star className="w-3 h-3 mr-1" />
                {review.user.trust_score} Trust Score
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{formatDate(review.created_at)}</span>
            {review.company_size && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {review.company_size}
                </span>
              </>
            )}
            {review.usage_duration && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {review.usage_duration}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        {/* Combined Review Article */}
        <div className="bg-muted/50 p-6 rounded-lg border-l-4 border-indigo-500">
          <h4 className="font-semibold mb-4 flex items-center gap-2 text-lg">
            <MessageSquare className="w-5 h-5" />
            Review Analysis
          </h4>
          <div className="space-y-4 text-sm leading-relaxed text-foreground">
            {generateCombinedReviewArticle()}
          </div>
        </div>

        {/* Review Analytics in Paragraph Format - Always Visible */}
        <div className="bg-muted/50 p-4 rounded-lg border-l-4 border-purple-500">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Review Analytics
          </h4>
          <ReviewAnalyticsParagraph reviewId={review.id} />
        </div>

        {/* Voting */}
        {showVoteButtons && (
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVote('helpful')}
                disabled={voting}
                className="flex items-center gap-2"
              >
                <ThumbsUp className="w-4 h-4" />
                Helpful ({review.helpfulVotes || review.helpful_votes || 0})
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVote('not_helpful')}
                disabled={voting}
                className="flex items-center gap-2"
              >
                <ThumbsDown className="w-4 h-4" />
                Not Helpful ({(review.totalVotes || review.total_votes || 0) - (review.helpfulVotes || review.helpful_votes || 0)})
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground">
              {review.totalVotes || review.total_votes || 0} total votes
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
