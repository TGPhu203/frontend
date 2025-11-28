"use client";

import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";

import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

import { BASE_ORIGIN } from "@/api/Api";
import { getCategoryBySlug, getProductsByCategory } from "@/api/categoryApi";
import type { Product } from "@/types/product";
import {
  getProductAttributeGroups,
  AttributeValue,
} from "@/api/attributeApi";

type Category = {
  _id: string;
  name: string;
  slug: string;
  image?: string;
};

type ProductsResponse = {
  total: number;
  pages: number;
  currentPage: number;
  products: Product[];
};

type FilterGroup = {
  id: string;
  name: string; // "Màu sắc", "Dung Lượng"
  type?: string;
  values: AttributeValue[];
};

const sortOptions = [
  { value: "popular", label: "Phổ biến" },
  { value: "price-asc", label: "Giá tăng dần" },
  { value: "price-desc", label: "Giá giảm dần" },
  { value: "newest", label: "Mới nhất" },
];

const CategoryProductsPage = () => {
  const { slug } = useParams<{ slug: string }>();

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(false);

  // price
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [maxPriceFilter, setMaxPriceFilter] = useState(0);

  // attribute filters
  const [filterGroups, setFilterGroups] = useState<FilterGroup[]>([]);
  const [selectedAttrValues, setSelectedAttrValues] = useState<string[]>([]);

  // map: productId -> list attributeValueId
  const [productAttrValueMap, setProductAttrValueMap] = useState<
    Record<string, string[]>
  >({});

  const [sortBy, setSortBy] = useState("popular");

  useEffect(() => {
    const load = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const cat = await getCategoryBySlug(slug);
        setCategory(cat);

        const res: ProductsResponse = await getProductsByCategory(
          cat._id,
          1,
          40
        );
        const list = res.products || [];
        setProducts(list);
        setTotalProducts(res.total ?? list.length);

        // price range
        if (list.length > 0) {
          const prices = list
            .map((p) => p.price || 0)
            .filter((v) => typeof v === "number");
          const max = prices.length > 0 ? Math.max(...prices) : 0;
          setMinPrice(0);
          setMaxPrice(max);
          setMaxPriceFilter(max);
        } else {
          setMinPrice(0);
          setMaxPrice(0);
          setMaxPriceFilter(0);
        }

        // === load attribute groups + values cho từng product ===
        const ids = Array.from(new Set(list.map((p) => p._id)));
        if (ids.length === 0) {
          setFilterGroups([]);
          setProductAttrValueMap({});
          return;
        }

        const groupMap: Record<
          string,
          { id: string; name: string; type?: string; values: AttributeValue[] }
        > = {};

        const perProductValues: Record<string, Set<string>> = {};

        await Promise.all(
          ids.map(async (pid) => {
            try {
              const groups = await getProductAttributeGroups(pid);

              groups.forEach((g: any) => {
                const ag = g.attributeGroupId;
                if (!ag) return;

                // gom cho sidebar
                if (!groupMap[ag._id]) {
                  groupMap[ag._id] = {
                    id: ag._id,
                    name: ag.name,
                    type: ag.type,
                    values: [],
                  };
                }
                (ag.values || []).forEach((val: AttributeValue) => {
                  // tránh trùng value trong 1 group
                  if (!groupMap[ag._id].values.some((v) => v._id === val._id)) {
                    groupMap[ag._id].values.push(val);
                  }
                });

                // gom theo từng product để lọc
                if (!perProductValues[pid]) {
                  perProductValues[pid] = new Set<string>();
                }
                (ag.values || []).forEach((val: AttributeValue) => {
                  perProductValues[pid].add(String(val._id));
                });
              });
            } catch (e) {
              console.error("load product attribute groups error:", e);
            }
          })
        );

        setFilterGroups(Object.values(groupMap));

        const map: Record<string, string[]> = {};
        Object.entries(perProductValues).forEach(([pid, set]) => {
          map[pid] = Array.from(set);
        });
        setProductAttrValueMap(map);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [slug]);

  // toggle helper
  const toggleInArray = (arr: string[], value: string) =>
    arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value];

  const handleToggleAttrValue = (id: string) =>
    setSelectedAttrValues((prev) => toggleInArray(prev, id));

  const filteredProducts = useMemo(() => {
    let list = [...products];

    // price
    if (maxPriceFilter > 0) {
      list = list.filter(
        (p) =>
          (p.price || 0) >= minPrice && (p.price || 0) <= maxPriceFilter
      );
    }

    // filter theo attribute values (color, dung lượng, ...)
    if (selectedAttrValues.length > 0) {
      list = list.filter((p: any) => {
        const ids = productAttrValueMap[p._id] || [];
        if (ids.length === 0) return false;

        // product match nếu có TẤT CẢ value đã chọn
        return selectedAttrValues.every((valId) =>
          ids.includes(String(valId))
        );
      });
    }

    // sort
    if (sortBy === "price-asc") {
      list.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === "price-desc") {
      list.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === "newest") {
      list.sort(
        (a, b) =>
          new Date(b.createdAt || "").getTime() -
          new Date(a.createdAt || "").getTime()
      );
    }

    return list;
  }, [
    products,
    minPrice,
    maxPriceFilter,
    sortBy,
    selectedAttrValues,
    productAttrValueMap,
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />

      <main className="flex-1">
        <div className="mx-auto w-full max-w-[1220px] px-2 pb-10 pt-3">
          {/* breadcrumb */}
          <nav className="mb-3 flex items-center gap-1 text-xs text-slate-500">
            <Link to="/" className="hover:text-blue-600">
              Trang chủ
            </Link>
            <span>/</span>
            <span className="font-medium text-slate-700">
              {category?.name || "Sản phẩm"}
            </span>
          </nav>

          <div className="grid gap-6 md:grid-cols-[260px,minmax(0,1fr)]">
            {/* SIDEBAR FILTERS */}
            <aside className="rounded-md border border-slate-200 bg-white p-3 text-[13px] shadow-sm">
              {/* Khoảng giá */}
              <div className="border-b border-slate-100 pb-3">
                <h3 className="mb-3 text-[13px] font-semibold">Khoảng giá</h3>
                <div className="flex items-center gap-2 text-xs">
                  <Input
                    type="number"
                    className="h-8"
                    value={minPrice}
                    onChange={(e) =>
                      setMinPrice(Math.max(0, Number(e.target.value) || 0))
                    }
                  />
                  <span>-</span>
                  <Input
                    type="number"
                    className="h-8"
                    value={maxPriceFilter}
                    onChange={(e) =>
                      setMaxPriceFilter(
                        Math.min(maxPrice, Number(e.target.value) || 0)
                      )
                    }
                  />
                </div>
                {maxPrice > 0 && (
                  <div className="mt-3">
                    <input
                      type="range"
                      min={0}
                      max={maxPrice}
                      value={maxPriceFilter}
                      onChange={(e) =>
                        setMaxPriceFilter(Number(e.target.value) || 0)
                      }
                      className="w-full"
                    />
                  </div>
                )}
              </div>

              {/* Attribute groups */}
              {filterGroups.map((group, idx) => (
                <div
                  key={group.id}
                  className={
                    "py-3" +
                    (idx === 0 ? " border-b border-slate-100" : "")
                  }
                >
                  <h3 className="mb-2 text-[13px] font-semibold">
                    {group.name}
                  </h3>
                  <div className="space-y-1">
                    {group.values.map((val) => (
                      <label
                        key={val._id}
                        className="flex cursor-pointer items-center gap-2"
                      >
                        <Checkbox
                          checked={selectedAttrValues.includes(val._id)}
                          onCheckedChange={() =>
                            handleToggleAttrValue(val._id)
                          }
                        />
                        <span className="text-[12px] text-slate-700">
                          {val.name}
                        </span>
                      </label>
                    ))}
                    {group.values.length === 0 && (
                      <p className="text-[11px] text-slate-400">
                        Chưa có giá trị nào
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </aside>

            {/* MAIN CONTENT */}
            <section className="space-y-4">
              {/* Banner */}
              <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
                <div className="relative h-[120px] w-full bg-slate-900 md:h-[150px]">
                  {category?.image && (
                    <img
                      src={
                        category.image.startsWith("http")
                          ? category.image
                          : BASE_ORIGIN + category.image
                      }
                      alt={category.name}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/40 to-slate-900/5" />
                  <div className="relative flex h-full flex-col justify-center px-6 text-white">
                    <p className="text-[11px] uppercase tracking-wide text-sky-200">
                      Danh mục nổi bật
                    </p>
                    <h1 className="text-lg font-semibold md:text-xl">
                      {category?.name || "Sản phẩm"}
                    </h1>
                    {totalProducts > 0 && (
                      <p className="mt-1 text-[12px] text-sky-100">
                        {totalProducts} sản phẩm
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Thanh sort */}
              <div className="flex flex-col items-start justify-between gap-3 rounded-md border border-slate-200 bg-white px-3 py-2 text-[12px] shadow-sm md:flex-row md:items-center">
                <div>
                  <h2 className="text-[13px] font-semibold text-slate-800">
                    {category?.name || "Sản phẩm"}
                  </h2>
                  {filteredProducts.length !== totalProducts && (
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      Hiển thị {filteredProducts.length}/{totalProducts} sản phẩm
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500">Sắp xếp:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="h-8 rounded border border-slate-200 bg-white px-2 text-[12px] outline-none focus:border-blue-500"
                  >
                    {sortOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Lưới sản phẩm */}
              <div className="rounded-md border border-slate-200 bg-white p-3 shadow-sm">
                {loading ? (
                  <div className="py-10 text-center text-[12px] text-slate-500">
                    Đang tải sản phẩm...
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="py-10 text-center text-[12px] text-slate-500">
                    Chưa có sản phẩm nào trong danh mục này.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                    {filteredProducts.map((p) => {
                      const outOfStock =
                        p.inStock === false ||
                        (typeof p.stockQuantity === "number" &&
                          p.stockQuantity <= 0);

                      return (
                        <Link
                          key={p._id}
                          to={`/products/${p._id}`}
                          className="block"
                        >
                          <ProductCard
                            id={p._id}
                            name={p.name}
                            price={p.price}
                            originalPrice={p.compareAtPrice}
                            image={
                              p.images?.[0]
                                ? BASE_ORIGIN + p.images[0]
                                : "/placeholder.png"
                            }
                            rating={p.ratings?.average || 0}
                            reviewCount={p.ratings?.count || 0}
                            inStock={!outOfStock}
                          />
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CategoryProductsPage;
