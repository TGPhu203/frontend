import { ShoppingCart, Heart, Search, Menu, User, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import HeaderCart from "./HeaderCard";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BASE_ORIGIN } from "@/api/Api";
import { getCart } from "@/api/cartApi";
import { useCart } from "./CartContext";
import { useWishlist } from "./WishlistContext";
const Header = () => {
  const navigate = useNavigate();
  const { cart, cartCount } = useCart(); 
  const { wishlistCount } = useWishlist();
  const [searchText, setSearchText] = useState("");
  // cart preview
  const [showCartPreview, setShowCartPreview] = useState(false);

  const getUser = () => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const user = getUser();
  const buildAvatarUrl = (raw?: string) => {
    if (!raw) return undefined;
    if (raw.startsWith("http")) return raw;
    return `${BASE_ORIGIN}${raw.startsWith("/") ? raw : `/${raw}`}`;
  };
  const avatarUrl = buildAvatarUrl(user?.avatar);
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/auth");
  };

  const firstItem = cart?.items?.[0];

  const firstImage =
  firstItem?.productId?.thumbnail ||
  firstItem?.image ||
  firstItem?.productId?.images?.[0];

const firstImageUrl = firstImage
  ? firstImage.startsWith("http")
    ? firstImage
    : `${BASE_ORIGIN}${
        firstImage.startsWith("/") ? firstImage : `/${firstImage}`
      }`
  : "/placeholder.png";
    const handleSearch = (value?: string) => {
      const keyword = (value ?? searchText).trim();
  
      // nếu trống thì về trang /products không có search
      if (!keyword) {
        navigate("/products");
        return;
      }
  
      navigate({
        pathname: "/products",
        search: `?search=${encodeURIComponent(keyword)}`,
      });
    };

  
  const [openWishlist, setOpenWishlist] = useState(false);
  const [openUserMenu, setOpenUserMenu] = useState(false);
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* LOGO */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80">
                <span className="text-lg font-bold text-primary-foreground">
                  TP
                </span>
              </div>
              <span className="hidden text-xl font-bold sm:block">
                Trường Phúc
              </span>
            </Link>

            <nav className="hidden items-center gap-6 md:flex">
              <Link
                to="/products"
                className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
              >
                Sản phẩm
              </Link>
              <Link
                to="/categories"
                className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
              >
                Danh mục
              </Link>
              <Link
                to="/warranty"
                className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
              >
                Bảo hành
              </Link>
              <Link
                to="/about"
                className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
              >
                Về chúng tôi
              </Link>
            </nav>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-2">
            {/* search */}
            <div className="hidden max-w-md flex-1 items-center gap-2 lg:flex">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Bạn muốn tìm sản phẩm gì hôm nay..."
                  className="h-10 rounded-full border-slate-200 pl-9 pr-4 text-[13px]"
                  value={searchText}
                  onChange={(e) => {
                    const v = e.target.value;
                    setSearchText(v);
                    handleSearch(v);          // gõ tới đâu search tới đó
                  }}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleSearch()
                  }
                />
              </div>
            </div>

            {/* wishlist */}
            <div
              className="relative"
              onMouseEnter={() => setOpenWishlist(true)}
              onMouseLeave={() => setOpenWishlist(false)}
            >
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => navigate("/wishlist")}
              >
                <Heart className="h-5 w-5" />
                <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center bg-accent p-0 text-[11px]">
                  {wishlistCount}
                </Badge>
              </Button>

              {openWishlist && (
                <div className="absolute right-0 top-10 z-50 w-64 rounded-md border bg-popover shadow-lg">
                  <div className="px-3 py-2 text-sm">
                    <p className="font-medium">Sản phẩm yêu thích</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Bạn đang có <span className="font-semibold">{wishlistCount}</span>{" "}
                      sản phẩm trong danh sách yêu thích.
                    </p>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between px-3 py-2">
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => navigate("/wishlist")}
                    >
                      Xem danh sách yêu thích
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <HeaderCart cartPreview={cart} cartCount={cartCount} /> {/* 👈 sửa */}



            {/* USER / AVATAR */}
            {!user ? (
              <>
                <Link to="/auth">
                  <Button
                    variant="default"
                    size="sm"
                    className="hidden gap-2 sm:flex"
                  >
                    <User className="h-4 w-4" />
                    Đăng nhập
                  </Button>
                </Link>
                <Link to="/auth" className="sm:hidden">
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <DropdownMenu open={openUserMenu} onOpenChange={setOpenUserMenu}>
                  <div
                    onMouseEnter={() => setOpenUserMenu(true)}
                    onMouseLeave={() => setOpenUserMenu(false)}
                  >
                    <DropdownMenuTrigger asChild>
                      <Avatar className="h-9 w-9 cursor-pointer">
                        <AvatarImage src={avatarUrl} />
                        <AvatarFallback>
                          {user.fullName?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>

                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-48">
                      <div className="px-3 py-2">
                        <p className="font-semibold">{user.fullName}</p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem onClick={() => navigate("/profile")}>
                        Hồ sơ cá nhân
                      </DropdownMenuItem>

                      <DropdownMenuItem onClick={() => navigate("/my-orders")}>
                        Đơn hàng của tôi
                      </DropdownMenuItem>

                      {user.role === "admin" && (
                        <DropdownMenuItem onClick={() => navigate("/admin")}>
                          Trang quản trị
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="text-red-600"
                      >
                        Đăng xuất
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </div>
                </DropdownMenu>
              </>
            )}

            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
