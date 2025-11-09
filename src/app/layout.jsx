import "./globals.css";
import { Inter } from "next/font/google";
import Link from "next/link";


export const metadata = {
  metadataBase: new URL("https://your-domain.com"),
  title: {
    default: "StickyPicky — Web Dev & Tools",
    template: "%s | StickyPicky",
  },
  description: "I build fast, SEO-friendly websites and custom web tools.",
  openGraph: {
    type: "website",
    siteName: "StickyPicky",
    url: "https://your-domain.com",
    images: [{ url: "/og.jpg", width: 1200, height: 630 }],
  },
  alternates: { canonical: "https://your-domain.com" },
  icons: { icon: "/favicon.ico", apple: "/apple-touch-icon.png" },
};

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} scroll-smooth`}>
      <body className="font-sans bg-bg text-fg antialiased">
        {/* Top nav */}
        <header className="sticky top-0 z-50 border-b border-white/10 bg-bg/70 backdrop-blur">
          <nav className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center justify-between">
            <Link href="/" className="text-cyan font-semibold tracking-tight">
              StickyPicky
            </Link>
            <div className="hidden sm:flex gap-6 text-sm text-muted">
              <Link href="/projects" className="hover:text-fg">Projects</Link>
              <Link href="/features" className="hover:text-fg">Features</Link>
              <Link href="/#services" className="hover:text-fg">Services</Link>
              <Link href="/#contact" className="hover:text-fg">Contact</Link>
              <Link href="/#contact" className="ml-2 btn-primary px-4 py-2">Hire me</Link>
            </div>

          </nav>
        </header>

        <main>{children}</main>

        <footer className="border-t border-white/10 mt-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 text-sm text-muted">
            © {new Date().getFullYear()} StickyPicky. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}
