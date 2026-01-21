import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import Breadcrumb from "@/components/Breadcrumb";
import ChatPanel from "@/components/ChatPanel";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TMH AI Content Engine",
  description: "AI-powered content generation and management platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen bg-gray-50">
          <Sidebar />
          <MobileNav />
          <main className="flex-1 md:ml-60 overflow-y-auto">
            <div className="p-8 pt-20 md:pt-8">
              <Breadcrumb />
              {children}
            </div>
          </main>
          <ChatPanel />
        </div>
      </body>
    </html>
  );
}