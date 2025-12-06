"use client";

import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ProductSpecsTable } from "./ProductSpecsTable";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BASE_ORIGIN } from "@/api/Api";
import ProductReviews from "./ProductReviews";
import {
  addToWishlist,
  checkWishlist,
  removeFromWishlist,
} from "@/api/wishlistApi";
import { addToCart } from "@/api/cartApi";
import { getProductAttributeGroups } from "@/api/attributeApi";
import { toast } from "sonner";
import {
  Heart,
  Home,
  ChevronRight,
  Gift,
  Truck,
  ShieldCheck,
  Store,
  Tag,
} from "lucide-react";

// 👇 thêm hook context
import { useCart } from "@/components/CartContext";
import { useWishlist } from "@/components/WishlistContext";
type Product = {
  _id: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  description?: string;
  images?: string[];
  inStock?: boolean;
  sku?: string;
  brand?: string;
};
type Coupon = {
  _id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  maxDiscount?: number;
  minOrderAmount?: number;
  startDate?: string;
  endDate?: string;
  description?: string;
  isEligible?: boolean; // từ getAvailableCoupons
};

// 🔹 Kiểu dữ liệu cho thông số kỹ thuật
type SpecItem = {
  name: string;
  value: string;
};

type ProductSpecs = {
  [section: string]: SpecItem[];
};

type AttributeValue = {
  _id: string;
  name: string;
  value: string;
  colorCode?: string;
  priceAdjustment?: number;
};

type AttributeGroupPopulated = {
  _id: string; // _id của ProductAttributeGroup
  attributeGroupId: {
    _id: string;
    name: string;
    type: "select" | "color" | "text" | "number";
    isRequired: boolean;
    values?: AttributeValue[];
  };
  isRequired: boolean;
  sortOrder: number;
};

const SECTION_LABELS: Record<string, string> = {
  general: "Thông tin chung",
  detail: "Cấu hình chi tiết",
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // 👇 lấy hàm refresh từ context
  const { refreshCart } = useCart();
  const { refreshWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [inWishlist, setInWishlist] = useState(false);
  const [wishLoading, setWishLoading] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // 🔹 state cho thông số kỹ thuật
  const [specs, setSpecs] = useState<ProductSpecs>({});
  const [specLoading, setSpecLoading] = useState(true);
  const [attributeGroups, setAttributeGroups] = useState<AttributeGroupPopulated[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [orderAmount, setOrderAmount] = useState<number>(0);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [selectedCouponId, setSelectedCouponId] = useState<string | null>(null);
  const loadProduct = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_ORIGIN}/api/products/${id}`);
      const json = await res.json();
      const data = json.data || json;

      setProduct(data);
      setSelectedImageIndex(0);
    } catch (err: any) {
      toast.error(err?.message || "Không tải được thông tin sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const loadAttributeGroups = async () => {
    if (!id) return;
    try {
      const data = await getProductAttributeGroups(id);
      setAttributeGroups(data);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Không tải được thuộc tính sản phẩm");
    }
  };

  // 🔹 load thông số kỹ thuật
  const loadSpecs = async () => {
    if (!id) return;
    try {
      setSpecLoading(true);
      const res = await fetch(
        `${BASE_ORIGIN}/api/product-attributes/${id}/specs`
      );
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Không tải được thông số kỹ thuật");
      }

      const raw = json.data || {};
      const normalized: ProductSpecs = {};

      Object.entries(raw).forEach(([section, list]: any) => {
        normalized[section] = (list || []).map((item: any) => ({
          name: item.attributeName,
          value: item.attributeValue,
        }));
      });

      setSpecs(normalized);
    } catch (err: any) {
      console.error(err);
    } finally {
      setSpecLoading(false);
    }
  };

  // 🔹 Tự động chọn mặc định 1 giá trị đầu tiên cho mỗi nhóm (màu, dung lượng, ...)
  useEffect(() => {
    if (!attributeGroups || attributeGroups.length === 0) return;

    setSelectedAttributes((prev) => {
      const next = { ...prev };

      for (const g of attributeGroups) {
        const group = g.attributeGroupId;
        if (!group || !group.values || group.values.length === 0) continue;

        const groupKey = group._id;

        // Nếu nhóm này chưa có chọn => gán mặc định là value đầu tiên
        if (!next[groupKey]) {
          next[groupKey] = group.values[0]._id;
        }
      }

      return next;
    });
  }, [attributeGroups]);

  useEffect(() => {
    if (id) {
      loadProduct();
      loadSpecs();
      loadAttributeGroups();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (product?._id) {
      checkWishlist(product._id)
        .then((v) => setInWishlist(!!v))
        .catch(() => { });
    }
  }, [product]);
  // Tính số tiền đơn hàng hiện tại dựa trên giá + thuộc tính
  useEffect(() => {
    if (!product) {
      setOrderAmount(0);
      return;
    }

    let adjustment = 0;

    if (attributeGroups && attributeGroups.length > 0) {
      for (const g of attributeGroups) {
        const group = g.attributeGroupId;
        if (!group || !group.values || group.values.length === 0) continue;

        const groupKey = group._id;
        const selectedValueId = selectedAttributes[groupKey];
        if (!selectedValueId) continue;

        const found = group.values.find((v) => v._id === selectedValueId);
        if (found && typeof found.priceAdjustment === "number") {
          adjustment += found.priceAdjustment;
        }
      }
    }

    const base = product.price || 0;
    const total = base + adjustment;
    console.log("orderAmount:", total);   // kiểm tra có đúng 15000000 không
    setOrderAmount(total);
  }, [product, attributeGroups, selectedAttributes]);


  // 👇 toggle wishlist + sync Header
  const handleToggleWishlist = async () => {
    if (!product || wishLoading) return;

    try {
      setWishLoading(true);

      if (!inWishlist) {
        const res = await addToWishlist(product._id);
        setInWishlist(true);
        toast.success(
          res?.message || "Đã thêm sản phẩm vào danh sách yêu thích"
        );
      } else {
        const res = await removeFromWishlist(product._id);
        setInWishlist(false);
        toast.success(
          res?.message || "Đã xoá sản phẩm khỏi danh sách yêu thích"
        );
      }

      await refreshWishlist();
    } catch (err: any) {
      toast.error(
        err?.message || "Không thể cập nhật danh sách yêu thích"
      );
    } finally {
      setWishLoading(false);
    }
  };
  // 👇 thay thế handleAddToCart hiện tại
  const handleAddToCart = async (goToCart?: boolean) => {
    if (!product) return;
    try {
      await addToCart({ productId: product._id, quantity: 1 });
      await refreshCart();
      toast.success("Đã thêm sản phẩm vào giỏ hàng");

      if (goToCart) {
        // Lưu mã giảm giá đã chọn (nếu có) sang localStorage
        try {
          if (selectedCouponId) {
            const selected = coupons.find((c) => c._id === selectedCouponId);
            if (selected) {
              localStorage.setItem(
                "pendingCoupon",
                JSON.stringify({ code: selected.code })
              );
            } else {
              localStorage.removeItem("pendingCoupon");
            }
          } else {
            localStorage.removeItem("pendingCoupon");
          }
        } catch {
          // ignore
        }

        navigate("/cart");
      }
    } catch (err: any) {
      toast.error(err?.message || "Không thể thêm vào giỏ hàng");
    }
  };


  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        setCouponsLoading(true);

        // Lấy token – chỉnh lại key cho đúng với backend của bạn
        const token =
          localStorage.getItem("accessToken") || localStorage.getItem("token");

        const res = await fetch(
          `${BASE_ORIGIN}/api/coupons/available?orderAmount=${orderAmount}`,
          {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );

        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.message || "Không tải được khuyến mãi");
        }

        const list: Coupon[] = Array.isArray(json.data) ? json.data : [];
        setCoupons(list);
      } catch (err) {
        console.error("fetch coupons error:", err);
        setCoupons([]);
      } finally {
        setCouponsLoading(false);
      }
    };

    if (orderAmount > 0) {
      fetchCoupons();
    } else {
      setCoupons([]);
    }
  }, [orderAmount]);

  if (loading || !product) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f5f7fb]">
        <Header />
        <main className="container mx-auto flex-1 px-4 py-10 text-sm text-muted-foreground">
          Đang tải sản phẩm...
        </main>
        <Footer />
      </div>
    );
  }

  const images =
    product.images && product.images.length > 0 ? product.images : [];
  const mainImage =
    images.length > 0
      ? BASE_ORIGIN + images[selectedImageIndex]
      : "/placeholder.png";

  // 🔹 chuẩn bị section specs để render
  const specSections = Object.entries(specs).filter(
    ([, items]) => items && items.length
  );
  // Gom tất cả thông số lại để tìm "Thương hiệu"
  const allSpecs: SpecItem[] = specSections.flatMap(([, items]) => items);

  const brandFromSpecs =
    allSpecs.find((s) => {
      const n = s.name.toLowerCase().trim();
      return n === "thương hiệu" || n === "brand";
    })?.value || "";

  const displayBrand = brandFromSpecs || product.brand || "Đang cập nhật";

  const getAttributePriceAdjustment = () => {
    if (!attributeGroups || attributeGroups.length === 0) return 0;

    let total = 0;

    for (const g of attributeGroups) {
      const group = g.attributeGroupId;
      if (!group || !group.values || group.values.length === 0) continue;

      const groupKey = group._id;
      const selectedValueId = selectedAttributes[groupKey];
      if (!selectedValueId) continue;

      const found = group.values.find((v) => v._id === selectedValueId);
      if (found && typeof found.priceAdjustment === "number") {
        total += found.priceAdjustment;
      }
    }

    return total;
  };

  const attributeAdjustment = getAttributePriceAdjustment();

  const basePrice = product.price || 0;
  const baseCompare =
    typeof product.compareAtPrice === "number"
      ? product.compareAtPrice
      : undefined;

  // 🔹 Giá hiển thị sau khi cộng thuộc tính
  const displayPrice = basePrice + attributeAdjustment;
  const displayCompareAtPrice =
    typeof baseCompare === "number"
      ? baseCompare + attributeAdjustment
      : undefined;

  const hasDiscount =
    typeof displayCompareAtPrice === "number" &&
    displayCompareAtPrice > displayPrice;

  const discountPercent = hasDiscount
    ? Math.round(
      ((displayCompareAtPrice! - displayPrice) / displayCompareAtPrice!) *
      100
    )
    : 0;

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f7fb]">
      <Header />

      <main className="flex-1">
        {/* breadcrumb + tên sản phẩm */}
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-3 lg:px-0 lg:py-4">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Link to="/" className="inline-flex items-center gap-1 hover:text-primary">
              <Home className="h-3.5 w-3.5" />
              <span>Trang chủ</span>
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/products" className="hover:text-primary">
              Sản phẩm
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="line-clamp-1 text-slate-800">{product.name}</span>
          </div>
        </div>

        {/* 3 cột giống Phong Vũ – mỗi cột 1 card lớn */}
        <section className="py-6 lg:py-8" style={{ marginTop: -25 }}>
          <div
            className="
      mx-auto grid max-w-6xl
      gap-4
      px-4 lg:grid-cols-[1.15fr,1.45fr,0.9fr] lg:px-0
      lg:gap-0
    "
          >
            {/* CỘT 1: ẢNH + THÔNG TIN CHI TIẾT (CHUNG 1 CARD) */}
            <div>
              <Card className="border border-slate-200 bg-white shadow-sm lg:rounded-r-none">
                <CardContent className="p-4">
                  {/* Ảnh chính */}
                  <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-md bg-slate-100">
                    <img
                      src={mainImage}
                      alt={product.name}
                      className="h-full w-full object-contain"
                    />
                  </div>

                  {/* Thumbnails */}
                  {images.length > 1 && (
                    <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                      {images.map((img, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedImageIndex(idx)}
                          onMouseEnter={() => setSelectedImageIndex(idx)}
                          className={`h-14 w-14 flex-shrink-0 overflow-hidden rounded border bg-white ${idx === selectedImageIndex
                            ? "border-[#0d6efd]"
                            : "border-slate-200"
                            }`}
                        >
                          <img
                            src={BASE_ORIGIN + img}
                            alt={`thumb-${idx}`}
                            className="h-full w-full object-contain"
                          />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* THÔNG TIN CHI TIẾT – nằm luôn trong cùng card */}
                  <div className="mt-4 border-t border-slate-100 pt-3">
                    <div className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">
                      {product.description || "Đang cập nhật thông tin chi tiết."}
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span>Chia sẻ:</span>
                      <button className="rounded-full border border-slate-200 px-3 py-1 hover:bg-slate-50">
                        Facebook
                      </button>
                      <button className="rounded-full border border-slate-200 px-3 py-1 hover:bg-slate-50">
                        Zalo
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* CỘT 2: THÔNG TIN + GIÁ + KM + NÚT – CHUNG 1 CARD */}
            <div>
              <Card
                className="
    border border-slate-200 bg-white shadow-sm
    lg:rounded-none lg:border-l-0 lg:border-r-0
  "
              >
                <CardContent className="p-4 space-y-4">
                  {/* header thương hiệu / sku / màu / tình trạng */}
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                      <span>
                        Thương hiệu{" "}
                        <span className="font-semibold text-slate-800">
                          {displayBrand}
                        </span>
                      </span>
                      <span className="h-3 w-px bg-slate-200" />
                      <span>
                        Mã sản phẩm:{" "}
                        <span className="text-slate-800">
                          {product.sku || "Đang cập nhật"}
                        </span>
                      </span>
                    </div>

                    {attributeGroups.length > 0 && (
                      <div className="space-y-4 pt-1">
                        {attributeGroups.map((g, idx) => {
                          const group = g.attributeGroupId;
                          if (!group) return null;

                          const groupKey = group._id;

                          return (
                            <div
                              key={g._id}
                              className={
                                "space-y-2" +
                                (idx === 0 ? "" : " border-t border-slate-100 pt-3")
                              }
                            >
                              {/* Tên nhóm: Màu sắc * */}
                              <p className="text-xs font-semibold text-slate-700">
                                {group.name}
                                {(g.isRequired || group.isRequired) && (
                                  <span className="ml-1 text-red-500">*</span>
                                )}
                              </p>

                              {/* Danh sách giá trị */}
                              <div className="flex flex-wrap gap-2">
                                {(group.values || []).map((v) => {
                                  const selected =
                                    selectedAttributes[groupKey] === v._id;

                                  const baseClass =
                                    "inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs md:text-sm cursor-pointer transition-all";

                                  const selectedClass = selected
                                    ? " border-[#0d6efd] bg-[#f0f7ff] text-[#0d6efd] shadow-sm"
                                    : " border-slate-200 bg-white text-slate-700 hover:border-[#0d6efd]/70 hover:bg-[#f5f9ff]";

                                  return (
                                    <button
                                      type="button"
                                      key={v._id}
                                      onClick={() =>
                                        setSelectedAttributes((prev) => ({
                                          ...prev,
                                          [groupKey]: v._id,
                                        }))
                                      }
                                      className={baseClass + selectedClass}
                                    >
                                      {/* chấm màu cho group kiểu color */}
                                      {group.type === "color" && v.colorCode && (
                                        <span
                                          className="inline-block h-3 w-3 rounded-full border border-slate-200"
                                          style={{ backgroundColor: v.colorCode }}
                                        />
                                      )}

                                      <span className="font-medium">{v.name}</span>

                                      {v.priceAdjustment &&
                                        v.priceAdjustment !== 0 && (
                                          <span className="text-[11px] text-slate-500">
                                            {v.priceAdjustment > 0 ? "+" : ""}
                                            {new Intl.NumberFormat(
                                              "vi-VN"
                                            ).format(v.priceAdjustment)}
                                          </span>
                                        )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Tình trạng hàng */}
                    <div className="flex items-center gap-2 text-xs">
                      <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                      <span className="font-medium text-emerald-600">
                        {product.inStock ? "Còn hàng" : "Hết hàng"}
                      </span>
                    </div>
                  </div>

                  {/* GIÁ + “bạn sẽ nhận được” */}
                  <div className="border-t border-slate-100 pt-3">
                    <div className="flex items-baseline gap-3">
                      <span className="text-2xl font-semibold text-[#0d6efd]">
                        {formatPrice(displayPrice)}
                      </span>

                      {hasDiscount && displayCompareAtPrice !== undefined && (
                        <>
                          <span className="text-sm text-slate-400 line-through">
                            {formatPrice(displayCompareAtPrice)}
                          </span>
                          <span className="rounded bg-[#ffebe6] px-2 py-0.5 text-xs font-semibold text-[#ff4d4f]">
                            -{discountPercent}%
                          </span>
                        </>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      Giá đã bao gồm khuyến mãi, áp dụng trong thời gian ưu đãi.
                    </p>

                    <div className="mt-3 space-y-1.5 rounded bg-[#f8fafc] p-3 text-xs text-slate-700">
                      <p className="text-[11px] font-semibold uppercase text-slate-500">
                        Bạn sẽ nhận được
                      </p>
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 text-[#ff4d4f]">
                          <Gift className="h-3.5 w-3.5" />
                        </span>
                        <span>Quà tặng / ưu đãi kèm theo (tùy thời điểm).</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 text-[#ff4d4f]">
                          <Gift className="h-3.5 w-3.5" />
                        </span>
                        <span>Ưu đãi thêm khi mua kèm phần mềm, phụ kiện.</span>
                      </div>
                    </div>
                  </div>

                  {/* CHỌN 1 TRONG NHỮNG KM SAU */}
                  {/* CHỌN 1 TRONG NHỮNG KM SAU */}
                  <div className="border-t border-slate-100 pt-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Chọn 1 trong những khuyến mãi sau
                    </p>

                    {couponsLoading ? (
                      <p className="text-xs text-slate-500">Đang tải khuyến mãi...</p>
                    ) : (
                      (() => {
                        // chỉ lấy coupon backend báo đủ điều kiện
                        const eligible = coupons.filter((c) => c.isEligible);

                        if (eligible.length === 0) {
                          return (
                            <p className="text-xs text-slate-500">
                              Hiện chưa có khuyến mãi phù hợp cho mức giá này.
                            </p>
                          );
                        }

                        return (
                          <div className="space-y-2">
                            {eligible.map((c) => {
                              const selected = selectedCouponId === c._id;

                              const handleClick = () => {
                                setSelectedCouponId((prev) =>
                                  prev === c._id ? null : c._id
                                );
                              };

                              const mainLabel =
                                c.type === "percent"
                                  ? `Giảm ${c.value}%${c.maxDiscount
                                    ? ` (tối đa ${formatPrice(c.maxDiscount)})`
                                    : ""
                                  }`
                                  : `Giảm ${formatPrice(c.value)}`;

                              return (
                                <button
                                  key={c._id}
                                  type="button"
                                  onClick={handleClick}
                                  className={[
                                    "flex w-full items-stretch rounded text-left text-xs transition",
                                    selected
                                      ? "border border-[#0d6efd] bg-[#f0f7ff]"
                                      : "border border-slate-200 bg-white hover:bg-slate-50",
                                  ].join(" ")}
                                >
                                  <div className="flex w-10 items-center justify-center border-r border-slate-100 bg-white">
                                    <Gift className="h-4 w-4 text-[#ff4d4f]" />
                                  </div>

                                  <div className="flex flex-1 flex-col justify-center px-3 py-2">
                                    <p className="font-semibold text-slate-800">
                                      {mainLabel} – mã {c.code}
                                    </p>

                                    {c.minOrderAmount ? (
                                      <p className="mt-1 text-[11px] text-slate-600">
                                        Áp dụng cho đơn từ{" "}
                                        {formatPrice(c.minOrderAmount)} trở lên.
                                      </p>
                                    ) : null}

                                    {c.description ? (
                                      <p className="mt-1 text-[11px] text-slate-500">
                                        {c.description}
                                      </p>
                                    ) : null}
                                  </div>

                                  <div className="flex items-center px-3 text-[11px] text-[#0d6efd] underline">
                                    {selected ? "Bỏ chọn" : "Áp dụng"}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        );
                      })()
                    )}
                  </div>



                  {/* NÚT MUA + WISHLIST */}
                  <div className="border-t border-slate-100 pt-3">
                    <div className="flex flex-col gap-3 md:flex-row">
                      <Button
                        size="lg"
                        className="flex-1 bg-[#0d6efd] text-[13px] font-semibold md:h-11"
                        disabled={!product.inStock}
                        onClick={() => handleAddToCart(true)}        // 👈 thêm + chuyển cart + lưu mã
                      >
                        MUA NGAY
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        className="flex-1 border-[#0d6efd] bg-white text-[13px] font-semibold text-[#0d6efd] md:h-11"
                        disabled={!product.inStock}
                        onClick={() => handleAddToCart(false)}       // 👈 chỉ thêm vào giỏ
                      >
                        THÊM VÀO GIỎ HÀNG
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className={`h-11 w-11 bg-white ${inWishlist
                          ? "border-[#0d6efd] text-[#0d6efd]"
                          : "text-slate-500"
                          }`}
                        disabled={wishLoading}
                        onClick={handleToggleWishlist}
                      >
                        <Heart
                          className={`h-5 w-5 ${inWishlist
                            ? "fill-[#0d6efd] text-[#0d6efd]"
                            : ""
                            }`}
                        />
                      </Button>
                    </div>
                  </div>

                  {/* GIAO HÀNG + BẢO HÀNH – vẫn trong cùng card */}
                  <div className="border-t border-slate-100 pt-3">
                    <div className="grid grid-cols-1 gap-3 text-xs text-slate-700 md:grid-cols-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase text-slate-600">
                          <Truck className="h-3.5 w-3.5 text-[#0d6efd]" />
                          <span>Chính sách giao hàng</span>
                        </div>
                        <p>Miễn phí giao hàng cho đơn đủ điều kiện.</p>
                        <p>Hỗ trợ giao nhanh tại một số khu vực.</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase text-slate-600">
                          <ShieldCheck className="h-3.5 w-3.5 text-[#0d6efd]" />
                          <span>Bảo hành & đổi trả</span>
                        </div>
                        <p>Bảo hành chính hãng theo từng sản phẩm.</p>
                        <p>Đổi trả theo quy định nếu phát sinh lỗi kỹ thuật.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* CỘT 3: CỬA HÀNG – đã là 1 card, giữ nguyên */}
            <div>
              <Card
                className="
    border border-slate-200 bg-white shadow-sm
    lg:rounded-l-none lg:border-l-0
  "
              >
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100">
                      <Store className="h-4 w-4 text-[#0d6efd]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Cửa hàng của bạn</p>
                      <p className="text-[11px] text-emerald-600">
                        Đối tác bán hàng uy tín
                      </p>
                    </div>
                  </div>

                  <div className="mt-2 space-y-2 border-t pt-3 text-xs text-slate-700">
                    <div className="flex items-start gap-2">
                      <Truck className="mt-0.5 h-3.5 w-3.5 text-[#0d6efd]" />
                      <p>Miễn phí giao hàng cho đơn từ 5.000.000₫.</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <ShieldCheck className="mt-0.5 h-3.5 w-3.5 text-[#0d6efd]" />
                      <p>Cam kết hàng chính hãng, bảo hành đầy đủ.</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Tag className="mt-0.5 h-3.5 w-3.5 text-[#0d6efd]" />
                      <p>Áp dụng nhiều chương trình khuyến mãi theo thời điểm.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="mx-auto max-w-6xl px-4 lg:px-0">
                <ProductSpecsTable productId={product._id} />
              </div>
            </div>
          </div>
        </section>

        {/* Chỉ còn phần đánh giá phía dưới */}
        <section className="pb-16">
          <div className="mx-auto max-w-6xl px-4 lg:px-0">
            <Card className="border border-slate-200 bg-white">
              <CardContent className="p-4 md:p-5">
                <ProductReviews productId={product._id} />
              </CardContent>
            </Card>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
