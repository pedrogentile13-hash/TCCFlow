/**
 * TCCFlow — Internationalisation (i18n)
 *
 * How it works:
 *   1. Add  data-i18n="key"  to any element whose textContent should be translated.
 *   2. For attributes (placeholder, title, …) use  data-i18n-placeholder="key"  etc.
 *   3. Call  i18n.apply()  or let it auto-run on DOMContentLoaded.
 *
 * The user's choice is stored in  localStorage.tccflow_lang  (default "pt-BR").
 */
window.i18n = (function () {
    // ── Translation dictionaries ──────────────────────────────────────────
    const T = {
        // ─── Portuguese (Brazil) – DEFAULT ────────────────────────────────
        'pt-BR': {
            // Navbar
            'nav.dashboard': 'Dashboard',
            'nav.project': 'Projeto',
            'nav.ia': 'I.A.',
            'nav.calendar': 'Calendário',
            'nav.tools': 'Ferramentas',
            'nav.more': 'Mais',
            'nav.tasks': 'Tarefas',
            'nav.team': 'Equipe',
            'nav.plans': 'Planos',

            // Admin / Settings
            'settings.title': 'Configurações',
            'settings.subtitle': 'Gerencie o seu perfil e preferências',
            'settings.appearance': 'Aparência',
            'settings.darkMode': 'Modo Escuro',
            'settings.darkModeDesc': 'Ative o tema escuro para reduzir o cansaço visual',
            'settings.language': 'Idioma',
            'settings.langLabel': 'Idioma do site',
            'settings.langDesc': 'Escolha o idioma de exibição da plataforma',
            'settings.langHint': 'A alteração será aplicada em todas as páginas.',
            'settings.profile': 'Perfil',
            'settings.name': 'Nome',
            'settings.email': 'Email',
            'settings.save': 'Salvar Alterações',
            'settings.changePassword': 'Alterar Senha',
            'settings.currentPassword': 'Senha Atual',
            'settings.newPassword': 'Nova Senha',
            'settings.confirmPassword': 'Confirmar Nova Senha',
            'settings.changePasswordBtn': 'Alterar Senha',
            'settings.dangerZone': 'Zona de Perigo',
            'settings.dangerDesc': 'Ações irreversíveis para a sua conta.',
            'settings.clearData': 'Limpar Meus Dados',
            'settings.deleteAccount': 'Eliminar Conta',
            'settings.removePhoto': 'Remover foto',

            // Dashboard
            'dash.welcome': 'Bem-vindo ao TCCFlow',
            'dash.subtitle': 'Organize seu TCC de forma simples e eficiente',

            // Tools page
            'tools.title': 'Ferramentas',
            'tools.subtitle': 'Ferramentas avançadas para turbinar seu TCC. Algumas são gratuitas, outras fazem parte do plano PRO.',
            'tools.badge': 'Ferramentas do TCC',
            'tools.access': 'Acessar',
            'tools.references': 'Gerador de Referências',
            'tools.referencesDesc': 'Formate suas referências automaticamente em ABNT, APA ou Vancouver. Importe direto da I.A.',
            'tools.notes': 'Anotações & Fichamentos',
            'tools.notesDesc': 'Organize suas leituras com fichamentos vinculados aos artigos salvos. Tags e busca.',
            'tools.plagiarism': 'Verificador de Plágio',
            'tools.plagiarismDesc': 'Verifique a originalidade do seu texto com análise de similaridade básica.',
            'tools.templates': 'Banco de Templates',
            'tools.templatesDesc': 'Modelos prontos de Introdução, Metodologia, Capa, Sumário e Slides de Defesa.',
            'tools.diary': 'Diário de Progresso',
            'tools.diaryDesc': 'Registre atividades, tempo gasto e humor. Gere relatórios para o orientador.',
            'tools.ideas': 'Quadro de Ideias',
            'tools.ideasDesc': 'Mural de post-its para brainstorming. Organize temas, hipóteses e referências.',
            'tools.smart': 'Validação SMART',
            'tools.smartDesc': 'Avalie se o tema do seu TCC atende aos critérios da metodologia SMART.',
            'tools.aiDetector': 'Detector de I.A.',
            'tools.aiDetectorDesc': 'Analise se o seu texto pode ser identificado como gerado por inteligência artificial.',
            'tools.proInfo': 'Ferramentas PRO fazem parte do plano pago.',
            'tools.viewPlans': 'Ver planos',
            'tools.sendFeedback': 'Envie feedback',

            // Common
            'common.user': 'Usuário',
            'common.free': 'GRÁTIS',
            'common.pro': 'PRO',
            'common.subscribe': 'Assinar Plano PRO',
        },

        // ─── Portuguese (Portugal) ────────────────────────────────────────
        'pt-PT': {
            'nav.dashboard': 'Dashboard',
            'nav.project': 'Projeto',
            'nav.ia': 'I.A.',
            'nav.calendar': 'Calendário',
            'nav.tools': 'Ferramentas',
            'nav.more': 'Mais',
            'nav.tasks': 'Tarefas',
            'nav.team': 'Equipa',
            'nav.plans': 'Planos',

            'settings.title': 'Configurações',
            'settings.subtitle': 'Gira o seu perfil e preferências',
            'settings.appearance': 'Aparência',
            'settings.darkMode': 'Modo Escuro',
            'settings.darkModeDesc': 'Ative o tema escuro para reduzir o cansaço visual',
            'settings.language': 'Idioma',
            'settings.langLabel': 'Idioma do site',
            'settings.langDesc': 'Escolha o idioma de apresentação da plataforma',
            'settings.langHint': 'A alteração será aplicada em todas as páginas.',
            'settings.profile': 'Perfil',
            'settings.name': 'Nome',
            'settings.email': 'Email',
            'settings.save': 'Guardar Alterações',
            'settings.changePassword': 'Alterar Palavra-passe',
            'settings.currentPassword': 'Palavra-passe Atual',
            'settings.newPassword': 'Nova Palavra-passe',
            'settings.confirmPassword': 'Confirmar Nova Palavra-passe',
            'settings.changePasswordBtn': 'Alterar Palavra-passe',
            'settings.dangerZone': 'Zona de Perigo',
            'settings.dangerDesc': 'Ações irreversíveis para a sua conta.',
            'settings.clearData': 'Limpar Os Meus Dados',
            'settings.deleteAccount': 'Eliminar Conta',
            'settings.removePhoto': 'Remover foto',

            'dash.welcome': 'Bem-vindo ao TCCFlow',
            'dash.subtitle': 'Organize o seu TCC de forma simples e eficiente',

            'tools.title': 'Ferramentas',
            'tools.subtitle': 'Ferramentas avançadas para potenciar o seu TCC. Algumas são gratuitas, outras fazem parte do plano PRO.',
            'tools.badge': 'Ferramentas do TCC',
            'tools.access': 'Aceder',
            'tools.references': 'Gerador de Referências',
            'tools.referencesDesc': 'Formate as suas referências automaticamente em ABNT, APA ou Vancouver. Importe diretamente da I.A.',
            'tools.notes': 'Anotações & Fichamentos',
            'tools.notesDesc': 'Organize as suas leituras com fichamentos vinculados aos artigos guardados. Tags e pesquisa.',
            'tools.plagiarism': 'Verificador de Plágio',
            'tools.plagiarismDesc': 'Verifique a originalidade do seu texto com análise de similaridade básica.',
            'tools.templates': 'Banco de Templates',
            'tools.templatesDesc': 'Modelos prontos de Introdução, Metodologia, Capa, Sumário e Slides de Defesa.',
            'tools.diary': 'Diário de Progresso',
            'tools.diaryDesc': 'Registe atividades, tempo gasto e humor. Gere relatórios para o orientador.',
            'tools.ideas': 'Quadro de Ideias',
            'tools.ideasDesc': 'Mural de post-its para brainstorming. Organize temas, hipóteses e referências.',
            'tools.smart': 'Validação SMART',
            'tools.smartDesc': 'Avalie se o tema do seu TCC cumpre os critérios da metodologia SMART.',
            'tools.aiDetector': 'Detetor de I.A.',
            'tools.aiDetectorDesc': 'Analise se o seu texto pode ser identificado como gerado por inteligência artificial.',
            'tools.proInfo': 'Ferramentas PRO fazem parte do plano pago.',
            'tools.viewPlans': 'Ver planos',
            'tools.sendFeedback': 'Enviar feedback',

            'common.user': 'Utilizador',
            'common.free': 'GRÁTIS',
            'common.pro': 'PRO',
            'common.subscribe': 'Assinar Plano PRO',
        },

        // ─── English ──────────────────────────────────────────────────────
        'en': {
            'nav.dashboard': 'Dashboard',
            'nav.project': 'Project',
            'nav.ia': 'A.I.',
            'nav.calendar': 'Calendar',
            'nav.tools': 'Tools',
            'nav.more': 'More',
            'nav.tasks': 'Tasks',
            'nav.team': 'Team',
            'nav.plans': 'Plans',

            'settings.title': 'Settings',
            'settings.subtitle': 'Manage your profile and preferences',
            'settings.appearance': 'Appearance',
            'settings.darkMode': 'Dark Mode',
            'settings.darkModeDesc': 'Enable the dark theme to reduce eye strain',
            'settings.language': 'Language',
            'settings.langLabel': 'Site language',
            'settings.langDesc': 'Choose the display language of the platform',
            'settings.langHint': 'The change will be applied across all pages.',
            'settings.profile': 'Profile',
            'settings.name': 'Name',
            'settings.email': 'Email',
            'settings.save': 'Save Changes',
            'settings.changePassword': 'Change Password',
            'settings.currentPassword': 'Current Password',
            'settings.newPassword': 'New Password',
            'settings.confirmPassword': 'Confirm New Password',
            'settings.changePasswordBtn': 'Change Password',
            'settings.dangerZone': 'Danger Zone',
            'settings.dangerDesc': 'Irreversible actions for your account.',
            'settings.clearData': 'Clear My Data',
            'settings.deleteAccount': 'Delete Account',
            'settings.removePhoto': 'Remove photo',

            'dash.welcome': 'Welcome to TCCFlow',
            'dash.subtitle': 'Organize your thesis simply and efficiently',

            'tools.title': 'Tools',
            'tools.subtitle': 'Advanced tools to power up your thesis. Some are free, others are part of the PRO plan.',
            'tools.badge': 'Thesis Tools',
            'tools.access': 'Open',
            'tools.references': 'Reference Generator',
            'tools.referencesDesc': 'Format your references automatically in ABNT, APA or Vancouver. Import directly from A.I.',
            'tools.notes': 'Notes & Summaries',
            'tools.notesDesc': 'Organize your readings with summaries linked to saved articles. Tags and search.',
            'tools.plagiarism': 'Plagiarism Checker',
            'tools.plagiarismDesc': 'Check the originality of your text with basic similarity analysis.',
            'tools.templates': 'Template Library',
            'tools.templatesDesc': 'Ready-made templates for Introduction, Methodology, Cover, Table of Contents and Defense Slides.',
            'tools.diary': 'Progress Diary',
            'tools.diaryDesc': 'Record activities, time spent and mood. Generate reports for your advisor.',
            'tools.ideas': 'Idea Board',
            'tools.ideasDesc': 'Sticky-note board for brainstorming. Organize themes, hypotheses and references.',
            'tools.smart': 'SMART Validation',
            'tools.smartDesc': 'Evaluate whether your thesis topic meets the SMART methodology criteria.',
            'tools.aiDetector': 'A.I. Detector',
            'tools.aiDetectorDesc': 'Analyze whether your text could be identified as generated by artificial intelligence.',
            'tools.proInfo': 'PRO tools are part of the paid plan.',
            'tools.viewPlans': 'View plans',
            'tools.sendFeedback': 'Send feedback',

            'common.user': 'User',
            'common.free': 'FREE',
            'common.pro': 'PRO',
            'common.subscribe': 'Subscribe to PRO',
        },

        // ─── Spanish ──────────────────────────────────────────────────────
        'es': {
            'nav.dashboard': 'Panel',
            'nav.project': 'Proyecto',
            'nav.ia': 'I.A.',
            'nav.calendar': 'Calendario',
            'nav.tools': 'Herramientas',
            'nav.more': 'Más',
            'nav.tasks': 'Tareas',
            'nav.team': 'Equipo',
            'nav.plans': 'Planes',

            'settings.title': 'Configuración',
            'settings.subtitle': 'Administra tu perfil y preferencias',
            'settings.appearance': 'Apariencia',
            'settings.darkMode': 'Modo Oscuro',
            'settings.darkModeDesc': 'Activa el tema oscuro para reducir la fatiga visual',
            'settings.language': 'Idioma',
            'settings.langLabel': 'Idioma del sitio',
            'settings.langDesc': 'Elige el idioma de la plataforma',
            'settings.langHint': 'El cambio se aplicará en todas las páginas.',
            'settings.profile': 'Perfil',
            'settings.name': 'Nombre',
            'settings.email': 'Correo electrónico',
            'settings.save': 'Guardar Cambios',
            'settings.changePassword': 'Cambiar Contraseña',
            'settings.currentPassword': 'Contraseña Actual',
            'settings.newPassword': 'Nueva Contraseña',
            'settings.confirmPassword': 'Confirmar Nueva Contraseña',
            'settings.changePasswordBtn': 'Cambiar Contraseña',
            'settings.dangerZone': 'Zona de Peligro',
            'settings.dangerDesc': 'Acciones irreversibles para tu cuenta.',
            'settings.clearData': 'Borrar Mis Datos',
            'settings.deleteAccount': 'Eliminar Cuenta',
            'settings.removePhoto': 'Quitar foto',

            'dash.welcome': 'Bienvenido a TCCFlow',
            'dash.subtitle': 'Organiza tu tesis de forma simple y eficiente',

            'tools.title': 'Herramientas',
            'tools.subtitle': 'Herramientas avanzadas para potenciar tu tesis. Algunas son gratuitas, otras forman parte del plan PRO.',
            'tools.badge': 'Herramientas de Tesis',
            'tools.access': 'Acceder',
            'tools.references': 'Generador de Referencias',
            'tools.referencesDesc': 'Formatea tus referencias automáticamente en ABNT, APA o Vancouver. Importa directo desde la I.A.',
            'tools.notes': 'Notas y Fichas',
            'tools.notesDesc': 'Organiza tus lecturas con fichas vinculadas a los artículos guardados. Tags y búsqueda.',
            'tools.plagiarism': 'Verificador de Plagio',
            'tools.plagiarismDesc': 'Verifica la originalidad de tu texto con análisis de similitud básico.',
            'tools.templates': 'Banco de Plantillas',
            'tools.templatesDesc': 'Plantillas listas de Introducción, Metodología, Portada, Índice y Diapositivas de Defensa.',
            'tools.diary': 'Diario de Progreso',
            'tools.diaryDesc': 'Registra actividades, tiempo dedicado y ánimo. Genera informes para tu asesor.',
            'tools.ideas': 'Tablero de Ideas',
            'tools.ideasDesc': 'Mural de post-its para lluvia de ideas. Organiza temas, hipótesis y referencias.',
            'tools.smart': 'Validación SMART',
            'tools.smartDesc': 'Evalúa si el tema de tu tesis cumple los criterios de la metodología SMART.',
            'tools.aiDetector': 'Detector de I.A.',
            'tools.aiDetectorDesc': 'Analiza si tu texto puede ser identificado como generado por inteligencia artificial.',
            'tools.proInfo': 'Las herramientas PRO forman parte del plan de pago.',
            'tools.viewPlans': 'Ver planes',
            'tools.sendFeedback': 'Enviar feedback',

            'common.user': 'Usuario',
            'common.free': 'GRATIS',
            'common.pro': 'PRO',
            'common.subscribe': 'Suscribirse al Plan PRO',
        },
    };

    // ── Public API ────────────────────────────────────────────────────────
    function getLang() {
        return localStorage.getItem('tccflow_lang') || 'pt-BR';
    }

    function t(key) {
        const lang = getLang();
        return (T[lang] && T[lang][key]) || (T['pt-BR'] && T['pt-BR'][key]) || key;
    }

    function apply(lang) {
        if (lang) localStorage.setItem('tccflow_lang', lang);
        const current = getLang();

        // Update html lang attribute
        const langMap = { 'pt-BR': 'pt-BR', 'pt-PT': 'pt-PT', 'en': 'en', 'es': 'es' };
        document.documentElement.lang = langMap[current] || 'pt-BR';

        // Translate [data-i18n] elements
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const val = t(key);
            if (val) el.textContent = val;
        });

        // Translate [data-i18n-placeholder] elements
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            const val = t(key);
            if (val) el.placeholder = val;
        });

        // Translate [data-i18n-title] elements
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            const val = t(key);
            if (val) el.title = val;
        });

        // Update page title based on current lang
        const titleEl = document.querySelector('title');
        if (titleEl) {
            const pageTitleKey = document.body.getAttribute('data-i18n-title');
            if (pageTitleKey) {
                titleEl.textContent = t(pageTitleKey) + ' - TCCFlow';
            }
        }
    }

    // Auto-apply on page load
    document.addEventListener('DOMContentLoaded', function () {
        apply();
    });

    return { t: t, apply: apply, getLang: getLang };
})();
