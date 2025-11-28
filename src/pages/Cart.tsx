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
  Home,
  ChevronRight,
  Gift,
} from "lucide-react";
import { applyCoupon, getAvailableCoupons } from "@/api/couponApi";
import { useEffect, useState } from "react";
import { getCart, updateCartItem, removeCartItem } from "@/api/cartApi";
import { BASE_ORIGIN } from "@/api/Api";
import { toast } from "sonner";

const Cart = () => {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);
  const [loadingAvailableCoupons, setLoadingAvailableCoupons] = useState(false);
  const loadCart = async () => {
    try {
      setLoading(true);
      const data = await getCart();
      setCart(data);

      // 👇 sau khi có cart, load danh sách mã
      try {
        setLoadingAvailableCoupons(true);
        const coupons = await getAvailableCoupons(data.subtotal);
        setAvailableCoupons(coupons);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoadingAvailableCoupons(false);
      }
    } catch (err: any) {
      toast.error(err.message || "Không tải được giỏ hàng");
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
      try {
        setLoadingAvailableCoupons(true);
        const coupons = await getAvailableCoupons(updated.subtotal);
        setAvailableCoupons(coupons);
      } catch (err2: any) {
        console.error(err2);
      } finally {
        setLoadingAvailableCoupons(false);
      }
    } catch (err: any) {
      toast.error(err.message || "Không cập nhật được số lượng");
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const updated = await removeCartItem(itemId);
      setCart(updated);
    } catch (err: any) {
      toast.error(err.message || "Không xóa được sản phẩm");
    }
  };
  // trước đây: const handleApplyCoupon = async () => {
  const handleApplyCoupon = async (codeOverride?: string) => {
    const code = (codeOverride ?? couponCode).trim();
    if (!code) return;

    try {
      setCouponLoading(true);
      const res = await applyCoupon(code, cart.subtotal);

      setAppliedCoupon(res.coupon);
      setDiscountAmount(res.discountAmount || 0);

      // lưu code vào state để UI hiển thị đúng
      setCouponCode(code);

      try {
        localStorage.setItem(
          "appliedCoupon",
          JSON.stringify({
            coupon: res.coupon,
            discountAmount: res.discountAmount || 0,
          })
        );
      } catch { }

      toast.success("Áp dụng mã ưu đãi thành công");
    } catch (err: any) {
      setAppliedCoupon(null);
      setDiscountAmount(0);
      try {
        localStorage.removeItem("appliedCoupon");
      } catch { }
      toast.error(
        err.message || "Mã ưu đãi không hợp lệ hoặc không đủ điều kiện"
      );
    } finally {
      setCouponLoading(false);
    }
  };

  useEffect(() => {
    if (!cart) return;
  
    try {
      const stored = localStorage.getItem("pendingCoupon");
      if (!stored) return;
  
      const parsed = JSON.parse(stored);
      const code: string = parsed?.code || "";
  
      // dọn key luôn để tránh auto-apply lại lần sau
      localStorage.removeItem("pendingCoupon");
  
      if (code) {
        // tự động áp mã này
        handleApplyCoupon(code);
      }
    } catch {
      localStorage.removeItem("pendingCoupon");
    }
  }, [cart]);
  
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponCode("");
    try {
      localStorage.removeItem("appliedCoupon");
    } catch { }
  };

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Đang tải giỏ hàng...
      </div>
    );

  if (!cart || !cart.items || cart.items.length === 0)
    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <Header />
        <main className="flex flex-1 items-center">
          <Card className="mx-auto max-w-md border-dashed px-6 py-10 text-center">
            <CardContent className="space-y-4">
              <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
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
  const selectedCoupon = availableCoupons.find(
    (c: any) => c.code === couponCode
  );

  const rawUser =
    typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const user = rawUser ? JSON.parse(rawUser) : null;

  const loyaltyTier: string = user?.loyaltyTier || "none";

  // Map tier -> % giảm giá (PHẢI KHỚP với getDiscountPercentByTier ở BE)
  const getLoyaltyDiscountPercent = (tier: string) => {
    switch (tier) {
      case "silver":
        return 2;  // ví dụ
      case "gold":
        return 5;  // ví dụ
      case "diamond":
        return 10; // ví dụ
      default:
        return 0;
    }
  };

  const loyaltyPercent = getLoyaltyDiscountPercent(loyaltyTier);

  // Số tiền giảm cho khách hàng thân thiết
  const loyaltyDiscount =
    loyaltyPercent > 0 ? Math.round((subtotal * loyaltyPercent) / 100) : 0;
  console.log("USER FROM LS:", user);
  console.log("loyaltyTier =", loyaltyTier, "loyaltyPercent =", loyaltyPercent);

  // Tổng thanh toán sau khi trừ mã giảm giá + khách hàng thân thiết
  const total = Math.max(0, subtotal - discountAmount - loyaltyDiscount);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />

      <main className="flex-1 pb-16">
        {/* BREADCRUMB + TITLE */}
        <div className="border-b bg-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4 lg:px-0 lg:py-5">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Link to="/" className="inline-flex items-center gap-1 hover:text-primary">
                <Home className="h-3.5 w-3.5" />
                <span>Trang chủ</span>
              </Link>
              <ChevronRight className="h-3 w-3" />
              <span className="font-medium text-foreground">Giỏ hàng ({cart.totalItems})</span>
            </div>

          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[2fr,1fr] lg:px-0 lg:py-8">
          {/* DANH SÁCH SẢN PHẨM */}
          <div className="space-y-4">
            <Card className="border border-slate-200 shadow-sm">
              {/* Header của shop / đơn vị bán */}
              <CardHeader className="flex flex-row items-center gap-3 border-b bg-slate-50/80 py-3">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                  defaultChecked
                />
                <div className="flex flex-1 flex-col gap-0.5 text-sm">
                  <span className="font-semibold text-slate-800">
                    {cart.storeName || "Cửa hàng của bạn"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Chọn để áp dụng thao tác cho toàn bộ sản phẩm
                  </span>
                </div>
                <button className="text-xs text-primary hover:underline">
                  Xóa tất cả
                </button>
              </CardHeader>

              {/* Dòng khuyến mại combo như ảnh */}
              <div className="flex items-center gap-2 border-b bg-amber-50 px-4 py-2 text-[11px] text-amber-800">
                <Badge className="bg-red-500 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                  KHUYẾN MẠI COMBO
                </Badge>
                <span>Mua thêm để nhận ưu đãi hấp dẫn.</span>
              </div>

              {/* Các item trong giỏ */}
              <CardContent className="space-y-3 bg-white p-4">
                {cart.items.map((item: any) => {
                  const image =
                    item.productId.thumbnail
                      ? BASE_ORIGIN + item.productId.thumbnail
                      : item.productId.images?.length > 0
                        ? BASE_ORIGIN + item.productId.images[0]
                        : "/placeholder.png";

                  const lineTotal = item.price * item.quantity;

                  let variantAttrText = "";
                  const attrs = item.variantId?.attributes;

                  // ƯU TIÊN: attributes là mảng [{ attributeGroupId, attributeValueId }]
                  if (Array.isArray(attrs) && attrs.length > 0) {
                    variantAttrText = attrs
                      .map((a: any) => {
                        // Schema mới: a.attributeValueId là object đã populate
                        if (a.attributeValueId && typeof a.attributeValueId === "object") {
                          const valName =
                            a.attributeValueId.name || a.attributeValueId.value || "";

                          if (!valName) return "";

                          // Nếu có populate AttributeGroup và có tên -> "Màu sắc: Đen"
                          if (
                            a.attributeGroupId &&
                            typeof a.attributeGroupId === "object" &&
                            (a.attributeGroupId.name || a.attributeGroupId.code)
                          ) {
                            const groupName =
                              a.attributeGroupId.name || a.attributeGroupId.code;
                            return `${groupName}: ${valName}`;
                          }

                          // Nếu không có group name thì chỉ hiển thị giá trị
                          return valName;
                        }

                        // Fallback: format cũ {name, value}
                        if (a.name && a.value) return `${a.name}: ${a.value}`;

                        // Fallback: format cũ {attributeName, valueName}
                        if (a.attributeName && a.valueName)
                          return `${a.attributeName}: ${a.valueName}`;

                        return "";
                      })
                      .filter(Boolean)
                      .join(" | ");
                  }

                  // Trường hợp cũ: attributes là object { color: "Đen", ram: "16GB" }
                  else if (attrs && typeof attrs === "object") {
                    variantAttrText = Object.entries(attrs)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(" | ");
                  }

                  return (
                    <div
                      key={item._id}
                      className="rounded-lg border border-slate-200/80 bg-slate-50/60 p-3 md:p-4"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start">
                        {/* Checkbox + ảnh */}
                        <div className="flex flex-shrink-0 items-start gap-3">
                          <input
                            type="checkbox"
                            className="mt-2 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                            defaultChecked
                          />
                          <div className="relative h-20 w-20 overflow-hidden rounded-md border bg-white">
                            <img
                              src={image}
                              alt={item.productId.name}
                              className="h-full w-full object-contain"
                            />
                          </div>
                        </div>

                        {/* Thông tin sản phẩm */}
                        <div className="flex-1 space-y-2">
                          <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between">
                            <div className="space-y-1">
                              <h3 className="line-clamp-2 text-sm font-medium leading-snug">
                                {item.productId.name}
                              </h3>
                              <div className="flex flex-wrap items-center gap-2 text-xs">
                                {item.productId.inStock ? (
                                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                                    Còn hàng
                                  </span>
                                ) : (
                                  <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-600">
                                    Hết hàng
                                  </span>
                                )}

                                {item.variantId?.name && (
                                  <span className="rounded-full border border-slate-200 px-2 py-0.5 text-[11px] text-muted-foreground">
                                    Phân loại: {item.variantId.name}
                                  </span>
                                )}

                                {variantAttrText && (
                                  <span className="text-[11px] text-muted-foreground">
                                    Thuộc tính: {variantAttrText}
                                  </span>
                                )}

                              </div>

                            </div>

                            {/* Giá desktop bên phải */}
                            <div className="hidden text-right text-sm md:block">
                              <p className="text-xs text-muted-foreground">
                                Đơn giá
                              </p>
                              <p className="font-medium">
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

                          {/* Điều chỉnh số lượng + nút xóa */}
                          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-center gap-3">
                              <div className="inline-flex items-center rounded-full border border-slate-200 bg-white px-1">
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
                                <span className="w-10 text-center text-sm font-semibold">
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
                                className="h-8 w-8 text-red-500 hover:text-red-600"
                                onClick={() => removeItem(item._id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            {/* Giá mobile */}
                            <div className="text-right text-sm md:hidden">
                              <p className="text-xs text-muted-foreground">
                                Đơn giá
                              </p>
                              <p className="font-medium">
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

                          {/* Khuyến mãi bên dưới mỗi item (mô phỏng như ảnh) */}
                          <div className="mt-2 space-y-1.5 rounded-md bg-white px-3 py-2 text-xs text-slate-600">
                            <div className="flex items-start gap-2">
                              <Gift className="mt-0.5 h-3.5 w-3.5 text-rose-500" />
                              <span>
                                1x Mã giảm thêm 200.000đ cho một số sản phẩm
                                áp dụng.
                              </span>
                            </div>
                            <div className="flex items-start gap-2">
                              <Gift className="mt-0.5 h-3.5 w-3.5 text-rose-500" />
                              <span>
                                1x Mã giảm thêm cho phần mềm / phụ kiện đi kèm.
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* TÓM TẮT ĐƠN HÀNG / THANH TOÁN */}
          <div className="space-y-4">
            {/* Khuyến mãi / mã giảm giá (đơn giản) */}
            <Card className="border border-slate-200/90">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">
                  Khuyến mãi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-muted-foreground">
                {appliedCoupon ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between rounded-md bg-emerald-50 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Tag className="h-3.5 w-3.5 text-emerald-600" />
                        <div>
                          <p className="text-xs font-semibold text-emerald-700">
                            Đã áp dụng: {appliedCoupon.code}
                          </p>
                          <p className="text-[11px] text-emerald-700/80">
                            Giảm{" "}
                            {appliedCoupon.type === "percent"
                              ? `${appliedCoupon.value}%`
                              : formatPrice(appliedCoupon.value)}{" "}
                            — Tương đương {formatPrice(discountAmount)}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[11px] text-red-500 hover:text-red-600"
                        onClick={handleRemoveCoupon}
                      >
                        Hủy
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs">
                      <Tag className="h-4 w-4 text-primary" />
                      <span>Chọn mã khuyến mãi từ danh sách bên dưới.</span>
                    </div>

                    {/* Danh sách mã có sẵn từ database (dropdown) */}
                    <div className="space-y-2">
                      <p className="text-[11px] font-medium text-slate-600">
                        Mã khuyến mãi cho đơn của bạn:
                      </p>

                      {loadingAvailableCoupons && (
                        <p className="text-[11px] text-muted-foreground">
                          Đang tải danh sách mã...
                        </p>
                      )}

                      {!loadingAvailableCoupons && availableCoupons.length === 0 && (
                        <p className="text-[11px] text-muted-foreground">
                          Hiện chưa có mã nào cho đơn hàng này.
                        </p>
                      )}

                      {!loadingAvailableCoupons && availableCoupons.length > 0 && (
                        <>
                          <select
                            className="w-full rounded-md border px-3 py-2 text-xs outline-none bg-white"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                          >
                            <option value="">Chọn mã khuyến mãi</option>
                            {availableCoupons.map((c: any) => (
                              <option
                                key={c._id}
                                value={c.code}
                                disabled={!c.isEligible}
                              >
                                {/* CHỈ hiển thị ngắn gọn trong option */}
                                {c.code}{" "}
                                {c.type === "percent"
                                  ? `— ${c.value}%`
                                  : `— ${formatPrice(c.value)}`}
                                {!c.isEligible ? " (không đủ điều kiện)" : ""}
                              </option>
                            ))}
                          </select>

                          {/* Chi tiết mã bên dưới, không nằm trong option nên không bị tràn */}
                          {selectedCoupon && (
                            <div className="mt-1 rounded-md bg-slate-50 px-3 py-2 text-[11px] space-y-1">
                              <p className="font-semibold text-slate-800">
                                {selectedCoupon.code}
                              </p>
                              <p>
                                Loại:{" "}
                                {selectedCoupon.type === "percent"
                                  ? `Giảm ${selectedCoupon.value}%`
                                  : `Giảm ${formatPrice(selectedCoupon.value)}`}
                              </p>
                              {selectedCoupon.minOrderAmount && (
                                <p>
                                  ĐH tối thiểu:{" "}
                                  {formatPrice(selectedCoupon.minOrderAmount)}
                                </p>
                              )}
                              {!selectedCoupon.isEligible && (
                                <p className="text-red-500">
                                  Đơn hàng hiện chưa đủ điều kiện để dùng mã này.
                                </p>
                              )}
                            </div>
                          )}

                          <Button
                            size="sm"
                            className="px-3 text-xs"
                            disabled={
                              couponLoading ||
                              !selectedCoupon ||
                              !selectedCoupon.isEligible
                            }
                            onClick={() => handleApplyCoupon()}   // không truyền gì, dùng couponCode hiện tại
                          >
                            {couponLoading ? "Đang áp dụng..." : "Áp dụng mã"}
                          </Button>

                        </>
                      )}
                      {loyaltyPercent > 0 && (
                        <div className="mt-2 flex gap-2 rounded-md bg-sky-50 px-3 py-2 text-[11px] text-sky-800">
                          <Shield className="mt-0.5 h-3.5 w-3.5" />
                          <div>
                            <p className="font-semibold">
                              Khách hàng thân thiết: hạng {loyaltyTier.toUpperCase()}
                            </p>
                            <p>
                              Đơn hàng của bạn đang được giảm {loyaltyPercent}%{" "}
                              (≈ {formatPrice(loyaltyDiscount)}) theo chương trình khách hàng thân thiết.
                            </p>
                          </div>
                        </div>
                      )}

                    </div>

                  </div>

                )}

              </CardContent>
            </Card>


            {/* Tóm tắt thanh toán */}
            <Card className="sticky top-20 border border-slate-200 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">
                  Thanh toán
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tổng tạm tính</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex items-center justify-between text-xs text-emerald-700">
                    <span>Giảm giá ({appliedCoupon?.code})</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}

                {loyaltyDiscount > 0 && (
                  <div className="flex items-center justify-between text-xs text-emerald-700">
                    <span>
                      Giảm khách hàng thân thiết ({loyaltyTier.toUpperCase()})
                    </span>
                    <span>-{formatPrice(loyaltyDiscount)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Phí vận chuyển</span>
                  <span>Được tính ở bước tiếp theo</span>
                </div>


                <Separator />

                <div className="flex items-center justify-between">
                  <span className="text-[15px] font-semibold">Thành tiền</span>
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary">
                      {formatPrice(total)}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Đã bao gồm VAT (nếu có)
                    </p>
                  </div>
                </div>

                {/* Lợi ích / thông tin thêm */}
                <div className="space-y-2 rounded-md bg-slate-50 p-3 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-primary" />
                    <span>Miễn phí giao hàng với đơn từ 5.000.000₫.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span>Bảo hành theo từng sản phẩm sau khi đặt mua.</span>
                  </div>
                </div>

                <Link to="/checkout">
                  <Button className="mt-1 w-full h-10 text-sm font-semibold">
                    <CreditCard className="mr-2 h-4 w-4" />
                    THANH TOÁN
                  </Button>
                </Link>

                <Link to="/products">
                  <Button
                    variant="outline"
                    className="mt-2 w-full"
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
