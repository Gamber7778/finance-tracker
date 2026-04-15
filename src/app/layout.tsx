import type { Metadata, Viewport } from "next";
import "./globals.css";
import { FinanceProvider } from "@/lib/context";
import { AuthProvider } from "@/lib/authContext";
import { ToastProvider } from "@/lib/toast";
import AppShell from "@/components/AppShell";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";

export const metadata: Metadata = {
  title: "FinTracker — Особисті фінанси",
  description: "Простий трекер особистих фінансів",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FinTracker',
  },
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#09090b',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <body className="antialiased bg-zinc-950 text-white">
        <ServiceWorkerRegistration />
        <ToastProvider>
          <AuthProvider>
            <FinanceProvider>
              <AppShell>
                {children}
              </AppShell>
            </FinanceProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
