import { useEffect, useState } from "react";
import { AdminLayout } from "./AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Edit, Trash2, Plus } from "lucide-react";

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

  // Modal
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState("");
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
    setParentId("");
    setSortOrder("0");
    setIsActive(true);
    setImage("");
  };

  // ===================== HANDLE EDIT ======================
  const openEdit = (item: any) => {
    setEditItem(item);
    setName(item.name);
    setDescription(item.description || "");
    setParentId(item.parentId || "");
    setSortOrder(item.sortOrder || "0");
    setIsActive(item.isActive);
    setImage(item.image || "");
    setOpen(true);
  };

  // ===================== UPLOAD IMAGE ======================
  const handleUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    const res = await uploadSingle(file, "products");
    setImage(res.data.url);
  };

  // ===================== SUBMIT FORM ======================
  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Tên danh mục là bắt buộc");
      return;
    }

    const body = {
      name,
      description,
      parentId: parentId || null,
      sortOrder: Number(sortOrder),
      isActive,
      image,
    };

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
      toast.error(err.message);
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
      toast.error(err.message);
    }
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Quản lý danh mục</h1>
        <Button
          onClick={() => {
            setEditItem(null);
            resetForm();
            setOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" /> Thêm danh mục
        </Button>
      </div>

      <Card className="overflow-hidden p-4">
        {loading ? (
          <p className="text-center py-4">Đang tải...</p>
        ) : (
          <table className="w-full">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-4 py-2 text-left">Tên</th>
                <th className="px-4 py-2">Ảnh</th>
                <th className="px-4 py-2">Số sản phẩm</th>
                <th className="px-4 py-2">Kích hoạt</th>
                <th className="px-4 py-2 text-right">Hành động</th>
              </tr>
            </thead>

            <tbody>
              {categories.map((c) => (
                <tr key={c._id} className="border-b">
                  <td className="px-4 py-3">{c.name}</td>

                  <td className="px-4 py-3">
                    {c.image ? (
                      <img src={c.image} className="w-12 h-12 rounded-md object-cover border" />
                    ) : (
                      <span className="text-gray-400">Không ảnh</span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-center">{c.productCount}</td>

                  <td className="px-4 py-3 text-center">
                    {c.isActive ? "✔" : "✖"}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(c)}>
                        <Edit className="h-4 w-4" />
                      </Button>

                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-red-500"
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
        )}
      </Card>

      {/* ===================== MODAL ===================== */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editItem ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Input placeholder="Tên danh mục" value={name} onChange={(e) => setName(e.target.value)} />

            <Textarea
              placeholder="Mô tả danh mục..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            {/* Parent category */}
            <select
              className="border rounded p-2 w-full"
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
            >
              <option value="">Không có danh mục cha</option>
              {categories
                .filter((ct) => !ct.parentId)
                .map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
            </select>

            <Input
              type="number"
              placeholder="Thứ tự"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            />

            <div className="flex items-center gap-2">
              <Switch checked={isActive} onCheckedChange={(v) => setIsActive(!!v)} />
              <span>Kích hoạt</span>
            </div>

            {/* Upload image */}
            <div>
              <Input type="file" accept="image/*" onChange={handleUpload} />
              {image && <img src={image} className="w-20 mt-2 rounded border" />}
            </div>

            <Button className="w-full" onClick={handleSubmit}>
              {editItem ? "Cập nhật" : "Thêm mới"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
