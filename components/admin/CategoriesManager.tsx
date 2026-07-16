"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import type { Category } from "@/types";
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
  toggleCategoryVisibilityAction,
} from "@/app/actions/admin";
import { slugify } from "@/utils/helpers";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { Modal } from "@/components/ui/Modal";

interface CategoriesManagerProps {
  categories: Category[];
}

export function CategoriesManager({ categories: initial }: CategoriesManagerProps) {
  const [categories, setCategories] = useState(initial);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    sort_order: "0",
    is_visible: true,
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", slug: "", description: "", sort_order: "0", is_visible: true });
    setModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      sort_order: cat.sort_order.toString(),
      is_visible: cat.is_visible,
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: form.name,
      slug: form.slug,
      description: form.description,
      image_url: editing?.image_url || "",
      sort_order: parseInt(form.sort_order) || 0,
      is_visible: form.is_visible,
    };

    startTransition(async () => {
      const result = editing
        ? await updateCategoryAction(editing.id, data)
        : await createCategoryAction(data);

      if (result.success) {
        if (editing) {
          setCategories((prev) =>
            prev.map((c) => (c.id === editing.id ? result.category! : c))
          );
        } else {
          setCategories((prev) => [...prev, result.category!]);
        }
        setModalOpen(false);
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteCategoryAction(id);
      if (result.success) {
        setCategories((prev) => prev.filter((c) => c.id !== id));
      }
    });
  };

  const handleToggle = (id: string, current: boolean) => {
    startTransition(async () => {
      const result = await toggleCategoryVisibilityAction(id, !current);
      if (result.success) {
        setCategories((prev) =>
          prev.map((c) => (c.id === id ? { ...c, is_visible: !current } : c))
        );
      }
    });
  };

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Nouvelle catégorie
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="mt-8 rounded-xl border border-neutral-200 bg-white py-16 text-center">
          <p className="text-neutral-500">Aucune catégorie.</p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Nom</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Slug</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Ordre</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Statut</th>
                <th className="px-4 py-3 text-right font-medium text-neutral-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 font-medium">{cat.name}</td>
                  <td className="px-4 py-3 text-neutral-500">{cat.slug}</td>
                  <td className="px-4 py-3">{cat.sort_order}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        cat.is_visible
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      {cat.is_visible ? "Visible" : "Masquée"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => handleToggle(cat.id, cat.is_visible)}
                        className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100"
                        disabled={isPending}
                      >
                        {cat.is_visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => openEdit(cat)}
                        className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                        disabled={isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Modifier la catégorie" : "Nouvelle catégorie"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nom"
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
                slug: editing ? form.slug : slugify(e.target.value),
              })
            }
            required
          />
          <Input
            label="Slug"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            required
          />
          <Textarea
            label="Description"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <Input
            label="Ordre d'affichage"
            type="number"
            value={form.sort_order}
            onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
          />
          <Switch
            checked={form.is_visible}
            onChange={(v) => setForm({ ...form, is_visible: v })}
            label="Visible"
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" loading={isPending}>
              {editing ? "Enregistrer" : "Créer"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
