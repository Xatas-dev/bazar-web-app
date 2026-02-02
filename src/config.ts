// src/config.ts

interface Config {
  api: {
    baseUrl: string;
    targetLocal: string;
  };
  gatewayApi: {
    baseUrl: string;
    targetLocal: string;
  };
  personaApi: {
    baseUrl: string;
    targetLocal: string;
  };
  chatApi: {
    baseUrl: string;
    targetLocal: string;
  };
  auth: {
    keycloakUrl: string;
    targetLocal: string;
  };
}

const config: Config = {
  api: {
    baseUrl: '/api/bazar-space/api',
    targetLocal: '/bazar-space/api' // локальный json-server через vite proxy
  },
  personaApi: {
    baseUrl: '/api/bazar-persona/api',
    targetLocal: '/bazar-persona/api' // локальный json-server через vite proxy
  },
  gatewayApi: {
    baseUrl: '/api/api',
    targetLocal: '/api' // локальный json-server через vite proxy
  },
  chatApi: {
    baseUrl: '/api/bazar-chat/api',
    targetLocal: '/bazar-chat/api' // локальный json-server через vite proxy
  },
  auth: {
    keycloakUrl: '/api/oauth2/authorization/keycloak',
      targetLocal: '/oauth2/authorization/keycloak' // локальный mock
  },
};

export default config;
