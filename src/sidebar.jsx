// Shared Sidebar + AppShell component
const { useState, useEffect, useRef } = React;

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
          setProject(proj);

          let members = [];
          let memberIds = proj?.members;

          // Normalize members array (handle string format)
          if (typeof memberIds === 'string') {
            try { memberIds = JSON.parse(memberIds); } catch { memberIds = null; }
          }
          if (!Array.isArray(memberIds)) memberIds = null;

          if (memberIds && memberIds.length > 0) {
            // Fetch all users and filter locally (mais confiável que .in())
            try {
              const { data: allUsers, error: err } = await _supa.from('users').select('id, name, email, photo_url, role');
              if (err) {
                // Fallback sem photo_url
                const { data: allUsers2 } = await _supa.from('users').select('id, name, email, role');
                members = (allUsers2 || []).filter(u => memberIds.includes(u.id));
              } else {
                members = (allUsers || []).filter(u => memberIds.includes(u.id));
              }
            } catch (e) {
              console.error('Erro ao buscar usuários:', e);
            }
          }
          setTeam(members);
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
  const planLabel = subscription?.plan === 'pro' ? 'Plano Pro' : 'Plano Gratuito';
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
        {BOTTOM_ITEMS.map(item => (
          <a key={item.id} href={item.href}
            className={`nav-item ${active === item.id ? "active" : ""}`}>
            <span className="icon">{item.icon}</span>
            {item.label}
          </a>
        ))}
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
      <div className="topbar-right">
        <div className="topbar-search">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          Buscar…
          <kbd>⌘K</kbd>
        </div>
        {actions}
        <button className="topbar-btn" title="Notificações" style={{position:"relative"}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span style={{position:"absolute",top:6,right:6,width:7,height:7,borderRadius:"50%",background:"var(--rose)",border:"2px solid var(--paper)"}}></span>
        </button>
        <div className="av av-sm c1" style={{cursor:"pointer"}}>{userInitials}</div>
      </div>
    </div>
  );
}

Object.assign(window, { Sidebar, Topbar, useTCCData, getInitials });
