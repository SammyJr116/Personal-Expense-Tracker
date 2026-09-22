// Ambient declarations for values that are injected at runtime/build time.
// Covered by `include` in jsconfig.json so checkJs can type them.

interface Window {
  // Loaded dynamically by src/lib/google-signin.js (Google Identity Services).
  google?: any;
}

interface ImportMeta {
  // Vite statically injects VITE_* values at build time (import.meta.env).
  env: Record<string, string | undefined>;
}