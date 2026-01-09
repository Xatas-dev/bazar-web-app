// src/config.ts

interface Config {
  api: {
    baseUrl: string;
  };
  gatewayApi: {
    baseUrl: string;
  };
  personaApi: {
    baseUrl: string;
  };
  chatApi: {
    baseUrl: string;
  };
  auth: {
    keycloakUrl: string;
  };
}

const config: Config = {
  api: {
    baseUrl: '/api/bazar-space/api'
  },
  personaApi: {
    baseUrl: '/api/bazar-persona/api'
  },
  gatewayApi: {
    baseUrl: '/api/api'
  },
  chatApi: {
    baseUrl: '/api/bazar-chat/api'
  },
  auth: {
    keycloakUrl: '/oauth2/authorization/keycloak',
  },
};

export default config;
