import {
  Sparkles,
  Heart,
  Droplets,
  Flower2,
  Palette,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getProducts } from "@/services/products";
import { getCategories } from "@/services/categories";
import { getStoreSettings } from "@/services/settings";
import { ProductGrid } from "@/components/store/ProductGrid";
import { Button } from "@/components/ui/Button";

export default async function HomePage() {
  const [featuredProducts, categories, settings] = await Promise.all([
    getProducts({ featured: true, limit: 8 }),
    getCategories(),
    getStoreSettings(),
  ]);

  const latestProducts =
    featuredProducts.length > 0
      ? featuredProducts
      : await getProducts({ limit: 8 });

  return (
    <>
     <section className="relative h-[520px] md:h-[650px] overflow-hidden rounded-b-[40px]">

  <Image
    src="/hero.jpg"
    alt="Safia Store"
    fill
    priority
    className="object-cover scale-105"
  />

  <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/35 to-transparent" />

  <div className="absolute inset-0 flex items-center justify-center">
    <div className="mx-auto max-w-3xl text-center text-white px-6">

      <h1 className="text-4xl md:text-7xl font-extrabold leading-tight drop-shadow-lg">
        Révélez votre
        <br />
        beauté naturelle
      </h1>

      <p className="mt-6 max-w-2xl mx-auto text-base md:text-xl text-pink-50">
        Découvrez les meilleures marques de cosmétiques,
        livraison dans les 58 wilayas et paiement à la livraison.
      </p>

      <a href="#products">
  <Button
  size="lg"
  className="mt-8 h-14 rounded-full bg-pink-500 px-10 text-lg font-semibold shadow-lg transition hover:scale-105 hover:bg-pink-600"
>
    Découvrir
  </Button>
</a>

    </div>
  </div>

</section>

      <section className="mx-auto max-w-7xl px-6 py-12">
  <h2 className="mb-10 text-center text-3xl font-bold text-gray-900">
    Nos catégories
  </h2>

  <div className="flex flex-wrap justify-center gap-8">

    <Link href="/categories/cheveux" className="group flex flex-col items-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-pink-100 shadow-md transition-all duration-300 group-hover:scale-110 group-hover:bg-pink-500">
        <Sparkles className="h-9 w-9 text-pink-600 group-hover:text-white" />
      </div>
      <span className="mt-3 font-medium">Cheveux</span>
    </Link>

    <Link href="/categories/visage" className="group flex flex-col items-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-pink-100 shadow-md transition-all duration-300 group-hover:scale-110 group-hover:bg-pink-500">
        <Heart className="h-9 w-9 text-pink-600 group-hover:text-white" />
      </div>
      <span className="mt-3 font-medium">Visage</span>
    </Link>

    <Link href="/categories/corps" className="group flex flex-col items-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-pink-100 shadow-md transition-all duration-300 group-hover:scale-110 group-hover:bg-pink-500">
        <Droplets className="h-9 w-9 text-pink-600 group-hover:text-white" />
      </div>
      <span className="mt-3 font-medium">Corps</span>
    </Link>

    <Link href="/categories/parfums" className="group flex flex-col items-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-pink-100 shadow-md transition-all duration-300 group-hover:scale-110 group-hover:bg-pink-500">
        <Flower2 className="h-9 w-9 text-pink-600 group-hover:text-white" />
      </div>
      <span className="mt-3 font-medium">Parfums</span>
    </Link>

    <Link href="/categories/maquillage" className="group flex flex-col items-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-pink-100 shadow-md transition-all duration-300 group-hover:scale-110 group-hover:bg-pink-500">
        <Palette className="h-9 w-9 text-pink-600 group-hover:text-white" />
      </div>
      <span className="mt-3 font-medium">Maquillage</span>
    </Link>

  </div>
</section>

      <section
  id="products"
 className="bg-[#F7D1DF] py-20 rounded-t-[50px]"
>
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
            {featuredProducts.length > 0 ? "Produits vedettes" : "Nos produits"}
          </h2>
          <Link
            href="/products"
            className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            Voir tout
          </Link>
        </div>
        <div className="mt-8">
          <ProductGrid products={latestProducts} />
        </div>

        </div>
      </section>

      <section className="border-t border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-3">
            <div className="text-center sm:text-left">
              <h3 className="font-semibold text-neutral-900">Livraison nationale</h3>
              <p className="mt-2 text-sm text-neutral-600">
                Livraison dans les 58 wilayas d&apos;Algérie.
              </p>
            </div>
            <div className="text-center sm:text-left">
              <h3 className="font-semibold text-neutral-900">Paiement à la livraison</h3>
              <p className="mt-2 text-sm text-neutral-600">
                Payez en toute sécurité à la réception de votre commande.
              </p>
            </div>
            <div className="text-center sm:text-left">
              <h3 className="font-semibold text-neutral-900">Service client</h3>
              <p className="mt-2 text-sm text-neutral-600">
                {settings.phone || "Contactez-nous pour toute question."}
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
