import { getAllReviewsAdmin } from "@/services/settings";
import { getAllProductsAdmin } from "@/services/products";
import { ReviewsManager } from "@/components/admin/ReviewsManager";

export default async function AdminReviewsPage() {
  const [reviews, products] = await Promise.all([
    getAllReviewsAdmin(),
    getAllProductsAdmin(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-neutral-900">Avis clients</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Gérez les avis affichés sur vos produits. Aucun avis fictif.
      </p>
      <div className="mt-8">
        <ReviewsManager reviews={reviews} products={products} />
      </div>
    </div>
  );
}
