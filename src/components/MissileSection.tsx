import { useState } from 'react';
import HudPanel from './HudPanel';
import HudCorner from './HudCorner';
import Icon from '@/components/ui/icon';

const MissileSection = () => {
  const [launched, setLaunched] = useState(false);
  const [arming, setArming] = useState(false);
  const [armed, setArmed] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleArm = () => {
    if (armed || arming || launched) return;
    setArming(true);
    setTimeout(() => {
      setArming(false);
      setArmed(true);
    }, 1500);
  };

  const handleLaunch = () => {
    if (!armed || launched) return;
    setCountdown(3);
    const tick = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(tick);
          setLaunched(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <section className="relative py-16 px-6 overflow-hidden">
      {/* Section separator */}
      <div className="flex items-center gap-4 mb-10 max-w-5xl mx-auto">
        <div className="h-px flex-1 bg-hud-border" />
        <span className="text-[10px] font-mono tracking-[0.4em] text-hud-muted uppercase">// Mission Asset — Ballistic Strike //</span>
        <div className="h-px flex-1 bg-hud-border" />
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 items-center">

        {/* Image */}
        <div className="relative">
          <HudCorner position="tl" size={20} />
          <HudCorner position="tr" size={20} />
          <HudCorner position="bl" size={20} />
          <HudCorner position="br" size={20} />

          <div className="border border-hud-border overflow-hidden relative">
            <img
              src="https://cdn.poehali.dev/projects/416780b7-aa02-4bb0-8695-8ccde55fff80/files/cfd765c9-0499-4b65-b4aa-5e6845e7edba.jpg"
              alt="Missile Launch"
              className="w-full object-cover"
              style={{ filter: launched ? 'brightness(1.3) saturate(1.4)' : 'brightness(0.85) saturate(0.9)' }}
            />

            {/* Scanlines over image */}
            <div className="absolute inset-0 pointer-events-none"
              style={{
                background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.07) 2px, rgba(0,0,0,0.07) 4px)'
              }}
            />

            {/* Overlays */}
            <div className="absolute top-2 left-2 font-mono text-[9px] text-hud-accent space-y-0.5">
              <div>ASSET: BALLISTIC-07</div>
              <div>OPERATOR: P.GRAVES</div>
              <div>CLASS: TOP SECRET</div>
            </div>

            {launched && (
              <div className="absolute inset-0 flex items-center justify-center"
                style={{ background: 'rgba(200,50,0,0.15)' }}>
                <div className="border-2 border-red-500 px-6 py-3 bg-black/70 text-center animate-pulse">
                  <div className="text-red-400 font-mono text-sm tracking-widest font-bold uppercase">ЗАПУЩЕНА</div>
                  <div className="text-red-600 font-mono text-[9px] tracking-widest mt-1">IMPACT T-00:04:37</div>
                </div>
              </div>
            )}

            {/* Corner label */}
            <div className="absolute bottom-2 right-2 font-mono text-[9px] text-hud-muted text-right">
              <div>SITE: URZIKSTAN-04</div>
              <div className={armed ? 'text-red-500' : 'text-hud-muted'}>
                {launched ? 'LAUNCHED' : armed ? 'ARMED // READY' : 'STANDBY'}
              </div>
            </div>
          </div>
        </div>

        {/* Control panel */}
        <div className="space-y-4">
          <HudPanel title="STRIKE CONTROL" className="w-full">
            <div className="space-y-4">

              <div className="text-[9px] font-mono text-hud-muted tracking-widest uppercase leading-relaxed">
                Баллистическая ракета. Объект: НКТ-778.<br />
                Оператор: Phillip Graves // Shadow Co.<br />
                Миссия: Operation Primera. Urzikstan.
              </div>

              <div className="h-px bg-hud-border" />

              {/* Status indicators */}
              <div className="space-y-2">
                {[
                  { label: 'PROPULSION SYS', ok: true },
                  { label: 'GUIDANCE ACTIVE', ok: true },
                  { label: 'WARHEAD SAFETY', ok: !armed },
                  { label: 'LAUNCH AUTH', ok: armed || launched },
                ].map(row => (
                  <div key={row.label} className="flex justify-between items-center">
                    <span className="text-[9px] font-mono text-hud-muted tracking-widest">{row.label}</span>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${row.ok ? 'bg-hud-green' : 'bg-red-700'}`} />
                      <span className={`text-[9px] font-mono tracking-widest ${row.ok ? 'text-hud-green' : 'text-red-600'}`}>
                        {row.ok ? 'OK' : 'SAFE'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="h-px bg-hud-border" />

              {/* Countdown display */}
              {countdown > 0 && !launched && (
                <div className="text-center py-2">
                  <div className="text-red-500 font-mono text-3xl font-bold tracking-widest animate-pulse"
                    style={{ fontFamily: "'Orbitron', sans-serif" }}>
                    T-{countdown}
                  </div>
                </div>
              )}

              {/* Buttons */}
              {!launched ? (
                <div className="grid grid-cols-2 gap-3">
                  {/* Arm button */}
                  <button
                    onClick={handleArm}
                    disabled={armed || arming}
                    className={`relative py-3 px-4 font-mono text-[10px] tracking-widest uppercase border transition-all
                      ${armed ? 'border-red-800 bg-red-900/20 text-red-500 cursor-default'
                        : arming ? 'border-hud-accent bg-hud-accent/5 text-hud-muted cursor-wait animate-pulse'
                        : 'border-hud-border text-hud-muted hover:border-hud-accent hover:text-hud-accent cursor-pointer'
                      }`}
                  >
                    <HudCorner position="tl" size={8} />
                    <HudCorner position="tr" size={8} />
                    <HudCorner position="bl" size={8} />
                    <HudCorner position="br" size={8} />
                    <div className="flex items-center justify-center gap-1.5">
                      <Icon name="Shield" size={12} />
                      <span>{arming ? 'Снятие...' : armed ? 'Заряжена' : 'Зарядить'}</span>
                    </div>
                  </button>

                  {/* Launch button */}
                  <button
                    onClick={handleLaunch}
                    disabled={!armed || countdown > 0}
                    className={`relative py-3 px-4 font-mono text-[10px] tracking-widest uppercase border-2 transition-all
                      ${!armed ? 'border-hud-dim text-hud-dim cursor-not-allowed opacity-40'
                        : countdown > 0 ? 'border-red-700 bg-red-900/20 text-red-400 cursor-wait animate-pulse'
                        : 'border-red-700 bg-red-900/10 text-red-400 hover:bg-red-900/30 cursor-pointer'
                      }`}
                  >
                    <HudCorner position="tl" size={8} />
                    <HudCorner position="tr" size={8} />
                    <HudCorner position="bl" size={8} />
                    <HudCorner position="br" size={8} />
                    <div className="flex items-center justify-center gap-1.5">
                      <Icon name="Rocket" size={12} />
                      <span>Запустить</span>
                    </div>
                  </button>
                </div>
              ) : (
                <div className="border border-red-800 bg-red-950/30 p-3 text-center">
                  <div className="text-red-400 font-mono text-[10px] tracking-[0.3em] uppercase animate-pulse">
                    ▲ РАКЕТА В ПОЛЁТЕ ▲
                  </div>
                  <div className="text-red-700 font-mono text-[8px] tracking-widest mt-1">
                    Targets cannot be recalled
                  </div>
                </div>
              )}
            </div>
          </HudPanel>
        </div>
      </div>
    </section>
  );
};

export default MissileSection;
