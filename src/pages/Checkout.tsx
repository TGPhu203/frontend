// src/pages/Checkout.tsx
"use client";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCart } from "@/api/cartApi";
import { createOrder } from "@/api/orderApi";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { BASE_ORIGIN } from "@/api/Api";

const Checkout = () => {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
    paymentMethod: "cod",
    notes: "",
  });

  const loadCart = async () => {
    try {
      const data = await getCart();
      setCart(data);
    } catch (e: any) {
      toast.error(e.message || "Không thể tải giỏ hàng");
    } finally {
      setLoading(false);
    }
  };

  // load cart + địa chỉ giao hàng lần trước
  useEffect(() => {
    loadCart();

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

  const submitOrder = async () => {
    try {
      const payload = {
        paymentMethod: form.paymentMethod,
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
      };

      console.log("SEND PAYLOAD:", payload);

      const data = await createOrder(payload);
      const created = data?.order || data; // BE trả { data: { order: {...} } }

      // lưu địa chỉ giao hàng để lần sau auto fill
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

      // điều hướng theo phương thức thanh toán
      if (form.paymentMethod === "stripe") {
        navigate(`/payment/${created.id}`);
      } else {
        // COD: xem chi tiết đơn hàng
        navigate(`/orders/${created.id}`);
      }
    } catch (e: any) {
      toast.error(e.message || "Đặt hàng thất bại");
    }
  };

  if (loading) return <div className="p-20">Loading...</div>;
  if (!cart) return <div className="p-20">Giỏ hàng trống</div>;

  const resolveImageUrl = (url?: string | null) => {
    if (!url) return "/placeholder.png";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `${BASE_ORIGIN}${url.startsWith("/") ? url : `/${url}`}`;
  };

  return (
    <>
      <Header />

      <main className="container mx-auto py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: thông tin giao hàng + ghi chú */}
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Thông tin giao hàng</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
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
                placeholder="Địa chỉ"
                className="col-span-2"
                value={form.shippingAddress1}
                onChange={handleChange}
              />
              <Input
                name="shippingCity"
                placeholder="Thành phố"
                value={form.shippingCity}
                onChange={handleChange}
              />
              <Input
                name="shippingState"
                placeholder="Tỉnh"
                value={form.shippingState}
                onChange={handleChange}
              />
              <Input
                name="shippingZip"
                placeholder="Mã bưu điện"
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

          <Card>
            <CardHeader>
              <CardTitle>Ghi chú</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                className="w-full border rounded p-2 min-h-[120px]"
                placeholder="Ghi chú cho shipper..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: phương thức thanh toán + tóm tắt đơn */}
        <aside>
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Phương thức thanh toán</CardTitle>
            </CardHeader>
            <CardContent>
              <select
                name="paymentMethod"
                onChange={handleChange}
                className="border p-2 rounded w-full"
                value={form.paymentMethod}
              >
                <option value="cod">Thanh toán khi nhận hàng (COD)</option>
                <option value="stripe">Thanh toán bằng thẻ (Stripe)</option>
              </select>
            </CardContent>
          </Card>

          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Đơn hàng</CardTitle>
            </CardHeader>
            <CardContent>
              {cart.items.map((i: any) => {
                const image =
                  resolveImageUrl(
                    i.productId?.thumbnail ||
                      i.productId?.images?.[0] ||
                      ""
                  );

                return (
                  <div
                    key={i._id}
                    className="flex justify-between py-2 border-b gap-3"
                  >
                    <div className="flex gap-3">
                      <div className="w-12 h-12 rounded border overflow-hidden bg-slate-100">
                        <img
                          src={image}
                          alt={i.productId?.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-medium text-sm">
                          {i.productId?.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Số lượng: {i.quantity}
                        </div>
                      </div>
                    </div>
                    <div className="font-semibold text-sm">
                      {(i.totalPrice || i.price * i.quantity).toLocaleString(
                        "vi-VN"
                      )}
                      ₫
                    </div>
                  </div>
                );
              })}

              <div className="mt-4 text-right font-bold text-lg">
                Tổng: {cart.subtotal.toLocaleString("vi-VN")}₫
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
