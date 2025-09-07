'use client';

// Removed Supabase client import - using API endpoints instead
import { useUser } from "@stackframe/stack";
import { useEffect, useState } from "react";
import { RequireAuth } from "@/components/require-auth";

import { hasPermission, UserRole } from "@/lib/auth/permissions";
import { QuickAccess } from "@/components/dashboard/quick-access";

export default function DashboardPage() {
  const user = useUser();
  const [userData, setUserData] = useState<{ id?: string; displayName?: string; primaryEmail?: string; profileImageUrl?: string; [key: string]: unknown; } | null>(null);

  // Type guard function to check verification status
  const getVerificationStatus = (status: unknown): string | null => {
    if (typeof status === 'string' && ['pending', 'approved', 'rejected'].includes(status)) {
      return status;
    }
    return null;
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) {
        return;
      }
      
      try {
        
        const response = await fetch(`/api/users/get-user-profile?userId=${user.id}`);
        
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setUserData(result.user);
          } else {
            console.error('Error fetching user data:', result.error);
          }
        } else if (response.status === 404) {
          console.log('🔄 User not found, auto-syncing...');
          // Auto-sync user to database
          try {
            const syncResponse = await fetch('/api/users/auto-sync-user', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId: user.id,
                email: user.primaryEmail || '',
                name: user.displayName || ''
              })
            });
            
            if (syncResponse.ok) {
              console.log('✅ User auto-synced to database');
              // Refresh user data after sync
              const refreshResponse = await fetch(`/api/users/get-user-profile?userId=${user.id}`);
              if (refreshResponse.ok) {
                const refreshData = await refreshResponse.json();
                if (refreshData.success) {
                  setUserData(refreshData.user);
                }
              }
            }
          } catch (syncError) {
            console.error('❌ Auto-sync failed:', syncError);
          }
        } else {
          const error = await response.json();
          console.error('Database error (not user not found):', error);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [user?.id, user?.displayName, user?.primaryEmail]);

  const handleApplyTester = async () => {
    // Redirect to verification form page
    window.location.href = '/apply-verification';
  };

  return (
    <RequireAuth redirectTo="/auth/sign-in">
      <div className="min-h-screen bg-background">
        
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
            
            {/* Quick Access Section */}
            <div className="mb-8">
              <QuickAccess />
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              {/* User Info */}
              <div className="bg-card p-6 rounded-lg border">
                <h2 className="text-xl font-semibold mb-4">User Information</h2>
                <div className="space-y-2">
                  <p><strong>ID:</strong> {user?.id || 'N/A'}</p>
                  <p><strong>Email:</strong> {user?.primaryEmail || 'N/A'}</p>
                  <p><strong>Name:</strong> {user?.displayName || 'Not set'}</p>
                  <p><strong>Role:</strong> {String(userData?.role || 'user')}</p>
                  <p><strong>Trust Score:</strong> {String(userData?.trust_score || 0)}</p>
                  <p><strong>Verified Tester:</strong> {userData?.is_verified_tester ? 'Yes' : 'No'}</p>
                  <p><strong>Verification Status:</strong> {String(userData?.verification_status || 'Not Applied')}</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-card p-6 rounded-lg border">
                <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  {hasPermission((userData?.role as UserRole) || 'user', 'reviews:read') && (
                    <button className="w-full bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/90">
                      View My Reviews
                    </button>
                  )}
                  {hasPermission((userData?.role as UserRole) || 'user', 'users:update') && (
                    <button className="w-full bg-outline border px-4 py-2 rounded-md hover:bg-accent">
                      Update Profile
                    </button>
                  )}
                  {/* Verification Status */}
                  {(() => {
                    const verificationStatus = getVerificationStatus(userData?.verification_status);
                    if (!verificationStatus) return null;
                    
                    return (
                      <div className="w-full p-3 rounded-md border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Verification Status:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            verificationStatus === 'approved' ? 'bg-green-100 text-green-800' :
                            verificationStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {verificationStatus === 'approved' ? 'Approved' :
                             verificationStatus === 'rejected' ? 'Rejected' :
                             'Under Review'}
                          </span>
                        </div>
                        
                        {verificationStatus === 'pending' && (
                          <p className="text-xs text-muted-foreground">
                            Your application is being reviewed. We&apos;ll notify you once a decision is made.
                          </p>
                        )}
                        
                        {verificationStatus === 'rejected' && (
                          <div className="space-y-2">
                            <p className="text-xs text-red-600">
                              Your application was not approved. You can reapply after addressing the feedback.
                            </p>
                            <button 
                              onClick={() => handleApplyTester()}
                              className="w-full bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
                            >
                              Reapply for Verified Tester
                            </button>
                          </div>
                        )}
                        
                        {verificationStatus === 'approved' && (
                          <div className="space-y-2">
                            <p className="text-xs text-green-600">
                              Congratulations! You are now a verified tester.
                            </p>
                            <button 
                              onClick={() => window.location.href = '/apply-verification'}
                              className="w-full bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
                            >
                              View Application Details
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                  
                  {/* Apply Button - only show if no application exists */}
                  {hasPermission((userData?.role as UserRole) || 'user', 'verification:apply') && 
                   !getVerificationStatus(userData?.verification_status) && (
                    <button 
                      onClick={() => handleApplyTester()}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      Apply for Verified Tester
                    </button>
                  )}

                  {/* Apply Vendor Button - show for users and verified testers */}
                  {(String(userData?.role) === 'user' || String(userData?.role) === 'verified_tester') && (
                    <button 
                      onClick={() => window.location.href = '/apply-vendor'}
                      className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
                    >
                      Apply as Vendor
                    </button>
                  )}

                  {/* Submit Tool Button - show for vendors */}
                  {String(userData?.role) === 'vendor' && (
                    <button 
                      onClick={() => window.location.href = '/submit'}
                      className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                    >
                      Submit Tool
                    </button>
                  )}
                  {hasPermission((userData?.role as UserRole) || 'user', 'admin:access') && (
                    <button 
                      onClick={() => window.location.href = '/admin'}
                      className="w-full bg-destructive text-destructive-foreground px-4 py-2 rounded-md hover:bg-destructive/90"
                    >
                      Admin Panel
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="mt-8 bg-card p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
              <p className="text-muted-foreground">
                No recent activity to display.
              </p>
            </div>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
