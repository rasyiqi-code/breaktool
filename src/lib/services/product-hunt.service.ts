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
   * Get single product from Product Hunt by URL or slug
   */
  static async getProductByUrl(productUrl: string): Promise<ProductHuntProduct | null> {
    if (!this.DEVELOPER_TOKEN) {
      throw new Error('Product Hunt Developer Token not configured');
    }

    // Extract slug from Product Hunt URL
    let slug = '';
    if (productUrl.includes('producthunt.com/posts/')) {
      slug = productUrl.split('producthunt.com/posts/')[1].split('?')[0].split('#')[0];
    } else if (productUrl.includes('producthunt.com/products/')) {
      slug = productUrl.split('producthunt.com/products/')[1].split('?')[0].split('#')[0];
    } else {
      // Assume it's just the slug
      slug = productUrl.split('?')[0].split('#')[0];
    }

    if (!slug) {
      throw new Error('Invalid Product Hunt URL. Please provide a valid Product Hunt product URL or slug.');
    }

    const query = `
      query GetProductBySlug($slug: String!) {
        post(slug: $slug) {
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
    `;

    try {
      const response = await fetch('https://api.producthunt.com/v2/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.DEVELOPER_TOKEN}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: { slug }
        })
      });

      if (!response.ok) {
        throw new Error(`Product Hunt API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.errors) {
        throw new Error(`Product Hunt GraphQL errors: ${JSON.stringify(data.errors)}`);
      }

      if (!data.data.post) {
        return null; // Product not found
      }

      return data.data.post;
    } catch (error) {
      console.error('Error fetching product by URL from Product Hunt:', error);
      throw error;
    }
  }

  /**
   * Get products from Product Hunt by date range
   */
  static async getProductsByDateRange(
    limit: number = 20, 
    startDate?: string, 
    endDate?: string,
    orderBy: 'VOTES' | 'CREATED_AT' = 'CREATED_AT'
  ): Promise<ProductHuntProduct[]> {
    if (!this.DEVELOPER_TOKEN) {
      throw new Error('Product Hunt Developer Token not configured');
    }

    // Build date filter if provided
    let dateFilter = '';
    if (startDate && endDate) {
      dateFilter = `, postedAfter: "${startDate}T00:00:00Z", postedBefore: "${endDate}T23:59:59Z"`;
    } else if (startDate) {
      dateFilter = `, postedAfter: "${startDate}T00:00:00Z"`;
    }

    const query = `
      query GetProductsByDate($first: Int!) {
        posts(first: $first, order: VOTES${dateFilter}) {
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
      const response = await fetch('https://api.producthunt.com/v2/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.DEVELOPER_TOKEN}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: { first: limit }
        })
      });

      if (!response.ok) {
        throw new Error(`Product Hunt API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.errors) {
        throw new Error(`Product Hunt GraphQL errors: ${JSON.stringify(data.errors)}`);
      }

      return data.data.posts.edges.map((edge: any) => edge.node);
    } catch (error) {
      console.error('Error fetching products by date range from Product Hunt:', error);
      throw error;
    }
  }

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
   * Map Product Hunt topics to database categories
   */
  static async mapTopicsToCategory(topics: string[]): Promise<string | null> {
    try {
      if (!topics || topics.length === 0) {
        return null;
      }

      // Get all categories from database
      const categories = await prisma.category.findMany({
        select: {
          id: true,
          name: true,
          slug: true
        }
      });

      // Create mapping from topic names to category IDs
      const topicToCategoryMap: Record<string, string> = {
        // Direct matches
        'productivity': 'productivity',
        'developer tools': 'development',
        'design tools': 'design',
        'marketing': 'marketing',
        'analytics': 'analytics',
        'ai': 'artificial-intelligence',
        'automation': 'automation',
        'collaboration': 'collaboration',
        'communication': 'communication',
        'data': 'data',
        'education': 'education',
        'finance': 'finance',
        'health': 'health',
        'mobile': 'mobile',
        'security': 'security',
        'social media': 'social-media',
        'startup': 'startup',
        'web app': 'web-app',
        'saas': 'saas',
        'b2b': 'b2b',
        'b2c': 'b2c',
        'ecommerce': 'ecommerce',
        'crm': 'crm',
        'project management': 'project-management',
        'time tracking': 'time-tracking',
        'note taking': 'note-taking',
        'file sharing': 'file-sharing',
        'video': 'video',
        'audio': 'audio',
        'image': 'image',
        'gaming': 'gaming',
        'entertainment': 'entertainment',
        'news': 'news',
        'travel': 'travel',
        'food': 'food',
        'lifestyle': 'lifestyle',
        'fitness': 'fitness',
        'wellness': 'wellness',
        'shopping': 'shopping',
        'real estate': 'real-estate',
        'legal': 'legal',
        'hr': 'hr',
        'customer support': 'customer-support',
        'sales': 'sales',
        'lead generation': 'lead-generation',
        'email marketing': 'email-marketing',
        'social media marketing': 'social-media-marketing',
        'content marketing': 'content-marketing',
        'seo': 'seo',
        'ppc': 'ppc',
        'affiliate marketing': 'affiliate-marketing',
        'influencer marketing': 'influencer-marketing',
        'brand management': 'brand-management',
        'public relations': 'public-relations',
        'event management': 'event-management',
        'survey': 'survey',
        'feedback': 'feedback',
        'user research': 'user-research',
        'a/b testing': 'ab-testing',
        'conversion optimization': 'conversion-optimization',
        'landing page': 'landing-page',
        'website builder': 'website-builder',
        'cms': 'cms',
        'blog': 'blog',
        'portfolio': 'portfolio',
        'e-learning': 'e-learning',
        'online course': 'online-course',
        'webinar': 'webinar',
        'podcast': 'podcast',
        'streaming': 'streaming',
        'live streaming': 'live-streaming',
        'video conferencing': 'video-conferencing',
        'team chat': 'team-chat',
        'slack': 'slack',
        'discord': 'discord',
        'telegram': 'telegram',
        'whatsapp': 'whatsapp',
        'zoom': 'zoom',
        'google meet': 'google-meet',
        'microsoft teams': 'microsoft-teams',
        'calendar': 'calendar',
        'scheduling': 'scheduling',
        'booking': 'booking',
        'appointment': 'appointment',
        'invoicing': 'invoicing',
        'accounting': 'accounting',
        'payroll': 'payroll',
        'expense tracking': 'expense-tracking',
        'budgeting': 'budgeting',
        'investment': 'investment',
        'trading': 'trading',
        'cryptocurrency': 'cryptocurrency',
        'blockchain': 'blockchain',
        'nft': 'nft',
        'defi': 'defi',
        'web3': 'web3',
        'metaverse': 'metaverse',
        'vr': 'vr',
        'ar': 'ar',
        'iot': 'iot',
        'api': 'api',
        'webhook': 'webhook',
        'integration': 'integration',
        'workflow': 'workflow',
        'zapier': 'zapier',
        'ifttt': 'ifttt',
        'make': 'make',
        'n8n': 'n8n',
        'airtable': 'airtable',
        'notion': 'notion',
        'trello': 'trello',
        'asana': 'asana',
        'monday.com': 'monday',
        'clickup': 'clickup',
        'jira': 'jira',
        'confluence': 'confluence'
      };

      // Try to find matching category
      for (const topic of topics) {
        const normalizedTopic = topic.toLowerCase().trim();
        
        // Direct match
        if (topicToCategoryMap[normalizedTopic]) {
          const categorySlug = topicToCategoryMap[normalizedTopic];
          const category = categories.find(c => c.slug === categorySlug);
          if (category) {
            console.log(`Mapped Product Hunt topic "${topic}" to category "${category.name}"`);
            return category.id;
          }
        }

        // Partial match
        const category = categories.find(c => 
          c.name.toLowerCase().includes(normalizedTopic) || 
          normalizedTopic.includes(c.name.toLowerCase())
        );
        if (category) {
          console.log(`Mapped Product Hunt topic "${topic}" to category "${category.name}" (partial match)`);
          return category.id;
        }
      }

      console.log(`No category found for Product Hunt topics: ${topics.join(', ')}`);
      return null;
    } catch (error) {
      console.error('Error mapping topics to category:', error);
      return null;
    }
  }

  /**
   * Create tool submission from Product Hunt product (force mode - always create)
   */
  static async createToolFromProductHuntForce(product: ProductHuntProduct, adminUserId: string): Promise<boolean> {
    try {
      // Map Product Hunt topics to category
      const productHuntTopics = product.topics.edges.map(t => t.node.name);
      const categoryId = await this.mapTopicsToCategory(productHuntTopics);

      // Create tool submission (force mode - always create)
      await prisma.toolSubmission.create({
        data: {
          name: product.name,
          description: product.tagline,
          longDescription: product.description,
          website: product.website,
          logoUrl: product.thumbnail.url,
          categoryId: categoryId,
          submittedBy: adminUserId,
          status: 'pending',
          additionalInfo: JSON.stringify({
            productHuntId: product.id,
            productHuntVotes: product.votesCount,
            productHuntComments: product.commentsCount,
            productHuntMakers: product.makers.map(m => m.name),
            productHuntTopics: productHuntTopics,
            syncedAt: new Date().toISOString(),
            forceSync: true
          })
        }
      });

      console.log(`Force created tool submission for: ${product.name} with category: ${categoryId ? 'mapped' : 'none'}`);
      return true;
    } catch (error) {
      console.error(`Error force creating tool from Product Hunt product ${product.name}:`, error);
      throw error;
    }
  }

  /**
   * Update existing tool from Product Hunt product
   */
  static async updateExistingToolFromProductHunt(product: ProductHuntProduct, adminUserId: string): Promise<boolean> {
    try {
      // Map Product Hunt topics to category
      const productHuntTopics = product.topics.edges.map(t => t.node.name);
      const categoryId = await this.mapTopicsToCategory(productHuntTopics);

      // Find existing tool by name or website
      const existingTool = await prisma.tool.findFirst({
        where: {
          OR: [
            { name: product.name },
            { website: product.website }
          ]
        }
      });

      if (existingTool) {
        // Update existing tool with new data
        await prisma.tool.update({
          where: { id: existingTool.id },
          data: {
            name: product.name,
            description: product.tagline,
            longDescription: product.description,
            website: product.website,
            logoUrl: product.thumbnail.url,
            categoryId: categoryId || existingTool.categoryId, // Keep existing category if no new one found
            updatedAt: new Date()
          }
        });

        console.log(`Updated existing tool: ${product.name} with category: ${categoryId ? 'mapped' : 'kept existing'}`);
        return true;
      }

      // If no existing tool found, create new submission
      return await this.createToolFromProductHunt(product, adminUserId);
    } catch (error) {
      console.error(`Error updating tool from Product Hunt product ${product.name}:`, error);
      throw error;
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

      // Map Product Hunt topics to category
      const productHuntTopics = product.topics.edges.map(t => t.node.name);
      const categoryId = await this.mapTopicsToCategory(productHuntTopics);

      // Create tool submission
      await prisma.toolSubmission.create({
        data: {
          name: product.name,
          description: product.tagline,
          longDescription: product.description, // Use Product Hunt description as long description
          website: product.website,
          logoUrl: product.thumbnail.url,
          categoryId: categoryId, // Map Product Hunt topics to category
          submittedBy: adminUserId, // Admin user who triggered sync
          status: 'pending', // Admin still needs to review
          additionalInfo: JSON.stringify({
            productHuntId: product.id,
            productHuntVotes: product.votesCount,
            productHuntComments: product.commentsCount,
            productHuntMakers: product.makers.map(m => m.name),
            productHuntTopics: productHuntTopics,
            syncedAt: new Date().toISOString()
          })
        }
      });

      console.log(`Created tool submission for: ${product.name} with category: ${categoryId ? 'mapped' : 'none'}`);
      return true;
    } catch (error) {
      console.error(`Error creating tool from Product Hunt product ${product.name}:`, error);
      throw error;
    }
  }

  /**
   * Sync single product from Product Hunt URL to BreakTool
   */
  static async syncSingleProductByUrl(
    productUrl: string,
    adminUserId: string,
    forceSync: boolean = false,
    updateExisting: boolean = false
  ): Promise<SyncResult> {
    try {
      const product = await this.getProductByUrl(productUrl);
      
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

      if (!product) {
        result.skipped++;
        result.details.skipped.push(`Product not found for URL: ${productUrl}`);
        return result;
      }

      try {
        if (forceSync) {
          // Force sync: create new submission even if tool exists
          const created = await this.createToolFromProductHuntForce(product, adminUserId);
          if (created) {
            result.created++;
            result.details.created.push(product.name);
          } else {
            result.skipped++;
            result.details.skipped.push(product.name);
          }
        } else if (updateExisting) {
          // Update existing: update existing tools with new data
          const updated = await this.updateExistingToolFromProductHunt(product, adminUserId);
          if (updated) {
            result.created++;
            result.details.created.push(`${product.name} (updated)`);
          } else {
            result.skipped++;
            result.details.skipped.push(product.name);
          }
        } else {
          // Normal sync: skip if exists
          const created = await this.createToolFromProductHunt(product, adminUserId);
          if (created) {
            result.created++;
            result.details.created.push(product.name);
          } else {
            result.skipped++;
            result.details.skipped.push(product.name);
          }
        }
      } catch (error) {
        result.errors++;
        result.details.errors.push(`${product.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        console.error(`Error syncing product ${product.name}:`, error);
      }

      return result;
    } catch (error) {
      console.error('Error syncing single product by URL from Product Hunt:', error);
      throw error;
    }
  }

  /**
   * Sync products by date range to BreakTool
   */
  static async syncProductsByDateRange(
    limit: number = 20,
    adminUserId: string,
    startDate?: string,
    endDate?: string,
    orderBy: 'VOTES' | 'CREATED_AT' = 'CREATED_AT',
    forceSync: boolean = false,
    updateExisting: boolean = false
  ): Promise<SyncResult> {
    try {
      const products = await this.getProductsByDateRange(limit, startDate, endDate, orderBy);
      
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

      for (const product of products) {
        try {
          if (forceSync) {
            // Force sync: create new submission even if tool exists
            const created = await this.createToolFromProductHuntForce(product, adminUserId);
            if (created) {
              result.created++;
              result.details.created.push(product.name);
            } else {
              result.skipped++;
              result.details.skipped.push(product.name);
            }
          } else if (updateExisting) {
            // Update existing: update existing tools with new data
            const updated = await this.updateExistingToolFromProductHunt(product, adminUserId);
            if (updated) {
              result.created++;
              result.details.created.push(`${product.name} (updated)`);
            } else {
              result.skipped++;
              result.details.skipped.push(product.name);
            }
          } else {
            // Normal sync: skip if exists
            const created = await this.createToolFromProductHunt(product, adminUserId);
            if (created) {
              result.created++;
              result.details.created.push(product.name);
            } else {
              result.skipped++;
              result.details.skipped.push(product.name);
            }
          }
        } catch (error) {
          result.errors++;
          result.details.errors.push(`${product.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          console.error(`Error syncing product ${product.name}:`, error);
        }
      }

      return result;
    } catch (error) {
      console.error('Error syncing Product Hunt data by date range:', error);
      throw error;
    }
  }

  /**
   * Sync trending products to BreakTool
   */
  static async syncTrendingProducts(
    limit: number = 20, 
    adminUserId: string, 
    forceSync: boolean = false, 
    updateExisting: boolean = false
  ): Promise<SyncResult> {
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
          if (forceSync) {
            // Force sync: create new submission even if tool exists
            const created = await this.createToolFromProductHuntForce(product, adminUserId);
            if (created) {
              result.created++;
              result.details.created.push(product.name);
            } else {
              result.skipped++;
              result.details.skipped.push(product.name);
            }
          } else if (updateExisting) {
            // Update existing: update existing tools with new data
            const updated = await this.updateExistingToolFromProductHunt(product, adminUserId);
            if (updated) {
              result.created++;
              result.details.created.push(`${product.name} (updated)`);
            } else {
              result.skipped++;
              result.details.skipped.push(product.name);
            }
          } else {
            // Normal sync: skip if exists
            const created = await this.createToolFromProductHunt(product, adminUserId);
            if (created) {
              result.created++;
              result.details.created.push(product.name);
            } else {
              result.skipped++;
              result.details.skipped.push(product.name);
            }
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
   * Sync old data with categories (for tools without categories)
   */
  static async syncOldDataWithCategories(adminUserId: string): Promise<SyncResult> {
    try {
      // Find tools without categories
      const toolsWithoutCategories = await prisma.tool.findMany({
        where: {
          categoryId: null
        },
        include: {
          category: true
        }
      });

      // Find tool submissions without categories
      const submissionsWithoutCategories = await prisma.toolSubmission.findMany({
        where: {
          categoryId: null
        },
        include: {
          category: true
        }
      });

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

      // Process tools without categories
      for (const tool of toolsWithoutCategories) {
        try {
          // Try to find matching Product Hunt data
          const productHuntData = await this.findProductHuntDataByTool(tool);
          
          if (productHuntData) {
            // Map topics to category
            const categoryId = await this.mapTopicsToCategory(productHuntData.topics);
            
            if (categoryId) {
              // Update tool with category
              await prisma.tool.update({
                where: { id: tool.id },
                data: {
                  categoryId: categoryId,
                  updatedAt: new Date()
                }
              });

              result.created++;
              result.details.created.push(`${tool.name} (category added)`);
            } else {
              result.skipped++;
              result.details.skipped.push(`${tool.name} (no category match)`);
            }
          } else {
            result.skipped++;
            result.details.skipped.push(`${tool.name} (no Product Hunt data)`);
          }
        } catch (error) {
          result.errors++;
          result.details.errors.push(`${tool.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Process tool submissions without categories
      for (const submission of submissionsWithoutCategories) {
        try {
          // Try to find matching Product Hunt data
          const productHuntData = await this.findProductHuntDataByTool(submission);
          
          if (productHuntData) {
            // Map topics to category
            const categoryId = await this.mapTopicsToCategory(productHuntData.topics);
            
            if (categoryId) {
              // Update submission with category
              await prisma.toolSubmission.update({
                where: { id: submission.id },
                data: {
                  categoryId: categoryId,
                  updatedAt: new Date()
                }
              });

              result.created++;
              result.details.created.push(`${submission.name} (submission category added)`);
            } else {
              result.skipped++;
              result.details.skipped.push(`${submission.name} (no category match)`);
            }
          } else {
            result.skipped++;
            result.details.skipped.push(`${submission.name} (no Product Hunt data)`);
          }
        } catch (error) {
          result.errors++;
          result.details.errors.push(`${submission.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      return result;
    } catch (error) {
      console.error('Error syncing old data with categories:', error);
      throw error;
    }
  }

  /**
   * Find Product Hunt data by tool (mock implementation - would need actual Product Hunt search)
   */
  private static async findProductHuntDataByTool(tool: any): Promise<{ topics: string[] } | null> {
    // This is a simplified implementation
    // In a real scenario, you would search Product Hunt API for matching products
    
    // For now, return null to indicate no Product Hunt data found
    // This would need to be implemented with actual Product Hunt search API
    return null;
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
