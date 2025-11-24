import { Heart, ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  id?: string | number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviewCount: number;
  warranty?: string;
  inStock?: boolean;  // ← sửa thành optional
}

const ProductCard = ({
  name,
  price,
  originalPrice,
  image,
  rating,
  reviewCount,
  warranty,
  inStock,
}: ProductCardProps) => {
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  return (
    <Card className="group overflow-hidden border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden bg-secondary/50">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {discount > 0 && (
          <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground">
            -{discount}%
          </Badge>
        )}
        {warranty && (
          <Badge className="absolute top-3 right-3 bg-success text-success-foreground">
            {warranty}
          </Badge>
        )}
        <Button
          size="icon"
          variant="secondary"
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Heart className="h-4 w-4" />
        </Button>
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-base line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {name}
        </h3>

        <div className="flex items-center gap-1 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${i < Math.floor(rating)
                    ? "fill-warning text-warning"
                    : "fill-muted text-muted"
                  }`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">({reviewCount})</span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold text-primary">
            {price.toLocaleString("vi-VN")}₫
          </span>
          {originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {originalPrice.toLocaleString("vi-VN")}₫
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 gap-2">
        <Button
          className="flex-1"
          size="sm"
          disabled={inStock === false}   // tránh undefined gây disable
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {inStock === false ? "Hết hàng" : "Thêm vào giỏ"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
