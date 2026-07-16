"use client";

import { useState, useTransition } from "react";
import type { ShippingPrice } from "@/types";
import { bulkUpdateShippingAction } from "@/app/actions/admin";
import { formatPrice } from "@/utils/format";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";

interface ShippingManagerProps {
  shippingPrices: ShippingPrice[];
}

export function ShippingManager({ shippingPrices: initial }: ShippingManagerProps) {
  const [prices, setPrices] = useState(
    initial.map((s) => ({
      id: s.id,
      wilaya_code: s.wilaya_code,
      wilaya_name: s.wilaya_name,
      price: s.price.toString(),
      is_active: s.is_active,
    }))
  );
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    startTransition(async () => {
      const updates = prices.map((p) => ({
        id: p.id,
        price: parseFloat(p.price) || 0,
      }));
      const result = await bulkUpdateShippingAction(updates);
      if (result.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    });
  };

  const updatePrice = (id: string, value: string) => {
    setPrices((prev) =>
      prev.map((p) => (p.id === id ? { ...p, price: value } : p))
    );
  };

  const toggleActive = (id: string) => {
    setPrices((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, is_active: !p.is_active } : p
      )
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500">
          Définissez les tarifs de livraison pour chaque wilaya.
        </p>
        <Button onClick={handleSave} loading={isPending}>
          {saved ? "Enregistré" : "Enregistrer tout"}
        </Button>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-neutral-200 bg-white">
        <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-neutral-50">
              <tr className="border-b border-neutral-200">
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Code</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Wilaya</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Prix (DZD)</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Actif</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {prices.map((item) => (
                <tr key={item.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-2 text-neutral-500">{item.wilaya_code}</td>
                  <td className="px-4 py-2 font-medium">{item.wilaya_name}</td>
                  <td className="px-4 py-2">
                    <Input
                      type="number"
                      min="0"
                      value={item.price}
                      onChange={(e) => updatePrice(item.id, e.target.value)}
                      className="w-32"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <Switch
                      checked={item.is_active}
                      onChange={() => toggleActive(item.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
