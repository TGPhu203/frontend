import { useEffect, useState } from "react";
import { AdminLayout } from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2, Loader2, Star } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  getAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
} from "@/api/adminProductApi";

import { AdminEditProduct } from "./AdminEditProduct";
import { BASE_ORIGIN } from "@/api/Api";

const AdminProduct = () => {
  const navigate = useNavigate();
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

  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.status === "active").length;
  const featuredProducts = products.filter((p) => p.featured).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Quản lý sản phẩm
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Theo dõi, chỉnh sửa và thêm mới sản phẩm cho cửa hàng của bạn.
            </p>
          </div>

          <Button
            className="bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-sm hover:shadow-md hover:brightness-110 transition"
            onClick={() => {
              setEditProduct(null);
              setModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" /> Thêm sản phẩm
          </Button>
        </div>

        {/* STATS OVERVIEW */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-dashed">
            <CardContent className="py-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase">
                  Tổng số sản phẩm
                </p>
                <p className="text-2xl font-semibold mt-1">{totalProducts}</p>
              </div>
              <div className="rounded-full px-3 py-1 text-xs bg-sky-50 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200">
                Tất cả
              </div>
            </CardContent>
          </Card>

          <Card className="border-dashed">
            <CardContent className="py-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase">
                  Đang bán
                </p>
                <p className="text-2xl font-semibold mt-1">{activeProducts}</p>
              </div>
              <div className="rounded-full px-3 py-1 text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
                Active
              </div>
            </CardContent>
          </Card>

          <Card className="border-dashed">
            <CardContent className="py-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase">
                  Sản phẩm nổi bật
                </p>
                <p className="text-2xl font-semibold mt-1">{featuredProducts}</p>
              </div>
              <div className="rounded-full px-3 py-1 text-xs bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200 flex items-center gap-1">
                <Star className="h-3 w-3 fill-current" />
                <span>Featured</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* TABLE */}
        <Card className="overflow-hidden border-border/60 shadow-sm">
          <CardHeader className="px-6 py-4 border-b bg-muted/40 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-medium">
                Danh sách sản phẩm
              </CardTitle>
              <CardDescription>
                Quản lý thông tin hiển thị trên trang bán hàng.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="py-16 flex flex-col items-center justify-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Đang tải danh sách sản phẩm...
                </p>
              </div>
            ) : products.length === 0 ? (
              <div className="py-16 flex flex-col items-center gap-3">
                <div className="rounded-full bg-muted w-12 h-12 flex items-center justify-center text-muted-foreground text-2xl">
                  🛍️
                </div>
                <p className="text-sm font-medium">Chưa có sản phẩm nào</p>
                <p className="text-sm text-muted-foreground text-center max-w-sm">
                  Hãy bắt đầu bằng cách thêm sản phẩm đầu tiên để hệ thống hiển
                  thị trên trang cửa hàng.
                </p>
                <Button
                  className="mt-2"
                  onClick={() => {
                    setEditProduct(null);
                    setModalOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" /> Thêm sản phẩm mới
                </Button>
              </div>
            ) : (
              <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow className="border-b">
                      <TableHead className="px-6 py-3">Ảnh</TableHead>
                      <TableHead className="px-4 py-3">Tên sản phẩm</TableHead>
                      <TableHead className="px-4 py-3">Giá</TableHead>
                      <TableHead className="px-4 py-3">Danh mục</TableHead>
                      <TableHead className="px-4 py-3">Trạng thái</TableHead>
                      <TableHead className="px-4 py-3">Nổi bật</TableHead>
                      <TableHead className="px-6 py-3 text-right">
                        Hành động
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {products.map((p) => (
                      <TableRow
                        key={p._id}
                        className="border-b hover:bg-muted/30 transition-colors"
                      >
                        {/* IMAGE */}
                        <TableCell className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <img
                                src={
                                  p.images?.[0]
                                    ? BASE_ORIGIN + p.images[0]
                                    : "/placeholder.png"
                                }
                                className="w-14 h-14 rounded-lg object-cover border border-border/60 shadow-sm"
                              />
                              {p.featured && (
                                <span className="absolute -top-1 -right-1 rounded-full bg-amber-500 text-[10px] text-white px-1.5 py-0.5 shadow-sm">
                                  HOT
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {/* NAME */}
                        <TableCell className="px-4 py-3 align-middle">
                          <div className="flex flex-col">
                            <span className="font-medium line-clamp-1">
                              {p.name}
                            </span>
                            {p.sku && (
                              <span className="text-xs text-muted-foreground mt-0.5">
                                Mã: {p.sku}
                              </span>
                            )}
                          </div>
                        </TableCell>

                        {/* PRICE */}
                        <TableCell className="px-4 py-3 align-middle">
                          <span className="font-semibold text-sm">
                            ₫{p.price?.toLocaleString()}
                          </span>
                        </TableCell>

                        {/* CATEGORY */}
                        <TableCell className="px-4 py-3 align-middle">
                          {p.categories?.[0]?.name ? (
                            <Badge
                              variant="outline"
                              className="text-xs font-normal rounded-full bg-sky-50/70 text-sky-700 border-sky-200 dark:bg-sky-900/40 dark:text-sky-200 dark:border-sky-800"
                            >
                              {p.categories[0].name}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              Không có
                            </span>
                          )}
                        </TableCell>

                        {/* STATUS */}
                        <TableCell className="px-4 py-3 align-middle">
                          {p.status === "active" ? (
                            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5" />
                              Đang bán
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-medium text-red-600 dark:bg-red-900/30 dark:text-red-200">
                              <span className="h-1.5 w-1.5 rounded-full bg-red-500 mr-1.5" />
                              Ngừng bán
                            </span>
                          )}
                        </TableCell>

                        {/* FEATURED */}
                        <TableCell className="px-4 py-3 align-middle">
                          {p.featured ? (
                            <span className="inline-flex items-center text-xs font-medium text-amber-600 dark:text-amber-300">
                              <Star className="h-3 w-3 mr-1 fill-current" />
                              Có
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              —
                            </span>
                          )}
                        </TableCell>

                        {/* ACTIONS */}
                        <TableCell className="px-6 py-3 align-middle">
                          <div className="flex justify-end gap-1.5">
                            {/* ⭐ NÚT TỚI THÔNG SỐ KỸ THUẬT */}
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 rounded-full border-border/70 text-xs px-3 hover:bg-sky-50 hover:text-sky-700"
                              onClick={() =>
                                navigate(`/admin/products/${p._id}/specs`)
                              }
                            >
                              Thông số
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 rounded-full border-border/70 text-xs px-3 hover:bg-violet-50 hover:text-violet-700"
                              onClick={() =>
                                navigate(`/admin/products/${p._id}/attributes`)
                              }
                            >
                              Thuộc tính
                            </Button>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8 rounded-full border-border/70 hover:bg-sky-50/70 hover:text-sky-700 transition"
                              onClick={() => {
                                setEditProduct(p);
                                setModalOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>

                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8 rounded-full border-border/70 hover:bg-red-50/80 hover:text-red-600 transition"
                              onClick={() => handleDelete(p._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* MODAL EDIT / CREATE */}
        <AdminEditProduct
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          defaultValue={editProduct}
          onSubmit={editProduct ? handleUpdate : handleCreate}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminProduct;
