// src/pages/ReviewProductSelectorPage.tsx
"use client";

import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AccountLayout from "./AccountLayout";
import { getPurchasedProductsForReview } from "@/api/reviewApi";
import { BASE_ORIGIN } from "@/api/Api";

type PurchasedProduct = {
  _id: string;
  name: string;
  slug?: string;
  price?: number;      // giá gốc
  paidPrice?: number;  // 👈 giá đã giảm
  thumbnail?: string | null;
  hasReviewed: boolean;
};


const formatPrice = (price?: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price || 0);

export default function ReviewProductSelectorPage() {
  const [products, setProducts] = useState<PurchasedProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loadPurchased = async () => {
    try {
      setLoading(true);
      const data = await getPurchasedProductsForReview();
      setProducts(data || []);
    } catch (err: any) {
      toast.error(
        err.message || "Không lấy được danh sách sản phẩm đã mua để đánh giá"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPurchased();
  }, []);

  return (
    <AccountLayout>
      <div className="min-h-screen flex flex-col bg-slate-50">
        <main className="flex-1">
          <div className="mx-auto max-w-5xl px-4 py-6">
            <div className="mb-4 flex items-center justify-between gap-2">
              <div>
                <h1 className="text-lg font-semibold">Đánh giá sản phẩm</h1>
                <p className="text-sm text-muted-foreground">
                  Chọn sản phẩm bạn đã mua để viết hoặc xem đánh giá.
                </p>
              </div>
              <Link to="/my-orders">
                <Button variant="outline" size="sm" className="text-xs">
                  Xem đơn hàng
                </Button>
              </Link>
            </div>

            <Card className="border border-slate-200">
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  Sản phẩm đã mua
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {loading && (
                  <p className="text-sm text-muted-foreground">
                    Đang tải danh sách sản phẩm...
                  </p>
                )}

                {!loading && products.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Bạn chưa có sản phẩm nào đủ điều kiện để đánh giá (đơn hàng
                    chưa giao hoặc chưa mua sản phẩm).
                  </p>
                )}

                {!loading &&
                  products.map((p) => {
                    const thumb = p.thumbnail
                      ? `${BASE_ORIGIN}${p.thumbnail}`
                      : "/placeholder.png";

                    return (
                      <div
                        key={p._id}
                        className="flex items-center gap-3 rounded-lg border border-slate-200/80 bg-white p-3"
                      >
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border bg-slate-50">
                          <img
                            src={thumb}
                            alt={p.name}
                            className="h-full w-full object-contain"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-2">
                            {p.name}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {formatPrice(p.paidPrice ?? p.price)}
                          </p>

                          <div className="mt-1 flex items-center gap-2">
                            {p.hasReviewed ? (
                              <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px]">
                                Đã đánh giá
                              </Badge>
                            ) : (
                              <Badge className="bg-sky-50 text-sky-700 border border-sky-200 text-[11px]">
                                Chưa đánh giá
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            className="text-xs"
                            onClick={() =>
                              navigate(`/my-reviews/${p._id}`, {
                                state: { productName: p.name },
                              })
                            }
                          >
                            {p.hasReviewed ? "Xem / Sửa đánh giá" : "Đánh giá ngay"}
                          </Button>
                          {p.slug && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-[11px]"
                              onClick={() => navigate(`/products/${p._id}`)}
                            >
                              Xem sản phẩm
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </AccountLayout>
  );
}
