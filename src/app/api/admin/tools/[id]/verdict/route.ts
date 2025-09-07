import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/utils/supabase-client';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { verdict } = await request.json();

    if (!verdict || !['keep', 'try', 'stop'].includes(verdict)) {
      return NextResponse.json(
        { error: 'Invalid verdict value' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseClient();
    
    const { data, error } = await supabase
      .from('tools')
      .update({
        verdict: verdict,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating tool verdict:', error);
      return NextResponse.json(
        { error: 'Failed to update tool verdict' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in tool verdict update API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
