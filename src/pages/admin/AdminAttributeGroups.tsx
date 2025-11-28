// src/pages/admin/AdminProductAttributes.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminLayout } from "./AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { ProductAttributeGroupsForm } from "../ProductAttributeGroupsForm";
import { getAdminProducts } from "@/api/adminProductApi";

const AdminProductAttributes = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!productId) return;
      try {
        setLoading(true);
        const list = await getAdminProducts();
        const found = list.find((p: any) => p._id === productId) || null;
        if (!found) {
          toast.error("Không tìm thấy sản phẩm");
        }
        setProduct(found);
      } catch (e: any) {
        toast.error(e.message || "Lỗi tải sản phẩm");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [productId]);

  if (!productId) {
    return (
      <AdminLayout>
        <div className="p-6">Thiếu productId</div>
      </AdminLayout>
    );
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6 flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Đang tải sản phẩm...</span>
        </div>
      </AdminLayout>
    );
  }

  if (!product) {
    return (
      <AdminLayout>
        <div className="p-6">
          Không tìm thấy sản phẩm.
          <div className="mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/admin/adminProduct")}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Quay lại danh sách
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <Button
            variant="ghost"
            size="sm"
            className="px-0"
            onClick={() => navigate("/admin/adminProduct")}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Quay lại
          </Button>
        </div>

        <Card className="p-4">
          <h1 className="text-2xl font-semibold mb-1">
            Thuộc tính sản phẩm
          </h1>
          <p className="text-sm text-muted-foreground">{product.name}</p>
        </Card>

        <ProductAttributeGroupsForm productId={productId} />
      </div>
    </AdminLayout>
  );
};

export default AdminProductAttributes;
