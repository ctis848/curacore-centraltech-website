// app/api/revoke-license/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(request: Request) {
  const { licenseId, userId } = await request.json();

  if (!licenseId || !userId) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  const { data: license, error: getError } = await supabase
    .from('licenses')
    .select('*')
    .eq('id', licenseId)
    .eq('user_id', userId)
    .single();

  if (getError || !license) {
    return NextResponse.json({ error: 'License not found' }, { status: 400 });
  }

  const { error: updateError } = await supabase
    .from('licenses')
    .update({ active: false })
    .eq('id', licenseId);

  if (updateError) {
    return NextResponse.json({ error: 'Revocation failed' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}