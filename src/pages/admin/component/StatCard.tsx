import { Card } from "@/components/ui/card";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";

export type StatCardVariant = "primary" | "success" | "default";

export interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  trend?: "up" | "down";
  variant?: StatCardVariant;
  loading?: boolean;
}

export const StatCard = ({
  title,
  value,
  change,
  icon: Icon,
  trend = "up",
  variant = "default",
  loading = false,
}: StatCardProps) => {
  // màu tổng thể theo variant
  const baseClasses =
    "relative overflow-hidden rounded-2xl transition-transform duration-200 hover:-translate-y-0.5";

  const variantClasses: Record<StatCardVariant, string> = {
    primary:
      "border-0 shadow-lg bg-gradient-to-r from-primary to-indigo-500 text-primary-foreground",
    success:
      "border-0 shadow-lg bg-gradient-to-r from-success to-emerald-500 text-success-foreground",
    default:
      "border border-border bg-card text-card-foreground shadow-sm",
  };

  // màu icon nền tròn
  const iconWrapperClasses: Record<StatCardVariant, string> = {
    primary: "bg-white/20 text-primary-foreground",
    success: "bg-white/25 text-success-foreground",
    default: "bg-primary/10 text-primary",
  };

  // màu dòng change
  const changeTextClasses: Record<StatCardVariant, string> = {
    primary: "text-primary-foreground/80",
    success: "text-success-foreground/80",
    default:
      trend === "up"
        ? "text-success"
        : trend === "down"
        ? "text-destructive"
        : "text-muted-foreground",
  };

  if (loading) {
    return (
      <Card
        className={`${baseClasses} ${variantClasses[variant]} animate-pulse`}
      >
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-4 w-24 rounded-full bg-white/30 md:bg-muted" />
            <div
              className={`h-9 w-9 rounded-xl ${
                variant === "default" ? "bg-muted" : "bg-white/25"
              }`}
            />
          </div>
          <div className="h-7 w-20 rounded-full bg-white/40 md:bg-muted" />
          <div className="h-3 w-32 rounded-full bg-white/30 md:bg-muted" />
        </div>
      </Card>
    );
  }

  return (
    <Card className={`${baseClasses} ${variantClasses[variant]}`}>
      {/* hiệu ứng sáng nhẹ khi là gradient */}
      {(variant === "primary" || variant === "success") && (
        <div className="pointer-events-none absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,_#fff_0,_transparent_55%)]" />
      )}

      <div className="relative p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide opacity-80">
              {title}
            </p>
          </div>
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconWrapperClasses[variant]}`}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-3xl font-semibold leading-tight">{value}</p>
          <div className="flex items-center gap-1 text-xs">
            {trend === "up" && (
              <ArrowUpRight
                className={`h-4 w-4 ${
                  variant === "default" ? "text-success" : "text-white"
                }`}
              />
            )}
            {trend === "down" && (
              <ArrowDownRight
                className={`h-4 w-4 ${
                  variant === "default" ? "text-destructive" : "text-white"
                }`}
              />
            )}
            <span className={changeTextClasses[variant]}>{change}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
