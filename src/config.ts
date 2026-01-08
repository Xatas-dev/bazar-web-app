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
    target: 'http://api.bazar.local',
  },
  personaApi: {
    baseUrl: '/bazar-persona/api',
    target: 'http://api.bazar.local',
  },
  gatewayApi: {
    baseUrl: '/api',
    target: 'http://api.bazar.local',
  },
  chatApi: {
    baseUrl: '/bazar-chat/api',
    target: 'http://api.bazar.local',
  },
  auth: {
    keycloakUrl: 'http://auth.bazar.local/oauth2/authorization/keycloak',
  },
};

export default config;
