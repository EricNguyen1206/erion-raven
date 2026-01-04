import { useEffect } from 'react';
import { useConversationStore } from '@/store/useConversationStore';


export const useGlobalWebSocket = () => {
  const { handleNewMessage } = useConversationStore();

  useEffect(() => {
    // Listen for custom event dispatched by socket client or directly attach if we had access to socket here.
    // In this architecture, it seems events are dispatched to window or handled via specific hooks.
    // Looking at useWebSocketMessageHandler, it listens to "chat-message" on window.
    // Let's Assume the socket client dispatches "chat-message" or similar to window, 
    // OR we need to ensure the socket client DOES dispatch it.

    // Waiting, let's look at `useWebSocketMessageHandler`. It listens for "chat-message".
    // Where is "chat-message" dispatched? usually in a centralized socket listener.
    // Let's create a listener that assumes the same pattern or define a better one.

    // Investigating previous files showed `useWebSocketMessageHandler` listens to `window`.
    // I need to confirm WHERE the socket events are converted to window events.
    // If they aren't, I should probably use the socket instance directly.

    // Assuming for now we follow the existing pattern found in `useWebSocketMessageHandler`.

    const onNewMessage = (event: CustomEvent) => {
      handleNewMessage(event.detail);
    };

    window.addEventListener('chat-message', onNewMessage as EventListener);

    return () => {
      window.removeEventListener('chat-message', onNewMessage as EventListener);
    };
  }, [handleNewMessage]);
};
