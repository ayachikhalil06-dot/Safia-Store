import { Suspense } from "react";
import type { Metadata } from "next";
import { getProducts, searchProducts } from "@/services/products";
import { getCategories } from "@/services/categories";
import { ProductGrid } from "@/components/store/ProductGrid";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";

export const metadata: Metadata = {
  title: "Produits",
  description: "Découvrez notre collection de produits.",
};

interface ProductsPageProps {
  searchParams: Promise<{ q?: string; category?: string }>;
}

async function ProductsContent({
  query,
  categorySlug,
}: {
  query?: string;
  categorySlug?: string;
}) {
  const products = query
    ? await searchProducts(query)
    : await getProducts({ categorySlug, limit: 48 });

  return (
    <>
      <p className="mb-6 text-sm text-neutral-500">
        {products.length} produit{products.length !== 1 ? "s" : ""}
        {query && ` pour "${query}"`}
      </p>
      <ProductGrid products={products} />
    </>
  );
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
          {params.q ? `Résultats pour "${params.q}"` : "Tous les produits"}
        </h1>
      </div>

      {categories.length > 0 && !params.q && (
        <div className="mb-8 flex flex-wrap gap-2">
          <a
            href="/products"
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              !params.category
                ? "bg-neutral-900 text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            Tous
          </a>
          {categories.map((cat) => (
            <a
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                params.category === cat.slug
                  ? "bg-neutral-900 text-white"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              {cat.name}
            </a>
          ))}
        </div>
      )}

      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductsContent query={params.q} categorySlug={params.category} />
      </Suspense>
    </div>
  );
}
