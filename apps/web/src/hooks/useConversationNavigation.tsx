import { useConversationStore } from "@/store/useConversationStore";
import { ConnectionState, useSocketStore } from "@/store/useSocketStore";
import { useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

// Hook for managing conversation navigation and validation
export const useConversationNavigation = (isConversationsLoading: boolean) => {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { groupConversations, directConversations, currentConversation, setCurrentConversation } = useConversationStore();
  const { connectionState, joinConversation, leaveConversation } = useSocketStore();
  const conversationId = params.id ?? undefined;

  // Memoize conversation lookup to avoid recomputation and noisy effects
  const resolvedConversation = useMemo(() => {
    if (!conversationId) return undefined;
    return groupConversations.find((conv) => conv.id === conversationId) || directConversations.find((conv) => conv.id === conversationId);
  }, [conversationId, groupConversations, directConversations]);

  // Avoid redundant setCurrentConversation calls across renders/StrictMode
  const lastSetConversationIdRef = useRef<string | undefined>(undefined);
  const lastRedirectedForIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!conversationId) return;

    // Check if conversations have been loaded into the store
    const hasConversationsData = groupConversations.length > 0 || directConversations.length > 0;

    // Don't redirect while conversations are still loading or haven't been populated yet
    if (!resolvedConversation) {
      // Only redirect if loading is done AND we have data (meaning conversation truly doesn't exist)
      // If arrays are empty, wait for data to load before making a decision
      if (!isConversationsLoading && hasConversationsData) {
        if (lastRedirectedForIdRef.current !== conversationId) {
          lastRedirectedForIdRef.current = conversationId;
          navigate("/messages", { replace: true });
        }
      }
      return;
    }

    // Only update store when conversation truly changes
    if (lastSetConversationIdRef.current !== resolvedConversation.id) {
      lastSetConversationIdRef.current = resolvedConversation.id;
      setCurrentConversation(resolvedConversation);
    }
  }, [conversationId, resolvedConversation, navigate, setCurrentConversation, isConversationsLoading, groupConversations.length, directConversations.length]);

  // Serialized leave -> ack -> join
  const joinedConversationIdRef = useRef<string | undefined>(undefined);
  const pendingJoinConversationIdRef = useRef<string | undefined>(undefined);
  const awaitingLeaveAckRef = useRef<boolean>(false);

  useEffect(() => {
    if (connectionState !== ConnectionState.CONNECTED) return;

    const nextId = currentConversation?.id;
    const prevId = joinedConversationIdRef.current;

    // If there is no change, do nothing
    if (prevId === nextId) return;

    // If switching conversations, send a single leave for the previous conversation
    if (prevId && prevId !== nextId && !awaitingLeaveAckRef.current) {
      try {
        awaitingLeaveAckRef.current = true;
        pendingJoinConversationIdRef.current = nextId;
        leaveConversation(String(prevId));
      } catch { }
      return; // wait for ack
    }

    // If there was no previous joined conversation (first join)
    if (!prevId && nextId && !awaitingLeaveAckRef.current) {
      try {
        joinConversation(String(nextId));
        joinedConversationIdRef.current = nextId;
      } catch { }
    }
  }, [connectionState, currentConversation?.id, joinConversation, leaveConversation]);

  // Listen for leave ack, then perform the pending join exactly once
  useEffect(() => {
    const handleLeaveAck = (e: Event) => {
      const detail = (e as CustomEvent).detail as { conversationId: string; userId?: string };
      const prevId = joinedConversationIdRef.current;
      if (!awaitingLeaveAckRef.current || !prevId) return;
      if (detail?.conversationId !== prevId) return;

      awaitingLeaveAckRef.current = false;
      joinedConversationIdRef.current = undefined;

      const nextId = pendingJoinConversationIdRef.current;
      pendingJoinConversationIdRef.current = undefined;
      if (connectionState === ConnectionState.CONNECTED && nextId) {
        try {
          joinConversation(String(nextId));
          joinedConversationIdRef.current = nextId;
        } catch { }
      }
    };

    window.addEventListener("ws-conversation-leave-ack", handleLeaveAck as EventListener);
    return () => window.removeEventListener("ws-conversation-leave-ack", handleLeaveAck as EventListener);
  }, [connectionState, joinConversation]);

  return {
    currentConversation,
    connectionState,
  };
};