"use client";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BASE_ORIGIN } from "@/api/Api";
import { toast } from "sonner";
import { Heart } from "lucide-react";
import AccountLayout from "./AccountLayout"; // 👈 dùng layout tài khoản
import { removeFromWishlist } from "@/api/wishlistApi";
import { useWishlist } from "@/components/WishlistContext";
// mỗi phần tử chính là product
type WishlistItem = {
  _id: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  images?: string[];
  thumbnail?: string;
  inStock?: boolean;
};

type SortKey =
  | "default"
  | "promo"
  | "priceAsc"
  | "priceDesc"
  | "newest"
  | "bestseller";

export default function Wishlist() {

  const [activeSort, setActiveSort] = useState<SortKey>("default");
  const { items, loading, refreshWishlist, wishlistCount } = useWishlist();


  const handleRemove = async (productId: string) => {
    try {
      await removeFromWishlist(productId);
      toast.success("Đã xoá khỏi danh sách yêu thích");
      await refreshWishlist(); // 👈 cập nhật lại danh sách + Header
    } catch (err: any) {
      toast.error(err?.message || "Không thể xoá sản phẩm");
    }
  };
  
  

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  const resolveImage = (p: WishlistItem) => {
    const raw =
      p.thumbnail ||
      (Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : "") ||
      "";

    if (!raw) return "/placeholder.png";
    if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
    if (raw.startsWith("//")) return `${window.location.protocol}${raw}`;
    if (raw.startsWith("/")) return `${BASE_ORIGIN}${raw}`;
    return `${BASE_ORIGIN}/${raw}`;
  };

  // sort nhẹ cho giống “Sắp xếp theo”
  const sortedItems = (() => {
    const arr = [...items];
    switch (activeSort) {
      case "priceAsc":
        return arr.sort((a, b) => a.price - b.price);
      case "priceDesc":
        return arr.sort((a, b) => b.price - a.price);
      default:
        return arr;
    }
  })();

  return (
    <AccountLayout>
      {/* Thanh tiêu đề + sort giống Phong Vũ */}
      <div className="bg-white border border-slate-200 border-b-0 rounded-t-sm px-6 pt-5 pb-3">
        <h1 className="text-[20px] font-semibold text-slate-900 mb-4">
          Sản phẩm yêu thích
        </h1>

        <div className="flex flex-wrap items-center gap-2 text-[13px]">
          <span className="mr-1 text-slate-700">Sắp xếp theo</span>
          <SortPill
            label="Mặc định"
            active={activeSort === "default"}
            onClick={() => setActiveSort("default")}
          />
          <SortPill
            label="Khuyến mãi tốt nhất"
            active={activeSort === "promo"}
            onClick={() => setActiveSort("promo")}
          />
          <SortPill
            label="Giá tăng dần"
            active={activeSort === "priceAsc"}
            onClick={() => setActiveSort("priceAsc")}
          />
          <SortPill
            label="Giá giảm dần"
            active={activeSort === "priceDesc"}
            onClick={() => setActiveSort("priceDesc")}
          />
          <SortPill
            label="Sản phẩm mới nhất"
            active={activeSort === "newest"}
            onClick={() => setActiveSort("newest")}
          />
          <SortPill
            label="Sản phẩm bán chạy nhất"
            active={activeSort === "bestseller"}
            onClick={() => setActiveSort("bestseller")}
          />
        </div>
      </div>

      {/* Vùng nội dung xám nhạt giống ảnh */}
      <div className="border border-t-0 border-slate-200 rounded-b-sm bg-[#f8f8fb] px-6 py-6">
        {loading ? (
          <div className="flex h-40 items-center justify-center text-sm text-slate-500">
            Đang tải danh sách yêu thích...
          </div>
        ) : sortedItems.length === 0 ? (
          <div className="flex h-60 flex-col items-center justify-center text-center text-sm text-slate-600">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
              <Heart className="h-5 w-5 text-primary" />
            </div>
            <p className="font-semibold mb-1">
              Chưa có sản phẩm nào trong danh sách yêu thích
            </p>
            <p className="text-xs text-slate-500 mb-4 max-w-md">
              Thêm sản phẩm vào danh sách yêu thích để theo dõi và đặt mua
              nhanh chóng.
            </p>
            <Link to="/products">
              <Button size="sm">Khám phá sản phẩm</Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-wrap gap-4">
            {sortedItems.map((p) => (
              <Card
                key={p._id}
                className="w-[260px] bg-white border border-slate-200 rounded-sm hover:shadow-sm transition-shadow duration-150"
              >
                <Link to={`/products/${p._id}`}>
                  <div className="border-b border-slate-200 px-3 pt-3 pb-2">
                    <div className="h-[180px] flex items-center justify-center bg-white">
                      <img
                        src={resolveImage(p)}
                        alt={p.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>

                    <div className="mt-2 text-[11px] text-slate-500 uppercase">
                      ASUS
                    </div>
                    <h3 className="mt-1 line-clamp-2 text-[13px] leading-snug text-slate-900">
                      {p.name}
                    </h3>

                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-[15px] font-semibold text-[#0050d8]">
                        {formatPrice(p.price)}
                      </span>
                      {p.compareAtPrice && p.compareAtPrice > p.price && (
                        <span className="text-[12px] text-slate-400 line-through">
                          {formatPrice(p.compareAtPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>

                <div className="px-3 py-2 flex items-center justify-between text-[11px]">
                  {p.inStock === false ? (
                    <span className="text-red-500">Hết hàng</span>
                  ) : (
                    <span className="text-emerald-600">Còn hàng</span>
                  )}

                  <button
                    type="button"
                    onClick={() => handleRemove(p._id)}
                    className="inline-flex items-center gap-1 text-xs text-rose-500 hover:text-rose-600"
                  >
                    <Heart className="h-3.5 w-3.5 fill-rose-500" />
                    Xoá
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AccountLayout>
  );
}

/* ====== COMPONENT PHỤ ====== */

interface SortPillProps {
  label: string;
  active?: boolean;
  onClick: () => void;
}

const SortPill = ({ label, active, onClick }: SortPillProps) => (
  <button
    type="button"
    onClick={onClick}
    className={[
      "rounded-sm border px-4 py-1.5",
      active
        ? "border-[#0050d8] text-[#0050d8] bg-[#f5f8ff]"
        : "border-slate-200 text-slate-700 hover:bg-slate-50",
    ].join(" ")}
  >
    {label}
  </button>
);
