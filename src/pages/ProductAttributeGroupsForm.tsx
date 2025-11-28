// src/pages/admin/ProductAttributeGroupsForm.tsx
"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import {
  getAttributeGroups,
  createAttributeGroup,
  getAttributeValues,
  createAttributeValue,
  updateAttributeValue,
  deleteAttributeValue,
  type AttributeValue,
} from "@/api/attributeApi";
import {
  getProductAttributeGroups,
  upsertProductAttributeGroup,
  removeProductAttributeGroup,
  ProductAttributeGroupItem,
} from "@/api/productAttributeGroupApi";

type AttributeGroup = {
  _id: string;
  name: string;
  type?: "select" | "color" | "text" | "number";
  isRequired?: boolean;
};

type Props = {
  productId: string;
};

export const ProductAttributeGroupsForm = ({ productId }: Props) => {
  const [allGroups, setAllGroups] = useState<AttributeGroup[]>([]);
  const [productGroups, setProductGroups] = useState<
    Record<string, ProductAttributeGroupItem>
  >({});
  const [loading, setLoading] = useState(true);

  // form tạo NHÓM thuộc tính mới
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<AttributeGroup["type"]>("select");
  const [newRequired, setNewRequired] = useState(false);
  const [creating, setCreating] = useState(false);

  // --- QUẢN LÝ GIÁ TRỊ THUỘC TÍNH (AttributeValue) ---
  const [openGroupId, setOpenGroupId] = useState<string | null>(null);
  const [groupValues, setGroupValues] = useState<
    Record<string, AttributeValue[]>
  >({});
  const [loadingValuesGroupId, setLoadingValuesGroupId] = useState<string | null>(
    null
  );

  // form thêm / sửa value
  const [editingValueId, setEditingValueId] = useState<string | null>(null);
  const [valueForm, setValueForm] = useState<{
    name: string;
    value: string;
    colorCode: string;
    priceAdjustment: string;
  }>({
    name: "",
    value: "",
    colorCode: "",
    priceAdjustment: "",
  });
  const [savingValue, setSavingValue] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [groupsRes, productGroupsRes] = await Promise.all([
          getAttributeGroups(),
          getProductAttributeGroups(productId),
        ]);

        setAllGroups((groupsRes || []) as AttributeGroup[]);

        const map: Record<string, ProductAttributeGroupItem> = {};
        (productGroupsRes || []).forEach((item) => {
          const gid =
            (item.attributeGroupId as any)?._id || item.attributeGroupId;
          if (gid) map[gid] = item;
        });
        setProductGroups(map);
      } catch (e: any) {
        toast.error(e.message || "Lỗi tải nhóm thuộc tính sản phẩm");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [productId]);

  const handleToggleGroup = async (groupId: string) => {
    const existing = productGroups[groupId];

    try {
      if (existing) {
        // bỏ gán
        await removeProductAttributeGroup(productId, groupId);
        const clone = { ...productGroups };
        delete clone[groupId];
        setProductGroups(clone);
        toast.success("Đã bỏ nhóm thuộc tính khỏi sản phẩm");
      } else {
        // gán mới
        const created = await upsertProductAttributeGroup(productId, groupId, {
          isRequired: true,
          sortOrder: 0,
        });
        const gid =
          (created.attributeGroupId as any)?._id || created.attributeGroupId;
        setProductGroups((prev) => ({ ...prev, [gid]: created }));
        toast.success("Đã gán nhóm thuộc tính cho sản phẩm");
      }
    } catch (e: any) {
      toast.error(e.message || "Không cập nhật được nhóm thuộc tính");
    }
  };

  const handleSortChange = async (groupId: string, value: string) => {
    const existing = productGroups[groupId];
    if (!existing) return;

    const sortOrder = Number(value) || 0;

    try {
      const updated = await upsertProductAttributeGroup(productId, groupId, {
        isRequired: existing.isRequired,
        sortOrder,
      });
      const gid =
        (updated.attributeGroupId as any)?._id || updated.attributeGroupId;
      setProductGroups((prev) => ({ ...prev, [gid]: updated }));
    } catch (e: any) {
      toast.error(e.message || "Không cập nhật thứ tự");
    }
  };

  // TẠO NHÓM THUỘC TÍNH MỚI + GÁN CHO PRODUCT
  const handleCreateNewGroup = async () => {
    if (!newName.trim()) {
      toast.error("Vui lòng nhập tên nhóm thuộc tính");
      return;
    }

    try {
      setCreating(true);

      // 1) Tạo AttributeGroup mới
      const created = await createAttributeGroup({
        name: newName.trim(),
        type: newType,
        isRequired: newRequired,
      });

      // 2) Thêm vào list group chung
      setAllGroups((prev) => [...prev, created as AttributeGroup]);

      // 3) Gán luôn group này cho sản phẩm hiện tại
      const attached = await upsertProductAttributeGroup(
        productId,
        (created as any)._id,
        {
          isRequired: true,
          sortOrder: Object.keys(productGroups).length,
        }
      );
      const gid =
        (attached.attributeGroupId as any)?._id || attached.attributeGroupId;

      setProductGroups((prev) => ({ ...prev, [gid]: attached }));

      // 4) reset form
      setNewName("");
      setNewType("select");
      setNewRequired(false);

      toast.success("Đã tạo nhóm thuộc tính và gán cho sản phẩm");
    } catch (e: any) {
      toast.error(e.message || "Không tạo được nhóm thuộc tính");
    } finally {
      setCreating(false);
    }
  };

  // =============== QUẢN LÝ GIÁ TRỊ (ATTRIBUTE VALUE) ===============

  const loadGroupValues = async (groupId: string) => {
    try {
      setLoadingValuesGroupId(groupId);
      const values = await getAttributeValues(groupId);
      setGroupValues((prev) => ({ ...prev, [groupId]: values || [] }));
    } catch (e: any) {
      toast.error(e.message || "Không tải được giá trị thuộc tính");
    } finally {
      setLoadingValuesGroupId(null);
    }
  };

  const handleToggleValuesPanel = (groupId: string) => {
    if (openGroupId === groupId) {
      setOpenGroupId(null);
      setEditingValueId(null);
      return;
    }
    setOpenGroupId(groupId);
    setEditingValueId(null);
    if (!groupValues[groupId]) {
      loadGroupValues(groupId);
    }
  };

  const resetValueForm = () => {
    setEditingValueId(null);
    setValueForm({
      name: "",
      value: "",
      colorCode: "",
      priceAdjustment: "",
    });
  };

  const startEditValue = (v: AttributeValue) => {
    setEditingValueId(v._id);
    setValueForm({
      name: v.name || "",
      value: v.value || "",
      colorCode: v.colorCode || "",
      priceAdjustment:
        typeof v.priceAdjustment === "number"
          ? String(v.priceAdjustment)
          : "",
    });
  };

  const handleChangeValueForm = (
    field: keyof typeof valueForm,
    val: string
  ) => {
    setValueForm((prev) => ({ ...prev, [field]: val }));
  };

  const handleSaveValue = async (groupId: string) => {
    if (!valueForm.name.trim() || !valueForm.value.trim()) {
      toast.error("Tên và giá trị không được để trống");
      return;
    }

    try {
      setSavingValue(true);
      const payload: Partial<AttributeValue> = {
        name: valueForm.name.trim(),
        value: valueForm.value.trim(),
        colorCode: valueForm.colorCode.trim() || undefined,
        priceAdjustment: valueForm.priceAdjustment
          ? Number(valueForm.priceAdjustment)
          : 0,
      };

      if (editingValueId) {
        // cập nhật
        const updated = await updateAttributeValue(editingValueId, payload);
        setGroupValues((prev) => ({
          ...prev,
          [groupId]: (prev[groupId] || []).map((x) =>
            x._id === updated._id ? updated : x
          ),
        }));
        toast.success("Đã cập nhật giá trị thuộc tính");
      } else {
        // tạo mới
        const created = await createAttributeValue(groupId, payload);
        setGroupValues((prev) => ({
          ...prev,
          [groupId]: [...(prev[groupId] || []), created],
        }));
        toast.success("Đã thêm giá trị thuộc tính");
      }

      resetValueForm();
    } catch (e: any) {
      toast.error(e.message || "Không lưu được giá trị thuộc tính");
    } finally {
      setSavingValue(false);
    }
  };

  const handleDeleteValue = async (groupId: string, valueId: string) => {
    if (!window.confirm("Bạn có chắc muốn xoá giá trị này?")) return;

    try {
      await deleteAttributeValue(valueId);
      setGroupValues((prev) => ({
        ...prev,
        [groupId]: (prev[groupId] || []).filter((v) => v._id !== valueId),
      }));
      toast.success("Đã xoá giá trị thuộc tính");
    } catch (e: any) {
      toast.error(e.message || "Không xoá được giá trị thuộc tính");
    }
  };

  if (loading) {
    return <div>Đang tải nhóm thuộc tính sản phẩm...</div>;
  }

  return (
    <Card className="mt-6 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            Nhóm thuộc tính áp dụng cho sản phẩm
          </h3>
          <p className="text-sm text-muted-foreground">
            Chọn các nhóm như Màu sắc, Dung lượng, RAM sẽ hiển thị ngoài FE.
          </p>
        </div>
      </div>

      {/* FORM TẠO NHÓM THUỘC TÍNH MỚI */}
      <div className="rounded border p-3 space-y-2">
        <div className="text-sm font-medium">
          Thêm nhóm thuộc tính mới cho sản phẩm này
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
          <div>
            <label className="text-xs text-muted-foreground">Tên nhóm</label>
            <Input
              placeholder="VD: Màu sắc, Dung lượng..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Kiểu</label>
            <select
              className="h-9 w-full rounded border px-2 text-sm bg-background"
              value={newType}
              onChange={(e) =>
                setNewType(e.target.value as AttributeGroup["type"])
              }
            >
              <option value="select">Select (chọn 1)</option>
              <option value="color">Color (màu sắc)</option>
              <option value="text">Text (nhập chữ)</option>
              <option value="number">Number (nhập số)</option>
            </select>
          </div>
          <div className="flex items-center gap-2 mt-5 md:mt-6">
            <Checkbox
              checked={newRequired}
              onCheckedChange={(v) => setNewRequired(!!v)}
            />
            <span className="text-sm">Bắt buộc khi mua</span>
          </div>
        </div>
        <Button
          size="sm"
          className="mt-1"
          onClick={handleCreateNewGroup}
          disabled={creating}
        >
          {creating ? "Đang tạo..." : "Thêm nhóm & gán cho sản phẩm"}
        </Button>
      </div>

      {/* DANH SÁCH TẤT CẢ NHÓM + CHECKBOX GÁN + SỬA VALUE */}
      <div className="space-y-2">
        {allGroups.map((g) => {
          const attached = !!productGroups[g._id];
          const sortOrder = productGroups[g._id]?.sortOrder ?? 0;
          const isOpen = openGroupId === g._id;
          const values = groupValues[g._id] || [];

          return (
            <div
              key={g._id}
              className="rounded border px-3 py-2 space-y-2"
            >
              {/* hàng chính */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={attached}
                    onCheckedChange={() => handleToggleGroup(g._id)}
                  />
                  <div>
                    <div className="font-medium">{g.name}</div>
                    <div className="text-xs text-muted-foreground">
                      Kiểu: {g.type || "select"}
                      {g.isRequired && " • Bắt buộc khi mua"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {attached && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        Thứ tự:
                      </span>
                      <Input
                        className="w-16 h-8"
                        type="number"
                        value={sortOrder}
                        onChange={(e) =>
                          handleSortChange(g._id, e.target.value)
                        }
                      />
                    </div>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleValuesPanel(g._id)}
                  >
                    {isOpen ? "Ẩn giá trị" : "Giá trị"}
                  </Button>
                </div>
              </div>

              {/* panel giá trị */}
              {isOpen && (
                <div className="mt-2 border-t pt-2 text-xs space-y-2">
                  {loadingValuesGroupId === g._id ? (
                    <div>Đang tải giá trị...</div>
                  ) : (
                    <>
                      {/* list values */}
                      {values.length === 0 ? (
                        <div className="text-muted-foreground">
                          Chưa có giá trị nào cho nhóm này.
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {values.map((v) => (
                            <div
                              key={v._id}
                              className="flex flex-wrap items-center gap-2 rounded border px-2 py-1"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1">
                                <div className="flex items-center gap-1">
                                  <span className="text-[11px] text-muted-foreground">
                                    Tên:
                                  </span>
                                  <span className="font-medium">
                                    {v.name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="text-[11px] text-muted-foreground">
                                    Giá trị:
                                  </span>
                                  <span>{v.value}</span>
                                </div>

                                {g.type === "color" && v.colorCode && (
                                  <div className="flex items-center gap-1">
                                    <span className="text-[11px] text-muted-foreground">
                                      Màu:
                                    </span>
                                    <span
                                      className="inline-block h-3 w-3 rounded-full border"
                                      style={{
                                        backgroundColor: v.colorCode,
                                      }}
                                    />
                                    <span className="text-[11px] text-muted-foreground">
                                      {v.colorCode}
                                    </span>
                                  </div>
                                )}

                                {v.priceAdjustment ? (
                                  <div className="flex items-center gap-1">
                                    <span className="text-[11px] text-muted-foreground">
                                      +giá:
                                    </span>
                                    <span>{v.priceAdjustment}</span>
                                  </div>
                                ) : null}
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  size="xs"
                                  variant="outline"
                                  onClick={() => startEditValue(v)}
                                >
                                  Sửa
                                </Button>
                                <Button
                                  size="xs"
                                  variant="outline"
                                  className="text-red-500 border-red-200"
                                  onClick={() =>
                                    handleDeleteValue(g._id, v._id)
                                  }
                                >
                                  Xoá
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* form thêm / sửa value */}
                      <div className="mt-2 rounded border px-2 py-2 space-y-2">
                        <div className="text-[11px] font-semibold uppercase text-muted-foreground">
                          {editingValueId
                            ? "Sửa giá trị thuộc tính"
                            : "Thêm giá trị thuộc tính"}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                          <Input
                            placeholder="Tên hiển thị (VD: Đỏ, 256GB)"
                            value={valueForm.name}
                            onChange={(e) =>
                              handleChangeValueForm("name", e.target.value)
                            }
                            className="h-8 text-xs"
                          />
                          <Input
                            placeholder="Giá trị lưu (VD: red,256)"
                            value={valueForm.value}
                            onChange={(e) =>
                              handleChangeValueForm("value", e.target.value)
                            }
                            className="h-8 text-xs"
                          />
                          {g.type === "color" && (
                            <Input
                              placeholder="#RRGGBB"
                              value={valueForm.colorCode}
                              onChange={(e) =>
                                handleChangeValueForm(
                                  "colorCode",
                                  e.target.value
                                )
                              }
                              className="h-8 text-xs"
                            />
                          )}
                          <Input
                            placeholder="+giá (VD: 1000000)"
                            value={valueForm.priceAdjustment}
                            onChange={(e) =>
                              handleChangeValueForm(
                                "priceAdjustment",
                                e.target.value
                              )
                            }
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleSaveValue(g._id)}
                            disabled={savingValue}
                          >
                            {savingValue
                              ? "Đang lưu..."
                              : editingValueId
                              ? "Lưu thay đổi"
                              : "Thêm giá trị"}
                          </Button>
                          {editingValueId && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={resetValueForm}
                            >
                              Hủy
                            </Button>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};
