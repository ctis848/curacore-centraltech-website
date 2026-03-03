import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }  // ← this is the ONLY correct type
) {
  const { id } = params;  // ← id is now safely typed as string

  try {
    if (!id) {
      return NextResponse.json(
        { error: 'Missing license ID in route params' },
        { status: 400 }
      );
    }

    // Your revoke logic — adjust as needed
    const { error } = await supabase
      .from('licenses')
      .update({
        active: false,
        revoked_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Supabase revoke error:', error.message);
      return NextResponse.json(
        { error: 'Database update failed', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('Revoke handler failed:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal server error during revoke', details: message },
      { status: 500 }
    );
  }
}