// src/pages/ProductReviews.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Star, ThumbsUp, ThumbsDown } from "lucide-react";
import { toast } from "sonner";
import { BASE_API } from "@/api/Api";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const BASE_REVIEW = `${BASE_API}/reviews`;

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
  images?: string[];
  isVerified?: boolean;
  likes?: number;
  dislikes?: number;
  createdAt: string;
};

type RatingCounts = {
  [key: number]: number;
};

type ReviewListResponse = {
  total: number;
  pages: number;
  currentPage: number;
  reviews: Review[];
  averageRating?: number;
  ratingCounts?: RatingCounts;
};

export default function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [avgRating, setAvgRating] = useState(0);
  const [ratingCounts, setRatingCounts] = useState<RatingCounts>({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  });

  // null = tất cả; 1–5 = lọc theo sao
  const [filterRating, setFilterRating] = useState<number | null>(null);

  const fetchReviews = async (
    pageParam = 1,
    ratingFilter: number | null = filterRating
  ) => {
    if (!productId) return;

    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: String(pageParam),
        limit: "5",
        sort: "newest",
      });

      if (ratingFilter) {
        params.append("rating", String(ratingFilter));
      }

      const res = await fetch(
        `${BASE_REVIEW}/product/${productId}?${params.toString()}`,
        { credentials: "include" }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Không tải được đánh giá");

      const data: ReviewListResponse = json.data;
      setReviews(data.reviews || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
      setPage(data.currentPage || pageParam);

      // thống kê chung
      const avg =
        typeof data.averageRating === "number" && !Number.isNaN(data.averageRating)
          ? data.averageRating
          : 0;
      setAvgRating(avg);

      if (data.ratingCounts) {
        setRatingCounts({
          1: data.ratingCounts[1] || 0,
          2: data.ratingCounts[2] || 0,
          3: data.ratingCounts[3] || 0,
          4: data.ratingCounts[4] || 0,
          5: data.ratingCounts[5] || 0,
        });
      } else {
        setRatingCounts({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
      }
    } catch (err: any) {
      toast.error(err.message || "Không tải được đánh giá sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(1, filterRating);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, filterRating]);

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

  const renderStars = (value: number, size = 14) => (
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

  const avgDisplay = avgRating ? avgRating.toFixed(1) : "0.0";
  const totalAll =
    ratingCounts[1] +
    ratingCounts[2] +
    ratingCounts[3] +
    ratingCounts[4] +
    ratingCounts[5];

  const handleChangeFilter = (value: string) => {
    if (value === "all") {
      setFilterRating(null);
    } else {
      setFilterRating(Number(value));
    }
  };
  // src/pages/ProductReviews.tsx

  const renderMedia = (url: string) => {
    const lower = url.toLowerCase();
    const isVideo = [".mp4", ".webm", ".ogg", ".mov", ".avi", ".wmv"].some((ext) =>
      lower.endsWith(ext)
    );

    if (isVideo) {
      return (
        <video
          key={url}
          src={url}
          controls
          className="h-24 w-32 rounded border object-cover"
        />
      );
    }

    return (
      <img
        key={url}
        src={url}
        alt="media"
        className="h-24 w-24 rounded border object-cover"
      />
    );
  };

  return (
    <div className="space-y-4">
      {/* Header + thống kê + dropdown filter */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-semibold">Đánh giá sản phẩm</h2>

          <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-semibold text-slate-900">
                {avgDisplay}
              </span>
              <span className="text-[11px] text-muted-foreground">/5</span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              {renderStars(Math.round(avgRating), 14)}
              <span className="text-[11px] text-muted-foreground">
                {totalAll} đánh giá
              </span>
            </div>
          </div>
        </div>

        {/* Dropdown lọc số sao */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Lọc theo số sao:</span>
          <Select
            value={filterRating === null ? "all" : String(filterRating)}
            onValueChange={handleChangeFilter}
          >
            <SelectTrigger className="h-8 w-40 text-xs">
              <SelectValue placeholder="Tất cả đánh giá" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                Tất cả ({totalAll})
              </SelectItem>
              {[5, 4, 3, 2, 1].map((stars) => (
                <SelectItem key={stars} value={String(stars)}>
                  {stars} sao ({ratingCounts[stars] || 0})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading && (
        <p className="text-xs text-muted-foreground">Đang tải đánh giá...</p>
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

          return (
            <Card
              key={r._id}
              className="border border-slate-200/80 bg-white shadow-none"
            >
              <CardContent className="p-3 md:p-4 text-sm">
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
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(r.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                    </div>

                    {r.title && (
                      <p className="text-sm font-semibold">{r.title}</p>
                    )}
                    {r.content && (
                      <p className="text-sm text-slate-700">{r.content}</p>
                    )}
                    {r.images && r.images.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {r.images.map((url) => renderMedia(url))}
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
              </CardContent>
            </Card>
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
  );
}
