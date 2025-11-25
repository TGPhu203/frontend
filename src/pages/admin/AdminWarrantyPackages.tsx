"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BASE_ORIGIN } from "@/api/Api";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

import { PlusCircle, Edit, Trash2, Shield, RefreshCw } from "lucide-react";
import { AdminLayout } from "./AdminLayout";

type WarrantyPkg = {
  _id: string;
  name: string;
  description?: string;
  durationMonths: number;
  price: number;
  coverage?: string[] | string;
  terms?: string;
  isActive: boolean;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
};

type Pagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// lấy token để gọi API admin
const getAdminAuthHeaders = () => {
  let token: string | null = null;

  const rawUser = localStorage.getItem("user");
  if (rawUser) {
    try {
      const u = JSON.parse(rawUser);
      token = u?.token || u?.accessToken || u?.jwt;
    } catch {
      // ignore
    }
  }
  if (!token) {
    token =
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      null;
  }
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const AdminWarrantyPackages = () => {
  const [loading, setLoading] = useState(false);
  const [packages, setPackages] = useState<WarrantyPkg[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [page, setPage] = useState(1);

  // Dialog + form
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [durationMonths, setDurationMonths] = useState<string>("12");
  const [price, setPrice] = useState<string>("0");
  const [description, setDescription] = useState("");
  const [coverageText, setCoverageText] = useState("");
  const [terms, setTerms] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [displayOrder, setDisplayOrder] = useState<string>("0");

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setDurationMonths("12");
    setPrice("0");
    setDescription("");
    setCoverageText("");
    setTerms("");
    setIsActive(true);
    setDisplayOrder("0");
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (pkg: WarrantyPkg) => {
    setEditingId(pkg._id);
    setName(pkg.name || "");
    setDurationMonths(pkg.durationMonths?.toString() || "12");
    setPrice(pkg.price?.toString() || "0");
    setDescription(pkg.description || "");
    const coverageArr =
      typeof pkg.coverage === "string"
        ? [pkg.coverage]
        : Array.isArray(pkg.coverage)
        ? pkg.coverage
        : [];
    setCoverageText(coverageArr.join("\n"));
    setTerms(pkg.terms || "");
    setIsActive(pkg.isActive);
    setDisplayOrder(pkg.displayOrder?.toString() || "0");
    setDialogOpen(true);
  };

  const fetchPackages = async (pageToLoad = page) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("page", String(pageToLoad));
      params.set("limit", String(pagination.limit));

      const res = await fetch(
        `${BASE_ORIGIN}/api/warranty-packages?${params.toString()}`,
        {
          credentials: "include",
        }
      );
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Không thể tải danh sách gói bảo hành");
      }

      const data = json.data as {
        warrantyPackages: WarrantyPkg[];
        pagination: Pagination;
      };

      setPackages(data.warrantyPackages || []);
      setPagination(data.pagination);
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi tải gói bảo hành");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Tên gói bảo hành không được để trống");
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
      durationMonths: Number(durationMonths) || 0,
      price: Number(price) || 0,
      coverage: coverageText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      terms: terms.trim() || undefined,
      isActive,
      sortOrder: Number(displayOrder) || 0,
    };

    try {
      setLoading(true);
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `${BASE_ORIGIN}/api/warranty-packages/${editingId}`
        : `${BASE_ORIGIN}/api/warranty-packages`;

      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...getAdminAuthHeaders(),
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Lưu gói bảo hành thất bại");
      }

      toast.success(
        editingId
          ? "Cập nhật gói bảo hành thành công"
          : "Tạo gói bảo hành thành công"
      );
      setDialogOpen(false);
      await fetchPackages(page);
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi lưu gói bảo hành");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa gói bảo hành này?")) return;

    try {
      setLoading(true);
      const res = await fetch(`${BASE_ORIGIN}/api/warranty-packages/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          ...getAdminAuthHeaders(),
        },
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(
          json.message || "Không thể xóa gói bảo hành (có thể đang được sử dụng)"
        );
      }
      toast.success("Xóa gói bảo hành thành công");
      const remaining = packages.length - 1;
      if (remaining === 0 && page > 1) {
        setPage((p) => p - 1);
      } else {
        await fetchPackages(page);
      }
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi xóa gói bảo hành");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    if (!price) return "Miễn phí";
    if (price >= 1_000_000) {
      return `${(price / 1_000_000).toFixed(1)} triệu`;
    }
    return `${price.toLocaleString("vi-VN")} đ`;
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-background px-4 py-6 md:px-8 md:py-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-2">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              Cấu hình bảo hành
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-1">
              Gói bảo hành sản phẩm
            </h1>
            <p className="text-sm text-muted-foreground">
              Tạo các gói bảo hành linh hoạt để áp dụng cho sản phẩm và dịch vụ
              của bạn.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchPackages(page)}
              disabled={loading}
              className="h-9 rounded-full"
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Làm mới
            </Button>
            <Button
              size="sm"
              className="h-9 rounded-full"
              onClick={openCreateDialog}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Thêm gói bảo hành
            </Button>
          </div>
        </div>

        {/* Main card */}
        <Card className="rounded-2xl border border-border bg-card shadow-sm">
          <CardHeader className="border-b border-border flex flex-row items-center justify-between gap-4 px-4 py-3 md:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base md:text-lg">
                  Danh sách gói bảo hành
                </CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  Quản lý thời hạn, giá và trạng thái hiển thị của từng gói.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
                    <TableHead className="px-6">Tên gói</TableHead>
                    <TableHead>Thời hạn</TableHead>
                    <TableHead>Giá</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Thứ tự</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead className="text-right pr-6">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {packages.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="py-6 text-center text-sm text-muted-foreground"
                      >
                        {loading
                          ? "Đang tải danh sách gói bảo hành..."
                          : "Chưa có gói bảo hành nào."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    packages.map((pkg) => (
                      <TableRow
                        key={pkg._id}
                        className="hover:bg-muted/40 transition-colors"
                      >
                        <TableCell className="px-6 py-4 align-top">
                          <div className="space-y-1">
                            <p className="font-medium text-card-foreground">
                              {pkg.name}
                            </p>
                            {pkg.description && (
                              <p className="text-xs text-muted-foreground">
                                {pkg.description}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-4 text-sm">
                          {pkg.durationMonths} tháng
                        </TableCell>
                        <TableCell className="py-4 text-sm">
                          {formatPrice(pkg.price)}
                        </TableCell>
                        <TableCell className="py-4 text-sm">
                          {pkg.isActive ? (
                            <Badge className="bg-success/10 text-success border-0">
                              Đang kích hoạt
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="border-destructive/40 text-destructive"
                            >
                              Đã tắt
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="py-4 text-sm">
                          {pkg.displayOrder ?? 0}
                        </TableCell>
                        <TableCell className="py-4 text-sm">
                          {pkg.createdAt
                            ? new Date(pkg.createdAt).toLocaleDateString("vi-VN")
                            : "-"}
                        </TableCell>
                        <TableCell className="py-4 pr-6 text-right text-sm">
                          <div className="inline-flex items-center gap-2">
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8 rounded-full"
                              onClick={() => openEditDialog(pkg)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8 rounded-full text-destructive border-destructive/40"
                              onClick={() => handleDelete(pkg._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Phân trang */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between px-4 md:px-6 py-4 border-t border-border text-xs md:text-sm text-muted-foreground">
              <div>
                Tổng:{" "}
                <span className="font-semibold">
                  {pagination.total}
                </span>{" "}
                gói bảo hành
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Trang trước
                </Button>
                <span>
                  Trang{" "}
                  <span className="font-semibold">{pagination.page}</span> /{" "}
                  <span className="font-semibold">
                    {pagination.totalPages}
                  </span>
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  disabled={page >= pagination.totalPages || loading}
                  onClick={() =>
                    setPage((p) =>
                      Math.min(pagination.totalPages, p + 1)
                    )
                  }
                >
                  Trang sau
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dialog tạo / sửa */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>
                {editingId
                  ? "Chỉnh sửa gói bảo hành"
                  : "Thêm gói bảo hành mới"}
              </DialogTitle>
              <DialogDescription>
                Nhập thông tin chi tiết cho gói bảo hành.
              </DialogDescription>
            </DialogHeader>

            {/* FORM – cuộn được */}
            <div className="space-y-4 py-2 flex-1 overflow-y-auto pr-1">
              <div className="space-y-2">
                <Label>Tên gói</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Bảo hành mở rộng 24 tháng"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Thời hạn (tháng)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={durationMonths}
                    onChange={(e) => setDurationMonths(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Giá (VNĐ)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0 = miễn phí"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Mô tả</Label>
                <textarea
                  className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả ngắn gọn về gói bảo hành..."
                />
              </div>

              <div className="space-y-2">
                <Label>Phạm vi bảo hành (mỗi dòng một mục)</Label>
                <textarea
                  className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={coverageText}
                  onChange={(e) => setCoverageText(e.target.value)}
                  placeholder={
                    "Lỗi phần cứng do nhà sản xuất\nThay pin miễn phí 1 lần\nHỗ trợ kỹ thuật từ xa"
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Điều khoản chi tiết</Label>
                <textarea
                  className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  placeholder="Nhập điều khoản chi tiết (nếu có)..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Thứ tự hiển thị</Label>
                  <Input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Trạng thái</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      className="rounded-full"
                      onClick={() => setIsActive(true)}
                    >
                      Đang kích hoạt
                    </Button>
                    <Button
                      type="button"
                      variant={!isActive ? "default" : "outline"}
                      size="sm"
                      className="rounded-full"
                      onClick={() => setIsActive(false)}
                    >
                      Đã tắt
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={loading}
              >
                Hủy
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {editingId ? "Lưu thay đổi" : "Tạo mới"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminWarrantyPackages;
