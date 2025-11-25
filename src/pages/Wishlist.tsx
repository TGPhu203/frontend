"use client";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getWishlist, removeFromWishlist } from "@/api/wishlistApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BASE_ORIGIN } from "@/api/Api";
import { toast } from "sonner";
import { Heart, ArrowLeft, ShoppingBag } from "lucide-react";

type WishlistItem = {
  _id: string;
  product: {
    _id: string;
    name: string;
    price: number;
    compareAtPrice?: number;
    images?: string[];
    inStock?: boolean;
  };
};

export default function Wishlist() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const data = await getWishlist();
      setItems(data || []);
    } catch (err: any) {
      toast.error("Không thể tải danh sách yêu thích");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRemove = async (productId: string) => {
    try {
      await removeFromWishlist(productId);
      toast.success("Đã xoá khỏi danh sách yêu thích");
      load();
    } catch (err: any) {
      toast.error(err?.message || "Không thể xoá sản phẩm");
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  const resolveImage = (p: WishlistItem["product"]) => {
    const raw = p.images?.[0];
    if (!raw) return "/placeholder.png";
    if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
    return BASE_ORIGIN + raw;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* HERO NHẸ NHÀNG */}
        <section className="relative border-b bg-gradient-to-r from-primary/10 via-background to-primary/10 py-8 md:py-10">
          <div className="pointer-events-none absolute -left-16 top-4 h-28 w-28 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -right-16 bottom-0 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />

          <div className="container relative mx-auto px-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary/80">
                Danh sách yêu thích
              </p>
              <h1 className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight">
                Sản phẩm bạn đang quan tâm
              </h1>
              <p className="mt-1 text-sm text-muted-foreground max-w-xl">
                Lưu lại những sản phẩm yêu thích để dễ dàng xem lại và đặt mua bất cứ lúc nào.
              </p>
            </div>

            <Link to="/products" className="mt-3 md:mt-0">
              <Button variant="outline" size="sm" className="gap-1.5">
                <ArrowLeft className="h-4 w-4" />
                Tiếp tục mua sắm
              </Button>
            </Link>
          </div>
        </section>

        {/* NỘI DUNG */}
        <section className="py-10">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                Đang tải danh sách yêu thích...
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border bg-card/60 py-14 px-6 text-center">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-lg font-semibold mb-1">
                  Chưa có sản phẩm nào trong danh sách yêu thích
                </h2>
                <p className="text-sm text-muted-foreground mb-4 max-w-md">
                  Thêm sản phẩm vào danh sách yêu thích để theo dõi giá và đặt mua nhanh chóng.
                </p>
                <Link to="/products">
                  <Button className="gap-1.5">
                    <ShoppingBag className="h-4 w-4" />
                    Khám phá sản phẩm
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-6 flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    Bạn có{" "}
                    <span className="font-medium text-foreground">
                      {items.length}
                    </span>{" "}
                    sản phẩm trong danh sách yêu thích
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {items.map((item) => {
                    const p = item.product;
                    return (
                      <Card
                        key={item._id}
                        className="group flex h-full flex-col overflow-hidden border-border/70 bg-card/80 hover:border-primary/50 hover:shadow-md transition-all duration-200"
                      >
                        <Link to={`/products/${p._id}`} className="flex-1">
                          <div className="relative aspect-[4/3] overflow-hidden bg-muted/40">
                            <img
                              src={resolveImage(p)}
                              alt={p.name}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            {!p.inStock && (
                              <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-[11px]">
                                Hết hàng
                              </Badge>
                            )}
                            {p.inStock && (
                              <Badge className="absolute top-3 left-3 bg-emerald-500/90 text-[11px]">
                                Còn hàng
                              </Badge>
                            )}
                          </div>

                          <CardContent className="p-4 space-y-2">
                            <h3 className="line-clamp-2 text-sm font-semibold group-hover:text-primary transition-colors">
                              {p.name}
                            </h3>

                            <div className="flex items-baseline gap-2">
                              <span className="text-base font-semibold text-primary">
                                {formatPrice(p.price)}
                              </span>
                              {p.compareAtPrice && p.compareAtPrice > p.price && (
                                <span className="text-xs text-muted-foreground line-through">
                                  {formatPrice(p.compareAtPrice)}
                                </span>
                              )}
                            </div>
                          </CardContent>
                        </Link>

                        <CardFooter className="flex gap-2 p-4 pt-0">
                          <Link to={`/products/${p._id}`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full text-xs">
                              Xem chi tiết
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-destructive hover:text-destructive"
                            onClick={() => handleRemove(p._id)}
                          >
                            <Heart className="h-4 w-4 fill-destructive/80" />
                          </Button>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
