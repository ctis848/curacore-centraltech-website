import { createClient } from "@supabase/supabase-js";

export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL as string,               // FIXED
  process.env.SUPABASE_SERVICE_ROLE_KEY as string,  // MUST be service role key
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
