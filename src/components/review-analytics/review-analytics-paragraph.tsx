'use client';

import { useState, useEffect, useCallback } from 'react';
import { ReviewAnalytics } from '@/lib/services/reviews/analytics.service';

interface ReviewAnalyticsParagraphProps {
  reviewId: string;
}

export default function ReviewAnalyticsParagraph({ reviewId }: ReviewAnalyticsParagraphProps) {
  const [analytics, setAnalytics] = useState<ReviewAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/community/review-analytics/${reviewId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      
      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  }, [reviewId]);

  useEffect(() => {
    fetchAnalytics();
  }, [reviewId, fetchAnalytics]);

  const generateAnalyticsParagraph = () => {
    if (!analytics) {
      return 'Loading analytics data for this review...';
    }

    const helpfulnessScore = Math.round(analytics.helpfulnessScore);
    const qualityScore = Math.round(analytics.qualityScore);
    const engagementRate = Math.round(analytics.engagementRate);
    const sentimentScore = Math.round(analytics.sentimentScore);

    let paragraph = `Based on in-depth analysis, this review shows `;
    
    // Determine overall performance
    const avgScore = (helpfulnessScore + qualityScore + engagementRate + sentimentScore) / 4;
    if (avgScore >= 80) {
      paragraph += `excellent performance with an average score of ${Math.round(avgScore)}%. `;
    } else if (avgScore >= 60) {
      paragraph += `good performance with an average score of ${Math.round(avgScore)}%. `;
    } else if (avgScore >= 40) {
      paragraph += `moderate performance with an average score of ${Math.round(avgScore)}%. `;
    } else {
      paragraph += `needs improvement with an average score of ${Math.round(avgScore)}%. `;
    }

    // Add specific metrics
    paragraph += `In terms of satisfaction levels, this review scores ${helpfulnessScore}% for helpfulness, `;
    paragraph += `${qualityScore}% for content quality, `;
    paragraph += `${engagementRate}% for engagement rate, `;
    paragraph += `and ${sentimentScore}% for positive sentiment. `;

    // Add interpretation
    if (helpfulnessScore >= 80) {
      paragraph += `High helpfulness level indicates that this review is very helpful for readers. `;
    } else if (helpfulnessScore >= 60) {
      paragraph += `Good helpfulness level indicates that this review provides valuable insights. `;
    } else {
      paragraph += `Low helpfulness level indicates that this review may need improvement to provide more insights. `;
    }

    if (qualityScore >= 80) {
      paragraph += `High content quality reflects a comprehensive and well-structured review. `;
    } else if (qualityScore >= 60) {
      paragraph += `Good content quality indicates an informative review with room for improvement. `;
    } else {
      paragraph += `Low content quality indicates that this review may need to be more detailed and structured. `;
    }

    if (engagementRate >= 80) {
      paragraph += `High engagement rate indicates that this review captures attention and sparks discussion. `;
    } else if (engagementRate >= 60) {
      paragraph += `Good engagement rate indicates that this review receives positive response from the community. `;
    } else {
      paragraph += `Low engagement rate indicates that this review may need to be more engaging or relevant. `;
    }

    if (sentimentScore >= 80) {
      paragraph += `Very positive sentiment indicates that this review provides constructive and beneficial perspectives.`;
    } else if (sentimentScore >= 60) {
      paragraph += `Fairly positive sentiment indicates that this review provides balanced and objective views.`;
    } else {
      paragraph += `Neutral or negative sentiment indicates that this review may need to focus more on positive aspects or provide constructive solutions.`;
    }

    return paragraph;
  };

  if (loading) {
    return (
      <div className="text-sm text-muted-foreground">
        Loading analytics data for this review...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-600">
        Failed to load analytics data: {error}
      </div>
    );
  }

  return (
    <div className="text-sm leading-relaxed text-foreground">
      {generateAnalyticsParagraph()}
    </div>
  );
}
