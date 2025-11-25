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

import { User, Phone, Image as ImageIcon, Loader2, Save, Upload } from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8888";

// endpoint profile (GET + PUT) – sửa lại cho đúng backend của bạn
const PROFILE_ENDPOINT = `${API_BASE_URL}/api/users/profile`;
// endpoint upload avatar – dựa trên router bạn gửi: /:type/single
const UPLOAD_AVATAR_ENDPOINT = `${API_BASE_URL}/api/upload/avatar/single`;

type UserProfile = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
};

const ProfilePage = () => {
  const [profile, setProfile] = useState<UserProfile>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    avatar: "",
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

      const data = res.data?.data as UserProfile;
      if (data) {
        setProfile({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          phone: data.phone || "",
          avatar: data.avatar || "",
        });
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

  // UPLOAD AVATAR
  const handleAvatarFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post(
        UPLOAD_AVATAR_ENDPOINT,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // TÙY RESPONSE BACKEND – chỉnh chỗ này cho đúng:
      // ví dụ: { status: 'success', data: { url: '...', path: '...' } }
      const uploaded = res.data?.data;
      const avatarUrl = uploaded?.url || uploaded?.path;

      if (!avatarUrl) {
        throw new Error("Không lấy được URL ảnh từ server");
      }

      setProfile((prev) => ({ ...prev, avatar: avatarUrl }));
      toast.success("Tải ảnh thành công, hãy bấm Lưu để cập nhật hồ sơ");
    } catch (err: any) {
      console.error("Error upload avatar:", err);
      toast.error(
        err?.response?.data?.message || "Không thể tải ảnh lên máy chủ"
      );
    } finally {
      setUploading(false);
      // reset input cho phép chọn lại cùng file
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
          avatar: profile.avatar, // đã có URL từ upload
        },
        { withCredentials: true }
      );

      toast.success("Cập nhật hồ sơ thành công");
      loadProfile();
    } catch (err: any) {
      console.error("Error update profile:", err);
      toast.error(
        err?.response?.data?.message || "Không thể cập nhật thông tin tài khoản"
      );
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
    <div className="max-w-2xl mx-auto p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Thông tin cá nhân
          </CardTitle>
          <CardDescription>
            Cập nhật thông tin hồ sơ của bạn: họ tên, số điện thoại, avatar.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang tải thông tin...
            </div>
          ) : (
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

              {/* AVATAR: upload + preview */}
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
                    {/* Nếu bạn vẫn muốn cho phép sửa URL thủ công: */}
                    {/* 
                    <Input
                      placeholder="Hoặc nhập URL ảnh..."
                      value={profile.avatar || ""}
                      onChange={handleChange("avatar")}
                    />
                    */}
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
          )}
        </CardContent>
      </Card>
    </div>
    </div>
  );
};

export default ProfilePage;
