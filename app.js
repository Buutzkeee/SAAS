// ===================================================
// APP.JS — SPA Router + Utilitários
// Sistema de Gestão em Saúde — SaaS Municipal
// Prefeitura Municipal de Umbuzeiro/PB
// ===================================================

// ---- Utilitários Globais ----
function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const [y,m,d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  } catch { return dateStr; }
}

function formatTime(isoStr) {
  if (!isoStr) return '';
  try {
    const d = new Date(isoStr);
    return d.toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' });
  } catch { return ''; }
}

function calcIdade(dateStr) {
  if (!dateStr) return 0;
  const hoje = new Date();
  const nasc = new Date(dateStr);
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return Math.max(0, idade);
}

function getBadge(status, label) {
  const l = label || status;
  const map = {
    'confirmado':'confirmado','Confirmado':'confirmado',
    'aguardando':'aguardando','Aguardando':'aguardando',
    'cancelado':'cancelado','Cancelado':'cancelado',
    'disponivel':'disponivel','Resultado Disponível':'disponivel',
    'realizada':'realizada','Realizada':'realizada',
    'agendada':'agendada','Agendada':'agendada',
    'andamento':'andamento','Em andamento':'andamento',
    'encerrada':'encerrada','Encerrada':'encerrada',
  };
  const cls = map[status] || 'andamento';
  return `<span class="badge ${cls}">${l}</span>`;
}

function showToast(msg, type='info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const icons = { success:'✅', error:'❌', info:'ℹ️', warning:'⚠️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span style="font-size:18px">${icons[type]||'ℹ️'}</span><span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.transition = 'all 0.3s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ---- Modal genérico ----
let _modalCallback = null;
function showModal(title, body, onConfirm) {
  _modalCallback = onConfirm;
  let m = document.getElementById('generic-modal');
  if (!m) {
    m = document.createElement('div');
    m.id = 'generic-modal';
    m.className = 'modal-overlay';
    m.onclick = (e) => { if(e.target===m) closeModal(); };
    document.body.appendChild(m);
  }
  m.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3>${title}</h3>
        <div class="modal-close" onclick="closeModal()">✕</div>
      </div>
      <div class="modal-body">${body}</div>
      ${onConfirm ? `<div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
        <button class="btn btn-primary" onclick="_modalCallback&&_modalCallback()">Confirmar</button>
      </div>` : ''}
    </div>
  `;
  m.style.display = 'flex';
}
function closeModal() {
  const m = document.getElementById('generic-modal');
  if (m) m.style.display = 'none';
}

// ---- Tab switching ----
function switchTab(btn, tabId) {
  const parent = btn.closest('.page-content') || document;
  parent.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  parent.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  const panel = document.getElementById(tabId);
  if (panel) panel.classList.add('active');
}

// ---- Navigation ----
const MODULES = {
  dashboard:     { module: () => Dashboard,     label: 'Dashboard',             icon: '🏠' },
  agendamento:   { module: () => Agendamento,   label: 'Agendamento',           icon: '📅' },
  vacinacao:     { module: () => Vacinacao,      label: 'Vacinação',             icon: '💉' },
  historico:     { module: () => Historico,      label: 'Histórico Clínico',     icon: '📋' },
  exames:        { module: () => Exames,         label: 'Exames',                icon: '🔬' },
  procedimentos: { module: () => Procedimentos,  label: 'Procedimentos',         icon: '🩺' },
  /* Procedimentos module is defined in modules/exames.js */
  chat:          { module: () => Chat,           label: 'Chat UBSF',             icon: '💬' },
  visitas:       { module: () => Visitas,        label: 'Visitas Domiciliares',  icon: '🏘️' },
  pacientes:     { module: () => Pacientes,      label: 'Pacientes',             icon: '👥' },
  profissionais: { module: () => Profissionais,  label: 'Profissionais',         icon: '👨‍⚕️' },
};

let currentPage = 'dashboard';

function navigate(page, params) {
  if (!MODULES[page]) return;
  currentPage = page;
  window.location.hash = page;

  // Update sidebar
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });

  // Update topbar title
  const titleEl = document.getElementById('topbar-title');
  if (titleEl) {
    const mod = MODULES[page];
    titleEl.textContent = `${mod.icon} ${mod.label}`;
  }

  // Render module
  const content = document.getElementById('page-content');
  if (!content) return;

  const mod = MODULES[page].module();
  content.innerHTML = mod.render(params);

  // After render hook
  if (mod.afterRender) {
    requestAnimationFrame(() => mod.afterRender());
  }

  // Handle params
  if (params && page === 'historico' && params.pacId) {
    setTimeout(() => {
      const sel = document.querySelector('#prontuario-container');
      if (sel) Historico.loadPaciente(params.pacId);
    }, 100);
  }
}

// ---- App Initialization (pós-login) ----
function initApp() {
  const user = Auth.getCurrentUser();
  if (!user) {
    showLoginScreen();
    return;
  }

  initSeedData();

  document.getElementById('app').innerHTML = `
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-logo">
        <div class="logo-icon">🏥</div>
        <div class="logo-text">
          <h1>SaúdeSaaS</h1>
          <p>Gestão Municipal em Saúde</p>
        </div>
      </div>
      <nav class="sidebar-nav">
        <div class="sidebar-section-title">Principal</div>
        <button class="nav-item active" data-page="dashboard" onclick="navigate('dashboard')">
          <span class="nav-icon">🏠</span> Dashboard
        </button>
        <button class="nav-item" data-page="pacientes" onclick="navigate('pacientes')">
          <span class="nav-icon">👥</span> Pacientes
        </button>
        <button class="nav-item" data-page="profissionais" onclick="navigate('profissionais')">
          <span class="nav-icon">👨‍⚕️</span> Profissionais
        </button>

        <div class="sidebar-section-title">Atendimento</div>
        <button class="nav-item" data-page="agendamento" onclick="navigate('agendamento')">
          <span class="nav-icon">📅</span> Agendamento
        </button>
        <button class="nav-item" data-page="historico" onclick="navigate('historico')">
          <span class="nav-icon">📋</span> Histórico Clínico
        </button>
        <button class="nav-item" data-page="exames" onclick="navigate('exames')">
          <span class="nav-icon">🔬</span> Exames
        </button>
        <button class="nav-item" data-page="procedimentos" onclick="navigate('procedimentos')">
          <span class="nav-icon">🩺</span> Procedimentos
        </button>

        <div class="sidebar-section-title">Saúde Pública</div>
        <button class="nav-item" data-page="vacinacao" onclick="navigate('vacinacao')">
          <span class="nav-icon">💉</span> Vacinação
        </button>
        <button class="nav-item" data-page="visitas" onclick="navigate('visitas')">
          <span class="nav-icon">🏘️</span> Visitas Domiciliares
        </button>
        <button class="nav-item" data-page="chat" onclick="navigate('chat')">
          <span class="nav-icon">💬</span> Chat UBSF
          <span class="nav-badge" id="chat-badge">2</span>
        </button>
      </nav>
      <div class="sidebar-footer">
        <div class="user-pill" onclick="showUserMenu()">
          <div class="user-avatar" style="background:${user.avatar_color || 'linear-gradient(135deg,#00b4d8,#7c3aed)'}">${user.initials || user.nome.slice(0,2).toUpperCase()}</div>
          <div class="user-info">
            <p>${user.nome}</p>
            <span>${user.cargo}</span>
          </div>
          <span style="margin-left:auto;color:var(--text-muted);font-size:12px;">⌄</span>
        </div>
        <div id="user-menu" class="user-menu" style="display:none">
          <div class="user-menu-item" onclick="showUserProfile()">
            <span>👤</span> Meu Perfil
          </div>
          <div class="user-menu-item" onclick="resetData()">
            <span>🔄</span> Resetar Dados Demo
          </div>
          <div class="user-menu-divider"></div>
          <div class="user-menu-item danger" onclick="confirmLogout()">
            <span>🚪</span> Sair do Sistema
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <header class="topbar">
        <div class="topbar-title" id="topbar-title">🏠 Dashboard</div>
        <div class="topbar-search">
          <span class="search-icon">🔍</span>
          <input type="text" placeholder="Buscar paciente, exame..." oninput="globalSearch(this.value)">
        </div>
        <div class="topbar-actions">
          <div class="btn-icon" onclick="showToast('Sem novas notificações','info')" title="Notificações">
            🔔<div class="notif-dot"></div>
          </div>
          <div class="btn-icon" onclick="confirmLogout()" title="Sair do sistema" style="font-size:14px">
            🚪
          </div>
          <div class="topbar-user-chip" onclick="showUserProfile()">
            <div class="topbar-avatar" style="background:${user.avatar_color || 'linear-gradient(135deg,#00b4d8,#7c3aed)'}">${user.initials || user.nome.slice(0,2).toUpperCase()}</div>
            <span>${user.nome.split(' ')[0]}</span>
          </div>
        </div>
      </header>
      <div class="page-content" id="page-content">
        <!-- Module content renders here -->
      </div>
    </main>

    <!-- Toast Container -->
    <div id="toast-container"></div>
  `;

  // Fechar user menu ao clicar fora
  document.addEventListener('click', (e) => {
    const menu = document.getElementById('user-menu');
    const pill = document.querySelector('.user-pill');
    if (menu && pill && !pill.contains(e.target)) {
      menu.style.display = 'none';
    }
  });

  // Navigate to initial page
  const hash = window.location.hash.replace('#','');
  navigate(hash && MODULES[hash] ? hash : 'dashboard');

  // Update chat badge
  updateChatBadge();
}

// ---- User Menu ----
function showUserMenu() {
  const menu = document.getElementById('user-menu');
  if (!menu) return;
  menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
}

function showUserProfile() {
  const user = Auth.getCurrentUser();
  if (!user) return;
  const menu = document.getElementById('user-menu');
  if (menu) menu.style.display = 'none';
  showModal('👤 Meu Perfil', `
    <div class="detail-grid">
      <div style="grid-column:1/-1;display:flex;align-items:center;gap:16px;padding:16px;background:var(--bg-card2);border-radius:var(--radius-md);margin-bottom:8px">
        <div style="width:56px;height:56px;border-radius:50%;background:${user.avatar_color || 'linear-gradient(135deg,#00b4d8,#7c3aed)'};display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700;color:#fff;flex-shrink:0">${user.initials}</div>
        <div>
          <div style="font-size:18px;font-weight:700;color:var(--text-primary)">${user.nome}</div>
          <div style="font-size:13px;color:var(--primary)">${user.cargo}</div>
        </div>
      </div>
      <div class="detail-item"><span class="detail-label">Login</span><span class="detail-value">${user.login}</span></div>
      <div class="detail-item"><span class="detail-label">Função</span><span class="detail-value">${user.role}</span></div>
      <div class="detail-item"><span class="detail-label">Unidade</span><span class="detail-value">${user.unidade}</span></div>
      <div class="detail-item"><span class="detail-label">E-mail</span><span class="detail-value">${user.email || '—'}</span></div>
      <div class="detail-item"><span class="detail-label">Login em</span><span class="detail-value">${user.loginTime ? new Date(user.loginTime).toLocaleString('pt-BR') : '—'}</span></div>
    </div>
  `);
}

function confirmLogout() {
  const menu = document.getElementById('user-menu');
  if (menu) menu.style.display = 'none';
  showModal('🚪 Sair do Sistema', `
    <div style="text-align:center;padding:16px 0">
      <div style="font-size:48px;margin-bottom:12px">🏥</div>
      <p style="color:var(--text-primary);font-size:15px;margin-bottom:8px">Deseja realmente sair?</p>
      <p style="color:var(--text-muted);font-size:13px">Você será redirecionado para a tela de login.</p>
    </div>
  `, () => {
    closeModal();
    setTimeout(() => Auth.logout(), 150);
  });
}

function updateChatBadge() {
  const unread = getData('mensagens').filter(m=>!m.lida).length;
  const badge = document.getElementById('chat-badge');
  if (badge) {
    badge.textContent = unread;
    badge.style.display = unread > 0 ? 'inline-block' : 'none';
  }
}

function globalSearch(q) {
  if (!q || q.length < 2) return;
  const pacientes = getData('pacientes').filter(p =>
    p.nome.toLowerCase().includes(q.toLowerCase()) || p.cpf.includes(q)
  );
  if (pacientes.length === 1) {
    navigate('historico');
    setTimeout(() => Historico.loadPaciente(pacientes[0].id), 200);
  }
}

function resetData() {
  const menu = document.getElementById('user-menu');
  if (menu) menu.style.display = 'none';
  if (confirm('Resetar todos os dados para o estado inicial de demonstração?')) {
    Object.keys(localStorage).filter(k=>k.startsWith('saude_')).forEach(k=>localStorage.removeItem(k));
    initSeedData();
    navigate(currentPage);
    showToast('Dados resetados para o estado demo!', 'info');
  }
}

// Handle hash navigation
window.addEventListener('hashchange', () => {
  const hash = window.location.hash.replace('#','');
  if (hash && MODULES[hash] && hash !== currentPage) navigate(hash);
});

// ---- Bootstrap ----
document.addEventListener('DOMContentLoaded', () => {
  if (Auth.isAuthenticated()) {
    initApp();
  } else {
    showLoginScreen();
  }
});
