import { notFound } from "next/navigation";
import { getProductByIdAdmin } from "@/services/products";
import { getAllCategoriesAdmin } from "@/services/categories";
import { ProductForm } from "@/components/admin/ProductForm";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getProductByIdAdmin(id),
    getAllCategoriesAdmin(),
  ]);

  if (!product) notFound();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-neutral-900">
        Modifier : {product.name}
      </h1>
      <div className="mt-8">
        <ProductForm product={product} categories={categories} />
      </div>
    </div>
  );
}
