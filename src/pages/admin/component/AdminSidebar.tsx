import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Wrench,
  Settings,
  Menu,
  X,
  Shield,
  BarChart2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

const menuItems = [
  { icon: LayoutDashboard, label: "Trang chủ", path: "/admin" },
  { icon: Package, label: "Sản phẩm", path: "/admin/adminProduct" },
  { icon: Package, label: "Danh mục", path: "/admin/adminCategory" },
  { icon: ShoppingCart, label: "Đơn hàng", path: "/admin/adminCart" },
  { icon: Users, label: "Khách hàng", path: "/admin/adminCustomer" },
  {
    icon: Wrench,
    label: "Dịch vụ kỹ thuật",
    path: "/admin/adminWarrantyPackages",
  },
  { icon: Wrench, label: "Yêu cầu kỹ thuật", path: "/admin/repair-requests" },
  {
    icon: Shield,
    label: "BH theo sản phẩm",
    path: "/admin/adminProductWarranty",
  },
  { icon: BarChart2, label: "Thống kê doanh thu", path: "/admin/revenue" },
  { icon: Settings, label: "Ưu đãi", path: "/admin/adminCoupon" },
];

interface AdminSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const AdminSidebar = ({
  collapsed,
  onToggleCollapse,
}: AdminSidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 bg-card shadow-sm lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen border-r border-sidebar-border/40",
          // ✅ Nền mềm – sáng hơn – chữ rõ
          "bg-gradient-to-b from-[#1b2b5a] via-[#2a4179] to-[#15224a]",
          "transition-all duration-300 lg:translate-x-0",
          "w-64",
          collapsed ? "lg:w-24" : "lg:w-72",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >



        <div className="flex h-full flex-col">
          {/* Logo + nút thu gọn */}
          <div className="flex items-center gap-3 border-b border-sidebar-border/70 px-6 py-5 bg-sidebar/60 backdrop-blur">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-indigo-500 text-white shadow-sm">
              <LayoutDashboard className="h-5 w-5" />
            </div>

   
            <div
              className={cn(
                "flex flex-col transition-all duration-200",
                collapsed && "lg:hidden"
              )}
            >
              <h1 className="text-base font-semibold tracking-tight text-white">
            Trường Phúc
              </h1>
              <p className="text-xs text-slate-200/80">
                Quản lý hệ thống cửa hàng
              </p>
            </div>


            {/* Nút thu gọn desktop */}
            <button
              type="button"
              onClick={onToggleCollapse}
              className={cn(
                "ml-auto hidden h-7 w-7 items-center justify-center rounded-full lg:inline-flex",
                // màu chữ & nền sáng hơn
                "text-slate-100 hover:text-white",
                "bg-sky-500/20 hover:bg-sky-500/35",
                // viền + bóng nhẹ cho nổi
                "border border-sky-400/40 shadow-sm",
                "transition-colors"
              )}
              title={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>

          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-6 pt-4">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/admin"}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "group relative flex items-center rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors",
                    collapsed ? "justify-center lg:justify-center" : "gap-3",
                    "text-slate-200 hover:text-white",
                    "hover:bg-sky-500/8",
                    isActive &&
                    "bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 text-white shadow-lg"

                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        "absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-transparent transition-colors",
                        "group-hover:bg-sky-400/70",
                        isActive && "bg-sky-500",
                        collapsed && "lg:hidden"
                      )}
                    />
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-xl border text-sm",
                        "border-transparent bg-sidebar-accent/40",
                        "group-hover:border-sky-300/80 group-hover:bg-sidebar-accent",
                        isActive &&
                        "bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none shadow-lg"

                      )}
                    >
                      <item.icon className="h-4 w-4" />
                    </div>
                    <span className={cn("truncate", collapsed && "lg:hidden")}>
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};
