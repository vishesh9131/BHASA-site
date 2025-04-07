import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "../globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/providers/theme-provider";
import { WebLLMProvider } from "@/providers/web-llm-provider";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Suspense } from "react";
import AdFlash from '@/components/AdFlash';
import CreditsModal from '@/components/CreditsModal';

const metainfo = {
  name: "Bhasa",
  title: "Bhasa-chat",
  description: "Chat with web-llm models in the browser",
  url: "https://chattyui.com",
  icons: {
    icon: "/favicon-32x32.png",
  },
  image: "https://chattyui.com/metaimg.jpg",
};

export const metadata: Metadata = {
  metadataBase: new URL(metainfo.url),
  title: {
    default: metainfo.name,
    template: "%s - " + metainfo.name,
  },
  description: metainfo.description,
  authors: [
    {
      name: "Vishesh Yadav",
      url: "https://corerec.tech",
    },

  ],
  openGraph: {
    type: "website",
    title: metainfo.name,
    url: metainfo.url,
    description: metainfo.description,
    images: [metainfo.image],
    siteName: metainfo.name,
  },
  twitter: {
    card: "summary_large_image",
    site: metainfo.url,
    title: metainfo.name,
    description: metainfo.description,
    images: [metainfo.image],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={GeistSans.className}>
        <WebLLMProvider>
          <ThemeProvider attribute="class" defaultTheme="system">
            <Suspense>
              {children}
            </Suspense>
            <AdFlash />
            <div className="fixed bottom-4 right-4 z-40">
              <CreditsModal />
            </div>
            <Toaster position="top-right" />
          </ThemeProvider>
        </WebLLMProvider>
      </body>
      <GoogleAnalytics gaId="G-6X7CQT49KF" />
    </html>
  );
}
