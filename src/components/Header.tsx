import { ShoppingCart, Heart, Search, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { getWishlist } from "@/api/wishlistApi";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const Header = () => {
  const navigate = useNavigate();
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const data = await getWishlist();
        setWishlistCount(data.length);
      } catch { }
    })();
  }, []);
  const getUser = () => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const user = getUser();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/auth");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* LOGO */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">
                  TP
                </span>
              </div>
              <span className="font-bold text-xl hidden sm:block">Trường Phúc</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link to="/products" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
                Sản phẩm
              </Link>
              <Link to="/categories" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
                Danh mục
              </Link>
              <Link to="/warranty" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
                Bảo hành
              </Link>
              <Link to="/about" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
                Về chúng tôi
              </Link>
            </nav>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Tìm kiếm sản phẩm..." className="pl-10 bg-secondary/50 border-0" />
              </div>
            </div>

            {/* wishlist */}
            <Button variant="ghost" size="icon" className="relative" onClick={() => navigate("/wishlist")}>
              <Heart className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-accent">
                {wishlistCount}
              </Badge>
            </Button>

            {/* cart */}
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-accent">
                  3
                </Badge>
              </Button>
            </Link>

            {/* USER / AVATAR */}
            {!user ? (
              <>
                {/* Chưa đăng nhập */}
                <Link to="/auth">
                  <Button variant="default" size="sm" className="hidden sm:flex gap-2">
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
                {/* ĐÃ ĐĂNG NHẬP → AVATAR + DROPDOWN */}
                <DropdownMenu>
                  <DropdownMenuTrigger className="focus:outline-none">
                    <Avatar className="h-9 w-9 cursor-pointer">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>
                        {user.fullName?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-3 py-2">
                      <p className="font-semibold">{user.fullName}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>

                    <DropdownMenuSeparator />

                    {/* Hồ sơ */}
                    <DropdownMenuItem onClick={() => navigate("/profile")}>
                      Hồ sơ cá nhân
                    </DropdownMenuItem>

              

                    {/* Danh sách đơn hàng */}
                    <DropdownMenuItem onClick={() => navigate("/my-orders")}>
                      Đơn hàng của tôi
                    </DropdownMenuItem>



                    {/* Admin only */}
                    {user.role === "admin" && (
                      <DropdownMenuItem onClick={() => navigate("/admin")}>
                        Trang quản trị
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator />

                    {/* Logout */}
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-red-600"
                    >
                      Đăng xuất
                    </DropdownMenuItem>
                  </DropdownMenuContent>

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
