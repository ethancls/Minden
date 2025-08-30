"use client";
import * as React from 'react';
import { cn } from '@/lib/utils';

type LogoLoaderProps = {
  size?: number;
  className?: string;
  title?: string;
  desc?: string;
};

export function LogoLoader({
  size = 64,
  className,
  title = 'Logo de l’application',
  desc = 'Deux capsules arrondies superposées sur fond sombre : bleue en haut, orange en bas.',
}: LogoLoaderProps) {
  const uid = React.useId();
  const blueId = `${uid}-gradBlue`;
  const orangeId = `${uid}-gradOrange`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      preserveAspectRatio="xMidYMid meet"
      shapeRendering="geometricPrecision"
      role="img"
      aria-labelledby={`${uid}-title ${uid}-desc`}
      focusable="false"
      className={cn('inline-block', className)}
    >
      <title id={`${uid}-title`}>{title}</title>
      <desc id={`${uid}-desc`}>{desc}</desc>

      <defs>
        <linearGradient id={blueId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0" stopColor="#3B82F6" />
          <stop offset="1" stopColor="#1D4ED8" />
        </linearGradient>
        <linearGradient id={orangeId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0" stopColor="#F97316" />
          <stop offset="1" stopColor="#DC2626" />
        </linearGradient>
      </defs>

      {/* Transparent background: only pills are visible */}

      {/* Minimal, professional: gentle breathing of the two pills */}
      <g className="pill pill-blue">
        <rect x="12" y="10" width="40" height="20" rx="8" fill={`url(#${blueId})`} />
      </g>
      <g className="pill pill-orange">
        <rect x="16" y="34" width="32" height="18" rx="8" fill={`url(#${orangeId})`} />
      </g>

      <style>{`
        .pill { transform-box: fill-box; transform-origin: center; will-change: transform; }
        .pill rect { filter: drop-shadow(0 2px 2px rgba(0,0,0,0.20)); }
        .pill-blue   { animation: breatheUp   1400ms ease-in-out infinite; }
        .pill-orange { animation: breatheDown 1400ms ease-in-out infinite 120ms; }

        @keyframes breatheUp {
          0%, 100% { transform: translateY(0) scale(1); }
          50%      { transform: translateY(-2px) scale(1.02); }
        }
        @keyframes breatheDown {
          0%, 100% { transform: translateY(0) scale(1); }
          50%      { transform: translateY(2px) scale(1.02); }
        }

        @media (prefers-reduced-motion: reduce) {
          .pill-blue, .pill-orange { animation: none; }
        }
      `}</style>
    </svg>
  );
}
