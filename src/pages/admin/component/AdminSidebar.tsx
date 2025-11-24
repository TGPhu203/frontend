import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    Wrench,
    Settings,
    Menu,
    X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/" },
    { icon: Package, label: "Sản phẩm", path: "/admin/adminProduct" },
    { icon: Package, label: "Danh mục", path: "/admin/adminCategory" },
    { icon: ShoppingCart, label: "Đơn hàng", path: "/orders" },
    { icon: Users, label: "Khách hàng", path: "/customers" },
    { icon: Wrench, label: "Dịch vụ kỹ thuật", path: "/services" },
    { icon: Settings, label: "Cài đặt", path: "/settings" },
];

export const AdminSidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const rawUser = localStorage.getItem("user");
    const user = rawUser ? JSON.parse(rawUser) : null;
    return (
        <>
            {/* Mobile menu button */}
            <Button
                variant="ghost"
                size="icon"
                className="fixed top-4 left-4 z-50 lg:hidden bg-card"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300 lg:translate-x-0",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center gap-2 p-6 border-b border-sidebar-border">
                        <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                            <LayoutDashboard className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg text-sidebar-foreground">Admin Panel</h1>
                            <p className="text-xs text-sidebar-foreground/60">Quản lý hệ thống</p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1">
                        {menuItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsOpen(false)}
                                className={({ isActive }) =>
                                    cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                                        "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                                        isActive && "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                                    )
                                }
                            >
                                <item.icon className="h-5 w-5" />
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                    </nav>

                    {/* User info */}
                    {/* ================= USER INFO ================= */}
                    <div className="p-4 border-t border-sidebar-border">
                        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-sidebar-accent">

                            {/* Avatar */}
                            <div className="h-10 w-10 rounded-full overflow-hidden bg-gradient-primary flex items-center justify-center">
                                {user?.avatar ? (
                                    <img
                                        src={user.avatar}
                                        alt="avatar"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <span className="text-sm font-semibold text-primary-foreground">
                                        {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
                                    </span>
                                )}
                            </div>

                            {/* User Info */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-sidebar-foreground truncate">
                                    {user?.fullName || "Admin"}
                                </p>
                                <p className="text-xs text-sidebar-foreground/60 truncate">
                                    {user?.email || "admin@system.com"}
                                </p>
                            </div>
                        </div>

                        {/* Logout Button */}
                        <button
                            onClick={() => {
                                localStorage.removeItem("user");
                                window.location.href = "/auth"; // redirect to login
                            }}
                            className="
      mt-3 w-full text-left px-4 py-2 rounded-lg 
      text-red-500 hover:bg-red-500/10 transition
      font-medium text-sm
    "
                        > 
                            Đăng xuất
                        </button>
                    </div>

                </div>
            </aside>
        </>
    );
};
