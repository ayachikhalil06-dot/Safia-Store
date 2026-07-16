import Link from "next/link";
import {
  DollarSign,
  ShoppingCart,
  Package,
  AlertTriangle,
  Plus,
} from "lucide-react";
import { getDashboardStatsAction } from "@/app/actions/admin";
import { getOrders, getRevenueByDay, getOrdersByStatus } from "@/services/orders";
import { getLowStockProducts } from "@/services/products";
import { formatPrice } from "@/utils/format";
import { Button } from "@/components/ui/Button";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/types";

export default async function AdminDashboardPage() {
  const [stats, recentOrders, revenueByDay, ordersByStatus, lowStock] =
    await Promise.all([
      getDashboardStatsAction(),
      getOrders({ limit: 5 }),
      getRevenueByDay(7),
      getOrdersByStatus(),
      getLowStockProducts(5),
    ]);

  const statCards = [
    {
      label: "Chiffre d'affaires",
      value: formatPrice(stats.totalRevenue),
      icon: DollarSign,
    },
    {
      label: "Commandes",
      value: stats.totalOrders.toString(),
      icon: ShoppingCart,
    },
    {
      label: "En attente",
      value: stats.pendingOrders.toString(),
      icon: AlertTriangle,
    },
    {
      label: "Produits actifs",
      value: `${stats.visibleProducts}/${stats.totalProducts}`,
      icon: Package,
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">
            Tableau de bord
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Vue d&apos;ensemble de votre boutique
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="h-4 w-4" />
            Nouveau produit
          </Button>
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-neutral-200 bg-white p-6 transition-shadow hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-neutral-500">{card.label}</p>
              <card.icon className="h-5 w-5 text-neutral-400" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-neutral-900">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="font-semibold text-neutral-900">
            Revenus (7 derniers jours)
          </h2>
          {revenueByDay.length === 0 ? (
            <p className="mt-4 text-sm text-neutral-500">
              Aucune donnée disponible.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {revenueByDay.map((day) => (
                <div key={day.date} className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">{day.date}</span>
                  <div className="text-right">
                    <span className="text-sm font-medium">
                      {formatPrice(day.revenue)}
                    </span>
                    <span className="ml-2 text-xs text-neutral-400">
                      {day.orders} cmd
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="font-semibold text-neutral-900">Commandes par statut</h2>
          {ordersByStatus.length === 0 ? (
            <p className="mt-4 text-sm text-neutral-500">
              Aucune commande pour le moment.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {ordersByStatus.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ORDER_STATUS_COLORS[item.status]}`}
                  >
                    {ORDER_STATUS_LABELS[item.status]}
                  </span>
                  <span className="text-sm font-medium">{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-neutral-900">Commandes récentes</h2>
            <Link
              href="/admin/orders"
              className="text-sm text-neutral-600 hover:text-neutral-900"
            >
              Voir tout
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="mt-4 text-sm text-neutral-500">
              Aucune commande pour le moment.
            </p>
          ) : (
            <div className="mt-4 divide-y divide-neutral-100">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between py-3 transition-colors hover:bg-neutral-50 -mx-2 px-2 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium">{order.order_number}</p>
                    <p className="text-xs text-neutral-500">
                      {order.customer.full_name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {formatPrice(order.total)}
                    </p>
                    <span
                      className={`text-xs rounded-full px-2 py-0.5 ${ORDER_STATUS_COLORS[order.status]}`}
                    >
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="font-semibold text-neutral-900">Stock faible</h2>
          {lowStock.length === 0 ? (
            <p className="mt-4 text-sm text-neutral-500">
              Tous les produits ont un stock suffisant.
            </p>
          ) : (
            <div className="mt-4 divide-y divide-neutral-100">
              {lowStock.map((product) => (
                <Link
                  key={product.id}
                  href={`/admin/products/${product.id}`}
                  className="flex items-center justify-between py-3 transition-colors hover:bg-neutral-50 -mx-2 px-2 rounded-lg"
                >
                  <p className="text-sm font-medium">{product.name}</p>
                  <span className="text-sm text-red-600 font-medium">
                    {product.stock} restant{product.stock !== 1 ? "s" : ""}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
