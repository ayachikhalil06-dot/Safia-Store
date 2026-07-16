"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Search,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
} from "lucide-react";
import type { ProductWithImages } from "@/types";
import {
  toggleProductVisibilityAction,
  deleteProductAction,
} from "@/app/actions/admin";
import { getImageUrlFromPath } from "@/lib/storage";
import { formatPrice } from "@/utils/format";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";

interface ProductsTableProps {
  products: ProductWithImages[];
}

export function ProductsTable({ products: initialProducts }: ProductsTableProps) {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleVisibility = (id: string, current: boolean) => {
    startTransition(async () => {
      const result = await toggleProductVisibilityAction(id, !current);
      if (result.success) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, is_visible: !current } : p
          )
        );
      }
    });
  };

  const handleDelete = () => {
    if (!deleteId) return;
    startTransition(async () => {
      const result = await deleteProductAction(deleteId);
      if (result.success) {
        setProducts((prev) => prev.filter((p) => p.id !== deleteId));
        setDeleteId(null);
      }
    });
  };

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            placeholder="Rechercher un produit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="h-4 w-4" />
            Nouveau produit
          </Button>
        </Link>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-8 rounded-xl border border-neutral-200 bg-white py-16 text-center">
          <p className="text-neutral-500">
            {search ? "Aucun produit trouvé." : "Aucun produit. Créez votre premier pack."}
          </p>
          {!search && (
            <Link href="/admin/products/new" className="mt-4 inline-block">
              <Button>Ajouter un produit</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  <th className="px-4 py-3 text-left font-medium text-neutral-600">Produit</th>
                  <th className="px-4 py-3 text-left font-medium text-neutral-600">Prix</th>
                  <th className="px-4 py-3 text-left font-medium text-neutral-600">Stock</th>
                  <th className="px-4 py-3 text-left font-medium text-neutral-600">Statut</th>
                  <th className="px-4 py-3 text-right font-medium text-neutral-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filtered.map((product) => {
                  const primaryImage =
                    product.images.find((img) => img.is_primary) ||
                    product.images[0];
                  const imageUrl = primaryImage
                    ? getImageUrlFromPath(primaryImage.storage_path)
                    : null;

                  return (
                    <tr key={product.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                            {imageUrl ? (
                              <Image
                                src={imageUrl}
                                alt={product.name}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            ) : null}
                          </div>
                          <div>
                            <p className="font-medium text-neutral-900">{product.name}</p>
                            {product.badge && (
                              <Badge variant="new" className="mt-0.5">{product.badge}</Badge>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium">{formatPrice(product.price)}</span>
                        {product.compare_at_price && (
                          <span className="ml-2 text-xs text-neutral-400 line-through">
                            {formatPrice(product.compare_at_price)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={product.stock <= 5 ? "text-red-600 font-medium" : ""}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            product.is_visible
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-neutral-100 text-neutral-600"
                          }`}
                        >
                          {product.is_visible ? "En ligne" : "Masqué"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() =>
                              handleToggleVisibility(product.id, product.is_visible)
                            }
                            className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100"
                            title={product.is_visible ? "Masquer" : "Remettre en ligne"}
                            disabled={isPending}
                          >
                            {product.is_visible ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => setDeleteId(product.id)}
                            className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                            disabled={isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Supprimer le produit"
        size="sm"
      >
        <p className="text-sm text-neutral-600">
          Cette action est irréversible. Le produit et toutes ses images seront supprimés.
        </p>
        <div className="mt-6 flex gap-3 justify-end">
          <Button variant="outline" onClick={() => setDeleteId(null)}>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleDelete} loading={isPending}>
            Supprimer
          </Button>
        </div>
      </Modal>
    </>
  );
}
