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
    target: import.meta.env.VITE_API_GATEWAY_URL,
  },
  personaApi: {
    baseUrl: '/bazar-persona/api',
    target: import.meta.env.VITE_API_GATEWAY_URL,
  },
  gatewayApi: {
    baseUrl: '/api',
    target: import.meta.env.VITE_API_GATEWAY_URL,
  },
  chatApi: {
    baseUrl: '/bazar-chat/api',
    target: import.meta.env.VITE_API_GATEWAY_URL,
  },
  auth: {
    keycloakUrl: import.meta.env.VITE_KEYCLOAK_URL,
  },
};

export default config;
