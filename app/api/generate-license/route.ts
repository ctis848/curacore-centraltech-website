import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto-js';

export async function POST(req: Request) {
  const { requestKey } = await req.json();

  if (!requestKey) {
    return NextResponse.json({ error: 'Missing request key' }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', req.headers.get('x-user-id'))
    .eq('status', 'active')
    .single();

  if (!sub) {
    return NextResponse.json({ error: 'No active subscription' }, { status: 400 });
  }

  const payload = {
    machineId: requestKey,
    plan: sub.plan,
    expiresAt: sub.expires_at,
  };

  const json = JSON.stringify(payload);
  const base64 = Buffer.from(json).toString('base64');

  const signature = crypto.HmacSHA256(json, process.env.LICENSE_SECRET!).toString();

  return NextResponse.json({
    license: `${base64}.${signature}`,
  });
}
