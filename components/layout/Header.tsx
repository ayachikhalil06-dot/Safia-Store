import { headers } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import { getStoreSettings } from "@/services/settings";
import { getCategories } from "@/services/categories";
import { CartButton } from "./CartButton";
import { MobileNav } from "./MobileNav";
import { SearchBar } from "./SearchBar";

export async function Header() {
  const [settings, categories] = await Promise.all([
    getStoreSettings(),
    getCategories(),
  ]);

  return (
    <header className="sticky top-0 z-50 border-b border-pink-100/70 bg-white/95 backdrop-blur-xl shadow-sm">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">

        {/* Logo centré */}
        <div className="flex justify-center py-2">
          <Link href="/">
            <Image
              src="/logoso.jpg"
              alt="Safia Store"
              width={95}
              height={95}
              className="rounded-full border-4 border-white shadow-xl transition duration-300 hover:scale-105"
              priority
            />
          </Link>
        </div>

        {/* Barre principale */}
        <div className="flex items-center justify-between border-t border-pink-100 py-4">

          <div className="flex items-center gap-3">
            <MobileNav
              categories={categories}
              storeName={settings.name}
            />

            <nav className="hidden md:flex gap-5">
              <Link
                href="/products"
                className="rounded-full px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-300 hover:bg-pink-50 hover:text-pink-600"
              >
                Tous les produits
              </Link>

              {categories.slice(0,4).map((cat)=>(
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  className="text-sm hover:text-pink-600 transition"
                >
                  {cat.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="hidden lg:block w-[480px]">
            <SearchBar />
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/products"
              className="lg:hidden"
            >
              <Search size={22}/>
            </Link>

            <CartButton/>
          </div>

        </div>

      </div>
    </header>
  );
}