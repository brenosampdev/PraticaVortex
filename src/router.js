// src/router.js

// ---------------- Rotas ----------------
const ROUTES = {
  '/login':     'src/views/login.view.html',
  '/register':  'src/views/register.view.html',
  '/dashboard': 'src/views/dashboard.view.html',
};

// ---------------- Utils ----------------
function getRouteFromHash() {
  const hash = window.location.hash || '#/login';
  const [path] = hash.replace(/^#/, '').split('?');
  return path || '/login';
}
function getHashQuery() {
  const hash = window.location.hash || '';
  const qs = hash.split('?')[1] || '';
  return new URLSearchParams(qs);
}
function isAuthenticated() {
  if (!window.store) return false;
  if (!store.currentUserId && typeof store.load === 'function') {
    try { store.load(); } catch {}
  }
  if (!store.currentUserId) {
    try {
      const id = localStorage.getItem('currentUserId');
      if (id) { store.currentUserId = id; store.save(); }
    } catch {}
  }
  return !!store.currentUserId;
}

// Header dinâmico (Login/Cadastre-se ⇄ Logout)
function updateActiveNav(routePath) {
  const nav = document.querySelector('.navigation-pages-link');
  if (!nav) return;

  nav.innerHTML = '';

  // Mostra Logout apenas quando já estamos no dashboard (sessão validada)
  if (routePath === '/dashboard' && isAuthenticated()) {
    const logoutLink = document.createElement('a');
    logoutLink.href = '#';
    logoutLink.textContent = 'Logout';
    logoutLink.addEventListener('click', async (ev) => {
      ev.preventDefault();
      try { await api.logout(); } catch {}
      try { localStorage.removeItem('currentUserId'); } catch {}
      location.hash = '#/login';
    });
    nav.appendChild(logoutLink);
    return;
  }

  const login = document.createElement('a');
  login.href = '#/login';
  login.textContent = 'Login';
  if (routePath === '/login') login.classList.add('is-active');

  const register = document.createElement('a');
  register.href = '#/register';
  register.textContent = 'Cadastre-se';
  if (routePath === '/register') register.classList.add('is-active');

  nav.appendChild(login);
  nav.appendChild(register);
}

// ---------------- Render helpers ----------------
async function injectView(routePath) {
  const app = document.getElementById('app');
  if (!app) return;
  const viewPath = ROUTES[routePath] || ROUTES['/login'];
  const res = await fetch(viewPath, { cache: 'no-cache' });
  const html = await res.text();
  app.innerHTML = html;
  attachViewBehaviors(routePath);
  updateActiveNav(routePath);
}

async function swapTo(routePath) {
  await injectView(routePath); // render imediato
  const target = `#${routePath}`;
  if (location.hash !== target) {
    location.hash = target;
    try { window.dispatchEvent(new HashChangeEvent('hashchange')); } catch {}
  }
}

// ---------------- Core (com validação de sessão) ----------------
async function loadViewIntoApp(routePath) {
  // Se pediram dashboard — precisa validar sessão no backend
  if (routePath === '/dashboard') {
    if (!isAuthenticated()) return swapTo('/login');
    try {
      await api.me(); // valida sessão
    } catch {
      try { await api.logout(); } catch {}
      try { localStorage.removeItem('currentUserId'); } catch {}
      return swapTo('/login');
    }
  }

  // Se pediram login/register mas temos id salvo, valida antes de redirecionar
  if ((routePath === '/login' || routePath === '/register') && isAuthenticated()) {
    try {
      await api.me();            // sessão realmente existe
      return swapTo('/dashboard');
    } catch {
      try { await api.logout(); } catch {}
      try { localStorage.removeItem('currentUserId'); } catch {}
      // permanece na rota pedida (login/register)
    }
  }

  await injectView(routePath);
}

// ---------------- Behaviors por view ----------------
function attachViewBehaviors(routePath) {
  // toggle senha (login/register)
  document.querySelectorAll('.eye-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.closest('.password-field')?.querySelector('input[type="password"], input[type="text"]');
      if (!input) return;
      input.type = (input.type === 'password') ? 'text' : 'password';
      btn.classList.toggle('active', input.type === 'text');
      btn.setAttribute('aria-pressed', String(input.type === 'text'));
    });
  });

  // ----- LOGIN -----
  if (routePath === '/login') {
    const form = document.getElementById('login-form') || document.querySelector('main form') || document.querySelector('form');
    if (form && !form.dataset.bound) {
      form.dataset.bound = '1';
      form.setAttribute('action', '#');

      form.addEventListener('submit', async (ev) => {
        ev.preventDefault();
        const fd = new FormData(form);
        const identifier = (fd.get('identifier') || fd.get('email') || fd.get('name') || '').toString().trim();
        const password   = (fd.get('password')   || fd.get('pass')  || '').toString();
        const passErr = document.getElementById('pass-error') || document.querySelector('#pass-error, .error, .error-text');
        if (passErr) passErr.textContent = '';
        if (!identifier || !password) {
          if (passErr) passErr.textContent = 'Preencha usuário e senha.'; return;
        }

        try {
          const user = await api.login({ identifier, password });
          if (user?.id) {
            store.currentUserId = user.id;
            store.save();
            try { localStorage.setItem('currentUserId', user.id); } catch {}
          }
          await swapTo('/dashboard');
        } catch (e) {
          if (passErr) passErr.textContent = e.message || 'Login inválido.';
          else alert(e.message || 'Login inválido.');
        }
      });
    }
  }

  // ----- REGISTER -----
  if (routePath === '/register') {
    const params = getHashQuery();
    const ref = params.get('ref') || '';
    const refInput = document.getElementById('ref');
    if (refInput) refInput.value = ref;

    const form = document.getElementById('register-form') || document.querySelector('main form') || document.querySelector('form');
    if (form && !form.dataset.bound) {
      form.dataset.bound = '1';
      form.setAttribute('action', '#');

      form.addEventListener('submit', async (ev) => {
        ev.preventDefault();
        const fd = new FormData(form);
        const payload = {
          name:     (fd.get('name')     || '').toString().trim(),
          email:    (fd.get('email')    || '').toString().trim(),
          password: (fd.get('password') || fd.get('pass') || '').toString(),
          ref:      (fd.get('ref')      || '').toString().trim(),
        };

        const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email);
        const passOk  = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(payload.password);
        const emailErr = document.getElementById('email-error');
        const passErr  = document.getElementById('pass-error');
        if (emailErr) emailErr.textContent = '';
        if (passErr)  passErr.textContent  = '';
        if (!emailOk) { if (emailErr) emailErr.textContent = 'Informe um e-mail válido.'; return; }
        if (!passOk)  { if (passErr)  passErr.textContent  = 'Mín. 8 caracteres com ao menos 1 letra e 1 número.'; return; }

        try {
          const user = await api.register(payload);
          if (user?.id) {
            store.currentUserId = user.id;
            store.save();
            try { localStorage.setItem('currentUserId', user.id); } catch {}
          }
          await swapTo('/dashboard');
        } catch (e) {
          alert(e.message || 'Falha no cadastro');
        }
      });
    }
  }

  // ----- DASHBOARD -----
  if (routePath === '/dashboard') {
    (async () => {
      try {
        const me = await api.me();

        const nameEl   = document.getElementById('display-name');
        const emailEl  = document.getElementById('display-email');
        const userSpan = document.getElementById('username');
        const pointsEl = document.getElementById('points-value');
        const linkEl   = document.getElementById('referral-link');

        const referralUrl = `${location.origin}${location.pathname}#/register?ref=${me.referral_code || me.referralCode}`;

        if (nameEl)   nameEl.textContent = me.name;
        if (userSpan) userSpan.textContent = (me.name || '').split(' ')[0] || me.name;
        if (emailEl)  emailEl.textContent = me.email;
        if (pointsEl) pointsEl.textContent = String(me.points ?? 0);
        if (linkEl)   linkEl.textContent = referralUrl;

        const copyBtn = document.getElementById('copy-ref-link');
        if (copyBtn && linkEl) {
          const copy = async () => {
            try {
              await navigator.clipboard.writeText(linkEl.textContent.trim());
              copyBtn.classList.add('copied');
              setTimeout(() => copyBtn.classList.remove('copied'), 800);
            } catch {}
          };
          copyBtn.addEventListener('click', copy);
          copyBtn.addEventListener('keydown', (ev) => {
            if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); copy(); }
          });
        }

        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
          logoutBtn.addEventListener('click', async () => {
            await api.logout();
            try { localStorage.removeItem('currentUserId'); } catch {}
            await swapTo('/login');
          });
        }
      } catch (e) {
        try { await api.logout(); } catch {}
        try { localStorage.removeItem('currentUserId'); } catch {}
        await swapTo('/login');
      }
    })();
  }
}

// ---------------- Listeners globais ----------------
window.addEventListener('hashchange', () => loadViewIntoApp(getRouteFromHash()));
window.addEventListener('load', async () => {
  if (!location.hash) location.hash = '#/login';
  await loadViewIntoApp(getRouteFromHash());
});
