import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { ToastProviderWrapper } from "@/components/ui/toast";
import { ServiceWorkerRegistrar } from "@/components/shared/service-worker-registrar";
import { organizationLd } from "@/lib/seo/jsonld";
import { REPO_URL } from "@/lib/external-urls";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID?.trim() || "";

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
    default: "CareerForge AI – Free ATS Resume Builder",
    template: "%s | CareerForge AI",
  },
  description:
    "Free, open-source CV Generator and ATS Resume Checker — build, optimise, and export ATS-friendly resumes. 100% local, no signup required, privacy-first.",
  keywords: [
    "free CV maker",
    "ATS resume checker",
    "resume builder",
    "ATS resume",
    "open source resume",
    "software engineer resume",
    "CareerForge",
    "free CV generator",
    "local-first",
    "privacy-first",
  ],
  authors: [{ name: "CareerForge AI" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "CareerForge AI",
    title: "CareerForge AI – Free ATS Resume Builder",
    description:
      "Free CV Generator and ATS Resume Checker — build, optimise, and export ATS-friendly resumes. Open-source, no signup required, 100% local.",
  },
  twitter: {
    card: "summary_large_image",
    title: "CareerForge AI – Free ATS Resume Builder",
    description:
      "Free CV Generator and ATS Resume Checker — build, optimise, and export ATS-friendly resumes. Open-source, no signup required, 100% local.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Schema.org JSON-LD is now emitted in <head> via organisationLd()
// (see Phase 5). The legacy inline jsonLd constant was removed.

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#6366f1" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationLd({ sameAs: [REPO_URL] })),
          }}
        />
      </head>
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
          <ToastProviderWrapper>
            <ServiceWorkerRegistrar />
            {children}
          </ToastProviderWrapper>
        </ThemeProvider>

        {/* Google Identity Services (Drive OAuth) */}
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="beforeInteractive"
        />

        {/* Google Analytics (anonymized) — only when NEXT_PUBLIC_GA_ID is set */}
        {GA_ID ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', {
                  anonymize_ip: true,
                  cookie_flags: 'SameSite=None;Secure'
                });
              `}
            </Script>
          </>
        ) : null}
      </body>
    </html>
  );
}
