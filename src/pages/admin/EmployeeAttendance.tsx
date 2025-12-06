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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8888";
const ADMIN_BASE = `${API_BASE_URL}/api/admin`;

type AttendanceRecord = {
  _id: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  workHours: number;
  status: "present" | "absent" | "late" | "leave";
};

function formatDateTime(value?: string) {
  if (!value) return "-";
  return new Date(value).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function EmployeeAttendance() {
  const [userId, setUserId] = useState<string | null>(null);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);

  const todayStr = new Date().toISOString().slice(0, 10); // yyyy-mm-dd

  // Lấy userId từ localStorage (ưu tiên "userId", fallback sang "user")
  useEffect(() => {
    try {
      let uid: string | null = null;

      const storedId = localStorage.getItem("userId");
      if (storedId && storedId !== "undefined" && storedId !== "null") {
        uid = storedId;
      } else {
        const rawUser = localStorage.getItem("user");
        if (rawUser) {
          const parsed = JSON.parse(rawUser);
          uid = parsed?._id || parsed?.id || null;
        }
      }

      if (!uid) {
        toast.error("Không xác định được tài khoản nhân viên. Vui lòng đăng nhập lại.");
      }

      setUserId(uid);
    } catch (err) {
      console.error("Parse user from localStorage error:", err);
      toast.error("Không đọc được thông tin đăng nhập.");
    }
  }, []);

  const fetchAttendance = async (uid: string) => {
    try {
      setLoading(true);
      // Hôm nay
      const resToday = await axios.get(`${ADMIN_BASE}/attendance`, {
        params: {
          userId: uid,
          from: todayStr,
          to: todayStr,
        },
        withCredentials: true,
      });

      const todayData: AttendanceRecord[] = resToday.data?.data || [];
      setTodayRecord(todayData[0] || null);

      // Lịch sử 14 ngày gần nhất
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - 14);
      const fromStr = fromDate.toISOString().slice(0, 10);

      const resHistory = await axios.get(`${ADMIN_BASE}/attendance`, {
        params: {
          userId: uid,
          from: fromStr,
          to: todayStr,
        },
        withCredentials: true,
      });

      const historyData: AttendanceRecord[] = resHistory.data?.data || [];
      historyData.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setHistory(historyData);
    } catch (err: any) {
      console.error("fetchAttendance error:", err);
      toast.error(
        err?.response?.data?.message || "Không tải được dữ liệu chấm công"
      );
    } finally {
      setLoading(false);
    }
  };

  // Khi có userId thì mới gọi API
  useEffect(() => {
    if (!userId) return;
    fetchAttendance(userId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleCheckIn = async () => {
    if (!userId) {
      toast.error("Không xác định được tài khoản nhân viên");
      return;
    }
    try {
      setChecking(true);
      await axios.post(
        `${ADMIN_BASE}/attendance/check-in`,
        { userId }, // hoặc {} nếu muốn BE tự dùng req.user.id
        { withCredentials: true }
      );
      toast.success("Check-in thành công");
      fetchAttendance(userId);
    } catch (err: any) {
      console.error("checkIn error:", err);
      toast.error(err?.response?.data?.message || "Không check-in được");
    } finally {
      setChecking(false);
    }
  };

  const handleCheckOut = async () => {
    if (!userId) {
      toast.error("Không xác định được tài khoản nhân viên");
      return;
    }
    try {
      setChecking(true);
      await axios.post(
        `${ADMIN_BASE}/attendance/check-out`,
        { userId }, // hoặc {} nếu để BE tự xác định
        { withCredentials: true }
      );
      toast.success("Check-out thành công");
      fetchAttendance(userId);
    } catch (err: any) {
      console.error("checkOut error:", err);
      toast.error(err?.response?.data?.message || "Không check-out được");
    } finally {
      setChecking(false);
    }
  };

  const canCheckIn = !todayRecord || !todayRecord.checkIn;
  const canCheckOut = !!todayRecord?.checkIn && !todayRecord?.checkOut;

  const statusLabel =
    todayRecord?.status === "late"
      ? "Đi muộn"
      : todayRecord?.status === "leave"
      ? "Nghỉ phép"
      : todayRecord?.status === "absent"
      ? "Vắng"
      : todayRecord
      ? "Có mặt"
      : "Chưa chấm công";

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Chấm công hôm nay</CardTitle>
            <CardDescription>
              Ngày {new Date().toLocaleDateString("vi-VN")}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Trạng thái:</span>
                <Badge
                  variant={
                    todayRecord?.status === "late"
                      ? "destructive"
                      : todayRecord
                      ? "outline"
                      : "secondary"
                  }
                >
                  {statusLabel}
                </Badge>
              </div>
              <div className="flex flex-col md:flex-row md:gap-6 text-sm text-muted-foreground">
                <span>Check-in: {formatDateTime(todayRecord?.checkIn)}</span>
                <span>Check-out: {formatDateTime(todayRecord?.checkOut)}</span>
                <span>
                  Giờ làm:{" "}
                  {todayRecord ? `${todayRecord.workHours.toFixed(2)} giờ` : "-"}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleCheckIn}
                disabled={!canCheckIn || checking || loading || !userId}
              >
                Check-in
              </Button>
              <Button
                variant="outline"
                onClick={handleCheckOut}
                disabled={!canCheckOut || checking || loading || !userId}
              >
                Check-out
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lịch sử chấm công gần đây</CardTitle>
            <CardDescription>14 ngày gần nhất</CardDescription>
          </CardHeader>
          <CardContent>
            {loading && <p>Đang tải dữ liệu...</p>}
            {!loading && history.length === 0 && (
              <p>Chưa có dữ liệu chấm công.</p>
            )}
            {!loading && history.length > 0 && (
              <div className="space-y-2">
                {history.map((a) => (
                  <div
                    key={a._id}
                    className="flex items-center justify-between border rounded-md px-3 py-2 text-sm"
                  >
                    <div>
                      <div className="font-medium">
                        {new Date(a.date).toLocaleDateString("vi-VN")}
                      </div>
                      <div className="text-muted-foreground flex gap-4">
                        <span>In: {formatDateTime(a.checkIn)}</span>
                        <span>Out: {formatDateTime(a.checkOut)}</span>
                        <span>Giờ làm: {a.workHours.toFixed(2)}</span>
                      </div>
                    </div>
                    <Badge
                      variant={
                        a.status === "late"
                          ? "destructive"
                          : a.status === "absent"
                          ? "outline"
                          : "secondary"
                      }
                    >
                      {a.status === "late"
                        ? "Đi muộn"
                        : a.status === "absent"
                        ? "Vắng"
                        : a.status === "leave"
                        ? "Nghỉ phép"
                        : "Có mặt"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
