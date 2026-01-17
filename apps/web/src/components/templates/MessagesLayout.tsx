/**
 * Messages Layout
 * 
 * Main layout for the messages/chat section.
 * Uses the sidebar and outlet pattern for nested routes.
 */

import { Outlet } from "react-router-dom";

import AppSidebar from "@/components/organisms/AppSidebar";
import BottomTabBar from "@/components/organisms/BottomTabBar";
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
          <div className="flex-1 flex min-h-0 overflow-hidden bg-background pb-16 md:pb-0 layout-transition">
            <Outlet />
          </div>
        </SidebarInset>
        <BottomTabBar />
      </SidebarProvider>
    </ScreenProvider>
  );
}
