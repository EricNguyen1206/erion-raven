import { useScreenDimensions } from "@/hooks/useScreenDimensions";
import { useCurrentUserQuery } from "@/services/api/users";
import { useConversationData } from "@/hooks/useSidebarActions";
import { useEffect } from "react";
import { useConversationNavigation } from "./useConversationNavigation";
import { useWebSocketMessageHandler } from "./useWebSocketMessageHandler";
import { useChatData } from "./useChatData";
import { useMessageSending } from "./useMessageSending";
import { useChatFormState } from "./useChatFormState";
import { useScrollBehavior } from "./useScrollBehavior";
import { useConversationDetails } from "./useConversationDetails";

// Main hook that combines all other hooks
export const useChatPage = () => {
  const { data: sessionUser } = useCurrentUserQuery();

  // Import useConversationData from useSidebarActions to track loading state
  const { isConversationsLoading } = useConversationData();

  const { screenHeight, isOverFlow, updateOverflow } = useScreenDimensions(720);
  const { currentConversation, connectionState } = useConversationNavigation(isConversationsLoading);
  const { chats, chatsLoading, addMessageToConversation } = useChatData(currentConversation?.id);
  const { conversationData, conversationLoading, memberCount } = useConversationDetails(currentConversation?.id);
  const { containerRef, mainRef, scrollToBottom, scrollToBottomOnUpdate } = useScrollBehavior();
  const { formData, setFormData } = useChatFormState();
  const messageSending = useMessageSending(currentConversation?.id, sessionUser, setFormData, scrollToBottom, addMessageToConversation);

  // Handle incoming WebSocket messages
  useWebSocketMessageHandler(currentConversation?.id);

  // Scroll effects
  useEffect(() => {
    if (chats !== undefined && chats?.length) {
      scrollToBottom();
    }
  }, [chats?.length, scrollToBottom]);

  useEffect(() => {
    scrollToBottomOnUpdate();
  }, [chats, scrollToBottomOnUpdate]);

  useEffect(() => {
    scrollToBottomOnUpdate();
  }, [chatsLoading, scrollToBottomOnUpdate]);

  return {
    // User data
    sessionUser,

    // Conversation data
    currentConversation,
    conversationData,
    conversationLoading,
    memberCount,

    // Chat data
    chats,
    chatsLoading,

    // WebSocket state
    connectionState,

    // Message sending
    ...messageSending,

    // Form state
    formData,
    setFormData,

    // Screen dimensions
    screenHeight,
    isOverFlow,
    updateOverflow,

    // Refs
    containerRef,
    mainRef,
  };
};
