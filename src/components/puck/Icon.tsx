import { renderReactIcon } from '@/lib/puck/ionicons';

interface IconProps {
  type: string;
  size?: number;
  className?: string;
}

export function Icon({ type, size = 24, className }: IconProps) {
  const icon = renderReactIcon(type, size);
  if (!icon) return null;
  return <span className={className}>{icon}</span>;
}
