import React from 'react';

interface PemilosLogoProps {
  className?: string;
  withContainer?: boolean;
  containerClassName?: string;
}

/**
 * Official PEMILOS (Komisi Pemilihan OSIS) Logo Component
 * High precision, resolution-independent vector logo
 */
export const PemilosLogo: React.FC<PemilosLogoProps> = ({
  className = 'w-10 h-10',
  withContainer = false,
  containerClassName = 'p-1 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center',
}) => {
  const logoImg = (
    <img
      src="/pemilos-logo.svg"
      alt="Logo Komisi Pemilihan OSIS (PEMILOS)"
      className={`object-contain shrink-0 select-none ${className}`}
      loading="eager"
    />
  );

  if (withContainer) {
    return <div className={containerClassName}>{logoImg}</div>;
  }

  return logoImg;
};
