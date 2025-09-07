import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { role } = await request.json();

    if (!role || !['user', 'verified_tester', 'admin', 'super_admin', 'vendor'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role value' },
        { status: 400 }
      );
    }

    // Update user role using Prisma
    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: {
        role: role,
        updatedAt: new Date()
      }
    });

    return NextResponse.json(updatedUser);

  } catch (error) {
    console.error('Error in user role update API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
