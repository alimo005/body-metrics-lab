// Theme behaviour shared by the header toggle and the drawer's Light/Dark control.
// The inline script in BaseLayout applies the stored (or system) theme before first paint,
// so there is no flash; this module only handles changes afterwards.

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';
const root = document.documentElement;
const system = matchMedia('(prefers-color-scheme: dark)');

export function currentTheme(): Theme {
  const set = root.dataset.theme;
  if (set === 'dark' || set === 'light') return set;
  return system.matches ? 'dark' : 'light';
}

function readStored(): Theme | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'dark' || stored === 'light' ? stored : null;
  } catch {
    return null; // storage blocked: the choice applies to this page only
  }
}

function sync(): void {
  const theme = currentTheme();
  const dark = theme === 'dark';
  document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]').forEach((button) => {
    button.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    button.hidden = false;
  });
  document.querySelectorAll<HTMLButtonElement>('[data-set-theme]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.setTheme === theme));
  });
}

export function setTheme(theme: Theme): void {
  root.dataset.theme = theme;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* no storage: keep the choice for this page */
  }
  sync();
}

export function initTheme(): void {
  document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]').forEach((button) => {
    button.addEventListener('click', () => setTheme(currentTheme() === 'dark' ? 'light' : 'dark'));
  });
  document.querySelectorAll<HTMLButtonElement>('[data-set-theme]').forEach((button) => {
    button.addEventListener('click', () => setTheme(button.dataset.setTheme === 'dark' ? 'dark' : 'light'));
  });
  // Follow the system while the visitor has not chosen a theme.
  system.addEventListener('change', () => {
    if (readStored()) return;
    root.dataset.theme = system.matches ? 'dark' : 'light';
    sync();
  });
  // Keep other open tabs in step.
  addEventListener('storage', (event) => {
    if (event.key !== STORAGE_KEY) return;
    const next = readStored();
    if (next) root.dataset.theme = next;
    sync();
  });
  sync();
}
