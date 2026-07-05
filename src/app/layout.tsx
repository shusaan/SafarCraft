import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { ToastProviderWrapper } from "@/components/ui/toast";

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
      <body className="min-h-screen bg-background antialiased">
        <ThemeProvider>
          <ToastProviderWrapper>
            {children}
          </ToastProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
