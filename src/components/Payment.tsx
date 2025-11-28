// src/pages/Payment.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

import { createPaymentIntent, confirmPayment } from "@/api/paymentApi";
import { getOrderById } from "@/api/orderApi";
import { BASE_ORIGIN } from "@/api/Api";
import { toast } from "sonner";
import {
  ShoppingBag,
  Truck,
  User,
  Phone,
  MapPin,
  Hash,
} from "lucide-react";

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  console.error("❌ Missing VITE_STRIPE_PUBLIC_KEY in .env");
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "");

/* ========= types ========= */

type OrderAddress = {
  fullName?: string;
  phone?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  country?: string;
};

type OrderItem = {
  _id: string;
  name: string;
  variantName?: string | null;
  sku?: string;
  image?: string;
  price: number;
  quantity: number;
  totalPrice: number;
  productId?: {
    _id: string;
    name: string;
    slug?: string;
    thumbnail?: string;
    images?: string[];
  };
};

type Order = {
  _id: string;
  orderNumber?: string;
  number?: string;
  status: string;
  paymentStatus?: string;
  paymentMethod?: string;
  subtotal?: number;
  taxAmount?: number;
  shippingAmount?: number;
  discountAmount?: number;
  totalAmount?: number;
  total?: number;
  currency?: string;
  shippingAddress?: OrderAddress;
  billingAddress?: OrderAddress;
  items?: OrderItem[];
};

const resolveImageUrl = (url?: string | null) => {
  if (!url) return "/placeholder.png";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${BASE_ORIGIN}${url.startsWith("/") ? url : `/${url}`}`;
};

const money = (n: number | null | undefined) =>
  Number(n ?? 0).toLocaleString("vi-VN");

// helper check ObjectId
const isValidObjectId = (value?: string) =>
  !!value && /^[0-9a-fA-F]{24}$/.test(value);

/* ========= form Stripe ========= */

function StripePaymentForm({ order }: { order: Order }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const amount = Number(order?.totalAmount ?? order?.total ?? 0); // chỉ dùng để hiển thị

  const payNow = async () => {
    if (!stripe || !elements) return;

    try {
      setLoading(true);

      const intent = await createPaymentIntent(order._id);
      const card = elements.getElement(CardElement);

      const result = await stripe.confirmCardPayment(intent.clientSecret, {
        payment_method: { card },
      });

      if (result.error) {
        toast.error(result.error.message);
        setLoading(false);
        return;
      }

      await confirmPayment(result.paymentIntent.id);

      toast.success("Thanh toán thành công");
      navigate(`/orders/${order._id}`);
    } catch (err: any) {
      toast.error(err.message || "Thanh toán thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border border-slate-200/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Thanh toán bằng thẻ (Stripe)</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm">
          Tổng thanh toán:
          <span className="text-primary font-bold text-lg ml-2">
            {money(order.totalAmount ?? order.total)}₫
          </span>
        </p>

        <div className="p-4 border rounded-lg bg-slate-50">
          <CardElement options={{ style: { base: { fontSize: "16px" } } }} />
        </div>

        <Button onClick={payNow} disabled={loading} className="w-full mt-2">
          {loading ? "Đang xử lý..." : "Thanh toán ngay"}
        </Button>
      </CardContent>
    </Card>
  );
}

/* ========= page ========= */

export default function Payment() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const validId = isValidObjectId(id);

  const loadOrder = async () => {
    try {
      const res = await getOrderById(id!); // API trả json.data -> chính là order
      const orderData: Order =
        (res as any)?.data?.data ??
        (res as any)?.data ??
        (res as any).order ??
        (res as any);
      setOrder(orderData);
    } catch (err: any) {
      toast.error(err.message || "Không tìm thấy đơn hàng");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (validId) {
      loadOrder();
    } else {
      // id không phải ObjectId (ví dụ "success", "cancel") => không gọi API
      setLoading(false);
    }
  }, [validId, id]);

  if (loading) return <div className="p-10">Loading...</div>;

  // Trường hợp id không hợp lệ (không phải ObjectId)
  if (!validId) {
    return (
      <>
        <Header />
        <main className="container mx-auto py-16">
          <Card className="max-w-md mx-auto text-center">
            <CardHeader>
              <CardTitle>Liên kết thanh toán không hợp lệ</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Có thể bạn vừa quay lại từ cổng thanh toán hoặc đường dẫn này
                không đúng. Vui lòng kiểm tra lại đơn hàng của bạn.
              </p>
              <Button onClick={() => navigate("/orders")}>
                Xem đơn hàng của tôi
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Header />
        <main className="container mx-auto py-16">
          <Card className="max-w-md mx-auto text-center">
            <CardHeader>
              <CardTitle>Không tìm thấy đơn hàng</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Vui lòng kiểm tra lại link thanh toán.
              </p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </>
    );
  }

  const isStripe = order.paymentMethod === "stripe";
  const isPaid = order.paymentStatus === "paid";

  const subtotal = order.subtotal ?? 0;
  const tax = order.taxAmount ?? 0;
  const shipping = order.shippingAmount ?? 0;
  const discount = order.discountAmount ?? 0;
  const total = Number(order.totalAmount ?? order.total ?? 0);

  const orderNumber = order.orderNumber ?? order.number ?? order._id;

  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-160px)] bg-gradient-to-b from-slate-50 via-slate-50 to-slate-100">
        <div className="container mx-auto py-10 max-w-5xl space-y-6">
          {/* Tóm tắt đơn hàng */}
          <Card className="border border-slate-200/70 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                Đơn hàng #{orderNumber}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-700">
              <div className="flex justify-between">
                <span>Trạng thái đơn</span>
                <span className="font-medium">{order.status}</span>
              </div>
              <div className="flex justify-between">
                <span>Trạng thái thanh toán</span>
                <span className="font-medium">
                  {order.paymentStatus ?? "pending"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Phương thức thanh toán</span>
                <span className="font-medium">
                  {order.paymentMethod || "—"}
                </span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between">
                <span>Tạm tính</span>
                <span>{money(subtotal)}₫</span>
              </div>
              <div className="flex justify-between">
                <span>Thuế</span>
                <span>{money(tax)}₫</span>
              </div>
              <div className="flex justify-between">
                <span>Vận chuyển</span>
                <span>{money(shipping)}₫</span>
              </div>
              <div className="flex justify-between">
                <span>Giảm giá</span>
                <span>-{money(discount)}₫</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between items-center">
                <span className="font-semibold">Tổng thanh toán</span>
                <span className="font-bold text-primary text-lg">
                  {money(total)}₫
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-[1.7fr_1.3fr]">
            {/* LEFT: Sản phẩm + giao hàng */}
            <div className="space-y-6">
              {/* danh sách sản phẩm */}
              <Card className="border border-slate-200/70 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">
                    Sản phẩm ({order.items?.length ?? 0})
                  </CardTitle>
                </CardHeader>
                <Separator />
                <CardContent className="pt-4">
                  {order.items && order.items.length > 0 ? (
                    <ScrollArea className="max-h-[360px] pr-2">
                      <div className="space-y-4">
                        {order.items.map((i) => {
                          const rawImage =
                            i.image ||
                            i.productId?.thumbnail ||
                            i.productId?.images?.[0] ||
                            "";
                          const image = resolveImageUrl(rawImage);

                          return (
                            <div
                              key={i._id}
                              className="flex gap-4 border border-slate-100 rounded-xl p-3 bg-white/60"
                            >
                              <div className="w-20 h-20 flex-shrink-0 overflow-hidden rounded-lg border bg-slate-100">
                                <img
                                  src={image}
                                  alt={i.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 flex flex-col gap-1">
                                <div className="flex justify-between gap-2">
                                  <div>
                                    <div className="font-semibold text-sm">
                                      {i.name}
                                    </div>
                                    {i.variantName && (
                                      <div className="text-xs text-muted-foreground">
                                        Phân loại: {i.variantName}
                                      </div>
                                    )}
                                    {i.sku && (
                                      <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                                        <Hash className="w-3 h-3" />
                                        <span>SKU: {i.sku}</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-right text-sm">
                                    <div className="font-semibold">
                                      {money(i.totalPrice)}₫
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {i.quantity} × {money(i.price)}₫
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Không có sản phẩm trong đơn hàng.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* thông tin giao hàng */}
              <Card className="border border-slate-200/70 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    Thông tin giao hàng
                  </CardTitle>
                </CardHeader>
                <Separator />
                <CardContent className="pt-4 text-sm text-slate-700 space-y-1.5">
                  {order.shippingAddress ? (
                    <>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span>{order.shippingAddress.fullName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{order.shippingAddress.phone}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <div>
                          <div>{order.shippingAddress.addressLine1}</div>
                          <div className="text-xs text-muted-foreground">
                            {[order.shippingAddress.city,
                            order.shippingAddress.state,
                            order.shippingAddress.country]
                              .filter(Boolean)
                              .join(", ")}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Chưa có thông tin giao hàng.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* RIGHT: form Stripe / thông báo */}
            <div className="space-y-4">
              {!isStripe || isPaid ? (
                <Card className="border border-slate-200/70 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {isPaid
                        ? "Đơn hàng đã được thanh toán"
                        : "Đơn hàng không sử dụng thanh toán online"}
                  </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    <p>
                      {isPaid
                        ? "Bạn không cần thanh toán thêm. Có thể xem chi tiết đơn hàng ở trang Đơn hàng của tôi."
                        : "Phương thức thanh toán của đơn này không phải Stripe (ví dụ COD, PayOS). Bạn không cần thanh toán tại đây."}
                    </p>
                    <Button
                      className="mt-4"
                      onClick={() => navigate(`/orders/${order._id}`)}
                    >
                      Xem chi tiết đơn hàng
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Elements stripe={stripePromise}>
                  <StripePaymentForm order={order} />
                </Elements>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
