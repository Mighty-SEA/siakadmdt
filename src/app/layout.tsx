import "./globals.css";
import { UIProvider } from "@/lib/ui-context";
import AppLayout from "@/components/layout/AppLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SIAKAD MDT BILAL",
  description: "Sistem Informasi Akademik MDT BILAL",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="antialiased">
        <UIProvider>
          <AppLayout>
            {children}
          </AppLayout>
        </UIProvider>
      </body>
    </html>
  );
}
