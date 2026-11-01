/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WAQI_TOKEN?: string;
  readonly VITE_OPENAQ_API_KEY?: string;
  readonly VITE_API_URL?: string;
  readonly VITE_ENABLE_DEMO_MODE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
