"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Search, SlidersHorizontal } from "lucide-react";  // 👈 chỉ icon
import { Link, useLocation } from "react-router-dom";      // 👈 Link từ react-router-dom
import { fetchProducts } from "@/api/Api";
import { useState, useEffect } from "react";
import type { Product } from "@/types/product";
import { BASE_ORIGIN } from "@/api/Api";

const Products = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const categorySlug = searchParams.get("category") || "";

  const [priceRange, setPriceRange] = useState<number[]>([0, 50000000]);
  const [searchText, setSearchText] = useState<string>("");
  const [sort, setSort] = useState<string>("createdAt-DESC");

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  const loadProducts = async (pageNumber = 1) => {
    const [sortField, order] = sort.split("-");

    try {
      setLoading(true);

      const res = await fetchProducts({
        page: pageNumber,
        limit: 9,
        search: searchText,
        sort: sortField,
        order: order as "ASC" | "DESC",
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        category: categorySlug || undefined,
      });

      setProducts(res.data.products);
      setTotal(res.data.total);
      setPage(res.data.currentPage);
    } finally {
      setLoading(false);
    }
  };

  // Load khi category đổi
  useEffect(() => {
    loadProducts(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categorySlug]);

  // Load khi sort hoặc priceRange đổi
  useEffect(() => {
    loadProducts(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, priceRange]);

  const totalPages = Math.max(1, Math.ceil(total / 9));

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background via-background to-background/95">
      <Header />
      <main className="flex-1">
        <section className="relative overflow-hidden border-b bg-gradient-to-r from-primary/10 via-primary/5 to-background py-10 md:py-14">
          <div className="pointer-events-none absolute -left-10 top-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -right-10 bottom-0 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />

          <div className="container relative mx-auto px-4">
            <div className="max-w-3xl">
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-primary/80">
                Cửa hàng công nghệ
              </p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
                Khám phá sản phẩm nổi bật
              </h1>
           
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* ================= SIDEBAR ================= */}
            <aside className="lg:col-span-1">
              <div className="sticky top-24 space-y-6 rounded-2xl border bg-card/90 p-6 shadow-sm backdrop-blur">
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <SlidersHorizontal className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold">Bộ lọc</h2>
                    <p className="text-xs text-muted-foreground">
                      Tùy chỉnh khoảng giá theo nhu cầu
                    </p>
                  </div>
                </div>

                {/* Price Range */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Khoảng giá</h3>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={100_000_000}
                    step={1_000_000}
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      Từ{" "}
                      <span className="font-semibold text-foreground">
                        {priceRange[0].toLocaleString("vi-VN")} đ
                      </span>
                    </span>
                    <span>
                      đến{" "}
                      <span className="font-semibold text-foreground">
                        {priceRange[1].toLocaleString("vi-VN")} đ
                      </span>
                    </span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => loadProducts(1)}
                  disabled={loading}
                >
                  Áp dụng bộ lọc
                </Button>
              </div>
            </aside>

            {/* ================= PRODUCT LIST ================= */}
            <div className="lg:col-span-3 space-y-5">
              <div className="flex flex-col gap-3 rounded-2xl border bg-card/80 p-4 shadow-sm backdrop-blur md:flex-row md:items-center md:justify-between">
                {/* Search */}
                 <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm sản phẩm..."
                    className="h-10 pl-9 text-sm"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && loadProducts(1)}
                  />
                </div>

                {/* Sort */}
                <div className="flex flex-col gap-2 text-xs text-muted-foreground md:w-auto md:flex-row md:items-center md:gap-4">
                  <div className="flex items-center gap-2">
                    <span className="hidden text-xs md:inline-block">
                      Sắp xếp:
                    </span>
                    <Select value={sort} onValueChange={setSort}>
                      <SelectTrigger className="h-9 w-full min-w-[170px] text-xs md:text-sm">
                        <SelectValue placeholder="Sắp xếp" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="createdAt-DESC">
                          Mới nhất
                        </SelectItem>
                        <SelectItem value="price-ASC">
                          Giá thấp đến cao
                        </SelectItem>
                        <SelectItem value="price-DESC">
                          Giá cao đến thấp
                        </SelectItem>
                        <SelectItem value="ratings-DESC">
                          Đánh giá cao
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="text-right md:text-left">
                    <span className="font-medium text-foreground">
                      {total.toLocaleString("vi-VN")}{" "}
                    </span>
                    <span>sản phẩm</span>
                  </div>
                </div>
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <Link
                    key={product._id}
                    to={`/products/${product._id}`}   // 👈 đi tới trang chi tiết
                    className="block"
                  >
                    <ProductCard
                      id={product._id}
                      name={product.name}
                      price={product.price}
                      originalPrice={product.compareAtPrice}
                      image={
                        product.images?.[0]
                          ? BASE_ORIGIN + product.images[0]
                          : "/placeholder.png"
                      }
                      rating={product.ratings?.average || 0}
                      reviewCount={product.ratings?.count || 0}
                    />
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-12 flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => loadProducts(page - 1)}
                >
                  Trước
                </Button>

                {Array.from({ length: totalPages }, (_, index) => (
                  <Button
                    key={index}
                    size="sm"
                    variant={page === index + 1 ? "default" : "outline"}
                    onClick={() => loadProducts(index + 1)}
                  >
                    {index + 1}
                  </Button>
                ))}

                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => loadProducts(page + 1)}
                >
                  Sau
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Products;
