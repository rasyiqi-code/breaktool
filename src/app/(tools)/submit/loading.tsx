import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function SubmitLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-10 w-80" />
            </div>
            <Skeleton className="h-6 w-full" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                      <div>
                        <Skeleton className="h-4 w-20 mb-2" />
                        <Skeleton className="h-10 w-full" />
                      </div>

                      <div>
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-10 w-full" />
                      </div>

                      <div>
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-20 w-full" />
                      </div>

                      <div>
                        <Skeleton className="h-4 w-20 mb-2" />
                        <Skeleton className="h-10 w-full" />
                      </div>

                      <div>
                        <Skeleton className="h-4 w-20 mb-2" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-3 w-48 mt-1" />
                      </div>
                    </div>

                    {/* Relationship */}
                    <div>
                      <Skeleton className="h-4 w-40 mb-2" />
                      <div className="space-y-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="flex items-center space-x-2">
                            <Skeleton className="h-4 w-4 rounded" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div>
                      <Skeleton className="h-4 w-40 mb-2" />
                      <Skeleton className="h-20 w-full" />
                    </div>

                    {/* Agreement */}
                    <div className="flex items-start space-x-2">
                      <Skeleton className="h-4 w-4 rounded mt-1" />
                      <Skeleton className="h-16 w-full" />
                    </div>

                    <Skeleton className="h-10 w-full" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Review Process */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-6 w-28" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Skeleton className="h-6 w-6 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Guidelines */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-6 w-36" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Skeleton className="h-4 w-4 rounded mt-0.5" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Stats */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-6 w-28" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
