"use client";

import { useEffect, useState } from "react";
import axios from "axios";

import { AdminLayout } from "./AdminLayout";
import { StatCard } from "./component/StatCard";
import {
  ShoppingCart,
  Package,
  Users,
  DollarSign,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8888";

type RevenueCard = {
  value: number;
  thisMonth?: number;
  lastMonth?: number;
  changePercent?: number | null;
};

type SimpleCard = {
  value: number;
  newThisMonth?: number;
  changePercent?: number | null;
};

type Cards = {
  revenue: RevenueCard;
  newOrders: SimpleCard;
  products: SimpleCard;
  customers: SimpleCard;
};

type RecentOrder = {
  id: string;
  orderNumber?: string;
  customerName: string;
  totalAmount: number;
  status: string;
  createdAt: string;
};

type ServiceRequest = {
  id: string | number;
  type: string;
  status: "processing" | "pending" | "completed";
  priority: "high" | "medium" | "low";
};

type DashboardResponse = {
  status: string;
  data: {
    cards: Cards;
    recentOrders: RecentOrder[];
    serviceRequests?: ServiceRequest[];
  };
};

const AdminDashboard = () => {
  const [cards, setCards] = useState<Cards | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(false);

  const formatCurrencyMillions = (amount: number | undefined) => {
    if (!amount || amount <= 0) return "₫0";
    const millions = amount / 1_000_000;
    return `₫${millions.toFixed(1)}M`;
  };

  const formatChangePercent = (
    percent: number | null | undefined,
    suffix: string
  ) => {
    if (percent == null) return "—";
    const sign = percent >= 0 ? "+" : "-";
    return `${sign}${Math.abs(percent).toFixed(1)}% ${suffix}`;
  };

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await axios.get<DashboardResponse>(
        `${API_BASE_URL}/api/admin/dashboard`,
        { withCredentials: true }
      );
      const data = res.data.data;
      setCards(data.cards);
      setRecentOrders(data.recentOrders || []);

      if (data.serviceRequests && data.serviceRequests.length > 0) {
        setServiceRequests(data.serviceRequests);
      } else {
        setServiceRequests([
          { id: 1, type: "Bảo hành", status: "processing", priority: "high" },
          { id: 2, type: "Sửa chữa", status: "pending", priority: "medium" },
          { id: 3, type: "Tư vấn", status: "processing", priority: "low" },
          { id: 4, type: "Lắp đặt", status: "pending", priority: "high" },
          { id: 5, type: "Kiểm tra", status: "completed", priority: "medium" },
        ]);
      }
    } catch (err) {
      console.error("Error load dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const today = new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <AdminLayout>
      {/* dùng bg-background từ index.css, bỏ slate-* */}
      <div className="min-h-screen bg-background px-4 py-6 md:px-8 md:py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-3">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              Bảng điều khiển tổng quan
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-2">
              Dashboard
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Nắm bắt nhanh tình hình kinh doanh và dịch vụ trong hệ thống của bạn.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col text-right text-xs text-muted-foreground">
              <span>Hôm nay</span>
              <span className="font-medium text-foreground">{today}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-dashed"
              onClick={loadDashboard}
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Làm mới số liệu
            </Button>
          </div>
        </div>

        {/* Stats + highlight */}
        <div className="grid gap-6 mb-10 lg:grid-cols-12">
          {/* Revenue highlight card */}
          <Card className="relative overflow-hidden rounded-2xl border-none bg-gradient-to-r from-primary via-indigo-500 to-sky-500 text-primary-foreground shadow-xl lg:col-span-5">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_#fff_0,_transparent_50%)]" />
            <div className="relative flex h-full flex-col justify-between p-6 md:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-primary-foreground/80">
                    Doanh thu tổng
                  </p>
                  <p className="mt-3 text-3xl md:text-4xl font-semibold">
                    {formatCurrencyMillions(cards?.revenue?.value ?? 0)}
                  </p>
                  <p className="mt-2 text-xs md:text-sm text-primary-foreground/80">
                    {cards?.revenue?.changePercent != null
                      ? formatChangePercent(
                        cards.revenue.changePercent,
                        "so với tháng trước"
                      )
                      : "Chưa có dữ liệu so sánh"}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs backdrop-blur">
                    <DollarSign className="h-3 w-3" />
                    <span>Hiệu suất doanh thu</span>
                  </div>
                  <div className="h-16 w-28 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center text-[10px] text-primary-foreground/80">
                    Biểu đồ mini
                    <br />
                    (có thể thêm sau)
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 text-xs md:text-sm">
                <div className="rounded-xl bg-black/10 px-3 py-2 backdrop-blur">
                  <p className="text-primary-foreground/80">Tháng này</p>
                  <p className="mt-1 font-semibold">
                    {formatCurrencyMillions(cards?.revenue?.thisMonth ?? 0)}
                  </p>
                </div>
                <div className="rounded-xl bg-black/10 px-3 py-2 backdrop-blur">
                  <p className="text-primary-foreground/80">Tháng trước</p>
                  <p className="mt-1 font-semibold">
                    {formatCurrencyMillions(cards?.revenue?.lastMonth ?? 0)}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* 3 stat cards nhỏ */}
          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7 lg:grid-cols-3">
            <StatCard
              title="Đơn hàng mới"
              value={String(cards?.newOrders?.value ?? 0)}
              change="Trong 7 ngày gần đây"
              icon={ShoppingCart}
              trend="up"
              variant="default"
              loading={loading}
            />

            {/* Sản phẩm */}
            <StatCard
              title="Sản phẩm"
              value={String(cards?.products?.value ?? 0)}
              change={
                cards?.products?.newThisMonth && cards.products.newThisMonth > 0
                  ? `${cards.products.newThisMonth} sản phẩm mới`
                  : "Không có sản phẩm mới"
              }
              icon={Package}
              variant="default"
              // trend: có sản phẩm mới -> mũi tên xanh, không thì neutral
              trend={
                cards?.products?.newThisMonth && cards.products.newThisMonth > 0
                  ? "up"
                  : undefined
              }
              loading={loading}
            />


            <StatCard
              title="Khách hàng"
              value={String(cards?.customers?.value ?? 0)}
              change={
                cards?.customers?.newThisMonth
                  ? `+${cards.customers.newThisMonth} khách mới trong tháng`
                  : "Không có khách mới trong tháng"
              }
              icon={Users}
              trend="up"
              variant="default"
              loading={loading}
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 gap-6 mb-10 lg:grid-cols-2">
          {/* Recent Orders */}
          <Card className="rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div>
                <h3 className="text-base md:text-lg font-semibold text-card-foreground">
                  Đơn hàng gần đây
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  5 đơn hàng mới nhất trong hệ thống
                </p>
              </div>
              <Button variant="outline" size="sm" className="rounded-full">
                Xem tất cả
              </Button>
            </div>
            <div className="px-4 md:px-6 py-4 space-y-3">
              {loading && recentOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Đang tải dữ liệu...
                </p>
              ) : recentOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Chưa có đơn hàng nào.
                </p>
              ) : (
                recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="group flex items-center justify-between rounded-xl border border-transparent px-2 py-3 transition-colors hover:border-border hover:bg-muted"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <ShoppingCart className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-card-foreground">
                          {order.orderNumber
                            ? `Đơn hàng #${order.orderNumber}`
                            : `Đơn hàng ${order.id}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {order.customerName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-sm font-semibold text-card-foreground">
                        {formatCurrencyMillions(order.totalAmount)}
                      </p>
                      <span className="inline-flex items-center rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">
                        {order.status === "completed"
                          ? "Hoàn thành"
                          : order.status === "pending"
                            ? "Đang xử lý"
                            : order.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Service Requests */}
          <Card className="rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div>
                <h3 className="text-base md:text-lg font-semibold text-card-foreground">
                  Yêu cầu dịch vụ
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Các yêu cầu kỹ thuật cần được xử lý
                </p>
              </div>
              <Button variant="outline" size="sm" className="rounded-full">
                Xem tất cả
              </Button>
            </div>
            <div className="px-4 md:px-6 py-4 space-y-3">
              {serviceRequests.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Chưa có yêu cầu dịch vụ.
                </p>
              ) : (
                serviceRequests.map((service) => (
                  <div
                    key={service.id}
                    className="group flex items-center justify-between rounded-xl border border-transparent px-2 py-3 transition-colors hover:border-border hover:bg-muted"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-10 w-10 rounded-xl flex items-center justify-center ${service.priority === "high"
                            ? "bg-destructive/10"
                            : service.priority === "medium"
                              ? "bg-warning/10"
                              : "bg-success/10"
                          }`}
                      >
                        <AlertCircle
                          className={`h-5 w-5 ${service.priority === "high"
                              ? "text-destructive"
                              : service.priority === "medium"
                                ? "text-warning"
                                : "text-success"
                            }`}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-card-foreground">
                          {service.type}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Mã YC: YC-{2000 + Number(service.id)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${service.status === "completed"
                            ? "bg-success/10 text-success"
                            : service.status === "processing"
                              ? "bg-primary/10 text-primary"
                              : "bg-warning/10 text-warning"
                          }`}
                      >
                        {service.status === "completed"
                          ? "Hoàn thành"
                          : service.status === "processing"
                            ? "Đang xử lý"
                            : "Chờ xử lý"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between px-6 pt-5 pb-4">
            <div>
              <h3 className="text-base md:text-lg font-semibold text-card-foreground">
                Thao tác nhanh
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground">
                Thực hiện các công việc thường dùng chỉ với một cú nhấp chuột.
              </p>
            </div>
          </div>
          <div className="px-4 md:px-6 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button className="group h-auto py-5 md:py-6 flex flex-col items-start md:items-center gap-2 rounded-2xl border-none bg-gradient-to-r from-primary to-indigo-500 text-primary-foreground shadow-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
                    <Package className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-semibold">
                    Thêm sản phẩm mới
                  </span>
                </div>
                <span className="text-xs text-primary-foreground/80 md:text-center">
                  Tạo nhanh sản phẩm và quản lý trong kho.
                </span>
              </Button>

              <Button
                className="h-auto py-5 md:py-6 flex flex-col items-start md:items-center gap-2 rounded-2xl border border-border bg-background hover:border-primary/40 hover:bg-primary/[0.03]"
                variant="outline"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/5">
                    <ShoppingCart className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-semibold">Tạo đơn hàng</span>
                </div>
                <span className="text-xs text-muted-foreground md:text-center">
                  Lập đơn bán hàng và theo dõi trạng thái.
                </span>
              </Button>

              <Button
                className="h-auto py-5 md:py-6 flex flex-col items-start md:items-center gap-2 rounded-2xl border border-border bg-background hover:border-primary/40 hover:bg-primary/[0.03]"
                variant="outline"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/5">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-semibold">Xem báo cáo</span>
                </div>
                <span className="text-xs text-muted-foreground md:text-center">
                  Phân tích doanh thu, khách hàng và sản phẩm.
                </span>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
