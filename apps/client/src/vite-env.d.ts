/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Backend API URL */
  readonly VITE_API_URL: string;

  /** Application name displayed in UI */
  readonly VITE_APP_NAME: string;

  /** Environment mode (development, staging, production) */
  readonly VITE_ENV: 'development' | 'staging' | 'production';

  readonly VITE_SUPABASE_URL: string;

  /** Supabase Anonymous Key */
  readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
