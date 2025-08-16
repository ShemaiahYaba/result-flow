import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GlobalProvider } from "../contexts/GlobalContext";
import { ErrorBoundary } from "../utils/ErrorHandlerExample";
import NotificationSystem from "../components/ui/NotificationSystem";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ResultFlow - University Result Management System",
  description: "A comprehensive result management system for universities",
};

import { createServerSupabase } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerSupabase();
  const { data: { session } } = await supabase.auth.getSession();

  // You can pass session, user, or null as needed
  const supabaseSessionData = session || null;

  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <GlobalProvider supabaseSessionData={supabaseSessionData}>
            {children}
            <NotificationSystem />
          </GlobalProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
