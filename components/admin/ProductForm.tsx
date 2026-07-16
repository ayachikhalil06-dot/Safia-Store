"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, GripVertical } from "lucide-react";
import type { ProductWithImages, Category, ProductVariant } from "@/types";
import {
  createProductAction,
  updateProductAction,
} from "@/app/actions/admin";
import { slugify, generateVariantId } from "@/utils/helpers";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import { Button } from "@/components/ui/Button";
import { ImageManager } from "./ImageManager";

interface ProductFormProps {
  product?: ProductWithImages;
  categories: Category[];
}

export function ProductForm({ product, categories }: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: product?.name || "",
    slug: product?.slug || "",
    description: product?.description || "",
    short_description: product?.short_description || "",
    price: product?.price?.toString() || "",
    compare_at_price: product?.compare_at_price?.toString() || "",
    stock: product?.stock?.toString() || "0",
    sku: product?.sku || "",
    badge: product?.badge || "",
    is_visible: product?.is_visible ?? true,
    is_featured: product?.is_featured ?? false,
    category_id: product?.category_id || "",
  });

  const [variants, setVariants] = useState<ProductVariant[]>(
    product?.variants || []
  );

  const handleNameChange = (name: string) => {
    setForm((prev) => ({
      ...prev,
      name,
      slug: product ? prev.slug : slugify(name),
    }));
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        id: generateVariantId(),
        name: "",
        type: "color",
        value: "",
        hex: "",
        price_adjustment: 0,
        stock: undefined,
      },
    ]);
  };

  const updateVariant = (id: string, updates: Partial<ProductVariant>) => {
    setVariants(variants.map((v) => (v.id === id ? { ...v, ...updates } : v)));
  };

  const removeVariant = (id: string) => {
    setVariants(variants.filter((v) => v.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const data = {
      name: form.name,
      slug: form.slug,
      description: form.description,
      short_description: form.short_description,
      price: parseFloat(form.price) || 0,
      compare_at_price: form.compare_at_price
        ? parseFloat(form.compare_at_price)
        : null,
      stock: parseInt(form.stock) || 0,
      sku: form.sku,
      badge: form.badge || null,
      is_visible: form.is_visible,
      is_featured: form.is_featured,
      category_id: form.category_id || null,
      variants: variants.filter((v) => v.value.trim()),
    };

    startTransition(async () => {
      const result = product
        ? await updateProductAction(product.id, data)
        : await createProductAction(data as Parameters<typeof createProductAction>[0]);

      if (result.success) {
        router.push(
          product
            ? `/admin/products/${product.id}`
            : `/admin/products/${result.product?.id}`
        );
        router.refresh();
      } else {
        setError(result.error || "Erreur");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-neutral-200 bg-white p-6 space-y-4">
            <h2 className="font-semibold text-neutral-900">Informations</h2>
            <Input
              id="name"
              label="Nom du produit"
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
            />
            <Input
              id="slug"
              label="Slug (URL)"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              required
              hint="Identifiant unique dans l'URL"
            />
            <Textarea
              id="short_description"
              label="Description courte"
              rows={2}
              value={form.short_description}
              onChange={(e) =>
                setForm({ ...form, short_description: e.target.value })
              }
            />
            <Textarea
              id="description"
              label="Description complète"
              rows={6}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>

          {product && (
            <div className="rounded-xl border border-neutral-200 bg-white p-6">
              <ImageManager
                productId={product.id}
                images={product.images}
              />
            </div>
          )}

          <div className="rounded-xl border border-neutral-200 bg-white p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-neutral-900">Variantes</h2>
              <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                <Plus className="h-4 w-4" />
                Ajouter
              </Button>
            </div>

            {variants.length === 0 ? (
              <p className="text-sm text-neutral-500">
                Aucune variante. Ajoutez des couleurs, modèles ou tailles.
              </p>
            ) : (
              <div className="space-y-4">
                {variants.map((variant) => (
                  <div
                    key={variant.id}
                    className="grid gap-3 rounded-lg border border-neutral-200 p-4 sm:grid-cols-6"
                  >
                    <Select
                      label="Type"
                      value={variant.type}
                      onChange={(e) =>
                        updateVariant(variant.id, {
                          type: e.target.value as ProductVariant["type"],
                        })
                      }
                      options={[
                        { value: "color", label: "Couleur" },
                        { value: "model", label: "Modèle" },
                        { value: "size", label: "Taille" },
                        { value: "other", label: "Autre" },
                      ]}
                    />
                    <Input
                      label="Valeur"
                      value={variant.value}
                      onChange={(e) =>
                        updateVariant(variant.id, { value: e.target.value })
                      }
                    />
                    <Input
                      label="Code hex"
                      value={variant.hex || ""}
                      onChange={(e) =>
                        updateVariant(variant.id, { hex: e.target.value })
                      }
                      placeholder="#000000"
                    />
                    <Input
                      label="Ajustement prix"
                      type="number"
                      value={variant.price_adjustment?.toString() || "0"}
                      onChange={(e) =>
                        updateVariant(variant.id, {
                          price_adjustment: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                    <Input
                      label="Stock variante"
                      type="number"
                      value={variant.stock?.toString() || ""}
                      onChange={(e) =>
                        updateVariant(variant.id, {
                          stock: e.target.value
                            ? parseInt(e.target.value)
                            : undefined,
                        })
                      }
                    />
                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeVariant(variant.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-neutral-200 bg-white p-6 space-y-4">
            <h2 className="font-semibold text-neutral-900">Prix et stock</h2>
            <Input
              id="price"
              label="Prix (DZD)"
              type="number"
              min="0"
              step="1"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
            />
            <Input
              id="compare_at_price"
              label="Prix barré (promotion)"
              type="number"
              min="0"
              step="1"
              value={form.compare_at_price}
              onChange={(e) =>
                setForm({ ...form, compare_at_price: e.target.value })
              }
            />
            <Input
              id="stock"
              label="Stock"
              type="number"
              min="0"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              required
            />
            <Input
              id="sku"
              label="SKU"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
            />
            <Input
              id="badge"
              label="Badge"
              value={form.badge}
              onChange={(e) => setForm({ ...form, badge: e.target.value })}
              placeholder="Nouveau, Promo, Best-seller..."
            />
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-6 space-y-4">
            <h2 className="font-semibold text-neutral-900">Organisation</h2>
            <Select
              id="category"
              label="Catégorie"
              value={form.category_id}
              onChange={(e) =>
                setForm({ ...form, category_id: e.target.value })
              }
              placeholder="Aucune catégorie"
              options={categories.map((c) => ({
                value: c.id,
                label: c.name,
              }))}
            />
            <Switch
              checked={form.is_visible}
              onChange={(v) => setForm({ ...form, is_visible: v })}
              label="Visible sur la boutique"
            />
            <Switch
              checked={form.is_featured}
              onChange={(v) => setForm({ ...form, is_featured: v })}
              label="Produit vedette"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" className="w-full" loading={isPending}>
            {product ? "Enregistrer" : "Créer le produit"}
          </Button>
        </div>
      </div>
    </form>
  );
}
