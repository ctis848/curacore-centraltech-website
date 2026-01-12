// app/api/license/activate/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(request: Request) {
  const { licenseCode, machineId, email } = await request.json();

  // Validate user & license
  const { data: user } = await supabase.auth.getUser(); // Use auth token from header in real setup
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Check if license is available (purchased, not active)
  const { data: license, error } = await supabase
    .from('licenses')
    .select('*')
    .eq('user_email', email)
    .eq('code', licenseCode)
    .eq('active', false)
    .single();

  if (error || !license) return NextResponse.json({ error: 'Invalid license' }, { status: 400 });

  // Activate on this machine
  await supabase
    .from('licenses')
    .update({
      active: true,
      machine_id: machineId,
      activation_date: new Date().toISOString(),
      ip: request.headers.get('x-forwarded-for') || 'unknown',
    })
    .eq('id', license.id);

  return NextResponse.json({ success: true, message: 'License activated on this machine' });
}