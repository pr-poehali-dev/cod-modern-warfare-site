import { useEffect, useState } from 'react';

interface DigitalIndicatorProps {
  label: string;
  value?: string;
  blinking?: boolean;
  active?: boolean;
}

const DigitalIndicator = ({ label, value, blinking = false, active = true }: DigitalIndicatorProps) => {
  const [displayValue, setDisplayValue] = useState(value || '---');
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!value) {
      const chars = '0123456789ABCDEF';
      const interval = setInterval(() => {
        setDisplayValue(
          Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
        );
      }, 150);
      return () => clearInterval(interval);
    } else {
      setDisplayValue(value);
    }
  }, [value]);

  useEffect(() => {
    if (blinking) {
      const interval = setInterval(() => setVisible(v => !v), 800);
      return () => clearInterval(interval);
    }
  }, [blinking]);

  return (
    <div className="flex items-center gap-2">
      <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-hud-accent' : 'bg-hud-dim'} ${blinking ? 'animate-pulse' : ''}`} />
      <span className="text-hud-muted text-xs font-mono tracking-widest uppercase">{label}</span>
      <span
        className={`text-xs font-mono tracking-widest ml-auto ${active ? 'text-hud-accent' : 'text-hud-dim'}`}
        style={{ opacity: visible ? 1 : 0.2, transition: 'opacity 0.1s' }}
      >
        {displayValue}
      </span>
    </div>
  );
};

export default DigitalIndicator;
