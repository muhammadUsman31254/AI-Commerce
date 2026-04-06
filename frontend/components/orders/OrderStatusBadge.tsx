import Badge from "@/components/ui/Badge";
import { getOrderStatusVariant } from "@/lib/utils";

export default function OrderStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={getOrderStatusVariant(status)}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
