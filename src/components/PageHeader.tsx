import React from 'react';
import { useStore } from '../store/useStore';
import { getThemeColors } from '../lib/utils';
import { cn } from '../lib/utils';

interface PageHeaderProps {
  title: string;
  description: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, children, className }: PageHeaderProps) {
  const { settings } = useStore();
  const themeColors = getThemeColors(settings.colorTheme || 'Artesanal Marrom');

  return (
    <header 
      className={cn("header-bar flex flex-col md:flex-row md:items-start justify-between gap-4", className)}
      style={{
        background: `linear-gradient(to right, ${themeColors.bg}, transparent)`,
        borderLeft: `4px solid ${themeColors.border}`
      }}
    >
      <div>
        <h2 className="text-3xl font-serif text-current" style={{ color: themeColors.border }}>{title}</h2>
        <p className="text-stone-600 mt-1 max-w-2xl">{description}</p>
      </div>
      {children && (
        <div className="flex-shrink-0">
          {children}
        </div>
      )}
    </header>
  );
}
