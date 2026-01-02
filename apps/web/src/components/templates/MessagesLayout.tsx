/**
 * Messages Layout
 * 
 * Main layout for the messages/chat section.
 * Uses the sidebar and outlet pattern for nested routes.
 */

import { Outlet } from "react-router-dom";

import AppSidebar from "@/components/organisms/AppSidebar";
import MessageLayoutHeader from "@/components/organisms/MessageLayoutHeader";
import ScreenProvider from "@/components/templates/ScreenProvider";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

export default function MessagesLayout() {
  return (
    <ScreenProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <MessageLayoutHeader />
          <div className="flex-1 flex min-h-0 overflow-hidden bg-background">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ScreenProvider>
  );
}

