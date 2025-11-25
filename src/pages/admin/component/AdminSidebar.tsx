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
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: Package, label: "Sản phẩm", path: "/admin/adminProduct" },
  { icon: Package, label: "Danh mục", path: "/admin/adminCategory" },
  { icon: ShoppingCart, label: "Đơn hàng", path: "/admin/adminCart" },
  { icon: Users, label: "Khách hàng", path: "/admin/adminCustomer" },
  { icon: Wrench, label: "Dịch vụ kỹ thuật", path: "/admin/adminWarrantyPackages" },
  { icon: Wrench, label: "Yêu cầu kỹ thuật", path: "/admin/repair-requests" },
  { icon: Shield, label: "BH theo sản phẩm", path: "/admin/adminProductWarranty" },
  { icon: BarChart2, label: "Thống kê doanh thu", path: "/admin/revenue" },
  { icon: Settings, label: "Cài đặt", path: "/admin/adminAttributeGroups" },
];

interface AdminSidebarProps {
  collapsed: boolean;                 // thu gọn desktop
  onToggleCollapse: () => void;
}

export const AdminSidebar = ({ collapsed, onToggleCollapse }: AdminSidebarProps) => {
  const [isOpen, setIsOpen] = useState(false); // mobile

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden bg-card shadow-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen border-r border-sidebar-border",
          "bg-sidebar bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.08),_transparent_55%)]",
          "transition-all duration-300 lg:translate-x-0",
          "w-64",                           // mobile width
          collapsed ? "lg:w-20" : "lg:w-64", // desktop thu gọn/giãn
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo + nút thu gọn */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border/70">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center shadow-[0_0_20px_rgba(56,189,248,0.35)]">
              <LayoutDashboard className="h-5 w-5 text-white" />
            </div>

            {/* Text logo: ẩn trên desktop khi collapsed, vẫn hiện ở mobile */}
            <div
              className={cn(
                "flex flex-col transition-all duration-200",
                collapsed && "lg:hidden"
              )}
            >
              <h1 className="font-semibold text-base text-sidebar-foreground tracking-tight">
                Admin Panel
              </h1>
              <p className="text-xs text-sidebar-foreground/60">
                Quản lý hệ thống cửa hàng
              </p>
            </div>

            {/* Nút thu gọn desktop */}
            <button
              type="button"
              onClick={onToggleCollapse}
              className={cn(
                "ml-auto hidden lg:inline-flex h-7 w-7 items-center justify-center rounded-full",
                "text-sidebar-foreground/70 hover:text-sidebar-foreground",
                "hover:bg-sidebar-accent/80 transition-colors duration-200"
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
          <nav className="flex-1 px-3 pt-4 pb-6 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "group relative flex items-center px-3 py-2.5 rounded-xl text-sm",
                    collapsed ? "justify-center lg:justify-center" : "gap-3",
                    "text-sidebar-foreground/70 hover:text-sidebar-foreground",
                    "transition-all duration-200 hover:translate-x-1",
                    "hover:bg-sidebar-accent/70",
                    isActive &&
                      "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Left active bar (ẩn trên desktop khi thu gọn nếu muốn) */}
                    <span
                      className={cn(
                        "absolute left-0 top-1/2 -translate-y-1/2 h-7 w-1 rounded-r-full bg-sky-500/0 transition-all duration-200",
                        "group-hover:bg-sky-400/60",
                        isActive && "bg-sky-500",
                        collapsed && "lg:hidden"
                      )}
                    />

                    {/* Icon */}
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg border text-sm",
                        "border-transparent bg-sidebar-accent/40",
                        "group-hover:border-sidebar-primary/60 group-hover:bg-sidebar-accent",
                        isActive &&
                          "bg-sidebar-primary text-sidebar-primary-foreground border-sidebar-primary/70 shadow-sm"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                    </div>

                    {/* Label: ẩn trên desktop khi thu gọn, vẫn hiện ở mobile */}
                    <span
                      className={cn(
                        "truncate",
                        collapsed && "lg:hidden"
                      )}
                    >
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
