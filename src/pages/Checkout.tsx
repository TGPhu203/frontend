// src/pages/Checkout.tsx
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCart } from "@/api/cartApi";
import { createOrder } from "@/api/orderApi";
import { applyCoupon } from "@/api/couponApi";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { BASE_ORIGIN } from "@/api/Api";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Phone, User as UserIcon } from "lucide-react";
import { createPayOSPaymentLink } from "@/api/paymentApi";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8888";
const ADDRESS_BASE = `${API_BASE_URL}/api/users/addresses`;

// Kiểu Address giống backend
type Address = {
  _id?: string;
  fullName: string;
  phone: string;
  street: string;
  ward?: string;
  district?: string;
  province?: string;
  isDefault?: boolean;
};

const Checkout = () => {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );

  const navigate = useNavigate();

  const [form, setForm] = useState({
    shippingFirstName: "",
    shippingLastName: "",
    shippingAddress1: "",
    shippingCity: "",
    shippingState: "",
    shippingZip: "",
    shippingCountry: "Vietnam",
    shippingPhone: "",
    paymentMethod: "cod" as "cod" | "stripe" | "payos",
    notes: "",
  });

  // ------- LOAD CART -------
  const loadCart = async () => {
    try {
      const data = await getCart(); // wrapper đã trả đúng format dùng được
      setCart(data);

      // apply coupon (nếu đã lưu)
      try {
        const raw = localStorage.getItem("appliedCoupon");
        if (raw) {
          const saved = JSON.parse(raw);
          const res = await applyCoupon(saved.coupon.code, data.subtotal);
          setAppliedCoupon(res.coupon);
          setDiscountAmount(res.discountAmount || 0);
        } else {
          setAppliedCoupon(null);
          setDiscountAmount(0);
        }
      } catch (err) {
        console.error("apply coupon at checkout error:", err);
        setAppliedCoupon(null);
        setDiscountAmount(0);
      }
    } catch (e: any) {
      toast.error(e.message || "Không thể tải giỏ hàng");
    } finally {
      setLoading(false);
    }
  };

  // ------- LOAD ADDRESSES -------
  const loadAddresses = async () => {
    try {
      const res = await axios.get(ADDRESS_BASE, { withCredentials: true });
      const list: Address[] = res.data?.data || [];
      setAddresses(list);

      if (list.length > 0) {
        const defaultAddr = list.find((a) => a.isDefault) || list[0];
        if (defaultAddr._id) {
          setSelectedAddressId(defaultAddr._id);
          fillFormFromAddress(defaultAddr);
        }
      }
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Không thể tải địa chỉ giao hàng"
      );
    }
  };

  // ------- FILL FORM TỪ ADDRESS -------
  const fillFormFromAddress = (addr: Address) => {
    const parts = addr.fullName.split(" ");
    const shippingLastName = parts[0] || "";
    const shippingFirstName = parts.slice(1).join(" ");

    const cityText = [addr.ward, addr.district].filter(Boolean).join(", ");

    setForm((prev) => ({
      ...prev,
      shippingFirstName: shippingFirstName || prev.shippingFirstName,
      shippingLastName: shippingLastName || prev.shippingLastName,
      shippingAddress1: addr.street || prev.shippingAddress1,
      shippingCity: cityText || prev.shippingCity,
      shippingState: addr.province || prev.shippingState,
      shippingZip: prev.shippingZip,
      shippingCountry: "Vietnam",
      shippingPhone: addr.phone || prev.shippingPhone,
    }));
  };

  // ------- INIT -------
  useEffect(() => {
    loadCart();
    loadAddresses();

    // auto fill từ lastShipping nếu không có address
    try {
      const raw = localStorage.getItem("lastShipping");
      if (raw) {
        const last = JSON.parse(raw);
        setForm((prev) => ({
          ...prev,
          shippingFirstName: last.firstName || prev.shippingFirstName,
          shippingLastName: last.lastName || prev.shippingLastName,
          shippingAddress1: last.addressLine1 || prev.shippingAddress1,
          shippingCity: last.city || prev.shippingCity,
          shippingState: last.state || prev.shippingState,
          shippingZip: last.postalCode || prev.shippingZip,
          shippingCountry: last.country || prev.shippingCountry,
          shippingPhone: last.phone || prev.shippingPhone,
        }));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleChange = (e: any) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSelectAddress = (addr: Address) => {
    if (!addr._id) return;
    setSelectedAddressId(addr._id);
    fillFormFromAddress(addr);
  };

  // ------- SUBMIT ORDER -------
  const submitOrder = async () => {
    try {
      const payload = {
        paymentMethod: form.paymentMethod, // "cod" | "stripe" | "payos"
        notes: form.notes,
        shippingAddress: {
          fullName: `${form.shippingFirstName} ${form.shippingLastName}`.trim(),
          addressLine1: form.shippingAddress1,
          city: form.shippingCity,
          state: form.shippingState,
          postalCode: form.shippingZip,
          country: form.shippingCountry,
          phone: form.shippingPhone,
        },
        billingAddress: {
          fullName: `${form.shippingFirstName} ${form.shippingLastName}`.trim(),
          addressLine1: form.shippingAddress1,
          city: form.shippingCity,
          state: form.shippingState,
          postalCode: form.shippingZip,
          country: form.shippingCountry,
          phone: form.shippingPhone,
        },
        coupon: appliedCoupon
          ? {
              code: appliedCoupon.code,
              discountAmount,
            }
          : null,
      };

      const data = await createOrder(payload);
      // backend: { status, data: { order: { id, number, ... } } }
      const created = (data as any)?.order || (data as any)?.data?.order || data;
      const orderId: string = created.id || created._id;

      // lưu lastShipping
      try {
        localStorage.setItem(
          "lastShipping",
          JSON.stringify({
            firstName: form.shippingFirstName,
            lastName: form.shippingLastName,
            addressLine1: form.shippingAddress1,
            city: form.shippingCity,
            state: form.shippingState,
            postalCode: form.shippingZip,
            country: form.shippingCountry,
            phone: form.shippingPhone,
          })
        );
      } catch {}

      toast.success("Đặt hàng thành công");

      // Điều hướng theo phương thức thanh toán
      if (form.paymentMethod === "stripe") {
        navigate(`/payment/${orderId}`);
      } else if (form.paymentMethod === "payos") {
        try {
          const payos = await createPayOSPaymentLink(orderId);
          window.location.href = payos.checkoutUrl;
        } catch (err: any) {
          console.error(err);
          toast.error(
            err?.message ||
              "Không tạo được link thanh toán PayOS, vui lòng thử lại"
          );
          navigate(`/orders/${orderId}`);
        }
      } else {
        // COD
        navigate(`/orders/${orderId}`);
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Đặt hàng thất bại");
    }
  };

  if (loading) return <div className="p-20">Loading...</div>;
  if (!cart) return <div className="p-20">Giỏ hàng trống</div>;
  const subtotal = cart.subtotal || 0;

  const rawUser =
    typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const user = rawUser ? JSON.parse(rawUser) : null;

  const loyaltyTier: string = user?.loyaltyTier || "none";

  const getLoyaltyDiscountPercent = (tier: string) => {
    switch (tier) {
      case "silver":
        return 2;
      case "gold":
        return 5;
      case "diamond":
        return 10;
      default:
        return 0;
    }
  };

  const loyaltyPercent = getLoyaltyDiscountPercent(loyaltyTier);
  const loyaltyDiscount =
    loyaltyPercent > 0 ? Math.round((subtotal * loyaltyPercent) / 100) : 0;

  // Tổng thanh toán sau coupon + khách hàng thân thiết
  const total = Math.max(0, subtotal - discountAmount - loyaltyDiscount);

  const resolveImageUrl = (url?: string | null) => {
    if (!url) return "/placeholder.png";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `${BASE_ORIGIN}${url.startsWith("/") ? url : `/${url}`}`;
  };

  const formatAddress = (addr: Address) =>
    [addr.street, addr.ward, addr.district, addr.province]
      .filter(Boolean)
      .join(", ");

  return (
    <>
      <Header />

      <main className="container mx-auto py-8 lg:py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: địa chỉ + form shipping + ghi chú */}
        <div className="lg:col-span-2 space-y-6">
          {/* CHỌN ĐỊA CHỈ GIAO HÀNG */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <MapPin className="h-5 w-5 text-primary" />
                Địa chỉ giao hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {addresses.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Bạn chưa có địa chỉ nào. Hãy thêm địa chỉ trong mục{" "}
                  <span className="font-medium">Sổ địa chỉ</span>.
                </p>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <button
                      key={addr._id}
                      type="button"
                      onClick={() => handleSelectAddress(addr)}
                      className={`w-full flex items-start justify-between rounded-lg border px-4 py-3 text-left transition ${
                        selectedAddressId === addr._id
                          ? "border-primary bg-primary/5"
                          : "border-border bg-muted/40 hover:bg-muted/70"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          className="mt-1"
                          checked={selectedAddressId === addr._id}
                          readOnly
                        />
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold flex items-center gap-1">
                              <UserIcon className="h-3.5 w-3.5 text-primary" />
                              {addr.fullName}
                            </span>
                            {addr.isDefault && (
                              <Badge
                                variant="secondary"
                                className="flex items-center gap-1 px-2 py-0.5 text-[11px]"
                              >
                                <Star className="h-3 w-3 text-yellow-500" />
                                Mặc định
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground">
                            {formatAddress(addr)}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {addr.phone}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* FORM SHIPPING */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin giao hàng</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                name="shippingFirstName"
                placeholder="Tên"
                value={form.shippingFirstName}
                onChange={handleChange}
              />
              <Input
                name="shippingLastName"
                placeholder="Họ"
                value={form.shippingLastName}
                onChange={handleChange}
              />
              <Input
                name="shippingAddress1"
                placeholder="Địa chỉ (số nhà, tên đường)"
                className="md:col-span-2"
                value={form.shippingAddress1}
                onChange={handleChange}
              />
              <Input
                name="shippingCity"
                placeholder="Phường/Xã, Quận/Huyện"
                value={form.shippingCity}
                onChange={handleChange}
              />
              <Input
                name="shippingState"
                placeholder="Tỉnh/Thành phố"
                value={form.shippingState}
                onChange={handleChange}
              />
              <Input
                name="shippingZip"
                placeholder="Mã bưu điện (nếu có)"
                value={form.shippingZip}
                onChange={handleChange}
              />
              <Input
                name="shippingPhone"
                placeholder="Số điện thoại"
                value={form.shippingPhone}
                onChange={handleChange}
              />
            </CardContent>
          </Card>

          {/* GHI CHÚ */}
          <Card>
            <CardHeader>
              <CardTitle>Ghi chú cho đơn hàng</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                className="w-full border rounded-md px-3 py-2 text-sm min-h-[120px]"
                placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi đến..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: thanh toán + tóm tắt đơn */}
        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Phương thức thanh toán</CardTitle>
            </CardHeader>
            <CardContent>
              <select
                name="paymentMethod"
                onChange={handleChange}
                className="border p-2 rounded w-full text-sm"
                value={form.paymentMethod}
              >
                <option value="cod">Thanh toán khi nhận hàng (COD)</option>
                <option value="stripe">Thanh toán bằng thẻ (Stripe)</option>
                <option value="payos">
                  Thanh toán qua PayOS (chuyển khoản ngân hàng)
                </option>
              </select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Đơn hàng của bạn</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                {cart.items.map((i: any) => {
                  const image = resolveImageUrl(
                    i.productId?.thumbnail || i.productId?.images?.[0] || ""
                  );

                  return (
                    <div
                      key={i._id}
                      className="flex justify-between gap-3 border-b pb-2 last:border-b-0"
                    >
                      <div className="flex gap-3">
                        <div className="w-12 h-12 rounded-md border overflow-hidden bg-slate-100 shrink-0">
                          <img
                            src={image}
                            alt={i.productId?.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-medium text-sm line-clamp-2">
                            {i.productId?.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Số lượng: {i.quantity}
                          </div>
                        </div>
                      </div>
                      <div className="font-semibold text-sm whitespace-nowrap">
                        {(i.totalPrice || i.price * i.quantity).toLocaleString(
                          "vi-VN"
                        )}
                        ₫
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tạm tính</span>
                  <span className="font-semibold">
                    {subtotal.toLocaleString("vi-VN")}₫
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Giảm giá ({appliedCoupon?.code})</span>
                    <span className="font-semibold">
                      -{discountAmount.toLocaleString("vi-VN")}₫
                    </span>
                  </div>
                )}

                {loyaltyDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 text-sm">
                    <span>
                      Giảm khách hàng thân thiết ({loyaltyTier.toUpperCase()})
                    </span>
                    <span className="font-semibold">
                      -{loyaltyDiscount.toLocaleString("vi-VN")}₫
                    </span>
                  </div>
                )}

                <div className="border-t pt-2 mt-2 flex justify-between items-center">
                  <span className="text-base font-semibold">
                    Tổng thanh toán
                  </span>
                  <span className="text-lg font-bold text-primary">
                    {total.toLocaleString("vi-VN")}₫
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <Button className="w-full" onClick={submitOrder}>
                  Đặt hàng
                </Button>
              </div>
            </CardContent>
          </Card>
        </aside>
      </main>

      <Footer />
    </>
  );
};

export default Checkout;
