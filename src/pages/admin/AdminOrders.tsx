// src/pages/admin/AdminOrders.tsx
"use client";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { adminGetAllOrders, adminUpdateOrderStatus } from "@/api/orderApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const AdminOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");

  const load = async () => {
    try {
      const d = await adminGetAllOrders({ page, limit: 20, status: statusFilter || undefined });
      setOrders(d.orders);
      setTotalPages(d.pages || 1);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  useEffect(() => {
    load();
  }, [page, statusFilter]);

  const changeStatus = async (id: string, newStatus: string) => {
    try {
      await adminUpdateOrderStatus(id, { status: newStatus });
      toast.success("Cập nhật trạng thái thành công");
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <>
      <Header />
      <main className="container mx-auto py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Quản lý Đơn hàng</h1>
          <div className="flex gap-2 items-center">
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Lọc trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tất cả</SelectItem>
                <SelectItem value="pending">pending</SelectItem>
                <SelectItem value="confirmed">confirmed</SelectItem>
                <SelectItem value="shipped">shipped</SelectItem>
                <SelectItem value="completed">completed</SelectItem>
                <SelectItem value="cancelled">cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => load()}>Refresh</Button>
          </div>
        </div>

        <div className="space-y-4">
          {orders.map((o) => (
            <Card key={o._id}>
              <CardHeader className="flex items-center justify-between">
                <CardTitle>
                  <Link to={`/admin/orders/${o._id}`} className="font-semibold">
                    {o.number}
                  </Link>
                </CardTitle>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-muted-foreground mr-4">{o.userId?.email}</div>
                  <div className="font-medium">{o.total?.toLocaleString()}₫</div>
                </div>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Trạng thái: {o.status}</div>
                <div className="flex gap-2">
                  <Button onClick={() => changeStatus(o._id, "confirmed")}>Xác nhận</Button>
                  <Button variant="destructive" onClick={() => changeStatus(o._id, "cancelled")}>Huỷ</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 flex gap-2">
          <Button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Trước</Button>
          <div className="px-3 py-2 border rounded">{page} / {totalPages}</div>
          <Button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Sau</Button>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default AdminOrders;
