import React from 'react';

export interface SectionHeadingProps {
  number?: string;
  tag: string;
  title: React.ReactNode;
  lead?: string;
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  number,
  tag,
  title,
  lead,
  className = '',
}) => {
  return (
    <div className={`sec-h ${className}`}>
      <div className="tl">
        {number && <b>{number}</b>}
        {tag}
      </div>
      <h2>{title}</h2>
      {lead && <p className="lead">{lead}</p>}
    </div>
  );
};
