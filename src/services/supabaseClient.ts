import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

export function isServiceRoleKey(key: string) {
  if (key.startsWith('sb_secret_')) return true;
  const parts = key.split('.');
  if (parts.length !== 3) return false;
  try {
    const base64Payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload = base64Payload.padEnd(base64Payload.length + ((4 - base64Payload.length % 4) % 4), '=');
    const payload = JSON.parse(atob(paddedPayload));
    return payload.role === 'service_role';
  } catch {
    return false;
  }
}

export function getSupabaseClient(): SupabaseClient | null {
  const savedUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || '';
  const savedKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()
    || import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()
    || '';

  if (!savedUrl || !savedKey || isServiceRoleKey(savedKey)) {
    return null;
  }

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(savedUrl, savedKey);
    } catch {
      return null;
    }
  }

  return supabaseInstance;
}
