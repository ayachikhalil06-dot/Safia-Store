"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Eye, EyeOff, Star } from "lucide-react";
import type { ReviewWithProduct } from "@/types";
import type { ProductWithImages } from "@/types";
import {
  createReviewAction,
  updateReviewAction,
  deleteReviewAction,
  toggleReviewVisibilityAction,
} from "@/app/actions/admin";
import { formatDate } from "@/utils/format";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { Modal } from "@/components/ui/Modal";

interface ReviewsManagerProps {
  reviews: ReviewWithProduct[];
  products: ProductWithImages[];
}

export function ReviewsManager({ reviews: initial, products }: ReviewsManagerProps) {
  const [reviews, setReviews] = useState(initial);
  const [modalOpen, setModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    product_id: "",
    customer_name: "",
    rating: "5",
    title: "",
    content: "",
    is_visible: false,
    is_verified: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await createReviewAction({
        ...form,
        order_id: null,
        rating: parseInt(form.rating),
      });
      if (result.success && result.review) {
        const product = products.find((p) => p.id === form.product_id);
        setReviews((prev) => [
          { ...result.review!, product: product ? { id: product.id, name: product.name, slug: product.slug } : undefined },
          ...prev,
        ]);
        setModalOpen(false);
        setForm({
          product_id: "",
          customer_name: "",
          rating: "5",
          title: "",
          content: "",
          is_visible: false,
          is_verified: false,
        });
      }
    });
  };

  const handleToggle = (id: string, current: boolean) => {
    startTransition(async () => {
      const result = await toggleReviewVisibilityAction(id, !current);
      if (result.success) {
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, is_visible: !current } : r))
        );
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteReviewAction(id);
      if (result.success) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
      }
    });
  };

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Ajouter un avis
        </Button>
      </div>

      {reviews.length === 0 ? (
        <div className="mt-8 rounded-xl border border-neutral-200 bg-white py-16 text-center">
          <p className="text-neutral-500">Aucun avis. Ajoutez des avis vérifiés depuis l&apos;administration.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-xl border border-neutral-200 bg-white p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{review.customer_name}</p>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${
                            i < review.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-neutral-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {review.product && (
                    <p className="mt-1 text-sm text-neutral-500">
                      {review.product.name}
                    </p>
                  )}
                  {review.title && (
                    <p className="mt-2 font-medium text-sm">{review.title}</p>
                  )}
                  <p className="mt-1 text-sm text-neutral-600">{review.content}</p>
                  <p className="mt-2 text-xs text-neutral-400">
                    {formatDate(review.created_at)}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleToggle(review.id, review.is_visible)}
                    className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100"
                    disabled={isPending}
                  >
                    {review.is_visible ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                    disabled={isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    review.is_visible
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-neutral-100 text-neutral-600"
                  }`}
                >
                  {review.is_visible ? "Visible" : "Masqué"}
                </span>
                {review.is_verified && (
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                    Vérifié
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Ajouter un avis"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Produit"
            value={form.product_id}
            onChange={(e) => setForm({ ...form, product_id: e.target.value })}
            placeholder="Sélectionner un produit"
            options={products.map((p) => ({ value: p.id, label: p.name }))}
            required
          />
          <Input
            label="Nom du client"
            value={form.customer_name}
            onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
            required
          />
          <Select
            label="Note"
            value={form.rating}
            onChange={(e) => setForm({ ...form, rating: e.target.value })}
            options={[5, 4, 3, 2, 1].map((n) => ({
              value: n.toString(),
              label: `${n} étoile${n > 1 ? "s" : ""}`,
            }))}
          />
          <Input
            label="Titre (optionnel)"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <Textarea
            label="Contenu"
            rows={4}
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            required
          />
          <Switch
            checked={form.is_visible}
            onChange={(v) => setForm({ ...form, is_visible: v })}
            label="Visible sur la boutique"
          />
          <Switch
            checked={form.is_verified}
            onChange={(v) => setForm({ ...form, is_verified: v })}
            label="Achat vérifié"
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" loading={isPending}>
              Ajouter
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
