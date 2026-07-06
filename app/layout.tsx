import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import LightRays from "../components/LightRays";
import Navbar from "../components/Navbar";
import { PostHogProvider } from "./providers";
import { Toaster } from "sonner";
import BackToTop from '../components/BackToTop';

const themeScript = `
  try {
    const savedTheme = localStorage.getItem('devevent-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme === 'light' || savedTheme === 'dark'
      ? savedTheme
      : (prefersDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.dataset.theme = theme;
  } catch (_) {}
`;
export const metadata: Metadata = {
  title: "DevEvent",
  description: "The Hub for Every Dev Event that you Mustn't Miss",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Toaster richColors position="top-right" />
        <Suspense fallback={null}>
          <PostHogProvider>
            <Navbar />
            <div className="absolute inset-0 top-0 z-[-1] min-h-screen pointer-events-none">
              <LightRays
                raysOrigin="top-center-offset"
                raysColor="#5dfeca"
                raysSpeed={0.5}
                lightSpread={0.9}
                rayLength={1.4}
                followMouse={true}
                mouseInfluence={0.02}
                noiseAmount={0}
                distortion={0}
                className="custom-rays"
                pulsating={false}
                fadeDistance={1}
                saturation={1}
              />
            </div>
            <main>
              {children}
            </main>
            <BackToTop/>
          </PostHogProvider>
        </Suspense>
      </body>
    </html>
  );
}
