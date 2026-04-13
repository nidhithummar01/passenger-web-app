import React, { ReactNode } from 'react';
import { motion } from 'motion/react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  animate?: boolean;
  onClick?: () => void;
}

export const GlassCard = ({ children, className = '', animate = true, onClick }: GlassCardProps) => {
  const CardComponent = animate ? motion.div : 'div';

  return (
    <CardComponent
      onClick={onClick}
      {...(animate ? {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
      } : {})}
      className={`
        backdrop-blur-xl bg-black/60
        border-2 border-[#D4AF37]/20
        rounded-2xl shadow-2xl shadow-black/50
        hover:shadow-[0_20px_60px_-15px_rgba(212,175,55,0.3)]
        hover:border-[#D4AF37]/40
        transition-all duration-300
        ${className}
      `}
    >
      {children}
    </CardComponent>
  );
};

export const GoldButton = ({
  children,
  onClick,
  className = '',
  variant = 'primary',
  disabled = false,
  icon,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  icon?: ReactNode;
}) => {
  const variants = {
    primary: 'bg-[#D4AF37] hover:bg-[#B8962A] text-black font-bold shadow-lg shadow-[#D4AF37]/30 hover:shadow-[#D4AF37]/50',
    secondary: 'border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black font-bold',
    ghost: 'text-[#D4AF37] hover:bg-[#D4AF37]/20 font-semibold border-2 border-transparent hover:border-[#D4AF37]/30',
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.03 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className={`
        ${variants[variant]}
        px-8 py-4 rounded-xl text-lg
        transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        active:scale-95
        flex items-center justify-center gap-3
        ${className}
      `}
    >
      {icon}
      {children}
    </motion.button>
  );
};
