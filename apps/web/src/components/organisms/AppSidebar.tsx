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
    <Sidebar collapsible="icon" className="border-none bg-sidebar">
      {/* Team Header - Nordic minimalism: sticky at top, no border, generous spacing */}
      <SidebarHeader className="sticky top-0 z-50 h-16 flex-row items-center gap-4 px-6 bg-sidebar/95 backdrop-blur-sm transition-all duration-300 ease-out group-data-[collapsible=icon]:px-3 group-data-[collapsible=icon]:justify-center">
        <img
          src="/logo.png"
          alt="Raven Logo"
          width={28}
          height={28}
          className="w-7 h-7 min-w-7 min-h-7 rounded-md object-contain flex-shrink-0 transition-all duration-300 ease-out opacity-80 hover:opacity-100"
        />
        <h1 className="font-light text-base tracking-wide text-sidebar-foreground/90 whitespace-nowrap overflow-hidden transition-all duration-300 ease-out group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0">
          Raven
        </h1>
      </SidebarHeader>

      {/* Search Section - Uncomment when needed */}
      {/* <SearchSection searchQuery={searchQuery} setSearchQuery={setSearchQuery} /> */}

      <SidebarContent className="px-3">
        {/* Navigation Section - Subtle, spacious */}
        <SidebarGroup className="mb-8">
          <SidebarGroupLabel className="text-[11px] uppercase tracking-widest font-light text-muted-foreground/60 mb-3 px-3">
            Navigate
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Home"
                  className="h-9 rounded-lg transition-all duration-200 hover:bg-sidebar-accent/5 data-[active=true]:bg-sidebar-accent/10"
                >
                  <Link to="/" className="flex items-center gap-3">
                    <Home className="w-[18px] h-[18px] opacity-60" />
                    <span className="text-sm font-light">Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Contacts"
                  className="h-9 rounded-lg transition-all duration-200 hover:bg-sidebar-accent/5 data-[active=true]:bg-sidebar-accent/10"
                >
                  <Link to="/contacts" className="flex items-center gap-3">
                    <Users className="w-[18px] h-[18px] opacity-60" />
                    <span className="text-sm font-light">Contacts</span>
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

      {/* User Profile Section - Clean, no heavy borders, sticky at bottom */}
      <SidebarFooter className="sticky bottom-0 z-50 border-none pt-4 pb-4 px-3 mt-auto bg-sidebar/95 backdrop-blur-sm">
        <NavUser />
      </SidebarFooter>

      {/* Rail for resize/toggle on edge - Nordic minimalism: subtle, functional */}
      <SidebarRail className="sticky top-0 z-50 transition-all duration-200 hover:bg-sidebar-accent/10" />
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
      <SidebarGroup className="py-0 mb-6">
        <SidebarGroupContent className="px-6 py-3">
          {isCollapsed ? (
            // Show only search icon button when collapsed
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Search"
                  className="h-9 w-9 rounded-lg transition-all duration-200 hover:bg-sidebar-accent/5"
                >
                  <Search className="w-[18px] h-[18px] opacity-50" />
                  <span className="sr-only">Search</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          ) : (
            // Show full search input when expanded - Nordic minimalist style
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 w-[16px] h-[16px]" />
              <SidebarInput
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-9 pr-3 bg-transparent border-none rounded-lg text-sm font-light placeholder:text-muted-foreground/40 focus-visible:bg-sidebar-accent/5 focus-visible:ring-0 focus-visible:ring-offset-0 transition-all duration-200"
              />
            </div>
          )}
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
}

export default AppSidebar;
