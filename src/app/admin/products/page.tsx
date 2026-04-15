"use client";
// src/app/admin/products/page.tsx

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { adminApi, categoryApi, getImageUrl } from "@/lib/api";
import { Product, Category } from "@/types";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminProductsPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    regularPrice: "",
    salePrice: "",
    stock: "",
    categoryId: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { data: allProductsData, isLoading } = useQuery({
    queryKey: ["products-admin"],
    queryFn: async () => {
      const { productApi } = await import("@/lib/api");
      const res = await productApi.getAll({ limit: "100" });
      return res as { data: { data: Product[] } };
    },
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await categoryApi.getAll();
      return res as { data: { data: Category[] } };
    },
  });

  const products: Product[] = allProductsData?.data?.data || [];
  const categories: Category[] = categoriesData?.data?.data || [];

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", description: "", regularPrice: "", salePrice: "", stock: "", categoryId: "" });
    setImageFile(null);
    setShowModal(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setForm({
      name: product.name,
      description: product.description || "",
      regularPrice: String(product.regularPrice),
      salePrice: product.salePrice ? String(product.salePrice) : "",
      stock: String(product.stock),
      categoryId: product.categoryId || "",
    });
    setImageFile(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      if (imageFile) fd.append("mainImg", imageFile);

      if (editing) {
        await adminApi.updateProduct(editing.id, fd);
        toast.success("Product updated!");
      } else {
        await adminApi.createProduct(fd);
        toast.success("Product created!");
      }
      setShowModal(false);
      qc.invalidateQueries({ queryKey: ["products-admin"] });
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await adminApi.deleteProduct(id);
      toast.success("Product deleted");
      qc.invalidateQueries({ queryKey: ["products-admin"] });
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-gray-900">Products</h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 py-2">
          <Plus size={18} /> Add Product
        </button>
      </div>

      {isLoading ? (
        <div className="animate-pulse grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 bg-white rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Product</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Price</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Stock</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-rose-50 flex-shrink-0">
                        <Image src={getImageUrl(product.mainImg)} alt={product.name} fill className="object-cover" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 line-clamp-1">{product.name}</p>
                        <p className="text-xs text-gray-400">{product.category?.name || "No category"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="font-bold text-rose-700">{formatPrice(product.salePrice || product.regularPrice)}</p>
                    {product.salePrice && (
                      <p className="text-xs text-gray-400 line-through">{formatPrice(product.regularPrice)}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`badge text-xs ${product.stock <= 5 ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"}`}>
                      {product.stock} in stock
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(product)} className="p-2 hover:bg-blue-50 text-blue-500 rounded-lg transition-colors">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => handleDelete(product.id, product.name)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-bold">{editing ? "Edit Product" : "New Product"}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" required />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input resize-none h-20" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Regular Price *</label>
                  <input type="number" value={form.regularPrice} onChange={(e) => setForm({ ...form, regularPrice: e.target.value })} className="input" required />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Sale Price</label>
                  <input type="number" value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: e.target.value })} className="input" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Stock *</label>
                  <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="input" required />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Category</label>
                  <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="input">
                    <option value="">No category</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  {editing ? "New Image (optional)" : "Main Image *"}
                </label>
                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="input py-2" required={!editing} />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3 disabled:opacity-60">
                {loading ? "Saving..." : editing ? "Update Product" : "Create Product"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}