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
    targetLocal: '/mock/api/bazar-space/api' // локальный mock для разработки пофиксить потом
  },
  personaApi: {
    baseUrl: '/api/bazar-persona/api',
    targetLocal: '/mock/api/bazar-space/api' // локальный mock для разработки пофиксить потом
  },
  gatewayApi: {
    baseUrl: '/api/api',
    targetLocal: '/mock/api/bazar-space/api' // локальный mock для разработки пофиксить потом
  },
  chatApi: {
    baseUrl: '/api/bazar-chat/api',
    targetLocal: '/mock/api/bazar-space/api' // локальный mock для разработки пофиксить потом
  },
  auth: {
    keycloakUrl: '/api/oauth2/authorization/keycloak',
      targetLocal: '/mock/api/bazar-space/api' // локальный mock для разработки пофиксить потом
  },
};

export default config;
