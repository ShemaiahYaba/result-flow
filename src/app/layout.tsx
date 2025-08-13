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

import { getServerSession, serializeSessionForClient } from "@/utils/auth/ssr-session";

export const dynamic = 'force-dynamic';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const serverSession = await getServerSession();
  const ssrSessionData = serializeSessionForClient(serverSession);

  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <GlobalProvider ssrSessionData={ssrSessionData}>
            {children}
            <NotificationSystem />
          </GlobalProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
