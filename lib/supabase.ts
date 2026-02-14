import { createClient } from '@supabase/supabase-js';

// Default credentials for public access
export const DEFAULT_SUPABASE_URL = 'https://pbwglhuettzbhuvrvhuq.supabase.co';
export const DEFAULT_SUPABASE_KEY = 'sb_publishable_G6RXQLU8wmf_IncoyKWUXA_9KFRZ36e';

const getSupabaseCredentials = () => {
    let url = DEFAULT_SUPABASE_URL;
    let key = DEFAULT_SUPABASE_KEY;

    // Check for local overrides (dev mode or admin overrides)
    if (typeof window !== 'undefined') {
        const localUrl = localStorage.getItem('supabase_url');
        const localKey = localStorage.getItem('supabase_key');
        if (localUrl && localKey) {
            url = localUrl;
            key = localKey;
        }
    }
    return { url, key };
};

const { url, key } = getSupabaseCredentials();

// Create a single supabase client for interacting with your database
export const supabase = url && key ? createClient(url, key) : null;

export const getSupabaseClient = () => {
    const { url, key } = getSupabaseCredentials();
    if (url && key) {
        return createClient(url, key);
    }
    return null;
}
