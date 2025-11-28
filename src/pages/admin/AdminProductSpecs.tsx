// src/pages/admin/AdminProductSpecs.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";

import { AdminLayout } from "./AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { BASE_ORIGIN } from "@/api/Api";
import {
  ProductSpec,
  getProductSpecs,
  createProductSpec,
  updateProductSpec,
  deleteProductSpec,
} from "@/api/productSpecsApi";

type ProductInfo = {
  _id: string;
  name: string;
  sku?: string;
  brand?: string;
};

const SECTION_LABEL: Record<string, string> = {
  general: "Thông tin chung",
  detail: "Cấu hình chi tiết",
};

const SECTION_OPTIONS = [
  { value: "general", label: "Thông tin chung" },
  { value: "detail", label: "Cấu hình chi tiết" },
];

const AdminProductSpecs = () => {
  const { id } = useParams(); // /admin/products/:id/specs
  const productId = id as string;

  const [product, setProduct] = useState<ProductInfo | null>(null);
  const [specs, setSpecs] = useState<ProductSpec[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // form thêm mới
  const [newName, setNewName] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newSection, setNewSection] = useState<string>("general");
  const [newOrder, setNewOrder] = useState<number>(1);

  const groupedSpecs = useMemo(() => {
    const map: Record<string, ProductSpec[]> = {};
    specs.forEach((s) => {
      const key = s.section || "general";
      if (!map[key]) map[key] = [];
      map[key].push(s);
    });
    Object.values(map).forEach((list) =>
      list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
    );
    return map;
  }, [specs]);

  const load = async () => {
    if (!productId) return;
    try {
      setLoading(true);

      // tải thông tin sản phẩm
      const pRes = await fetch(`${BASE_ORIGIN}/api/products/${productId}`);
      const pJson = await pRes.json();
      const pData = pJson.data || pJson;
      setProduct({
        _id: pData._id,
        name: pData.name,
        sku: pData.sku,
        brand: pData.brand,
      });

      // tải thông số kỹ thuật
      const specList = await getProductSpecs(productId);
      setSpecs(specList);
    } catch (e: any) {
      toast.error(e.message || "Lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const handleAdd = async () => {
    if (!newName.trim() || !newValue.trim()) {
      toast.error("Vui lòng nhập đủ tên và giá trị thông số");
      return;
    }
    try {
      setSaving(true);
      const created = await createProductSpec(productId, {
        attributeName: newName.trim(),
        attributeValue: newValue.trim(),
        section: newSection,
        displayOrder: newOrder || 1,
      });

      setSpecs((prev) => [...prev, created]);
      setNewName("");
      setNewValue("");
      setNewOrder((prev) => prev + 1);
      toast.success("Đã thêm thông số");
    } catch (e: any) {
      toast.error(e.message || "Không thêm được thông số");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (specId?: string) => {
    if (!specId) return;
    if (!confirm("Bạn có chắc muốn xoá thông số này?")) return;
    try {
      await deleteProductSpec(specId);
      setSpecs((prev) => prev.filter((s) => s._id !== specId));
      toast.success("Đã xoá thông số");
    } catch (e: any) {
      toast.error(e.message || "Không xoá được thông số");
    }
  };

  const handleInlineChange = async (
    spec: ProductSpec,
    field: "attributeName" | "attributeValue" | "displayOrder"
  ) => {
    if (!spec._id) return;
    try {
      setSaving(true);
      const updated = await updateProductSpec(spec._id, {
        [field]: spec[field],
      } as any);

      setSpecs((prev) =>
        prev.map((s) => (s._id === updated._id ? updated : s))
      );
      toast.success("Đã lưu thay đổi");
    } catch (e: any) {
      toast.error(e.message || "Không lưu được thay đổi");
    } finally {
      setSaving(false);
    }
  };

  if (!productId) {
    return (
      <AdminLayout>
        <div className="p-6 text-sm text-red-600">
          Thiếu productId trong route (cần /admin/products/:id/specs)
        </div>
      </AdminLayout>
    );
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6 text-sm text-muted-foreground">
          Đang tải thông tin sản phẩm và thông số kỹ thuật...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-6">
        <p className="text-xs text-muted-foreground mb-1">
          <Link to="/admin/adminProduct" className="hover:underline">
            Sản phẩm
          </Link>{" "}
          / Thông số kỹ thuật
        </p>
        <h1 className="mb-1 text-2xl font-bold">
          Thông số kỹ thuật: {product?.name}
        </h1>
        {product?.sku && (
          <p className="text-xs text-muted-foreground">
            SKU: {product.sku}{" "}
            {product.brand ? `• Thương hiệu: ${product.brand}` : ""}
          </p>
        )}
      </div>

      {/* Form thêm mới */}
      <Card className="mb-6 p-4">
        <div className="mb-3 text-sm font-semibold">
          Thêm thông số kỹ thuật
        </div>
        <div className="grid gap-3 md:grid-cols-[1.2fr,2fr,0.9fr,0.7fr,auto]">
          <Input
            placeholder="Tên thông số (VD: CPU, Bảo hành...)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <Input
            placeholder="Giá trị (VD: Intel Core i5-13420H ...)"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
          />
          <select
            className="h-10 rounded-md border border-input bg-background px-2 text-sm"
            value={newSection}
            onChange={(e) => setNewSection(e.target.value)}
          >
            {SECTION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <Input
            type="number"
            min={1}
            value={newOrder}
            onChange={(e) => setNewOrder(parseInt(e.target.value || "1", 10))}
          />
          <Button onClick={handleAdd} disabled={saving}>
            Thêm
          </Button>
        </div>
      </Card>

      {/* Danh sách thông số */}
      {Object.keys(groupedSpecs).length === 0 ? (
        <Card className="p-4 text-sm text-muted-foreground">
          Chưa có thông số kỹ thuật nào cho sản phẩm này.
        </Card>
      ) : (
        Object.entries(groupedSpecs).map(([section, items]) => (
          <Card key={section} className="mb-6 overflow-hidden">
            <div className="border-b bg-muted/50 px-4 py-2 text-sm font-semibold">
              {SECTION_LABEL[section] || section}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="px-4 py-2 text-left">Thứ tự</th>
                    <th className="px-4 py-2 text-left">Tên thông số</th>
                    <th className="px-4 py-2 text-left">Giá trị</th>
                    <th className="px-4 py-2 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((s) => (
                    <tr key={s._id} className="border-b last:border-0">
                      <td className="px-4 py-2 align-top">
                        <Input
                          type="number"
                          className="h-8 w-20 text-sm"
                          value={s.displayOrder ?? ""}
                          onChange={(e) => {
                            const value = parseInt(
                              e.target.value || "0",
                              10
                            );
                            setSpecs((prev) =>
                              prev.map((p) =>
                                p._id === s._id
                                  ? { ...p, displayOrder: value }
                                  : p
                              )
                            );
                          }}
                          onBlur={() => handleInlineChange(s, "displayOrder")}
                        />
                      </td>
                      <td className="px-4 py-2 align-top">
                        <Input
                          className="h-8 text-sm"
                          value={s.attributeName}
                          onChange={(e) => {
                            const value = e.target.value;
                            setSpecs((prev) =>
                              prev.map((p) =>
                                p._id === s._id
                                  ? { ...p, attributeName: value }
                                  : p
                              )
                            );
                          }}
                          onBlur={() => handleInlineChange(s, "attributeName")}
                        />
                      </td>
                      <td className="px-4 py-2 align-top">
                        <Input
                          className="h-8 text-sm"
                          value={s.attributeValue}
                          onChange={(e) => {
                            const value = e.target.value;
                            setSpecs((prev) =>
                              prev.map((p) =>
                                p._id === s._id
                                  ? { ...p, attributeValue: value }
                                  : p
                              )
                            );
                          }}
                          onBlur={() => handleInlineChange(s, "attributeValue")}
                        />
                      </td>
                      <td className="px-4 py-2 text-right align-top">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-200 text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(s._id)}
                        >
                          Xoá
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ))
      )}
    </AdminLayout>
  );
};

export default AdminProductSpecs;
