import type { Metadata, Viewport } from "next";
import "./globals.css";
import { FinanceProvider } from "@/lib/context";
import { AuthProvider } from "@/lib/authContext";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "FinTracker — Особисті фінанси",
  description: "Простий трекер особистих фінансів",
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FinTracker',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <body className="antialiased bg-zinc-950 text-white">
        <AuthProvider>
          <FinanceProvider>
            <AppShell>
              {children}
            </AppShell>
          </FinanceProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
