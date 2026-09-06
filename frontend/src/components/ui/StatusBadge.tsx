import { getStatusColor } from '@/lib/utils';
import Badge from './Badge';

export default function StatusBadge({ status }: { status: string }) {
  const label = status.replace(/_/g, ' ');
  return <Badge className={getStatusColor(status)}>{label}</Badge>;
}
