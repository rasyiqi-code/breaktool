// Main Types Index
export * from './auth.types'
export * from './tools.types'
export * from './reviews.types'
export * from './community.types'
export * from './admin.types'
export * from './vendor.types'

// Note: Legacy types in ./app and ./database are kept separate to avoid naming conflicts

// User types
export interface UserData {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: string;
  trust_score?: number;
  isVerifiedTester?: boolean;
  verificationStatus?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Stack user types
export interface StackUser {
  id: string;
  primaryEmail?: string;
  email?: string;
  displayName?: string;
  name?: string;
  profileImageUrl?: string;
  avatar_url?: string;
}

// Webhook types
export interface WebhookHeaders {
  get(name: string): string | null;
}

// Webhook event type
export interface WebhookEvent {
  id: string;
  type: string;
  data: Record<string, unknown>; // This could be more specific based on Stack's webhook structure
  object: string;
  created_at: number;
}

// Filter types
export type FilterValue = string | number | boolean | string[];

// Search filters interface
export interface SearchFilters {
  query: string;
  category: string;
  verdict: string;
  priceRange: string;
  features: string[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  showFeatured: boolean;
  showTrending: boolean;
}

// Review filters interface
export interface ReviewFilters {
  search: string;
  reviewType: string;
  rating: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  showBookmarked: boolean;
  showVerifiedOnly: boolean;
}
