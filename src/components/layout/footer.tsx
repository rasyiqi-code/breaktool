"use client"

import Link from "next/link"
import { Github, Twitter, Linkedin, Mail, Heart } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
                B
              </div>
              <span className="text-xl font-bold">Breaktool</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Discover. Test. Decide. The most trusted SaaS review platform, by testers you can trust.
            </p>
            <div className="flex items-center gap-2">
              <Link 
                href="https://github.com/rasyiqi-code/breaktool" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="h-5 w-5" />
              </Link>
              <Link 
                href="https://twitter.com/breaktool" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link 
                href="https://linkedin.com/company/breaktool" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link 
                href="mailto:hello@breaktool.com" 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Platform Section */}
          <div className="space-y-4">
            <h3 className="font-semibold">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/tools" className="text-muted-foreground hover:text-foreground transition-colors">
                  Discover Tools
                </Link>
              </li>
              <li>
                <Link href="/tools/compare" className="text-muted-foreground hover:text-foreground transition-colors">
                  Compare Tools
                </Link>
              </li>
              <li>
                <Link href="/tools/submit" className="text-muted-foreground hover:text-foreground transition-colors">
                  Submit Tool
                </Link>
              </li>
              <li>
                <Link href="/apply-verification" className="text-muted-foreground hover:text-foreground transition-colors">
                  Become a Tester
                </Link>
              </li>
            </ul>
          </div>

          {/* Community Section */}
          <div className="space-y-4">
            <h3 className="font-semibold">Community</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/discussions" className="text-muted-foreground hover:text-foreground transition-colors">
                  Discussions
                </Link>
              </li>
              <li>
                <Link href="/bookmarks" className="text-muted-foreground hover:text-foreground transition-colors">
                  Bookmarks
                </Link>
              </li>
              <li>
                <Link href="/apply-vendor" className="text-muted-foreground hover:text-foreground transition-colors">
                  Vendor Program
                </Link>
              </li>
              <li>
                <Link href="/subscription" className="text-muted-foreground hover:text-foreground transition-colors">
                  Premium Features
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Section */}
          <div className="space-y-4">
            <h3 className="font-semibold">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="https://github.com/rasyiqi-code/breaktool" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                  GitHub Repository
                </Link>
              </li>
              <li>
                <Link href="https://github.com/rasyiqi-code/breaktool/blob/main/docs/README.md" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="https://github.com/rasyiqi-code/breaktool/issues" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                  Report Issues
                </Link>
              </li>
              <li>
                <Link href="https://github.com/rasyiqi-code/breaktool/discussions" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                  Community Discussions
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-muted-foreground">
              <p>© {currentYear} Breaktool. All rights reserved.</p>
              <div className="flex items-center gap-4">
                <Link href="/terms" className="hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
                <Link href="/privacy" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/cookies" className="hover:text-foreground transition-colors">
                  Cookie Policy
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-500 fill-current" />
              <span>using Next.js, TypeScript, and modern web technologies</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
