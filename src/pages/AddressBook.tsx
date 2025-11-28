// src/pages/AddressBook.tsx
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  MapPin,
  Plus,
  Trash2,
  Pencil,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import AccountLayout from "./AccountLayout";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8888";
const ADDRESS_BASE = `${API_BASE_URL}/api/users/addresses`;

/* =================== KIỂU DỮ LIỆU =================== */

type Address = {
  _id?: string;
  fullName: string;
  phone: string;
  street: string;
  ward?: string;
  district?: string;
  province?: string;
  isDefault?: boolean;
};

const emptyAddress: Address = {
  fullName: "",
  phone: "",
  street: "",
  ward: "",
  district: "",
  province: "",
  isDefault: false,
};

// Dạng response của VietnamLabs
type VietnamProvince = {
  id: string;
  province: string;
  // còn licensePlates, wards... nhưng không bắt buộc khai báo hết
};

type VietnamWard = {
  name: string;
  // mergedFrom: string[]
};

/* =================== COMPONENT =================== */

const AddressBook = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);

  // dropdown
  const [provinces, setProvinces] = useState<VietnamProvince[]>([]);
  const [wards, setWards] = useState<VietnamWard[]>([]);

  /* ------ LOAD ĐỊA CHỈ USER ------ */
  const loadAddresses = async () => {
    try {
      setLoading(true);
      const res = await axios.get(ADDRESS_BASE, { withCredentials: true });
      setAddresses(res.data?.data || []);
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Không thể tải danh sách địa chỉ"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ------ LOAD DANH SÁCH TỈNH ------ */
  const loadProvinces = async () => {
    try {
      const res = await axios.get("https://vietnamlabs.com/api/vietnamprovince");
      // đúng cấu trúc docs: data: [...]
      const list: VietnamProvince[] = Array.isArray(res.data?.data)
        ? res.data.data
        : [];
      setProvinces(list);
    } catch (err) {
      console.error("Error load provinces", err);
      toast.error("Không tải được danh sách Tỉnh/Thành");
    }
  };

  /* ------ LOAD DANH SÁCH PHƯỜNG/XÃ THEO TỈNH ------ */
  const loadWardsByProvince = async (provinceName: string) => {
    if (!provinceName) {
      setWards([]);
      return;
    }

    try {
      const res = await axios.get(
        `https://vietnamlabs.com/api/vietnamprovince?province=${encodeURIComponent(
          provinceName
        )}`
      );

      // theo docs: data: { id, province, wards: [...] }
      const wardsRes: VietnamWard[] =
        res.data?.data?.wards && Array.isArray(res.data.data.wards)
          ? res.data.data.wards
          : [];

      setWards(wardsRes);
    } catch (err) {
      console.error("Error load wards", err);
      toast.error("Không tải được danh sách Phường/Xã");
      setWards([]);
    }
  };

  useEffect(() => {
    loadAddresses();
    loadProvinces();
  }, []);

  // khi province của địa chỉ đang chỉnh sửa thay đổi → load wards
  useEffect(() => {
    if (editing?.province) {
      loadWardsByProvince(editing.province);
    } else {
      setWards([]);
    }
  }, [editing?.province]);

  /* =================== HANDLERS =================== */

  const handleChange =
    (field: keyof Address) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
      const value =
        field === "isDefault"
          ? (e.target as HTMLInputElement).checked
          : e.target.value;

      setEditing((prev) => {
        if (!prev) return prev;
        let next: Address = { ...prev, [field]: value };

        // đổi tỉnh thì reset phường
        if (field === "province") {
          next = { ...next, ward: "" };
        }

        return next;
      });
    };

  const handleAddNew = () => {
    setEditing({ ...emptyAddress });
    setWards([]);
  };

  const handleEdit = (addr: Address) => {
    setEditing({ ...addr });
    if (addr.province) {
      loadWardsByProvince(addr.province);
    }
  };

  const handleCancel = () => {
    setEditing(null);
    setWards([]);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;

    try {
      setSaving(true);

      if (editing._id) {
        await axios.put(`${ADDRESS_BASE}/${editing._id}`, editing, {
          withCredentials: true,
        });
        toast.success("Cập nhật địa chỉ thành công");
      } else {
        await axios.post(ADDRESS_BASE, editing, { withCredentials: true });
        toast.success("Thêm địa chỉ mới thành công");
      }

      setEditing(null);
      setWards([]);
      loadAddresses();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Không thể lưu địa chỉ");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!window.confirm("Bạn chắc chắn muốn xóa địa chỉ này?")) return;

    try {
      await axios.delete(`${ADDRESS_BASE}/${id}`, { withCredentials: true });
      toast.success("Xóa địa chỉ thành công");
      loadAddresses();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Không thể xóa địa chỉ");
    }
  };

  const handleSetDefault = async (id?: string) => {
    if (!id) return;
    try {
      await axios.put(
        `${ADDRESS_BASE}/${id}/default`,
        {},
        { withCredentials: true }
      );
      toast.success("Đã đặt làm địa chỉ mặc định");
      loadAddresses();
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Không thể đặt địa chỉ mặc định"
      );
    }
  };

  const formatAddress = (addr: Address) => {
    const parts = [addr.street, addr.ward, addr.district, addr.province].filter(
      Boolean
    );
    return parts.join(", ");
  };

  /* =================== RENDER =================== */

  return (
    <AccountLayout>
      <div className="max-w-3xl p-4 md:p-5">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Sổ địa chỉ giao hàng
            </CardTitle>
            <CardDescription>
              Lưu các địa chỉ nhận hàng để sử dụng nhanh trong bước đặt hàng.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* DANH SÁCH ĐỊA CHỈ */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">
                  Địa chỉ đã lưu ({addresses.length})
                </p>
                <Button size="sm" onClick={handleAddNew} variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  Thêm địa chỉ
                </Button>
              </div>

              {loading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang tải địa chỉ...
                </div>
              ) : addresses.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Bạn chưa có địa chỉ nào. Hãy thêm địa chỉ mới.
                </p>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <div
                      key={addr._id}
                      className="flex items-start justify-between rounded-lg border bg-muted/40 px-4 py-3"
                    >
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{addr.fullName}</span>
                          {addr.isDefault && (
                            <Badge
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              <Star className="h-3 w-3 text-yellow-500" />
                              Mặc định
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground">
                          SĐT: {addr.phone}
                        </p>
                        <p>{formatAddress(addr)}</p>
                      </div>

                      <div className="flex flex-col gap-1 text-xs">
                        {!addr.isDefault && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2"
                            onClick={() => handleSetDefault(addr._id)}
                          >
                            Đặt làm mặc định
                          </Button>
                        )}
                        <div className="flex gap-1 mt-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => handleEdit(addr)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-red-600"
                            onClick={() => handleDelete(addr._id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* FORM THÊM / SỬA ĐỊA CHỈ */}
            {editing && (
              <form className="space-y-3" onSubmit={handleSave}>
                <p className="text-sm font-medium">
                  {editing._id ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Họ tên người nhận</Label>
                    <Input
                      value={editing.fullName}
                      onChange={handleChange("fullName")}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Số điện thoại</Label>
                    <Input
                      value={editing.phone}
                      onChange={handleChange("phone")}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label>Địa chỉ (số nhà, tên đường)</Label>
                  <Input
                    value={editing.street}
                    onChange={handleChange("street")}
                    required
                  />
                </div>

                {/* TỈNH / QUẬN (TEXT) / PHƯỜNG */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  

                  <div className="space-y-1">
                    <Label>Quận/Huyện</Label>
                    {/* API không có quận/huyện, cho nhập tay */}
                    <Input
                      value={editing.district || ""}
                      onChange={handleChange("district")}
                      placeholder="Nhập quận/huyện"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label>Phường/Xã</Label>
                    <select
                      className="border rounded-md px-2 py-2 text-sm w-full"
                      value={editing.ward || ""}
                      onChange={handleChange("ward")}
                      disabled={!editing.province || wards.length === 0}
                    >
                      <option value="">
                        {editing.province
                          ? "Chọn phường/xã"
                          : "Chọn tỉnh trước"}
                      </option>
                      {wards.map((w, idx) => (
                        <option key={`${w.name}-${idx}`} value={w.name}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label>Tỉnh/Thành phố</Label>
                    <select
                      className="border rounded-md px-2 py-2 text-sm w-full"
                      value={editing.province || ""}
                      onChange={handleChange("province")}
                      required
                    >
                      <option value="">Chọn tỉnh/thành</option>
                      {provinces.map((p) => (
                        <option key={p.id} value={p.province}>
                          {p.province}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <input
                    id="isDefault"
                    type="checkbox"
                    checked={!!editing.isDefault}
                    onChange={(e) =>
                      setEditing((prev) =>
                        prev ? { ...prev, isDefault: e.target.checked } : prev
                      )
                    }
                  />
                  <Label htmlFor="isDefault">Đặt làm địa chỉ mặc định</Label>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Hủy
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    Lưu địa chỉ
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </AccountLayout>
  );
};

export default AddressBook;
