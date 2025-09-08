import { NextRequest, NextResponse } from 'next/server';
import { ProductHuntService } from '@/lib/services/product-hunt.service';
import { stackServerApp } from '@/lib/stack-server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
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

    // Debug: Log user information
    console.log('User info:', {
      stackUserId: stackUser.id,
      dbUserId: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
      primaryRole: dbUser.primaryRole,
      activeRole: dbUser.activeRole
    });

    // Check if user has admin role or vendor role (for single product sync)
    const isAdmin = dbUser.role === 'admin' || 
                   dbUser.role === 'super_admin' ||
                   dbUser.activeRole === 'admin' || 
                   dbUser.activeRole === 'super_admin' ||
                   dbUser.primaryRole === 'admin' ||
                   dbUser.primaryRole === 'super_admin';
    
    const isVendor = dbUser.role === 'vendor' || 
                    dbUser.activeRole === 'vendor' || 
                    dbUser.primaryRole === 'vendor';
    
    // For single product sync, allow both admin and vendor
    const body = await request.json().catch(() => ({}));
    const syncSingleProduct = body.syncSingleProduct || false;
    
    if (!isAdmin && !(isVendor && syncSingleProduct)) {
      console.log('User does not have required access:', {
        userId: dbUser.id,
        userRole: dbUser.role,
        primaryRole: dbUser.primaryRole,
        activeRole: dbUser.activeRole,
        syncSingleProduct
      });
      
      return NextResponse.json(
        { 
          error: 'Admin access required (or vendor access for single product sync)',
          debug: {
            userId: dbUser.id,
            userRole: dbUser.role,
            primaryRole: dbUser.primaryRole,
            activeRole: dbUser.activeRole,
            syncSingleProduct
          }
        },
        { status: 403 }
      );
    }

    // Get sync parameters from request body or use default
    const limit = body.limit || 20;
    const forceSync = body.forceSync || false;
    const updateExisting = body.updateExisting || false;
    const syncOldData = body.syncOldData || false;
    const syncByDate = body.syncByDate || false;
    const productUrl = body.productUrl;
    const startDate = body.startDate;
    const endDate = body.endDate;

    // Validate limit
    if (limit < 1 || limit > 50) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 50' },
        { status: 400 }
      );
    }

    // Check if Product Hunt is enabled
    const syncEnabled = process.env.PRODUCT_HUNT_SYNC_ENABLED === 'true';
    
    if (!syncEnabled) {
      return NextResponse.json(
        { error: 'Product Hunt sync is disabled' },
        { status: 400 }
      );
    }

    // Check if Product Hunt token is configured
    const hasToken = !!process.env.PRODUCT_HUNT_DEVELOPER_TOKEN;
    
    if (!hasToken) {
      return NextResponse.json(
        { error: 'Product Hunt Developer Token not configured' },
        { status: 400 }
      );
    }

    console.log('Starting Product Hunt sync with parameters:', { 
      limit, 
      forceSync, 
      updateExisting, 
      syncOldData,
      syncByDate,
      syncSingleProduct,
      productUrl,
      startDate,
      endDate
    });

    // Perform sync based on parameters
    let result;
    if (syncOldData) {
      result = await ProductHuntService.syncOldDataWithCategories();
    } else if (syncSingleProduct) {
      if (!productUrl) {
        return NextResponse.json(
          { error: 'Product URL is required for single product sync' },
          { status: 400 }
        );
      }
      result = await ProductHuntService.syncSingleProductByUrl(
        productUrl,
        dbUser.id,
        forceSync,
        updateExisting
      );
    } else if (syncByDate) {
      result = await ProductHuntService.syncProductsByDateRange(
        limit,
        dbUser.id,
        startDate,
        endDate,
        forceSync,
        updateExisting
      );
    } else {
      result = await ProductHuntService.syncTrendingProducts(
        limit, 
        dbUser.id, 
        forceSync, 
        updateExisting
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${result.created} new tools from Product Hunt`,
      result: {
        created: result.created,
        skipped: result.skipped,
        errors: result.errors,
        total: result.created + result.skipped + result.errors
      },
      details: result.details,
      syncedBy: dbUser.id,
      syncedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error syncing Product Hunt:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to sync Product Hunt data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

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

    // Check if user has admin role (more comprehensive check)
    const isAdmin = dbUser.role === 'admin' || 
                   dbUser.role === 'super_admin' ||
                   dbUser.activeRole === 'admin' || 
                   dbUser.activeRole === 'super_admin' ||
                   dbUser.primaryRole === 'admin' ||
                   dbUser.primaryRole === 'super_admin';
    
    if (!isAdmin) {
      return NextResponse.json(
        { 
          error: 'Admin access required',
          debug: {
            userId: dbUser.id,
            userRole: dbUser.role,
            primaryRole: dbUser.primaryRole,
            activeRole: dbUser.activeRole
          }
        },
        { status: 403 }
      );
    }

    // Get sync statistics
    const statistics = await ProductHuntService.getSyncStatistics();

    return NextResponse.json({
      success: true,
      statistics,
      syncEnabled: process.env.PRODUCT_HUNT_SYNC_ENABLED === 'true',
      lastChecked: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting Product Hunt statistics:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to get Product Hunt statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
