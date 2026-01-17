import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

const supabaseUrl = `https://${projectId}.supabase.co`;

// Validate configuration
if (!projectId || projectId === 'your-project-id') {
  console.error('❌ Supabase project ID not configured!');
  console.error('   Please connect Supabase using the connection modal');
}

if (!publicAnonKey || publicAnonKey === 'your-anon-key') {
  console.error('❌ Supabase anon key not configured!');
  console.error('   Please connect Supabase using the connection modal');
} else if (publicAnonKey.startsWith('sb_publishable_')) {
  console.error('');
  console.error('═══════════════════════════════════════════════');
  console.error('❌ WRONG API KEY TYPE!');
  console.error('═══════════════════════════════════════════════');
  console.error('You are using a PUBLISHABLE key (for Stripe payments)');
  console.error('ResQLink needs an ANON key (for Supabase database)');
  console.error('');
  console.error('Quick fix:');
  console.error('  1. Click the Supabase connection button');
  console.error('  2. Enter your correct anon key from Supabase dashboard');
  console.error('');
  console.error('Or manually update /utils/supabase/info.tsx');
  console.error('═══════════════════════════════════════════════');
  console.error('');
}

export const supabase = createSupabaseClient(supabaseUrl, publicAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  global: {
    headers: {
      'x-application-name': 'ResQLink',
    },
    fetch: (url, options = {}) => {
      // Add timeout and better error handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      return fetch(url, {
        ...options,
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutId));
    },
  },
});

console.log('✅ Supabase client initialized');
console.log('   URL:', supabaseUrl);
console.log('   Real-time enabled: true');