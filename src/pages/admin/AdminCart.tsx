"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "./AdminLayout";

import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import { Link } from "react-router-dom";
import { toast } from "sonner";
import { RefreshCw, Search } from "lucide-react";

import { adminGetAllOrders } from "@/api/orderApi";

const AdminCart = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const list = await adminGetAllOrders({ page: 1, limit: 50 });
      setOrders(list || []);
    } catch (e: any) {
      toast.error(e?.message || "Lỗi khi tải danh sách đơn hàng");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredOrders = useMemo(() => {
    if (!search.trim()) return orders;
    const q = search.toLowerCase();
    return orders.filter((o) => {
      const userObj = o.userId || {};
      const userLabel =
        userObj?.email ||
        (userObj?.firstName || userObj?.lastName
          ? `${userObj.firstName || ""} ${userObj.lastName || ""}`.trim()
          : "");
      return (
        String(o.orderNumber || o._id).toLowerCase().includes(q) ||
        userLabel.toLowerCase().includes(q)
      );
    });
  }, [orders, search]);

  const renderPaymentBadge = (status?: string) => {
    const s = (status || "").toLowerCase();
    if (s === "paid" || s === "completed") {
      return (
        <Badge className="bg-success/10 text-success border-0">
          Đã thanh toán
        </Badge>
      );
    }
    if (s === "pending") {
      return (
        <Badge className="bg-warning/10 text-warning border-0">
          Chờ thanh toán
        </Badge>
      );
    }
    if (s === "failed" || s === "cancelled") {
      return (
        <Badge className="bg-destructive/10 text-destructive border-0">
          Thất bại
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-muted-foreground">
        {status || "N/A"}
      </Badge>
    );
  };

  const renderStatusBadge = (status?: string) => {
    const s = (status || "").toLowerCase();
    if (s === "completed" || s === "delivered") {
      return (
        <Badge className="bg-success/10 text-success border-0">
          Hoàn thành
        </Badge>
      );
    }
    if (s === "processing") {
      return (
        <Badge className="bg-primary/10 text-primary border-0">
          Đang xử lý
        </Badge>
      );
    }
    if (s === "pending") {
      return (
        <Badge className="bg-warning/10 text-warning border-0">
          Chờ xử lý
        </Badge>
      );
    }
    if (s === "cancelled") {
      return (
        <Badge className="bg-destructive/10 text-destructive border-0">
          Đã hủy
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-muted-foreground">
        {status || "N/A"}
      </Badge>
    );
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-background px-4 py-6 md:px-8 md:py-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-2">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              Theo dõi đơn hàng
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Quản lý đơn hàng
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Xem nhanh trạng thái, thanh toán và chi tiết của các đơn hàng.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9 h-9"
                placeholder="Tìm mã đơn / email / tên..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-9 rounded-full"
              onClick={load}
              disabled={loading}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Làm mới
            </Button>
          </div>
        </div>

        {/* Table card */}
        <Card className="border border-border bg-card shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 py-3 md:px-6">
            <div>
              <CardTitle className="text-base md:text-lg font-semibold">
                Danh sách đơn hàng
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Tổng cộng {orders.length} đơn hàng.
              </p>
            </div>
          </CardHeader>

          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
                    <TableHead className="whitespace-nowrap">
                      Mã đơn
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      Người dùng
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      Tổng tiền
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      Thanh toán
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      Trạng thái
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      Ngày tạo
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-right">
                      Hành động
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="py-6 text-center text-sm text-muted-foreground"
                      >
                        Đang tải danh sách đơn hàng...
                      </TableCell>
                    </TableRow>
                  ) : filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="py-6 text-center text-sm text-muted-foreground"
                      >
                        Không có đơn hàng nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((o) => {
                      const userObj = o.userId;
                      const userLabel =
                        userObj?.email ||
                        (userObj?.firstName || userObj?.lastName
                          ? `${userObj.firstName || ""} ${
                              userObj.lastName || ""
                            }`.trim()
                          : "N/A");

                      return (
                        <TableRow
                          key={o._id}
                          className="hover:bg-muted/40 transition-colors"
                        >
                          <TableCell className="font-medium">
                            {o.orderNumber || o._id}
                          </TableCell>

                          <TableCell className="text-sm">
                            {userLabel}
                          </TableCell>

                          <TableCell className="text-sm">
                            {o.totalAmount?.toLocaleString("vi-VN")}{" "}
                            {o.currency || "VND"}
                          </TableCell>

                          <TableCell className="text-sm space-y-1">
                            {renderPaymentBadge(o.paymentStatus)}
                            {o.paymentMethod && (
                              <div className="text-[11px] text-muted-foreground">
                                {o.paymentMethod.toUpperCase()}
                              </div>
                            )}
                          </TableCell>

                          <TableCell className="text-sm">
                            {renderStatusBadge(o.status)}
                          </TableCell>

                          <TableCell className="text-sm whitespace-nowrap">
                            {o.createdAt
                              ? new Date(o.createdAt).toLocaleString("vi-VN")
                              : ""}
                          </TableCell>

                          <TableCell className="text-right">
                            <Link to={`/admin/order/${o._id}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-full"
                              >
                                Xem chi tiết
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminCart;
