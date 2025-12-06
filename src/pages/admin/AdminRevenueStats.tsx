// src/pages/admin/AdminRevenueStats.tsx
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";

import { AdminLayout } from "./AdminLayout";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import {
  BarChart2,
  Calendar,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Download,           // ⬅ thêm icon
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8888";

// ===== TYPES =====
type RevenueMode = "daily" | "monthly" | "yearly";

type Summary = {
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

type RevenueResponse<T> = {
  from: string;
  to: string;
  items: T[];
  summary: Summary;
};

const formatMoney = (n: number | undefined | null) =>
  Number(n || 0).toLocaleString("vi-VN") + "₫";

const formatDateOnly = (s: string | undefined) =>
  s ? new Date(s).toLocaleDateString("vi-VN") : "";

const AdminRevenueStats = () => {
  const [mode, setMode] = useState<RevenueMode>("daily");

  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  const [loading, setLoading] = useState(false);

  const [dailyData, setDailyData] = useState<RevenueResponse<DailyItem> | null>(
    null
  );
  const [monthlyData, setMonthlyData] =
    useState<RevenueResponse<MonthlyItem> | null>(null);
  const [yearlyData, setYearlyData] =
    useState<RevenueResponse<YearlyItem> | null>(null);

  // data hiện tại theo mode
  const currentData =
    mode === "daily"
      ? dailyData
      : mode === "monthly"
        ? monthlyData
        : yearlyData;

  const loadRevenue = async (m: RevenueMode) => {
    try {
      setLoading(true);

      const params: any = {};
      if (from && to) {
        params.from = from;
        params.to = to;
      }

      const res = await axios.get(
        `${API_BASE_URL}/api/admin/stats/revenue/${m}`,
        {
          params,
          withCredentials: true,
        }
      );

      const data = res.data?.data;

      if (m === "daily") {
        setDailyData(data as RevenueResponse<DailyItem>);
      } else if (m === "monthly") {
        setMonthlyData(data as RevenueResponse<MonthlyItem>);
      } else {
        setYearlyData(data as RevenueResponse<YearlyItem>);
      }
    } catch (err: any) {
      console.error("Error load revenue stats:", err);
      toast.error(
        err?.response?.data?.message || "Không thể tải thống kê doanh thu"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // khi đổi mode, reset khoảng ngày để backend dùng fallback
    setFrom("");
    setTo("");
    loadRevenue(mode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const handleApplyFilter = () => {
    loadRevenue(mode);
  };

  // ⬇⬇⬇ THÊM HÀM EXPORT BÁO CÁO
  const handleExport = () => {
    try {
      const params = new URLSearchParams();
      params.set("type", mode); // daily | monthly | yearly

      if (from) params.set("from", from);
      if (to) params.set("to", to);

      const url = `${API_BASE_URL}/api/admin/stats/revenue/export?${params.toString()}`;

      // dùng window.open để trình duyệt tải file CSV
      window.open(url, "_blank");
    } catch (error) {
      console.error("Export revenue error:", error);
      toast.error("Không thể xuất báo cáo doanh thu");
    }
  };
  // ⬆⬆⬆ HẾT PHẦN MỚI

  const avgOrderValue =
    currentData && currentData.summary.totalOrders > 0
      ? currentData.summary.totalRevenue / currentData.summary.totalOrders
      : 0;

  // chuẩn hoá dữ liệu chart
  const chartData =
    currentData?.items?.map((item: any) => {
      if (mode === "daily") {
        return {
          label: (item as DailyItem).date,
          revenue: item.totalRevenue,
          orders: item.totalOrders,
        };
      }
      if (mode === "monthly") {
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
    }) || [];

  return (
    <AdminLayout>
      <div className="p-4 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <BarChart2 className="h-6 w-6 text-primary" />
              Thống kê doanh thu
            </h1>
            <p className="text-sm text-muted-foreground">
              Xem doanh thu theo ngày, tháng, năm và một số chỉ số tổng quan.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-[150px]"
                />
              </div>
              <span className="text-xs text-muted-foreground">đến</span>
              <Input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-[150px]"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={handleApplyFilter} disabled={loading}>
                {loading ? "Đang tải..." : "Áp dụng"}
              </Button>

              {/* ⬇ NÚT XUẤT BÁO CÁO */}
              <Button
                type="button"
                variant="outline"
                onClick={handleExport}
                disabled={loading}
              >
                <Download className="h-4 w-4 mr-2" />
                Xuất báo cáo
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs mode */}
        <Tabs value={mode} onValueChange={(v) => setMode(v as RevenueMode)}>
          <TabsList className="mb-4">
            <TabsTrigger value="daily">Theo ngày</TabsTrigger>
            <TabsTrigger value="monthly">Theo tháng</TabsTrigger>
            <TabsTrigger value="yearly">Theo năm</TabsTrigger>
          </TabsList>

          <TabsContent value={mode} className="space-y-6">
            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    Tổng doanh thu
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Đơn đã thanh toán, trừ đơn đã hủy.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {currentData
                      ? formatMoney(currentData.summary.totalRevenue)
                      : "—"}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-primary" />
                    Tổng đơn hàng
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {currentData?.summary.totalOrders ?? "—"}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Giá trị trung bình / đơn
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {currentData
                      ? formatMoney(Math.round(avgOrderValue))
                      : "—"}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Khoảng thời gian */}
            {currentData && (
              <div className="text-xs text-muted-foreground">
                Khoảng dữ liệu:{" "}
                <Badge variant="outline" className="ml-1">
                  {formatDateOnly(currentData.from)} —{" "}
                  {formatDateOnly(currentData.to)}
                </Badge>
              </div>
            )}

            {/* Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart2 className="h-4 w-4 text-primary" />
                  Biểu đồ doanh thu{" "}
                  <span className="text-xs text-muted-foreground">
                    ({mode === "daily"
                      ? "theo ngày"
                      : mode === "monthly"
                        ? "theo tháng"
                        : "theo năm"})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="h-72">
                {loading ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Đang tải biểu đồ...
                  </div>
                ) : chartData.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Chưa có dữ liệu trong khoảng thời gian này.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{ top: 16, right: 24, left: 80, bottom: 8 }} // 👈 chừa rộng bên trái
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" />
                      <YAxis
                        width={60} // 👈 tăng chiều rộng vùng trục tung
                        tickFormatter={(v) => Number(v).toLocaleString("vi-VN")}
                      />
                      <Tooltip
                        formatter={(value: any, name: string) =>
                          name === "revenue" ? formatMoney(value) : value
                        }
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
                )}
              </CardContent>

            </Card>

            {/* Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  Chi tiết doanh thu
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-6 text-muted-foreground">
                    Đang tải dữ liệu...
                  </div>
                ) : !currentData || currentData.items.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    Không có dữ liệu.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          {mode === "daily"
                            ? "Ngày"
                            : mode === "monthly"
                              ? "Tháng"
                              : "Năm"}
                        </TableHead>
                        <TableHead>Doanh thu</TableHead>
                        <TableHead>Đơn hàng</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mode === "daily" &&
                        (currentData.items as DailyItem[]).map((row) => (
                          <TableRow key={row.date}>
                            <TableCell>{row.date}</TableCell>
                            <TableCell>
                              {formatMoney(row.totalRevenue)}
                            </TableCell>
                            <TableCell>{row.totalOrders}</TableCell>
                          </TableRow>
                        ))}

                      {mode === "monthly" &&
                        (currentData.items as MonthlyItem[]).map((row) => (
                          <TableRow key={row.label}>
                            <TableCell>{row.label}</TableCell>
                            <TableCell>
                              {formatMoney(row.totalRevenue)}
                            </TableCell>
                            <TableCell>{row.totalOrders}</TableCell>
                          </TableRow>
                        ))}

                      {mode === "yearly" &&
                        (currentData.items as YearlyItem[]).map((row) => (
                          <TableRow key={row.year}>
                            <TableCell>{row.year}</TableCell>
                            <TableCell>
                              {formatMoney(row.totalRevenue)}
                            </TableCell>
                            <TableCell>{row.totalOrders}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminRevenueStats;
