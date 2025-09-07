// Dashboard Layout
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          {children}
        </div>
      </div>
    </div>
  )
}
