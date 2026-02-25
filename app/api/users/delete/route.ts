// app/api/delete-account/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // NEVER expose in client!
);

export async function POST(request: Request) {
  try {
    const { user_id } = await request.json();

    if (!user_id) {
      return NextResponse.json({ error: 'No user ID provided' }, { status: 400 });
    }

    // Delete all user licenses first
    await supabaseAdmin.from('licenses').delete().eq('user_id', user_id);

    // Then delete the user
    const { error } = await supabaseAdmin.auth.admin.deleteUser(user_id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}