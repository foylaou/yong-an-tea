export const statusLabel: Record<string, string> = {
  pending: '待付款',
  paid: '已付款',
  processing: '處理中',
  shipped: '已出貨',
  completed: '已完成',
  cancelled: '已取消',
  refunded: '已退款',
};

const statusBadgeClass: Record<string, string> = {
  pending: 'badge-warning',
  paid: 'badge-info',
  processing: 'badge-primary',
  shipped: 'badge-secondary',
  completed: 'badge-success',
  cancelled: 'badge-ghost',
  refunded: 'badge-error',
};

export function OrderStatusBadge({ status }: { status: string }) {
  return (
    <span className={`badge badge-sm ${statusBadgeClass[status] || 'badge-ghost'}`}>
      {statusLabel[status] || status}
    </span>
  );
}
