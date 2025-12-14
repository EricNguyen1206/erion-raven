import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { QueryProvider } from "@/components/templates/QueryClientProvider";
import { ThemeProvider } from "@/components/templates/ThemeProvider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const geist = Geist({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Raven",
  description: "Developed by EricNguyen",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>

      <body className={`${geist.className} ${geistMono.className} antialiased h-screen overflow-hidden flex`}>
        <div className="flex flex-col h-screen">
          <QueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <ToastContainer position="bottom-left" theme="colored" />
              <main className="flex-1 overflow-y-auto p-6">
                {children}
              </main>
            </ThemeProvider>
          </QueryProvider>
        </div>
      </body>
    </html>
  );
}
