import { Message } from "@/store/useChatStore";
import { useSocketStore } from "@/store/useSocketStore";
import { useCallback, useEffect } from "react";
import { toast } from "react-toastify";

// Hook for managing message sending (simplified - no typing indicators)
export const useMessageSending = (
  conversationId: string | undefined,
  sessionUser: any,
  setFormData: (data: { message: string }) => void,
  scrollToBottom: () => void,
  addMessageToConversation: (conversationId: string, message: Message) => void
) => {
  const { sendMessage, isConnected, error } = useSocketStore();

  // Handle sending messages with optimistic update
  const handleSendMessage = useCallback(
    async (message: string, url?: string, fileName?: string) => {
      if (sessionUser?.id && (message !== "" || url) && conversationId && isConnected()) {
        try {
          // 1. Optimistic update - show message immediately
          const tempId = `temp-${Date.now()}`;
          const optimisticMessage: Message = {
            id: tempId,
            conversationId,
            senderId: String(sessionUser.id),
            senderName: sessionUser.username,
            senderAvatar: sessionUser.avatar,
            text: message,
            url,
            fileName,
            createdAt: new Date().toISOString(),
          };
          addMessageToConversation(conversationId, optimisticMessage);

          // 2. Send message via WebSocket (server will broadcast it back)
          sendMessage(conversationId, message, url, fileName);
          setFormData({ message: "" });
          scrollToBottom();
        } catch (error) {
          toast.error("Failed to send message");
        }
      } else if (!isConnected()) {
        toast.warn("Not connected to chat server");
      }
    },
    [sessionUser, conversationId, isConnected, sendMessage, setFormData, scrollToBottom, addMessageToConversation]
  );

  // Show error notifications
  useEffect(() => {
    if (error) {
      toast.error(`WebSocket Error: ${error}`);
    }
  }, [error]);

  return {
    handleSendMessage,
    isConnected: isConnected(),
    error,
  };
};