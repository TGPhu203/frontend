import { useRef, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { BASE_ORIGIN } from "@/api/Api";

const HeaderCart = ({ cartPreview, cartCount }: any) => {
  const navigate = useNavigate();
  const [showCartPreview, setShowCartPreview] = useState(false);
  const hideTimer = useRef<number | null>(null);

  const handleEnter = () => {
    if (hideTimer.current) {
      window.clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    setShowCartPreview(true);
  };

  const handleLeave = () => {
    hideTimer.current = window.setTimeout(() => {
      setShowCartPreview(false);
    }, 180);
  };

  const formatPrice = (n: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(n);

  const resolveImage = (item: any) => {
    const raw =
      item?.image ||
      item?.productId?.thumbnail ||
      item?.productId?.images?.[0] ||
      "";

    if (!raw) return "/placeholder.png";
    if (raw.startsWith("http")) return raw;
    return `${BASE_ORIGIN}${raw.startsWith("/") ? raw : `/${raw}`}`;
  };

  const items = cartPreview?.items ?? [];
  const totalPrice =
    cartPreview?.total ??
    cartPreview?.totalAmount ??
    cartPreview?.subtotal ??
    0;

  return (
    <div
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {/* ICON CART */}
      <Button variant="ghost" size="icon" className="relative">
        <ShoppingCart className="h-5 w-5" />
        <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-accent">
          {cartCount}
        </Badge>
      </Button>

      {/* POPUP */}
      {showCartPreview && items.length > 0 && (
        <div className="absolute right-0 mt-3 w-[380px] bg-white shadow-[0_8px_30px_rgba(15,23,42,0.12)]">
          {/* DANH SÁCH SẢN PHẨM – HIỂN THỊ HẾT, NHIỀU THÌ CUỘN */}
          <div className="max-h-64 overflow-y-auto border-b">
            {items.map((item: any) => (
              <div
                key={item._id}
                className="flex gap-3 p-4 border-b last:border-b-0"
              >
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden bg-slate-50">
                  <img
                    src={resolveImage(item)}
                    alt={item.productId?.name || item.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="flex-1 text-sm">
                  <p className="line-clamp-2 font-medium leading-snug">
                    {item.productId?.name || item.name}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Số lượng: {item.quantity || 1}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-sky-600">
                    {formatPrice(item.totalPrice || item.price || 0)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* TỔNG TIỀN + NÚT */}
          <div className="px-4 py-3 text-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-slate-600">
                Tổng tiền ({cartCount} sản phẩm)
              </span>
              <span className="font-semibold text-slate-900">
                {formatPrice(totalPrice)}
              </span>
            </div>

            <Button
              className="h-9 w-full text-[13px] font-semibold"
              onClick={() => navigate("/cart")}
            >
              Xem giỏ hàng
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeaderCart;
