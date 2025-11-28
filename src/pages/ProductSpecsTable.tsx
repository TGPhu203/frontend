"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProductSpec, getProductSpecs } from "@/api/productSpecsApi";
import { toast } from "sonner";

type Props = {
  productId: string;
};

const SECTION_LABEL: Record<string, string> = {
  general: "Thông tin chung",
  detail: "Cấu hình chi tiết",
};

export const ProductSpecsTable = ({ productId }: Props) => {
  const [specs, setSpecs] = useState<ProductSpec[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        setLoading(true);
        const data = await getProductSpecs(productId);
        if (!ignore) setSpecs(data);
      } catch (e: any) {
        toast.error(e.message || "Không tải được thông số kỹ thuật");
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    if (productId) load();
    return () => {
      ignore = true;
    };
  }, [productId]);

  const grouped = useMemo(() => {
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

  if (loading || specs.length === 0) return null;

  // khung ngắn lại, phần dư bị ẩn
  const containerClass = "max-h-[487px] overflow-hidden";

  // hàm render table dùng lại cho dialog
  const renderSpecs = (data: Record<string, ProductSpec[]>) => (
    <>
      {Object.entries(data).map(([section, items]) => (
        <div key={section} className="mb-4 last:mb-0">
          <p className="mb-2 text-xs font-semibold uppercase text-slate-500">
            {SECTION_LABEL[section] || section}
          </p>

          <div className="border border-slate-100 bg-slate-50 rounded-none">
            {items.map((s, idx) => (
              <div
                key={s._id || `${section}-${idx}`}
                className="grid grid-cols-[150px,1fr] gap-x-4 text-sm text-slate-700
                           border-b border-slate-100 last:border-b-0"
              >
                <div className="bg-slate-50 px-4 py-2.5 font-medium">
                  {s.attributeName}
                </div>
                <div className="bg-white px-4 py-2.5">
                  {s.attributeValue}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );

  return (
    <Card className="border border-slate-200 bg-white rounded-none shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">
          Thông tin chi tiết
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0">
        {/* khu vực hiển thị ngắn, bằng tầm card bên trái */}
        <div className={containerClass}>{renderSpecs(grouped)}</div>

        {/* nút mở dialog xem đầy đủ */}
        {specs.length > 6 && (
          <div className="mt-3 flex justify-center">
            <Dialog>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="text-xs font-medium text-sky-600 hover:text-sky-700 hover:underline"
                >
                  Xem thêm nội dung
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden">
                <DialogHeader>
                  <DialogTitle>Thông số kỹ thuật chi tiết</DialogTitle>
                </DialogHeader>
                <div className="mt-2 max-h-[60vh] overflow-y-auto pr-2">
                  {renderSpecs(grouped)}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductSpecsTable;
