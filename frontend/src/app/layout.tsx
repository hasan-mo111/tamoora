import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TickerBanner from "@/components/layout/TickerBanner";
import AppSplashLoader from "@/components/layout/AppSplashLoader";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeLanguageProvider } from "@/contexts/ThemeLanguageContext";

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700", "800"],
  variable: "--font-tajawal",
});

export const metadata: Metadata = {
  title: "طامورة | منصة الاستثمار التشاركي",
  description: "شارك بفكرتك وكن جزءاً من مستقبل الاستثمار مع طامورة",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
      { url: "/logo-ar.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${tajawal.variable} font-sans antialiased bg-gray-50 dark:bg-slate-900 dark:text-slate-100 transition-colors duration-200`}>
        <ThemeLanguageProvider>
          <AuthProvider>
            <AppSplashLoader />
            <TickerBanner />
            <Navbar />
            <main className="min-h-screen">
              {children}
            </main>
            <Footer />
          </AuthProvider>
        </ThemeLanguageProvider>
      </body>
    </html>
  );
}
