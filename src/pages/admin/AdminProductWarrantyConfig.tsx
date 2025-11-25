"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { BASE_ORIGIN } from "@/api/Api";
import { AdminLayout } from "./AdminLayout";

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

import { Shield, RefreshCw, PlusCircle, Trash2, Check } from "lucide-react";

// ====== TYPES ======
type Product = {
  _id: string;
  name: string;
  sku?: string;
};

type WarrantyPkg = {
  _id: string;
  name: string;
  durationMonths: number;
  price: number;
};

type ProductWarranty = {
  _id: string;
  productId: string;
  warrantyPackageId: WarrantyPkg | string;
  isDefault: boolean;
  price: number;
  createdAt?: string;
};

type WarrantyPkgListResponse = {
  warrantyPackages: WarrantyPkg[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

// helper lấy header Authorization
const getAuthHeaders = (): Record<string, string> => {
  let token: string | null = null;

  const rawUser =
    typeof window !== "undefined" ? localStorage.getItem("user") : null;

  if (rawUser) {
    try {
      const parsed = JSON.parse(rawUser);
      token = parsed?.token || parsed?.accessToken || null;
    } catch {
      token = null;
    }
  }

  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

const AdminProductWarrantyConfig = () => {
  // danh sách sản phẩm
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>("");

  // danh sách gói bảo hành active
  const [warrantyPackages, setWarrantyPackages] = useState<WarrantyPkg[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(false);

  // cấu hình bảo hành của sản phẩm
  const [productWarranties, setProductWarranties] = useState<
    ProductWarranty[]
  >([]);
  const [loadingPw, setLoadingPw] = useState(false);

  // dialog thêm mới
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newPkgId, setNewPkgId] = useState("");
  const [newPrice, setNewPrice] = useState<string>("0");
  const [newIsDefault, setNewIsDefault] = useState(false);

  // =================== LOAD DATA ===================

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);

      const res = await fetch(`${BASE_ORIGIN}/api/products?limit=1000`, {
        credentials: "include",
        headers: {
          ...getAuthHeaders(),
        },
      });

      const json = await res.json();
      if (!res.ok)
        throw new Error(json.message || "Không thể tải danh sách sản phẩm");

      const data = json.data || {};
      const list: Product[] = data.products || data.items || [];
      setProducts(list);

      if (!selectedProductId && list.length > 0) {
        setSelectedProductId(list[0]._id);
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi tải sản phẩm");
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchWarrantyPackages = async () => {
    try {
      setLoadingPackages(true);
      const params = new URLSearchParams();
      params.set("page", "1");
      params.set("limit", "1000");
      params.set("isActive", "true");

      const res = await fetch(
        `${BASE_ORIGIN}/api/warranty-packages?${params.toString()}`,
        {
          credentials: "include",
          headers: {
            ...getAuthHeaders(),
          },
        }
      );
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Không thể tải gói bảo hành");
      }
      const data = json.data as WarrantyPkgListResponse;
      setWarrantyPackages(data.warrantyPackages || []);
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi tải gói bảo hành");
      setWarrantyPackages([]);
    } finally {
      setLoadingPackages(false);
    }
  };

  const fetchProductWarranties = async (pid: string) => {
    if (!pid) return;
    try {
      setLoadingPw(true);
      const params = new URLSearchParams();
      params.set("productId", pid);

      const res = await fetch(
        `${BASE_ORIGIN}/api/product-warranties?${params.toString()}`,
        {
          credentials: "include",
          headers: {
            ...getAuthHeaders(),
          },
        }
      );
      const json = await res.json();
      if (!res.ok) {
        throw new Error(
          json.message || "Không thể tải cấu hình bảo hành của sản phẩm"
        );
      }
      const data = json.data as {
        product: Product;
        productWarranties: ProductWarranty[];
      };
      setProductWarranties(data.productWarranties || []);
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi tải cấu hình bảo hành");
      setProductWarranties([]);
    } finally {
      setLoadingPw(false);
    }
  };

  // init
  useEffect(() => {
    fetchProducts();
    fetchWarrantyPackages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // khi chọn product khác
  useEffect(() => {
    if (selectedProductId) {
      fetchProductWarranties(selectedProductId);
    } else {
      setProductWarranties([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProductId]);

  // =================== LOGIC ===================

  const selectedProduct = useMemo(
    () => products.find((p) => p._id === selectedProductId) || null,
    [products, selectedProductId]
  );

  // gói nào chưa được gán cho product
  const availablePackages = useMemo(() => {
    const usedIds = new Set(
      productWarranties.map((pw) =>
        typeof pw.warrantyPackageId === "string"
          ? pw.warrantyPackageId
          : pw.warrantyPackageId._id
      )
    );
    return warrantyPackages.filter((pkg) => !usedIds.has(pkg._id));
  }, [warrantyPackages, productWarranties]);

  const handleOpenAddDialog = () => {
    setNewPkgId("");
    setNewPrice("0");
    setNewIsDefault(false);
    setDialogOpen(true);
  };

  const handleCreateProductWarranty = async () => {
    if (!selectedProductId) {
      toast.error("Vui lòng chọn sản phẩm");
      return;
    }
    if (!newPkgId) {
      toast.error("Vui lòng chọn gói bảo hành");
      return;
    }

    try {
      const payload = {
        productId: selectedProductId,
        warrantyPackageId: newPkgId,
        price: Number(newPrice) || 0,
        isDefault: newIsDefault,
      };

      const res = await fetch(`${BASE_ORIGIN}/api/product-warranties`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(
          json.message || "Không thể gán gói bảo hành cho sản phẩm"
        );
      }

      toast.success("Gán gói bảo hành cho sản phẩm thành công");
      setDialogOpen(false);
      await fetchProductWarranties(selectedProductId);
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi gán gói bảo hành");
    }
  };

  const handleUpdatePrice = async (pw: ProductWarranty, newPrice: string) => {
    try {
      const res = await fetch(
        `${BASE_ORIGIN}/api/product-warranties/${pw._id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify({ price: Number(newPrice) || 0 }),
        }
      );
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Không thể cập nhật giá");
      }
      toast.success("Cập nhật giá thành công");
      await fetchProductWarranties(selectedProductId);
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi cập nhật giá");
    }
  };

  const handleSetDefault = async (pw: ProductWarranty) => {
    try {
      const res = await fetch(
        `${BASE_ORIGIN}/api/product-warranties/${pw._id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify({ isDefault: true }),
        }
      );
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Không thể đặt gói mặc định");
      }
      toast.success("Đã đặt gói mặc định cho sản phẩm");
      await fetchProductWarranties(selectedProductId);
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi đặt gói mặc định");
    }
  };

  const handleDelete = async (pw: ProductWarranty) => {
    if (
      !confirm("Bạn có chắc chắn muốn xóa gói bảo hành khỏi sản phẩm này?")
    ) {
      return;
    }
    try {
      const res = await fetch(
        `${BASE_ORIGIN}/api/product-warranties/${pw._id}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            ...getAuthHeaders(),
          },
        }
      );
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Không thể xóa");
      }
      toast.success("Đã xóa gói bảo hành khỏi sản phẩm");
      await fetchProductWarranties(selectedProductId);
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi xóa");
    }
  };

  const formatPrice = (price: number) =>
    `${(price || 0).toLocaleString("vi-VN")} đ`;

  return (
    <AdminLayout>
      <div className="min-h-screen bg-background px-4 py-6 md:px-8 md:py-8 space-y-6">
        {/* Header page */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-2">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              Cấu hình bảo hành theo sản phẩm
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-1">
              Bảo hành sản phẩm
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl">
              Gán các gói bảo hành đã tạo cho từng sản phẩm, cấu hình giá riêng
              và lựa chọn gói mặc định hiển thị trên trang đặt hàng.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 rounded-full"
              onClick={() => {
                fetchProducts();
                if (selectedProductId) fetchProductWarranties(selectedProductId);
              }}
              disabled={loadingProducts || loadingPw}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${
                  loadingProducts || loadingPw ? "animate-spin" : ""
                }`}
              />
              Làm mới
            </Button>
          </div>
        </div>

        {/* Main card */}
        <Card className="rounded-2xl border border-border bg-card shadow-sm">
          <CardHeader className="border-b border-border px-4 py-4 md:px-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base md:text-lg">
                  Cấu hình bảo hành theo sản phẩm
                </CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  Chọn sản phẩm ở bên dưới, sau đó gán các gói bảo hành phù hợp
                  và tinh chỉnh giá.
                </CardDescription>
              </div>
            </div>

            {/* Product info chip */}
            {selectedProduct && (
              <div className="inline-flex items-center gap-3 rounded-full bg-muted/60 px-3 py-2 text-xs md:text-sm">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-[11px] font-semibold text-primary">
                  {selectedProduct.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-foreground">
                    {selectedProduct.name}
                  </span>
                  {selectedProduct.sku && (
                    <span className="text-[11px] text-muted-foreground">
                      SKU: {selectedProduct.sku}
                    </span>
                  )}
                </div>
              </div>
            )}
          </CardHeader>

          <CardContent className="px-4 md:px-6 py-5 space-y-6">
            {/* chọn sản phẩm */}
            <div className="space-y-2 max-w-xl">
              <Label className="text-sm font-medium">
                Chọn sản phẩm cần cấu hình
              </Label>
              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <select
                  className="w-full md:min-w-[260px] border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  disabled={loadingProducts}
                >
                  {loadingProducts && (
                    <option value="">Đang tải sản phẩm...</option>
                  )}
                  {!loadingProducts && products.length === 0 && (
                    <option value="">Chưa có sản phẩm</option>
                  )}
                  {!loadingProducts &&
                    products.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} {p.sku ? `(${p.sku})` : ""}
                      </option>
                    ))}
                </select>

                <p className="text-xs text-muted-foreground md:ml-3">
                  Mỗi sản phẩm có thể gán nhiều gói bảo hành, với giá riêng.
                </p>
              </div>
            </div>

            {/* cấu hình bảo hành của sản phẩm */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <h3 className="text-sm md:text-base font-semibold text-foreground">
                Gói bảo hành đang áp dụng cho sản phẩm
              </h3>
              <Button
                size="sm"
                className="rounded-full"
                onClick={handleOpenAddDialog}
                disabled={
                  !selectedProductId ||
                  loadingPw ||
                  availablePackages.length === 0
                }
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Thêm gói cho sản phẩm
              </Button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-border bg-background/60">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
                    <TableHead className="px-4">Gói bảo hành</TableHead>
                    <TableHead>Thời hạn</TableHead>
                    <TableHead>Giá áp dụng</TableHead>
                    <TableHead>Mặc định</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead className="text-right pr-4">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productWarranties.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="py-6 text-center text-sm text-muted-foreground"
                      >
                        {loadingPw
                          ? "Đang tải cấu hình bảo hành..."
                          : "Sản phẩm chưa được gán gói bảo hành nào."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    productWarranties.map((pw) => {
                      const pkg =
                        typeof pw.warrantyPackageId === "string"
                          ? warrantyPackages.find(
                              (p) => p._id === pw.warrantyPackageId
                            )
                          : pw.warrantyPackageId;

                      const basePrice = pkg?.price ?? 0;
                      const finalPrice =
                        pw.price && pw.price > 0 ? pw.price : basePrice;

                      return (
                        <TableRow
                          key={pw._id}
                          className="hover:bg-muted/30 transition-colors"
                        >
                          <TableCell className="px-4 py-4 align-top">
                            <div className="space-y-1">
                              <p className="font-medium text-sm text-card-foreground">
                                {pkg?.name || "N/A"}
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                Giá gốc gói: {formatPrice(basePrice)}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="py-4 text-sm">
                            {pkg?.durationMonths} tháng
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <Input
                                  className="w-32 h-8 text-sm"
                                  type="number"
                                  defaultValue={finalPrice}
                                  onBlur={(e) =>
                                    handleUpdatePrice(pw, e.target.value)
                                  }
                                />
                                <span className="text-xs text-muted-foreground">
                                  đ
                                </span>
                              </div>
                              <span className="text-[11px] text-muted-foreground">
                                Để 0 sẽ dùng giá mặc định của gói
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            {pw.isDefault ? (
                              <Badge className="bg-primary/10 text-primary border-0 text-xs">
                                <Check className="h-3 w-3 mr-1" />
                                Mặc định
                              </Badge>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-full text-xs"
                                onClick={() => handleSetDefault(pw)}
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Đặt mặc định
                              </Button>
                            )}
                          </TableCell>
                          <TableCell className="py-4 text-sm">
                            {pw.createdAt
                              ? new Date(pw.createdAt).toLocaleDateString(
                                  "vi-VN"
                                )
                              : "-"}
                          </TableCell>
                          <TableCell className="py-4 pr-4 text-right">
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8 rounded-full text-destructive border-destructive/40"
                              onClick={() => handleDelete(pw)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {availablePackages.length === 0 && !loadingPackages && (
              <p className="text-xs text-muted-foreground">
                Tất cả gói bảo hành đã được gán cho sản phẩm này. Nếu muốn thêm
                gói khác, hãy tạo gói mới trong phần “Gói bảo hành”.
              </p>
            )}
          </CardContent>
        </Card>

        {/* dialog thêm gói cho sản phẩm */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Thêm gói bảo hành cho sản phẩm</DialogTitle>
              <DialogDescription>
                Chọn gói bảo hành phù hợp và cấu hình giá áp dụng riêng (nếu
                cần).
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2 flex-1 overflow-y-auto pr-1">
              <div className="space-y-2">
                <Label>Gói bảo hành</Label>
                <select
                  className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
                  value={newPkgId}
                  onChange={(e) => setNewPkgId(e.target.value)}
                >
                  <option value="">-- Chọn gói --</option>
                  {availablePackages.map((pkg) => (
                    <option key={pkg._id} value={pkg._id}>
                      {pkg.name} ({pkg.durationMonths} tháng) -{" "}
                      {(pkg.price || 0).toLocaleString("vi-VN")} đ
                    </option>
                  ))}
                </select>
                {availablePackages.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Tất cả gói bảo hành đã được gán cho sản phẩm này.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Giá áp dụng cho sản phẩm (VNĐ)</Label>
                <Input
                  type="number"
                  min={0}
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder="0 = dùng giá mặc định của gói"
                />
              </div>

              <div className="space-y-2">
                <Label>Thiết lập mặc định</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={newIsDefault ? "default" : "outline"}
                    className="rounded-full"
                    onClick={() => setNewIsDefault(true)}
                  >
                    Đặt làm gói mặc định
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={!newIsDefault ? "default" : "outline"}
                    className="rounded-full"
                    onClick={() => setNewIsDefault(false)}
                  >
                    Không
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button onClick={handleCreateProductWarranty}>
                Thêm gói
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminProductWarrantyConfig;
