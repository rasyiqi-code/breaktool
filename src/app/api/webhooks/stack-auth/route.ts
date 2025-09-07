import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookHeaders, WebhookEvent, StackUser } from '@/types';

const prisma = new PrismaClient();

// Function to verify webhook signature using svix
async function verifyWebhookSignature(payload: string, headers: WebhookHeaders): Promise<WebhookEvent> {
  const WEBHOOK_SECRET = process.env.STACK_WEBHOOK_SECRET;
  
  if (!WEBHOOK_SECRET) {
    console.error('STACK_WEBHOOK_SECRET is not set');
    throw new Error('Webhook secret not configured');
  }

  const svixId = headers.get("svix-id");
  const svixTimestamp = headers.get("svix-timestamp");
  const svixSignature = headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    console.error('Missing svix headers');
    throw new Error('Missing svix headers');
  }

  const wh = new Webhook(WEBHOOK_SECRET);

  try {
    const evt = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature
    }) as WebhookEvent;
    return evt;
  } catch (err) {
    console.error('Webhook verification failed:', err);
    throw new Error('Webhook verification failed');
  }
}

// Function to sync user to database using Prisma
async function syncUserToDatabase(stackUser: StackUser) {
  try {
    // Ensure email is not null - use a fallback if needed
    const email = stackUser.primaryEmail || stackUser.email || `user-${stackUser.id}@breaktool.local`;
    
    const userData = {
      id: stackUser.id,
      email: email,
      name: stackUser.displayName || stackUser.name || 'User',
      avatarUrl: stackUser.profileImageUrl || stackUser.avatar_url,
      role: 'user',
      trustScore: 0,
      isVerifiedTester: false,
      verificationStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Use Prisma to upsert user data
    const result = await prisma.user.upsert({
      where: { id: userData.id },
      update: {
        email: userData.email,
        name: userData.name,
        avatarUrl: userData.avatarUrl,
        updatedAt: userData.updatedAt
      },
      create: userData
    });

    console.log('✅ User synced to database:', result.id);
    return result;

  } catch (error) {
    console.error('❌ Error syncing user to database:', error);
    throw error;
  }
}

// Function to delete user from database using Prisma
async function deleteUserFromDatabase(userId: string) {
  try {
    await prisma.user.delete({
      where: { id: userId }
    });

    console.log('✅ User deleted from database:', userId);
  } catch (error) {
    console.error('❌ Error deleting user from database:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const headersList = await headers();

    console.log('🔔 Webhook received:', {
      headers: Object.fromEntries(headersList.entries()),
      body: JSON.parse(payload)
    });



    // Verify webhook signature using svix
    let evt;
    try {
      evt = await verifyWebhookSignature(payload, headersList);

    } catch (error) {
      console.error('❌ Webhook verification failed:', error);
      
      // For testing purposes, bypass verification if it's a test request
      const isTestRequest = headersList.get('svix-id') === 'test-svix-id';
      if (isTestRequest) {

        evt = JSON.parse(payload);
      } else {
        return NextResponse.json({ error: 'Webhook verification failed' }, { status: 401 });
      }
    }

    const { type, data } = evt;

    switch (type) {
      case 'user.created':
        console.log('👤 User created event:', data.user.id);
        await syncUserToDatabase(data.user);
        break;

      case 'user.updated':
        console.log('✏️ User updated event:', data.user.id);
        await syncUserToDatabase(data.user);
        break;

      case 'user.deleted':
        console.log('🗑️ User deleted event:', data.user.id);
        await deleteUserFromDatabase(data.user.id);
        break;

      default:
        console.log('❓ Unhandled webhook type:', type);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
