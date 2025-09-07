'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@stackframe/stack';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Crown, Star, Zap, Shield, BarChart3, Users, MessageSquare } from 'lucide-react';
import { SubscriptionPlan, UserSubscriptionWithPlan } from '@/lib/services/vendor/subscription.service';

export default function SubscriptionPage() {
  const user = useUser();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscriptionWithPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptionData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const [plansResponse, subscriptionResponse] = await Promise.all([
        fetch('/api/subscription/plans'),
        fetch('/api/subscription/user')
      ]);

      if (!plansResponse.ok) throw new Error('Failed to fetch plans');
      if (!subscriptionResponse.ok) throw new Error('Failed to fetch subscription');

      const plansData = await plansResponse.json();
      const subscriptionData = await subscriptionResponse.json();

      setPlans(plansData);
      setCurrentSubscription(subscriptionData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch subscription data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSubscriptionData();
  }, [user, fetchSubscriptionData]);

  const handleUpgrade = async (planSlug: string) => {
    if (!user?.id) return;

    try {
      // For now, we'll just show an alert. In a real implementation,
      // this would redirect to Stripe Checkout or handle payment
      alert(`Upgrade to ${planSlug} - Payment integration coming soon!`);
      
      // Example implementation:
      // const response = await fetch('/api/subscription/create-checkout-session', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({ planSlug })
      // });
      // const { url } = await response.json();
      // window.location.href = url;
    } catch (err) {
      console.error('Error upgrading subscription:', err);
      alert('Failed to upgrade subscription');
    }
  };

  const handleCancel = async () => {
    if (!user?.id || !currentSubscription) return;

    if (confirm('Are you sure you want to cancel your subscription? You will lose access to Pro features at the end of your billing period.')) {
      try {
        const response = await fetch('/api/subscription/cancel', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          alert('Subscription canceled successfully');
          fetchSubscriptionData();
        } else {
          throw new Error('Failed to cancel subscription');
        }
      } catch (err) {
        console.error('Error canceling subscription:', err);
        alert('Failed to cancel subscription');
      }
    }
  };

  const getFeatureIcon = (featureSlug: string) => {
    switch (featureSlug) {
      case 'max_comparisons':
        return <BarChart3 className="w-4 h-4" />;
      case 'max_saved_tools':
        return <Star className="w-4 h-4" />;
      case 'basic_filters':
      case 'advanced_filters':
        return <Zap className="w-4 h-4" />;
      case 'community_reviews':
        return <MessageSquare className="w-4 h-4" />;
      case 'basic_analytics':
        return <BarChart3 className="w-4 h-4" />;
      case 'verified_tester_access':
        return <Shield className="w-4 h-4" />;
      case 'priority_support':
        return <Users className="w-4 h-4" />;
      case 'detailed_reports':
        return <Crown className="w-4 h-4" />;
      default:
        return <Check className="w-4 h-4" />;
    }
  };

  const formatFeatureValue = (featureSlug: string, value: string | number | boolean) => {
    if (featureSlug.startsWith('max_')) {
      return `${value} ${featureSlug.includes('comparisons') ? 'comparisons' : 'tools'}`;
    }
    return value === true ? 'Included' : value === false ? 'Not included' : value;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-96 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          <p className="mb-4">Error loading subscription data</p>
          <Button onClick={fetchSubscriptionData} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Subscription Plans</h1>
          <p className="text-gray-600">Choose the plan that best fits your needs</p>
        </div>

        {/* Current Subscription Status */}
        {currentSubscription && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-500" />
                Current Subscription: {currentSubscription.plan_name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge variant={currentSubscription.status === 'active' ? 'default' : 'secondary'}>
                    {currentSubscription.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Renews on</p>
                  <p className="font-medium">
                    {new Date(currentSubscription.current_period_end).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Button onClick={handleCancel} variant="outline" size="sm">
                    Cancel Subscription
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Subscription Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrentPlan = currentSubscription?.plan_slug === plan.slug;
            const isPopular = plan.slug === 'pro';
            
            return (
              <Card key={plan.id} className={`relative ${isPopular ? 'ring-2 ring-primary' : ''}`}>
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center gap-2">
                    {plan.slug === 'free' && <Star className="w-5 h-5" />}
                    {plan.slug === 'pro' && <Crown className="w-5 h-5 text-yellow-500" />}
                    {plan.slug === 'pro-yearly' && <Crown className="w-5 h-5 text-yellow-500" />}
                    {plan.name}
                  </CardTitle>
                  <div className="text-3xl font-bold">
                    ${plan.price}
                    <span className="text-sm font-normal text-gray-600">
                      /{plan.billing_cycle === 'monthly' ? 'mo' : 'year'}
                    </span>
                  </div>
                  <p className="text-gray-600">{plan.description}</p>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Features */}
                  <div className="space-y-3">
                    {Object.entries(plan.features).map(([featureSlug, value]) => (
                      <div key={featureSlug} className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {getFeatureIcon(featureSlug)}
                          <span className="text-sm">
                            {featureSlug.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </div>
                        <div className="ml-auto">
                          {value === true ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : value === false ? (
                            <X className="w-4 h-4 text-gray-400" />
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              {formatFeatureValue(featureSlug, value as string | number | boolean)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action Button */}
                  <Button
                    className="w-full"
                    variant={isCurrentPlan ? 'outline' : 'default'}
                    disabled={isCurrentPlan}
                    onClick={() => handleUpgrade(plan.slug)}
                  >
                    {isCurrentPlan ? 'Current Plan' : plan.price === 0 ? 'Get Started' : 'Upgrade'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Feature Comparison */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-center mb-6">Feature Comparison</h2>
          <Card>
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Feature</th>
                      <th className="text-center py-3 px-4">Free</th>
                      <th className="text-center py-3 px-4">Pro</th>
                      <th className="text-center py-3 px-4">Pro Yearly</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plans[0] && Object.entries(plans[0].features).map(([featureSlug]) => (
                      <tr key={featureSlug} className="border-b">
                        <td className="py-3 px-4 font-medium">
                          {featureSlug.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </td>
                        {plans.map((plan) => (
                          <td key={plan.id} className="text-center py-3 px-4">
                            {plan.features[featureSlug] === true ? (
                              <Check className="w-4 h-4 text-green-500 mx-auto" />
                            ) : plan.features[featureSlug] === false ? (
                              <X className="w-4 h-4 text-gray-400 mx-auto" />
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                {formatFeatureValue(featureSlug, plan.features[featureSlug] as string | number | boolean)}
                              </Badge>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-center mb-6">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I cancel anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Yes, you can cancel your subscription at any time. You&apos;ll continue to have access to Pro features until the end of your billing period.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What payment methods do you accept?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We accept all major credit cards, debit cards, and PayPal. All payments are processed securely through Stripe.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is there a free trial?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Yes! You can try Pro features for free for 7 days. No credit card required to start your trial.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I upgrade or downgrade?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  You can upgrade to a higher plan at any time. Downgrades will take effect at the end of your current billing period.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
