import { Link } from "react-router-dom";
import { Home, Users, Search } from "lucide-react";
import { useSidebarActions } from "@/hooks/useSidebarActions";
import { SidebarConversations } from "../molecules/SidebarConversations";
import SidebarDirectMessages from "../molecules/SidebarDirectMessages";
import NavUser from "../molecules/NavUser";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";

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
    <Sidebar collapsible="icon" className="border-r border-border">
      {/* Team Header */}
      <SidebarHeader className="h-12 flex-row items-center gap-3 px-2 border-b border-border transition-all duration-200 ease-linear group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
        <img
          src="/logo.png"
          alt="Raven Logo"
          width={32}
          height={32}
          className="w-8 h-8 min-w-8 min-h-8 rounded object-contain flex-shrink-0 transition-transform duration-200 bg-background dark:bg-primary"
        />
        <h1 className="font-bold text-lg tracking-tight text-sidebar-foreground whitespace-nowrap overflow-hidden transition-all duration-200 ease-linear group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0">
          Raven
        </h1>
      </SidebarHeader>

      {/* Search Section */}
      {/* <SearchSection searchQuery={searchQuery} setSearchQuery={setSearchQuery} /> */}

      <SidebarContent>
        {/* Navigation Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Home">
                  <Link to="/">
                    <Home className="w-4 h-4" />
                    <span>Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Contacts">
                  <Link to="/contacts">
                    <Users className="w-4 h-4" />
                    <span>Contacts</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Conversations Section */}
        <SidebarConversations
          items={filteredConversations}
          loading={isConversationsLoading}
        />

        {/* Direct Messages Section */}
        <SidebarDirectMessages
          items={filteredDirectMessages}
          loading={isConversationsLoading}
        />
      </SidebarContent>

      {/* User Profile Section */}
      <SidebarFooter className="border-t border-border bg-secondary">
        <NavUser />
      </SidebarFooter>

      {/* Rail for resize/toggle on edge */}
      <SidebarRail />
    </Sidebar>
  );
}

// Separate component to access useSidebar context
function SearchSection({
  searchQuery,
  setSearchQuery,
}: {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <SidebarContent className="h-min">
      <SidebarGroup className="py-0">
        <SidebarGroupContent className="p-2 border-b border-border">
          {isCollapsed ? (
            // Show only search icon button when collapsed
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Search">
                  <Search className="w-4 h-4" />
                  <span>Search</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          ) : (
            // Show full search input when expanded
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <SidebarInput
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background border-border"
              />
            </div>
          )}
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
}

export default AppSidebar;
