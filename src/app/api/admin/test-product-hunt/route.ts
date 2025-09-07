import { NextResponse } from 'next/server';
import { stackServerApp } from '@/lib/stack-server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Check if user is authenticated and has admin role
    const stackUser = await stackServerApp.getUser();
    
    if (!stackUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user from database to check roles
    const dbUser = await prisma.user.findUnique({
      where: { id: stackUser.id },
      select: {
        id: true,
        email: true,
        role: true,
        primaryRole: true,
        activeRole: true
      }
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      );
    }

    // Check if user has admin role
    const isAdmin = dbUser.role === 'admin' || 
                   dbUser.role === 'super_admin' ||
                   dbUser.activeRole === 'admin' || 
                   dbUser.activeRole === 'super_admin' ||
                   dbUser.primaryRole === 'admin' ||
                   dbUser.primaryRole === 'super_admin';
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Test Product Hunt API connection
    const apiUrl = 'https://api.producthunt.com/v2/api/graphql';
    const token = process.env.PRODUCT_HUNT_DEVELOPER_TOKEN;
    
    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'Product Hunt Developer Token not configured',
        config: {
          apiUrl,
          hasToken: false,
          syncEnabled: process.env.PRODUCT_HUNT_SYNC_ENABLED === 'true'
        }
      });
    }

    const query = `
      query TestConnection {
        posts(first: 1) {
          edges {
            node {
              id
              name
              tagline
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
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: {}
        })
      });

      const responseText = await response.text();
      let data;
      
      try {
        data = JSON.parse(responseText);
      } catch {
        return NextResponse.json({
          success: false,
          error: 'Invalid JSON response from Product Hunt API',
          details: {
            status: response.status,
            statusText: response.statusText,
            responseText: responseText.substring(0, 500)
          }
        });
      }

      if (!response.ok) {
        return NextResponse.json({
          success: false,
          error: `Product Hunt API error: ${response.status} ${response.statusText}`,
          details: {
            status: response.status,
            statusText: response.statusText,
            data: data
          }
        });
      }

      if (data.errors) {
        return NextResponse.json({
          success: false,
          error: 'Product Hunt API returned errors',
          details: {
            errors: data.errors,
            data: data
          }
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Product Hunt API connection successful',
        config: {
          apiUrl,
          hasToken: true,
          syncEnabled: process.env.PRODUCT_HUNT_SYNC_ENABLED === 'true',
          tokenLength: token.length
        },
        testData: {
          status: response.status,
          postsCount: data.data?.posts?.edges?.length || 0,
          firstPost: data.data?.posts?.edges?.[0]?.node || null
        }
      });

    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Failed to connect to Product Hunt API',
        details: {
          message: error instanceof Error ? error.message : 'Unknown error',
          config: {
            apiUrl,
            hasToken: true,
            syncEnabled: process.env.PRODUCT_HUNT_SYNC_ENABLED === 'true'
          }
        }
      });
    }

  } catch (error) {
    console.error('Error testing Product Hunt connection:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to test Product Hunt connection',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
