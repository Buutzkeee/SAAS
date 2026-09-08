// ===================================================
// AUTH.JS — Sistema de Autenticação
// Sistema de Gestão em Saúde — SaaS Municipal
// ===================================================

const AUTH_KEY = 'saude_session';
const AUTH_USERS = [
  {
    id: 'USR001',
    login: 'admin',
    senha: 'admin',
    nome: 'Hudson Carvalho',
    cargo: 'Administrador',
    initials: 'HC',
    avatar_color: 'linear-gradient(135deg,#00b4d8,#7c3aed)',
    role: 'admin',
    unidade: 'Todas as Unidades',
    email: 'umbuzeirocpl@gmail.com'
  },
  {
    id: 'USR002',
    login: 'medico',
    senha: 'medico123',
    nome: 'Dr. Carlos Menezes',
    cargo: 'Médico',
    initials: 'CM',
    avatar_color: 'linear-gradient(135deg,#06d6a0,#0077b6)',
    role: 'medico',
    unidade: 'UBSF Centro',
    email: 'carlos.menezes@saude.pb.gov.br'
  },
  {
    id: 'USR003',
    login: 'enfermeira',
    senha: 'enf123',
    nome: 'Enf. Juliana Barbosa',
    cargo: 'Enfermeira',
    initials: 'JB',
    avatar_color: 'linear-gradient(135deg,#f59e0b,#ef4444)',
    role: 'enfermeiro',
    unidade: 'UBSF Centro',
    email: 'juliana.barbosa@saude.pb.gov.br'
  }
];

const Auth = {
  getSession() {
    const raw = sessionStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  isAuthenticated() {
    return !!this.getSession();
  },
  login(login, senha) {
    const user = AUTH_USERS.find(u => u.login === login && u.senha === senha);
    if (user) {
      const session = {
        ...user,
        loginTime: new Date().toISOString(),
        token: btoa(`${user.id}:${Date.now()}`)
      };
      delete session.senha;
      sessionStorage.setItem(AUTH_KEY, JSON.stringify(session));
      return { success: true, user: session };
    }
    return { success: false, error: 'Usuário ou senha inválidos.' };
  },
  logout() {
    sessionStorage.removeItem(AUTH_KEY);
    showLoginScreen();
  },
  getCurrentUser() {
    return this.getSession();
  }
};

// ===================================================
// TELA DE LOGIN
// ===================================================
function showLoginScreen() {
  document.getElementById('app').innerHTML = `
    <div class="login-bg" id="login-screen">
      <!-- Partículas animadas de fundo -->
      <div class="login-particles">
        ${Array.from({length: 20}).map((_, i) => `<div class="particle" style="--delay:${i * 0.3}s;--x:${Math.random()*100}%;--y:${Math.random()*100}%;--size:${2 + Math.random()*4}px"></div>`).join('')}
      </div>

      <!-- Bolhas glassmorphism fundo -->
      <div class="login-orb orb1"></div>
      <div class="login-orb orb2"></div>
      <div class="login-orb orb3"></div>

      <div class="login-container">
        <!-- Left Panel — Brand -->
        <div class="login-brand">
          <div class="login-brand-inner">
            <div class="login-logo">
              <div class="login-logo-icon">🏥</div>
            </div>
            <h1 class="login-brand-title">SaúdeSaaS</h1>
            <p class="login-brand-sub">Sistema de Gestão em Saúde Municipal</p>
            <div class="login-brand-divider"></div>
            <p class="login-brand-desc">
              Plataforma completa para gestão de saúde pública, com agendamento, 
              prontuário eletrônico, vacinação e muito mais.
            </p>
            <div class="login-modules">
              ${[
                ['📅','Agendamento Online'],
                ['💉','Controle de Vacinação'],
                ['📋','Histórico Clínico'],
                ['🔬','Exames e Resultados'],
                ['💬','Chat com UBSF'],
                ['🏘️','Visitas Domiciliares'],
              ].map(([icon, label]) => `
                <div class="login-module-item">
                  <span>${icon}</span> ${label}
                </div>
              `).join('')}
            </div>
            <div class="login-prefeitura">
              <div class="login-brasao">🏛️</div>
              <div>
                <div style="font-weight:600;font-size:13px;color:var(--text-primary)">Prefeitura Municipal de Umbuzeiro</div>
                <div style="font-size:11px;color:var(--text-muted)">Umbuzeiro — PB · (83) 3395-1478</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Panel — Form -->
        <div class="login-form-panel">
          <div class="login-form-card">
            <div class="login-form-header">
              <div class="login-welcome">Bem-vindo de volta</div>
              <h2 class="login-form-title">Acesse o Sistema</h2>
              <p class="login-form-sub">Utilize suas credenciais institucionais</p>
            </div>

            <form class="login-form" onsubmit="handleLogin(event)" id="login-form" autocomplete="off" novalidate>
              <div class="login-field" id="field-login">
                <label class="login-label">Usuário</label>
                <div class="login-input-wrap">
                  <span class="login-input-icon">👤</span>
                  <input
                    type="text"
                    id="login-input"
                    class="login-input"
                    placeholder="Digite seu usuário"
                    autocomplete="username"
                    required
                  >
                </div>
              </div>

              <div class="login-field" id="field-senha">
                <label class="login-label">Senha</label>
                <div class="login-input-wrap">
                  <span class="login-input-icon">🔒</span>
                  <input
                    type="password"
                    id="senha-input"
                    class="login-input"
                    placeholder="Digite sua senha"
                    autocomplete="current-password"
                    required
                  >
                  <button type="button" class="login-eye-btn" onclick="toggleSenha()" id="eye-btn" title="Mostrar/ocultar senha">
                    <span id="eye-icon">👁️</span>
                  </button>
                </div>
              </div>

              <div class="login-remember">
                <label class="login-checkbox-label">
                  <input type="checkbox" id="remember-check" class="login-checkbox">
                  <span class="login-checkbox-custom"></span>
                  Manter conectado
                </label>
                <button type="button" class="login-forgot" onclick="showToastLogin('Entre em contato com o administrador: umbuzeirocpl@gmail.com','info')">
                  Esqueci a senha
                </button>
              </div>

              <div id="login-error" class="login-error" style="display:none"></div>

              <button type="submit" class="btn-login" id="btn-login">
                <span id="btn-login-text">Entrar no Sistema</span>
                <span id="btn-login-loader" style="display:none">
                  <span class="login-spinner"></span> Autenticando...
                </span>
                <span class="btn-login-arrow">→</span>
              </button>

              <div class="login-hint" style="margin-top:14px;">
                <div style="font-size:11px;color:var(--text-muted);margin-bottom:8px;text-align:center;">Clique para preencher credenciais:</div>
                <div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap;">
                  <button type="button" class="btn btn-secondary btn-xs" onclick="document.getElementById('login-input').value='admin';document.getElementById('senha-input').value='admin';">👑 Admin</button>
                  <button type="button" class="btn btn-secondary btn-xs" onclick="document.getElementById('login-input').value='medico';document.getElementById('senha-input').value='medico123';">🩺 Médico</button>
                  <button type="button" class="btn btn-secondary btn-xs" onclick="document.getElementById('login-input').value='enfermeira';document.getElementById('senha-input').value='enf123';">💊 Enfermeira</button>
                </div>
              </div>
            </form>

            <div class="login-footer">
              <div class="login-footer-item">
                <span>🔒</span> Conexão Segura SSL
              </div>
              <div class="login-footer-item">
                <span>⚖️</span> Lei 14.133/21
              </div>
              <div class="login-footer-item">
                <span>🏛️</span> LGPD
              </div>
            </div>
          </div>

          <div class="login-version">
            SaúdeSaaS v2.0 · Setembro/2026 · Prefeitura de Umbuzeiro/PB
          </div>
        </div>
      </div>
    </div>
  `;

  // Focus no campo de login
  requestAnimationFrame(() => {
    const el = document.getElementById('login-input');
    if (el) el.focus();
  });
}

function handleLogin(e) {
  e.preventDefault();
  const login = document.getElementById('login-input').value.trim();
  const senha = document.getElementById('senha-input').value;
  const errEl = document.getElementById('login-error');
  const btnText = document.getElementById('btn-login-text');
  const btnLoader = document.getElementById('btn-login-loader');
  const btnArrow = document.querySelector('.btn-login-arrow');

  // Limpar erros
  errEl.style.display = 'none';
  errEl.textContent = '';
  document.getElementById('field-login').classList.remove('login-field-error');
  document.getElementById('field-senha').classList.remove('login-field-error');

  if (!login) {
    document.getElementById('field-login').classList.add('login-field-error');
    errEl.textContent = 'Por favor, informe o usuário.';
    errEl.style.display = 'flex';
    document.getElementById('login-input').focus();
    return;
  }
  if (!senha) {
    document.getElementById('field-senha').classList.add('login-field-error');
    errEl.textContent = 'Por favor, informe a senha.';
    errEl.style.display = 'flex';
    document.getElementById('senha-input').focus();
    return;
  }

  // Loading state
  btnText.style.display = 'none';
  btnLoader.style.display = 'inline-flex';
  if (btnArrow) btnArrow.style.display = 'none';
  document.getElementById('btn-login').disabled = true;

  // Simula latência de rede (auth real conectaria à API)
  setTimeout(() => {
    const result = Auth.login(login, senha);

    btnText.style.display = '';
    btnLoader.style.display = 'none';
    if (btnArrow) btnArrow.style.display = '';
    document.getElementById('btn-login').disabled = false;

    if (result.success) {
      // Sucesso — animação de saída
      const screen = document.getElementById('login-screen');
      if (screen) {
        screen.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        screen.style.opacity = '0';
        screen.style.transform = 'scale(1.03)';
        setTimeout(() => initApp(), 420);
      } else {
        initApp();
      }
    } else {
      document.getElementById('field-login').classList.add('login-field-error');
      document.getElementById('field-senha').classList.add('login-field-error');
      errEl.innerHTML = `<span>⚠️</span> ${result.error}`;
      errEl.style.display = 'flex';
      // Shake animation
      const card = document.querySelector('.login-form-card');
      if (card) {
        card.classList.add('login-shake');
        setTimeout(() => card.classList.remove('login-shake'), 600);
      }
      document.getElementById('senha-input').value = '';
      document.getElementById('senha-input').focus();
    }
  }, 900);
}

function toggleSenha() {
  const input = document.getElementById('senha-input');
  const icon = document.getElementById('eye-icon');
  if (input.type === 'password') {
    input.type = 'text';
    icon.textContent = '🙈';
  } else {
    input.type = 'password';
    icon.textContent = '👁️';
  }
}

function showToastLogin(msg, type) {
  // Mini toast para tela de login (sem container padrão)
  let c = document.getElementById('login-toast-container');
  if (!c) {
    c = document.createElement('div');
    c.id = 'login-toast-container';
    c.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:8px;';
    document.body.appendChild(c);
  }
  const toast = document.createElement('div');
  toast.style.cssText = `
    background:var(--bg-card);border:1px solid var(--border);
    color:var(--text-primary);padding:12px 16px;border-radius:12px;
    font-size:13px;max-width:320px;box-shadow:var(--shadow-lg);
    animation:fadeInUp 0.3s ease;
  `;
  toast.textContent = msg;
  c.appendChild(toast);
  setTimeout(() => {
    toast.style.transition = 'opacity 0.3s';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
