import type { Metadata } from "next";
import { Schibsted_Grotesk, Martian_Mono } from "next/font/google";
import "./globals.css";
import LightRays from "../components/LightRays";
import Navbar from "../components/Navbar";
import { PostHogProvider } from "./providers";
import { Toaster } from "sonner";
import { Suspense } from "react";

const SchibstedGrotesk = Schibsted_Grotesk({
  variable: "--font-schibsted-grotesk",
  subsets: ["latin"],
});

const MartianMono = Martian_Mono({
  variable: "--font-martian-mono",
  subsets: ["latin"],
});

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
      <body
        className={`${SchibstedGrotesk.variable} ${MartianMono.variable} antialiased`}
      >
        <Toaster richColors position="top-right" />
        <Suspense fallback={null}>
          <PostHogProvider>
            <Suspense fallback={
              <header className="glass sticky top-0 z-50">
                <nav className="flex flex-row justify-between mx-auto container sm:px-10 px-5 py-4">
                  <div className="logo flex flex-row items-center gap-2">
                    <img src="/icons/logo.png" alt="logo" width={24} height={24} />
                    <p className="text-xl font-bold italic max-sm:hidden">DevEvent</p>
                  </div>
                  <ul className="flex items-center gap-8 list-none text-white">
                    <li>Home</li>
                    <li>Events</li>
                    <li>Create Event</li>
                  </ul>
                </nav>
              </header>
            }>
              <Navbar />
            </Suspense>
            <div className="absolute inset-0 top-0 z-[-1] min-h-screen">
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
          </PostHogProvider>
        </Suspense>
      </body>
    </html>
  );
}

