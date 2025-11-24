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
import { Search, SlidersHorizontal } from "lucide-react";
import { fetchProducts } from "@/api/Api";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import type { Product } from "@/types/product";
import { BASE_ORIGIN } from "@/api/Api";

const Products = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const categorySlug = searchParams.get("category") || ""; // ✔ Lấy slug danh mục trên URL

  const [priceRange, setPriceRange] = useState<number[]>([0, 50000000]);
  const [searchText, setSearchText] = useState<string>("");
  const [sort, setSort] = useState<string>("createdAt-DESC");

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);

  const loadProducts = async (pageNumber = 1) => {
    const [sortField, order] = sort.split("-");

    const res = await fetchProducts({
      page: pageNumber,
      limit: 9,
      search: searchText,
      sort: sortField,
      order: order as "ASC" | "DESC",
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      category: categorySlug || undefined // ✔ TRUYỀN CATEGORY CHO BACKEND
    });

    setProducts(res.data.products);
    setTotal(res.data.total);
    setPage(res.data.currentPage);
  };

  // 🔥 Load lại khi category thay đổi
  useEffect(() => {
    loadProducts(1);
  }, [categorySlug]);

  useEffect(() => {
    loadProducts(1);
  }, [sort, priceRange]);

  const totalPages = Math.ceil(total / 9);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-to-r from-primary/10 via-primary/5 to-background py-12 border-b">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-4">Sản phẩm</h1>
            <p className="text-muted-foreground max-w-2xl">
              Khám phá bộ sưu tập sản phẩm công nghệ chất lượng cao với giá tốt nhất
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* ================= SIDEBAR ================= */}
            <aside className="lg:col-span-1">
              <div className="sticky top-24 space-y-6 bg-card border p-6 rounded-lg">

                <div className="flex items-center gap-2 mb-4">
                  <SlidersHorizontal className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">Bộ lọc</h2>
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="font-medium mb-3">Khoảng giá</h3>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={100000000}
                    step={1000000}
                  />
                  <div className="flex justify-between text-sm mt-2">
                    <span>{priceRange[0].toLocaleString()} đ</span>
                    <span>{priceRange[1].toLocaleString()} đ</span>
                  </div>
                </div>

              </div>
            </aside>

            {/* ================= PRODUCT LIST ================= */}
            <div className="lg:col-span-3">
              <div className="flex flex-col sm:flex-row gap-4 mb-6">

                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm sản phẩm..."
                    className="pl-10"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && loadProducts(1)}
                  />
                </div>

                {/* Sort */}
                <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Sắp xếp" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt-DESC">Mới nhất</SelectItem>
                    <SelectItem value="price-ASC">Giá thấp đến cao</SelectItem>
                    <SelectItem value="price-DESC">Giá cao đến thấp</SelectItem>
                    <SelectItem value="ratings-DESC">Đánh giá cao</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Count */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-muted-foreground">
                  Hiển thị <span className="font-medium">{products.length}</span> sản phẩm
                </p>
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product._id}
                    id={product._id}
                    name={product.name}
                    price={product.price}
                    originalPrice={product.compareAtPrice}
                    image={
                      product.images?.[0]
                        ? BASE_ORIGIN + product.images[0] // ✔ HIỂN THỊ ẢNH ĐÚNG
                        : "/placeholder.png"
                    }
                    rating={product.ratings?.average || 0}
                    reviewCount={product.ratings?.count || 0}
                  />
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
