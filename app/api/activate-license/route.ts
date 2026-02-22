// app/api/activate-license/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    // ────────────────────────────────────────────────
    // 1. Validate required environment variables at runtime
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables in runtime');
      return NextResponse.json(
        { error: 'Internal server configuration error' },
        { status: 500 }
      );
    }

    // Create Supabase client with service role (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // ────────────────────────────────────────────────
    // 2. Extract and validate Bearer token
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid Authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1].trim();

    // 3. Verify token and get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('Token verification failed:', authError?.message);
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    // 4. Parse request body safely
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { machineId } = body;

    if (!machineId || typeof machineId !== 'string') {
      return NextResponse.json(
        { error: 'Valid machineId (string) is required' },
        { status: 400 }
      );
    }

    // 5. Get user's license limit from metadata (fallback to 1)
    const quantity = Number(user.user_metadata?.quantity ?? 1);
    if (isNaN(quantity) || quantity < 1) {
      return NextResponse.json(
        { error: 'Invalid license quantity in user metadata' },
        { status: 400 }
      );
    }

    // 6. Count active licenses for this user
    const { count, error: countError } = await supabase
      .from('licenses')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('active', true);

    if (countError) {
      console.error('License count error:', countError.message);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if ((count ?? 0) >= quantity) {
      return NextResponse.json({ error: 'License limit reached' }, { status: 403 });
    }

    // 7. Insert new active license
    const { error: insertError } = await supabase.from('licenses').insert({
      user_id: user.id,
      plan: user.user_metadata?.plan || 'starter',
      machine_id: machineId,
      active: true,
      created_at: new Date().toISOString(),
      // Optional: add expiration (e.g. 1 year from now)
      // expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    });

    if (insertError) {
      console.error('License insert error:', insertError.message);
      return NextResponse.json({ error: 'Failed to activate license' }, { status: 500 });
    }

    // 8. Success response
    return NextResponse.json(
      { success: true, message: 'License activated successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Activate license endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}