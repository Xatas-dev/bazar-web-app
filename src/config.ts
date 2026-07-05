// src/config.ts

interface Config {
    api: {
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
    storageApi: {
        baseUrl: string;
        targetLocal: string;
    };
    authorizationApi: {
        baseUrl: string;
        targetLocal: string;
    };
    chatWs: {
      baseUrl: string;
      targetLocal: string;
    };
    auth: {
        keycloakUrl: string;
        targetLocal: string;
    };
}

const config: Config = {
    chatWs: {
        baseUrl: "/api/ws/bazar-chat/ws",
        targetLocal: "/ws/bazar-chat/ws"
    },
    api: {
        baseUrl: '/api/bazar-space',
        targetLocal: '/bazar-space' // локальный json-server через vite proxy
    },
    personaApi: {
        baseUrl: '/api/bazar-persona',
        targetLocal: '/bazar-persona' // локальный json-server через vite proxy
    },
    chatApi: {
        baseUrl: '/api/bazar-chat/v1',
        targetLocal: '/bazar-chat/v1' // локальный json-server через vite proxy
    },
    storageApi: {
        baseUrl: '/api/bazar-storage',
        targetLocal: '/bazar-storage'
    },
    authorizationApi: {
        baseUrl: '/api/bazar-authorization',
        targetLocal: '/bazar-authorization'
    },
    auth: {
        keycloakUrl: '/api/oauth2/authorization/keycloak',
        targetLocal: '/oauth2/authorization/keycloak' // локальный mock
    }

};

export default config;
