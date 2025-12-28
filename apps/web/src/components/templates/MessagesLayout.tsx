/**
 * Messages Layout
 * 
 * Main layout for the messages/chat section.
 * Uses the sidebar and outlet pattern for nested routes.
 */

import { Outlet } from "react-router-dom";

import AppSidebar from "@/components/organisms/AppSidebar";
import ScreenProvider from "@/components/templates/ScreenProvider";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function MessagesLayout() {
  return (
    <ScreenProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="shrink-0 h-8 flex items-center gap-2 border-b border-border/30">
            <div className="h-full flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4 bg-border"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="/messages" className="font-normal">
                      Conversation
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="font-medium">
                      #conversation-id
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex-1 flex min-h-0 overflow-hidden bg-background">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ScreenProvider>
  );
}
