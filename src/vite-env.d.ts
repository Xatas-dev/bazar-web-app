/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_TARGET: string
  readonly VITE_KEYCLOAK_URL: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
