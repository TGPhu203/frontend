// src/pages/admin/AdminAttributeGroups.tsx
"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "./AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { getAttributeGroups, createAttributeGroup } from "@/api/attributeApi";

const AdminAttributeGroups = () => {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");

  const load = async () => {
    try {
      const data = await getAttributeGroups();
      setGroups(data || []);
    } catch (e: any) {
      toast.error(e.message || "Lỗi khi tải nhóm thuộc tính");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      const created = await createAttributeGroup({ name: newName });
      setGroups((prev) => [...prev, created]);
      setNewName("");
      toast.success("Đã tạo nhóm thuộc tính");
    } catch (e: any) {
      toast.error(e.message || "Không tạo được nhóm thuộc tính");
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6">Đang tải nhóm thuộc tính...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Nhóm thuộc tính</h1>
        <p className="text-muted-foreground">
          Quản lý các nhóm thuộc tính như Màu sắc, Kích thước, Dung lượng...
        </p>
      </div>

      <Card className="p-4 mb-6 flex gap-2">
        <Input
          placeholder="Tên nhóm thuộc tính mới (vd: Màu sắc)"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <Button onClick={handleCreate}>Thêm nhóm</Button>
      </Card>

      <Card className="overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">Tên nhóm</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Kiểu</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Bắt buộc</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {groups.map((g) => (
              <tr key={g._id}>
                <td className="px-4 py-3">{g.name}</td>
                <td className="px-4 py-3">{g.type || "-"}</td>
                <td className="px-4 py-3">{g.isRequired ? "Có" : "Không"}</td>
                <td className="px-4 py-3">
                  {g.isActive ? "Đang dùng" : "Đã ẩn"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </AdminLayout>
  );
};

export default AdminAttributeGroups;
