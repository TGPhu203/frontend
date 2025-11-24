import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Tag,
  Shield,
  Truck,
  CreditCard,
  ArrowLeft,
} from "lucide-react";
import { useState } from "react";

const Cart = () => {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "MacBook Pro 14\" M3",
      price: 45990000,
      originalPrice: 52990000,
      quantity: 1,
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200",
      warranty: "24 tháng",
      inStock: true,
    },
    {
      id: 2,
      name: "iPhone 15 Pro Max 256GB",
      price: 32990000,
      quantity: 1,
      image: "https://images.unsplash.com/photo-1592286927505-b0501739e1f6?w=200",
      warranty: "12 tháng",
      inStock: true,
    },
    {
      id: 3,
      name: "Sony WH-1000XM5",
      price: 8490000,
      originalPrice: 9990000,
      quantity: 2,
      image: "https://images.unsplash.com/photo-1545127398-14699f92334b?w=200",
      warranty: "12 tháng",
      inStock: true,
    },
  ]);

  const updateQuantity = (id: number, change: number) => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCartItems((items) => items.filter((item) => item.id !== id));
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discount = cartItems.reduce(
    (sum, item) =>
      sum +
      (item.originalPrice ? (item.originalPrice - item.price) * item.quantity : 0),
    0
  );
  const shipping = subtotal > 10000000 ? 0 : 250000;
  const total = subtotal + shipping;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary/10 via-primary/5 to-background py-12 border-b">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 mb-4">
              <ShoppingCart className="h-10 w-10 text-primary" />
              <h1 className="text-4xl font-bold">Giỏ hàng</h1>
            </div>
            <p className="text-muted-foreground">
              Bạn có {cartItems.length} sản phẩm trong giỏ hàng
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12">
          {cartItems.length === 0 ? (
            <Card className="max-w-md mx-auto text-center py-12">
              <CardContent className="space-y-4">
                <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto" />
                <h3 className="text-xl font-semibold">Giỏ hàng trống</h3>
                <p className="text-muted-foreground">
                  Thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm
                </p>
                <Link to="/products">
                  <Button>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Tiếp tục mua sắm
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Sản phẩm ({cartItems.length})</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id}>
                        <div className="flex gap-4">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-24 h-24 object-cover rounded-lg border"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold mb-1">{item.name}</h3>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary" className="text-xs">
                                <Shield className="h-3 w-3 mr-1" />
                                {item.warranty}
                              </Badge>
                              {item.inStock ? (
                                <Badge className="bg-success text-success-foreground text-xs">
                                  Còn hàng
                                </Badge>
                              ) : (
                                <Badge variant="destructive" className="text-xs">
                                  Hết hàng
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2 border rounded-lg">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => updateQuantity(item.id, -1)}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-8 text-center font-medium">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => updateQuantity(item.id, 1)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => removeItem(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg">
                              {formatPrice(item.price)}
                            </div>
                            {item.originalPrice && (
                              <div className="text-sm text-muted-foreground line-through">
                                {formatPrice(item.originalPrice)}
                              </div>
                            )}
                          </div>
                        </div>
                        <Separator className="mt-4" />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Coupon */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Nhập mã giảm giá" className="pl-10" />
                      </div>
                      <Button variant="outline">Áp dụng</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle>Tóm tắt đơn hàng</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tạm tính</span>
                        <span className="font-medium">{formatPrice(subtotal)}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Giảm giá</span>
                          <span className="font-medium text-success">
                            -{formatPrice(discount)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Phí vận chuyển</span>
                        <span className="font-medium">
                          {shipping === 0 ? "Miễn phí" : formatPrice(shipping)}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="font-semibold">Tổng cộng</span>
                        <span className="font-bold text-xl text-primary">
                          {formatPrice(total)}
                        </span>
                      </div>
                    </div>

                    <Button className="w-full" size="lg">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Thanh toán
                    </Button>

                    <Link to="/products">
                      <Button variant="outline" className="w-full">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Tiếp tục mua sắm
                      </Button>
                    </Link>

                    {/* Benefits */}
                    <div className="pt-4 space-y-3 border-t">
                      <div className="flex items-start gap-3 text-sm">
                        <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <div className="font-medium">Bảo hành chính hãng</div>
                          <div className="text-muted-foreground">
                            Đầy đủ chứng từ, hóa đơn
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 text-sm">
                        <Truck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <div className="font-medium">Giao hàng miễn phí</div>
                          <div className="text-muted-foreground">
                            Đơn hàng từ 10 triệu
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 text-sm">
                        <CreditCard className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <div className="font-medium">Thanh toán an toàn</div>
                          <div className="text-muted-foreground">
                            Bảo mật thông tin 100%
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;
