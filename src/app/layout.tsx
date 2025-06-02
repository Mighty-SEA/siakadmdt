import "./globals.css";
import { UIProvider } from "@/lib/ui-context";
import AppLayout from "@/components/layout/AppLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MDT BILAL BIN RABBAH",
  description: "Pembelajaran Al-Qur'an, Ibadah, dan Ilmu Dasar",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
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
