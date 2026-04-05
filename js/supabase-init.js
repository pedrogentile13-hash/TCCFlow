// ============================================================
// TCCFlow - Supabase Configuration
// ============================================================

const SUPABASE_URL = 'https://fpqvubixlsblanbyppkp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwcXZ1Yml4bHNibGFuYnlwcGtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1MzY4MzEsImV4cCI6MjA4OTExMjgzMX0.tWWn0ljmteupXPHi_qEqa6dhuM3WVy_zv26kwpSXbTo';

// Initialize Supabase client (CDN exposes window.supabase as namespace)
const _supa = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Check if Supabase is configured
function isFirebaseConfigured() {
    return SUPABASE_URL !== 'https://SEU_PROJETO.supabase.co';
}

// Admin emails with access to the admin panel
const ADMIN_EMAILS = ['contato.tccflow@gmail.com'];

// ============================================================
// Compatibility layer - exposes `auth` global with same API
// used across all pages (onAuthStateChanged, signOut, etc.)
// ============================================================

const auth = {
    currentUser: null,

    _listeners: [],

    onAuthStateChanged(callback) {
        this._listeners.push(callback);

        // Detect OAuth callback (URL contains access_token or code from provider redirect)
        const hash = window.location.hash || '';
        const search = window.location.search || '';
        const isOAuthCallback = hash.includes('access_token') || search.includes('code=');

        console.log('[AUTH] isOAuthCallback:', isOAuthCallback, 'URL:', window.location.href);

        let initialized = false;

        const deliverOnce = (user, source) => {
            if (initialized) return;
            initialized = true;
            this.currentUser = user;
            console.log('[AUTH] deliverOnce from', source, '→ user:', user ? user.email : null);
            // Auto-show admin panel buttons if user is admin
            if (user && ADMIN_EMAILS.includes(user.email)) {
                document.querySelectorAll('.admin-panel-btn').forEach(el => el.classList.remove('hidden'));
            }
            callback(user);
        };

        // Subscribe to Supabase auth state changes
        _supa.auth.onAuthStateChange((event, session) => {
            console.log('[AUTH] onAuthStateChange event:', event, 'session:', !!session);

            if (event === 'SIGNED_OUT') {
                this.currentUser = null;
                callback(null);
                return;
            }

            if (session) {
                if (isOAuthCallback && !initialized) {
                    const cleanUrl = window.location.origin + window.location.pathname;
                    window.history.replaceState({}, document.title, cleanUrl);
                }
                deliverOnce(this._mapUser(session.user), 'onAuthStateChange:' + event);
                this.currentUser = this._mapUser(session.user);
                return;
            }

            console.log('[AUTH] Ignoring null session for event:', event);
        });

        if (!isOAuthCallback) {
            // Normal page load: check persisted session
            _supa.auth.getSession().then(({ data: { session } }) => {
                console.log('[AUTH] getSession result:', !!session);
                deliverOnce(session ? this._mapUser(session.user) : null, 'getSession');
            });
        } else {
            // OAuth callback: exchange code manually (PKCE flow)
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');
            console.log('[AUTH] OAuth code present:', !!code);

            if (code) {
                _supa.auth.exchangeCodeForSession(code).then(({ data, error }) => {
                    console.log('[AUTH] exchangeCodeForSession result:', error ? 'ERROR: ' + error.message : 'OK');
                    if (!error && data?.session) {
                        deliverOnce(this._mapUser(data.session.user), 'exchangeCode');
                    } else {
                        // Exchange failed — fallback to getSession after delay
                        setTimeout(() => {
                            if (!initialized) {
                                _supa.auth.getSession().then(({ data: { session } }) => {
                                    console.log('[AUTH] Fallback getSession after exchange fail:', !!session);
                                    deliverOnce(session ? this._mapUser(session.user) : null, 'fallback-getSession');
                                });
                            }
                        }, 3000);
                    }
                }).catch((err) => {
                    console.log('[AUTH] exchangeCodeForSession exception:', err);
                    // Code may have been consumed by auto-detection — check session
                    setTimeout(() => {
                        if (!initialized) {
                            _supa.auth.getSession().then(({ data: { session } }) => {
                                console.log('[AUTH] Fallback getSession after exception:', !!session);
                                deliverOnce(session ? this._mapUser(session.user) : null, 'catch-getSession');
                            });
                        }
                    }, 3000);
                });
            } else if (hash.includes('access_token')) {
                // Implicit flow (hash-based) — onAuthStateChange should handle it
                // But add a safety fallback
                console.log('[AUTH] Implicit flow detected (access_token in hash)');
                setTimeout(() => {
                    if (!initialized) {
                        _supa.auth.getSession().then(({ data: { session } }) => {
                            console.log('[AUTH] Implicit flow fallback getSession:', !!session);
                            deliverOnce(session ? this._mapUser(session.user) : null, 'implicit-getSession');
                        });
                    }
                }, 3000);
            }

            // Final safety net
            this._oauthTimeout = setTimeout(() => {
                if (!initialized) {
                    console.log('[AUTH] Safety timeout triggered (15s)');
                    _supa.auth.getSession().then(({ data: { session } }) => {
                        deliverOnce(session ? this._mapUser(session.user) : null, 'timeout-getSession');
                    });
                }
            }, 15000);
        }
    },

    _mapUser(supaUser) {
        if (!supaUser) return null;
        return {
            uid: supaUser.id,
            email: supaUser.email,
            displayName: supaUser.user_metadata?.display_name || supaUser.user_metadata?.full_name || supaUser.user_metadata?.name || null,
            photoURL: supaUser.user_metadata?.photo_url || supaUser.user_metadata?.avatar_url || null,
            updateProfile: async (data) => {
                const updates = {};
                if (data.displayName !== undefined) updates.display_name = data.displayName;
                if (data.photoURL !== undefined) updates.photo_url = data.photoURL;
                await _supa.auth.updateUser({ data: updates });
                if (auth.currentUser) {
                    if (data.photoURL !== undefined) auth.currentUser.photoURL = data.photoURL;
                    auth.currentUser.displayName = data.displayName || auth.currentUser.displayName;
                }
            },
            reauthenticateWithCredential: async (credential) => {
                const { error } = await _supa.auth.signInWithPassword({
                    email: credential.email,
                    password: credential.password
                });
                if (error) throw { code: 'auth/wrong-password', message: error.message };
            },
            updatePassword: async (newPassword) => {
                const { error } = await _supa.auth.updateUser({ password: newPassword });
                if (error) throw { code: 'auth/weak-password', message: error.message };
            },
            delete: async () => {
                await _supa.auth.signOut();
            }
        };
    },

    async signInWithEmailAndPassword(email, password) {
        const { data, error } = await _supa.auth.signInWithPassword({ email, password });
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
        const { data, error } = await _supa.auth.signUp({ email, password });
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
                    await _supa.auth.updateUser({ data: updates });
                    if (auth.currentUser) {
                        auth.currentUser.displayName = profileData.displayName || auth.currentUser.displayName;
                    }
                }
            }
        };
    },

    async signInWithPopup(provider, options) {
        const redirectPage = (options && options.redirectTo) || '/pages/dashboard.html';
        const { data, error } = await _supa.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin + redirectPage
            }
        });
        if (error) {
            throw { code: 'auth/popup-closed-by-user', message: error.message };
        }
        return { user: this.currentUser };
    },

    async signOut() {
        await _supa.auth.signOut();
        this.currentUser = null;
    },

    async sendOtp(email) {
        const { error } = await _supa.auth.signInWithOtp({ email });
        if (error) throw { code: 'auth/otp-error', message: error.message };
    },

    async verifyOtp(email, token) {
        const { data, error } = await _supa.auth.verifyOtp({ email, token, type: 'email' });
        if (error) throw { code: 'auth/invalid-otp', message: error.message };
        this.currentUser = this._mapUser(data.user);
        return { user: this.currentUser };
    },

    async resetPasswordForEmail(email) {
        const { error } = await _supa.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/pages/nova-senha.html'
        });
        if (error) throw { code: 'auth/reset-error', message: error.message };
    }
};

// Compatibility: firebase namespace
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

// ============================================================
// camelCase <-> snake_case conversion
// Pages use camelCase (createdAt, projectId, ownerId...)
// Supabase tables use snake_case (created_at, project_id, owner_id...)
// ============================================================

function toSnake(str) {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

function toCamel(str) {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

// Convert object keys from camelCase to snake_case (for writing to DB)
function keysToSnake(obj) {
    if (obj === null || obj === undefined || typeof obj !== 'object' || obj instanceof Array) return obj;
    if (obj.__op) return obj; // preserve FieldValue operations
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
        result[toSnake(key)] = value;
    }
    return result;
}

// Convert object keys from snake_case to camelCase (for reading from DB)
function keysToCamel(obj) {
    if (obj === null || obj === undefined || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(keysToCamel);
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
        result[toCamel(key)] = value;
    }
    return result;
}

// Compatibility: db object for direct Firestore-style calls
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
        clone._filters = [...this._filters, { field: toSnake(field), op, value }];
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
        let query = _supa.from(this.table).select('*');

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
                data: () => keysToCamel(row),
                ref: { id: row.id }
            }))
        };
    }

    async add(docData) {
        const cleanData = processFieldValues(keysToSnake(docData));
        const { data, error } = await _supa.from(this.table).insert(cleanData).select().maybeSingle();
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
        const { data, error } = await _supa.from(this.table).select('*').eq('id', this.id).maybeSingle();
        if (error) {
            return { exists: false, data: () => null, id: this.id };
        }
        if (!data) {
            return { exists: false, data: () => null, id: this.id };
        }
        return { exists: true, data: () => keysToCamel(data), id: data.id };
    }

    async set(docData, options) {
        const cleanData = processFieldValues(keysToSnake({ ...docData, id: this.id }));
        const { error } = await _supa.from(this.table).upsert(cleanData);
        if (error) throw error;
    }

    async update(updateData) {
        const snakeData = keysToSnake(updateData);
        const cleanData = {};
        for (const [key, value] of Object.entries(snakeData)) {
            if (value && typeof value === 'object' && value.__op) {
                if (value.__op === 'arrayUnion') {
                    const { data: current } = await _supa.from(this.table).select(key).eq('id', this.id).maybeSingle();
                    const arr = current?.[key] || [];
                    if (!arr.includes(value.value)) arr.push(value.value);
                    cleanData[key] = arr;
                } else if (value.__op === 'arrayRemove') {
                    const { data: current } = await _supa.from(this.table).select(key).eq('id', this.id).maybeSingle();
                    const arr = (current?.[key] || []).filter(v => v !== value.value);
                    cleanData[key] = arr;
                } else if (value.__op === 'increment') {
                    const { data: current } = await _supa.from(this.table).select(key).eq('id', this.id).maybeSingle();
                    cleanData[key] = (current?.[key] || 0) + value.value;
                }
            } else {
                cleanData[key] = processFieldValue(value);
            }
        }
        const { error } = await _supa.from(this.table).update(cleanData).eq('id', this.id);
        if (error) throw error;
    }

    async delete() {
        const { error } = await _supa.from(this.table).delete().eq('id', this.id);
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
