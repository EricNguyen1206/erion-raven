import { Message, useChatStore } from "@/store/useChatStore";
import { MessageDto } from "@notify/types";
import { useEffect } from "react";

// Hook for handling incoming WebSocket messages
export const useWebSocketMessageHandler = (conversationId: string | undefined) => {
  const { upsertMessageToConversation } = useChatStore();

  useEffect(() => {
    const handleChatMessage = (event: CustomEvent<MessageDto>) => {
      const chatMessage = event.detail;

      // Only process messages for the current conversation
      if (conversationId && String(chatMessage.conversationId) === String(conversationId)) {
        const message: Message = {
          id: String(chatMessage.id),
          conversationId: String(chatMessage.conversationId),
          senderId: String(chatMessage.senderId),
          ...(chatMessage.senderName !== undefined && { senderName: chatMessage.senderName }),
          ...(chatMessage.senderAvatar !== undefined && { senderAvatar: chatMessage.senderAvatar }),
          ...(chatMessage.text !== undefined && { text: chatMessage.text }),
          createdAt: chatMessage.createdAt,
          ...(chatMessage.url !== undefined && { url: chatMessage.url }),
          ...(chatMessage.fileName !== undefined && { fileName: chatMessage.fileName }),
        };

        // Add message to chat store
        upsertMessageToConversation(String(conversationId), message);
      }
    };

    // Listen for chat messages from WebSocket
    window.addEventListener("chat-message", handleChatMessage as EventListener);

    return () => {
      window.removeEventListener("chat-message", handleChatMessage as EventListener);
    };
  }, [conversationId, upsertMessageToConversation]);
};