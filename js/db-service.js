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
//   subscriptions      - id (uuid), status, plan, seats, payment_id, payment_method, user_id, user_email, user_name, max_projects
//   ai_usage           - id (text), project_id, month, count
//   orientador_projects - id (uuid), orientador_id, project_id, invite_code, status, created_at
//   orientador_comments - id (uuid), project_id, orientador_id, comment, section, created_at
//   diary_entries       - id (uuid), project_id, content, mood, created_by, created_at
//   notes              - id (uuid), project_id, title, content, color, created_by, created_at, updated_at
//   ideas              - id (uuid), project_id, title, description, category, votes, created_by, created_at
//   user_references    - id (uuid), project_id, type, title, authors, year, source, url, formatted, created_by, created_at
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
                userEmail: data.user_email, userName: data.user_name,
                maxProjects: data.max_projects
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

            // Try insert first; if duplicate, read+update
            const { error: insertErr } = await _supa
                .from('ai_usage')
                .insert({ id: docId, project_id: projectId, month, count: 1 });

            if (insertErr) {
                // Row already exists - read current count and increment
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
                }
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
            const proSearches = (typeof PRICING !== 'undefined') ? PRICING.PRO_AI_SEARCHES : 1000;
            const freeSearches = (typeof PRICING !== 'undefined') ? PRICING.FREE_AI_SEARCHES : 20;
            const limit = isPro ? proSearches : freeSearches;

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
            const { count, error } = await _supa
                .from('projects')
                .select('*', { count: 'exact', head: true })
                .eq('owner_id', userId);
            if (error) throw error;
            return count || 0;
        },

        async getMaxProjects(userId) {
            // Multiple projects only available to beta testers
            const isBeta = await DB.isBetaTester(userId);
            if (!isBeta) return 1;

            // Check if there's a custom max_projects set in subscriptions
            const sub = await DB.subscriptions.get(userId);
            if (sub && sub.maxProjects !== null && sub.maxProjects !== undefined) {
                return sub.maxProjects;
            }
            // Default limits from pricing config
            const isPro = sub && sub.status === 'active' && sub.plan === 'pro';
            const proProjects = (typeof PRICING !== 'undefined') ? PRICING.PRO_PROJECTS : 2;
            const freeProjects = (typeof PRICING !== 'undefined') ? PRICING.FREE_PROJECTS : 1;
            return isPro ? proProjects : freeProjects;
        },

        async setMaxProjects(userId, maxProjects) {
            // Upsert subscription record to set custom max_projects
            const { data: existing } = await _supa
                .from('subscriptions')
                .select('id')
                .eq('id', userId)
                .maybeSingle();

            if (existing) {
                const { error } = await _supa
                    .from('subscriptions')
                    .update({ max_projects: maxProjects })
                    .eq('id', userId);
                if (error) throw error;
            } else {
                const { error } = await _supa
                    .from('subscriptions')
                    .insert({ id: userId, status: 'inactive', plan: 'free', max_projects: maxProjects, user_id: userId });
                if (error) throw error;
            }
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
        try {
            const { data, error } = await _supa
                .from('users')
                .select('beta_tester')
                .eq('id', userId)
                .maybeSingle();
            if (error || !data) return false;
            return data.beta_tester === true;
        } catch (e) {
            // beta_tester column may not exist yet
            return false;
        }
    },

    // ===================== Orientador =====================
    orientador: {
        async getUserRole(userId) {
            const { data, error } = await _supa
                .from('users')
                .select('role')
                .eq('id', userId)
                .maybeSingle();
            if (error || !data) return 'student';
            return data.role || 'student';
        },

        async setUserRole(userId, role) {
            const { error } = await _supa
                .from('users')
                .update({ role })
                .eq('id', userId);
            if (error) throw error;
        },

        async generateInviteCode() {
            const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
            let code = 'ORI-';
            for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
            return code;
        },

        async createInvite(projectId) {
            const code = await DB.orientador.generateInviteCode();
            const { data, error } = await _supa
                .from('orientador_projects')
                .insert({
                    orientador_id: null,
                    project_id: projectId,
                    invite_code: code,
                    status: 'pending'
                })
                .select()
                .maybeSingle();
            if (error) throw error;
            return { code, id: data?.id };
        },

        async acceptInvite(orientadorId, inviteCode) {
            const { data: invite, error: findErr } = await _supa
                .from('orientador_projects')
                .select('*')
                .eq('invite_code', inviteCode.toUpperCase())
                .eq('status', 'pending')
                .maybeSingle();
            if (findErr || !invite) throw { message: 'Código de convite inválido ou já utilizado.' };

            const { error } = await _supa
                .from('orientador_projects')
                .update({ orientador_id: orientadorId, status: 'accepted' })
                .eq('id', invite.id);
            if (error) throw error;
            return invite;
        },

        async getMyProjects(orientadorId) {
            const { data, error } = await _supa
                .from('orientador_projects')
                .select('*, projects:project_id(id, name, code, owner_id, created_at)')
                .eq('orientador_id', orientadorId)
                .eq('status', 'accepted')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
        },

        async getProjectOrientador(projectId) {
            try {
                const { data, error } = await _supa
                    .from('orientador_projects')
                    .select('id, project_id, orientador_id, status, invite_code')
                    .eq('project_id', projectId)
                    .eq('status', 'accepted')
                    .not('orientador_id', 'is', null)
                    .maybeSingle();

                if (error || !data) {
                    return null;
                }

                // Tenta pegar dados do usuário na tabela users (se existir)
                const { data: userFromTable } = await _supa
                    .from('users')
                    .select('id, email, name, photo_url')
                    .eq('id', data.orientador_id)
                    .maybeSingle();

                if (userFromTable) {
                    return {
                        ...data,
                        users: userFromTable
                    };
                }

                // Se não encontrou na tabela users, retorna só com orientador_id
                return data;
            } catch(e) {
                console.error('getProjectOrientador error:', e);
                return null;
            }
        },

        async addComment(projectId, orientadorId, comment, section) {
            const { data, error } = await _supa
                .from('orientador_comments')
                .insert({
                    project_id: projectId,
                    orientador_id: orientadorId,
                    comment,
                    section: section || 'geral'
                })
                .select()
                .maybeSingle();
            if (error) throw error;
            return data;
        },

        async getComments(projectId) {
            const { data, error } = await _supa
                .from('orientador_comments')
                .select('*')
                .eq('project_id', projectId)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
        },

        async deleteComment(commentId) {
            const { error } = await _supa
                .from('orientador_comments')
                .delete()
                .eq('id', commentId);
            if (error) throw error;
        },

        // ===== Phase 3: Notifications =====
        async getNotifications(userId, limit = 20) {
            const { data, error } = await _supa
                .from('orientador_notifications')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(limit);
            if (error) throw error;
            return data || [];
        },

        async markNotificationAsRead(notificationId) {
            const { error } = await _supa
                .from('orientador_notifications')
                .update({ read: true })
                .eq('id', notificationId);
            if (error) throw error;
        },

        async createNotification(userId, projectId, type, details = {}) {
            const { error } = await _supa
                .from('orientador_notifications')
                .insert({
                    user_id: userId,
                    project_id: projectId,
                    orientador_id: details.orientadorId || null,
                    comment_id: details.commentId || null,
                    type: type,
                    section: details.section || null,
                    read: false
                });
            if (error) throw error;
        },

        // ===== Phase 4: Orientador Stats =====
        async getOrientadorStats(orientadorId) {
            const { data, error } = await _supa
                .from('orientador_stats')
                .select('*')
                .eq('orientador_id', orientadorId)
                .order('updated_at', { ascending: false });
            if (error) throw error;
            return data || [];
        },

        async updateProjectStats(orientadorId, projectId) {
            // Count comments
            const { data: comments } = await _supa
                .from('orientador_comments')
                .select('section')
                .eq('orientador_id', orientadorId)
                .eq('project_id', projectId);

            const totalComments = (comments || []).length;
            const sections = [...new Set((comments || []).map(c => c.section))];
            const lastComment = comments?.[0]?.created_at || null;

            // Count students and tasks
            const { data: members } = await _supa
                .from('users')
                .select('id')
                .eq('project_id', projectId);
            const studentsCount = (members || []).length;

            const { data: tasks } = await _supa
                .from('tasks')
                .select('status')
                .eq('project_id', projectId);
            const tasksCount = (tasks || []).length;
            const tasksCompleted = (tasks || []).filter(t => t.status === 'done').length;

            const { error } = await _supa
                .from('orientador_stats')
                .upsert({
                    orientador_id: orientadorId,
                    project_id: projectId,
                    total_comments: totalComments,
                    sections_commented: sections,
                    students_count: studentsCount,
                    tasks_count: tasksCount,
                    tasks_completed: tasksCompleted,
                    last_comment_at: lastComment,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'orientador_id,project_id' });
            if (error) throw error;
        },

        // ===== Phase 5: Reports & Export =====
        async generateReport(orientadorId, projectId) {
            try {
                // Fetch project info
                const { data: proj } = await _supa
                    .from('projects')
                    .select('*')
                    .eq('id', projectId)
                    .maybeSingle();

                // Fetch all comments
                const { data: comments } = await _supa
                    .from('orientador_comments')
                    .select('*')
                    .eq('project_id', projectId)
                    .eq('orientador_id', orientadorId)
                    .order('section, created_at');

                // Fetch project members
                const { data: members } = await _supa
                    .from('users')
                    .select('name, email')
                    .eq('project_id', projectId);

                // Build report JSON
                const report = {
                    project: proj?.name || 'Sem nome',
                    code: proj?.code || '-',
                    students: (members || []).map(m => ({ name: m.name, email: m.email })),
                    generatedAt: new Date().toISOString(),
                    sections: {}
                };

                // Group comments by section
                (comments || []).forEach(c => {
                    if (!report.sections[c.section]) {
                        report.sections[c.section] = [];
                    }
                    report.sections[c.section].push({
                        date: c.created_at,
                        comment: c.comment
                    });
                });

                // Save report
                const { data: savedReport, error } = await _supa
                    .from('orientador_reports')
                    .insert({
                        orientador_id: orientadorId,
                        project_id: projectId,
                        title: `Relatório - ${proj?.name || 'Projeto'}`,
                        content: JSON.stringify(report),
                        format: 'json',
                        expiry_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                    })
                    .select()
                    .maybeSingle();

                if (error) throw error;
                return { id: savedReport?.id, report };
            } catch(e) {
                throw e;
            }
        },

        async getReports(orientadorId) {
            const { data, error } = await _supa
                .from('orientador_reports')
                .select('*')
                .eq('orientador_id', orientadorId)
                .order('generated_at', { ascending: false });
            if (error) throw error;
            return data || [];
        },

        async exportReportAsPDF(reportId) {
            const { data: report, error } = await _supa
                .from('orientador_reports')
                .select('*')
                .eq('id', reportId)
                .maybeSingle();

            if (error || !report) throw { message: 'Relatório não encontrado' };

            const content = typeof report.content === 'string'
                ? JSON.parse(report.content)
                : report.content;

            // Update download count
            await _supa
                .from('orientador_reports')
                .update({ download_count: (report.download_count || 0) + 1 })
                .eq('id', reportId);

            return content;
        }
    },

    // ===================== Diary Entries =====================
    diary: {
        async getAll(projectId) {
            const { data, error } = await _supa
                .from('diary_entries')
                .select('*')
                .eq('project_id', projectId)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return (data || []).map(r => ({
                id: r.id, projectId: r.project_id, content: r.content,
                mood: r.mood, createdBy: r.created_by, createdAt: r.created_at
            }));
        },
        async add(projectId, entry) {
            const { data, error } = await _supa
                .from('diary_entries')
                .insert({
                    project_id: projectId,
                    content: entry.content || '',
                    mood: entry.mood || 'neutral',
                    created_by: auth.currentUser.uid
                })
                .select().maybeSingle();
            if (error) throw error;
            return { id: data.id };
        },
        async update(entryId, updateData) {
            const cleanData = {};
            if (updateData.content !== undefined) cleanData.content = updateData.content;
            if (updateData.mood !== undefined) cleanData.mood = updateData.mood;
            const { error } = await _supa.from('diary_entries').update(cleanData).eq('id', entryId);
            if (error) throw error;
        },
        async remove(entryId) {
            const { error } = await _supa.from('diary_entries').delete().eq('id', entryId);
            if (error) throw error;
        }
    },

    // ===================== Notes =====================
    notes: {
        async getAll(projectId) {
            const { data, error } = await _supa
                .from('notes')
                .select('*')
                .eq('project_id', projectId)
                .order('updated_at', { ascending: false });
            if (error) throw error;
            return (data || []).map(r => ({
                id: r.id, projectId: r.project_id, title: r.title,
                content: r.content, color: r.color,
                createdBy: r.created_by, createdAt: r.created_at, updatedAt: r.updated_at
            }));
        },
        async add(projectId, note) {
            const { data, error } = await _supa
                .from('notes')
                .insert({
                    project_id: projectId,
                    title: note.title || '',
                    content: note.content || '',
                    color: note.color || 'yellow',
                    created_by: auth.currentUser.uid
                })
                .select().maybeSingle();
            if (error) throw error;
            return { id: data.id };
        },
        async update(noteId, updateData) {
            const cleanData = { updated_at: new Date().toISOString() };
            if (updateData.title !== undefined) cleanData.title = updateData.title;
            if (updateData.content !== undefined) cleanData.content = updateData.content;
            if (updateData.color !== undefined) cleanData.color = updateData.color;
            const { error } = await _supa.from('notes').update(cleanData).eq('id', noteId);
            if (error) throw error;
        },
        async remove(noteId) {
            const { error } = await _supa.from('notes').delete().eq('id', noteId);
            if (error) throw error;
        }
    },

    // ===================== Ideas =====================
    ideas: {
        async getAll(projectId) {
            const { data, error } = await _supa
                .from('ideas')
                .select('*')
                .eq('project_id', projectId)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return (data || []).map(r => ({
                id: r.id, projectId: r.project_id, title: r.title,
                description: r.description, category: r.category, votes: r.votes,
                createdBy: r.created_by, createdAt: r.created_at
            }));
        },
        async add(projectId, idea) {
            const { data, error } = await _supa
                .from('ideas')
                .insert({
                    project_id: projectId,
                    title: idea.title || '',
                    description: idea.description || '',
                    category: idea.category || 'geral',
                    votes: 0,
                    created_by: auth.currentUser.uid
                })
                .select().maybeSingle();
            if (error) throw error;
            return { id: data.id };
        },
        async update(ideaId, updateData) {
            const cleanData = {};
            if (updateData.title !== undefined) cleanData.title = updateData.title;
            if (updateData.description !== undefined) cleanData.description = updateData.description;
            if (updateData.category !== undefined) cleanData.category = updateData.category;
            if (updateData.votes !== undefined) cleanData.votes = updateData.votes;
            const { error } = await _supa.from('ideas').update(cleanData).eq('id', ideaId);
            if (error) throw error;
        },
        async remove(ideaId) {
            const { error } = await _supa.from('ideas').delete().eq('id', ideaId);
            if (error) throw error;
        }
    },

    // ===================== References =====================
    references: {
        async getAll(projectId) {
            const { data, error } = await _supa
                .from('user_references')
                .select('*')
                .eq('project_id', projectId)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return (data || []).map(r => ({
                id: r.id, projectId: r.project_id, type: r.type,
                title: r.title, authors: r.authors, year: r.year,
                source: r.source, url: r.url, formatted: r.formatted,
                createdBy: r.created_by, createdAt: r.created_at
            }));
        },
        async add(projectId, ref) {
            const { data, error } = await _supa
                .from('user_references')
                .insert({
                    project_id: projectId,
                    type: ref.type || 'article',
                    title: ref.title || '',
                    authors: ref.authors || '',
                    year: ref.year || '',
                    source: ref.source || '',
                    url: ref.url || '',
                    formatted: ref.formatted || '',
                    created_by: auth.currentUser.uid
                })
                .select().maybeSingle();
            if (error) throw error;
            return { id: data.id };
        },
        async remove(refId) {
            const { error } = await _supa.from('user_references').delete().eq('id', refId);
            if (error) throw error;
        }
    },

    // ===================== Chat Messages =====================
    chatMessages: {
        async getAll(projectId) {
            const { data, error } = await _supa
                .from('chat_messages')
                .select('*')
                .eq('project_id', projectId)
                .order('created_at', { ascending: true });
            if (error) throw error;
            return (data || []).map(r => ({
                id: r.id, projectId: r.project_id,
                userId: r.user_id, userName: r.user_name,
                userPhoto: r.user_photo, text: r.text,
                timestamp: r.created_at
            }));
        },
        async add(projectId, msg) {
            const { data, error } = await _supa
                .from('chat_messages')
                .insert({
                    project_id: projectId,
                    user_id: msg.userId,
                    user_name: msg.userName || 'Usuário',
                    user_photo: msg.userPhoto || '',
                    text: msg.text
                })
                .select().maybeSingle();
            if (error) throw error;
            return { id: data.id };
        }
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
