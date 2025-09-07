
import { ReviewBookmarks } from "@/components/reviews/review-bookmarks"

export default function BookmarksPage() {
  return (
    <div className="min-h-screen bg-background">
      
      
      <main className="container mx-auto px-4 py-8">
        <ReviewBookmarks showFilters={true} />
      </main>
    </div>
  )
}
