import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://iotyjppnjgmljmsacjzk.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_FbMjWxrCnXLs6wS2c3_6kA_51xK0ewB";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
