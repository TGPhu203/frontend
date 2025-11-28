// src/pages/admin/AdminOrders.tsx
"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { adminGetAllOrders, adminUpdateOrderStatus } from "@/api/orderApi";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";

type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "completed"
  | "cancelled";

type AdminOrder = {
  _id: string;
  orderNumber: string;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus?: string;
  createdAt: string;
  userId?: {
    email?: string;
  };
  shippingAddress?: {
    fullName?: string;
    phone?: string;
    addressLine1?: string;
    city?: string;
    state?: string;
    country?: string;
  };
};

const money = (n: number | undefined) =>
  `${(n || 0).toLocaleString("vi-VN")}₫`;
const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("vi-VN");

const AdminOrders = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);

  // dialog chi tiết
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [statusDraft, setStatusDraft] = useState<OrderStatus>("pending");
  const [savingStatus, setSavingStatus] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const d = await adminGetAllOrders({
        page,
        limit: 20,
        status: statusFilter || undefined,
      });

      // tuỳ vào adminGetAllOrders trả gì – giả sử: { orders, pages }
      setOrders(d.orders || []);
      setTotalPages(d.pages || 1);
    } catch (e: any) {
      toast.error(e.message || "Không thể tải danh sách đơn hàng");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page, statusFilter]);

  const changeStatusQuick = async (id: string, newStatus: OrderStatus) => {
    try {
      await adminUpdateOrderStatus(id, { status: newStatus });
      toast.success("Cập nhật trạng thái thành công");
      load();
    } catch (e: any) {
      toast.error(e.message || "Lỗi khi cập nhật trạng thái");
    }
  };

  const openDetail = (o: AdminOrder) => {
    setSelectedOrder(o);
    setStatusDraft(o.status);
    setDetailOpen(true);
  };

  const saveStatusFromDialog = async () => {
    if (!selectedOrder) return;
    try {
      setSavingStatus(true);
      await adminUpdateOrderStatus(selectedOrder._id, {
        status: statusDraft,
      });
      toast.success("Cập nhật trạng thái đơn hàng thành công");

      // cập nhật ngay trên UI
      setOrders((prev) =>
        prev.map((o) =>
          o._id === selectedOrder._id ? { ...o, status: statusDraft } : o
        )
      );
      setDetailOpen(false);
    } catch (e: any) {
      toast.error(e.message || "Lỗi khi cập nhật trạng thái");
    } finally {
      setSavingStatus(false);
    }
  };

  return (
    <>
      <Header />
      <main className="container mx-auto py-8">
        {/* HEADER + FILTER */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Quản lý Đơn hàng</h1>
          <div className="flex gap-2 items-center">
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Lọc trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tất cả</SelectItem>
                <SelectItem value="pending">pending</SelectItem>
                <SelectItem value="confirmed">confirmed</SelectItem>
                <SelectItem value="processing">processing</SelectItem>
                <SelectItem value="shipped">shipped</SelectItem>
                <SelectItem value="completed">completed</SelectItem>
                <SelectItem value="cancelled">cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={load} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang tải...
                </>
              ) : (
                "Refresh"
              )}
            </Button>
          </div>
        </div>

        {/* LIST ĐƠN */}
        {loading && orders.length === 0 ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Đang tải danh sách đơn hàng...
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => (
              <Card key={o._id}>
                <CardHeader className="flex items-center justify-between gap-4">
                  <CardTitle>
                    <Link
                      to={`/admin/orders/${o._id}`}
                      className="font-semibold hover:underline"
                    >
                      {o.orderNumber || o._id}
                    </Link>
                  </CardTitle>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-muted-foreground">
                      {o.userId?.email}
                    </span>
                    <span className="font-medium">
                      {money(o.totalAmount)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>Trạng thái: {o.status}</div>
                    {o.paymentStatus && (
                      <div>Thanh toán: {o.paymentStatus}</div>
                    )}
                    <div>Ngày tạo: {formatDateTime(o.createdAt)}</div>
                  </div>
                  <div className="flex gap-2">
                    {/* Nút đổi trạng thái nhanh */}
                    <Button
                      size="sm"
                      onClick={() => changeStatusQuick(o._id, "confirmed")}
                    >
                      Xác nhận
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => changeStatusQuick(o._id, "cancelled")}
                    >
                      Huỷ
                    </Button>
                    {/* Nút mở dialog chi tiết */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openDetail(o)}
                    >
                      Chi tiết
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {orders.length === 0 && !loading && (
              <div className="text-center text-sm text-muted-foreground py-10">
                Không có đơn hàng nào
              </div>
            )}
          </div>
        )}

        {/* PAGINATION */}
        <div className="mt-6 flex gap-2 items-center">
          <Button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Trước
          </Button>
          <div className="px-3 py-2 border rounded">
            {page} / {totalPages}
          </div>
          <Button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Sau
          </Button>
        </div>

        {/* DIALOG CHI TIẾT + SET TRẠNG THÁI */}
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="max-w-lg">
            {selectedOrder && (
              <>
                <DialogHeader>
                  <DialogTitle>
                    Đơn hàng {selectedOrder.orderNumber || selectedOrder._id}
                  </DialogTitle>
                  <DialogDescription>
                    Xem thông tin và cập nhật trạng thái đơn hàng.
                  </DialogDescription>
                </DialogHeader>

                <div className="mt-3 space-y-3 text-sm">
                  <div>
                    <span className="font-medium">Email khách hàng: </span>
                    {selectedOrder.userId?.email || "—"}
                  </div>
                  {selectedOrder.shippingAddress && (
                    <div className="space-y-1">
                      <div className="font-medium">Thông tin giao hàng</div>
                      <div>
                        {selectedOrder.shippingAddress.fullName} -{" "}
                        {selectedOrder.shippingAddress.phone}
                      </div>
                      <div>
                        {selectedOrder.shippingAddress.addressLine1}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {[
                          selectedOrder.shippingAddress.city,
                          selectedOrder.shippingAddress.state,
                          selectedOrder.shippingAddress.country,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </div>
                    </div>
                  )}

                  <div>
                    <span className="font-medium">Tổng tiền: </span>
                    {money(selectedOrder.totalAmount)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Ngày tạo: {formatDateTime(selectedOrder.createdAt)}
                  </div>

                  <div className="pt-2 space-y-2">
                    <div className="font-medium text-sm">
                      Cập nhật trạng thái
                    </div>
                    <Select
                      value={statusDraft}
                      onValueChange={(v) =>
                        setStatusDraft(v as OrderStatus)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">
                          pending (Chờ xác nhận)
                        </SelectItem>
                        <SelectItem value="confirmed">
                          confirmed (Đã xác nhận)
                        </SelectItem>
                        <SelectItem value="processing">
                          processing (Đang xử lý)
                        </SelectItem>
                        <SelectItem value="shipped">
                          shipped (Đang giao)
                        </SelectItem>
                        <SelectItem value="completed">
                          completed (Hoàn thành)
                        </SelectItem>
                        <SelectItem value="cancelled">
                          cancelled (Đã huỷ)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end gap-2 pt-3">
                    <Button
                      variant="outline"
                      onClick={() => setDetailOpen(false)}
                    >
                      Đóng
                    </Button>
                    <Button
                      onClick={saveStatusFromDialog}
                      disabled={savingStatus}
                    >
                      {savingStatus ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Đang lưu...
                        </>
                      ) : (
                        "Lưu trạng thái"
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </>
  );
};

export default AdminOrders;
