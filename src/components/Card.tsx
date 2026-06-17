import React from 'react';

interface CardProps {
  title?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  badgeText?: string;
  badgeType?: 'info' | 'success' | 'warning' | 'danger';
  extraAction?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export default function Card({ 
  title, 
  icon: Icon, 
  badgeText, 
  badgeType = 'info', 
  extraAction, 
  children, 
  className = ''
}: CardProps) {
  const getBadgeClass = () => {
    switch (badgeType) {
      case 'success': return 'badge-success';
      case 'warning': return 'badge-warning';
      case 'danger': return 'badge-danger';
      default: return 'badge-info';
    }
  };

  return (
    <div className={`card flex flex-col h-full ${className}`}>
      {(title || Icon || badgeText || extraAction) && (
        <div className="flex justify-between items-center mb-4 border-b border-zinc-200 pb-2.5">
          <div className="flex items-center flex-wrap gap-1.5">
            {Icon && <Icon size={16} className="text-zinc-900 mr-1" />}
            {title && <h3 className="m-0 text-sm font-semibold text-zinc-900">{title}</h3>}
            {badgeText && <span className={`badge ${getBadgeClass()}`}>{badgeText}</span>}
          </div>
          {extraAction && <div className="flex items-center">{extraAction}</div>}
        </div>
      )}
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}
