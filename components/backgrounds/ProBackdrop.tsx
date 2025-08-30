import React from 'react';

// A professional, subtle backdrop using dual radial gradients
// tuned to the design tokens (primary/accent) and a soft vignette.
// No dots or harsh grid; looks clean in both light and dark modes.
export function ProBackdrop({ height = 'full' as number | 'full' }: { height?: number | 'full' }) {
  const style: React.CSSProperties = {
    height: height === 'full' ? '100%' : height,
    backgroundImage: [
      // Top-left glow
      `radial-gradient(1000px 600px at -5% -10%, hsl(var(--primary) / 0.10), transparent 60%)`,
      // Bottom-right glow
      `radial-gradient(900px 540px at 105% 110%, hsl(var(--accent) / 0.10), transparent 60%)`,
      // Soft vertical wash
      `linear-gradient(to bottom, hsl(var(--background) / 0.6), hsl(var(--background)))`,
    ].join(', '),
  };

  return (
    <div className="relative w-full overflow-hidden" style={style}>
      {/* Subtle vignette to focus content */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_-20%,_transparent,_hsl(var(--background)/0.6))]" />
    </div>
  );
}

