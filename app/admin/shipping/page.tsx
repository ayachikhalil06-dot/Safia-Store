import { getAllShippingPricesAdmin } from "@/services/shipping";
import { ShippingManager } from "@/components/admin/ShippingManager";

export default async function AdminShippingPage() {
  const shippingPrices = await getAllShippingPricesAdmin();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-neutral-900">
        Tarifs de livraison
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        Configurez les prix de livraison par wilaya
      </p>
      <div className="mt-8">
        <ShippingManager shippingPrices={shippingPrices} />
      </div>
    </div>
  );
}
