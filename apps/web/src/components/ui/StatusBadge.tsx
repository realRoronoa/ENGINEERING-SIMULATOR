import React from 'react';

export interface StatusBadgeProps {
  status: 'ok' | 'fail' | 'rev' | 'ai';
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  children,
  className = '',
  id,
}) => {
  return (
    <span id={id} className={`st ${status} ${className}`}>
      {children}
    </span>
  );
};
