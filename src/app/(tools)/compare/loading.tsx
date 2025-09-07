import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function CompareLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
          </div>

          {/* Tool Selection Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-4" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-16" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Category Filter */}
                <div className="w-full max-w-xs">
                  <Skeleton className="h-9 w-full" />
                </div>

                {/* Available Tools Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded" />
                        <div>
                          <Skeleton className="h-4 w-24 mb-1" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                      <Skeleton className="h-4 w-4" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
