import { getAllProductsAdmin } from "@/services/products";
import { ProductsTable } from "@/components/admin/ProductsTable";

export default async function AdminProductsPage() {
  const products = await getAllProductsAdmin();

  return (
    <div>
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Produits</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Gérez vos packs et produits
        </p>
      </div>
      <div className="mt-8">
        <ProductsTable products={products} />
      </div>
    </div>
  );
}
