"use client";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getUserOrders } from "@/api/orderApi";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import {
  Loader2,
  ShoppingBag,
  CalendarClock,
  WalletCards,
  Truck,
} from "lucide-react";

type OrderAddress = {
  fullName?: string;
  phone?: string;
  addressLine1?: string;
  city?: string;
};

type Order = {
  _id: string;
  orderNumber?: string;
  number?: string; // fallback nếu FE đang dùng field này
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
  createdAt?: string;
  shippingAddress?: OrderAddress;
};

const money = (n: number | undefined | null) =>
  Number(n ?? 0).toLocaleString("vi-VN");

const formatDateTime = (iso?: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  processing: "Đang xử lý",
  shipping: "Đang giao",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
  failed: "Thanh toán thất bại",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: "Chờ thanh toán",
  paid: "Đã thanh toán",
  failed: "Thất bại",
  refunded: "Đã hoàn tiền",
};

const getStatusVariant = (status: string): "default" | "secondary" | "outline" | "destructive" => {
  switch (status) {
    case "completed":
      return "default";
    case "shipping":
    case "processing":
    case "confirmed":
      return "secondary";
    case "cancelled":
    case "failed":
      return "destructive";
    default:
      return "outline";
  }
};

const getPaymentStatusVariant = (
  status?: string
): "default" | "secondary" | "outline" | "destructive" => {
  switch (status) {
    case "paid":
      return "default";
    case "pending":
      return "secondary";
    case "failed":
    case "refunded":
      return "destructive";
    default:
      return "outline";
  }
};

const MyOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      try {
        // Giả định getUserOrders() trả về { orders, ... }
        const data = await getUserOrders();
        setOrders(data.orders || []);
      } catch (error) {
        console.error("Lỗi lấy đơn hàng:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      <Header />

      <div className="min-h-[calc(100vh-160px)] bg-gradient-to-b from-slate-50 via-slate-50 to-slate-100">
        <div className="container mx-auto py-10 max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Đơn hàng của tôi
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Xem lại lịch sử mua hàng và trạng thái xử lý đơn.
              </p>
            </div>

            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
              <ShoppingBag className="w-5 h-5" />
              <span>{orders.length} đơn hàng</span>
            </div>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Đang tải đơn hàng…</span>
              </div>
            </div>
          )}

          {!loading && orders.length === 0 && (
            <Card className="mt-4">
              <CardContent className="py-10 flex flex-col items-center justify-center text-center gap-3">
                <ShoppingBag className="w-10 h-10 text-muted-foreground" />
                <p className="font-medium">Bạn chưa có đơn hàng nào</p>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Hãy bắt đầu mua sắm và trải nghiệm những sản phẩm tốt nhất
                  từ cửa hàng.
                </p>
              </CardContent>
            </Card>
          )}

          {!loading && orders.length > 0 && (
            <div className="space-y-4">
              {orders.map((o) => {
                const orderNumber = o.orderNumber ?? o.number ?? o._id;
                const total =
                  o.totalAmount ?? o.total ?? o.subtotal ?? 0;
                const statusLabel =
                  STATUS_LABELS[o.status] ?? o.status ?? "—";
                const paymentStatusLabel =
                  o.paymentStatus &&
                  (PAYMENT_STATUS_LABELS[o.paymentStatus] ||
                    o.paymentStatus);
                const shippingName = o.shippingAddress?.fullName;
                const shippingCity = o.shippingAddress?.city;

                return (
                  <Link
                    key={o._id}
                    to={`/orders/${o._id}`}
                    className="block group"
                  >
                    <Card className="border border-slate-200/70 shadow-sm group-hover:shadow-lg transition-all duration-150 group-hover:-translate-y-0.5">
                      <CardHeader className="pb-3 flex flex-row items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-base font-semibold">
                              Đơn hàng{" "}
                              <span className="text-primary">
                                #{orderNumber}
                              </span>
                            </CardTitle>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <CalendarClock className="w-3.5 h-3.5" />
                            <span>Ngày đặt: {formatDateTime(o.createdAt)}</span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <Badge variant={getStatusVariant(o.status)}>
                            {statusLabel}
                          </Badge>
                          {paymentStatusLabel && (
                            <Badge
                              variant={getPaymentStatusVariant(
                                o.paymentStatus
                              )}
                              className="text-[11px]"
                            >
                              {paymentStatusLabel}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>

                      <Separator />

                      <CardContent className="pt-3 pb-4 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                          <div className="flex items-center gap-2 text-sm">
                            <WalletCards className="w-4 h-4 text-muted-foreground" />
                            <div className="flex flex-col">
                              <span className="text-muted-foreground text-xs">
                                Tổng thanh toán
                              </span>
                              <span className="font-semibold">
                                {money(total)}₫{" "}
                                {o.currency && (
                                  <span className="text-xs text-muted-foreground">
                                    ({o.currency})
                                  </span>
                                )}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            <Truck className="w-4 h-4 text-muted-foreground" />
                            <div className="flex flex-col items-start">
                              <span className="text-muted-foreground text-xs">
                                Giao đến
                              </span>
                              <span className="font-medium">
                                {shippingName || "—"}
                              </span>
                              {shippingCity && (
                                <span className="text-xs text-muted-foreground">
                                  {shippingCity}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                            <div className="flex flex-col items-start">
                              <span className="text-muted-foreground text-xs">
                                Hình thức thanh toán
                              </span>
                              <span className="font-medium">
                                {o.paymentMethod || "—"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <p className="mt-1 text-xs text-muted-foreground italic">
                          Nhấn vào thẻ đơn hàng để xem chi tiết sản phẩm, bảo
                          hành và theo dõi lộ trình giao hàng.
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default MyOrders;
