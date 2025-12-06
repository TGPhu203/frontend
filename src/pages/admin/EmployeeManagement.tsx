"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { AdminLayout } from "./AdminLayout";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { RefreshCcw } from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8888";
const ADMIN_BASE = `${API_BASE_URL}/api/admin`;

type Employee = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: "admin" | "manager" | "support";
  baseSalary?: number;
  salaryType?: "monthly" | "hourly";
  isBlocked?: boolean;
  createdAt?: string;
};

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Chỉ cho admin xem (dựa trên localStorage; có thể thay bằng AuthContext của bạn)
  const currentRole = typeof window !== "undefined"
    ? localStorage.getItem("role")
    : null;

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${ADMIN_BASE}/employees`, {
        withCredentials: true,
      });
      const data: Employee[] = res.data?.data || [];
      setEmployees(data);
    } catch (err: any) {
      console.error("fetchEmployees error:", err);
      toast.error(
        err?.response?.data?.message || "Không tải được danh sách nhân viên"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Chỉ hiển thị manager + support theo yêu cầu
  const visibleEmployees = employees.filter(
    (e) => e.role === "manager" || e.role === "support"
  );

  const handleChangeRole = async (id: string, newRole: "manager" | "support") => {
    try {
      setUpdatingId(id);
      await axios.patch(
        `${ADMIN_BASE}/employees/${id}`,
        { role: newRole },
        { withCredentials: true }
      );
      toast.success("Cập nhật vai trò thành công");
      fetchEmployees();
    } catch (err: any) {
      console.error("update role error:", err);
      toast.error(
        err?.response?.data?.message || "Không cập nhật được vai trò"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleBlock = async (user: Employee) => {
    try {
      setUpdatingId(user._id);
      await axios.patch(
        `${ADMIN_BASE}/employees/${user._id}`,
        { isBlocked: !user.isBlocked },
        { withCredentials: true }
      );
      toast.success(
        !user.isBlocked ? "Đã khóa tài khoản" : "Đã mở khóa tài khoản"
      );
      fetchEmployees();
    } catch (err: any) {
      console.error("toggle block error:", err);
      toast.error(
        err?.response?.data?.message || "Không cập nhật trạng thái khóa"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // Nếu không phải admin thì chặn luôn
  if (currentRole && currentRole !== "admin") {
    return (
      <AdminLayout>
        <Card>
          <CardHeader>
            <CardTitle>Quản lý nhân viên</CardTitle>
            <CardDescription>Bạn không có quyền truy cập chức năng này.</CardDescription>
          </CardHeader>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Quản lý nhân viên (manager & support)</CardTitle>
              <CardDescription>
                Admin có thể đổi vai trò và khóa/mở khóa tài khoản nhân viên.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={fetchEmployees}
              disabled={loading}
            >
              <RefreshCcw className="w-4 h-4" />
            </Button>
          </CardHeader>

          <CardContent>
            {loading && <p>Đang tải dữ liệu...</p>}
            {!loading && visibleEmployees.length === 0 && (
              <p>Không có nhân viên manager / support.</p>
            )}

            {!loading && visibleEmployees.length > 0 && (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nhân viên</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Điện thoại</TableHead>
                      <TableHead>Vai trò</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleEmployees.map((e) => (
                      <TableRow key={e._id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {e.firstName} {e.lastName}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{e.email}</TableCell>
                        <TableCell>{e.phone || "-"}</TableCell>
                        <TableCell>
                          <Select
                            value={e.role}
                            onValueChange={(val) =>
                              handleChangeRole(
                                e._id,
                                val as "manager" | "support"
                              )
                            }
                            disabled={updatingId === e._id}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="manager">Manager</SelectItem>
                              <SelectItem value="support">Support</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={e.isBlocked ? "destructive" : "secondary"}
                          >
                            {e.isBlocked ? "Đã khóa" : "Đang hoạt động"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant={e.isBlocked ? "outline" : "destructive"}
                            onClick={() => handleToggleBlock(e)}
                            disabled={updatingId === e._id}
                          >
                            {e.isBlocked ? "Mở khóa" : "Khóa tài khoản"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
