import type { Metadata } from "next";
import "./globals.css";
import StackAuthProvider from "@/components/stack-provider";
import { QueryProvider } from "@/components/query-provider";
import { Navigation } from "@/components/layout/navigation";
import { Toaster } from "@/components/ui/toaster";
import { GoogleAnalytics } from "@/components/seo/google-analytics";
import { PerformanceMonitor } from "@/components/performance/performance-monitor";
import { ErrorBoundary } from "@/components/error/error-boundary";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://breaktool.com'),
  title: "Breaktool - Trusted SaaS Reviews by Verified Experts",
  description: "Discover, test, and decide on SaaS tools with reviews from verified experts and professionals. The most trusted SaaS review platform.",
  keywords: [
    "SaaS reviews",
    "software reviews", 
    "tool analysis",
    "expert reviews",
    "verified reviews",
    "software comparison",
    "SaaS tools",
    "productivity tools"
  ],
  authors: [{ name: "Breaktool Team" }],
  creator: "Breaktool",
  publisher: "Breaktool",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://breaktool.com',
    siteName: 'Breaktool',
    title: 'Breaktool - Trusted SaaS Reviews by Verified Experts',
    description: 'Discover, test, and decide on SaaS tools with reviews from verified experts and professionals. The most trusted SaaS review platform.',
    images: [
      {
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: 'Breaktool - SaaS Review Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Breaktool - Trusted SaaS Reviews by Verified Experts',
    description: 'Discover, test, and decide on SaaS tools with reviews from verified experts and professionals.',
    images: ['/og-default.png'],
  },
  other: {
    'msapplication-config': 'none',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className="antialiased min-h-screen bg-background text-foreground"
      >
        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
        
        {/* Performance Monitor */}
        <PerformanceMonitor />
        
        <ErrorBoundary>
          <QueryProvider>
            <StackAuthProvider>
              <Navigation />
              {children}
              <Toaster />
            </StackAuthProvider>
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
