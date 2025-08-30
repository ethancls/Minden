import React from 'react';

export function SoftAurora({ height = 'full' as number | 'full' }: { height?: number | 'full' }) {
  return (
    <div className="relative w-full overflow-hidden" style={{ height: height === 'full' ? '100%' : height }}>
      {/* Background overlay plus subtil pour laisser voir les effets */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/90" />

      {/* Aurore principale - bleu plus visible */}
      <div 
        className="pointer-events-none absolute -top-28 -left-28 h-96 w-96 rounded-full bg-blue-500/50 dark:bg-blue-400/35 blur-3xl" 
        style={{ animation: 'float 18s ease-in-out infinite' }} 
      />
      
      {/* Aurore orange - plus intense */}
      <div 
        className="pointer-events-none absolute top-10 -right-32 h-80 w-80 rounded-full bg-orange-500/45 dark:bg-orange-400/30 blur-3xl" 
        style={{ animation: 'float-rev 22s ease-in-out infinite' }} 
      />
      
      {/* Grande aurore bleue - plus visible */}
      <div 
        className="pointer-events-none absolute -bottom-28 left-1/3 h-96 w-96 rounded-full bg-blue-400/40 dark:bg-blue-300/25 blur-3xl" 
        style={{ animation: 'float 20s ease-in-out infinite 2s' }} 
      />
      
      {/* Petite aurore orange - accentuée */}
      <div 
        className="pointer-events-none absolute top-1/3 left-1/4 h-40 w-40 rounded-full bg-orange-400/35 dark:bg-orange-300/20 blur-3xl" 
        style={{ animation: 'float-rev 26s ease-in-out infinite 1s' }} 
      />
      
      {/* Nouvelle aurore violette pour plus de profondeur */}
      <div 
        className="pointer-events-none absolute top-1/2 right-1/4 h-64 w-64 rounded-full bg-purple-500/30 dark:bg-purple-400/20 blur-3xl" 
        style={{ animation: 'float 24s ease-in-out infinite 3s' }} 
      />
      
      {/* Aurore cyan pour contraste */}
      <div 
        className="pointer-events-none absolute bottom-1/4 right-1/3 h-48 w-48 rounded-full bg-cyan-400/25 dark:bg-cyan-300/15 blur-3xl" 
        style={{ animation: 'float-rev 28s ease-in-out infinite 4s' }} 
      />
    </div>
  );
}
