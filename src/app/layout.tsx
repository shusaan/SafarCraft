import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { ToastProviderWrapper } from "@/components/ui/toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CareerForge AI",
    template: "%s | CareerForge AI",
  },
  description:
    "Open-source AI resume platform for software engineers. Build ATS-optimized resumes with AI assistance, GitHub intelligence, and real-time editing.",
  keywords: [
    "resume builder",
    "ATS resume",
    "AI resume",
    "open source resume",
    "software engineer resume",
    "CareerForge",
  ],
  authors: [{ name: "CareerForge AI" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "CareerForge AI",
    title: "CareerForge AI",
    description:
      "Open-source AI resume platform for software engineers. ATS-optimized, GitHub-powered, AI-assisted.",
  },
  twitter: {
    card: "summary_large_image",
    title: "CareerForge AI",
    description:
      "Open-source AI resume platform for software engineers. ATS-optimized, GitHub-powered, AI-assisted.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background font-sans antialiased`}
      >
        <ThemeProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:shadow-lg focus:outline-none"
          >
            Skip to main content
          </a>
          <ToastProviderWrapper>{children}</ToastProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
