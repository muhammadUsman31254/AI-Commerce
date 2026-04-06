import PageHeader from "@/components/layout/PageHeader";
import OrderDetail from "@/components/orders/OrderDetail";

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <PageHeader title={`Order #${params.id.slice(-6)}`} subtitle="Order details and actions" />
      <OrderDetail orderId={params.id} />
    </div>
  );
}
