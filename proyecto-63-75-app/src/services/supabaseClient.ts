import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;
let activeCredentials = '';

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

export function getSupabaseClient(url?: string, key?: string): SupabaseClient | null {
  const savedUrl = url || window.localStorage.getItem('SUPABASE_URL') || '';
  const savedKey = key || window.localStorage.getItem('SUPABASE_ANON_KEY') || '';

  if (!savedUrl || !savedKey || isServiceRoleKey(savedKey)) {
    return null;
  }

  const credentials = `${savedUrl}|${savedKey}`;
  if (!supabaseInstance || activeCredentials !== credentials) {
    try {
      supabaseInstance = createClient(savedUrl, savedKey);
      activeCredentials = credentials;
    } catch {
      return null;
    }
  }

  return supabaseInstance;
}

export function saveSupabaseConfig(url: string, key: string) {
  if (isServiceRoleKey(key)) throw new Error('No se puede usar una service_role/secret key en la aplicación web.');
  const nextClient = createClient(url, key);
  window.localStorage.setItem('SUPABASE_URL', url);
  window.localStorage.setItem('SUPABASE_ANON_KEY', key);
  activeCredentials = `${url}|${key}`;
  supabaseInstance = nextClient;
}
