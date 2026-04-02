/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CHAT_COMPLETIONS_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
