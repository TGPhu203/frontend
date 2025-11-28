"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "./AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  adminGetCoupons,
  adminCreateCoupon,
  adminUpdateCoupon,
  adminDeleteCoupon,
  Coupon,
} from "@/api/couponApi";
import { Loader2, Plus, Trash2, Edit } from "lucide-react";

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState<Partial<Coupon>>({
    code: "",
    type: "percent",
    value: 0,
    minOrderAmount: 0,
    maxDiscount: 0,
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const data = await adminGetCoupons();
      setCoupons(data);
    } catch (e: any) {
      toast.error(e.message || "Lỗi tải mã ưu đãi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({
      code: "",
      type: "percent",
      value: 0,
      minOrderAmount: 0,
      maxDiscount: 0,
      isActive: true,
    });
    setDialogOpen(true);
  };

  const openEdit = (c: Coupon) => {
    setEditing(c);
    setForm({
      ...c,
      startDate: c.startDate?.slice(0, 10),
      endDate: c.endDate?.slice(0, 10),
    });
    setDialogOpen(true);
  };

  const handleChange =
    (field: keyof Coupon) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editing) {
        await adminUpdateCoupon(editing._id, form);
        toast.success("Cập nhật mã ưu đãi thành công");
      } else {
        await adminCreateCoupon(form);
        toast.success("Tạo mã ưu đãi thành công");
      }
      setDialogOpen(false);
      load();
    } catch (e: any) {
      toast.error(e.message || "Lỗi lưu mã ưu đãi");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Xoá mã ưu đãi này?")) return;
    try {
      await adminDeleteCoupon(id);
      toast.success("Đã xoá mã ưu đãi");
      setCoupons((prev) => prev.filter((c) => c._id !== id));
    } catch (e: any) {
      toast.error(e.message || "Lỗi xoá mã ưu đãi");
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-background px-4 py-6 md:px-8 md:py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Quản lý mã ưu đãi
            </h1>
            <p className="text-sm text-muted-foreground">
              Tạo và quản lý các mã giảm giá cho cửa hàng.
            </p>
          </div>
          <Button size="sm" className="rounded-full" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm mã ưu đãi
          </Button>
        </div>

        <Card className="overflow-hidden border">
          <div className="border-b px-4 py-3">
            <p className="text-sm font-medium">
              Danh sách mã ưu đãi ({coupons.length})
            </p>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-6 text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang tải...
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-muted/60">
                  <tr className="text-xs uppercase text-muted-foreground">
                    <th className="px-4 py-2 text-left">Mã</th>
                    <th className="px-4 py-2 text-left">Loại</th>
                    <th className="px-4 py-2 text-left">Giá trị</th>
                    <th className="px-4 py-2 text-left">Đơn tối thiểu</th>
                    <th className="px-4 py-2 text-left">Trạng thái</th>
                    <th className="px-4 py-2 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((c) => (
                    <tr
                      key={c._id}
                      className="border-t hover:bg-muted/40 transition-colors"
                    >
                      <td className="px-4 py-2 font-semibold">{c.code}</td>
                      <td className="px-4 py-2">
                        {c.type === "percent" ? "Giảm %" : "Giảm tiền"}
                      </td>
                      <td className="px-4 py-2">
                        {c.type === "percent"
                          ? `${c.value}%`
                          : `${c.value.toLocaleString("vi-VN")}₫`}
                      </td>
                      <td className="px-4 py-2">
                        {c.minOrderAmount
                          ? c.minOrderAmount.toLocaleString("vi-VN") + "₫"
                          : "-"}
                      </td>
                      <td className="px-4 py-2">
                        <Badge
                          variant={c.isActive ? "default" : "outline"}
                          className={
                            c.isActive
                              ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                              : ""
                          }
                        >
                          {c.isActive ? "Đang hoạt động" : "Tạm tắt"}
                        </Badge>
                      </td>
                      <td className="px-4 py-2 text-right space-x-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => openEdit(c)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-500"
                          onClick={() => handleDelete(c._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}

                  {coupons.length === 0 && (
                    <tr>
                      <td
                        className="px-4 py-4 text-center text-sm text-muted-foreground"
                        colSpan={6}
                      >
                        Chưa có mã ưu đãi nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </Card>

        {/* Dialog tạo / sửa */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editing ? "Chỉnh sửa mã ưu đãi" : "Thêm mã ưu đãi"}
              </DialogTitle>
            </DialogHeader>

            <form className="space-y-3" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <label className="text-xs font-medium">Mã ưu đãi</label>
                <Input
                  value={form.code || ""}
                  onChange={handleChange("code")}
                  placeholder="VD: GIAM10"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">Loại ưu đãi</label>
                <select
                  className="w-full rounded-md border px-3 py-2 text-sm bg-background"
                  value={form.type || "percent"}
                  onChange={handleChange("type")}
                >
                  <option value="percent">Giảm theo %</option>
                  <option value="fixed">Giảm số tiền</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">Giá trị</label>
                <Input
                  type="number"
                  value={form.value ?? 0}
                  onChange={handleChange("value")}
                  min={0}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">
                  Đơn hàng tối thiểu (VND)
                </label>
                <Input
                  type="number"
                  value={form.minOrderAmount ?? 0}
                  onChange={handleChange("minOrderAmount")}
                  min={0}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    "Lưu"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminCoupons;
