'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, Star, Calendar, AlertCircle } from 'lucide-react';
import { UserSubscriptionWithPlan } from '@/lib/services/vendor/subscription.service';

interface SubscriptionStatusProps {
  userId: string;
}

export default function SubscriptionStatus({ userId }: SubscriptionStatusProps) {
  const [subscription, setSubscription] = useState<UserSubscriptionWithPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscription();
  }, [userId]);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/subscription/user');
      if (!response.ok) throw new Error('Failed to fetch subscription');

      const data = await response.json();
      setSubscription(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch subscription');
    } finally {
      setLoading(false);
    }
  };

  const getPlanIcon = (planSlug: string) => {
    switch (planSlug) {
      case 'free':
        return <Star className="w-4 h-4" />;
      case 'pro':
      case 'pro-yearly':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      default:
        return <Star className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
      case 'canceled':
        return <Badge variant="secondary">Canceled</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-4 h-4" />
            <span>Error loading subscription status</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Subscription Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Current Plan</span>
              <Badge variant="outline">Free</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status</span>
              <Badge variant="default">Active</Badge>
            </div>
            <Button 
              onClick={() => window.location.href = '/subscription'} 
              className="w-full"
              variant="outline"
            >
              Upgrade to Pro
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getPlanIcon(subscription.plan_slug)}
          Subscription Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Current Plan</span>
            <div className="flex items-center gap-2">
              {getPlanIcon(subscription.plan_slug)}
              <span className="font-medium">{subscription.plan_name}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Status</span>
            {getStatusBadge(subscription.status)}
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Renews on</span>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm">
                {new Date(subscription.current_period_end).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="pt-2">
            <Button 
              onClick={() => window.location.href = '/subscription'} 
              className="w-full"
              variant={subscription.plan_slug === 'free' ? 'default' : 'outline'}
            >
              {subscription.plan_slug === 'free' ? 'Upgrade to Pro' : 'Manage Subscription'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
