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
    target: import.meta.env.API_GATEWAY_URL || 'http://localhost:3000',
  },
  personaApi: {
    baseUrl: '/bazar-persona/api',
    target: import.meta.env.API_GATEWAY_URL || 'http://localhost:3000',
  },
  gatewayApi: {
    baseUrl: '/api',
    target: import.meta.env.API_GATEWAY_URL || 'http://localhost:3000',
  },
  chatApi: {
    baseUrl: '/bazar-chat/api',
    target: import.meta.env.API_GATEWAY_URL || 'http://localhost:3000',
  },
  auth: {
    keycloakUrl: import.meta.env.KEYCLOAK_URL || 'http://localhost:3000/oauth2/authorization/keycloak',
  },
};

export default config;
