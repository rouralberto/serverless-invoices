import { defineStore } from 'pinia';

// index.html applies the saved (or OS) colour mode before the app loads.
const root = document.documentElement;

export const useThemesStore = defineStore('themes', {
  state: () => ({
    theme: root.getAttribute('data-bs-theme') || 'light',
  }),
  actions: {
    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', this.theme);
      root.setAttribute('data-bs-theme', this.theme);
    },
  },
});

// Invoices always print in light mode.
window.addEventListener('beforeprint', () => root.setAttribute('data-bs-theme', 'light'));
window.addEventListener('afterprint', () => root.setAttribute('data-bs-theme', useThemesStore().theme));
