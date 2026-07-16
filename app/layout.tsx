import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartProvider } from "@/hooks/useCart";
import { getCartAction } from "@/app/actions/cart";
import { getStoreSettings, getSeoSettings } from "@/services/settings";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const [store, seo] = await Promise.all([
    getStoreSettings(),
    getSeoSettings(),
  ]);

  return {
    title: {
      default: seo.title || store.name || "Boutique",
      template: `%s | ${store.name || "Boutique"}`,
    },
    description: seo.description || store.description || store.tagline || "",
    keywords: seo.keywords || undefined,
    openGraph: {
      type: "website",
      locale: "fr_DZ",
      siteName: store.name || "Boutique",
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cartData = await getCartAction();

  return (
    <html lang="fr" className={`${inter.variable} h-full`}>
      <body className="flex min-h-full flex-col font-sans">
        <CartProvider
          initialCart={cartData.cart}
          initialCount={cartData.itemCount}
          initialTotal={cartData.total}
        >
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
