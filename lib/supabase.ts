import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Browser client — use in "use client" components (stores auth in cookies)
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
