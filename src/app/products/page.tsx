"use client";
// src/app/products/page.tsx

import { useState, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Filter, X } from "lucide-react";
import { productApi, categoryApi } from "@/lib/api";
import ProductCard from "@/components/product/ProductCard";
import { Product, Category } from "@/types";

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
interface ProductsListResponse {
  data: Product[];
  pagination: Pagination;
}
interface CategoriesResponse {
  data: Category[];
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [page, setPage] = useState(1);

  const params: Record<string, string> = { page: String(page), limit: "12" };
  if (search) params.search = search;
  if (category) params.category = category;

  const { data: productsData, isLoading } = useQuery<ProductsListResponse>({
    queryKey: ["products", params],
    queryFn: async () => {
      const res = await productApi.getAll(params);
      return res.data as ProductsListResponse;
    },
  });

  const { data: categoriesData } = useQuery<CategoriesResponse>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await categoryApi.getAll();
      return res.data as CategoriesResponse;
    },
  });

  const products: Product[] = productsData?.data || [];
  const pagination: Pagination | undefined = productsData?.pagination;
  const categories: Category[] = categoriesData?.data || [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setPage(1);
    router.push("/products");
  };

  const hasFilters = search || category;

  return (
    <div className="page-container py-10">
      <div className="mb-8">
        <h1 className="section-title">All Products</h1>
        <p className="text-gray-500">Discover our full collection of beauty products</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <aside className="w-full md:w-56 flex-shrink-0">
          <div className="card p-5 sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Filter size={16} /> Filters
              </h3>
              {hasFilters && (
                <button onClick={clearFilters} className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1">
                  <X size={12} /> Clear
                </button>
              )}
            </div>

            <form onSubmit={handleSearch} className="mb-5">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">Search</label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="input pl-9 text-sm"
                />
              </div>
            </form>

            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">Category</label>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => { setCategory(""); setPage(1); }}
                  className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${!category ? "bg-rose-600 text-white" : "text-gray-600 hover:bg-rose-50 hover:text-rose-700"}`}
                >
                  All Products
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { setCategory(cat.slug); setPage(1); }}
                    className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${category === cat.slug ? "bg-rose-600 text-white" : "text-gray-600 hover:bg-rose-50 hover:text-rose-700"}`}
                  >
                    {cat.name}
                    {cat._count && <span className="ml-1 text-xs opacity-70">({cat._count.products})</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          {hasFilters && (
            <div className="flex flex-wrap gap-2 mb-4">
              {search && (
                <span className="badge bg-rose-100 text-rose-700 flex items-center gap-1">
                  Search: {search}
                  <button onClick={() => setSearch("")}><X size={12} /></button>
                </span>
              )}
              {category && (
                <span className="badge bg-rose-100 text-rose-700 flex items-center gap-1">
                  {category}
                  <button onClick={() => setCategory("")}><X size={12} /></button>
                </span>
              )}
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-xl bg-rose-50 aspect-square animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">🔍</p>
              <p className="text-gray-500 text-lg">No products found</p>
              <button onClick={clearFilters} className="btn-outline mt-4">Clear Filters</button>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-4">{pagination?.total || 0} products found</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-lg border border-rose-200 text-sm disabled:opacity-40 hover:bg-rose-50 transition-colors"
                  >
                    Previous
                  </button>
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${page === p ? "bg-rose-600 text-white" : "border border-rose-200 hover:bg-rose-50"}`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    disabled={page === pagination.totalPages}
                    className="px-4 py-2 rounded-lg border border-rose-200 text-sm disabled:opacity-40 hover:bg-rose-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="page-container py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-rose-50 rounded w-48" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-rose-50 aspect-square" />
            ))}
          </div>
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}