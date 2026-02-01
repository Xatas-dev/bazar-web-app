import {useEffect, useRef} from 'react';
import {Client} from '@stomp/stompjs';
import {useQueryClient} from '@tanstack/react-query';
import {MessageResponse, WebSocketChatEvent, ChatEventType, MessageCreatedPayload, MessageDeletedPayload} from '@/types/chat';

// Helper function to process WebSocket events (extracted for testing)
const processWebSocketEvent = (event: WebSocketChatEvent, chatId: number, queryClient: any) => {
    // Handle different event types
    if (event.type === ChatEventType.CREATED) {
        const payload = event.payload as MessageCreatedPayload;

        // Convert payload to MessageResponse format
        const newMessage: MessageResponse = {
            id: payload.id,
            chatId: event.chatId,
            userId: payload.userId,
            content: payload.content,
            createdAt: payload.createdAt
        };

        // Update React Query Cache - add new message
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
    } else if (event.type === ChatEventType.DELETED) {
        const payload = event.payload as MessageDeletedPayload;
        const deletedIds = new Set(payload.ids);

        // Update React Query Cache - remove deleted messages
        queryClient.setQueryData(['chat', chatId, 'messages'], (oldData: any) => {
            if (!oldData) return oldData;

            // Filter out deleted messages from all pages
            const newPages = oldData.pages.map((page: any) => ({
                ...page,
                content: page.content.filter((msg: MessageResponse) => !deletedIds.has(msg.id))
            }));

            return {
                ...oldData,
                pages: newPages
            };
        });
    }
};

export const useChatWebSocket = (chatId: number | undefined) => {
    const clientRef = useRef<Client | null>(null);
    const queryClient = useQueryClient();

    // Expose queryClient to window for testing (development only)
    useEffect(() => {
        if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
            (window as any).__testQueryClient = queryClient;
        }
    }, [queryClient]);

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
                        const event: WebSocketChatEvent = JSON.parse(message.body);
                        console.log('📨 WebSocket event received:', event);
                        processWebSocketEvent(event, chatId, queryClient);
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

    return { queryClient };
};

// 🧪 TEST HELPER: Simulate WebSocket events manually (development only)
// Usage in browser console:
// window.simulateWSEvent({ type: 'CREATED', chatId: 1, payload: { id: 999, userId: 'test-user', content: 'Test message', createdAt: new Date().toISOString() } })
// window.simulateWSEvent({ type: 'DELETED', chatId: 1, payload: { ids: [999] } })
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    (window as any).simulateWSEvent = (event: WebSocketChatEvent) => {
        console.log('🧪 Simulating WebSocket event:', event);
        // We need access to queryClient - this will be set by the hook
        const queryClient = (window as any).__testQueryClient;
        if (!queryClient) {
            console.error('❌ QueryClient not available. Make sure chat is open.');
            return;
        }
        processWebSocketEvent(event, event.chatId, queryClient);
    };
}
