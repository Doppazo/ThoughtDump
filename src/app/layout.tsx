import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { IdeasProvider } from "@/context/IdeasContext";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Thought Dump — AI Second Brain",
  description: "Dump it all here. The AI sorts it into your second brain.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Thought Dump",
  },
  icons: {
    apple: "/apple-touch-icon.png",
    icon: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#2645D4",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Google Fonts: Bricolage Grotesque (600, 800), Atkinson Hyperlegible (400, 700), JetBrains Mono (400, 600) */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=Atkinson+Hyperlegible:wght@400;700&family=JetBrains+Mono:wght@400;600&display=swap"
        />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        {/* Pre-paint theme resolution to prevent flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('thoughtdump_theme');
                  var isDark = stored === 'dark' || (stored === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                    document.documentElement.setAttribute('data-theme', 'dark');
                    document.documentElement.style.colorScheme = 'dark';
                  } else {
                    document.documentElement.classList.add('light');
                    document.documentElement.classList.remove('dark');
                    document.documentElement.setAttribute('data-theme', 'light');
                    document.documentElement.style.colorScheme = 'light';
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased min-h-screen text-[var(--ink)] bg-[var(--paper)]">
        <ThemeProvider>
          <AuthProvider>
            <IdeasProvider>{children}</IdeasProvider>
          </AuthProvider>
        </ThemeProvider>

        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(
                  function(registration) {
                    registration.update();
                    console.log('Thought Dump SW active: ', registration.scope);
                  },
                  function(err) {
                    console.log('Thought Dump SW registration failed: ', err);
                  }
                );
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
