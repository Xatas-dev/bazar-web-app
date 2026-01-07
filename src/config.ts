// src/config.ts

interface Config {
  api: {
    baseUrl: string;
    target: string;
  };
  gatewayApi: {
    baseUrl: string;
    target: string;
  };
  personaApi: {
    baseUrl: string;
    target: string;
  };
  chatApi: {
    baseUrl: string;
    target: string;
  };
  auth: {
    keycloakUrl: string;
  };
}

const config: Config = {
  api: {
    baseUrl: '/bazar-space/api',
    target: import.meta.env.VITE_API_TARGET || 'http://localhost:3030',
  },
  personaApi: {
    baseUrl: '/bazar-persona/api',
    target: import.meta.env.VITE_API_TARGET || 'http://localhost:3030',
  },
  gatewayApi: {
    baseUrl: '/api',
    target: import.meta.env.VITE_API_TARGET || 'http://localhost:3030',
  },
  chatApi: {
    baseUrl: '/bazar-chat/api',
    target: import.meta.env.VITE_API_TARGET || 'http://localhost:3030',
  },
  auth: {
    keycloakUrl: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:3030/oauth2/authorization/keycloak',
  },
};

export default config;
