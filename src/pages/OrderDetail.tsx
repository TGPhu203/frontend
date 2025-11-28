"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

import { getOrderById, cancelOrder } from "@/api/orderApi";
import { BASE_ORIGIN } from "@/api/Api";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

import {
  Loader2,
  ShoppingBag,
  CalendarClock,
  WalletCards,
  Truck,
  User,
  Phone,
  MapPin,
  CreditCard,
  ShieldCheck,
  Hash,
  FileText,
} from "lucide-react";

type OrderAddress = {
  fullName?: string;
  phone?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  country?: string;
};

type WarrantyPkg = {
  _id: string;
  name: string;
  durationMonths?: number;
  price?: number;
};

type OrderItem = {
  _id: string;
  productId?: {
    _id: string;
    name: string;
    slug?: string;
    thumbnail?: string;
    images?: string[];
  };
  variantId?: {
    _id: string;
    name: string;
  };
  warrantyPackageId?: WarrantyPkg;
  name: string;
  variantName?: string | null;
  sku?: string;
  image?: string;
  price: number;
  quantity: number;
  totalPrice: number;
  imei?: string;

  warrantyStartAt?: string;
  warrantyEndAt?: string | null;
  warrantyStatus?: string;
};

type Order = {
  _id: string;
  orderNumber?: string;
  number?: string;
  status: string;
  paymentStatus?: string;
  paymentMethod?: string;
  paymentTransactionId?: string;

  subtotal?: number;
  taxAmount?: number;
  shippingAmount?: number;
  discountAmount?: number;
  totalAmount?: number;
  total?: number;
  currency?: string;

  shippingAddress?: OrderAddress;
  billingAddress?: OrderAddress;

  notes?: string;
  createdAt?: string;
  updatedAt?: string;

  items?: OrderItem[];
};

const resolveImageUrl = (url?: string | null) => {
  if (!url) return "/placeholder.png";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${BASE_ORIGIN}${url.startsWith("/") ? url : `/${url}`}`;
};

const money = (n: number | null | undefined) =>
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
    hour12: false,
  });
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  processing: "Đang xử lý",
  shipping: "Đang giao hàng",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
  failed: "Thanh toán thất bại",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: "Chờ thanh toán",
  paid: "Đã thanh toán",
  failed: "Thanh toán thất bại",
  refunded: "Đã hoàn tiền",
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cod: "Thanh toán khi nhận hàng (COD)",
  stripe: "Thanh toán online (Stripe)",
  vnpay: "Thanh toán qua VNPay",
};

const getStatusVariant = (
  status: string
): "default" | "secondary" | "outline" | "destructive" => {
  switch (status) {
    case "completed":
      return "default";
    case "shipping":
    case "processing":
    case "confirmed":
    case "pending":
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

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!id || id === ":id") {
      setLoading(false);
      setOrder(null);
      toast.error("Mã đơn hàng không hợp lệ.");
      return;
    }

    try {
      setLoading(true);
      const res = await getOrderById(id);
      const orderData: Order =
        res?.data?.data ?? res?.data ?? res?.order ?? res;
      setOrder(orderData);
    } catch (e: any) {
      toast.error(e?.message || "Không thể tải đơn hàng, vui lòng thử lại.");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleCancel = async () => {
    if (!id) return;
    try {
      await cancelOrder(id);
      toast.success("Đơn hàng đã được hủy.");
      load();
    } catch (e: any) {
      toast.error(e?.message || "Hủy đơn hàng thất bại, vui lòng thử lại.");
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-[calc(100vh-160px)] flex items-center justify-center bg-slate-50">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Đang tải đơn hàng...</span>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Header />
        <div className="min-h-[calc(100vh-160px)] flex items-center justify-center bg-slate-50">
          <Card className="p-8 max-w-md text-center">
            <ShoppingBag className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
            <p className="font-semibold mb-1">Không tìm thấy đơn hàng</p>
            <p className="text-sm text-muted-foreground">
              Bạn vui lòng kiểm tra lại mã đơn hàng hoặc quay về trang đơn hàng
              của tôi.
            </p>
            <Button className="mt-4" variant="outline" onClick={() => navigate(-1)}>
              Quay lại
            </Button>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  const orderNumber = order.orderNumber ?? order.number ?? order._id;
  const statusLabel = STATUS_LABELS[order.status] ?? order.status;
  const paymentStatusLabel =
    order.paymentStatus &&
    (PAYMENT_STATUS_LABELS[order.paymentStatus] ?? order.paymentStatus);

  const canCancel = ["pending", "confirmed"].includes(order.status);

  const canPayByStripe =
    order.paymentMethod === "stripe" &&
    order.paymentStatus !== "paid" &&
    ["pending", "confirmed"].includes(order.status);

  const subtotal = order.subtotal ?? 0;
  const tax = order.taxAmount ?? 0;
  const shipping = order.shippingAmount ?? 0;
  const discount = order.discountAmount ?? 0;
  const total = order.totalAmount ?? order.total ?? 0;

  const paymentMethodLabel =
    (order.paymentMethod &&
      PAYMENT_METHOD_LABELS[order.paymentMethod] !== undefined &&
      PAYMENT_METHOD_LABELS[order.paymentMethod]) ||
    order.paymentMethod ||
    "—";

  return (
    <>
      <Header />

      <div className="min-h-[calc(100vh-160px)] bg-gradient-to-b from-slate-50 via-slate-50 to-slate-100">
        <div className="container mx-auto py-8 max-w-5xl">
          {/* Phần tiêu đề đơn hàng */}
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <ShoppingBag className="w-4 h-4" />
                <span>Chi tiết đơn hàng</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                Đơn hàng <span className="text-primary">#{orderNumber}</span>
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CalendarClock className="w-4 h-4" />
                  <span>Đặt lúc: {formatDateTime(order.createdAt)}</span>
                </div>
                {order.updatedAt && (
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>Cập nhật gần nhất: {formatDateTime(order.updatedAt)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col items-start md:items-end gap-2">
              <Badge variant={getStatusVariant(order.status)} className="px-3">
                {statusLabel}
              </Badge>
              {paymentStatusLabel && (
                <Badge
                  variant={getPaymentStatusVariant(order.paymentStatus)}
                  className="px-3 text-[11px]"
                >
                  {paymentStatusLabel}
                </Badge>
              )}

              {canCancel && (
                <Button
                  variant="destructive"
                  className="mt-1 w-full md:w-auto"
                  onClick={handleCancel}
                >
                  Hủy đơn hàng
                </Button>
              )}
            </div>
          </div>

          <div className="grid gap-0 md:grid-cols-[1.8fr_1.2fr] rounded-none">
            {/* Cột trái: Sản phẩm + ghi chú */}
            <div className="space-y-0 rounded-none">
              <Card className="border border-slate-200/70 shadow-sm rounded-none">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">Sản phẩm</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {order.items?.length ?? 0} sản phẩm
                    </Badge>
                  </div>
                </CardHeader>
                <Separator />
                <CardContent className="pt-4 rounded-none">
                  {order.items && order.items.length > 0 ? (
                    <ScrollArea className="max-h-[420px] pr-2 rounded-none">
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
                              className="flex gap-4 border border-slate-100  p-4 bg-white/50"
                            >
                              <div className="w-24 h-24 flex-shrink-0 overflow-hidden border bg-slate-100">
                                <img
                                  src={image}
                                  alt={i.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>

                              <div className="flex-1 flex flex-col gap-1">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <div className="font-semibold text-sm md:text-base">
                                      {i.name}
                                    </div>
                                    {i.variantName && (
                                      <div className="text-xs text-muted-foreground mt-0.5">
                                        Phân loại: {i.variantName}
                                      </div>
                                    )}
                                    {i.sku && (
                                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
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
                                      {i.quantity} x {money(i.price)}₫
                                    </div>
                                  </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                                  <span>Số lượng: {i.quantity}</span>
                                  {i.imei && (
                                    <span className="flex items-center gap-1">
                                      <ShieldCheck className="w-3 h-3" />
                                      IMEI: {i.imei}
                                    </span>
                                  )}
                                  {i.warrantyStatus && (
                                    <Badge
                                      variant="outline"
                                      className="text-[10px]"
                                    >
                                      Bảo hành: {i.warrantyStatus}
                                    </Badge>
                                  )}
                                </div>

                                {i.warrantyPackageId && (
                                  <div className="mt-2 bg-slate-50 border border-slate-100 p-2.5 text-xs flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                      <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                                      <span className="font-semibold">
                                        Gói bảo hành: {i.warrantyPackageId.name}
                                      </span>
                                    </div>
                                    <div className="flex flex-wrap gap-3 pl-5 mt-1 text-[11px] text-muted-foreground">
                                      {i.warrantyPackageId.durationMonths !==
                                        undefined && (
                                          <span>
                                            Thời hạn:{" "}
                                            {i.warrantyPackageId.durationMonths ||
                                              0}{" "}
                                            tháng
                                          </span>
                                        )}
                                      {i.warrantyStartAt && (
                                        <span>
                                          Bắt đầu:{" "}
                                          {formatDateTime(i.warrantyStartAt)}
                                        </span>
                                      )}
                                      {i.warrantyEndAt && (
                                        <span>
                                          Kết thúc:{" "}
                                          {formatDateTime(i.warrantyEndAt)}
                                        </span>
                                      )}
                                      {i.warrantyPackageId.price != null && (
                                        <span>
                                          Giá gói:{" "}
                                          {money(i.warrantyPackageId.price)}₫
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Đơn hàng này chưa có sản phẩm.
                    </p>
                  )}
                </CardContent>
              </Card>

              {order.notes && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Ghi chú của bạn
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-700 whitespace-pre-line">
                      {order.notes}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Cột phải: Tổng tiền + giao hàng + thanh toán */}
            <div className="space-y-0">
              <Card className="border border-slate-200/70 shadow-sm rounded-none">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Tổng tiền</CardTitle>
                </CardHeader>
                <Separator />
                <CardContent className="pt-4 text-sm space-y-2 text-slate-700">
                  <div className="flex justify-between">
                    <span>Tạm tính</span>
                    <span>{money(subtotal)}₫</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Thuế</span>
                    <span>{money(tax)}₫</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phí vận chuyển</span>
                    <span>{money(shipping)}₫</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Giảm giá</span>
                    <span>-{money(discount)}₫</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between items-center text-base font-semibold">
                    <span>Tổng cộng</span>
                    <div className="text-right">
                      <span className="text-primary text-lg">
                        {money(total)}₫
                      </span>
                      {order.currency && (
                        <div className="text-[11px] text-muted-foreground">
                          ({order.currency})
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-slate-200/70 shadow-sm rounded-none">
                <CardHeader className="pb-3">
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
                            {[
                              order.shippingAddress.city,
                              order.shippingAddress.state,
                              order.shippingAddress.country,
                            ]
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

              <Card className="border border-slate-200/70 shadow-sm rounded-none">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <WalletCards className="w-4 h-4" />
                    Thông tin thanh toán
                  </CardTitle>
                </CardHeader>
                <Separator />
                <CardContent className="pt-4 text-sm text-slate-700 space-y-3">
                  {canPayByStripe && (
                    <Button
                      className="w-full mb-2"
                      onClick={() => navigate(`/payment/${order._id}`)}
                    >
                      Thanh toán đơn hàng này
                    </Button>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-muted-foreground" />
                      Hình thức
                    </span>
                    <span className="font-medium text-right max-w-[210px]">
                      {paymentMethodLabel}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Mã giao dịch</span>
                    <span className="font-mono text-xs text-right max-w-[210px] truncate">
                      {order.paymentTransactionId || "—"}
                    </span>
                  </div>

                  {order.billingAddress && (
                    <div className="mt-2">
                      <p className="text-xs font-semibold text-muted-foreground mb-1">
                        Địa chỉ thanh toán
                      </p>
                      <div className="text-xs space-y-1 text-slate-700">
                        <div>{order.billingAddress.fullName}</div>
                        <div>{order.billingAddress.addressLine1}</div>
                        <div>
                          {[
                            order.billingAddress.city,
                            order.billingAddress.state,
                            order.billingAddress.country,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </div>
                        <div>Điện thoại: {order.billingAddress.phone}</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default OrderDetail;
