import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getOrderById } from "@/services/orders";
import { OrderDetail } from "@/components/admin/OrderDetail";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) notFound();

  return (
    <div>
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux commandes
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-neutral-900">
        {order.order_number}
      </h1>
      <div className="mt-8">
        <OrderDetail order={order} />
      </div>
    </div>
  );
}
