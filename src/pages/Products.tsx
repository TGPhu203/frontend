"use client";

import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fetchProducts, fetchFeaturedProducts, BASE_ORIGIN } from "@/api/Api";
import type { Product } from "@/types/product";
import {
  Search,
  Cpu,
  Monitor,
  Laptop,
  Keyboard,
  Headphones,
  Gamepad2,
  Smartphone,
  Printer,
} from "lucide-react";
import {
  getFeaturedCategories,
  getCategoryTree,
  getProductsByCategory,
} from "@/api/categoryApi";
import { useWishlist } from "@/components/WishlistContext";
import { addToWishlist, removeFromWishlist } from "@/api/wishlistApi";


const categoryIconMap: Record<string, any> = {
  pc: Cpu,
  "linh-kien-pc": Cpu,
  "man-hinh": Monitor,
  laptop: Laptop,
  "ban-phim-chuot": Keyboard,
  "tai-nghe": Headphones,
  "gaming-gear": Gamepad2,
  "dien-thoai": Smartphone,
  "may-in": Printer,
  "phu-kien": Keyboard,
};

const heroBanners = [
  {
    id: 1,
    image: "src/img/images (2).jpg",
    title: "PC gaming chính hãng, lắp ráp theo yêu cầu",
    subtitle: "Ưu đãi linh kiện, tặng kèm nhiều quà tặng cho game thủ.",
  },
  {
    id: 2,
    image: "src/img/z6007026390622_d3498950427f46213d0ca0418baeb0b8.jpg",
    title: "Laptop cho học tập và văn phòng",
    subtitle: "Giảm giá cho sinh viên, tặng balo và chuột không dây.",
  },
  {
    id: 3,
    image: "src/img/download (4).jpg",
    title: "Màn hình tần số quét cao",
    subtitle: "Đa dạng kích thước, nhiều lựa chọn phù hợp ngân sách.",
  },
];

type SectionProducts = Record<string, Product[]>;

type Category = {
  _id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  image?: string;
  isActive?: boolean;
  sortOrder?: number;
  level?: number;
  productCount?: number;
  children?: Category[];
};

type SectionConfig = {
  key: string;
  title: string;
  slug: string;
  categoryId: string;
};

const Products = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const searchKeyword = params.get("search") || "";

  const [searchText, setSearchText] = useState("");
  const [dealProducts, setDealProducts] = useState<Product[]>([]);
  const [sections, setSections] = useState<SectionProducts>({});
  const [sectionConfigs, setSectionConfigs] = useState<SectionConfig[]>([]);
  const [activeBanner, setActiveBanner] = useState(0);
  const [sideCategories, setSideCategories] = useState<Category[]>([]);
  const [quickCategories, setQuickCategories] = useState<Category[]>([]);
  const [hoveredCategory, setHoveredCategory] = useState<Category | null>(null);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  // danh sách sản phẩm kết quả search
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  // đồng bộ ô input với query ?search
  useEffect(() => {
    setSearchText(searchKeyword);
  }, [searchKeyword]);

  // auto đổi banner
  useEffect(() => {
    const interval = setInterval(
      () => setActiveBanner((prev) => (prev + 1) % heroBanners.length),
      5000
    );
    return () => clearInterval(interval);
  }, []);

  // LOAD KẾT QUẢ SEARCH
  useEffect(() => {
    const loadSearch = async () => {
      // nếu không có search => clear kết quả và thôi
      if (!searchKeyword) {
        setProducts([]);
        return;
      }

      try {
        setLoading(true);
        const res = await fetchProducts({
          page,
          limit: 12,
          search: searchKeyword,
        });

        setProducts(res.data?.products || []);
      } catch (e) {
        console.error("Load search products error:", e);
      } finally {
        setLoading(false);
      }
    };

    loadSearch();
  }, [page, searchKeyword]);

  // LOAD HOME (deal + section theo danh mục)
  useEffect(() => {
    // nếu đang search thì không cần load home
    if (searchKeyword) return;

    const loadHome = async () => {
      try {
        setLoading(true);

        // 1) Deal nổi bật
        const dealRes = await fetchProducts({
          page: 1,
          limit: 10,
          sort: "discountPercent",
          order: "DESC",
          minDiscountPercent: 30,
        });

        setDealProducts(dealRes.data.products || []);
        const featuredRes = await fetchFeaturedProducts();
        const featuredList: Product[] =
          (featuredRes.data?.products as Product[]) ??
          (featuredRes.data as Product[]) ??
          [];
        setFeaturedProducts(featuredList);
        // 2) Lấy danh mục
        const [allCategories, featuredCategories] = await Promise.all([
          getCategoryTree(),
          getFeaturedCategories(),
        ]);

        const allCats: Category[] = allCategories || [];
        const featured: Category[] = featuredCategories || [];

        const side: Category[] = allCats
          .filter((c) => !c.parentId && c.isActive !== false)
          .slice(0, 10);
        setSideCategories(side);

        const quick: Category[] =
          (featured || []).length > 0 ? featured : side.slice(0, 8);
        setQuickCategories(quick);

        // 3) section theo 6 danh mục gốc đầu
        const sectionCats = side.slice(0, 6);

        const newSectionConfigs: SectionConfig[] = sectionCats.map((c) => ({
          key: c._id,
          title: c.name,
          slug: c.slug,
          categoryId: c._id,
        }));
        setSectionConfigs(newSectionConfigs);

        // 4) sản phẩm cho từng section
        const sectionPromises = sectionCats.map((cat) =>
          getProductsByCategory(cat._id, 1, 10)
            .then((data: any) => ({
              key: cat._id,
              products: data?.products || [],
            }))
            .catch(() => ({ key: cat._id, products: [] as Product[] }))
        );

        const sectionResults = await Promise.all(sectionPromises);
        const map: SectionProducts = {};
        sectionResults.forEach((r) => {
          map[r.key] = r.products;
        });
        setSections(map);
      } finally {
        setLoading(false);
      }
    };

    loadHome();
  }, [searchKeyword]);
  const handleSearch = (keyword?: string) => {
    const value = (keyword ?? searchText).trim();

    // nếu xóa hết thì quay về trang products bình thường
    if (!value) {
      navigate({
        pathname: "/products",
        search: "",
      });
      return;
    }

    navigate({
      pathname: "/products",
      search: `?search=${encodeURIComponent(value)}`,
    });
  };


  const renderProductRow = (config: SectionConfig) => {
    const products = sections[config.key] || [];
    if (!products.length) return null;

    return (
      <section
        key={config.key}
        className="mt-6 overflow-hidden rounded-md border border-slate-200 bg-white"
      >
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-800">
            {config.title}
          </h2>
          <Link
            to={`/categories/${config.slug}`}
            className="text-xs font-medium text-blue-600 hover:underline"
          >
            Xem tất cả
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 p-3 md:grid-cols-4 xl:grid-cols-5">
          {products.slice(0, 10).map((p) => (
            <Link key={p._id} to={`/products/${p._id}`} className="block">
              <ProductCard
                id={p._id}
                name={p.name}
                price={p.price}
                originalPrice={p.compareAtPrice ?? undefined}
                image={
                  p.images?.[0]
                    ? BASE_ORIGIN + p.images[0]
                    : "/placeholder.png"
                }
                rating={p.ratings?.average || 0}
                reviewCount={p.ratings?.count || 0}
                attributes={p.attributes}
                isOutOfStock={
                  p.inStock === false ||
                  (typeof p.stockQuantity === "number" &&
                    p.stockQuantity <= 0)
                }
              />
            </Link>
          ))}
        </div>
      </section>
    );
  };


  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />

      <main className="flex-1">


        {/* Khung trung tâm */}
        <div className="mx-auto w-full max-w-[1220px] px-2 pb-10 pt-3">
          {/* Ô tìm kiếm + dropdown kết quả */}
          <div className="mb-4 rounded-md bg-white p-3 shadow-sm relative">
            {/* relative ở đây để absolute bám theo khung này */}

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Bạn muốn tìm sản phẩm gì hôm nay..."
                className="h-10 rounded-full border-slate-200 pl-9 pr-4 text-[13px]"
                value={searchText}
                onChange={(e) => {
                  const v = e.target.value;
                  setSearchText(v);
                  handleSearch(v); // gõ tới đâu search tới đó
                }}
              />
            </div>

            {/* DROPDOWN KẾT QUẢ – đè lên nội dung khác, không đẩy layout */}
            {searchKeyword && (
              <div className="absolute left-0 right-0 top-full mt-2 z-40 rounded-md border border-slate-200 bg-white shadow-xl">
                <div className="flex items-center justify-between border-b px-3 py-2">
                  <h2 className="text-sm font-semibold text-slate-800">
                    Kết quả tìm kiếm cho "{searchKeyword}"
                  </h2>
                  <span className="text-xs text-slate-500">
                    {products.length} sản phẩm
                  </span>
                </div>

                {loading ? (
                  <div className="py-4 text-center text-xs text-slate-500">
                    Đang tải kết quả...
                  </div>
                ) : products.length === 0 ? (
                  <div className="py-4 text-center text-xs text-slate-500">
                    Không tìm thấy sản phẩm phù hợp.
                  </div>
                ) : (
                  <div className="max-h-[420px] overflow-auto p-3">
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                      {products.map((p) => (
                        <Link
                          key={p._id}
                          to={`/products/${p._id}`}
                          className="block"
                        >
                          <ProductCard
                            id={p._id}
                            name={p.name}
                            price={p.price}
                            originalPrice={p.compareAtPrice ?? undefined}
                            image={
                              p.images?.[0]
                                ? BASE_ORIGIN + p.images[0]
                                : "/placeholder.png"
                            }
                            rating={p.ratings?.average || 0}
                            reviewCount={p.ratings?.count || 0}
                            attributes={p.attributes}
                            isOutOfStock={
                              p.inStock === false ||
                              (typeof p.stockQuantity === "number" &&
                                p.stockQuantity <= 0)
                            }
                          />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Khối banner + menu trái */}
          <div className="flex gap-3">
            <aside className="hidden w-[210px] shrink-0 lg:block relative">
              <div className="h-full rounded-md border border-slate-200 bg-white text-xs shadow-sm">
                <div className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-semibold uppercase text-slate-700">
                  Danh mục sản phẩm
                </div>
                <ul className="divide-y divide-slate-100 text-[12px]">
                  {sideCategories.map((c) => (
                    <li
                      key={c._id}
                      className="relative"
                      onMouseEnter={() => setHoveredCategory(c)}
                      onMouseLeave={() =>
                        setHoveredCategory((cur) =>
                          cur?._id === c._id ? null : cur
                        )
                      }
                    >
                      <Link
                        to={`/categories/${c.slug}`}
                        className="flex items-center justify-between px-3 py-2 hover:bg-slate-50"
                      >
                        <span>{c.name}</span>
                        <span className="text-[10px] text-slate-400">{">"}</span>
                      </Link>

                      {/* MENU CON */}
                      {hoveredCategory?._id === c._id &&
                        c.children &&
                        c.children.length > 0 && (
                          <div className="absolute left-full top-0 ml-[1px] min-w-[220px] rounded-md border border-slate-200 bg-white text-[12px] shadow-lg z-30">
                            <div className="border-b border-slate-100 bg-slate-50 px-3 py-2 text-[11px] font-semibold uppercase text-slate-700">
                              {c.name}
                            </div>
                            <ul className="max-h-[320px] overflow-auto">
                              {c.children.map((child) => (
                                <li key={child._id}>
                                  <Link
                                    to={`/categories/${child.slug}`}
                                    className="flex items-center justify-between px-3 py-2 hover:bg-slate-50"
                                  >
                                    <span>{child.name}</span>
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            {/* Banner trung tâm + banner phải */}
            <div className="flex-1 space-y-3">
              <div className="grid gap-3 md:grid-cols-[2.3fr,1fr] items-stretch">
                {/* Banner chính */}
                <div className="group relative min-h-[220px] md:min-h-[260px] overflow-hidden rounded-2xl border border-slate-200/70 bg-slate-900 text-white shadow-[0_18px_40px_rgba(15,23,42,0.55)] transition-transform duration-300">
                  {heroBanners.map((banner, index) => (
                    <img
                      key={banner.id}
                      src={banner.image}
                      alt={banner.title}
                      className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ${index === activeBanner
                          ? "opacity-100 scale-105"
                          : "opacity-0 scale-100"
                        }`}
                    />
                  ))}

                  {/* lớp phủ để chữ rõ hơn */}
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-900/65 to-slate-900/15" />

                  <div className="relative z-10 flex h-full flex-col justify-between p-5 md:p-6">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-300">
                        Gaming festival
                      </p>
                      <h1 className="mt-1 text-lg font-semibold md:text-xl">
                        {heroBanners[activeBanner].title}
                      </h1>
                      <p className="mt-3 max-w-[420px] text-[12px] text-sky-100/95 md:text-[13px]">
                        {heroBanners[activeBanner].subtitle}
                      </p>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3">

                      <span className="text-[11px] text-sky-100">
                        Số lượng có hạn.
                      </span>
                    </div>

                    <div className="mt-4 flex gap-1">
                      {heroBanners.map((banner, index) => (
                        <button
                          key={banner.id}
                          onClick={() => setActiveBanner(index)}
                          className={`h-1.5 w-4 rounded-full transition ${index === activeBanner
                              ? "bg-white"
                              : "bg-white/40 hover:bg-white/70"
                            }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Banner phải – 2 banner cao bằng banner chính */}
                <div className="min-h-[220px] md:min-h-[260px]">
                  {/* Banner phải */}
                  <div className="space-y-3">
                    {/* Banner 1: Laptop giảm giá theo hãng */}
                    <Link to="/products?search=laptop">
                      <div className="flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md">
                        <img
                          src="/src/img/images (3).jpg"
                          alt="Laptop giảm giá theo hãng"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </Link>

                    {/* Banner 2: Màn hình tặng cable */}
                    <Link to="/products?search=man-hinh">
                      <div className="flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md">
                        <img
                          src="/src/img/download (6).jpg"
                          alt="Màn hình tặng cable"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </Link>
                  </div>

                </div>
              </div>
            </div>
          </div>

          {/* Dải danh mục icon ngang */}
          <section className="mt-4 rounded-md bg-white p-3 shadow-sm">
            <div className="grid grid-cols-4 gap-2 text-[11px] md:grid-cols-8">
              {quickCategories.map((item) => {
                const Icon = categoryIconMap[item.slug] || Cpu;
                return (
                  <Link
                    key={item._id}
                    to={`/categories/${item.slug}`}
                    className="flex flex-col items-center gap-1 rounded-md border border-transparent px-2 py-2 hover:border-blue-500/60 hover:bg-slate-50"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-blue-600">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-center leading-snug text-slate-700">
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* DEAL HOT */}
          {dealProducts.length > 0 && (
            <section className="mt-5 overflow-hidden rounded-md border border-amber-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-amber-100 bg-amber-50 px-4 py-2">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-800">
                  Deal nổi bật hôm nay
                </h2>
                <span className="text-[11px] text-slate-500">
                  Chỉ áp dụng cho một số sản phẩm.
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 p-3 md:grid-cols-4 xl:grid-cols-5">
                {dealProducts.slice(0, 10).map((p) => (
                  <Link key={p._id} to={`/products/${p._id}`} className="block">
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
                      attributes={p.attributes}          // 👈 thêm
                      isOutOfStock={
                        p.inStock === false ||
                        (typeof p.stockQuantity === "number" &&
                          p.stockQuantity <= 0)
                      }
                    />

                  </Link>
                ))}
              </div>
            </section>
          )}
          {featuredProducts.length > 0 && (
            <section className="mt-5 overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-800">
                  Sản phẩm nổi bật
                </h2>
                <span className="text-[11px] text-slate-500">
                  Lựa chọn được nhiều khách hàng quan tâm.
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 p-3 md:grid-cols-4 xl:grid-cols-5">
                {featuredProducts.slice(0, 10).map((p) => (
                  <Link key={p._id} to={`/products/${p._id}`} className="block">
                    <ProductCard
                      id={p._id}
                      name={p.name}
                      price={p.price}
                      originalPrice={p.compareAtPrice ?? undefined}
                      image={
                        p.images?.[0]
                          ? BASE_ORIGIN + p.images[0]
                          : "/placeholder.png"
                      }
                      rating={p.ratings?.average || 0}
                      reviewCount={p.ratings?.count || 0}
                      attributes={p.attributes}
                      isOutOfStock={
                        p.inStock === false ||
                        (typeof p.stockQuantity === "number" &&
                          p.stockQuantity <= 0)
                      }
                    />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {loading && (
            <div className="mt-6 rounded-md bg-white p-4 text-center text-[12px] text-slate-500 shadow-sm">
              Đang tải sản phẩm...
            </div>
          )}

          {sectionConfigs.map(renderProductRow)}

          {/* Dải thông tin cuối trang */}
          <section className="mt-6 grid gap-3 text-[12px] text-slate-700 md:grid-cols-3">
            <div className="rounded-md border border-slate-200 bg-white p-3 shadow-sm">
              <p className="font-semibold">Trả góp, thanh toán linh hoạt</p>
              <p className="mt-1 text-slate-500">
                Hỗ trợ nhiều hình thức thanh toán, thủ tục đơn giản.
              </p>
            </div>
            <div className="rounded-md border border-slate-200 bg-white p-3 shadow-sm">
              <p className="font-semibold">Giao hàng và lắp đặt</p>
              <p className="mt-1 text-slate-500">
                Giao hàng toàn quốc, hỗ trợ lắp đặt một số khu vực.
              </p>
            </div>
            <div className="rounded-md border border-slate-200 bg-white p-3 shadow-sm">
              <p className="font-semibold">Chính sách bảo hành rõ ràng</p>
              <p className="mt-1 text-slate-500">
                Bảo hành theo tiêu chuẩn hãng, có hỗ trợ đổi trả.
              </p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Products;
