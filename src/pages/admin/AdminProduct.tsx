import { useEffect, useState } from "react";
import { AdminLayout } from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  getAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
} from "@/api/adminProductApi";

import { AdminEditProduct } from "./AdminEditProduct";
import { BASE_ORIGIN } from "@/api/Api";

const AdminProduct = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<any | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await getAdminProducts();
      setProducts(res); // backend trả mảng list
    } catch (err: any) {
      toast.error(err.message || "Không thể tải sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  /* CREATE */
  const handleCreate = async (data: any) => {
    try {
      await createAdminProduct(data);
      toast.success("Thêm sản phẩm thành công!");
      fetchProducts();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  /* UPDATE */
  const handleUpdate = async (data: any) => {
    try {
      await updateAdminProduct(editProduct._id, data);
      toast.success("Cập nhật sản phẩm thành công!");
      fetchProducts();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  /* DELETE */
  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xoá sản phẩm này?")) return;

    try {
      await deleteAdminProduct(id);
      toast.success("Xoá sản phẩm thành công!");
      fetchProducts();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <AdminLayout>
      {/* HEADER */}
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Quản lý sản phẩm</h1>

        <Button
          onClick={() => {
            setEditProduct(null);
            setModalOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" /> Thêm sản phẩm
        </Button>
      </div>

      {/* TABLE */}
      <Card className="overflow-hidden">
        {loading ? (
          <p className="p-6 text-center">Đang tải...</p>
        ) : (
          <table className="w-full">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-4 py-3">Ảnh</th>
                <th className="px-4 py-3">Tên sản phẩm</th>
                <th className="px-4 py-3">Giá</th>
                <th className="px-4 py-3">Danh mục</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Nổi bật</th>
                <th className="px-4 py-3 text-right">Hành động</th>
              </tr>
            </thead>

            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-b hover:bg-muted/20">
                  {/* IMAGE */}
                  <td className="px-4 py-3">
                    <img
                      src={
                        p.images?.[0]
                          ? BASE_ORIGIN + p.images[0]
                          : "/placeholder.png"
                      }
                      className="w-14 h-14 rounded object-cover"
                    />
                  </td>

                  {/* NAME */}
                  <td className="px-4 py-3 font-medium">{p.name}</td>

                  {/* PRICE */}
                  <td className="px-4 py-3">₫{p.price?.toLocaleString()}</td>

                  {/* CATEGORY */}
                  <td className="px-4 py-3">
                    {p.categories?.[0]?.name || "Không có"}
                  </td>

                  {/* STATUS */}
                  <td className="px-4 py-3">
                    {p.status === "active" ? (
                      <span className="text-green-600 font-medium">
                        Đang bán
                      </span>
                    ) : (
                      <span className="text-red-600 font-medium">
                        Ngừng bán
                      </span>
                    )}
                  </td>

                  {/* FEATURED */}
                  <td className="px-4 py-3">
                    {p.featured ? "⭐ Có" : "—"}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {/* EDIT */}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setEditProduct(p);
                          setModalOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      {/* DELETE */}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-red-500"
                        onClick={() => handleDelete(p._id)}
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

      {/* MODAL EDIT / CREATE */}
      <AdminEditProduct
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultValue={editProduct}
        onSubmit={editProduct ? handleUpdate : handleCreate}
      />
    </AdminLayout>
  );
};

export default AdminProduct;
