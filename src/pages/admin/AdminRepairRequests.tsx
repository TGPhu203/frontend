"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";

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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Search,
  Wrench,
  Phone,
  Mail,
  Smartphone,
  Clock,
  FileText,
} from "lucide-react";
import { AdminLayout } from "./AdminLayout";
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8888";

type RepairRequest = {
  _id: string;
  customerName: string;
  phone: string;
  email?: string;
  productName: string;
  imei?: string;
  issueDescription: string;
  preferredTime?: string;
  status: "new" | "in_progress" | "completed" | "cancelled";
  adminNotes?: string;
  createdAt?: string;
  updatedAt?: string;
};

type RepairListResponse = {
  repairRequests: RepairRequest[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

const STATUS_LABEL: Record<RepairRequest["status"], string> = {
  new: "Mới",
  in_progress: "Đang xử lý",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

const AdminRepairRequests = () => {
  const [requests, setRequests] = useState<RepairRequest[]>([]);
  const [loading, setLoading] = useState(false);

  const [statusFilter, setStatusFilter] =
    useState<RepairRequest["status"] | "all">("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selected, setSelected] = useState<RepairRequest | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [updateStatus, setUpdateStatus] =
    useState<RepairRequest["status"]>("new");
  const [updateNotes, setUpdateNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const loadRequests = async () => {
    try {
      setLoading(true);

      const params: any = {
        page,
        limit: 10,
      };

      if (statusFilter !== "all") params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const res = await axios.get(
        `${API_BASE_URL}/api/repair-requests`,
        {
          params,
          withCredentials: true,
        }
      );

      const data = res.data?.data as RepairListResponse;

      setRequests(data.repairRequests || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err: any) {
      console.error("Error load repair requests:", err);
      toast.error(err?.response?.data?.message || "Không thể tải yêu cầu sửa chữa");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter]);

  const openDetail = (req: RepairRequest) => {
    setSelected(req);
    setUpdateStatus(req.status);
    setUpdateNotes(req.adminNotes || "");
    setDialogOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selected) return;
    try {
      setSaving(true);
      await axios.put(
        `${API_BASE_URL}/api/repair-requests/${selected._id}/status`,
        {
          status: updateStatus,
          adminNotes: updateNotes,
        },
        { withCredentials: true }
      );
      toast.success("Đã cập nhật trạng thái yêu cầu");
      setDialogOpen(false);
      loadRequests();
    } catch (err: any) {
      console.error("Error update repair request:", err);
      toast.error(
        err?.response?.data?.message ||
          "Không thể cập nhật trạng thái yêu cầu"
      );
    } finally {
      setSaving(false);
    }
  };

  const renderStatusBadge = (status: RepairRequest["status"]) => {
    switch (status) {
      case "new":
        return <Badge className="bg-sky-500 text-white">Mới</Badge>;
      case "in_progress":
        return (
          <Badge className="bg-amber-500 text-white">Đang xử lý</Badge>
        );
      case "completed":
        return (
          <Badge className="bg-emerald-500 text-white">Hoàn thành</Badge>
        );
      case "cancelled":
        return (
          <Badge variant="outline" className="border-red-500 text-red-600">
            Đã hủy
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AdminLayout>
    <div className="p-4 md:p-8 space-y-6">
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-primary" />
              Quản lý yêu cầu sửa chữa
            </CardTitle>
            <CardDescription>
              Xem, lọc và cập nhật trạng thái các yêu cầu sửa chữa của khách.
            </CardDescription>
          </div>

          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Trạng thái:
              </span>
              <Select
                value={statusFilter}
                onValueChange={(val) =>
                  setStatusFilter(val as RepairRequest["status"] | "all")
                }
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="new">Mới</SelectItem>
                  <SelectItem value="in_progress">Đang xử lý</SelectItem>
                  <SelectItem value="completed">Hoàn thành</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Input
                placeholder="Tìm theo tên / SĐT / sản phẩm / IMEI..."
                className="w-[220px]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setPage(1);
                  loadRequests();
                }}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Đang tải danh sách yêu cầu...
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Chưa có yêu cầu sửa chữa nào.
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead>IMEI</TableHead>
                    <TableHead>Thời gian tạo</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="w-[80px] text-right">
                      Hành động
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((r) => (
                    <TableRow key={r._id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-semibold">
                            {r.customerName}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span>{r.phone}</span>
                          </div>
                          {r.email && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              <span>{r.email}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{r.productName}</div>
                          {r.preferredTime && (
                            <div className="text-xs text-muted-foreground">
                              Ưu tiên liên hệ: {r.preferredTime}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {r.imei ? (
                          <span className="text-xs">{r.imei}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            -
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs flex flex-col gap-1">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {r.createdAt &&
                              new Date(r.createdAt).toLocaleString("vi-VN")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{renderStatusBadge(r.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDetail(r)}
                        >
                          Chi tiết
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* phân trang đơn giản */}
              <div className="flex items-center justify-between mt-4 text-sm">
                <span className="text-muted-foreground">
                  Trang {page} / {totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Trước
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() =>
                      setPage((p) => Math.min(totalPages, p + 1))
                    }
                  >
                    Sau
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialog chi tiết / cập nhật */}
            {/* Dialog chi tiết / cập nhật */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl p-0">
          <DialogHeader className="px-6 pt-6 pb-3 border-b">
            <DialogTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-primary" />
              Chi tiết yêu cầu sửa chữa
            </DialogTitle>
            <DialogDescription>
              Xem thông tin chi tiết và cập nhật trạng thái yêu cầu.
            </DialogDescription>
          </DialogHeader>

          {selected && (
            // phần này là body có scroll
            <div className="px-6 pb-6 pt-4 max-h-[70vh] overflow-y-auto space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    Thông tin khách hàng
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <div>
                    <span className="font-semibold">Họ tên: </span>
                    {selected.customerName}
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3 text-muted-foreground" />
                    <span>{selected.phone}</span>
                  </div>
                  {selected.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      <span>{selected.email}</span>
                    </div>
                  )}
                  {selected.preferredTime && (
                    <div>
                      <span className="font-semibold">
                        Thời gian liên hệ:
                      </span>{" "}
                      {selected.preferredTime}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Thông tin thiết bị & lỗi
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <span className="font-semibold">Sản phẩm: </span>
                    {selected.productName}
                  </div>
                  {selected.imei && (
                    <div>
                      <span className="font-semibold">IMEI: </span>
                      {selected.imei}
                    </div>
                  )}
                  <div>
                    <span className="font-semibold">Mô tả vấn đề:</span>
                    <p className="mt-1 text-muted-foreground whitespace-pre-line">
                      {selected.issueDescription}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Trạng thái & ghi chú</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground w-24">
                      Trạng thái:
                    </span>
                    <Select
                      value={updateStatus}
                      onValueChange={(val) =>
                        setUpdateStatus(val as RepairRequest["status"])
                      }
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">Mới</SelectItem>
                        <SelectItem value="in_progress">Đang xử lý</SelectItem>
                        <SelectItem value="completed">Hoàn thành</SelectItem>
                        <SelectItem value="cancelled">Đã hủy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <span className="text-muted-foreground">Ghi chú nội bộ:</span>
                    <textarea
                      className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                      placeholder="Ghi chú cho kỹ thuật viên / nội bộ..."
                      value={updateNotes}
                      onChange={(e) => setUpdateNotes(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Ghi chú này chỉ hiển thị trong hệ thống admin.
                    </p>
                  </div>

                  <div className="flex justify-end gap-2 mt-2">
                    <Button
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                    >
                      Đóng
                    </Button>
                    <Button
                      onClick={handleUpdateStatus}
                      disabled={saving}
                    >
                      {saving ? "Đang lưu..." : "Lưu cập nhật"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
    </AdminLayout>
  );
};

export default AdminRepairRequests;
