import { useEffect, useState } from 'react';

interface SignalBarProps {
  active: boolean;
}

const SignalBar = ({ active }: SignalBarProps) => {
  const [levels, setLevels] = useState([0, 0, 0, 0, 0, 0, 0, 0]);

  useEffect(() => {
    if (!active) {
      setLevels([0, 0, 0, 0, 0, 0, 0, 0]);
      return;
    }
    const interval = setInterval(() => {
      setLevels(prev => prev.map(() => Math.random()));
    }, 120);
    return () => clearInterval(interval);
  }, [active]);

  return (
    <div className="flex items-end gap-0.5 h-8">
      {levels.map((level, i) => (
        <div
          key={i}
          className="w-2 bg-hud-accent transition-all duration-100"
          style={{
            height: `${active ? Math.max(15, level * 100) : 8}%`,
            opacity: active ? 0.6 + level * 0.4 : 0.2,
          }}
        />
      ))}
    </div>
  );
};

export default SignalBar;
