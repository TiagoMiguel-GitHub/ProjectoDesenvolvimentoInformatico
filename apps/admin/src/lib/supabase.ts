import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://iotyjppnjgmljmsacjzk.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_FbMjWxrCnXLs6wS2c3_6kA_51xK0ewB";
const SUPABASE_SERVICE_ROLE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY as string;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
