import { useScreenDimensions } from "@/hooks/useScreenDimensions";
import { useCurrentUserQuery } from "@/services/api/users";
import { useConversationData } from "@/hooks/useSidebarActions";
import { useEffect, useRef } from "react";
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
  const { chats, chatsLoading, addMessageToConversation, loadMore, hasMore, isFetchingNextPage } = useChatData(currentConversation?.id);
  const { conversationData, conversationLoading, memberCount } = useConversationDetails(currentConversation?.id);

  const { containerRef, mainRef, viewportRef, scrollToBottom, scrollToBottomOnUpdate } = useScrollBehavior({
    hasMore,
    loadMore,
    isFetching: isFetchingNextPage,
  });

  const { formData, setFormData } = useChatFormState();
  const messageSending = useMessageSending(currentConversation?.id, sessionUser, setFormData, scrollToBottom, addMessageToConversation);

  // Handle incoming WebSocket messages
  useWebSocketMessageHandler(currentConversation?.id);

  // Track the last message ID to determine when to scroll to bottom
  const lastMessageIdRef = useRef<string | null>(null);

  // Scroll effects
  useEffect(() => {
    if (chats && chats.length > 0) {
      const lastMessage = chats[chats.length - 1];

      // Check if the last message has changed (new message added or conversation switched)
      if (lastMessage.id !== lastMessageIdRef.current) {
        lastMessageIdRef.current = lastMessage.id;
        scrollToBottomOnUpdate();
      }
    }
  }, [chats, scrollToBottomOnUpdate]);

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
    isFetchingNextPage,

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
    viewportRef,
  };
};
