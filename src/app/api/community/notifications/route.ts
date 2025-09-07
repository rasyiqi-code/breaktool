import { NextRequest, NextResponse } from 'next/server';


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Fetch notifications from database
    // For now, return empty array since notifications table might not exist yet
    const notifications: {
      id: string;
      userId: string;
      type: string;
      title: string;
      message: string;
      read: boolean;
      createdAt: Date;
    }[] = [];

    return NextResponse.json(notifications);

  } catch (error) {
    console.error('Error in notifications API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
