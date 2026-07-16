"use client";

import { useState, useTransition } from "react";
import { Truck, Package } from "lucide-react";
import type { OrderWithDetails, OrderStatus } from "@/types";
import { ORDER_STATUS_LABELS } from "@/types";
import { updateOrderStatusAction, createYalidineParcelAction } from "@/app/actions/admin";
import { formatPrice, formatDateTime } from "@/utils/format";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

interface OrderDetailProps {
  order: OrderWithDetails;
}

export function OrderDetail({ order: initialOrder }: OrderDetailProps) {
  const [order, setOrder] = useState(initialOrder);
  const [isPending, startTransition] = useTransition();
  const [yalidineMessage, setYalidineMessage] = useState<string | null>(null);

  const handleStatusChange = (status: OrderStatus) => {
    startTransition(async () => {
      const result = await updateOrderStatusAction(order.id, status);
      if (result.success) {
        setOrder((prev) => ({ ...prev, status }));
      }
    });
  };

  const handleYalidine = () => {
    startTransition(async () => {
      const result = await createYalidineParcelAction(order.id);
      if (result.success) {
        setYalidineMessage(`Colis créé. Tracking: ${result.tracking}`);
        setOrder((prev) => ({
          ...prev,
          yalidine_tracking_id: result.tracking || null,
        }));
      } else {
        setYalidineMessage(result.error || "Erreur Yalidine");
      }
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="font-semibold text-neutral-900">Articles</h2>
          <div className="mt-4 divide-y divide-neutral-100">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between py-3">
                <div>
                  <p className="font-medium">{item.product_name}</p>
                  {Object.keys(item.variant as object).length > 0 && (
                    <p className="text-xs text-neutral-500">
                      {Object.entries(item.variant as Record<string, string>)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(", ")}
                    </p>
                  )}
                  <p className="text-sm text-neutral-500">Qté: {item.quantity}</p>
                </div>
                <p className="font-medium">{formatPrice(item.total_price)}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t border-neutral-200 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600">Sous-total</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600">Livraison</span>
              <span>{formatPrice(order.shipping_cost)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="font-semibold text-neutral-900">Adresse de livraison</h2>
          <div className="mt-4 space-y-1 text-sm">
            <p className="font-medium">{order.customer.full_name}</p>
            <p className="text-neutral-600">{order.customer.phone}</p>
            <p className="text-neutral-600">
              {order.customer.address}, {order.customer.commune}
            </p>
            <p className="text-neutral-600">{order.customer.wilaya}</p>
            {order.customer.notes && (
              <p className="mt-2 text-neutral-500 italic">
                Note: {order.customer.notes}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-xl border border-neutral-200 bg-white p-6 space-y-4">
          <h2 className="font-semibold text-neutral-900">Statut</h2>
          <Select
            value={order.status}
            onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
            options={Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => ({
              value,
              label,
            }))}
            disabled={isPending}
          />
          <p className="text-xs text-neutral-500">
            Commande du {formatDateTime(order.created_at)}
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-6 space-y-4">
          <h2 className="font-semibold text-neutral-900 flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Yalidine
          </h2>
          {order.yalidine_tracking_id ? (
            <div>
              <p className="text-sm font-medium">Tracking: {order.yalidine_tracking_id}</p>
              {order.yalidine_label_url && (
                <a
                  href={order.yalidine_label_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-sm text-blue-600 hover:underline"
                >
                  Voir l&apos;étiquette
                </a>
              )}
            </div>
          ) : (
            <>
              <p className="text-sm text-neutral-500">
                Créer un colis Yalidine pour cette commande.
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleYalidine}
                loading={isPending}
              >
                <Package className="h-4 w-4" />
                Créer colis Yalidine
              </Button>
            </>
          )}
          {yalidineMessage && (
            <p className="text-xs text-neutral-600">{yalidineMessage}</p>
          )}
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <p className="text-sm text-neutral-500">Paiement</p>
          <p className="mt-1 font-medium">Paiement à la livraison</p>
        </div>
      </div>
    </div>
  );
}
