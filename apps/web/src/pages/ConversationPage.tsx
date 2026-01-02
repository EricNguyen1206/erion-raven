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

      {/* Connection status indicator - Nordic minimalism: subtle and calm
      {connectionState === ConnectionState.CONNECTING && (
        <div className="px-8 py-3 bg-accent/5 border-b border-accent/10">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-accent/60 animate-pulse" />
            <span className="text-xs font-light text-foreground/60 tracking-wide">Connecting...</span>
          </div>
        </div>
      )}

      {connectionState === ConnectionState.ERROR && (
        <div className="px-8 py-3 bg-destructive/5 border-b border-destructive/10">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-destructive/60" />
            <span className="text-xs font-light text-destructive/80 tracking-wide">Connection issue</span>
          </div>
        </div>
      )} */}

      {/* ScrollArea with top padding to offset the fixed header (64px) */}
      <ScrollArea ref={containerRef} className="flex-1 min-h-0 pt-16 px-4">
        {chatsLoading ? (
          <MessagesSkeleton isGroup={true} />
        ) : (
          <div className="flex flex-col w-full">
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
