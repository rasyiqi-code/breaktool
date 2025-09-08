"use client"

import Link from "next/link"
import { Github, Twitter, Linkedin, Mail, Heart, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"

export function Footer() {
  const currentYear = new Date().getFullYear()
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-8">
        {/* Mobile-First Simple Footer */}
        <div className="space-y-6">
          {/* Brand Section - Always Visible */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
                B
              </div>
              <span className="text-xl font-bold">Breaktool</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Discover. Test. Decide. The most trusted SaaS review platform.
            </p>
            <div className="flex items-center justify-center gap-4">
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

          {/* Expand Button */}
          <div className="flex justify-center">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2 rounded-lg hover:bg-muted/50"
            >
              <span>{isExpanded ? 'Show Less' : 'Show More'}</span>
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>

          {/* Expandable Content */}
          <div className={`transition-all duration-300 overflow-hidden ${isExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pt-4">
              {/* Platform Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-center sm:text-left">Platform</h3>
                <ul className="space-y-2 text-sm text-center sm:text-left">
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
                <h3 className="font-semibold text-center sm:text-left">Community</h3>
                <ul className="space-y-2 text-sm text-center sm:text-left">
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
                <h3 className="font-semibold text-center sm:text-left">Resources</h3>
                <ul className="space-y-2 text-sm text-center sm:text-left">
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

              {/* Legal Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-center sm:text-left">Legal</h3>
                <ul className="space-y-2 text-sm text-center sm:text-left">
                  <li>
                    <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/cookies" className="text-muted-foreground hover:text-foreground transition-colors">
                      Cookie Policy
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Section - Always Visible */}
          <div className="pt-6 border-t">
            <div className="flex flex-col items-center gap-4 text-sm text-muted-foreground">
              <p>© {currentYear} Breaktool. All rights reserved.</p>
              <div className="flex items-center gap-1">
                <span>Made with</span>
                <Heart className="h-4 w-4 text-red-500 fill-current" />
                <span>using Next.js & TypeScript</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
