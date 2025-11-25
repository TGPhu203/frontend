import { Heart, ShoppingCart, Star, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { addToCart } from "@/api/cartApi";
import { toast } from "sonner";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviewCount: number;
  warranty?: string;
  inStock?: boolean;
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
  inStock = true,
}: ProductCardProps) => {
  const hasOriginal =
    typeof originalPrice === "number" && originalPrice > price;

  const discount = hasOriginal
    ? Math.round(((originalPrice! - price) / originalPrice!) * 100)
    : 0;

  const handleAddToCart = async () => {
    try {
      await addToCart({
        productId: String(id).trim(),
        quantity: 1,
      });

      console.log("ADD TO CART ->", {
        productId: id,
        quantity: 1,
      });
      toast.success("Đã thêm vào giỏ hàng!");
    } catch (err: any) {
      toast.error(err?.message || "Không thể thêm vào giỏ hàng");
    }
  };

  return (
    <Card className="group flex h-full flex-col overflow-hidden rounded-xl border border-border/60 bg-card/80 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-xl">
      {/* IMAGE */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted/60">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Discount badge */}
        {hasOriginal && discount > 0 && (
          <Badge className="absolute left-3 top-3 rounded-full bg-red-500 px-2.5 py-1 text-[11px] font-semibold text-white shadow-md">
            -{discount}%
          </Badge>
        )}

        {/* Warranty badge */}
        {warranty && (
          <Badge className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-emerald-500/95 px-2.5 py-1 text-[11px] font-medium text-emerald-50 shadow-md">
            <ShieldCheck className="h-3.5 w-3.5" />
            {warranty}
          </Badge>
        )}

        {/* Favourite button (demo, chưa gắn logic) */}
        <button
          type="button"
          className="absolute right-3 bottom-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-muted-foreground shadow-md opacity-0 ring-1 ring-border/60 transition-all duration-300 group-hover:opacity-100 group-hover:text-red-500"
        >
          <Heart className="h-4 w-4" />
        </button>

        {/* Gradient overlay khi hover */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background/80 via-background/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      {/* CONTENT */}
      <CardContent className="flex flex-1 flex-col gap-3 p-4">
        {/* Name + stock */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug transition-colors duration-200 group-hover:text-primary md:text-base">
            {name}
          </h3>
          <Badge
            variant={inStock ? "outline" : "secondary"}
            className={`whitespace-nowrap border text-[11px] ${
              inStock
                ? "border-emerald-500/60 bg-emerald-50 text-emerald-700"
                : "border-destructive/40 bg-destructive/5 text-destructive"
            }`}
          >
            {inStock ? "Còn hàng" : "Hết hàng"}
          </Badge>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${
                  i < Math.round(rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-muted text-muted-foreground/40"
                }`}
              />
            ))}
          </div>
          <span className="ml-1 font-medium">
            {rating > 0 ? rating.toFixed(1) : "Chưa có đánh giá"}
          </span>
          {rating > 0 && (
            <span className="text-[11px] text-muted-foreground">
              ({reviewCount})
            </span>
          )}
        </div>

        {/* Price */}
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-base font-bold text-primary md:text-lg">
            {price.toLocaleString("vi-VN")}₫
          </span>

          {hasOriginal && (
            <span className="text-xs text-muted-foreground line-through md:text-sm">
              {originalPrice!.toLocaleString("vi-VN")}₫
            </span>
          )}
        </div>
      </CardContent>

      {/* FOOTER */}
      <CardFooter className="border-t bg-muted/40 p-3">
        <Button
          className="flex w-full items-center justify-center gap-2 text-sm font-medium"
          size="sm"
          disabled={!inStock}
          onClick={handleAddToCart}
        >
          <ShoppingCart className="h-4 w-4" />
          {inStock ? "Thêm vào giỏ" : "Hết hàng"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
