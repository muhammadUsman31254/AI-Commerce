import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon?: string;
  variant?: "default" | "warning";
}

export default function StatsCard({ title, value, change, icon, variant = "default" }: StatsCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className={cn("text-2xl font-bold mt-1", variant === "warning" ? "text-amber-600" : "text-gray-900")}>
            {value}
          </p>
          {change && <p className="text-xs text-green-600 mt-1">{change}</p>}
        </div>
        {icon && (
          <span className="text-2xl opacity-60">{icon}</span>
        )}
      </div>
    </Card>
  );
}
