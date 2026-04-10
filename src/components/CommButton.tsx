import { useState } from 'react';
import Icon from '@/components/ui/icon';
import HudCorner from './HudCorner';

interface CommButtonProps {
  connected: boolean;
  connecting: boolean;
  onClick: () => void;
}

const CommButton = ({ connected, connecting, onClick }: CommButtonProps) => {
  const [pressed, setPressed] = useState(false);

  const handleClick = () => {
    if (connected || connecting) return;
    setPressed(true);
    setTimeout(() => setPressed(false), 150);
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      disabled={connected || connecting}
      className={`
        relative w-full py-5 px-8 font-mono text-sm tracking-widest uppercase
        border-2 transition-all duration-300 cursor-pointer select-none
        ${connected
          ? 'border-hud-green bg-hud-green/10 text-hud-green cursor-default'
          : connecting
          ? 'border-hud-accent bg-hud-accent/5 text-hud-accent cursor-wait'
          : 'border-hud-accent bg-transparent text-hud-accent hover:bg-hud-accent/10 active:bg-hud-accent/20'
        }
        ${pressed ? 'scale-[0.98]' : 'scale-100'}
        disabled:opacity-100
      `}
    >
      <HudCorner position="tl" size={12} />
      <HudCorner position="tr" size={12} />
      <HudCorner position="bl" size={12} />
      <HudCorner position="br" size={12} />

      <div className="flex items-center justify-center gap-3">
        {connected ? (
          <>
            <div className="w-2 h-2 rounded-full bg-hud-green animate-pulse" />
            <Icon name="Radio" size={18} />
            <span>Связь установлена</span>
            <div className="w-2 h-2 rounded-full bg-hud-green animate-pulse" />
          </>
        ) : connecting ? (
          <>
            <Icon name="Loader" size={18} className="animate-spin" />
            <span>Установка связи...</span>
          </>
        ) : (
          <>
            <Icon name="RadioTower" size={18} />
            <span>Настроить связь</span>
          </>
        )}
      </div>

      {connected && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2">
          <span className="text-hud-green/60 text-[9px] font-mono tracking-widest">CHANNEL SECURE // ENC-256</span>
        </div>
      )}
    </button>
  );
};

export default CommButton;
