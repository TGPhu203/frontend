// src/pages/account/AccountLayout.tsx
"use client";

import { Outlet, Link, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { User, ClipboardList, Heart, MapPin, Bell, Gift, PackageSearch } from "lucide-react";
import { ReactNode } from "react";
type MenuItemConfig = {
    to: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
};
type AccountLayoutProps = {
    children: ReactNode;
};
const MENU_ITEMS: MenuItemConfig[] = [
    { to: "/profile", label: "Thông tin tài khoản", icon: User },
    { to: "/my-orders", label: "Quản lý đơn hàng", icon: ClipboardList },
    { to: "/wishlist", label: "Sản phẩm yêu thích", icon: Heart },
    { to: "/address", label: "Sổ địa chỉ", icon: MapPin },
    { to: "/my-reviews", label: "Đánh giá", icon: Bell },
    { to: "/promotions", label: "Ưu đãi & Cập nhật", icon: Gift },
    { to: "/orders/:id", label: "Đơn hàng", icon: PackageSearch },
];

const AccountLayout = ({ children }: AccountLayoutProps) => {
    const location = useLocation();

    // lấy thông tin user từ localStorage để hiển thị tên / avatar
    const rawUser =
        typeof window !== "undefined" ? localStorage.getItem("user") : null;
    const user = rawUser ? JSON.parse(rawUser) : null;

    const fullName =
        user?.fullName ||
        `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
        "Khách hàng";
    return (
        <div className="min-h-screen flex flex-col bg-[#f4f5fb]">
            <Header />

            <main className="flex-1">
                <div className="mx-auto w-full max-w-6xl px-4 py-6 lg:py-8">
                    <div className="flex gap-8">
                        {/* SIDEBAR TÀI KHOẢN */}
                        <aside className="w-[260px] text-[13px]">
                            <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                                <div className="h-10 w-10 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center">
                                    {user?.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt={fullName}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <User className="h-5 w-5 text-slate-600" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-[11px] text-slate-500">Tài khoản của</p>
                                    <p className="text-[13px] font-semibold text-slate-900">
                                        {fullName}
                                    </p>
                                </div>
                            </div>

                            <nav className="mt-3 space-y-1">
                                {MENU_ITEMS.map((item) => {
                                    const active = location.pathname.startsWith(item.to);
                                    const Icon = item.icon;
                                    const accent = item.to === "/account/wishlist"; // giống hình: wishlist có nền xanh

                                    return (
                                        <Link key={item.to} to={item.to}>
                                            <button
                                                type="button"
                                                className={[
                                                    "flex w-full items-center gap-2 px-2 py-2 rounded-none",
                                                    active
                                                        ? "text-[#0050d8] font-semibold"
                                                        : "text-slate-800",
                                                ].join(" ")}
                                            >
                                                <span
                                                    className={[
                                                        "flex h-7 w-7 items-center justify-center rounded-full",
                                                        accent && active
                                                            ? "bg-[#0050d8] text-white"
                                                            : "bg-transparent text-slate-500",
                                                    ].join(" ")}
                                                >
                                                    <Icon className="h-4 w-4" />
                                                </span>
                                                <span>{item.label}</span>
                                            </button>
                                        </Link>
                                    );
                                })}
                            </nav>
                        </aside>

                        {/* PHẦN NỘI DUNG – chỉ phần này thay đổi khi navigate */}
                        <section className="flex-1 min-h-0 overflow-y-auto px-4 py-4"style={{marginTop:-20}}>
                            {children}
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default AccountLayout;
