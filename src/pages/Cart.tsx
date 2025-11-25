"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Shield,
  Tag,
  CreditCard,
  ArrowLeft,
  Truck,
} from "lucide-react";

import { useEffect, useState } from "react";
import { getCart, updateCartItem, removeCartItem } from "@/api/cartApi";
import { BASE_ORIGIN } from "@/api/Api";
import { toast } from "sonner";

const Cart = () => {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadCart = async () => {
    try {
      setLoading(true);
      const data = await getCart();
      setCart(data);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const updateQty = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;

    try {
      const updated = await updateCartItem(itemId, quantity);
      setCart(updated);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const updated = await removeCartItem(itemId);
      setCart(updated);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center text-sm text-muted-foreground">
        Đang tải giỏ hàng...
      </div>
    );

  if (!cart || !cart.items || cart.items.length === 0)
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center">
          <Card className="max-w-md mx-auto text-center py-10 px-6 border-dashed">
            <CardContent className="space-y-4">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mx-auto">
                <ShoppingCart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Giỏ hàng trống</h3>
              <p className="text-sm text-muted-foreground">
                Thêm sản phẩm vào giỏ hàng để bắt đầu trải nghiệm mua sắm.
              </p>
              <Link to="/products">
                <Button size="sm" className="mt-2">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Tiếp tục mua sắm
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );

  const subtotal = cart.subtotal;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pb-20">
        {/* HERO GỌN GÀNG */}
        <section className="relative border-b bg-gradient-to-r from-primary/5 via-background to-primary/5 py-8 md:py-10">
          <div className="pointer-events-none absolute -left-16 top-6 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -right-16 bottom-0 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />

          <div className="container relative mx-auto px-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                  <ShoppingCart className="h-3.5 w-3.5" />
                  Giỏ hàng của bạn
                </div>
                <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                  Xem lại sản phẩm trước khi thanh toán
                </h1>
                <p className="text-sm text-muted-foreground">
                  Bạn hiện có{" "}
                  <span className="font-semibold text-foreground">
                    {cart.totalItems} sản phẩm
                  </span>{" "}
                  trong giỏ hàng.
                </p>
              </div>

              <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground md:mt-0">
                <div className="flex items-center gap-2 rounded-xl border bg-card/70 px-3 py-2">
                  <Truck className="h-4 w-4 text-primary" />
                  <span>Hỗ trợ giao nhanh nội thành</span>
                </div>
                <div className="hidden md:flex items-center gap-2 rounded-xl border bg-card/70 px-3 py-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span>Bảo hành theo từng máy</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MAIN CONTENT */}
        <div className="container mx-auto px-4 py-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* LIST ITEMS */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-semibold">
                Sản phẩm ({cart.items.length})
              </h2>
              <p className="text-xs text-muted-foreground">
                Nhấn vào dấu + / - để điều chỉnh số lượng
              </p>
            </div>

            <div className="space-y-3">
              {cart.items.map((item: any) => {
                const image =
                  item.productId.thumbnail
                    ? BASE_ORIGIN + item.productId.thumbnail
                    : item.productId.images?.length > 0
                    ? BASE_ORIGIN + item.productId.images[0]
                    : "/placeholder.png";

                const lineTotal = item.price * item.quantity;

                return (
                  <Card
                    key={item._id}
                    className="border-border/70 bg-card/70 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4 md:p-5">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start">
                        {/* IMAGE */}
                        <div className="flex-shrink-0">
                          <div className="relative h-24 w-24 overflow-hidden rounded-xl border bg-muted/40">
                            <img
                              src={image}
                              alt={item.productId.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        </div>

                        {/* INFO + QTY */}
                        <div className="flex-1 space-y-3">
                          <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between">
                            <div>
                              <h3 className="font-medium leading-snug line-clamp-2">
                                {item.productId.name}
                              </h3>
                              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                                {item.productId.inStock ? (
                                  <Badge className="bg-emerald-500/90 text-xs text-white">
                                    Còn hàng
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="destructive"
                                    className="text-xs"
                                  >
                                    Hết hàng
                                  </Badge>
                                )}
                                {item.variantId?.name && (
                                  <span className="rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground">
                                    Phân loại: {item.variantId.name}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* PRICE RIGHT (DESKTOP) */}
                            <div className="hidden text-right md:block">
                              <p className="text-xs text-muted-foreground">
                                Đơn giá
                              </p>
                              <p className="text-sm font-medium">
                                {formatPrice(item.price)}
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                Thành tiền
                              </p>
                              <p className="text-base font-semibold text-primary">
                                {formatPrice(lineTotal)}
                              </p>
                            </div>
                          </div>

                          {/* QTY + ACTIONS */}
                          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-center gap-3">
                              <div className="inline-flex items-center rounded-full border bg-background px-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() =>
                                    updateQty(item._id, item.quantity - 1)
                                  }
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>

                                <span className="w-9 text-center text-sm font-medium">
                                  {item.quantity}
                                </span>

                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() =>
                                    updateQty(item._id, item.quantity + 1)
                                  }
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>

                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500"
                                onClick={() => removeItem(item._id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            {/* PRICE (MOBILE) */}
                            <div className="md:hidden text-right">
                              <p className="text-xs text-muted-foreground">
                                Đơn giá
                              </p>
                              <p className="text-sm font-medium">
                                {formatPrice(item.price)}
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                Thành tiền
                              </p>
                              <p className="text-base font-semibold text-primary">
                                {formatPrice(lineTotal)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* SUMMARY */}
          <div>
            <Card className="sticky top-24 border-border/80 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Tóm tắt đơn hàng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tạm tính</span>
                  <span className="font-medium">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                {/* Có thể thêm VAT, phí ship sau này */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Phí vận chuyển</span>
                  <span>Được tính ở bước tiếp theo</span>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[15px]">Tổng cộng</span>
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary">
                      {formatPrice(subtotal)}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Đã bao gồm VAT (nếu có)
                    </p>
                  </div>
                </div>

                {/* Info / benefit block */}
                <div className="space-y-2 rounded-xl bg-muted/60 p-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-primary" />
                    <span>Miễn phí giao hàng với đơn từ 5.000.000₫.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span>Bảo hành theo từng sản phẩm sau khi đặt hàng.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary" />
                    <span>Nhập mã ưu đãi ở bước thanh toán.</span>
                  </div>
                </div>

                <Link to="/checkout">
                  <Button className="w-full" size="lg">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Thanh toán
                  </Button>
                </Link>

                <Link to="/products">
                  <Button
                    variant="outline"
                    className="w-full mt-2"
                    size="sm"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Tiếp tục mua sắm
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cart;
