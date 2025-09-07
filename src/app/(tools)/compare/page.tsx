'use client';

import { ToolComparison } from "@/components/tools/tool-comparison"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Users, Target, Zap, Award } from "lucide-react"

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-0 sm:px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">
                Tool Comparison
              </h1>
              <p className="text-muted-foreground text-lg">
                Compare SaaS tools side-by-side with expert insights and community ratings
              </p>
            </div>
          </div>

          {/* Benefits Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100">Expert Reviews</h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300">Professional testing insights</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                    <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-900 dark:text-green-100">Community Data</h3>
                    <p className="text-sm text-green-700 dark:text-green-300">Real user experiences</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                    <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-purple-900 dark:text-purple-100">Performance Metrics</h3>
                    <p className="text-sm text-purple-700 dark:text-purple-300">Detailed scoring system</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                    <Award className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-orange-900 dark:text-orange-100">Smart Recommendations</h3>
                    <p className="text-sm text-orange-700 dark:text-orange-300">AI-powered suggestions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* How It Works */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                How It Works
              </CardTitle>
              <CardDescription>
                Get comprehensive insights in just a few clicks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-primary font-bold text-lg">1</span>
                  </div>
                  <h3 className="font-semibold mb-2">Select Tools</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose up to 6 tools from our comprehensive database
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-primary font-bold text-lg">2</span>
                  </div>
                  <h3 className="font-semibold mb-2">Compare Features</h3>
                  <p className="text-sm text-muted-foreground">
                    View detailed comparisons across multiple criteria
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-primary font-bold text-lg">3</span>
                  </div>
                  <h3 className="font-semibold mb-2">Make Decision</h3>
                  <p className="text-sm text-muted-foreground">
                    Get expert recommendations and community insights
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Comparison Component */}
        <ToolComparison maxTools={6} />
      </main>
    </div>
  )
}
