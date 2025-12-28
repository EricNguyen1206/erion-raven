import { useConversationQuery } from "@/services/api/conversations";
import { useMemo } from "react";

// Hook for getting conversation details including member count
export const useConversationDetails = (conversationId: string | undefined) => {
  const { data: conversationData, isLoading: conversationLoading } = useConversationQuery(conversationId, {
    enabled: Boolean(conversationId),
  });

  const memberCount = useMemo(() => {
    if (!conversationData?.members) return 0;
    return conversationData.members.length;
  }, [conversationData?.members]);

  return {
    conversationData,
    conversationLoading,
    memberCount,
  };
};