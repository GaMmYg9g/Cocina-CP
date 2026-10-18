// =============================================================
// Utilidades de almacenamiento local (localStorage)
// =============================================================

const Storage = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (e) {
      console.warn('Storage.get error', key, e);
      return fallback;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn('Storage.set error', key, e);
      return false;
    }
  },

  remove(key) {
    try { localStorage.removeItem(key); } catch (e) {}
  }
};