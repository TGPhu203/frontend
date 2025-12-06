// src/pages/admin/SupportStaffManagement.tsx
"use client";

import { useEffect, useState, FormEvent } from "react";
import axios from "axios";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { AdminLayout } from "./AdminLayout";
import { MoreHorizontal, Plus, RefreshCcw, Lock, Unlock, Search } from "lucide-react";
import { toast } from "sonner";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8888";
const ADMIN_BASE = `${API_BASE_URL}/api/admin`;

type SupportUser = {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  isActive?: boolean;
  isBlocked?: boolean;
  createdAt?: string;
};

type CreateSupportForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
};

export default function SupportStaffManagement() {
  const [loading, setLoading] = useState<boolean>(false);
  const [creating, setCreating] = useState<boolean>(false);
  const [users, setUsers] = useState<SupportUser[]>([]);
  const [search, setSearch] = useState<string>("");

  const [form, setForm] = useState<CreateSupportForm>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });

  const fetchSupportUsers = async () => {
    try {
      setLoading(true);
  
      const res = await axios.get(`${ADMIN_BASE}/support-users`, {
        withCredentials: true,
      });
  
      const supportUsers: SupportUser[] = res.data?.data || [];
      setUsers(supportUsers);
    } catch (error: any) {
      console.error("Fetch support users error:", error);
      toast.error(
        error?.response?.data?.message ||
          "Không tải được danh sách nhân viên CSKH"
      );
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchSupportUsers();
  }, []);

  const handleChangeForm = (field: keyof CreateSupportForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateSupport = async (e: FormEvent) => {
    e.preventDefault();

    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      toast.error("Vui lòng nhập đầy đủ Họ, Tên, Email, Mật khẩu");
      return;
    }

    try {
      setCreating(true);

      await axios.post(
        `${ADMIN_BASE}/support`,
        {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone || undefined,
          password: form.password,
        },
        { withCredentials: true }
      );

      toast.success("Tạo tài khoản nhân viên CSKH thành công");

      setForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
      });

      fetchSupportUsers();
    } catch (error: any) {
      console.error("Create support user error:", error);
      toast.error(
        error?.response?.data?.message ||
          "Không tạo được tài khoản nhân viên CSKH"
      );
    } finally {
      setCreating(false);
    }
  };

  const handleBlockUser = async (id: string) => {
    try {
      await axios.patch(
        `${ADMIN_BASE}/users/${id}/block`,
        {},
        { withCredentials: true }
      );
      toast.success("Đã khóa tài khoản");
      fetchSupportUsers();
    } catch (error: any) {
      console.error("Block user error:", error);
      toast.error(
        error?.response?.data?.message || "Không khóa được tài khoản"
      );
    }
  };

  const handleUnblockUser = async (id: string) => {
    try {
      await axios.patch(
        `${ADMIN_BASE}/users/${id}/unblock`,
        {},
        { withCredentials: true }
      );
      toast.success("Đã mở khóa tài khoản");
      fetchSupportUsers();
    } catch (error: any) {
      console.error("Unblock user error:", error);
      toast.error(
        error?.response?.data?.message || "Không mở khóa được tài khoản"
      );
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      u.email?.toLowerCase().includes(q) ||
      u.firstName?.toLowerCase().includes(q) ||
      u.lastName?.toLowerCase().includes(q) ||
      (u.phone || "").toLowerCase().includes(q)
    );
  });

  return (
    <AdminLayout>
    <div className="flex flex-col gap-6">
      {/* FORM TẠO NHÂN VIÊN CSKH */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Tạo tài khoản nhân viên CSKH</CardTitle>
            <CardDescription>
              Chỉ tài khoản admin mới được tạo nhân viên CSKH.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={fetchSupportUsers}
            disabled={loading}
          >
            <RefreshCcw className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleCreateSupport}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <div>
              <label className="text-sm font-medium mb-1 block">Họ</label>
              <Input
                placeholder="Nguyễn"
                value={form.firstName}
                onChange={(e) => handleChangeForm("firstName", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Tên</label>
              <Input
                placeholder="Văn A"
                value={form.lastName}
                onChange={(e) => handleChangeForm("lastName", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Email</label>
              <Input
                type="email"
                placeholder="support@example.com"
                value={form.email}
                onChange={(e) => handleChangeForm("email", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Số điện thoại</label>
              <Input
                placeholder="090xxxxxxx"
                value={form.phone}
                onChange={(e) => handleChangeForm("phone", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Mật khẩu</label>
              <Input
                type="password"
                placeholder="Ít nhất 6 ký tự"
                value={form.password}
                onChange={(e) => handleChangeForm("password", e.target.value)}
              />
            </div>

            <div className="flex items-end">
              <Button type="submit" disabled={creating}>
                <Plus className="w-4 h-4 mr-2" />
                {creating ? "Đang tạo..." : "Tạo tài khoản CSKH"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* DANH SÁCH NHÂN VIÊN CSKH */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Danh sách nhân viên CSKH</CardTitle>
            <CardDescription>
              Quản lý khóa/mở khóa tài khoản nhân viên CSKH.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 opacity-60" />
              <Input
                className="pl-8 w-[220px]"
                placeholder="Tìm theo tên, email, SĐT"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Họ tên</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Số điện thoại</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6">
                      Đang tải dữ liệu...
                    </TableCell>
                  </TableRow>
                )}

                {!loading && filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6">
                      Chưa có nhân viên CSKH.
                    </TableCell>
                  </TableRow>
                )}

                {!loading &&
                  filteredUsers.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {user.firstName} {user.lastName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {user._id}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone || "-"}</TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={user.isBlocked ? "destructive" : "outline"}
                          >
                            {user.isBlocked ? "Đã khóa" : "Hoạt động"}
                          </Badge>
                          <Badge variant="secondary">CSKH</Badge>
                        </div>
                      </TableCell>

                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end">
                            {!user.isBlocked ? (
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleBlockUser(user._id)}
                              >
                                <Lock className="w-4 h-4 mr-2" />
                                Khóa tài khoản
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => handleUnblockUser(user._id)}
                              >
                                <Unlock className="w-4 h-4 mr-2" />
                                Mở khóa tài khoản
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
    </AdminLayout>
  );
}
