import { getPriorityColor } from '@/lib/utils';
import Badge from './Badge';

export default function PriorityBadge({ level }: { level: string | null }) {
  if (!level) return <Badge className="bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">Unscored</Badge>;
  return <Badge className={getPriorityColor(level)}>{level}</Badge>;
}
