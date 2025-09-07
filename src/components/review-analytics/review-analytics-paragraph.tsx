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
      return 'Sedang memuat data analytics untuk review ini...';
    }

    const helpfulnessScore = Math.round(analytics.helpfulnessScore);
    const qualityScore = Math.round(analytics.qualityScore);
    const engagementRate = Math.round(analytics.engagementRate);
    const sentimentScore = Math.round(analytics.sentimentScore);

    let paragraph = `Berdasarkan analisis mendalam, review ini menunjukkan performa yang `;
    
    // Determine overall performance
    const avgScore = (helpfulnessScore + qualityScore + engagementRate + sentimentScore) / 4;
    if (avgScore >= 80) {
      paragraph += `sangat baik dengan skor rata-rata ${Math.round(avgScore)}%. `;
    } else if (avgScore >= 60) {
      paragraph += `cukup baik dengan skor rata-rata ${Math.round(avgScore)}%. `;
    } else if (avgScore >= 40) {
      paragraph += `sedang dengan skor rata-rata ${Math.round(avgScore)}%. `;
    } else {
      paragraph += `perlu perbaikan dengan skor rata-rata ${Math.round(avgScore)}%. `;
    }

    // Add specific metrics
    paragraph += `Dari segi tingkat kepuasan, review ini mendapat skor ${helpfulnessScore}% untuk helpfulness, `;
    paragraph += `${qualityScore}% untuk kualitas konten, `;
    paragraph += `${engagementRate}% untuk tingkat keterlibatan, `;
    paragraph += `dan ${sentimentScore}% untuk sentimen positif. `;

    // Add interpretation
    if (helpfulnessScore >= 80) {
      paragraph += `Tingkat helpfulness yang tinggi menunjukkan bahwa review ini sangat membantu bagi pembaca. `;
    } else if (helpfulnessScore >= 60) {
      paragraph += `Tingkat helpfulness yang cukup baik menunjukkan bahwa review ini memberikan nilai yang berguna. `;
    } else {
      paragraph += `Tingkat helpfulness yang rendah menunjukkan bahwa review ini mungkin perlu diperbaiki untuk memberikan lebih banyak insight. `;
    }

    if (qualityScore >= 80) {
      paragraph += `Kualitas konten yang tinggi mencerminkan review yang komprehensif dan terstruktur dengan baik. `;
    } else if (qualityScore >= 60) {
      paragraph += `Kualitas konten yang cukup baik menunjukkan review yang informatif meskipun ada ruang untuk perbaikan. `;
    } else {
      paragraph += `Kualitas konten yang rendah menunjukkan bahwa review ini mungkin perlu lebih detail dan terstruktur. `;
    }

    if (engagementRate >= 80) {
      paragraph += `Tingkat keterlibatan yang tinggi menunjukkan bahwa review ini menarik perhatian dan memicu diskusi. `;
    } else if (engagementRate >= 60) {
      paragraph += `Tingkat keterlibatan yang cukup baik menunjukkan bahwa review ini mendapat respons positif dari komunitas. `;
    } else {
      paragraph += `Tingkat keterlibatan yang rendah menunjukkan bahwa review ini mungkin perlu lebih menarik atau relevan. `;
    }

    if (sentimentScore >= 80) {
      paragraph += `Sentimen yang sangat positif menunjukkan bahwa review ini memberikan perspektif yang konstruktif dan bermanfaat.`;
    } else if (sentimentScore >= 60) {
      paragraph += `Sentimen yang cukup positif menunjukkan bahwa review ini memberikan pandangan yang seimbang dan objektif.`;
    } else {
      paragraph += `Sentimen yang netral atau negatif menunjukkan bahwa review ini mungkin perlu lebih fokus pada aspek positif atau memberikan solusi yang konstruktif.`;
    }

    return paragraph;
  };

  if (loading) {
    return (
      <div className="text-sm text-muted-foreground">
        Sedang memuat data analytics untuk review ini...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-600">
        Gagal memuat data analytics: {error}
      </div>
    );
  }

  return (
    <div className="text-sm leading-relaxed text-foreground">
      {generateAnalyticsParagraph()}
    </div>
  );
}
