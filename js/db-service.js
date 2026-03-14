// ============================================================
// TCCFlow - Database Service (Centralized Firestore CRUD)
// ============================================================
// Collections:
//   users/{uid}           - name, email, projectId, createdAt
//   projects/{projectId}  - name, code, ownerId, members[], projectInfo{}, createdAt
//   tasks/{taskId}        - projectId, title, assignedTo, dueDate, status, createdAt
//   googleLinks/{linkId}  - projectId, name, url, type, createdBy, createdAt
//   savedPapers/{paperId} - projectId, title, authors, year, abstract, url, citations, source, doi, savedBy, savedAt
//   calendarGoals/{id}    - projectId, title, deadline, completed, createdBy, createdAt
//   calendarSessions/{id} - projectId, subject, topic, date, time, completed, createdBy, createdAt
//   subscriptions/{uid}   - status, plan, seats, stripeCustomerId, stripeSubscriptionId, userId, userEmail
//   aiUsage/{projectId}   - projectId, month (YYYY-MM), count, lastReset
// ============================================================

const DB = {

    // ===================== Google Links =====================
    googleLinks: {
        async getAll(projectId) {
            const snap = await db.collection('googleLinks')
                .where('projectId', '==', projectId)
                .get();
            const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            docs.sort((a, b) => {
                const ta = a.createdAt?.toMillis?.() || 0;
                const tb = b.createdAt?.toMillis?.() || 0;
                return tb - ta;
            });
            return docs;
        },

        async add(projectId, link) {
            return await db.collection('googleLinks').add({
                projectId,
                name: link.name || '',
                url: link.url || '',
                type: link.type || 'drive',
                createdBy: auth.currentUser.uid,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        },

        async remove(linkId) {
            await db.collection('googleLinks').doc(linkId).delete();
        }
    },

    // ===================== Saved Papers (I.A.) =====================
    savedPapers: {
        async getAll(projectId) {
            const snap = await db.collection('savedPapers')
                .where('projectId', '==', projectId)
                .get();
            const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            docs.sort((a, b) => {
                const ta = a.savedAt?.toMillis?.() || 0;
                const tb = b.savedAt?.toMillis?.() || 0;
                return tb - ta;
            });
            return docs;
        },

        async add(projectId, paper) {
            return await db.collection('savedPapers').add({
                projectId,
                title: paper.title || '',
                authors: paper.authors || '',
                year: paper.year || '',
                abstract: paper.abstract || '',
                url: paper.url || '',
                citations: paper.citations || 0,
                source: paper.source || '',
                doi: paper.doi || '',
                savedBy: auth.currentUser.uid,
                savedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        },

        async remove(paperId) {
            await db.collection('savedPapers').doc(paperId).delete();
        },

        async exists(projectId, title) {
            const snap = await db.collection('savedPapers')
                .where('projectId', '==', projectId)
                .where('title', '==', title)
                .limit(1)
                .get();
            return !snap.empty;
        }
    },

    // ===================== Calendar Goals =====================
    calendarGoals: {
        async getAll(projectId) {
            const snap = await db.collection('calendarGoals')
                .where('projectId', '==', projectId)
                .get();
            const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            docs.sort((a, b) => (a.deadline || '').localeCompare(b.deadline || ''));
            return docs;
        },

        async add(projectId, goal) {
            return await db.collection('calendarGoals').add({
                projectId,
                title: goal.title,
                deadline: goal.deadline,
                completed: false,
                createdBy: auth.currentUser.uid,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        },

        async update(goalId, data) {
            await db.collection('calendarGoals').doc(goalId).update(data);
        },

        async remove(goalId) {
            await db.collection('calendarGoals').doc(goalId).delete();
        }
    },

    // ===================== Calendar Sessions =====================
    calendarSessions: {
        async getAll(projectId) {
            const snap = await db.collection('calendarSessions')
                .where('projectId', '==', projectId)
                .get();
            return snap.docs.map(d => ({ id: d.id, ...d.data() }));
        },

        async getByDate(projectId, dateStr) {
            const snap = await db.collection('calendarSessions')
                .where('projectId', '==', projectId)
                .where('date', '==', dateStr)
                .get();
            return snap.docs.map(d => ({ id: d.id, ...d.data() }));
        },

        async add(projectId, session) {
            return await db.collection('calendarSessions').add({
                projectId,
                subject: session.subject || '',
                topic: session.topic || '',
                date: session.date,
                time: session.time || '',
                completed: session.completed || false,
                createdBy: auth.currentUser.uid,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        },

        async update(sessionId, data) {
            await db.collection('calendarSessions').doc(sessionId).update(data);
        },

        async remove(sessionId) {
            await db.collection('calendarSessions').doc(sessionId).delete();
        }
    },

    // ===================== Subscriptions =====================
    subscriptions: {
        async get(userId) {
            const doc = await db.collection('subscriptions').doc(userId).get();
            if (doc.exists) return { id: doc.id, ...doc.data() };
            return null;
        },

        async getByProject(projectId) {
            // Get project owner, then check their subscription
            const projDoc = await db.collection('projects').doc(projectId).get();
            if (!projDoc.exists) return null;
            const ownerId = projDoc.data().ownerId;
            if (!ownerId) return null;
            return await DB.subscriptions.get(ownerId);
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
            const doc = await db.collection('aiUsage').doc(docId).get();
            if (doc.exists) return doc.data();
            return { projectId, month, count: 0 };
        },

        async increment(projectId) {
            const now = new Date();
            const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            const docId = `${projectId}_${month}`;
            const ref = db.collection('aiUsage').doc(docId);
            const doc = await ref.get();

            if (doc.exists) {
                await ref.update({
                    count: firebase.firestore.FieldValue.increment(1)
                });
            } else {
                await ref.set({
                    projectId,
                    month,
                    count: 1
                });
            }
        },

        async canSearch(projectId) {
            // Check if project owner has pro subscription
            const projDoc = await db.collection('projects').doc(projectId).get();
            if (!projDoc.exists) return { allowed: false, remaining: 0, limit: 0 };

            const ownerId = projDoc.data().ownerId;
            const isPro = await DB.subscriptions.isPro(ownerId);
            const limit = isPro ? 100 : 10;

            const usage = await DB.aiUsage.getUsage(projectId);
            const remaining = Math.max(0, limit - usage.count);

            return { allowed: remaining > 0, remaining, limit, count: usage.count };
        }
    },

    // ===================== Google Drive =====================
    googleDrive: {
        async setFolder(projectId, folderId, folderUrl) {
            await db.collection('projects').doc(projectId).update({
                googleDriveFolderId: folderId,
                googleDriveFolderUrl: folderUrl
            });
        },

        async getFolder(projectId) {
            const doc = await db.collection('projects').doc(projectId).get();
            if (!doc.exists) return null;
            const data = doc.data();
            return data.googleDriveFolderId
                ? { id: data.googleDriveFolderId, url: data.googleDriveFolderUrl }
                : null;
        }
    },

    // ===================== Helpers =====================
    async isProByProject(projectId) {
        const projDoc = await db.collection('projects').doc(projectId).get();
        if (!projDoc.exists) return false;
        const ownerId = projDoc.data().ownerId;
        if (!ownerId) return false;
        return await DB.subscriptions.isPro(ownerId);
    },

    async getProjectId() {
        const user = auth.currentUser;
        if (!user) return null;
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (userDoc.exists && userDoc.data().projectId) {
            return userDoc.data().projectId;
        }
        return null;
    }
};
