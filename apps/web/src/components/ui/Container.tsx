import React from 'react';

export interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const Container: React.FC<ContainerProps> = ({ children, className = '' }) => {
  return <div className={`wrap ${className}`}>{children}</div>;
};
