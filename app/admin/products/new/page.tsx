import { getAllCategoriesAdmin } from "@/services/categories";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const categories = await getAllCategoriesAdmin();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-neutral-900">
        Nouveau produit
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        Créez un nouveau pack. Vous pourrez ajouter des photos après la création.
      </p>
      <div className="mt-8">
        <ProductForm categories={categories} />
      </div>
    </div>
  );
}
