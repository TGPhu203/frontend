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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    role: string;
    baseSalary: number;
    salaryType: "monthly" | "hourly";
};

type Payroll = {
    _id: string;
    userId: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    month: number;
    year: number;
    totalWorkDays: number;
    totalWorkHours: number;
    baseSalary: number;
    bonus: number;
    deductions: number;
    finalSalary: number;
    status: "pending" | "paid";
    paidAt?: string;
};

export default function PayrollManagement() {
    const now = new Date();
    const [month, setMonth] = useState<number>(now.getMonth() + 1);
    const [year, setYear] = useState<number>(now.getFullYear());

    const [employees, setEmployees] = useState<Employee[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<string>("");
    const [bonus, setBonus] = useState<string>("0");
    const [deductions, setDeductions] = useState<string>("0");

    const [payrolls, setPayrolls] = useState<Payroll[]>([]);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);

    const fetchEmployees = async () => {
        try {
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
        }
    };

    const fetchPayrolls = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${ADMIN_BASE}/payroll`, {
                params: {
                    month,
                    year,
                },
                withCredentials: true,
            });
            const data: Payroll[] = res.data?.data || [];
            setPayrolls(data);
        } catch (err: any) {
            console.error("fetchPayrolls error:", err);
            toast.error(
                err?.response?.data?.message || "Không tải được bảng lương"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    useEffect(() => {
        fetchPayrolls();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [month, year]);

    const handleGeneratePayroll = async () => {
        if (!selectedEmployee) {
            toast.error("Vui lòng chọn 1 nhân viên");
            return;
        }

        try {
            setGenerating(true);
            await axios.post(
                `${ADMIN_BASE}/payroll/generate`,
                {
                    userId: selectedEmployee,
                    month,
                    year,
                    bonus: Number(bonus) || 0,
                    deductions: Number(deductions) || 0,
                },
                { withCredentials: true }
            );

            toast.success("Đã tính lương cho nhân viên");
            fetchPayrolls();
        } catch (err: any) {
            console.error("generatePayroll error:", err);
            toast.error(
                err?.response?.data?.message || "Không tạo được bảng lương"
            );
        } finally {
            setGenerating(false);
        }
    };

    const handleMarkPaid = async (id: string) => {
        try {
            await axios.post(
                `${ADMIN_BASE}/payroll/${id}/mark-paid`,
                {},
                { withCredentials: true }
            );
            toast.success("Đã đánh dấu đã trả lương");
            fetchPayrolls();
        } catch (err: any) {
            console.error("markPaid error:", err);
            toast.error(
                err?.response?.data?.message || "Không cập nhật trạng thái trả lương"
            );
        }
    };
    const handleExportExcel = async () => {
        try {
            const res = await axios.get(`${ADMIN_BASE}/payroll/export`, {
                params: { month, year },
                withCredentials: true,
                responseType: "blob",
            });

            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement("a");
            link.href = url;
            link.download = `bang-luong-${month}-${year}.xlsx`;
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err: any) {
            console.error("exportPayroll error:", err);
            toast.error(
                err?.response?.data?.message || "Không xuất được file bảng lương"
            );
        }
    };

    return (
        <AdminLayout>
            <div className="flex flex-col gap-6">
                {/* FORM TÍNH LƯƠNG */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-4">
                        <div>
                            <CardTitle>Tính lương nhân viên</CardTitle>
                            <CardDescription>
                                Chọn tháng, năm và nhân viên cần tính lương.
                            </CardDescription>
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={fetchPayrolls}
                            disabled={loading}
                        >
                            <RefreshCcw className="w-4 h-4" />
                        </Button>
                    </CardHeader>

                    <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="text-sm font-medium mb-1 block">Tháng</label>
                            <Select
                                value={String(month)}
                                onValueChange={(val) => setMonth(Number(val))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn tháng" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 12 }).map((_, i) => (
                                        <SelectItem key={i + 1} value={String(i + 1)}>
                                            Tháng {i + 1}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1 block">Năm</label>
                            <Input
                                type="number"
                                value={year}
                                onChange={(e) => setYear(Number(e.target.value) || year)}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1 block">
                                Nhân viên
                            </label>
                            <Select
                                value={selectedEmployee}
                                onValueChange={(val) => setSelectedEmployee(val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn nhân viên" />
                                </SelectTrigger>
                                <SelectContent>
                                    {employees
                                        .filter((e) => e.role === "support")   // 👈 chỉ nhân viên CSKH
                                        .map((e) => (
                                            <SelectItem key={e._id} value={e._id}>
                                                {e.firstName} {e.lastName}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>


                        <div className="grid grid-cols-1 gap-2">
                            <div>
                                <label className="text-sm font-medium mb-1 block">Thưởng</label>
                                <Input
                                    type="number"
                                    value={bonus}
                                    onChange={(e) => setBonus(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">
                                    Khấu trừ
                                </label>
                                <Input
                                    type="number"
                                    value={deductions}
                                    onChange={(e) => setDeductions(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex items-end">
                            <Button onClick={handleGeneratePayroll} disabled={generating}>
                                {generating ? "Đang tính..." : "Tạo bảng lương"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* BẢNG LƯƠNG */}
                <Card>
                    <CardHeader>
                        <CardTitle>Bảng lương</CardTitle>
                        <CardDescription>
                            Tháng {month}/{year}
                        </CardDescription>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={fetchPayrolls}
                                disabled={loading}
                            >
                                <RefreshCcw className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" onClick={handleExportExcel}>
                                Xuất Excel
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading && <p>Đang tải dữ liệu...</p>}
                        {!loading && payrolls.length === 0 && (
                            <p>Chưa có bảng lương cho tháng này.</p>
                        )}

                        {!loading && payrolls.length > 0 && (
                            <div className="rounded-md border overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nhân viên</TableHead>
                                            <TableHead>Ngày công</TableHead>
                                            <TableHead>Giờ làm</TableHead>
                                            <TableHead>Lương cơ bản</TableHead>
                                            <TableHead>Thưởng</TableHead>
                                            <TableHead>Khấu trừ</TableHead>
                                            <TableHead>Thực lĩnh</TableHead>
                                            <TableHead>Trạng thái</TableHead>
                                            <TableHead className="text-right">Thao tác</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {payrolls.map((p) => (
                                            <TableRow key={p._id}>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">
                                                            {p.userId?.firstName} {p.userId?.lastName}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {p.userId?.email}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{p.totalWorkDays}</TableCell>
                                                <TableCell>{p.totalWorkHours.toFixed(2)}</TableCell>
                                                <TableCell>
                                                    {p.baseSalary.toLocaleString("vi-VN")} đ
                                                </TableCell>
                                                <TableCell>
                                                    {p.bonus.toLocaleString("vi-VN")} đ
                                                </TableCell>
                                                <TableCell>
                                                    {p.deductions.toLocaleString("vi-VN")} đ
                                                </TableCell>
                                                <TableCell className="font-semibold">
                                                    {p.finalSalary.toLocaleString("vi-VN")} đ
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            p.status === "paid" ? "secondary" : "outline"
                                                        }
                                                    >
                                                        {p.status === "paid" ? "Đã trả" : "Chưa trả"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {p.status !== "paid" && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleMarkPaid(p._id)}
                                                        >
                                                            Đánh dấu đã trả
                                                        </Button>
                                                    )}
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
