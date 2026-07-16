import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug } from "@/services/products";
import { getProductReviews, getProductRatingStats } from "@/services/settings";
import { ProductGallery } from "@/components/store/ProductGallery";
import { AddToCartSection } from "@/components/store/AddToCartSection";
import { ReviewsList } from "@/components/store/ReviewsList";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Produit introuvable" };

  return {
    title: product.name,
    description: product.short_description || product.description || undefined,
    openGraph: {
      title: product.name,
      description: product.short_description || undefined,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const [reviews, ratingStats] = await Promise.all([
    getProductReviews(product.id),
    getProductRatingStats(product.id),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
   <Link
  href="/#products"
  className="mb-6 inline-flex items-center gap-2 rounded-full bg-pink-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-pink-600"
>
  ← Continuer mes achats
</Link>
<div className="rounded-3xl bg-pink-200 p-6 shadow-xl border border-pink-300">
      <div className="grid items-start gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <ProductGallery images={product.images} productName={product.name} />

        <div>
          {product.category && (
            <p className="text-sm text-neutral-500">{product.category.name}</p>
          )}
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-neutral-900">
            {product.name}
          </h1>

         <div className="mt-6">
<AddToCartSection product={product} average={ratingStats.average} reviewCount={ratingStats.count} />
</div>
</div>
        </div>
      </div>

    

    </div>
  );
}
