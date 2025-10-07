// Fallback caso store.js ainda não tenha carregado
if (!window.store) {
  window.store = {
    currentUserId: null,
    load()  { try { const s = JSON.parse(localStorage.getItem('vortex-store')||'{}'); this.currentUserId = s.currentUserId || null; } catch {} },
    save()  { try { localStorage.setItem('vortex-store', JSON.stringify({ currentUserId: this.currentUserId || null })); } catch {} },
    clear() { this.currentUserId = null; this.save(); }
  };
  window.store.load();
}

// src/api.js
const API_BASE_URL = 'http://localhost:3000';

window.api = {
  async login({ identifier, password }) {
    const res = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });

    console.log('[api.login] status', res.status);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erro no login');
    }

    const user = await res.json();

    // Persistência forte
    store.currentUserId = user.id;
    store.save();
    try { localStorage.setItem('currentUserId', user.id); } catch {}

    return user;
  },

  async register({ name, email, password, ref }) {
    const res = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, ref }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erro no cadastro');
    }

    const user = await res.json();
    store.currentUserId = user.id;
    store.save();
    try { localStorage.setItem('currentUserId', user.id); } catch {}

    return user;
  },

  async me() {
    if (!store.currentUserId) {
      // fallback
      const id = localStorage.getItem('currentUserId');
      if (id) { store.currentUserId = id; store.save(); }
    }
    if (!store.currentUserId) throw new Error('Nenhum usuário logado');

    const res = await fetch(`${API_BASE_URL}/me/${store.currentUserId}`);
    if (!res.ok) throw new Error('Sessão inválida');
    return res.json();
  },

  async logout() {
    store.clear();
    try { localStorage.removeItem('currentUserId'); } catch {}
  },
};
