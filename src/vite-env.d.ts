/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CHAT_COMPLETIONS_URL?: string;
  readonly VITE_CHAT_COMPLETIONS_AUTH_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
