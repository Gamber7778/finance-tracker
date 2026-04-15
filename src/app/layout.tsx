import type { Metadata } from "next";
import "./globals.css";
import { FinanceProvider } from "@/lib/context";
import { AuthProvider } from "@/lib/authContext";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "FinTracker — Особисті фінанси",
  description: "Простий трекер особистих фінансів",
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
