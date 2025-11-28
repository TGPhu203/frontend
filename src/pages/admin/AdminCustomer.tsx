"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Eye, Mail, Phone, RefreshCw, Unlock, Lock } from "lucide-react";
import { toast } from "sonner";

type LoyaltyTier = "none" | "silver" | "gold" | "diamond";

type Customer = {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  orderCount?: number;
  totalSpent?: number;
  loyaltyTier?: LoyaltyTier;
  loyaltyPoints?: number;
  isBlocked?: boolean;
};

// tính bậc dựa trên tổng chi tiêu (fallback khi backend chưa set)
const getTierFromSpent = (spent: number): LoyaltyTier => {
  if (spent >= 50_000_000) return "diamond";
  if (spent >= 20_000_000) return "gold";
  if (spent >= 5_000_000) return "silver";
  return "none";
};

// mapping bậc → label + màu + % ưu đãi (hiển thị)
const getTierDisplay = (tier: LoyaltyTier) => {
  switch (tier) {
    case "silver":
      return {
        label: "Thành viên Bạc",
        discountPercent: 2,
        badgeClass: "bg-slate-100 text-slate-800 border border-slate-200",
      };
    case "gold":
      return {
        label: "Thành viên Vàng",
        discountPercent: 5,
        badgeClass: "bg-amber-100 text-amber-900 border border-amber-200",
      };
    case "diamond":
      return {
        label: "Thành viên Kim cương",
        discountPercent: 10,
        badgeClass: "bg-sky-100 text-sky-900 border border-sky-200",
      };
    default:
      return {
        label: "Chưa xếp hạng",
        discountPercent: 0,
        badgeClass: "bg-muted text-muted-foreground border border-border",
      };
  }
};

const AdminCustomer = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const handleToggleBlock = async (customer: Customer) => {
    if (!customer._id) return;

    const action = customer.isBlocked ? "unblock" : "block";
    const confirmText = customer.isBlocked
      ? "Bạn có chắc muốn mở khóa tài khoản này?"
      : "Bạn có chắc muốn khóa tài khoản này?";

    if (!window.confirm(confirmText)) return;

    try {
      const res = await fetch(
        `http://localhost:8888/api/admin/users/${customer._id}/${action}`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Không thể cập nhật trạng thái tài khoản");
      }

      setCustomers((prev) =>
        prev.map((c) =>
          c._id === customer._id ? { ...c, isBlocked: !customer.isBlocked } : c
        )
      );

      toast.success(
        customer.isBlocked
          ? "Đã mở khóa tài khoản khách hàng"
          : "Đã khóa tài khoản khách hàng"
      );
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi cập nhật trạng thái tài khoản");
    }
  };

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        "http://localhost:8888/api/admin/users?page=1&limit=50",
        {
          credentials: "include",
        }
      );
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Không thể tải danh sách khách hàng");
      }

      let data: any = json;
      if (Array.isArray(json)) {
        data = json;
      } else if (Array.isArray(json.data)) {
        data = json.data;       // 👈 đúng với { status: 'success', data: [...] }
      } else if (Array.isArray(json.users)) {
        data = json.users;
      } else {
        data = [];
      }

      const mapped: Customer[] = (data as any[]).map((c) => ({
        _id: c._id,
        firstName: c.firstName,
        lastName: c.lastName,
        email: c.email,
        phone: c.phone,
        orderCount: c.orderCount,
        totalSpent: c.totalSpent,
        loyaltyTier: c.loyaltyTier ?? "none",
        loyaltyPoints: c.loyaltyPoints ?? 0,
        isBlocked: !!c.isBlocked,   // 👈 thêm
      }));


      setCustomers(mapped);
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi tải danh sách khách hàng");
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const filtered = useMemo(() => {
    const keyword = search.toLowerCase();
    if (!keyword) return customers;

    return customers.filter((c) => {
      const name = `${c.firstName || ""} ${c.lastName || ""}`.toLowerCase();
      const email = c.email?.toLowerCase() || "";
      const phone = c.phone || "";
      return (
        name.includes(keyword) ||
        email.includes(keyword) ||
        phone.includes(keyword)
      );
    });
  }, [customers, search]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-background px-4 py-6 md:px-8 md:py-8 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Đang tải danh sách khách hàng...
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-background px-4 py-6 md:px-8 md:py-8">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>

            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
              Quản lý khách hàng
            </h1>

          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo tên, email, số điện thoại..."
                className="pl-9 h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-9 rounded-full"
              onClick={loadCustomers}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Làm mới
            </Button>
          </div>
        </div>

        {/* Table card */}
        <Card className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-4 py-3 md:px-6">
            <div>
              <p className="text-sm font-medium text-card-foreground">
                Danh sách khách hàng
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Tổng cộng {customers.length} khách hàng, đang hiển thị{" "}
                {filtered.length}.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60">
                <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-6 py-3 text-left font-medium">
                    Khách hàng
                  </th>
                  <th className="px-6 py-3 text-left font-medium">
                    Liên hệ
                  </th>
                  <th className="px-6 py-3 text-left font-medium">
                    Hạng / Ưu đãi
                  </th>
                  <th className="px-6 py-3 text-left font-medium">Số đơn</th>
                  <th className="px-6 py-3 text-left font-medium">
                    Tổng chi tiêu
                  </th>
                  <th className="px-6 py-3 text-left font-medium">
                    Trạng thái / Thao tác
                  </th>                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {filtered.map((customer) => {
                  const fullName =
                    `${customer.firstName || ""} ${customer.lastName || ""
                      }`.trim() || customer.email;
                  const initial =
                    fullName
                      .split(" ")
                      .slice(-1)[0]
                      ?.charAt(0)
                      .toUpperCase() || "?";

                  // nếu backend đã có loyaltyTier khác "none" thì dùng, ngược lại tự tính theo totalSpent
                  // trong AdminCustomer, bên trong map(filtered.map(...))
                  const spent = customer.totalSpent ?? 0;

                  // Luôn tính hạng theo tổng chi tiêu, KHÔNG dùng loyaltyTier từ backend
                  const tier: LoyaltyTier = getTierFromSpent(spent);

                  const { label, discountPercent, badgeClass } = getTierDisplay(tier);


                  return (
                    <tr
                      key={customer._id}
                      className="hover:bg-muted/40 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-11 rounded-full bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center shadow-sm">
                            <span className="text-sm font-semibold text-primary-foreground">
                              {initial}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-card-foreground">
                              {fullName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ID: #{customer._id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-card-foreground">
                            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{customer.email}</span>
                          </div>
                          {customer.phone && (
                            <div className="flex items-center gap-2 text-sm text-card-foreground">
                              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>{customer.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${badgeClass}`}
                          >
                            {label}
                          </span>
                          <p className="text-xs text-muted-foreground">
                            {discountPercent > 0
                              ? `Ưu đãi: giảm ${discountPercent}% trên đơn hàng`
                              : "Chưa có ưu đãi tích lũy"}
                          </p>
                          {customer.loyaltyPoints != null &&
                            customer.loyaltyPoints > 0 && (
                              <p className="text-[11px] text-muted-foreground">
                                Điểm tích lũy: {customer.loyaltyPoints}
                              </p>
                            )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                          {(customer.orderCount ?? 0).toString()} đơn
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm font-semibold text-card-foreground">
                        ₫{(customer.totalSpent ?? 0).toLocaleString("vi-VN")}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-col items-end gap-1">
                          {/* Trạng thái khóa */}
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${customer.isBlocked
                                ? "bg-red-100 text-red-700 border border-red-200"
                                : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                              }`}
                          >
                            {customer.isBlocked ? "Đã khóa" : "Đang hoạt động"}
                          </span>

                          {/* Nút thao tác */}
                          <div className="flex items-center gap-1 mt-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>

                            <Button
                              variant={customer.isBlocked ? "outline" : "destructive"}
                              size="icon"
                              className="h-8 w-8 rounded-full"
                              onClick={() => handleToggleBlock(customer)}
                            >
                              {customer.isBlocked ? (
                                <Unlock className="h-4 w-4" />
                              ) : (
                                <Lock className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </td>

                    </tr>
                  );
                })}

                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-6 text-center text-sm text-muted-foreground"
                    >
                      Không tìm thấy khách hàng nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminCustomer;
