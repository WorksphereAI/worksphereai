import React from 'react';

interface ResponsiveGridProps {
  children: React.ReactNode;
  cols?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  cols = { xs: 1, sm: 2, md: 3, lg: 4, xl: 4 },
  gap = 'md',
  className = '',
}) => {
  const gapClasses = {
    none: 'gap-0',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  };

  // Build grid class with responsive columns
  const getColClass = () => {
    const baseCol = cols.xs || 1;
    let classes = `grid-cols-${baseCol}`;
    
    if (cols.sm) classes += ` sm:grid-cols-${cols.sm}`;
    if (cols.md) classes += ` md:grid-cols-${cols.md}`;
    if (cols.lg) classes += ` lg:grid-cols-${cols.lg}`;
    if (cols.xl) classes += ` xl:grid-cols-${cols.xl}`;
    
    return classes;
  };

  return (
    <div className={`
      grid
      ${getColClass()}
      ${gapClasses[gap]}
      ${className}
    `}>
      {children}
    </div>
  );
};
