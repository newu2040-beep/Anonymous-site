import React from 'react';
import {
  Sparkles,
  Moon,
  Flame,
  Compass,
  Eye,
  Feather,
  Shield,
  Heart,
  Star,
  Key,
  Ghost,
} from 'lucide-react';

interface AvatarBadgeProps {
  alias?: string;
  avatarColor?: string;
  avatarIcon?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showGlow?: boolean;
}

export const AvatarBadge: React.FC<AvatarBadgeProps> = ({
  avatarColor = 'from-violet-600 to-indigo-700',
  avatarIcon = 'sparkles',
  size = 'md',
  showGlow = false,
}) => {
  const sizeMap = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-2xl',
  };

  const iconSizeMap = {
    xs: 12,
    sm: 15,
    md: 18,
    lg: 22,
    xl: 28,
  };

  const renderIcon = () => {
    const iconProps = { size: iconSizeMap[size], className: 'text-white/90 drop-shadow-sm' };
    switch (avatarIcon) {
      case 'moon':
        return <Moon {...iconProps} />;
      case 'flame':
        return <Flame {...iconProps} />;
      case 'compass':
        return <Compass {...iconProps} />;
      case 'eye':
        return <Eye {...iconProps} />;
      case 'feather':
        return <Feather {...iconProps} />;
      case 'shield':
        return <Shield {...iconProps} />;
      case 'heart':
        return <Heart {...iconProps} />;
      case 'star':
        return <Star {...iconProps} />;
      case 'key':
        return <Key {...iconProps} />;
      case 'ghost':
        return <Ghost {...iconProps} />;
      case 'sparkles':
      default:
        return <Sparkles {...iconProps} />;
    }
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-2xl bg-gradient-to-br ${avatarColor} ${sizeMap[size]} shadow-sm border border-white/20 transition-transform duration-200 hover:scale-105 shrink-0`}
    >
      {renderIcon()}
      {showGlow && (
        <span className="absolute -inset-1 rounded-2xl bg-inherit opacity-40 blur-md pointer-events-none -z-10" />
      )}
    </div>
  );
};
