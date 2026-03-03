// app/api/history/bulk-revoke/[id]/revoke/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }  // ← correct: plain object, NOT Promise
) {
  const { id } = context.params;  // ← safe, id is string

  try {
    if (!id) {
      return NextResponse.json(
        { error: 'Missing license ID' },
        { status: 400 }
      );
    }

    // Your revoke logic (example — replace/adapt as needed)
    const { error } = await supabase
      .from('licenses')
      .update({
        active: false,
        revoked_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Bulk revoke failed:', error);
    return NextResponse.json(
      { error: 'Failed to revoke license' },
      { status: 500 }
    );
  }
}