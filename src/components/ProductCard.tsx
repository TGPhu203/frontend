// ProductCard.tsx
import { useEffect, useState, MouseEvent } from "react";  // 👈 bỏ useMemo
import { Heart, ShoppingCart, Star, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { addToCart } from "@/api/cartApi";
import {
  addToWishlist,
  checkWishlist,
  removeFromWishlist,
} from "@/api/wishlistApi";
import { toast } from "sonner";
import { useCart } from "./CartContext";
// vẫn giữ type, lỡ bạn cần dùng attributes cho chỗ khác
type AttributeOption = {
  _id: string;
  name: string;
  priceAdjustment?: number;
  isDefault?: boolean;
};

type ProductAttribute = {
  _id: string;
  name: string;
  options?: AttributeOption[];
};

interface ProductCardProps {
  id: string;
  name: string;

  // GIÁ ĐÃ CỘNG THUỘC TÍNH TỪ BACKEND
  price: number;
  originalPrice?: number;

  image: string;
  rating: number;
  reviewCount: number;
  warranty?: string;

  // attributes vẫn nhận để dùng cho chỗ khác nếu cần
  attributes?: ProductAttribute[];

  inStock?: boolean;
  stockQuantity?: number;
  isOutOfStock?: boolean;
}

const ProductCard = ({
  id,
  name,
  price,
  originalPrice,
  image,
  rating,
  reviewCount,
  warranty,
  attributes,          // hiện tại không dùng để cộng giá nữa
  inStock = true,
  stockQuantity,
  isOutOfStock,
}: ProductCardProps) => {
  const { refreshCart } = useCart();
  // ✅ GIÁ HIỂN THỊ – backend đã cộng thuộc tính
  const basePrice = typeof price === "number" ? price : 0;
  const displayPrice = basePrice;

  const baseOriginal =
    typeof originalPrice === "number" ? originalPrice : undefined;
  const displayOriginalPrice =
    typeof baseOriginal === "number" ? baseOriginal : undefined;

  const hasOriginal =
    typeof displayOriginalPrice === "number" &&
    displayOriginalPrice > displayPrice;

  const discount = hasOriginal
    ? Math.round(
        ((displayOriginalPrice! - displayPrice) / displayOriginalPrice!) * 100
      )
    : 0;

  const [inWishlist, setInWishlist] = useState(false);
  const [wishLoading, setWishLoading] = useState(false);

  const computedInStock =
    isOutOfStock === true
      ? false
      : typeof stockQuantity === "number"
      ? stockQuantity > 0
      : inStock;

  useEffect(() => {
    let mounted = true;

    checkWishlist(id)
      .then((res) => {
        if (mounted) setInWishlist(!!res);
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, [id]);

  const handleAddToCart = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!computedInStock) {
      toast.error("Sản phẩm đã hết hàng, không thể thêm vào giỏ");
      return;
    }

    try {
      await addToCart({
        productId: String(id).trim(),
        quantity: 1,
      });
      await refreshCart();
      toast.success("Đã thêm vào giỏ hàng");
    } catch (err: any) {
      toast.error(err?.message || "Không thể thêm vào giỏ hàng");
    }
  };

  const handleToggleWishlist = async (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (wishLoading) return;

    try {
      setWishLoading(true);

      if (!inWishlist) {
        const res = await addToWishlist(id);
        setInWishlist(true);
        toast.success(res?.message || "Đã thêm vào danh sách yêu thích");
      } else {
        const res = await removeFromWishlist(id);
        setInWishlist(false);
        toast.success(res?.message || "Đã xoá khỏi danh sách yêu thích");
      }
    } catch (err: any) {
      toast.error(err?.message || "Không thể cập nhật danh sách yêu thích");
    } finally {
      setWishLoading(false);
    }
  };

  return (
    <Card className="group flex h-full flex-col overflow-hidden rounded-md border border-slate-200 bg-white text-slate-900 shadow-sm transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-md">
      {/* IMAGE */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-50">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {hasOriginal && discount > 0 && (
          <Badge className="absolute left-2 top-2 rounded-sm bg-rose-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
            -{discount}%
          </Badge>
        )}

        {warranty && (
          <Badge className="absolute right-2 top-2 flex items-center gap-1 rounded-sm bg-emerald-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
            <ShieldCheck className="h-3 w-3" />
            {warranty}
          </Badge>
        )}

        <button
          type="button"
          onClick={handleToggleWishlist}
          disabled={wishLoading}
          className="absolute right-2 bottom-2 inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-400 shadow-sm transition-colors hover:text-rose-500 disabled:cursor-not-allowed"
          aria-label={inWishlist ? "Bỏ khỏi yêu thích" : "Thêm vào yêu thích"}
        >
          <Heart
            className={`h-3.5 w-3.5 ${
              inWishlist ? "text-rose-500 fill-rose-500" : ""
            }`}
          />
        </button>
      </div>

      <CardContent className="flex flex-1 flex-col gap-2.5 p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-[13px] font-medium leading-snug text-slate-900 group-hover:text-blue-600">
            {name}
          </h3>
          <Badge
            variant="outline"
            className={`whitespace-nowrap border px-1.5 py-0 text-[10px] ${
              computedInStock
                ? "border-emerald-500/60 bg-emerald-50 text-emerald-700"
                : "border-rose-400/60 bg-rose-50 text-rose-700"
            }`}
          >
            {computedInStock ? "Còn hàng" : "Hết hàng"}
          </Badge>
        </div>

        {typeof stockQuantity === "number" && (
          <div className="text-[10px] text-slate-500">
            {stockQuantity > 0
              ? `Còn khoảng ${stockQuantity} sản phẩm`
              : "Hiện đã hết hàng"}
          </div>
        )}

        <div className="flex items-center gap-1 text-[11px] text-slate-500">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < Math.round(rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-slate-200 text-slate-300"
                }`}
              />
            ))}
          </div>
          {rating > 0 ? (
            <>
              <span className="ml-1 font-medium text-slate-700">
                {rating.toFixed(1)}
              </span>
              <span className="text-[10px] text-slate-500">
                ({reviewCount})
              </span>
            </>
          ) : (
            <span className="ml-1 text-[11px] text-slate-500">
              Chưa có đánh giá
            </span>
          )}
        </div>

        {/* GIÁ – đã bao gồm thuộc tính từ backend */}
        <div className="mt-0.5 flex items-baseline gap-1.5">
          <span className="text-sm font-semibold text-rose-600 md:text-base">
            {displayPrice.toLocaleString("vi-VN")}₫
          </span>

          {hasOriginal && displayOriginalPrice !== undefined && (
            <span className="text-[11px] text-slate-400 line-through md:text-xs">
              {displayOriginalPrice.toLocaleString("vi-VN")}₫
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="border-t border-slate-200 bg-slate-50 p-2.5">
        <Button
          className="flex h-8 w-full items-center justify-center gap-2 text-[12px] font-medium"
          size="sm"
          disabled={!computedInStock}
          onClick={handleAddToCart}
        >
          <ShoppingCart className="h-4 w-4" />
          {computedInStock ? "Thêm vào giỏ" : "Hết hàng"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
