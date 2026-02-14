import { createClient } from '@supabase/supabase-js';

// We allow the user to input keys in the Admin Dashboard, stored in localStorage.
// Or you can hardcode them here if you prefer.
const getSupabaseCredentials = () => {
    if (typeof window !== 'undefined') {
        const url = localStorage.getItem('supabase_url');
        const key = localStorage.getItem('supabase_key');
        return { url, key };
    }
    return { url: null, key: null };
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
