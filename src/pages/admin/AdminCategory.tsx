"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "./AdminLayout";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import { toast } from "sonner";
import { Edit, Trash2, Plus, Search } from "lucide-react";
import { BASE_ORIGIN } from "@/api/Api";

import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/api/adminCategoryApi";

import { uploadSingle } from "@/api/uploadApi";

export default function AdminCategory() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // filter/search
  const [search, setSearch] = useState("");

  // Modal
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState("none");
  const [sortOrder, setSortOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);
  const [image, setImage] = useState("");

  // ===================== LOAD CATEGORY ======================
  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(data);
    } catch {
      toast.error("Không thể tải danh mục");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // ===================== RESET FORM ======================
  const resetForm = () => {
    setName("");
    setDescription("");
    setParentId("none");
    setSortOrder("0");
    setIsActive(true);
    setImage("");
  };


  // ===================== HANDLE EDIT ======================
  const openEdit = (item: any) => {
    setEditItem(item);
    setName(item.name);
    setDescription(item.description || "");
    setParentId(
      item.parentId ? item.parentId.toString() : "none"
    );
    setSortOrder(String(item.sortOrder ?? "0"));
    setIsActive(item.isActive);
    setImage(item.image || "");
    setOpen(true);
  };
  


  // ===================== UPLOAD IMAGE ======================
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await uploadSingle(file, "products");
      // giả sử backend trả { data: { url: "/uploads/..." } }
      setImage(res.data.url);
      toast.success("Tải ảnh thành công");
    } catch {
      toast.error("Tải ảnh thất bại");
    }
  };

  // ===================== SUBMIT FORM ======================
  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Tên danh mục là bắt buộc");
      return;
    }

    // build body cơ bản – DÙNG displayOrder cho đúng schema backend
    const body: any = {
      name: name.trim(),
      description,
      displayOrder: Number(sortOrder) || 0,   // 👈 đổi sang displayOrder
      isActive,
      image,
    };

    // CHỈ thêm parentId khi thực sự chọn danh mục cha
    if (parentId && parentId !== "none") {
      body.parentId = parentId; // _id của Category (Mongo ObjectId)
    }

    try {
      if (editItem) {
        await updateCategory(editItem._id, body);
        toast.success("Cập nhật danh mục thành công");
      } else {
        await createCategory(body);
        toast.success("Thêm danh mục thành công");
      }

      setOpen(false);
      resetForm();
      loadCategories();
    } catch (err: any) {
      console.error("Lỗi tạo/cập nhật category:", err);
      toast.error(err?.message || "Có lỗi xảy ra");
    }
  };


  // ===================== DELETE CATEGORY ======================
  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xoá danh mục này?")) return;

    try {
      await deleteCategory(id);
      toast.success("Xóa danh mục thành công!");
      loadCategories();
    } catch (err: any) {
      toast.error(err?.message || "Có lỗi xảy ra");
    }
  };

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categories;
    const q = search.toLowerCase();
    return categories.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
    );
  }, [categories, search]);

  return (
    <AdminLayout>
      <div className="min-h-screen bg-background px-4 py-6 md:px-8 md:py-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-2">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              Cấu hình sản phẩm
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Quản lý danh mục
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Tổ chức danh mục gọn gàng để tối ưu trải nghiệm tìm kiếm sản phẩm.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo tên, mô tả..."
                className="pl-9 h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button
              className="h-9 rounded-full"
              onClick={() => {
                setEditItem(null);
                resetForm();
                setOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" /> Thêm danh mục
            </Button>
          </div>
        </div>

        {/* Table card */}
        <Card className="overflow-hidden border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-4 py-3 md:px-6">
            <div>
              <p className="text-sm font-medium text-card-foreground">
                Danh sách danh mục
              </p>
              <p className="text-xs text-muted-foreground">
                Tổng cộng {categories.length} danh mục.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Đang tải danh mục...
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Không tìm thấy danh mục phù hợp.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/60">
                  <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-2 text-left font-medium">Danh mục</th>
                    <th className="px-4 py-2 font-medium">Ảnh</th>
                    <th className="px-4 py-2 font-medium">Số sản phẩm</th>
                    <th className="px-4 py-2 font-medium">Trạng thái</th>
                    <th className="px-4 py-2 text-right font-medium">Hành động</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCategories.map((c) => (
                    <tr
                      key={c._id}
                      className="border-b border-border/60 hover:bg-muted/40 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-medium text-card-foreground">
                            {c.name}
                          </span>
                          {c.description && (
                            <span className="text-xs text-muted-foreground line-clamp-1">
                              {c.description}
                            </span>
                          )}
                          {c.parentId && (
                            <span className="mt-0.5 inline-flex w-fit rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                              Danh mục con
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3 text-center">
                        {c.image ? (
                          <div className="inline-flex h-12 w-12 items-center justify-center rounded-md border border-border bg-muted/60">
                            <img
                              src={c.image ? BASE_ORIGIN + c.image : "/placeholder.jpg"}
                              className="h-10 w-10 rounded object-cover"
                              alt={c.name}
                            />
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Không ảnh
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                          {c.productCount ?? 0} sản phẩm
                        </span>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${c.isActive
                              ? "bg-success/10 text-success"
                              : "bg-destructive/10 text-destructive"
                            }`}
                        >
                          {c.isActive ? "Đang hiển thị" : "Đã ẩn"}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1.5">
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
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDelete(c._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* ===================== MODAL ===================== */}
        <Dialog
          open={open}
          onOpenChange={(val) => {
            setOpen(val);
            if (!val) {
              setEditItem(null);
              resetForm();
            }
          }}
        >
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">
                {editItem ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
              </DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium">Tên danh mục</label>
                <Input
                  placeholder="Ví dụ: Điện thoại, Laptop..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium">Mô tả</label>
                <Textarea
                  placeholder="Mô tả ngắn gọn về danh mục..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Danh mục cha</label>
                <Select
                  value={parentId}
                  onValueChange={(val) => setParentId(val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Không có danh mục cha" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Không có danh mục cha</SelectItem>
                    {categories
                      .filter((ct) => !ct.parentId)
                      .map((c) => (
                        <SelectItem key={c._id} value={c._id}>
                          {c.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>

              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Thứ tự hiển thị</label>
                <Input
                  type="number"
                  min={0}
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-3 md:col-span-2">
                <Switch
                  checked={isActive}
                  onCheckedChange={(v) => setIsActive(!!v)}
                />
                <div className="text-sm">
                  <p className="font-medium">Kích hoạt danh mục</p>
                  <p className="text-xs text-muted-foreground">
                    Nếu tắt, danh mục sẽ không hiển thị trong trang khách hàng.
                  </p>
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium">Ảnh danh mục</label>
                <Input type="file" accept="image/*" onChange={handleUpload} />
                {image && (
                  <div className="mt-2 inline-flex items-center gap-3 rounded-lg border border-dashed border-border bg-muted/40 p-2">
                    <img
                      src={image.startsWith("http") ? image : BASE_ORIGIN + image}
                      className="h-12 w-12 rounded object-cover"
                      alt="Preview"
                    />
                    <span className="text-xs text-muted-foreground">
                      Ảnh xem trước
                    </span>
                  </div>
                )}
              </div>
            </div>

            <Button className="w-full mt-2" onClick={handleSubmit}>
              {editItem ? "Cập nhật danh mục" : "Thêm danh mục mới"}
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
