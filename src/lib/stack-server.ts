import "server-only";
import { StackServerApp } from "@stackframe/stack";
import { prisma } from '@/lib/prisma';
import { BadgeService } from '@/lib/services/users/badge.service';

// Validate required environment variables
const secretKey = process.env.STACK_SECRET_SERVER_KEY;
const projectId = process.env.NEXT_PUBLIC_STACK_PROJECT_ID;
const publishableKey = process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY;

if (!secretKey) {
  throw new Error(
    "No secret server key provided. Please copy your key from the Stack dashboard and put it in the STACK_SECRET_SERVER_KEY environment variable."
  );
}

if (!projectId) {
  throw new Error(
    "No project ID provided. Please set NEXT_PUBLIC_STACK_PROJECT_ID in your environment variables."
  );
}

if (!publishableKey) {
  throw new Error(
    "No publishable client key provided. Please set NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY in your environment variables."
  );
}

export const stackServerApp = new StackServerApp({
  tokenStore: "nextjs-cookie",
  projectId: projectId,
  publishableClientKey: publishableKey,
  secretServerKey: secretKey,
  urls: {
    signIn: '/handler/sign-in',
    signUp: '/handler/sign-up',
    afterSignIn: '/dashboard',
    afterSignUp: '/dashboard'
  }
});

// Database operations now use Prisma ORM exclusively

// Function to sync Stack Auth user with Prisma database
export async function syncUserWithDatabase(stackUser: {
  id: string;
  email?: string;
  primaryEmail?: string | null | undefined;
  name?: string;
  displayName?: string | null;
  avatar_url?: string;
  profileImageUrl?: string | null;
  role?: string;
  trust_score?: number;
  badges?: string[];
  bio?: string;
  company?: string;
  linkedin_url?: string;
  website_url?: string;
  location?: string;
  expertise?: string[];
  is_verified_tester?: boolean;
  verification_status?: string;
  verified_at?: string;
  verified_by?: string;
  vendor_status?: string;
  vendor_approved_at?: string;
  vendor_approved_by?: string;
  helpful_votes_received?: number;
  [key: string]: unknown;
}) {
  try {
    const userData = {
      id: stackUser.id,
      email: stackUser.email || stackUser.primaryEmail || `user-${stackUser.id}@breaktool.local`,
      name: stackUser.name || stackUser.displayName || 'User',
      avatarUrl: stackUser.avatar_url || stackUser.profileImageUrl,
      role: stackUser.role || 'user',
      trustScore: stackUser.trust_score || 0,
      badges: stackUser.badges || [],
      bio: stackUser.bio || null,
      company: stackUser.company || null,
      linkedinUrl: stackUser.linkedin_url || null,
      websiteUrl: stackUser.website_url || null,
      location: stackUser.location || null,
      expertise: stackUser.expertise || [],
      isVerifiedTester: stackUser.is_verified_tester || false,
      verificationStatus: stackUser.verification_status || 'pending',
      verifiedAt: stackUser.verified_at ? new Date(stackUser.verified_at) : null,
      verifiedBy: stackUser.verified_by || null,
      vendorStatus: stackUser.vendor_status || null,
      vendorApprovedAt: stackUser.vendor_approved_at ? new Date(stackUser.vendor_approved_at) : null,
      vendorApprovedBy: stackUser.vendor_approved_by || null,
      helpfulVotesReceived: stackUser.helpful_votes_received || 0,
    };

    // Check if user already exists to preserve existing role and status
    const existingUser = await prisma.user.findUnique({
      where: { id: userData.id },
      select: {
        role: true,
        isVerifiedTester: true,
        verificationStatus: true,
        vendorStatus: true
      }
    });

    const result = await prisma.user.upsert({
      where: { id: userData.id },
      update: {
        email: userData.email,
        name: userData.name,
        avatarUrl: userData.avatarUrl,
        // Preserve existing role and status if user already exists
        role: existingUser?.role || userData.role,
        trustScore: userData.trustScore,
        badges: userData.badges,
        bio: userData.bio,
        company: userData.company,
        linkedinUrl: userData.linkedinUrl,
        websiteUrl: userData.websiteUrl,
        location: userData.location,
        expertise: userData.expertise,
        isVerifiedTester: existingUser?.isVerifiedTester || userData.isVerifiedTester,
        verificationStatus: existingUser?.verificationStatus || userData.verificationStatus,
        verifiedAt: userData.verifiedAt,
        verifiedBy: userData.verifiedBy,
        vendorStatus: existingUser?.vendorStatus || userData.vendorStatus,
        vendorApprovedAt: userData.vendorApprovedAt,
        vendorApprovedBy: userData.vendorApprovedBy,
        helpfulVotesReceived: userData.helpfulVotesReceived,
        updatedAt: new Date()
      },
      create: userData
    });

    // Auto-assign badges for new users
    if (!existingUser) {
      await BadgeService.assignNewUserBadges(userData.id);
      console.log('✅ Auto-assigned badges for new user:', userData.id);
    }

    console.log('✅ User synced to Prisma database:', result.id);
    return result;
  } catch (error) {
    console.error('❌ Error in syncUserWithDatabase:', error);
    throw error;
  }
}
