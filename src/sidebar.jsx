// Shared Sidebar + AppShell component
const { useState, useEffect, useRef } = React;

function AppSplash() {
  return (
    <div className="app-splash">
      <div className="splash-logo"><img src="../assets/logo.png" alt="" /></div>
      <div className="splash-name">TCC<em>Flow</em></div>
      <div className="splash-dots"><span/><span/><span/></div>
    </div>
  );
}

// Inject font-switch.js once
(function() {
  if (!document.getElementById("tcc-font-switcher-script")) {
    const s = document.createElement("script");
    s.id = "tcc-font-switcher-script";
    s.src = "../js/font-switch.js";
    document.head.appendChild(s);
  }
})();

function useTCCData() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [project, setProject] = useState(null);
  const [subscription, setSub] = useState(null);
  const [teamMembers, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof auth === 'undefined') { setLoading(false); return; }
    auth.onAuthStateChanged(async (u) => {
      if (!u) { window.location.href = 'login.html'; return; }
      setUser(u);
      try {
        const { data: ud } = await _supa.from('users').select('*').eq('id', u.uid).maybeSingle();
        setUserData(ud);
        if (ud?.project_id) {
          const { data: proj } = await _supa.from('projects').select('*').eq('id', ud.project_id).maybeSingle();

          if (!proj) {
            await _supa.from('users').update({ project_id: null }).eq('id', u.uid);
            ud.project_id = null;
            setUserData({ ...ud, project_id: null });
            setProject(null);
          } else {
            setProject(proj);

            let memberRes = await _supa.from('users').select('id, name, email, role, project_id').eq('project_id', ud.project_id).order('name', { ascending: true });
            if (memberRes.error) {
              memberRes = await _supa.from('users').select('id, name, email, project_id').eq('project_id', ud.project_id).order('name', { ascending: true });
            }
            const members = memberRes.data || [];
            const currentUserExists = members.some(m => m.id === u.uid);
            if (!currentUserExists && ud) {
              members.unshift({ id: u.uid, name: ud.name, email: u.email, role: 'student', project_id: ud.project_id });
            }
            setTeam(members);
          }
        }
        const sub = await DB.subscriptions.get(u.uid);
        setSub(sub);
      } catch(e) { console.error('useTCCData error:', e); }
      setLoading(false);
    });
  }, []);

  return { user, userData, project, subscription, teamMembers, loading };
}

// Mobile menu shared state
let _mobileMenuOpen = false;
const _mobileListeners = new Set();
function useMobileMenu() {
  const [open, setOpen] = useState(_mobileMenuOpen);
  useEffect(() => {
    _mobileListeners.add(setOpen);
    return () => _mobileListeners.delete(setOpen);
  }, []);
  return [open, function(val) {
    const next = typeof val === 'function' ? val(_mobileMenuOpen) : val;
    _mobileMenuOpen = next;
    _mobileListeners.forEach(function(fn) { fn(next); });
  }];
}

function getInitials(name) {
  if (!name) return '??';
  return name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
}

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", href: "dashboard.html", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  )},
  { id: "project", label: "Projeto", href: "project.html", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  )},
  { id: "tasks", label: "Tarefas", href: "tasks.html", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
    </svg>
  )},
  { id: "calendar", label: "Calendário", href: "calendar.html", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  )},
  { id: "ai", label: "I.A.", href: "ai.html", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a4 4 0 0 1 4 4c0 1.4-.7 2.6-1.8 3.4L16 21H8l1.8-11.6A4 4 0 0 1 8 6a4 4 0 0 1 4-4z"/>
      <path d="M8 21h8"/><circle cx="12" cy="6" r="1"/>
    </svg>
  )},
  { id: "trabalho", label: "Trabalho Escrito", href: "trabalho.html", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      <line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="14" y2="11"/>
    </svg>
  )},
  { id: "orientador", label: "Orientador", href: "orientador-feedback.html", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5"/>
    </svg>
  )},
  { id: "tools", label: "Ferramentas", href: "tools.html", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
    </svg>
  )},
  { id: "team", label: "Equipe", href: "team.html", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  )},
  { id: "google", label: "Google", href: "google.html", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.35 11.1H12v2.8h5.35c-.23 1.25-.95 2.31-2.02 3.02v2.51h3.27c1.91-1.76 3.01-4.35 3.01-7.4 0-.5-.05-.98-.26-1.93z"/>
      <path d="M12 22c2.7 0 4.96-.9 6.6-2.42l-3.27-2.51c-.9.6-2.04.96-3.33.96-2.56 0-4.73-1.73-5.51-4.06H3.1v2.6C4.75 19.97 8.13 22 12 22z"/>
      <path d="M6.49 13.97A5.94 5.94 0 0 1 6.18 12c0-.69.12-1.36.31-1.97V7.43H3.1A9.99 9.99 0 0 0 2 12c0 1.62.39 3.15 1.1 4.5l3.39-2.53z"/>
      <path d="M12 6.2c1.44 0 2.73.5 3.75 1.47l2.81-2.81C16.95 3.25 14.69 2.2 12 2.2 8.13 2.2 4.75 4.23 3.1 7.43l3.39 2.6C7.27 7.93 9.44 6.2 12 6.2z"/>
    </svg>
  )},
];

const ADMIN_ITEM = { id: "admin", label: "Admin", href: "painel-admin-novo.html", icon: (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)};

const BOTTOM_ITEMS = [
  { id: "plans", label: "Planos", href: "plans.html", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  )},
  { id: "settings", label: "Configurações", href: "settings.html", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  )},
];

function FontSwitcher({ isBeta }) {
  const [current, setCurrent] = useState(() => localStorage.getItem("tccflow_font") || "geist");
  useEffect(() => {
    const handler = (e) => setCurrent(e.detail);
    window.addEventListener("tccflow-font-changed", handler);
    return () => window.removeEventListener("tccflow-font-changed", handler);
  }, []);
  if (!isBeta) return null;
  const fonts = ["geist","inter","lato"];
  return (
    <div style={{padding:"8px 10px 4px",borderTop:"1px solid var(--line)",marginBottom:4}}>
      <div style={{fontFamily:"var(--font-mono)",fontSize:"0.5625rem",textTransform:"uppercase",letterSpacing:"0.1em",color:"var(--muted)",marginBottom:5,paddingLeft:2}}>Fonte <span style={{color:"var(--amber)",fontWeight:600}}>BETA</span></div>
      <div style={{display:"flex",gap:4}}>
        {fonts.map(f => (
          <button key={f} onClick={() => { if(window.TCCFont) window.TCCFont.apply(f); else { localStorage.setItem("tccflow_font",f); location.reload(); }; setCurrent(f); }}
            style={{flex:1,padding:"5px 4px",borderRadius:6,border:`1.5px solid ${current===f?"var(--violet)":"var(--line)"}`,background:current===f?"rgba(124,58,237,.08)":"transparent",color:current===f?"var(--violet)":"var(--muted)",fontSize:"0.6875rem",fontWeight:current===f?600:400,cursor:"pointer",transition:"all .15s",textTransform:"capitalize"}}>
            {f.charAt(0).toUpperCase()+f.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}

function Sidebar({ active, userData, project, subscription }) {
  const [mobileOpen, setMobileOpen] = useMobileMenu();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userName = userData?.name || (typeof auth !== 'undefined' && auth.currentUser?.displayName) || 'Usuário';
  const userInitials = getInitials(userName);
  const projectName = project?.name || 'Nenhum projeto';
  const projectCode = project?.code ? `Código: ${project.code}` : 'Crie ou entre em um projeto';
  const planLabel = (subscription?.plan === 'pro' && subscription?.status === 'active') ? 'Plano Pro' : 'Plano Gratuito';
  const isBeta = userData?.beta_tester === true;

  useEffect(() => {
    const handler = () => { if (window.innerWidth > 768) setMobileOpen(false); };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return (
    React.createElement(React.Fragment, null,
    React.createElement('div', { className: 'sidebar-overlay' + (mobileOpen ? ' active' : ''), onClick: () => setMobileOpen(false) }),
    <aside className={`sidebar${mobileOpen ? ' mobile-open' : ''}`}>
      <div className="sidebar-brand">
        <img src="../assets/logo.png" alt="TCCFlow" />
        <span>TCCFlow<span className="dot"></span></span>
      </div>

      <div className="sidebar-project">
        <div className="proj-label">Projeto ativo</div>
        <div className="proj-name">{projectName}</div>
        <div className="proj-code">{projectCode}</div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Principal</div>
        {NAV_ITEMS.map(item => (
          <a key={item.id} href={item.href}
            className={`nav-item ${active === item.id ? "active" : ""}`}>
            <span className="icon">{item.icon}</span>
            {item.label}
            {item.badge && <span className="badge">{item.badge}</span>}
          </a>
        ))}

        <div className="nav-section-label" style={{marginTop: 8}}>Conta</div>
        {BOTTOM_ITEMS.map(item => {
          const isProActive = subscription?.plan === 'pro' && subscription?.status === 'active';
          if (item.id === 'plans' && isProActive) return null;
          return (
            <a key={item.id} href={item.href}
              className={`nav-item ${active === item.id ? "active" : ""}`}>
              <span className="icon">{item.icon}</span>
              {item.label}
            </a>
          );
        })}
        {typeof ADMIN_EMAILS !== 'undefined' && typeof auth !== 'undefined' && auth.currentUser && ADMIN_EMAILS.includes(auth.currentUser.email) && (
          <a href={ADMIN_ITEM.href} className={`nav-item ${active === "admin" ? "active" : ""}`} style={{color:"var(--amber)"}}>
            <span className="icon">{ADMIN_ITEM.icon}</span>
            {ADMIN_ITEM.label}
          </a>
        )}
      </nav>

      <div className="sidebar-bottom">
        <FontSwitcher isBeta={isBeta}/>
        <div className="sidebar-user" style={{position:"relative",cursor:"pointer"}} onClick={() => setShowUserMenu(p => !p)}>
          <div className="av av-sm c1">{userInitials}</div>
          <div className="info">
            <div className="name">{userName}</div>
            <div className="plan">{planLabel}</div>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginLeft:"auto",color:"var(--muted)",transition:"transform .2s",transform:showUserMenu?"rotate(180deg)":"none"}}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
          {showUserMenu && (
            <div style={{position:"absolute",bottom:"100%",left:0,right:0,marginBottom:6,background:"var(--paper)",border:"1px solid var(--line)",borderRadius:10,boxShadow:"var(--shadow)",overflow:"hidden",zIndex:50}}>
              <a href="settings.html" style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",fontSize:".8125rem",color:"var(--ink)",textDecoration:"none",transition:"background .15s"}}
                onMouseEnter={e=>e.currentTarget.style.background="var(--bg-2)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09"/></svg>
                Configurações
              </a>
              <a href="orientador-painel.html" style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",fontSize:".8125rem",color:"var(--emerald)",textDecoration:"none",transition:"background .15s"}}
                onMouseEnter={e=>e.currentTarget.style.background="var(--bg-2)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9c0-1 1-2 2-2s2 1 2 2-1 2-2 2-2-1-2-2z"/><path d="M14 9c0-1 1-2 2-2s2 1 2 2-1 2-2 2-2-1-2-2z"/><path d="M4 20h16v-3c0-2-2-4-4-4h-8c-2 0-4 2-4 4v3z"/><path d="M4 3h16M4 7h16"/></svg>
                Modo Orientador
              </a>
              <div style={{borderTop:"1px solid var(--line)"}}/>
              <button onClick={(e) => { e.stopPropagation(); if(typeof auth !== 'undefined') auth.signOut().then(() => window.location.href = '../index.html'); }}
                style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",fontSize:".8125rem",color:"var(--rose)",cursor:"pointer",border:"none",background:"transparent",width:"100%",textAlign:"left",transition:"background .15s"}}
                onMouseEnter={e=>e.currentTarget.style.background="rgba(244,63,94,.06)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
    )
  );
}

function Topbar({ page, actions, user }) {
  const [, setMobileOpen] = useMobileMenu();
  const userName = user?.displayName || 'Usuário';
  const userInitials = getInitials(userName);

  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const bellRef = useRef(null);
  const [bellPos, setBellPos] = useState({top:0,right:0});

  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const searchTimerRef = useRef(null);

  async function loadNotifications() {
    if (!user) return;
    setNotifLoading(true);
    try {
      const notifs = [];
      const res1 = await _supa.from('orientador_notifications').select('*').eq('user_id', user.uid).order('created_at', { ascending: false }).limit(10);
      if (!res1.error && res1.data) notifs.push(...res1.data);
      const res2 = await _supa.from('notifications').select('*').eq('user_id', user.uid).order('created_at', { ascending: false }).limit(10);
      if (!res2.error && res2.data) notifs.push(...res2.data);

      if (notifs.length === 0) {
        const { data: tasks } = await _supa.from('tasks').select('id, title, due_date, status').eq('assigned_to', user.uid).not('status', 'eq', 'done').not('due_date', 'is', null).order('due_date', { ascending: true }).limit(5);
        (tasks || []).forEach(t => {
          const due = new Date(t.due_date + 'T00:00:00');
          const now = new Date();
          const diff = Math.ceil((due - now) / 86400000);
          if (diff <= 3) {
            notifs.push({ id: 'task-' + t.id, type: diff < 0 ? 'overdue' : 'deadline', title: t.title, message: diff < 0 ? 'Tarefa atrasada!' : diff === 0 ? 'Vence hoje!' : `Vence em ${diff} dia${diff>1?'s':''}`, created_at: new Date().toISOString(), read: false });
          }
        });
      }
      notifs.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
      setNotifications(notifs.slice(0, 10));
    } catch(e) { setNotifications([]); }
    setNotifLoading(false);
  }

  function toggleNotif() {
    if (!showNotif) {
      loadNotifications();
      if (bellRef.current) {
        const r = bellRef.current.getBoundingClientRect();
        setBellPos({ top: r.bottom + 8, right: window.innerWidth - r.right });
      }
    }
    setShowNotif(!showNotif);
    setShowSearch(false);
  }

  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
        setShowNotif(false);
      }
      if (e.key === 'Escape') {
        setShowSearch(false);
        setShowNotif(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  async function handleSearch(query) {
    if (!query || !query.trim() || query.length < 2) { setSearchResults([]); return; }

    try {
      const results = [];
      const statusLabels = { todo: 'A fazer', progress: 'Em andamento', review: 'Em revisão', done: 'Concluída' };
      const statusBadges = { todo: {text:'A fazer',cls:'tag-muted'}, progress: {text:'Em andamento',cls:'tag-blue'}, review: {text:'Em revisão',cls:'tag-amber'}, done: {text:'Concluída',cls:'tag-emerald'} };

      const { data: tasks } = await _supa.from('tasks').select('id, title, status, due_date').ilike('title', `%${query}%`).limit(5);
      (tasks || []).forEach(t => {
        const dueSub = t.due_date ? new Date(t.due_date + 'T00:00:00').toLocaleDateString('pt-BR') : '';
        results.push({ type: 'tarefa', title: t.title, sub: dueSub ? `Prazo: ${dueSub}` : statusLabels[t.status] || 'Tarefa', icon: '✓', href: 'tasks.html', badge: statusBadges[t.status] });
      });

      const { data: projects } = await _supa.from('projects').select('id, name, code').ilike('name', `%${query}%`).limit(3);
      (projects || []).forEach(p => results.push({ type: 'projeto', title: p.name, sub: p.code || 'Projeto', icon: '📁', href: 'project.html' }));

      const { data: users } = await _supa.from('users').select('id, name, email').ilike('name', `%${query}%`).limit(3);
      (users || []).forEach(u => results.push({ type: 'pessoa', title: u.name || u.email, sub: u.email, icon: '👤', href: 'team.html' }));

      const { data: goals } = await _supa.from('calendar_goals').select('id, title, deadline').ilike('title', `%${query}%`).limit(3);
      (goals || []).forEach(g => results.push({ type: 'meta', title: g.title, sub: g.deadline ? new Date(g.deadline + 'T00:00:00').toLocaleDateString('pt-BR') : 'Meta', icon: '🎯', href: 'calendar.html' }));

      setSearchResults(results);
    } catch(e) {
      console.error('Search error:', e);
      setSearchResults([]);
    }
  }

  return (
    <div className="topbar">
      <div className="topbar-left">
        <button className="hamburger-btn" onClick={() => setMobileOpen(prev => !prev)} aria-label="Menu">
          <span></span>
        </button>
        <a href="dashboard.html" style={{color:"var(--muted)"}}>TCCFlow</a>
        <span className="sep">›</span>
        <span className="current">{page}</span>
      </div>
      <div className="topbar-right" style={{position:"relative"}}>
        <div className="topbar-search" onClick={() => { setShowSearch(true); setShowNotif(false); }} style={{cursor:"pointer"}}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          Buscar…
          <kbd>⌘K</kbd>
        </div>
        {actions}
        <button ref={bellRef} className="topbar-btn" title="Notificações" style={{position:"relative"}} onClick={toggleNotif}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          {notifications.filter(n => !n.read).length > 0 && (
            <span style={{position:"absolute",top:6,right:6,width:7,height:7,borderRadius:"50%",background:"var(--rose)",border:"2px solid var(--paper)"}}></span>
          )}
        </button>
        <div className="av av-sm c1" style={{cursor:"pointer"}}>{userInitials}</div>
      </div>
      {showNotif && (
        <div style={{position:"fixed",inset:0,zIndex:10000}} onClick={() => setShowNotif(false)}>
          <div style={{position:"fixed",top:bellPos.top,right:bellPos.right,width:360,maxHeight:440,overflowY:"auto",background:"var(--paper)",border:"1px solid var(--line)",borderRadius:14,boxShadow:"0 10px 40px rgba(0,0,0,.2)"}} onClick={e => e.stopPropagation()}>
            <div style={{padding:"14px 16px",borderBottom:"1px solid var(--line)",fontFamily:"var(--font-display)",fontSize:"1rem",fontWeight:500,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              Notificações
              <button style={{background:"none",border:"none",cursor:"pointer",fontSize:".75rem",color:"var(--violet)"}} onClick={() => setShowNotif(false)}>✕</button>
            </div>
            <div>
              {notifLoading && <div style={{padding:20,textAlign:"center",color:"var(--muted)",fontSize:".8125rem"}}>Carregando...</div>}
              {!notifLoading && notifications.length === 0 && (
                <div style={{padding:"30px 20px",textAlign:"center"}}>
                  <div style={{fontSize:"1.5rem",marginBottom:8,opacity:.4}}>🔔</div>
                  <div style={{color:"var(--muted)",fontSize:".8125rem"}}>Nenhuma notificação</div>
                  <div style={{color:"var(--muted)",fontSize:".75rem",marginTop:4}}>Notificações de tarefas e prazos aparecerão aqui</div>
                </div>
              )}
              {!notifLoading && notifications.map(n => {
                const icon = n.type === 'overdue' ? '🔴' : n.type === 'deadline' ? '⏰' : n.type === 'new_comment' ? '💬' : n.type === 'orientador_joined' ? '👥' : '🔔';
                const label = n.title || (n.type === 'new_comment' ? 'Novo comentário' : n.type === 'orientador_joined' ? 'Orientador vinculado' : 'Notificação');
                return (
                  <div key={n.id} style={{padding:"12px 16px",borderBottom:"1px solid var(--line)",display:"flex",gap:10,alignItems:"flex-start",opacity:n.read?0.6:1,cursor:"pointer"}}
                    onClick={async () => {
                      if (typeof n.id === 'string' && n.id.startsWith('task-')) return;
                      await _supa.from('orientador_notifications').update({ read: true }).eq('id', n.id);
                      await _supa.from('notifications').update({ read: true }).eq('id', n.id);
                      loadNotifications();
                    }}>
                    <span style={{fontSize:"1rem"}}>{icon}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:".8125rem",fontWeight:n.read?400:600}}>{label}</div>
                      {n.message && <div style={{fontSize:".75rem",color:"var(--muted)",marginTop:1}}>{n.message}</div>}
                      <div style={{fontSize:".6875rem",color:"var(--muted)",marginTop:2}}>{new Date(n.created_at).toLocaleDateString('pt-BR')}</div>
                    </div>
                    {!n.read && <span style={{width:8,height:8,borderRadius:"50%",background:"var(--violet)",flexShrink:0,marginTop:4}}></span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {showSearch && (
        <div style={{position:"fixed",inset:0,zIndex:10000,display:"flex",alignItems:"flex-start",justifyContent:"center",paddingTop:"15vh"}}>
          <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.4)",backdropFilter:"blur(4px)"}} onClick={() => setShowSearch(false)}></div>
          <div style={{position:"relative",background:"var(--paper)",border:"1px solid var(--line)",borderRadius:16,boxShadow:"0 20px 60px rgba(0,0,0,.2)",width:"100%",maxWidth:560,overflow:"hidden"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,padding:"14px 18px",borderBottom:"1px solid var(--line)"}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" value={searchQuery} onChange={e => { const v = e.target.value; setSearchQuery(v); clearTimeout(searchTimerRef.current); searchTimerRef.current = setTimeout(() => handleSearch(v), 300); }} placeholder="Buscar tarefas, projetos, pessoas..." autoFocus
                style={{flex:1,border:"none",outline:"none",background:"transparent",fontSize:".9375rem",color:"var(--ink)"}}/>
              <kbd style={{fontSize:".625rem",padding:"2px 6px",borderRadius:4,border:"1px solid var(--line)",color:"var(--muted)"}}>ESC</kbd>
            </div>
            <div style={{maxHeight:380,overflowY:"auto"}}>
              {searchResults.length === 0 && searchQuery.length < 2 && (
                <div>
                  <div style={{padding:"10px 18px 6px",fontFamily:"var(--font-mono)",fontSize:".625rem",textTransform:"uppercase",letterSpacing:".08em",color:"var(--muted)"}}>Acesso rápido</div>
                  {[
                    {icon:"✓",title:"Tarefas",sub:"Ver quadro kanban",href:"tasks.html"},
                    {icon:"📊",title:"Cronograma Gantt",sub:"Ver timeline do projeto",href:"calendar.html"},
                    {icon:"📅",title:"Calendário",sub:"Ver eventos e metas",href:"calendar.html"},
                    {icon:"👥",title:"Equipe",sub:"Ver membros do projeto",href:"team.html"},
                    {icon:"🛠",title:"Ferramentas",sub:"SMART, Detector IA, Referências",href:"tools.html"},
                    {icon:"📁",title:"Projeto",sub:"Detalhes e configurações",href:"project.html"},
                  ].map((q,i)=>(
                    <a key={i} href={q.href} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 18px",textDecoration:"none",color:"inherit",transition:"background .15s"}}
                      onMouseOver={e=>e.currentTarget.style.background="var(--bg-2)"} onMouseOut={e=>e.currentTarget.style.background=""}>
                      <span style={{fontSize:"1rem",width:28,textAlign:"center"}}>{q.icon}</span>
                      <div><div style={{fontSize:".875rem",fontWeight:500}}>{q.title}</div><div style={{fontSize:".6875rem",color:"var(--muted)"}}>{q.sub}</div></div>
                      <span style={{marginLeft:"auto",fontSize:".75rem",color:"var(--muted)"}}>→</span>
                    </a>
                  ))}
                </div>
              )}
              {searchResults.length === 0 && searchQuery.length >= 2 && (
                <div style={{padding:"30px 20px",textAlign:"center",color:"var(--muted)",fontSize:".8125rem"}}>Nenhum resultado para "{searchQuery}"</div>
              )}
              {searchResults.map((r, i) => (
                <a key={i} href={r.href} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 18px",borderBottom:"1px solid var(--line)",textDecoration:"none",color:"inherit",transition:"background .15s"}}
                  onMouseOver={e => e.currentTarget.style.background="var(--bg-2)"} onMouseOut={e => e.currentTarget.style.background=""}>
                  <span style={{fontSize:"1rem",width:28,textAlign:"center"}}>{r.icon}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:".875rem",fontWeight:500}}>{r.title}</div>
                    <div style={{fontSize:".6875rem",color:"var(--muted)"}}>{r.sub}</div>
                  </div>
                  {r.badge && <span className={`tag ${r.badge.cls}`} style={{fontSize:".6rem",padding:"2px 6px"}}>{r.badge.text}</span>}
                  <span style={{marginLeft:"auto",fontSize:".625rem",fontFamily:"var(--font-mono)",color:"var(--muted)",textTransform:"uppercase"}}>{r.type}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { Sidebar, Topbar, useTCCData, getInitials, AppSplash });
