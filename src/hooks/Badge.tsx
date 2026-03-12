import React from 'react';

// 定義顏色類型
type ColorType = 'neutral' | 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error';

// 定義 Badge 組件的屬性類型
interface BadgeProps {
  data: string; // 要顯示的資料
  separator?: string; // 分隔符號，預設為 ';'
  style?: 'outline' | 'dash' | 'soft' | 'ghost' | 'default'; // 樣式
  color?: ColorType | 'random'; // 顏色
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'; // 大小
  isRandom?: boolean; // 是否隨機顏色
  fixedColor?: string; // 固定顏色（優先級最高）
  className?: string; // 額外的 CSS 類名
  containerClassName?: string; // 容器的 CSS 類名
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg'; // 間距
  wrap?: boolean; // 是否換行
  showIcon?: boolean; // 是否顯示圖標
  onBadgeClick?: (item: string, index: number) => void; // Badge 點擊事件
  removable?: boolean; // 是否可移除
  onRemove?: (item: string, index: number) => void; // 移除事件
}

// 顏色映射
const colorClasses: Record<ColorType, string> = {
  neutral: 'badge-neutral',
  primary: 'badge-primary',
  secondary: 'badge-secondary',
  accent: 'badge-accent',
  info: 'badge-info',
  success: 'badge-success',
  warning: 'badge-warning',
  error: 'badge-error'
};

// 隨機顏色池
const randomColors: ColorType[] = ['neutral', 'primary', 'secondary', 'accent', 'info', 'success', 'warning', 'error'];

// 樣式映射
const styleClasses = {
  outline: 'badge-outline',
  dash: 'badge-dash',
  soft: 'badge-soft',
  ghost: 'badge-ghost',
  default: ''
};

// 大小映射
const sizeClasses = {
  xs: 'badge-xs',
  sm: 'badge-sm',
  md: 'badge-md',
  lg: 'badge-lg',
  xl: 'badge-xl'
};

// 間距映射
const gapClasses = {
  none: 'gap-0',
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-3',
  lg: 'gap-4'
};

// 圖標映射
const iconMap: Record<string, string> = {
  '火災': '🔥',
  '爆炸': '💥',
  '管線腐蝕': '🔧',
  '死傷': '⚠️',
  '洩漏': '💧',
  '墜落': '⬇️',
  '化學': '🧪',
  '電氣': '⚡',
  '機械': '⚙️',
  '交通': '🚗',
  '環境': '🌍',
  '其他': '📋'
};

// 獲取隨機顏色
const getRandomColor = (item: string, index: number): ColorType => {
  // 使用項目內容和索引作為種子，確保相同內容總是得到相同顏色
  const seed = item.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + index;
  return randomColors[seed % randomColors.length];
};

// 主要 Badge 組件
const Badge: React.FC<BadgeProps> = ({
  data,
  separator = ';',
  style = 'default',
  color = 'neutral',
  size = 'sm',
  isRandom = false,
  fixedColor,
  className = '',
  containerClassName = '',
  gap = 'xs',
  wrap = true,
  showIcon = false,
  onBadgeClick,
  removable = false,
  onRemove
}) => {
  // 如果沒有資料，返回 null
  if (!data) return null;

  // 分割資料
  const items = data.split(separator).filter(item => item.trim());

  // 獲取 Badge 顏色
  const getBadgeColor = (item: string, index: number): string => {
    if (fixedColor) return fixedColor;
    if (isRandom || color === 'random') {
      return colorClasses[getRandomColor(item, index)];
    }
    return colorClasses[color as ColorType] || colorClasses.neutral;
  };

  // 獲取圖標
  const getIcon = (item: string): string => {
    return iconMap[item.trim()] || '';
  };

  // 構建容器類名
  const containerClasses = `
    flex items-center
    ${wrap ? 'flex-wrap' : 'flex-nowrap'}
    ${gapClasses[gap]}
    ${containerClassName}
  `.trim();

  // 構建基礎 Badge 類名
  const baseClasses = `
    badge
    ${sizeClasses[size]}
    ${styleClasses[style]}
    ${className}
  `.trim();

  return (
    <div className={containerClasses}>
      {items.map((item, index) => {
        const trimmedItem = item.trim();
        const badgeColorClass = getBadgeColor(trimmedItem, index);
        const icon = showIcon ? getIcon(trimmedItem) : '';

        return (
          <div
            key={`${trimmedItem}-${index}`}
            className={`${baseClasses} ${badgeColorClass} ${onBadgeClick ? 'm-1 cursor-pointer hover:scale-105' : ''} ${removable ? 'gap-1' : ''}`}
            onClick={() => onBadgeClick?.(trimmedItem, index)}
          >
            {icon && <span className="mr-1">{icon}</span>}
            {trimmedItem}
            {removable && (
              <button
                className="btn btn-ghost btn-xs p-0 h-auto min-h-0 ml-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove?.(trimmedItem, index);
                }}
              >
                ✕
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Badge;
