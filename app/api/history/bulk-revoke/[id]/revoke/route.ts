import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }  // ← Correct: plain object, NOT Promise
) {
  const { id } = params;  // ← safe access, id is guaranteed string

  try {
    if (!id) {
      return NextResponse.json(
        { error: 'Missing license ID in route params' },
        { status: 400 }
      );
    }

    // Your revoke logic (example – adapt to your actual needs)
    const { error } = await supabase
      .from('licenses')
      .update({
        active: false,
        revoked_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Supabase error during revoke:', error);
      return NextResponse.json(
        { error: 'Database update failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('Revoke handler error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal server error during revoke' },
      { status: 500 }
    );
  }
}