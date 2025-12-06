// src/pages/ProductReviewPage.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Star, ThumbsUp, ThumbsDown, ArrowLeft, Upload, X, } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BASE_API } from "@/api/Api";
import AccountLayout from "./AccountLayout";

const BASE_REVIEW = `${BASE_API}/reviews`;
const API_HOST = BASE_API.replace(/\/api\/?$/, "");
type ReviewUser = {
  _id: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
};

type Review = {
  _id: string;
  productId: string;
  userId: ReviewUser;
  rating: number;
  title?: string;
  content?: string;
  images?: string[]; // chứa cả ảnh + video (url)
  isVerified?: boolean;
  likes?: number;
  dislikes?: number;
  createdAt: string;
};

type ReviewListResponse = {
  total: number;
  pages: number;
  currentPage: number;
  reviews: Review[];
};

export default function ProductReviewPage() {
  const { productId } = useParams<{ productId: string }>();
  const location = useLocation();
  const productName = (location.state as any)?.productName as
    | string
    | undefined;

  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // form
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // media upload
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const rawUser =
    typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const user = rawUser ? JSON.parse(rawUser) : null;
  const currentUserId: string | null =
    (user && (user._id || user.id || user.userId || user?.user?._id)) || null;
  if (!productId) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center text-sm text-red-500">
          Thiếu productId trong URL.
        </main>
        <Footer />
      </div>
    );
  }

  const fetchReviews = async (pageParam = 1) => {
    try {
      setLoading(true);
      const res = await fetch(
        `${BASE_REVIEW}/product/${productId}?page=${pageParam}&limit=10&sort=newest`,
        { credentials: "include" }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Không tải được đánh giá");

      const data: ReviewListResponse = json.data;
      setReviews(data.reviews || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
      setPage(data.currentPage || pageParam);
    } catch (err: any) {
      toast.error(err.message || "Không tải được đánh giá sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(1);
  }, [productId]);
  const handleFilesChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (!files.length) return;

    try {
      setUploading(true);

      const formData = new FormData();
      files.forEach((f) => {
        formData.append("files", f);
      });

      const res = await fetch(`${BASE_API}/upload/reviews/multiple`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Upload file thất bại");

      const uploaded = (json.data?.files || []) as { url: string }[];

      const urls = uploaded.map((f) =>
        f.url.startsWith("http") ? f.url : `${API_HOST}${f.url}` // 👈 dùng API_HOST
      );

      setMediaUrls((prev) => [...prev, ...urls]);
      toast.success(`Đã upload ${uploaded.length} file`);
    } catch (err: any) {
      toast.error(err.message || "Không upload được file");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };
  const handleRemoveMedia = (index: number) => {
    setMediaUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const resolveMediaUrl = (url: string) => {
    if (!url) return "";
    return url.startsWith("http") ? url : `${API_HOST}${url}`; // 👈
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) {
      toast.error("Vui lòng chọn số sao");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(BASE_REVIEW, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          productId,
          rating,
          title,
          comment,
          // lưu cả ảnh + video trong trường images
          images: mediaUrls,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Không gửi được đánh giá");

      toast.success("Gửi đánh giá thành công");
      setTitle("");
      setComment("");
      setRating(5);
      setHoverRating(null);
      setMediaUrls([]);
      fetchReviews(1);
    } catch (err: any) {
      toast.error(err.message || "Không gửi được đánh giá");
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpful = async (reviewId: string, helpful: boolean) => {
    try {
      const res = await fetch(`${BASE_REVIEW}/${reviewId}/helpful`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ helpful }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Không xử lý được yêu cầu");

      const { likes, dislikes } = json.data;
      setReviews((prev) =>
        prev.map((r) =>
          r._id === reviewId ? { ...r, likes, dislikes } : r
        )
      );
    } catch (err: any) {
      toast.error(err.message || "Không đánh dấu được đánh giá");
    }
  };
  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa đánh giá này?")) return;

    try {
      const res = await fetch(`${BASE_REVIEW}/${reviewId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Không xóa được đánh giá");

      toast.success("Đã xóa đánh giá");

      // cập nhật lại list + thống kê
      fetchReviews(1);
    } catch (err: any) {
      toast.error(err.message || "Không xóa được đánh giá");
    }
  };

  const renderStars = (value: number, size = 16) => (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, idx) => {
        const v = idx + 1;
        const filled = v <= value;
        return (
          <Star
            key={idx}
            className={filled ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}
            style={{ width: size, height: size }}
          />
        );
      })}
    </div>
  );

  const currentDisplayRating = hoverRating ?? rating;

  const renderMediaPreview = (
    rawUrl: string,
    options?: { removable?: boolean; onRemove?: () => void; key?: string | number }
  ) => {
    const url = resolveMediaUrl(rawUrl);
    const lower = url.toLowerCase();
    const isVideo = [".mp4", ".webm", ".ogg", ".mov", ".avi", ".wmv"].some(
      (ext) => lower.endsWith(ext)
    );

    const key = options?.key ?? url;

    return (
      <div key={key} className="relative inline-block">
        {isVideo ? (
          <video
            src={url}
            controls
            className="h-24 w-32 rounded border object-cover"
          />
        ) : (
          <img
            src={url}
            alt="attachment"
            className="h-24 w-24 rounded border object-cover"
          />
        )}

        {options?.removable && (
          <button
            type="button"
            onClick={options.onRemove}
            className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-[10px] text-white hover:bg-black"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    );
  };


  return (
    <AccountLayout>
      <div className="min-h-screen flex flex-col bg-slate-50">
        <main className="flex-1">
          <div className="mx-auto max-w-5xl px-4 py-6">
            <div className="mb-4 flex items-center justify-between gap-2">
              <div>
                <h1 className="text-lg font-semibold">Đánh giá sản phẩm</h1>
                {productName && (
                  <p className="text-sm text-muted-foreground">{productName}</p>
                )}
              </div>
              <Link to={`/products/${productId}`}>
                <Button variant="outline" size="sm" className="text-xs">
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Quay lại sản phẩm
                </Button>
              </Link>
            </div>

            <Card className="border border-slate-200">
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  Viết đánh giá của bạn
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* FORM */}
                <div className="rounded-lg border border-slate-200/80 bg-slate-50 p-4">
                  {user ? (
                    <form onSubmit={handleSubmit} className="space-y-3">
                      <p className="text-sm font-medium text-slate-800">
                        Hãy chia sẻ cảm nhận sau khi sử dụng sản phẩm.
                      </p>

                      {/* Rating */}
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">
                          Đánh giá tổng quan
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, idx) => {
                              const v = idx + 1;
                              const filled = v <= currentDisplayRating;
                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  onMouseEnter={() => setHoverRating(v)}
                                  onMouseLeave={() => setHoverRating(null)}
                                  onClick={() => setRating(v)}
                                  className="p-0.5"
                                >
                                  <Star
                                    className={
                                      filled
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-slate-300"
                                    }
                                    style={{ width: 22, height: 22 }}
                                  />
                                </button>
                              );
                            })}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {currentDisplayRating}/5
                          </span>
                        </div>
                      </div>

                      <Input
                        placeholder="Tiêu đề đánh giá"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />

                      <Textarea
                        placeholder="Chia sẻ chi tiết trải nghiệm sử dụng..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={4}
                      />

                      {/* Upload ảnh/video */}
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">
                          Ảnh / video minh họa (tối đa 5 file, 50MB mỗi file)
                        </p>
                        <div className="flex flex-wrap items-center gap-3">
                          <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*,video/*"
                            className="hidden"
                            onChange={handleFilesChange}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                          >
                            <Upload className="mr-1 h-4 w-4" />
                            {uploading ? "Đang upload..." : "Chọn file"}
                          </Button>
                        </div>
                        {mediaUrls.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {mediaUrls.map((url, idx) =>
                              renderMediaPreview(url, {
                                removable: true,
                                onRemove: () => handleRemoveMedia(idx),
                                key: idx,
                              })
                            )}
                          </div>
                        )}

                      </div>

                      <div className="flex items-center justify-end">
                        <Button
                          type="submit"
                          size="sm"
                          className="text-xs"
                          disabled={submitting || uploading}
                        >
                          {submitting ? "Đang gửi..." : "Gửi đánh giá"}
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Vui lòng đăng nhập để viết đánh giá.
                    </p>
                  )}
                </div>

                {/* LIST REVIEW */}
                <div className="space-y-4">
                  {loading && (
                    <p className="text-xs text-muted-foreground">
                      Đang tải đánh giá...
                    </p>
                  )}

                  {!loading && reviews.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Chưa có đánh giá nào cho sản phẩm này.
                    </p>
                  )}

                  {!loading &&
                    reviews.map((r) => {
                      const fullName =
                        (r.userId?.firstName || "") +
                        (r.userId?.lastName ? ` ${r.userId.lastName}` : "");
                      const initials =
                        (r.userId?.firstName?.[0] || "") +
                        (r.userId?.lastName?.[0] || "");
                      const isOwner =
                        !!currentUserId && r.userId && String(r.userId._id) === String(currentUserId);

                      return (
                        <div
                          key={r._id}
                          className="rounded-lg border border-slate-200/80 bg-white p-3 text-sm"
                        >
                          <div className="flex gap-3">
                            <Avatar className="h-9 w-9">
                              {r.userId?.avatar && (
                                <AvatarImage src={r.userId.avatar} alt={fullName} />
                              )}
                              <AvatarFallback className="text-xs">
                                {initials || "U"}
                              </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                <div className="space-y-0.5">
                                  <p className="text-sm font-medium">
                                    {fullName || "Người dùng"}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    {renderStars(r.rating)}
                                    {r.isVerified && (
                                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                                        Đã mua tại cửa hàng
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {isOwner && (
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteReview(r._id)}
                                      className="text-[11px] text-red-500 hover:underline"
                                    >
                                      Xóa đánh giá
                                    </button>
                                  )}
                                  <span className="text-[11px] text-muted-foreground">
                                    {new Date(r.createdAt).toLocaleDateString("vi-VN")}
                                  </span>
                                </div>
                            
                              </div>

                              {r.title && (
                                <p className="text-sm font-semibold">{r.title}</p>
                              )}
                              {r.content && (
                                <p className="text-sm text-slate-700">{r.content}</p>
                              )}

                              {/* media của review */}
                              {r.images && r.images.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {r.images.map((url, idx) =>
                                    renderMediaPreview(url, { key: `${r._id}-${idx}` })
                                  )}
                                </div>
                              )}


                              <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
                                <button
                                  type="button"
                                  className="inline-flex items-center gap-1 hover:text-emerald-600"
                                  onClick={() => handleHelpful(r._id, true)}
                                >
                                  <ThumbsUp className="h-3.5 w-3.5" />
                                  <span>Hữu ích</span>
                                  <span className="text-[10px] text-slate-500">
                                    {r.likes || 0}
                                  </span>
                                </button>

                                <button
                                  type="button"
                                  className="inline-flex items-center gap-1 hover:text-red-500"
                                  onClick={() => handleHelpful(r._id, false)}
                                >
                                  <ThumbsDown className="h-3.5 w-3.5" />
                                  <span>Không hữu ích</span>
                                  <span className="text-[10px] text-slate-500">
                                    {r.dislikes || 0}
                                  </span>
                                </button>
                              </div>
                              
                            </div>
                          </div>
                        </div>
                      );
                    })}

                  {pages > 1 && (
                    <div className="flex items-center justify-center gap-2 text-xs">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page <= 1 || loading}
                        onClick={() => fetchReviews(page - 1)}
                      >
                        Trang trước
                      </Button>
                      <span className="text-muted-foreground">
                        Trang {page}/{pages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= pages || loading}
                        onClick={() => fetchReviews(page + 1)}
                      >
                        Trang sau
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </AccountLayout>
  );
}
