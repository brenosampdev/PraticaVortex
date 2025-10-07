// src/store.js
(function () {
  const KEY = 'vortex-store';

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}'); }
    catch { return {}; }
  }
  function write(obj) {
    try { localStorage.setItem(KEY, JSON.stringify(obj)); } catch {}
  }

  // cria a global
  window.store = {
    currentUserId: null,

    load() {
      const s = read();
      this.currentUserId = s.currentUserId || null;
    },

    save() {
      write({ currentUserId: this.currentUserId || null });
    },

    clear() {
      this.currentUserId = null;
      this.save();
    }
  };

  // restaura sessão no carregamento
  window.store.load();
})();
