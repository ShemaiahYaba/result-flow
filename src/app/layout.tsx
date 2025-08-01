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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <GlobalProvider>
            {children}
            <NotificationSystem />
          </GlobalProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
