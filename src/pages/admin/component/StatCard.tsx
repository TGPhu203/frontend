import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: LucideIcon;
  trend?: "up" | "down";
  variant?: "default" | "success" | "warning" | "primary";
}

export const StatCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  trend,
  variant = "default" 
}: StatCardProps) => {
  const variants = {
    default: "bg-card",
    success: "bg-gradient-success",
    warning: "bg-gradient-to-br from-warning/10 to-warning/5",
    primary: "bg-gradient-primary",
  };

  const iconVariants = {
    default: "text-primary",
    success: "text-success-foreground",
    warning: "text-warning",
    primary: "text-primary-foreground",
  };

  const textVariants = {
    default: "text-card-foreground",
    success: "text-success-foreground",
    warning: "text-card-foreground",
    primary: "text-primary-foreground",
  };

  return (
    <Card className={cn(
      "p-6 transition-all duration-300 hover:shadow-lg border-0",
      variants[variant]
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={cn(
            "text-sm font-medium mb-1 opacity-80",
            textVariants[variant]
          )}>
            {title}
          </p>
          <p className={cn(
            "text-3xl font-bold mb-2",
            textVariants[variant]
          )}>
            {value}
          </p>
          {change && (
            <p className={cn(
              "text-sm flex items-center gap-1",
              trend === "up" ? "text-success" : trend === "down" ? "text-destructive" : "",
              variant === "success" || variant === "primary" ? "text-white/90" : ""
            )}>
              {trend === "up" && "↑"}
              {trend === "down" && "↓"}
              {change}
            </p>
          )}
        </div>
        <div className={cn(
          "h-12 w-12 rounded-lg flex items-center justify-center",
          variant === "default" && "bg-primary/10",
          variant === "success" && "bg-success-foreground/20",
          variant === "warning" && "bg-warning/20",
          variant === "primary" && "bg-primary-foreground/20"
        )}>
          <Icon className={cn("h-6 w-6", iconVariants[variant])} />
        </div>
      </div>
    </Card>
  );
};
