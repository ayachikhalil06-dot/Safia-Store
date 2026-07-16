"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Search, Eye } from "lucide-react";
import type { OrderWithDetails, OrderStatus } from "@/types";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/types";
import { formatPrice, formatDateTime } from "@/utils/format";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

interface OrdersTableProps {
  orders: OrderWithDetails[];
}

export function OrdersTable({ orders: initialOrders }: OrdersTableProps) {
  const [orders] = useState(initialOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filtered = orders.filter((order) => {
    const matchesSearch =
      !search ||
      order.order_number.toLowerCase().includes(search.toLowerCase()) ||
      order.customer.full_name.toLowerCase().includes(search.toLowerCase()) ||
      order.customer.phone.includes(search);

    const matchesStatus = !statusFilter || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            placeholder="Rechercher par n°, nom, téléphone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: "", label: "Tous les statuts" },
            ...Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => ({
              value,
              label,
            })),
          ]}
          className="w-full sm:w-48"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="mt-8 rounded-xl border border-neutral-200 bg-white py-16 text-center">
          <p className="text-neutral-500">Aucune commande trouvée.</p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  <th className="px-4 py-3 text-left font-medium text-neutral-600">Commande</th>
                  <th className="px-4 py-3 text-left font-medium text-neutral-600">Client</th>
                  <th className="px-4 py-3 text-left font-medium text-neutral-600">Wilaya</th>
                  <th className="px-4 py-3 text-left font-medium text-neutral-600">Total</th>
                  <th className="px-4 py-3 text-left font-medium text-neutral-600">Statut</th>
                  <th className="px-4 py-3 text-left font-medium text-neutral-600">Date</th>
                  <th className="px-4 py-3 text-right font-medium text-neutral-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3 font-medium">{order.order_number}</td>
                    <td className="px-4 py-3">
                      <p>{order.customer.full_name}</p>
                      <p className="text-xs text-neutral-500">{order.customer.phone}</p>
                    </td>
                    <td className="px-4 py-3 text-neutral-600">{order.customer.wilaya}</td>
                    <td className="px-4 py-3 font-medium">{formatPrice(order.total)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${ORDER_STATUS_COLORS[order.status]}`}
                      >
                        {ORDER_STATUS_LABELS[order.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-500">
                      {formatDateTime(order.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
