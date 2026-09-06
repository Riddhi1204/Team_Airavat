import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outline';
}

export default function Badge({ children, className = '', variant = 'default' }: BadgeProps) {
  return (
    <span
      className={cn(
        'badge',
        variant === 'outline' && 'border border-current bg-transparent',
        className
      )}
    >
      {children}
    </span>
  );
}
