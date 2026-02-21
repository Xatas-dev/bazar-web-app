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
    gatewayApi: {
        baseUrl: '/api',
        targetLocal: '/' // локальный json-server через vite proxy
    },
    chatApi: {
        baseUrl: '/api/bazar-chat',
        targetLocal: '/bazar-chat' // локальный json-server через vite proxy
    },
    auth: {
        keycloakUrl: '/api/oauth2/authorization/keycloak',
        targetLocal: '/oauth2/authorization/keycloak' // локальный mock
    }

};

export default config;
