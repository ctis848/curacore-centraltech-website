// app/api/license/validate/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role for secure read
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const licenseKey = searchParams.get('key');

  if (!licenseKey) {
    return NextResponse.json(
      { active: false, reason: 'missing_key' },
      { status: 400 }
    );
  }

  try {
    const { data, error } = await supabase
      .from('enterprise_licenses')
      .select('active, service_expiry')
      .eq('license_key', licenseKey)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { active: false, reason: 'invalid_key' },
        { status: 404 }
      );
    }

    const isExpired = new Date(data.service_expiry) < new Date();

    return NextResponse.json({
      active: data.active && !isExpired,
      reason: isExpired ? 'service_fee_expired' : null,
      expiry: data.service_expiry,
    });
  } catch (err) {
    console.error('Validate error:', err);
    return NextResponse.json(
      { active: false, reason: 'server_error' },
      { status: 500 }
    );
  }
}