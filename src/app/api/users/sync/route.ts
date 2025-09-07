import { NextResponse } from 'next/server';
import { stackServerApp, syncUserWithDatabase } from '@/lib/stack-server';

export async function POST() {
  try {
    // Get the current user from Stack Auth
    const user = await stackServerApp.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    console.log('🔄 Syncing user:', { 
      id: user.id, 
      email: user.primaryEmail, 
      name: user.displayName 
    });

    // Sync user with database
    const syncedUser = await syncUserWithDatabase(user);
    
    console.log('✅ User synced successfully:', syncedUser.id);

    return NextResponse.json({
      message: 'User synced successfully',
      user: {
        id: syncedUser.id,
        email: syncedUser.email,
        name: syncedUser.name,
        role: syncedUser.role,
        vendorStatus: syncedUser.vendorStatus
      }
    });

  } catch (error) {
    console.error('❌ Error syncing user:', error);
    return NextResponse.json({ error: 'Failed to sync user' }, { status: 500 });
  }
}
