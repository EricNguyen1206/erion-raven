"use client";

import Link from "next/link";
import { Home, Users, Hash, Settings, Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { useSidebarActions } from "@/app/messages/action";
import { SidebarConversations } from "../molecules/SidebarConversations";
import SidebarDirectMessages from "../molecules/SidebarDirectMessages";
import NavUser from "../molecules/NavUser";
import { Input } from "../ui/input";

export function AppSidebar() {
  // Use centralized business logic from actions
  const {
    searchQuery,
    setSearchQuery,
    filteredConversations,
    filteredDirectMessages,
    isConversationsLoading,
  } = useSidebarActions();

  return (
    <aside
      className="w-[280px] flex flex-col h-full border-r z-20"
      style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
    >
      {/* Team Header */}
      <div className="h-14 flex items-center gap-3 px-4 border-b" style={{ borderColor: "var(--border)" }}>
        <Image src="/images/img2.jpeg" alt="Notify Logo" width={32} height={32} className="flex-shrink-0" />
        <h1 className="font-bold text-lg tracking-tight" style={{ color: "var(--card-foreground)" }}>
          Notify
        </h1>
      </div>

      {/* Search Section */}
      <div className="p-3 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-chat-border rounded-chat focus:border-chat-primary transition-colors"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 overflow-hidden">
        <div className="px-3 space-y-6 pb-4">
          {/* Navigation Section */}
          <div className="space-y-1">
            <h3
              className="px-3 text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: "var(--muted-foreground)" }}
            >
              Navigation
            </h3>
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:rounded-md"
              style={{
                color: "var(--muted-foreground)",
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLElement).style.backgroundColor = "var(--secondary)"
                ;(e.currentTarget as HTMLElement).style.color = "var(--card-foreground)"
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLElement).style.backgroundColor = "transparent"
                ;(e.currentTarget as HTMLElement).style.color = "var(--muted-foreground)"
              }}
            >
              <Home className="w-4 h-4" />
              <span className="text-sm font-medium">Home</span>
            </Link>
            <Link
              href="/contacts"
              className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors"
              style={{ color: "var(--muted-foreground)" }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLElement).style.backgroundColor = "var(--secondary)"
                ;(e.currentTarget as HTMLElement).style.color = "var(--card-foreground)"
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLElement).style.backgroundColor = "transparent"
                ;(e.currentTarget as HTMLElement).style.color = "var(--muted-foreground)"
              }}
            >
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">Contacts</span>
            </Link>
          </div>

          {/* Conversations Section */}
          <SidebarConversations items={filteredConversations} loading={isConversationsLoading} />

          {/* Direct Messages Section */}
          <SidebarDirectMessages items={filteredDirectMessages} loading={isConversationsLoading} />
        </div>
      </ScrollArea>

      {/* User Profile Section */}
      <div
        className="flex-shrink-0 p-3 border-t"
        style={{ backgroundColor: "var(--secondary)", borderColor: "var(--border)" }}
      >
        <NavUser />
      </div>
    </aside>
  );
}

export default AppSidebar;
