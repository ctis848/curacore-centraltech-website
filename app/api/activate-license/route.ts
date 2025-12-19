// app/api/activate-license/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.split('Bearer ')[1];

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const { machineId } = await request.json();

  if (!machineId) {
    return NextResponse.json({ error: 'Missing machineId' }, { status: 400 });
  }

  const quantity = parseInt(user.user_metadata?.quantity || '1', 10);

  const { data: activeLicenses, error: countError } = await supabase
    .from('licenses')
    .select('id', { count: 'exact' })
    .eq('user_id', user.id)
    .eq('active', true);

  if (countError) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }

  if (activeLicenses.length >= quantity) {
    return NextResponse.json({ error: 'License limit reached' }, { status: 400 });
  }

  const { error: insertError } = await supabase.from('licenses').insert({
    user_id: user.id,
    plan: user.user_metadata?.plan || 'starter',
    machine_id: machineId,
  });

  if (insertError) {
    return NextResponse.json({ error: 'Activation failed' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}