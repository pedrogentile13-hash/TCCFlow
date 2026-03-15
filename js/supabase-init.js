// ============================================================
// TCCFlow - Supabase Configuration
// ============================================================
// Replace these with your Supabase project credentials:
//   1. Go to https://supabase.com/dashboard
//   2. Select your project > Settings > API
//   3. Copy the URL and anon key below
// ============================================================

const SUPABASE_URL = 'https://SEU_PROJETO.supabase.co';
const SUPABASE_ANON_KEY = 'SUA_ANON_KEY_AQUI';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Check if Supabase is configured
function isFirebaseConfigured() {
    return SUPABASE_URL !== 'https://SEU_PROJETO.supabase.co';
}

// ============================================================
// Compatibility layer - exposes `auth` global with same API
// used across all pages (onAuthStateChanged, signOut, etc.)
// ============================================================

const auth = {
    currentUser: null,

    _listeners: [],

    onAuthStateChanged(callback) {
        this._listeners.push(callback);
        // Check current session immediately
        supabase.auth.getSession().then(({ data: { session } }) => {
            this.currentUser = session ? this._mapUser(session.user) : null;
            callback(this.currentUser);
        });
        // Listen for future changes
        supabase.auth.onAuthStateChange((event, session) => {
            this.currentUser = session ? this._mapUser(session.user) : null;
            callback(this.currentUser);
        });
    },

    _mapUser(supaUser) {
        if (!supaUser) return null;
        return {
            uid: supaUser.id,
            email: supaUser.email,
            displayName: supaUser.user_metadata?.display_name || supaUser.user_metadata?.full_name || supaUser.user_metadata?.name || null,
            updateProfile: async (data) => {
                const updates = {};
                if (data.displayName !== undefined) updates.display_name = data.displayName;
                await supabase.auth.updateUser({ data: updates });
                if (auth.currentUser) {
                    auth.currentUser.displayName = data.displayName || auth.currentUser.displayName;
                }
            },
            reauthenticateWithCredential: async (credential) => {
                // Supabase doesn't require reauthentication for password change
                // We verify the old password by attempting a sign-in
                const { error } = await supabase.auth.signInWithPassword({
                    email: credential.email,
                    password: credential.password
                });
                if (error) throw { code: 'auth/wrong-password', message: error.message };
            },
            updatePassword: async (newPassword) => {
                const { error } = await supabase.auth.updateUser({ password: newPassword });
                if (error) throw { code: 'auth/weak-password', message: error.message };
            },
            delete: async () => {
                // Account deletion requires a server-side call or Edge Function
                // For now, sign out the user (deletion handled via admin or Edge Function)
                await supabase.auth.signOut();
            }
        };
    },

    async signInWithEmailAndPassword(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            let code = 'auth/invalid-credential';
            if (error.message.includes('Invalid login')) code = 'auth/invalid-credential';
            if (error.message.includes('Email not confirmed')) code = 'auth/email-not-confirmed';
            if (error.message.includes('Too many')) code = 'auth/too-many-requests';
            throw { code, message: error.message };
        }
        this.currentUser = this._mapUser(data.user);
        return { user: this.currentUser };
    },

    async createUserWithEmailAndPassword(email, password) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) {
            let code = 'auth/email-already-in-use';
            if (error.message.includes('already registered')) code = 'auth/email-already-in-use';
            if (error.message.includes('weak')) code = 'auth/weak-password';
            throw { code, message: error.message };
        }
        this.currentUser = this._mapUser(data.user);
        return {
            user: {
                ...this.currentUser,
                updateProfile: async (profileData) => {
                    const updates = {};
                    if (profileData.displayName !== undefined) updates.display_name = profileData.displayName;
                    await supabase.auth.updateUser({ data: updates });
                    if (auth.currentUser) {
                        auth.currentUser.displayName = profileData.displayName || auth.currentUser.displayName;
                    }
                }
            }
        };
    },

    async signInWithPopup(provider) {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin + '/pages/dashboard.html'
            }
        });
        if (error) {
            throw { code: 'auth/popup-closed-by-user', message: error.message };
        }
        // OAuth redirects, so this won't return immediately
        // The onAuthStateChanged listener will pick up the session
        return { user: this.currentUser };
    },

    async signOut() {
        await supabase.auth.signOut();
        this.currentUser = null;
    }
};

// Compatibility: firebase.auth.GoogleAuthProvider
const firebase = {
    auth: {
        GoogleAuthProvider: function() { return { providerId: 'google' }; },
        EmailAuthProvider: {
            credential: (email, password) => ({ email, password })
        }
    },
    firestore: {
        FieldValue: {
            serverTimestamp: () => new Date().toISOString(),
            arrayUnion: (val) => ({ __op: 'arrayUnion', value: val }),
            arrayRemove: (val) => ({ __op: 'arrayRemove', value: val }),
            increment: (val) => ({ __op: 'increment', value: val })
        }
    }
};

// Compatibility: db object for direct Firestore-style calls in pages
// that still use db.collection() directly (dashboard, equipe, etc.)
const db = {
    collection(name) {
        return new SupaCollection(name);
    }
};

class SupaCollection {
    constructor(table) {
        this.table = table;
        this._filters = [];
        this._limitVal = null;
    }

    doc(id) {
        return new SupaDoc(this.table, id);
    }

    where(field, op, value) {
        const clone = new SupaCollection(this.table);
        clone._filters = [...this._filters, { field, op, value }];
        clone._limitVal = this._limitVal;
        return clone;
    }

    limit(n) {
        const clone = new SupaCollection(this.table);
        clone._filters = [...this._filters];
        clone._limitVal = n;
        return clone;
    }

    async get() {
        let query = supabase.from(this.table).select('*');

        for (const f of this._filters) {
            if (f.op === '==') query = query.eq(f.field, f.value);
            else if (f.op === '!=') query = query.neq(f.field, f.value);
            else if (f.op === '<') query = query.lt(f.field, f.value);
            else if (f.op === '<=') query = query.lte(f.field, f.value);
            else if (f.op === '>') query = query.gt(f.field, f.value);
            else if (f.op === '>=') query = query.gte(f.field, f.value);
            else if (f.op === 'array-contains') query = query.contains(f.field, [f.value]);
        }

        if (this._limitVal) query = query.limit(this._limitVal);

        const { data, error } = await query;
        if (error) throw error;

        return {
            empty: !data || data.length === 0,
            docs: (data || []).map(row => ({
                id: row.id,
                exists: true,
                data: () => row,
                ref: { id: row.id }
            }))
        };
    }

    async add(docData) {
        // Process special FieldValue operations
        const cleanData = processFieldValues(docData);
        const { data, error } = await supabase.from(this.table).insert(cleanData).select().single();
        if (error) throw error;
        return { id: data.id };
    }
}

class SupaDoc {
    constructor(table, id) {
        this.table = table;
        this.id = id;
    }

    async get() {
        const { data, error } = await supabase.from(this.table).select('*').eq('id', this.id).single();
        if (error && error.code === 'PGRST116') {
            return { exists: false, data: () => null, id: this.id };
        }
        if (error) throw error;
        return { exists: true, data: () => data, id: data.id };
    }

    async set(docData, options) {
        const cleanData = processFieldValues({ ...docData, id: this.id });
        if (options?.merge) {
            const { error } = await supabase.from(this.table).upsert(cleanData);
            if (error) throw error;
        } else {
            const { error } = await supabase.from(this.table).upsert(cleanData);
            if (error) throw error;
        }
    }

    async update(updateData) {
        const cleanData = {};
        for (const [key, value] of Object.entries(updateData)) {
            if (value && typeof value === 'object' && value.__op) {
                if (value.__op === 'arrayUnion') {
                    // Fetch current array, append value
                    const { data: current } = await supabase.from(this.table).select(key).eq('id', this.id).single();
                    const arr = current?.[key] || [];
                    if (!arr.includes(value.value)) arr.push(value.value);
                    cleanData[key] = arr;
                } else if (value.__op === 'arrayRemove') {
                    const { data: current } = await supabase.from(this.table).select(key).eq('id', this.id).single();
                    const arr = (current?.[key] || []).filter(v => v !== value.value);
                    cleanData[key] = arr;
                } else if (value.__op === 'increment') {
                    const { data: current } = await supabase.from(this.table).select(key).eq('id', this.id).single();
                    cleanData[key] = (current?.[key] || 0) + value.value;
                }
            } else {
                cleanData[key] = processFieldValue(value);
            }
        }
        const { error } = await supabase.from(this.table).update(cleanData).eq('id', this.id);
        if (error) throw error;
    }

    async delete() {
        const { error } = await supabase.from(this.table).delete().eq('id', this.id);
        if (error) throw error;
    }
}

function processFieldValues(obj) {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
        result[key] = processFieldValue(value);
    }
    return result;
}

function processFieldValue(value) {
    if (value && typeof value === 'object' && value.__op) {
        if (value.__op === 'serverTimestamp') return new Date().toISOString();
        return value;
    }
    return value;
}
