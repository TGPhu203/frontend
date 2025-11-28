// src/pages/admin/AdminDashboard.tsx
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
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Recharts
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

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

type DashboardResponse = {
  status: string;
  data: {
    cards: Cards;
  };
};

// ==== TYPES THỐNG KÊ DOANH THU ====
type RevenueRange = "daily" | "monthly" | "yearly";

type RevenueSummary = {
  totalRevenue: number;
  totalOrders: number;
};

type DailyItem = {
  date: string;
  totalRevenue: number;
  totalOrders: number;
};

type MonthlyItem = {
  year: number;
  month: number;
  label: string;
  totalRevenue: number;
  totalOrders: number;
};

type YearlyItem = {
  year: number;
  totalRevenue: number;
  totalOrders: number;
};

// Dữ liệu đưa vào chart
type ChartPoint = {
  label: string;
  revenue: number;
  orders: number;
};

const formatCurrencyMillions = (amount: number | undefined) => {
  if (!amount || amount <= 0) return "₫0";
  const millions = amount / 1_000_000;
  return `₫${millions.toFixed(1)}M`;
};

const formatMoneyFull = (n: number | undefined | null) =>
  Number(n || 0).toLocaleString("vi-VN") + "₫";

const AdminDashboard = () => {
  const [cards, setCards] = useState<Cards | null>(null);
  const [loading, setLoading] = useState(false);

  // state cho biểu đồ
  const [revenueRange, setRevenueRange] = useState<RevenueRange>("monthly");
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [revenueSummary, setRevenueSummary] =
    useState<RevenueSummary | null>(null);
  const [loadingChart, setLoadingChart] = useState(false);

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
    } catch (err) {
      console.error("Error load dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  // GỌI /api/admin/stats/revenue/:mode GIỐNG AdminRevenueStats
  const loadRevenueChart = async (range: RevenueRange) => {
    try {
      setLoadingChart(true);

      const res = await axios.get(
        `${API_BASE_URL}/api/admin/stats/revenue/${range}`,
        {
          // Dashboard không lọc from/to -> để trống params
          withCredentials: true,
        }
      );

      const data = res.data?.data;
      const items = data?.items || [];

      setRevenueSummary(
        data?.summary || { totalRevenue: 0, totalOrders: 0 }
      );

      const mapped: ChartPoint[] = (items as any[]).map((item) => {
        if (range === "daily") {
          const it = item as DailyItem;
          return {
            label: it.date,
            revenue: it.totalRevenue,
            orders: it.totalOrders,
          };
        }
        if (range === "monthly") {
          const it = item as MonthlyItem;
          return {
            label: it.label,
            revenue: it.totalRevenue,
            orders: it.totalOrders,
          };
        }
        const it = item as YearlyItem;
        return {
          label: String(it.year),
          revenue: it.totalRevenue,
          orders: it.totalOrders,
        };
      });

      setChartData(mapped);
    } catch (err) {
      console.error("Error load revenue chart:", err);
      setChartData([]);
      setRevenueSummary(null);
    } finally {
      setLoadingChart(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    loadRevenueChart(revenueRange);
  }, [revenueRange]);

  const today = new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const totalInChart =
    revenueSummary?.totalRevenue ??
    chartData.reduce((sum, p) => sum + p.revenue, 0);

  return (
    <AdminLayout>
      <div className="min-h-screen bg-background px-4 py-6 md:px-8 md:py-8">
        {/* header đơn giản */}
        <div className="mb-7 flex flex-col gap-2 md:flex-row md:items-right md:justify-between">
          <div className="flex items-right gap-3 text-xs text-muted-foreground">
            <div className="hidden flex-col text-left md:flex">
              <span>Hôm nay</span>
              <span className="font-medium text-foreground">{today}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={loadDashboard}
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Làm mới số liệu
            </Button>
          </div>
        </div>

        {/* khối stat */}
        <div className="mb-8 grid gap-6 lg:grid-cols-12">
          {/* doanh thu tổng */}
          <Card className="lg:col-span-5 rounded-md border bg-card">
            <div className="flex h-full flex-col justify-between p-5 md:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Doanh thu tổng
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-foreground md:text-3xl">
                    {formatCurrencyMillions(cards?.revenue?.value ?? 0)}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {cards?.revenue?.changePercent != null
                      ? formatChangePercent(
                          cards.revenue.changePercent,
                          "so với tháng trước"
                        )
                      : "Chưa có dữ liệu so sánh"}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2 text-xs text-muted-foreground">
                  <div className="inline-flex items-center gap-2 rounded-full border px-2.5 py-1">
                    <DollarSign className="h-3.5 w-3.5 text-primary" />
                    <span>Doanh thu</span>
                  </div>
                  <span>Số liệu lấy từ đơn đã xác nhận.</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-xs md:text-sm">
                <div className="rounded-md border bg-muted/40 px-3 py-2">
                  <p className="text-muted-foreground">Tháng này</p>
                  <p className="mt-1 font-semibold text-foreground">
                    {formatCurrencyMillions(cards?.revenue?.thisMonth ?? 0)}
                  </p>
                </div>
                <div className="rounded-md border bg-muted/40 px-3 py-2">
                  <p className="text-muted-foreground">Tháng trước</p>
                  <p className="mt-1 font-semibold text-foreground">
                    {formatCurrencyMillions(cards?.revenue?.lastMonth ?? 0)}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* 3 stat nhỏ */}
          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7 lg:grid-cols-3">
            <StatCard
              title="Đơn hàng mới"
              value={String(cards?.newOrders?.value ?? 0)}
              change="7 ngày gần đây"
              icon={ShoppingCart}
              trend="up"
              variant="default"
              loading={loading}
            />

            <StatCard
              title="Sản phẩm"
              value={String(cards?.products?.value ?? 0)}
              change={
                cards?.products?.newThisMonth &&
                cards.products.newThisMonth > 0
                  ? `${cards.products.newThisMonth} sản phẩm mới trong tháng`
                  : "Chưa có sản phẩm mới"
              }
              icon={Package}
              trend={
                cards?.products?.newThisMonth &&
                cards.products.newThisMonth > 0
                  ? "up"
                  : undefined
              }
              variant="default"
              loading={loading}
            />

            <StatCard
              title="Khách hàng"
              value={String(cards?.customers?.value ?? 0)}
              change={
                cards?.customers?.newThisMonth
                  ? `+${cards.customers.newThisMonth} khách mới`
                  : "Chưa có khách mới trong tháng"
              }
              icon={Users}
              trend="up"
              variant="default"
              loading={loading}
            />
          </div>
        </div>

        {/* BIỂU ĐỒ DOANH THU TỔNG */}
        <Card className="mb-8 rounded-md border bg-card">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <div>
              <h3 className="text-base font-semibold text-card-foreground md:text-lg">
                Biểu đồ doanh thu
              </h3>
              <p className="text-xs text-muted-foreground md:text-sm">
                Tổng doanh thu theo{" "}
                {revenueRange === "daily"
                  ? "ngày"
                  : revenueRange === "monthly"
                  ? "tháng"
                  : "năm"}
                .
              </p>
            </div>
            <div className="inline-flex gap-2 rounded-md bg-muted/60 p-1 text-xs">
              <Button
                size="sm"
                variant={revenueRange === "daily" ? "default" : "ghost"}
                className="h-7 px-2"
                onClick={() => setRevenueRange("daily")}
              >
                Ngày
              </Button>
              <Button
                size="sm"
                variant={revenueRange === "monthly" ? "default" : "ghost"}
                className="h-7 px-2"
                onClick={() => setRevenueRange("monthly")}
              >
                Tháng
              </Button>
              <Button
                size="sm"
                variant={revenueRange === "yearly" ? "default" : "ghost"}
                className="h-7 px-2"
                onClick={() => setRevenueRange("yearly")}
              >
                Năm
              </Button>
            </div>
          </div>

          <div className="px-5 py-4">
            {loadingChart ? (
              <p className="text-sm text-muted-foreground">
                Đang tải dữ liệu biểu đồ...
              </p>
            ) : chartData.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Chưa có dữ liệu doanh thu cho khoảng thời gian này.
              </p>
            ) : (
              <>
                <div className="mb-3 text-sm text-muted-foreground">
                  Tổng:{" "}
                  <span className="font-semibold text-foreground">
                    {formatCurrencyMillions(totalInChart)}
                  </span>
                </div>

                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" />
                      <YAxis
                        tickFormatter={(v) =>
                          Number(v).toLocaleString("vi-VN")
                        }
                      />
                      <Tooltip
                        formatter={(value: any, name: string) => {
                          if (name === "revenue") {
                            return formatMoneyFull(value);
                          }
                          return value;
                        }}
                        labelFormatter={(label) => label}
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        name="Doanh thu"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* thao tác nhanh */}
       
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
