import { useState } from "react";
import { Users, Video, MoreHorizontal, Eye, Trash2, LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import ViewMembersDialog from "./ViewMembersDialog";
import { useLeaveConversationMutation, useDeleteConversationMutation } from "@/services/api/conversations";
import { useNavigate } from "react-router-dom";
import { useConversationStore } from "@/store/useConversationStore";
import { useSocketStore } from "@/store/useSocketStore";
import { toast } from "react-toastify";

interface ChatHeaderProps {
  id: string;
  name: string;
  avatar: string;
  isGroup: boolean;
  participantCount?: number;
  isOnline?: boolean;
  members?: Array<{
    id?: string;
    username?: string;
    email?: string;
    avatar?: string;
  }>;
  ownerId?: string;
  currentUserId?: string;
}

export default function ChatHeader(chat: ChatHeaderProps) {
  const [isViewMembersOpen, setIsViewMembersOpen] = useState(false);
  const navigate = useNavigate();
  const { removeConversation } = useConversationStore();
  const { leaveConversation: leaveConversationFromSocket } = useSocketStore();

  const isOwner = chat.currentUserId === chat.ownerId;

  const leaveConversationMutation = useLeaveConversationMutation({
    onSuccess: () => {
      // Remove conversation from store
      const conversationType = chat.isGroup ? "group" : "direct";
      removeConversation(chat.id, conversationType);

      // Leave conversation from WebSocket
      try {
        leaveConversationFromSocket(chat.id);
      } catch (error) {
        // Error handled silently
      }

      // Show success message
      toast.success("Successfully left the conversation");

      // Redirect to messages page
      navigate("/messages");
    },
    onError: () => {
      toast.error("Failed to leave conversation. Please try again.");
    },
  });

  const deleteConversationMutation = useDeleteConversationMutation({
    onSuccess: () => {
      // Remove conversation from store
      const conversationType = chat.isGroup ? "group" : "direct";
      removeConversation(chat.id, conversationType);

      // Leave conversation from WebSocket (cleanup)
      try {
        leaveConversationFromSocket(chat.id);
      } catch (error) {
        // Error handled silently
      }

      // Show success message
      toast.success("Conversation deleted successfully");

      // Redirect to messages page
      navigate("/messages");
    },
    onError: () => {
      toast.error("Failed to delete conversation. Please try again.");
    },
  });

  const handleViewMembers = () => {
    setIsViewMembersOpen(true);
  };

  const handleDeleteConversation = () => {
    const conversationName = chat.name;
    const isGroup = chat.isGroup;

    const confirmMessage = isGroup
      ? `Are you sure you want to delete the group conversation "#${conversationName}"? This action cannot be undone and all members will lose access to this conversation.`
      : `Are you sure you want to delete the direct message with "${conversationName}"? This action cannot be undone.`;

    if (confirm(confirmMessage)) {
      deleteConversationMutation.mutate(chat.id);
    }
  };

  const handleLeaveConversation = () => {
    if (confirm("Are you sure you want to leave this conversation?")) {
      leaveConversationMutation.mutate(chat.id);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between px-8 py-5 bg-background border-b border-border/30">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-auto p-0 hover:bg-transparent focus:bg-transparent">
              <div className="flex items-center gap-3 cursor-pointer hover:bg-accent/5 rounded-lg px-3 py-2 transition-all duration-200">
                <div>
                  <h2 className="font-light text-base text-foreground tracking-wide">{chat.isGroup ? `#${chat.name}` : chat.name}</h2>
                  {chat.isGroup ? (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground/60 mt-0.5">
                      <Users className="w-3 h-3 opacity-50" />
                      <span className="font-light">{chat.participantCount} members</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs mt-0.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${chat.isOnline ? "bg-accent/70" : "bg-muted-foreground/30"}`} />
                      <span className="font-light text-muted-foreground/60">{chat.isOnline ? "Online" : "Offline"}</span>
                    </div>
                  )}
                </div>
                <MoreHorizontal className="w-4 h-4 text-muted-foreground/40 ml-2" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 rounded-xl border-border/50 shadow-lg">
            <DropdownMenuItem onClick={handleViewMembers} className="rounded-lg py-2.5 gap-3 cursor-pointer">
              <Eye className="w-[16px] h-[16px] opacity-50" />
              <span className="font-light text-sm">View members</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-border/30" />

            {isOwner ? (
              <DropdownMenuItem
                onClick={handleDeleteConversation}
                className="rounded-lg py-2.5 gap-3 cursor-pointer text-destructive/80 focus:text-destructive hover:bg-destructive/5"
                disabled={deleteConversationMutation.isPending}
              >
                <Trash2 className="w-[16px] h-[16px]" />
                <span className="font-light text-sm">{deleteConversationMutation.isPending ? "Deleting..." : "Delete conversation"}</span>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={handleLeaveConversation}
                className="rounded-lg py-2.5 gap-3 cursor-pointer text-accent/80 focus:text-accent hover:bg-accent/5"
                disabled={leaveConversationMutation.isPending}
              >
                <LogOut className="w-[16px] h-[16px]" />
                <span className="font-light text-sm">{leaveConversationMutation.isPending ? "Leaving..." : "Leave conversation"}</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-lg hover:bg-accent/5 transition-all duration-200 cursor-not-allowed">
                  <Video className="w-[18px] h-[18px] text-muted-foreground/40" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="rounded-lg border-border/50 bg-background shadow-lg">
                <p className="text-xs font-light">Upcoming feature</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* View Members Dialog */}
      <ViewMembersDialog
        isOpen={isViewMembersOpen}
        onClose={() => setIsViewMembersOpen(false)}
        members={chat.members || []}
        channelName={chat.name}
      />
    </>
  );
}
