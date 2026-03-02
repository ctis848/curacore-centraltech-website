import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const statusFilter = searchParams.get('status') || ''; // active, canceled, etc.

  const cookieStore = await cookies();
  const accessToken = cookieStore.get('sb-access-token')?.value || null;

  if (!accessToken) {
    return NextResponse.json({ items: [], total: 0 }, { status: 200 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ items: [], total: 0 }, { status: 200 });
  }

  let query = supabase
    .from('subscriptions')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (statusFilter) {
    query = query.eq('status', statusFilter);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await query.range(from, to);

  if (error) {
    console.error(error);
    return NextResponse.json({ items: [], total: 0 }, { status: 200 });
  }

  return NextResponse.json({
    items: data,
    total: count || 0,
    page,
    limit,
  });
}
