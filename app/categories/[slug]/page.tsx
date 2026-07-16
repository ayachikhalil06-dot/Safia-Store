import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCategoryBySlug } from "@/services/categories";
import { getProducts } from "@/services/products";
import { ProductGrid } from "@/components/store/ProductGrid";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Catégorie introuvable" };

  return {
    title: category.name,
    description: category.description || undefined,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) notFound();

  const products = await getProducts({ categorySlug: slug });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
          {category.name}
        </h1>
        {category.description && (
          <p className="mt-2 text-neutral-600">{category.description}</p>
        )}
        <p className="mt-2 text-sm text-neutral-500">
          {products.length} produit{products.length !== 1 ? "s" : ""}
        </p>
      </div>
      <ProductGrid products={products} />
    </div>
  );
}
