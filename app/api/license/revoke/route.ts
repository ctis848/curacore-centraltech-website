// app/api/license/revoke/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr'; // Use SSR client for API routes

// Use environment variables safely
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    // Get auth token from Authorization header (client must send Bearer token)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    // Verify user with token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 });
    }

    // Parse request body safely
    const body = await request.json();
    const { licenseId, machineId } = body;

    if (!licenseId || !machineId) {
      return NextResponse.json({ error: 'Missing required fields: licenseId or machineId' }, { status: 400 });
    }

    // Revoke (deactivate) the license for this machine
    const { error: updateError } = await supabase
      .from('licenses')
      .update({
        active: false,
        machine_id: null,
        revoked_at: new Date().toISOString(),
      })
      .eq('id', licenseId)
      .eq('machine_id', machineId)
      .eq('user_email', user.email)
      .single();

    if (updateError) {
      console.error('Supabase update error:', updateError);
      return NextResponse.json({ error: 'Failed to revoke license' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'License revoked successfully — can be reused on a new computer',
    });
  } catch (error) {
    console.error('Revoke license route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}