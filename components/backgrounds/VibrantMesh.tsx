import React from 'react';

// A more visual, modern background: vivid mesh gradients + soft aurora blobs
// Balanced to remain professional and readable over content.
export function VibrantMesh({ height = 'full' as number | 'full' }: { height?: number | 'full' }) {
  return (
    <div className="relative w-full overflow-hidden" style={{ height: height === 'full' ? '100%' : height }}>
      {/* Base vertical wash to anchor tokens */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,theme(colors.background/_70%),theme(colors.background))]" />

      {/* Mesh gradient (visible) — only blue (primary) and orange (accent) */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: [
            'radial-gradient(60rem 30rem at 10% 0%, hsl(var(--primary) / 0.24), transparent 60%)',
            'radial-gradient(50rem 28rem at 95% 10%, hsl(var(--accent) / 0.24), transparent 60%)',
            'radial-gradient(40rem 24rem at 15% 95%, hsl(var(--primary) / 0.18), transparent 60%)',
            'radial-gradient(42rem 24rem at 85% 92%, hsl(var(--accent) / 0.18), transparent 60%)',
          ].join(', '),
        }}
      />

      {/* Aurora blobs (animated) — only blue/orange tokens */}
      <div
        className="pointer-events-none absolute -top-24 -left-20 h-[28rem] w-[28rem] rounded-full blur-3xl"
        style={{ backgroundColor: 'hsl(var(--primary) / 0.26)', animation: 'float 18s ease-in-out infinite' }}
      />
      <div
        className="pointer-events-none absolute top-10 -right-28 h-[24rem] w-[24rem] rounded-full blur-3xl"
        style={{ backgroundColor: 'hsl(var(--accent) / 0.22)', animation: 'float-rev 22s ease-in-out infinite' }}
      />
      {/* Removed lower middle blob to avoid transparent square artifact */}

      {/* Gentle contour lines overlay for depth */}

      {/* Vignette to keep content readable */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(140%_90%_at_50%_-20%,_transparent,_hsl(var(--background)/0.45))]" />
    </div>
  );
}
