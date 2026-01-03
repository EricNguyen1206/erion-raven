import ChatHeader from "@/components/organisms/ChatHeader";
import MessageBubble from "@/components/molecules/MessageBubble";
import MessagesSkeleton from "@/components/molecules/MessagesSkeleton";
import MessageInput from "@/components/organisms/MessageInput";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatPage } from "@/hooks/useChatPage";
import { ConnectionState } from "@/store/useSocketStore";

const ConversationPage = () => {
  const {
    sessionUser,
    currentConversation,
    conversationData,
    memberCount,
    containerRef,
    mainRef,
    chats,
    chatsLoading,
    handleSendMessage,
    isConnected,
    connectionState,
    isFetchingNextPage,
    viewportRef,
  } = useChatPage();

  return (
    <div className="w-full flex-1 min-h-0 relative flex flex-col overflow-hidden bg-background">
      <ChatHeader
        id={String(currentConversation?.id)}
        name={String(currentConversation?.name)}
        isGroup={currentConversation?.type === "group"}
        avatar={currentConversation?.avatar ?? ""}
        participantCount={memberCount}
        members={conversationData?.members as any}
        ownerId={conversationData?.ownerId as any}
        {...(sessionUser?.id !== undefined && { currentUserId: sessionUser.id })}
      />

      {/* ScrollArea with top padding to offset the fixed header (64px) */}
      <ScrollArea ref={containerRef} viewportRef={viewportRef} className="flex-1 min-h-0 pt-16 px-4">
        {chatsLoading ? (
          <MessagesSkeleton isGroup={true} />
        ) : (
          <div className="flex flex-col w-full">
            {isFetchingNextPage && (
              <div className="flex justify-center p-2">
                <span className="text-xs text-muted-foreground animate-pulse">Loading previous messages...</span>
              </div>
            )}
            {sessionUser?.id &&
              chats.map((message) => (
                <MessageBubble key={message.id} content={message.text ?? ""} variant={message.senderId === sessionUser.id ? "sent" : "received"} timestamp={message.createdAt} avatarUrl={message.senderAvatar ?? ""} avatarFallback={message.senderName?.[0]?.toUpperCase() ?? "A"} />
              ))}
            <div ref={mainRef} className="h-0" />
          </div>
        )}
      </ScrollArea>

      <MessageInput
        onSendMessage={handleSendMessage}
        isConnected={isConnected}
        disabled={connectionState === ConnectionState.ERROR}
      />
    </div>
  );
};

export default ConversationPage;
