// src/pages/admin/AdminCart.tsx
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { toast } from "sonner";
import { RefreshCw, Search } from "lucide-react";

import {
  adminGetAllOrders,
  adminUpdateOrderStatus,
  type OrderStatus,
} from "@/api/orderApi";

const AdminCart = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // dialog
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [statusValue, setStatusValue] = useState<OrderStatus | "">("");
  const [savingStatus, setSavingStatus] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      // ✅ adminGetAllOrders trả về object { orders, total, pages, currentPage }
      const { orders } = await adminGetAllOrders({ page: 1, limit: 50 });
      setOrders(orders || []);
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

  // mở dialog xem chi tiết + chuẩn bị value trạng thái
  const handleOpenDetail = (order: any) => {
    setSelectedOrder(order);
    // nếu order.status không khớp union thì cast tạm, hoặc để ""
    setStatusValue((order.status as OrderStatus) || "");
    setDetailOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    if (!statusValue) {
      toast.error("Vui lòng chọn trạng thái");
      return;
    }

    try {
      setSavingStatus(true);
      // ✅ truyền đúng kiểu literal union
      const updated = await adminUpdateOrderStatus(
        selectedOrder._id,
        statusValue as OrderStatus
      );

      setOrders((prev) =>
        prev.map((o) => (o._id === updated._id ? { ...o, ...updated } : o))
      );
      setSelectedOrder((prev: any) => (prev ? { ...prev, ...updated } : prev));

      toast.success("Đã cập nhật trạng thái đơn hàng");
      setDetailOpen(false);
    } catch (e: any) {
      toast.error(e?.message || "Không thể cập nhật trạng thái đơn hàng");
    } finally {
      setSavingStatus(false);
    }
  };

  const userLabelOf = (o: any) => {
    const userObj = o.userId;
    return (
      userObj?.email ||
      (userObj?.firstName || userObj?.lastName
        ? `${userObj.firstName || ""} ${userObj.lastName || ""}`.trim()
        : "N/A")
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
                    filteredOrders.map((o) => (
                      <TableRow
                        key={o._id}
                        className="hover:bg-muted/40 transition-colors"
                      >
                        <TableCell className="font-medium">
                          {o.orderNumber || o._id}
                        </TableCell>

                        <TableCell className="text-sm">
                          {userLabelOf(o)}
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
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full"
                            onClick={() => handleOpenDetail(o)}
                          >
                            Xem chi tiết
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Dialog chi tiết + set trạng thái */}
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                Chi tiết đơn{" "}
                {selectedOrder?.orderNumber || selectedOrder?._id}
              </DialogTitle>
              <DialogDescription>
                Xem thông tin nhanh và cập nhật trạng thái đơn hàng.
              </DialogDescription>
            </DialogHeader>

            {selectedOrder && (
              <div className="space-y-4 text-sm mt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Khách hàng
                    </p>
                    <p className="font-medium">{userLabelOf(selectedOrder)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Tổng tiền
                    </p>
                    <p className="font-semibold text-primary">
                      {selectedOrder.totalAmount?.toLocaleString("vi-VN")}{" "}
                      {selectedOrder.currency || "VND"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Thanh toán
                    </p>
                    <div className="mt-1">
                      {renderPaymentBadge(selectedOrder.paymentStatus)}
                      {selectedOrder.paymentMethod && (
                        <div className="text-[11px] text-muted-foreground mt-1">
                          Phương thức:{" "}
                          {selectedOrder.paymentMethod.toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Ngày tạo
                    </p>
                    <p className="mt-1">
                      {selectedOrder.createdAt
                        ? new Date(
                            selectedOrder.createdAt
                          ).toLocaleString("vi-VN")
                        : ""}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Trạng thái hiện tại
                  </p>
                  {renderStatusBadge(selectedOrder.status)}
                </div>

                <div className="border-t pt-3 space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      Cập nhật trạng thái đơn hàng
                    </label>
                    <select
                      className="w-full rounded-md border px-2 py-1.5 text-sm bg-background"
                      value={statusValue}
                      onChange={(e) =>
                        setStatusValue(e.target.value as OrderStatus | "")
                      }
                    >
                      <option value="">Chọn trạng thái...</option>
                      <option value="pending">Chờ xử lý</option>
                      <option value="processing">Đang xử lý</option>
                      <option value="shipped">Đang giao</option>
                      <option value="completed">Hoàn thành</option>
                      <option value="cancelled">Đã hủy</option>
                    </select>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDetailOpen(false)}
                    >
                      Đóng
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleUpdateStatus}
                      disabled={savingStatus}
                    >
                      {savingStatus ? "Đang lưu..." : "Lưu thay đổi"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminCart;
