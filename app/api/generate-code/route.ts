// app/api/generate-code/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const token = authHeader.split('Bearer ')[1];
  const { data: { user } } = await supabase.auth.getUser(token);

  if (!user) return NextResponse.json({ error: 'Invalid user' }, { status: 401 });

  // Generate random 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // Save code with expiration (24 hours)
  const { error } = await supabase.from('activation_codes').insert({
    user_id: user.id,
    code,
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  });

  if (error) return NextResponse.json({ error: 'Failed to generate code' }, { status: 500 });

  return NextResponse.json({ code });
}