import {useEffect, useRef} from 'react';
import {Client} from '@stomp/stompjs';
import {useQueryClient} from '@tanstack/react-query';
import {MessageResponse} from '@/types/chat';

export const useChatWebSocket = (chatId: number | undefined) => {
    const clientRef = useRef<Client | null>(null);
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!chatId) return;

        // Use WS or WSS based on current protocol, or configure in config
        // Assuming config.chatApi.target is http(s)://...
        // We need to construct the WS URL.
        // If we are using the proxy in development:
        // Browser URL: http://localhost:5173/spaces/1
        // WebSocket URL should be: ws://localhost:5173/ws/bazar-chat/api/ws (proxied to backend)
        // The user requested a dedicated proxy for WS: /ws/bazar-chat/api/ws

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host; // localhost:5173
        const brokerURL = `${protocol}//${host}/ws/bazar-chat/api/ws`;

        const client = new Client({
            brokerURL: brokerURL,
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: () => {
                console.log('Connected to WebSocket');

                client.subscribe(`/topic/chat/${chatId}`, (message) => {
                    if (message.body) {
                        const newMessage: MessageResponse = JSON.parse(message.body);

                        // Update React Query Cache
                        queryClient.setQueryData(['chat', chatId, 'messages'], (oldData: any) => {
                            if (!oldData) return oldData;

                            // Infinite Query structure: { pages: [ { content: [...] }, ... ], pageParams: [...] }
                            // We want to add the new message to the FIRST page (newest) at the BEGINNING (since we reversed it in UI? Wait.)
                            // In UI: we flatten and reverse.
                            // Backend returns: Page 0 (Newest..Oldest).
                            // So we should prepend to Page 0.

                            const newPages = [...oldData.pages];
                            if (newPages.length > 0) {
                                const firstPage = {...newPages[0]};
                                firstPage.content = [newMessage, ...firstPage.content];
                                newPages[0] = firstPage;
                            }

                            return {
                                ...oldData,
                                pages: newPages
                            };
                        });
                    }
                });
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            },
        });

        client.activate();
        clientRef.current = client;

        return () => {
            client.deactivate();
        };
    }, [chatId, queryClient]);
};
