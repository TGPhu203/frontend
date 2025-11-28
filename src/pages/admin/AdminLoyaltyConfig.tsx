// src/pages/admin/AdminLoyaltyConfig.tsx
"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "./AdminLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8888";

type LoyaltyConfig = {
  _id?: string;
  tier: "silver" | "gold" | "diamond";
  minTotalSpent: number;
  discountPercent: number;
  isActive: boolean;
  note?: string;
};

export default function AdminLoyaltyConfig() {
  const [configs, setConfigs] = useState<LoyaltyConfig[]>([]);
  const [loading, setLoading] = useState(true);

  const loadConfigs = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/admin/loyalty-config`);
      setConfigs(res.data.data || []);
    } catch (e: any) {
      toast.error(e?.message || "Không tải được cấu hình ưu đãi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfigs();
  }, []);

  const handleChangeField = (
    idx: number,
    field: keyof LoyaltyConfig,
    value: any
  ) => {
    setConfigs((prev) => {
      const clone = [...prev];
      clone[idx] = { ...clone[idx], [field]: value };
      return clone;
    });
  };

  const handleSave = async () => {
    try {
      await axios.put(`${API_BASE_URL}/api/admin/loyalty-config`, {
        configs,
      });
      toast.success("Cập nhật ưu đãi khách hàng thành công");
      loadConfigs();
    } catch (e: any) {
      toast.error(e?.message || "Lưu cấu hình thất bại");
    }
  };

  return (
    <AdminLayout>
      <Card>
        <CardHeader>
          <CardTitle>Ưu đãi khách hàng thân thiết</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && <p>Đang tải...</p>}

          {!loading &&
            configs.map((cfg, idx) => (
              <div
                key={cfg.tier}
                className="flex flex-col md:flex-row items-center gap-3 border p-3 rounded-md"
              >
                <div className="w-28 font-semibold capitalize">
                  {cfg.tier === "silver"
                    ? "Bạc"
                    : cfg.tier === "gold"
                    ? "Vàng"
                    : "Kim cương"}
                </div>

                <div className="flex-1 flex flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Tổng chi tiêu từ
                    </span>
                    <Input
                      type="number"
                      className="w-36"
                      value={cfg.minTotalSpent}
                      onChange={(e) =>
                        handleChangeField(
                          idx,
                          "minTotalSpent",
                          Number(e.target.value || 0)
                        )
                      }
                    />
                    <span className="text-sm text-muted-foreground">VND</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Giảm giá
                    </span>
                    <Input
                      type="number"
                      className="w-20"
                      value={cfg.discountPercent}
                      onChange={(e) =>
                        handleChangeField(
                          idx,
                          "discountPercent",
                          Number(e.target.value || 0)
                        )
                      }
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Kích hoạt
                    </span>
                    <Switch
                      checked={cfg.isActive}
                      onCheckedChange={(v) =>
                        handleChangeField(idx, "isActive", v)
                      }
                    />
                  </div>
                </div>
              </div>
            ))}

          <Button onClick={handleSave} disabled={loading}>
            Lưu cấu hình
          </Button>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
