/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
  // Auth de demonstração (modo local, sem Supabase). VITE_* é público — não é
  // segredo real; a auth de produção é o Supabase Auth.
  readonly VITE_ADMIN_PASSWORD?: string
  readonly VITE_ADMIN_LEGACY_PASSWORD?: string
  readonly VITE_DASH_PASSWORD?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
