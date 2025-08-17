import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GlobalProvider } from "../contexts/GlobalContext";
import { AuthProvider } from "../providers/AuthProvider";
import { QueryProvider } from "../providers/QueryProvider";
import { ErrorBoundary } from "../utils/ErrorHandlerExample";
import NotificationSystem from "../components/ui/NotificationSystem";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ResultFlow - University Result Management System",
  description: "A comprehensive result management system for universities",
};

export const dynamic = 'force-dynamic';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <QueryProvider>
            <GlobalProvider>
              <AuthProvider>
                {children}
                <NotificationSystem />
              </AuthProvider>
            </GlobalProvider>
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
