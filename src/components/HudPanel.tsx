import { useEffect, useState } from 'react';
import HudCorner from './HudCorner';

interface HudPanelProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  animated?: boolean;
}

const HudPanel = ({ children, className = '', title, animated = false }: HudPanelProps) => {
  const [opacity, setOpacity] = useState(animated ? 0 : 1);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => setOpacity(1), 100);
      return () => clearTimeout(timer);
    }
  }, [animated]);

  return (
    <div
      className={`relative border border-hud-border bg-hud-bg backdrop-blur-sm ${className}`}
      style={{ opacity, transition: 'opacity 0.8s ease' }}
    >
      <HudCorner position="tl" />
      <HudCorner position="tr" />
      <HudCorner position="bl" />
      <HudCorner position="br" />
      {title && (
        <div className="absolute -top-3 left-4 px-2 bg-hud-dark">
          <span className="text-hud-accent text-xs font-mono tracking-widest uppercase">{title}</span>
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
};

export default HudPanel;
