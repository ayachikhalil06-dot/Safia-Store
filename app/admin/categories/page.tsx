import { getAllCategoriesAdmin } from "@/services/categories";
import { CategoriesManager } from "@/components/admin/CategoriesManager";

export default async function AdminCategoriesPage() {
  const categories = await getAllCategoriesAdmin();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-neutral-900">Catégories</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Organisez vos produits par catégories
      </p>
      <div className="mt-8">
        <CategoriesManager categories={categories} />
      </div>
    </div>
  );
}
