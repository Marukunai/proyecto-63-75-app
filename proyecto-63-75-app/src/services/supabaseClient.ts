import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(url?: string, key?: string): SupabaseClient | null {
  const savedUrl = url || localStorage.getItem('SUPABASE_URL') || '';
  const savedKey = key || localStorage.getItem('SUPABASE_ANON_KEY') || '';

  if (!savedUrl || !savedKey) {
    return null;
  }

  if (!supabaseInstance) {
    supabaseInstance = createClient(savedUrl, savedKey);
  }

  return supabaseInstance;
}

export function saveSupabaseConfig(url: string, key: string) {
  localStorage.setItem('SUPABASE_URL', url);
  localStorage.setItem('SUPABASE_ANON_KEY', key);
  supabaseInstance = createClient(url, key);
}