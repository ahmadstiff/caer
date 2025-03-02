"use client";
import React from "react";
import { Geist, Azeret_Mono as Geist_Mono } from "next/font/google";
import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { darkTheme, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { config } from "@/lib/wagmi";
import { useState } from "react";
import Navbar from "@/components/navbar";

// Initialize fonts
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Define layout props type
interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased min-h-screen bg-[#0d0d21]`}
      >
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider
              theme={darkTheme({
                accentColor: "#7b3fe4",
                accentColorForeground: "white",
                borderRadius: "medium",
                fontStack: "system",
                overlayBlur: "small",
              })}
            >
              <div className="flex flex-col min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white overflow-hidden relative">
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-teal-500/10 animate-gradient-x bg-[length:200%_200%] blur-2xl md:blur-3xl pointer-events-none" />
                <div className="relative z-99">
                  <Navbar />
                </div>
                <div className="mt-5 relative z-10">{children}</div>
              </div>
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}
