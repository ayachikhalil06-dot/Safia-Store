import { getOrders } from "@/services/orders";
import { OrdersTable } from "@/components/admin/OrdersTable";

export default async function AdminOrdersPage() {
  const orders = await getOrders();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-neutral-900">Commandes</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Gérez et suivez toutes les commandes
      </p>
      <div className="mt-8">
        <OrdersTable orders={orders} />
      </div>
    </div>
  );
}
