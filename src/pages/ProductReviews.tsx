"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Star, ThumbsUp, ThumbsDown } from "lucide-react";
import { toast } from "sonner";

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
  content: string;
  images?: string[];
  likes: number;
  dislikes: number;
  isVerified: boolean;
  createdAt: string;
};

type ProductReviewsProps = {
  productId: string;
};

const API_BASE = "http://localhost:8888/api";

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [sort, setSort] = useState<"newest" | "highest_rating" | "lowest_rating">(
    "newest"
  );
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // form tạo review
  const [formRating, setFormRating] = useState<number>(5);
  const [formTitle, setFormTitle] = useState("");
  const [formComment, setFormComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("limit", "10");
      params.append("sort", sort);
      if (ratingFilter) params.append("rating", String(ratingFilter));

      const res = await fetch(
        `${API_BASE}/reviews/product/${productId}?${params.toString()}`,
        { credentials: "include" }
      );

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Không thể tải đánh giá");
      }

      const data = json.data;
      setReviews(data.reviews || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi tải đánh giá");
      setReviews([]);
      setTotal(0);
      setPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sort, ratingFilter, productId]);

  const handleSubmitReview = async () => {
    if (!formComment.trim()) {
      toast.error("Vui lòng nhập nội dung đánh giá");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/reviews`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          rating: formRating,
          title: formTitle,
          comment: formComment,
          images: [],
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Không thể gửi đánh giá");
      }

      toast.success("Đã gửi đánh giá");
      setFormRating(5);
      setFormTitle("");
      setFormComment("");
      setPage(1);
      fetchReviews();
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi gửi đánh giá");
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpful = async (reviewId: string, helpful: boolean) => {
    try {
      const res = await fetch(`${API_BASE}/reviews/${reviewId}/helpful`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ helpful }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Không thể gửi đánh giá hữu ích");
      }

      const { likes, dislikes } = json.data;
      setReviews((prev) =>
        prev.map((r) => (r._id === reviewId ? { ...r, likes, dislikes } : r))
      );
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi đánh dấu hữu ích");
    }
  };

  const avgRating =
    total > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length || 0
      : 0;

  const renderStars = (value: number, size: "lg" | "sm" = "sm") =>
    Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={
          size === "lg"
            ? `h-5 w-5 ${
                i < Math.round(value)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground"
              }`
            : `h-4 w-4 ${
                i < value
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground"
              }`
        }
      />
    ));

  return (
    <div className="space-y-6 mt-10">
      {/* Tổng quan rating + form tạo review */}
      <Card className="border-border/70 bg-card/80 p-4 md:p-6 rounded-xl shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          {/* Tổng quan rating */}
          <div className="flex-1 space-y-3">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-primary/80">
              Đánh giá & nhận xét
            </p>

            <div className="flex items-center gap-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-semibold">
                  {avgRating.toFixed(1)}
                </span>
                <span className="text-sm text-muted-foreground">/5</span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1">
                  {renderStars(avgRating, "lg")}
                </div>
                <span className="text-xs text-muted-foreground">
                  Dựa trên {total} đánh giá
                </span>
              </div>
            </div>

            {/* Bộ lọc nhỏ */}
            <div className="flex flex-wrap gap-2 pt-2">
              <Select
                value={sort}
                onValueChange={(v: any) => setSort(v)}
              >
                <SelectTrigger className="w-40 h-9 text-xs">
                  <SelectValue placeholder="Sắp xếp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Mới nhất</SelectItem>
                  <SelectItem value="highest_rating">Điểm cao nhất</SelectItem>
                  <SelectItem value="lowest_rating">Điểm thấp nhất</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={ratingFilter ? String(ratingFilter) : "all"}
                onValueChange={(v) => setRatingFilter(v === "all" ? null : Number(v))}
              >
                <SelectTrigger className="w-32 h-9 text-xs">
                  <SelectValue placeholder="Lọc điểm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="5">5 sao</SelectItem>
                  <SelectItem value="4">4 sao</SelectItem>
                  <SelectItem value="3">3 sao</SelectItem>
                  <SelectItem value="2">2 sao</SelectItem>
                  <SelectItem value="1">1 sao</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Form viết đánh giá */}
          <div className="w-full md:w-[360px] rounded-lg border bg-background/60 p-4 space-y-3">
            <p className="font-semibold text-sm">Viết đánh giá của bạn</p>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Chọn số sao:</span>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setFormRating(i + 1)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-5 w-5 ${
                        i < formRating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                {formRating}/5
              </span>
            </div>

            <Input
              placeholder="Tiêu đề (tuỳ chọn)"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="text-sm"
            />

            <Textarea
              placeholder="Chia sẻ trải nghiệm thực tế của bạn về sản phẩm..."
              value={formComment}
              onChange={(e) => setFormComment(e.target.value)}
              rows={3}
              className="text-sm resize-none"
            />

            <div className="flex justify-end">
              <Button
                size="sm"
                className="px-4"
                onClick={handleSubmitReview}
                disabled={submitting}
              >
                {submitting ? "Đang gửi..." : "Gửi đánh giá"}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Danh sách review */}
      <Card className="border-border/70 bg-card/80 p-4 md:p-6 rounded-xl shadow-sm">
        {loading ? (
          <div className="text-sm text-muted-foreground">
            Đang tải đánh giá...
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên chia sẻ
            trải nghiệm của bạn.
          </div>
        ) : (
          <div className="space-y-5">
            {reviews.map((r) => {
              const fullName =
                `${r.userId?.firstName || ""} ${r.userId?.lastName || ""}`.trim() ||
                "Người dùng ẩn danh";
              const created = new Date(r.createdAt).toLocaleString("vi-VN");
              const initials = fullName
                .split(" ")
                .filter(Boolean)
                .slice(-2)
                .map((s) => s[0]?.toUpperCase())
                .join("");

              return (
                <div
                  key={r._id}
                  className="border-b border-border/60 pb-4 last:border-b-0 last:pb-0"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                      {initials || "U"}
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-sm">{fullName}</span>
                        {r.isVerified && (
                          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                            Đã mua hàng
                          </span>
                        )}
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-0.5">
                          {renderStars(r.rating)}
                        </div>
                        <span className="text-[11px] text-muted-foreground">
                          {created}
                        </span>
                      </div>

                      {r.title && (
                        <p className="mt-2 text-sm font-medium">{r.title}</p>
                      )}

                      <p className="mt-1 text-sm text-card-foreground leading-relaxed">
                        {r.content}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span>Đánh giá này có hữu ích không?</span>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 rounded-full border border-transparent px-2 py-1 hover:border-border hover:text-foreground"
                          onClick={() => handleHelpful(r._id, true)}
                        >
                          <ThumbsUp className="h-3.5 w-3.5" />
                          <span>Hữu ích ({r.likes})</span>
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 rounded-full border border-transparent px-2 py-1 hover:border-border hover:text-foreground"
                          onClick={() => handleHelpful(r._id, false)}
                        >
                          <ThumbsDown className="h-3.5 w-3.5" />
                          <span>Không hữu ích ({r.dislikes})</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {pages > 1 && (
              <div className="mt-2 flex items-center justify-between border-t border-border/60 pt-4">
                <span className="text-[11px] text-muted-foreground">
                  Trang {page} / {pages}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 text-xs"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Trước
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 text-xs"
                    disabled={page >= pages}
                    onClick={() => setPage((p) => Math.min(pages, p + 1))}
                  >
                    Sau
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
