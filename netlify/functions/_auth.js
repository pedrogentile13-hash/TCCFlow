// Shared auth helpers for Netlify Functions
// Verifies the Supabase JWT sent by the frontend and derives a trusted identity.
// NEVER trust userId/email from the request body — use these instead.

const { createClient } = require('@supabase/supabase-js');

function serviceClient() {
    return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
}

// Extract and verify the caller from the Authorization: Bearer <jwt> header.
// Returns the Supabase user object, or null if missing/invalid.
async function getUserFromEvent(event) {
    const headers = event.headers || {};
    const authHeader = headers.authorization || headers.Authorization || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!token) return null;

    try {
        const supabase = serviceClient();
        const { data, error } = await supabase.auth.getUser(token);
        if (error || !data || !data.user) return null;
        return data.user;
    } catch (e) {
        console.error('[auth] getUser failed:', e.message);
        return null;
    }
}

// Is this verified user an active admin?
async function isAdminUser(user) {
    if (!user) return false;
    try {
        const supabase = serviceClient();
        const { data } = await supabase
            .from('admin_emails')
            .select('id')
            .eq('user_id', user.id)
            .eq('active', true)
            .maybeSingle();
        return !!data;
    } catch (e) {
        return false;
    }
}

const jsonHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

function unauthorized() {
    return {
        statusCode: 401,
        headers: jsonHeaders,
        body: JSON.stringify({ error: 'Não autenticado. Faça login novamente.' })
    };
}

module.exports = { getUserFromEvent, isAdminUser, serviceClient, jsonHeaders, unauthorized };
