"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import Header from "@/components/Header";
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
  User,
  Phone,
  Image as ImageIcon,
  Loader2,
  Save,
  Crown,
} from "lucide-react";
import AccountLayout from "./AccountLayout";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8888";

const PROFILE_ENDPOINT = `${API_BASE_URL}/api/users/profile`;
const UPLOAD_AVATAR_ENDPOINT = `${API_BASE_URL}/api/upload/users/single`; // 👈 dùng type = users

type LoyaltyTier = "none" | "silver" | "gold" | "diamond";

type UserProfile = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  avatar?: string; // luôn là URL đầy đủ
  totalSpent?: number;
  loyaltyTier?: LoyaltyTier;
  loyaltyPoints?: number;
};

// fallback tính bậc theo tổng chi tiêu (nếu backend chưa set)
const getTierFromSpent = (spent: number): LoyaltyTier => {
  if (spent >= 50_000_000) return "diamond";
  if (spent >= 20_000_000) return "gold";
  if (spent >= 5_000_000) return "silver";
  return "none";
};

const getTierDisplay = (tier: LoyaltyTier) => {
  switch (tier) {
    case "silver":
      return {
        label: "Thành viên Bạc",
        desc: "Giảm 2% trên mỗi đơn hàng đủ điều kiện.",
        badgeClass: "bg-slate-100 text-slate-800 border border-slate-200",
      };
    case "gold":
      return {
        label: "Thành viên Vàng",
        desc: "Giảm 5% + ưu tiên hỗ trợ khách hàng.",
        badgeClass: "bg-amber-100 text-amber-900 border border-amber-200",
      };
    case "diamond":
      return {
        label: "Thành viên Kim cương",
        desc: "Giảm 10% + ưu đãi đặc quyền dành riêng.",
        badgeClass: "bg-sky-100 text-sky-900 border border-sky-200",
      };
    default:
      return {
        label: "Khách hàng mới",
        desc: "Mua sắm thêm để nhận hạng thành viên và ưu đãi tích lũy.",
        badgeClass: "bg-muted text-muted-foreground border border-border",
      };
  }
};

// mốc tiếp theo để lên hạng
const getNextThreshold = (tier: LoyaltyTier): number | null => {
  switch (tier) {
    case "none":
      return 5_000_000;
    case "silver":
      return 20_000_000;
    case "gold":
      return 50_000_000;
    default:
      return null; // diamond: không còn mốc tiếp theo
  }
};

// chuẩn hoá URL avatar: nếu trả về dạng /uploads/... thì ghép thêm API_BASE_URL
const buildAvatarUrl = (raw?: string | null) => {
  if (!raw) return "";
  if (raw.startsWith("http")) return raw;
  return `${API_BASE_URL}${raw.startsWith("/") ? raw : `/${raw}`}`;
};

const ProfilePage = () => {
  const [profile, setProfile] = useState<UserProfile>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    avatar: "",
    totalSpent: 0,
    loyaltyTier: "none",
    loyaltyPoints: 0,
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.get(PROFILE_ENDPOINT, {
        withCredentials: true,
      });

      const data = res.data?.data as any;
      if (data) {
        const avatarUrl = buildAvatarUrl(data.avatar);

        setProfile({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          phone: data.phone || "",
          avatar: avatarUrl,
          totalSpent: data.totalSpent ?? 0,
          loyaltyTier: (data.loyaltyTier as LoyaltyTier) ?? "none",
          loyaltyPoints: data.loyaltyPoints ?? 0,
        });

        // CẬP NHẬT localStorage user để Header dùng avatar mới
        try {
          const raw = localStorage.getItem("user");
          if (raw) {
            const current = JSON.parse(raw);
            const updated = {
              ...current,
              firstName: data.firstName,
              lastName: data.lastName,
              fullName:
                `${data.firstName || ""} ${data.lastName || ""}`.trim() ||
                current.fullName,
              avatar: avatarUrl,
            };
            localStorage.setItem("user", JSON.stringify(updated));
          }
        } catch {
          // ignore
        }
      }
    } catch (err: any) {
      console.error("Error load profile:", err);
      toast.error(
        err?.response?.data?.message || "Không thể tải thông tin tài khoản"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange =
    (field: keyof UserProfile) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setProfile((prev) => ({ ...prev, [field]: e.target.value }));
      };

  const handleAvatarFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post(UPLOAD_AVATAR_ENDPOINT, formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const uploaded = res.data?.data;
      const rawUrl = uploaded?.url || uploaded?.path; // /uploads/users/xxx.jpg

      if (!rawUrl) {
        throw new Error("Không lấy được URL ảnh từ server");
      }

      const avatarUrl = buildAvatarUrl(rawUrl);

      // cập nhật state để preview
      setProfile((prev) => ({ ...prev, avatar: avatarUrl }));

      // đồng bộ localStorage ngay để Header thấy luôn
      try {
        const rawUser = localStorage.getItem("user");
        if (rawUser) {
          const current = JSON.parse(rawUser);
          const updated = {
            ...current,
            avatar: avatarUrl,
          };
          localStorage.setItem("user", JSON.stringify(updated));
        }
      } catch {
        // ignore
      }

      toast.success("Tải ảnh thành công, hãy bấm Lưu để cập nhật hồ sơ");
    } catch (err: any) {
      console.error("Error upload avatar:", err);
      toast.error(
        err?.response?.data?.message || "Không thể tải ảnh lên máy chủ"
      );
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);

      await axios.put(
        PROFILE_ENDPOINT,
        {
          firstName: profile.firstName,
          lastName: profile.lastName,
          phone: profile.phone,
          avatar: profile.avatar, // lưu full URL luôn
        },
        { withCredentials: true }
      );

      // đồng bộ localStorage để Header dùng
      try {
        const rawUser = localStorage.getItem("user");
        if (rawUser) {
          const current = JSON.parse(rawUser);
          const updated = {
            ...current,
            firstName: profile.firstName,
            lastName: profile.lastName,
            fullName:
              `${profile.firstName || ""} ${profile.lastName || ""}`.trim() ||
              current.fullName,
            avatar: profile.avatar,
          };
          localStorage.setItem("user", JSON.stringify(updated));
        }
      } catch {
        // ignore
      }

      toast.success("Cập nhật hồ sơ thành công");
      loadProfile();
    } catch (err: any) {
      console.error("Error update profile:", err);
      toast.error(
        err?.response?.data?.message ||
        "Không thể cập nhật thông tin tài khoản"
      );
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const totalSpent = profile.totalSpent ?? 0;
  const tier: LoyaltyTier = getTierFromSpent(totalSpent);
  const { label: tierLabel, desc: tierDesc, badgeClass } = getTierDisplay(tier);
  const nextThreshold = getNextThreshold(tier);
  const missing =
    nextThreshold != null ? Math.max(nextThreshold - totalSpent, 0) : 0;

  return (
    <AccountLayout>
      <div className="max-w-3xl mx-auto p-4 md:p-1">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Thông tin cá nhân
            </CardTitle>
            <CardDescription>
              Cập nhật thông tin hồ sơ của bạn và xem hạng thành viên hiện tại.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang tải thông tin...
              </div>
            ) : (
              <>
                {/* Hạng thành viên */}
                <div className="mb-6 rounded-lg border bg-muted/40 px-4 py-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Crown className="h-4 w-4 text-yellow-500" />
                      <p className="text-sm font-semibold">
                        Hạng thành viên: {tierLabel}
                      </p>
                    </div>
                    <Badge
                      className={`px-3 py-1 text-xs font-medium rounded-full ${badgeClass}`}
                    >
                      {tierLabel}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground">{tierDesc}</p>

                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    <span>
                      Tổng chi tiêu:{" "}
                      <span className="font-semibold text-foreground">
                        ₫{totalSpent.toLocaleString("vi-VN")}
                      </span>
                    </span>
                    {profile.loyaltyPoints != null && (
                      <span>
                        Điểm tích lũy:{" "}
                        <span className="font-semibold text-foreground">
                          {profile.loyaltyPoints}
                        </span>
                      </span>
                    )}
                  </div>

                  {nextThreshold != null && missing > 0 && (
                    <p className="text-[11px] text-muted-foreground">
                      Bạn cần mua thêm{" "}
                      <span className="font-semibold text-foreground">
                        ₫{missing.toLocaleString("vi-VN")}
                      </span>{" "}
                      để lên hạng tiếp theo.
                    </p>
                  )}
                  {tier === "diamond" && (
                    <p className="text-[11px] text-muted-foreground">
                      Bạn đang ở hạng cao nhất hiện tại.
                    </p>
                  )}
                </div>

                {/* Form */}
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="firstName">Họ</Label>
                      <Input
                        id="firstName"
                        placeholder="Nhập họ"
                        value={profile.firstName || ""}
                        onChange={handleChange("firstName")}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="lastName">Tên</Label>
                      <Input
                        id="lastName"
                        placeholder="Nhập tên"
                        value={profile.lastName || ""}
                        onChange={handleChange("lastName")}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={profile.email || ""}
                      disabled
                      className="bg-muted cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        placeholder="Nhập số điện thoại"
                        value={profile.phone || ""}
                        onChange={handleChange("phone")}
                      />
                    </div>
                  </div>

                  {/* Avatar */}
                  <div className="space-y-2">
                    <Label>Ảnh đại diện</Label>
                    <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                      <div className="flex items-center gap-3">
                        {profile.avatar ? (
                          <img
                            src={profile.avatar}
                            alt="avatar preview"
                            className="h-16 w-16 rounded-full object-cover border"
                          />
                        ) : (
                          <div className="h-16 w-16 rounded-full border flex items-center justify-center text-muted-foreground">
                            <ImageIcon className="h-6 w-6" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarFileChange}
                          />
                          {uploading && (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Chọn ảnh để tải lên. Sau khi tải xong, nhấn &quot;Lưu
                          thay đổi&quot; để cập nhật hồ sơ.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Đang lưu...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Lưu thay đổi
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AccountLayout>

  );
};

export default ProfilePage;
