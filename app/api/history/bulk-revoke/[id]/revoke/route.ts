import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }  // ← correct type: plain object (NOT Promise)
) {
  const { id } = params;  // ← safe access, id is string

  try {
    if (!id) {
      return NextResponse.json(
        { error: 'Missing license ID in route params' },
        { status: 400 }
      );
    }

    // Your actual revoke logic (adapt as needed)
    const { error } = await supabase
      .from('licenses')
      .update({
        active: false,
        revoked_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Supabase revoke error:', error);
      return NextResponse.json(
        { error: 'Failed to revoke license in database' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Bulk revoke handler error:', err);
    return NextResponse.json(
      { error: 'Internal server error during revoke' },
      { status: 500 }
    );
  }
}