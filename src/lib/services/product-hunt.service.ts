import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ProductHuntProduct {
  id: string;
  name: string;
  tagline: string;
  description: string;
  website: string;
  thumbnail: {
    url: string;
  };
  votesCount: number;
  commentsCount: number;
  createdAt: string;
  makers: {
    name: string;
  }[];
  topics: {
    edges: {
      node: {
        name: string;
      };
    }[];
  };
}

export interface SyncResult {
  created: number;
  skipped: number;
  errors: number;
  details: {
    created: string[];
    skipped: string[];
    errors: string[];
  };
}

export class ProductHuntService {
  private static readonly API_URL = 'https://api.producthunt.com/v2/api/graphql';
  private static readonly DEVELOPER_TOKEN = process.env.PRODUCT_HUNT_DEVELOPER_TOKEN;
  private static readonly CLIENT_ID = process.env.PRODUCT_HUNT_CLIENT_ID;
  private static readonly CLIENT_SECRET = process.env.PRODUCT_HUNT_CLIENT_SECRET;

  /**
   * Fetch trending products from Product Hunt API
   */
  static async getTrendingProducts(limit: number = 20): Promise<ProductHuntProduct[]> {
    if (!this.DEVELOPER_TOKEN) {
      throw new Error('Product Hunt Developer Token not configured');
    }

    console.log('Fetching Product Hunt data with token:', this.DEVELOPER_TOKEN ? 'Token exists' : 'No token');

    const query = `
      query GetTrendingProducts($first: Int!) {
        posts(first: $first, order: VOTES) {
          edges {
            node {
              id
              name
              tagline
              description
              website
              thumbnail {
                url
              }
              votesCount
              commentsCount
              createdAt
              makers {
                name
              }
              topics {
                edges {
                  node {
                    name
                  }
                }
              }
            }
          }
        }
      }
    `;

    try {
      console.log('Making request to Product Hunt API:', this.API_URL);
      
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.DEVELOPER_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: { first: limit }
        })
      });

      console.log('Product Hunt API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Product Hunt API error response:', errorText);
        throw new Error(`Product Hunt API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Product Hunt API response data:', JSON.stringify(data, null, 2));
      
      if (data.errors) {
        console.error('Product Hunt API errors:', data.errors);
        throw new Error(`Product Hunt API errors: ${JSON.stringify(data.errors)}`);
      }

      if (!data.data || !data.data.posts || !data.data.posts.edges) {
        console.error('Invalid Product Hunt API response structure:', data);
        throw new Error('Invalid Product Hunt API response structure');
      }

      const products = data.data.posts.edges.map((edge: { node: unknown }) => edge.node);
      console.log(`Successfully fetched ${products.length} products from Product Hunt`);
      
      return products;
    } catch (error) {
      console.error('Error fetching Product Hunt data:', error);
      throw error;
    }
  }

  /**
   * Check if tool already exists in database
   */
  static async checkToolExists(product: ProductHuntProduct): Promise<boolean> {
    try {
      const existingTool = await prisma.tool.findFirst({
        where: {
          OR: [
            { name: product.name },
            { website: product.website }
          ]
        }
      });

      return !!existingTool;
    } catch (error) {
      console.error('Error checking tool existence:', error);
      return false;
    }
  }

  /**
   * Check if tool submission already exists
   */
  static async checkToolSubmissionExists(product: ProductHuntProduct): Promise<boolean> {
    try {
      const existingSubmission = await prisma.toolSubmission.findFirst({
        where: {
          OR: [
            { name: product.name },
            { website: product.website }
          ]
        }
      });

      return !!existingSubmission;
    } catch (error) {
      console.error('Error checking tool submission existence:', error);
      return false;
    }
  }

  /**
   * Create tool submission from Product Hunt product
   */
  static async createToolFromProductHunt(product: ProductHuntProduct, adminUserId: string): Promise<boolean> {
    try {
      // Check if tool or submission already exists
      const [toolExists, submissionExists] = await Promise.all([
        this.checkToolExists(product),
        this.checkToolSubmissionExists(product)
      ]);

      if (toolExists || submissionExists) {
        return false; // Skip if already exists
      }

      // Create tool submission
      await prisma.toolSubmission.create({
        data: {
          name: product.name,
          description: product.tagline,
          website: product.website,
          logoUrl: product.thumbnail.url,
          submittedBy: adminUserId, // Admin user who triggered sync
          status: 'pending', // Admin still needs to review
          additionalInfo: JSON.stringify({
            productHuntId: product.id,
            productHuntVotes: product.votesCount,
            productHuntComments: product.commentsCount,
            productHuntMakers: product.makers.map(m => m.name),
            productHuntTopics: product.topics.edges.map(t => t.node.name),
            productHuntDescription: product.description,
            syncedAt: new Date().toISOString()
          })
        }
      });

      console.log(`Created tool submission for: ${product.name}`);
      return true;
    } catch (error) {
      console.error(`Error creating tool from Product Hunt product ${product.name}:`, error);
      throw error;
    }
  }

  /**
   * Sync trending products to BreakTool
   */
  static async syncTrendingProducts(limit: number = 20, adminUserId: string): Promise<SyncResult> {
    try {
      const trendingProducts = await this.getTrendingProducts(limit);
      
      const result: SyncResult = {
        created: 0,
        skipped: 0,
        errors: 0,
        details: {
          created: [],
          skipped: [],
          errors: []
        }
      };

      for (const product of trendingProducts) {
        try {
          const created = await this.createToolFromProductHunt(product, adminUserId);
          
          if (created) {
            result.created++;
            result.details.created.push(product.name);
          } else {
            result.skipped++;
            result.details.skipped.push(product.name);
          }
        } catch (error) {
          result.errors++;
          result.details.errors.push(`${product.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          console.error(`Error syncing product ${product.name}:`, error);
        }
      }

      return result;
    } catch (error) {
      console.error('Error syncing Product Hunt data:', error);
      throw error;
    }
  }

  /**
   * Get sync statistics
   */
  static async getSyncStatistics(): Promise<{
    totalSubmissions: number;
    productHuntSubmissions: number;
    lastSyncDate: Date | null;
  }> {
    try {
      const [totalSubmissions, productHuntSubmissions, lastSubmission] = await Promise.all([
        prisma.toolSubmission.count(),
        prisma.toolSubmission.count({
          where: {
            additionalInfo: {
              contains: 'productHuntId'
            }
          }
        }),
        prisma.toolSubmission.findFirst({
          where: {
            additionalInfo: {
              contains: 'productHuntId'
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          select: {
            createdAt: true
          }
        })
      ]);

      return {
        totalSubmissions,
        productHuntSubmissions,
        lastSyncDate: lastSubmission?.createdAt || null
      };
    } catch (error) {
      console.error('Error getting sync statistics:', error);
      throw error;
    }
  }
}
