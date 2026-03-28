// ============================================================
// TCCFlow - Database Service (Centralized Supabase CRUD)
// ============================================================
// Tables (snake_case in Supabase):
//   users              - id (uuid), name, email, project_id, created_at
//   projects           - id (uuid), name, code, owner_id, members[], project_info{}, created_at
//   tasks              - id (uuid), project_id, title, assigned_to, due_date, status, created_at
//   google_links       - id (uuid), project_id, name, url, type, created_by, created_at
//   saved_papers       - id (uuid), project_id, title, authors, year, abstract, url, citations, source, doi, saved_by, saved_at
//   calendar_goals     - id (uuid), project_id, title, deadline, completed, created_by, created_at
//   calendar_sessions  - id (uuid), project_id, subject, topic, date, time, completed, created_by, created_at
//   subscriptions      - id (uuid), status, plan, seats, payment_id, payment_method, user_id, user_email
//   ai_usage           - id (text), project_id, month, count
// ============================================================

const DB = {

    // ===================== Google Links =====================
    googleLinks: {
        async getAll(projectId) {
            const { data, error } = await _supa
                .from('google_links')
                .select('*')
                .eq('project_id', projectId)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return (data || []).map(r => ({ id: r.id, projectId: r.project_id, name: r.name, url: r.url, type: r.type, createdBy: r.created_by, createdAt: r.created_at }));
        },

        async add(projectId, link) {
            const { data, error } = await _supa
                .from('google_links')
                .insert({
                    project_id: projectId,
                    name: link.name || '',
                    url: link.url || '',
                    type: link.type || 'drive',
                    created_by: auth.currentUser.uid
                })
                .select()
                .maybeSingle();
            if (error) throw error;
            return { id: data.id };
        },

        async remove(linkId) {
            const { error } = await _supa.from('google_links').delete().eq('id', linkId);
            if (error) throw error;
        }
    },

    // ===================== Saved Papers (I.A.) =====================
    savedPapers: {
        async getAll(projectId) {
            const { data, error } = await _supa
                .from('saved_papers')
                .select('*')
                .eq('project_id', projectId)
                .order('saved_at', { ascending: false });
            if (error) throw error;
            return (data || []).map(r => ({
                id: r.id, projectId: r.project_id, title: r.title, authors: r.authors,
                year: r.year, abstract: r.abstract, url: r.url, citations: r.citations,
                source: r.source, doi: r.doi, savedBy: r.saved_by, savedAt: r.saved_at
            }));
        },

        async add(projectId, paper) {
            const { data, error } = await _supa
                .from('saved_papers')
                .insert({
                    project_id: projectId,
                    title: paper.title || '',
                    authors: paper.authors || '',
                    year: paper.year || '',
                    abstract: paper.abstract || '',
                    url: paper.url || '',
                    citations: paper.citations || 0,
                    source: paper.source || '',
                    doi: paper.doi || '',
                    saved_by: auth.currentUser.uid
                })
                .select()
                .maybeSingle();
            if (error) throw error;
            return { id: data.id };
        },

        async remove(paperId) {
            const { error } = await _supa.from('saved_papers').delete().eq('id', paperId);
            if (error) throw error;
        },

        async exists(projectId, title) {
            const { data, error } = await _supa
                .from('saved_papers')
                .select('id')
                .eq('project_id', projectId)
                .eq('title', title)
                .limit(1);
            if (error) throw error;
            return data && data.length > 0;
        }
    },

    // ===================== Calendar Goals =====================
    calendarGoals: {
        async getAll(projectId) {
            const { data, error } = await _supa
                .from('calendar_goals')
                .select('*')
                .eq('project_id', projectId)
                .order('deadline', { ascending: true });
            if (error) throw error;
            return (data || []).map(r => ({
                id: r.id, projectId: r.project_id, title: r.title,
                deadline: r.deadline, completed: r.completed,
                createdBy: r.created_by, createdAt: r.created_at
            }));
        },

        async add(projectId, goal) {
            const { data, error } = await _supa
                .from('calendar_goals')
                .insert({
                    project_id: projectId,
                    title: goal.title,
                    deadline: goal.deadline,
                    completed: false,
                    created_by: auth.currentUser.uid
                })
                .select()
                .maybeSingle();
            if (error) throw error;
            return { id: data.id };
        },

        async update(goalId, updateData) {
            const cleanData = {};
            if (updateData.completed !== undefined) cleanData.completed = updateData.completed;
            if (updateData.title !== undefined) cleanData.title = updateData.title;
            if (updateData.deadline !== undefined) cleanData.deadline = updateData.deadline;
            const { error } = await _supa.from('calendar_goals').update(cleanData).eq('id', goalId);
            if (error) throw error;
        },

        async remove(goalId) {
            const { error } = await _supa.from('calendar_goals').delete().eq('id', goalId);
            if (error) throw error;
        }
    },

    // ===================== Calendar Sessions =====================
    calendarSessions: {
        async getAll(projectId) {
            const { data, error } = await _supa
                .from('calendar_sessions')
                .select('*')
                .eq('project_id', projectId);
            if (error) throw error;
            return (data || []).map(r => ({
                id: r.id, projectId: r.project_id, subject: r.subject,
                topic: r.topic, date: r.date, time: r.time,
                completed: r.completed, createdBy: r.created_by, createdAt: r.created_at
            }));
        },

        async getByDate(projectId, dateStr) {
            const { data, error } = await _supa
                .from('calendar_sessions')
                .select('*')
                .eq('project_id', projectId)
                .eq('date', dateStr);
            if (error) throw error;
            return (data || []).map(r => ({
                id: r.id, projectId: r.project_id, subject: r.subject,
                topic: r.topic, date: r.date, time: r.time,
                completed: r.completed, createdBy: r.created_by, createdAt: r.created_at
            }));
        },

        async add(projectId, session) {
            const { data, error } = await _supa
                .from('calendar_sessions')
                .insert({
                    project_id: projectId,
                    subject: session.subject || '',
                    topic: session.topic || '',
                    date: session.date,
                    time: session.time || '',
                    completed: session.completed || false,
                    created_by: auth.currentUser.uid
                })
                .select()
                .maybeSingle();
            if (error) throw error;
            return { id: data.id };
        },

        async update(sessionId, updateData) {
            const cleanData = {};
            if (updateData.completed !== undefined) cleanData.completed = updateData.completed;
            if (updateData.subject !== undefined) cleanData.subject = updateData.subject;
            if (updateData.topic !== undefined) cleanData.topic = updateData.topic;
            if (updateData.date !== undefined) cleanData.date = updateData.date;
            if (updateData.time !== undefined) cleanData.time = updateData.time;
            const { error } = await _supa.from('calendar_sessions').update(cleanData).eq('id', sessionId);
            if (error) throw error;
        },

        async remove(sessionId) {
            const { error } = await _supa.from('calendar_sessions').delete().eq('id', sessionId);
            if (error) throw error;
        }
    },

    // ===================== Subscriptions =====================
    subscriptions: {
        async get(userId) {
            const { data, error } = await _supa
                .from('subscriptions')
                .select('*')
                .eq('id', userId)
                .maybeSingle();
            if (error) return null;
            return data ? {
                id: data.id, status: data.status, plan: data.plan,
                seats: data.seats, paymentId: data.payment_id,
                paymentMethod: data.payment_method, userId: data.user_id,
                userEmail: data.user_email, userName: data.user_name
            } : null;
        },

        async getByProject(projectId) {
            const { data: project, error } = await _supa
                .from('projects')
                .select('owner_id')
                .eq('id', projectId)
                .maybeSingle();
            if (error || !project) return null;
            return await DB.subscriptions.get(project.owner_id);
        },

        async isPro(userId) {
            const sub = await DB.subscriptions.get(userId);
            return sub && sub.status === 'active' && sub.plan === 'pro';
        },

        async getSeats(userId) {
            const sub = await DB.subscriptions.get(userId);
            if (!sub || sub.status !== 'active') return 0;
            return sub.seats || 1;
        }
    },

    // ===================== AI Usage / Rate Limiting =====================
    aiUsage: {
        async getUsage(projectId) {
            const now = new Date();
            const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            const docId = `${projectId}_${month}`;

            const { data, error } = await _supa
                .from('ai_usage')
                .select('*')
                .eq('id', docId)
                .maybeSingle();
            if (error && error.code === 'PGRST116') return { projectId, month, count: 0 };
            if (error) throw error;
            return data ? { projectId: data.project_id, month: data.month, count: data.count } : { projectId, month, count: 0 };
        },

        async increment(projectId) {
            const now = new Date();
            const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            const docId = `${projectId}_${month}`;

            const { data: existing } = await _supa
                .from('ai_usage')
                .select('count')
                .eq('id', docId)
                .maybeSingle();

            if (existing) {
                await _supa
                    .from('ai_usage')
                    .update({ count: existing.count + 1 })
                    .eq('id', docId);
            } else {
                await _supa
                    .from('ai_usage')
                    .insert({ id: docId, project_id: projectId, month, count: 1 });
            }
        },

        async canSearch(projectId) {
            const { data: project, error } = await _supa
                .from('projects')
                .select('owner_id')
                .eq('id', projectId)
                .maybeSingle();
            if (error || !project) return { allowed: false, remaining: 0, limit: 0 };

            const isPro = await DB.subscriptions.isPro(project.owner_id);
            const limit = isPro ? 1000 : 20;

            const usage = await DB.aiUsage.getUsage(projectId);
            const remaining = Math.max(0, limit - usage.count);

            return { allowed: remaining > 0, remaining, limit, count: usage.count };
        }
    },

    // ===================== Google Drive =====================
    googleDrive: {
        async setFolder(projectId, folderId, folderUrl) {
            const { error } = await _supa
                .from('projects')
                .update({
                    google_drive_folder_id: folderId,
                    google_drive_folder_url: folderUrl
                })
                .eq('id', projectId);
            if (error) throw error;
        },

        async getFolder(projectId) {
            const { data, error } = await _supa
                .from('projects')
                .select('google_drive_folder_id, google_drive_folder_url')
                .eq('id', projectId)
                .maybeSingle();
            if (error) return null;
            return data?.google_drive_folder_id
                ? { id: data.google_drive_folder_id, url: data.google_drive_folder_url }
                : null;
        }
    },

    // ===================== Projects =====================
    projects: {
        async getOwned(userId) {
            const { data, error } = await _supa
                .from('projects')
                .select('*')
                .eq('owner_id', userId)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return (data || []).map(r => ({
                id: r.id, name: r.name, code: r.code,
                ownerId: r.owner_id, members: r.members,
                createdAt: r.created_at
            }));
        },

        async countOwned(userId) {
            const { data, error } = await _supa
                .from('projects')
                .select('id')
                .eq('owner_id', userId);
            if (error) throw error;
            return (data || []).length;
        },

        async getMaxProjects(userId) {
            const isPro = await DB.subscriptions.isPro(userId);
            return isPro ? 2 : 1;
        },

        async canCreateProject(userId) {
            const count = await DB.projects.countOwned(userId);
            const max = await DB.projects.getMaxProjects(userId);
            return { allowed: count < max, count, max };
        }
    },

    // ===================== Helpers =====================
    async isProByProject(projectId) {
        const { data: project, error } = await _supa
            .from('projects')
            .select('owner_id')
            .eq('id', projectId)
            .maybeSingle();
        if (error || !project) return false;
        return await DB.subscriptions.isPro(project.owner_id);
    },

    async isBetaTester(userId) {
        const { data, error } = await _supa
            .from('users')
            .select('beta_tester')
            .eq('id', userId)
            .maybeSingle();
        if (error || !data) return false;
        return data.beta_tester === true;
    },

    async getProjectId() {
        const user = auth.currentUser;
        if (!user) return null;
        const { data, error } = await _supa
            .from('users')
            .select('project_id')
            .eq('id', user.uid)
            .maybeSingle();
        if (error || !data) return null;
        return data.project_id;
    }
};
