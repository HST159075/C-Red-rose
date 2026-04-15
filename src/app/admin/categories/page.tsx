"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { adminApi, categoryApi } from "@/lib/api";
import { Category } from "@/types";
import { toast } from "sonner";

export default function AdminCategoriesPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await categoryApi.getAll();
      return res as { data: { data: Category[] } };
    },
  });

  const categories: Category[] = data?.data?.data || [];

  const openCreate = () => {
    setEditing(null);
    setName("");
    setShowModal(true);
  };
  const openEdit = (cat: Category) => {
    setEditing(cat);
    setName(cat.name);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const fd = new FormData();
      fd.append("name", name);

      if (editing) {
        await adminApi.updateCategory(editing.id, fd);
        toast.success("Category updated!");
      } else {
        await adminApi.createCategory(fd);
        toast.success("Category created!");
      }
      setShowModal(false);
      qc.invalidateQueries({ queryKey: ["categories"] });
    } catch {
      toast.error("Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await adminApi.deleteCategory(id);
      toast.success("Category deleted");
      qc.invalidateQueries({ queryKey: ["categories"] });
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-gray-900">
          Categories
        </h1>
        <button
          onClick={openCreate}
          className="btn-primary flex items-center gap-2 py-2"
        >
          <Plus size={18} /> Add Category
        </button>
      </div>

      {isLoading ? (
        <div className="animate-pulse grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-white rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center justify-between"
            >
              <div>
                <h3 className="font-semibold text-gray-800">{cat.name}</h3>
                <p className="text-xs text-gray-400 mt-1">
                  {cat._count?.products || 0} products · /{cat.slug}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(cat)}
                  className="p-2 hover:bg-blue-50 text-blue-500 rounded-lg transition-colors"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => handleDelete(cat.id, cat.name)}
                  className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-bold">
                {editing ? "Edit Category" : "New Category"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Name *
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  required
                  placeholder="e.g. Skincare"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 disabled:opacity-60"
              >
                {loading ? "Saving..." : editing ? "Update" : "Create"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
