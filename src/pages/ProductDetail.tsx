"use client";

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BASE_ORIGIN } from "@/api/Api";
import ProductReviews from "./ProductReviews";
import { addToWishlist, checkWishlist } from "@/api/wishlistApi";
import { toast } from "sonner";
import { Heart, ArrowLeft } from "lucide-react";

type Product = {
  _id: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  description?: string;
  images?: string[];
  inStock?: boolean;
  sku?: string;
};

const ProductDetail = () => {
  const { id } = useParams(); // route: /products/:id
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const [inWishlist, setInWishlist] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

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

  useEffect(() => {
    if (id) loadProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Kiểm tra có trong wishlist chưa
  useEffect(() => {
    if (product?._id) {
      checkWishlist(product._id)
        .then((v) => setInWishlist(!!v))
        .catch(() => {});
    }
  }, [product]);

  const handleToggleWishlist = async () => {
    if (!product) return;
    try {
      await addToWishlist(product._id);
      setInWishlist(true);
      toast.success("Đã thêm sản phẩm vào danh sách yêu thích");
    } catch (err: any) {
      toast.error(err?.message || "Không thể thêm vào danh sách yêu thích");
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  if (loading || !product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-10 text-sm text-muted-foreground">
          Đang tải sản phẩm...
        </main>
        <Footer />
      </div>
    );
  }

  const images = product.images && product.images.length > 0
    ? product.images
    : [];

  const mainImage =
    images.length > 0
      ? BASE_ORIGIN + images[selectedImageIndex]
      : "/placeholder.png";

  const hasDiscount =
    product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* HERO GỌN GÀNG */}
        <section className="relative border-b bg-gradient-to-r from-primary/5 via-background to-primary/5 py-6 md:py-8">
          <div className="pointer-events-none absolute -left-16 top-4 h-28 w-28 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -right-16 bottom-0 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />

          <div className="container relative mx-auto px-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-[11px] uppercase tracking-[0.2em] text-primary/80">
                  Chi tiết sản phẩm
                </p>
                <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
                  {product.name}
                </h1>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>Mã sản phẩm: {product.sku || "Đang cập nhật"}</span>
                  <span className="h-3 w-px bg-border" />
                  {product.inStock ? (
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-600">
                      Còn hàng
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-medium text-destructive">
                      Hết hàng
                    </span>
                  )}
                </div>
              </div>

              <Link
                to="/products"
                className="hidden md:inline-flex items-center text-xs text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                Quay lại danh sách
              </Link>
            </div>
          </div>
        </section>

        {/* NỘI DUNG CHÍNH */}
        <section className="py-10">
          <div className="container mx-auto px-4 grid gap-10 lg:grid-cols-2">
            {/* LEFT: IMAGE + THUMBNAIL */}
            <div className="space-y-4">
              <Card className="overflow-hidden border-border/70 bg-card/70">
                <CardContent className="p-4">
                  <div className="aspect-square w-full overflow-hidden rounded-2xl bg-muted/40 flex items-center justify-center">
                    <img
                      src={mainImage}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </CardContent>
              </Card>

              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border bg-muted/30 ${
                        idx === selectedImageIndex
                          ? "border-primary ring-2 ring-primary/40"
                          : "border-border/60"
                      }`}
                    >
                      <img
                        src={BASE_ORIGIN + img}
                        alt={`thumb-${idx}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT: INFO + ACTIONS */}
            <div className="space-y-6">
              {/* Price block */}
              <Card className="border-border/70 bg-card/80">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        Giá sản phẩm
                      </p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-semibold text-primary">
                          {formatPrice(product.price)}
                        </span>

                        {product.compareAtPrice && (
                          <span className="text-sm text-muted-foreground line-through">
                            {formatPrice(product.compareAtPrice)}
                          </span>
                        )}
                      </div>

                      {hasDiscount && (
                        <p className="text-xs text-emerald-600">
                          Tiết kiệm{" "}
                          <span className="font-medium">
                            {formatPrice(
                              (product.compareAtPrice || 0) - product.price
                            )}
                          </span>{" "}
                          so với giá niêm yết.
                        </p>
                      )}
                    </div>

                    {hasDiscount && (
                      <Badge className="bg-destructive text-destructive-foreground text-xs px-3 py-1 rounded-full">
                        Giảm{" "}
                        {Math.round(
                          (((product.compareAtPrice || 0) - product.price) /
                            (product.compareAtPrice || 1)) *
                            100
                        )}
                        %
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              <div className="space-y-2">
                <h2 className="text-sm font-semibold tracking-tight">
                  Mô tả sản phẩm
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                  {product.description || "Chưa có mô tả chi tiết."}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  size="lg"
                  className="flex-1"
                  disabled={!product.inStock}
                >
                  Thêm vào giỏ hàng
                </Button>

                <Button
                  type="button"
                  variant={inWishlist ? "secondary" : "outline"}
                  size="icon"
                  className="h-10 w-10"
                  onClick={handleToggleWishlist}
                >
                  <Heart
                    className={`h-5 w-5 ${
                      inWishlist ? "fill-primary text-primary" : ""
                    }`}
                  />
                </Button>
              </div>

              {/* Info small */}
              <div className="grid grid-cols-1 gap-3 rounded-xl border bg-muted/40 p-4 text-xs text-muted-foreground sm:grid-cols-2">
                <div>
                  <p className="font-medium text-foreground mb-1">
                    Giao hàng & bảo hành
                  </p>
                  <p>Hỗ trợ giao hàng toàn quốc.</p>
                  <p>
                    Bảo hành theo từng máy được kích hoạt sau khi đặt mua
                    thành công.
                  </p>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">
                    Hỗ trợ & đổi trả
                  </p>
                  <p>Hỗ trợ kỹ thuật trong suốt quá trình sử dụng.</p>
                  <p>Chính sách đổi trả theo quy định cửa hàng.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* REVIEWS */}
        <section className="pb-16">
          <div className="container mx-auto px-4">
            <Card className="border-border/70 bg-card/80">
              <CardContent className="p-5 md:p-6">
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
