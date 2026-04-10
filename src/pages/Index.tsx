import { useState, useEffect } from 'react';
import ScanLines from '@/components/ScanLines';
import HudPanel from '@/components/HudPanel';
import HudCorner from '@/components/HudCorner';
import DigitalIndicator from '@/components/DigitalIndicator';
import CommButton from '@/components/CommButton';
import SignalBar from '@/components/SignalBar';
import Icon from '@/components/ui/icon';
import { useAudioSystem } from '@/hooks/useAudioSystem';

const COORDS = '34°21\'N // 069°11\'E';
const BUILD = 'SC-BUILD-7742-B';

const Index = () => {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [time, setTime] = useState('');
  const [radioActive, setRadioActive] = useState(false);
  const [lastSignal, setLastSignal] = useState('--:--:--');
  const { playActivationSound, playRadioNoise, startPeriodicNoise, stopPeriodicNoise } = useAudioSystem();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toISOString().slice(11, 19));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleConnect = () => {
    setConnecting(true);
    playActivationSound();
    setTimeout(() => {
      setConnected(true);
      setConnecting(false);
      setLastSignal(new Date().toISOString().slice(11, 19));

      startPeriodicNoise();

      const radioInterval = setInterval(() => {
        setRadioActive(true);
        playRadioNoise();
        setLastSignal(new Date().toISOString().slice(11, 19));
        setTimeout(() => setRadioActive(false), 1500);
      }, 20000);

      return () => {
        clearInterval(radioInterval);
        stopPeriodicNoise();
      };
    }, 2200);
  };

  return (
    <div className="min-h-screen bg-hud-dark grid-bg text-hud-accent font-mono relative overflow-hidden hud-flicker">
      <ScanLines />

      {/* Noise texture overlay */}
      <div className="pointer-events-none fixed inset-0 z-40 opacity-[0.03]"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
          backgroundSize: '200px 200px'
        }}
      />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-6 py-3 border-b border-hud-border">
        <div className="flex items-center gap-4">
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 bg-hud-accent opacity-80" />
            ))}
          </div>
          <span className="text-[10px] tracking-widest text-hud-muted uppercase">Shadow Company // Comms Division</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-[10px] tracking-widest text-hud-muted">{BUILD}</span>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-hud-accent animate-pulse" />
            <span className="text-[10px] tracking-widest">{time}</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12">

        {/* Title block */}
        <div className="mb-12 text-center relative">
          <div className="text-[10px] tracking-[0.4em] text-hud-muted mb-3 uppercase">// Classified Operator Interface //</div>
          <div className="relative inline-block">
            <h1
              className="relative text-4xl md:text-6xl font-black tracking-[0.15em] uppercase glitch-text"
              data-text="SHADOW COMPANY"
              style={{ fontFamily: "'Orbitron', sans-serif", color: 'var(--hud-accent)' }}
            >
              SHADOW COMPANY
            </h1>
          </div>
          <div className="mt-3 text-[10px] tracking-[0.3em] text-hud-muted uppercase">
            Communications Network — Tier 1 Access Required
          </div>
          <div className="mt-4 flex justify-center gap-2 items-center">
            <div className="h-px w-24 bg-hud-accent opacity-30" />
            <div className="w-1 h-1 bg-hud-accent opacity-60" />
            <div className="h-px w-24 bg-hud-accent opacity-30" />
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

          {/* Left panel - Status */}
          <HudPanel title="SYSTEM STATUS" animated className="md:col-span-1">
            <div className="space-y-3">
              <DigitalIndicator label="ENCRYPTION" value="AES-256" active />
              <DigitalIndicator label="PING" active blinking={false} />
              <DigitalIndicator label="FREQUENCY" value="144.8MHz" active />
              <DigitalIndicator label="NODE" active />
              <div className="mt-4 pt-3 border-t border-hud-border">
                <DigitalIndicator
                  label="CHANNEL"
                  value={connected ? 'ACTIVE' : 'IDLE'}
                  active={connected}
                  blinking={!connected}
                />
              </div>
            </div>
          </HudPanel>

          {/* Center panel - Main comm */}
          <HudPanel title="COMM TERMINAL" animated className="md:col-span-1">
            <div className="space-y-4">
              <div className="text-center py-2">
                <div className="text-[9px] tracking-widest text-hud-muted mb-3 uppercase">Signal Strength</div>
                <div className="flex justify-center">
                  <SignalBar active={connected} />
                </div>
              </div>

              <div className="border border-hud-border p-3 bg-black/30">
                <div className="text-[9px] tracking-widest text-hud-muted mb-2 uppercase">Last Transmission</div>
                <div className="text-xs text-hud-accent font-mono">
                  {connected ? lastSignal : '--:--:--'}
                </div>
                {radioActive && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-hud-accent animate-ping" />
                    <span className="text-[9px] text-hud-accent tracking-widest uppercase animate-pulse">Incoming Signal</span>
                  </div>
                )}
              </div>

              <CommButton
                connected={connected}
                connecting={connecting}
                onClick={handleConnect}
              />
            </div>
          </HudPanel>

          {/* Right panel - Intel */}
          <HudPanel title="INTEL FEED" animated className="md:col-span-1">
            <div className="space-y-3">
              <div className="text-[9px] text-hud-muted tracking-widest uppercase mb-1">Location Data</div>
              <div className="text-xs text-hud-accent">{COORDS}</div>
              <div className="h-px bg-hud-border mt-2" />

              <div className="space-y-2 mt-2">
                {[
                  { code: 'OP-DARKWATER', status: 'ACTIVE' },
                  { code: 'OP-PHANTOM', status: 'STANDBY' },
                  { code: 'OP-IRONVEIL', status: 'CLASSIFIED' },
                ].map((op) => (
                  <div key={op.code} className="flex justify-between items-center">
                    <span className="text-[9px] text-hud-muted tracking-widest">{op.code}</span>
                    <span className={`text-[9px] tracking-widest ${
                      op.status === 'ACTIVE' ? 'text-hud-green' :
                      op.status === 'STANDBY' ? 'text-hud-accent' :
                      'text-hud-muted'
                    }`}>{op.status}</span>
                  </div>
                ))}
              </div>

              <div className="h-px bg-hud-border mt-2" />
              <div className="text-[9px] text-hud-muted tracking-widest uppercase">Operator Status</div>
              <div className="flex items-center gap-2">
                <Icon name="Shield" size={14} />
                <span className="text-xs tracking-widest">TIER-1 CLEARED</span>
              </div>
            </div>
          </HudPanel>
        </div>

        {/* Bottom bar */}
        <HudPanel animated className="w-full">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <Icon name="Crosshair" size={16} className="text-hud-muted" />
              <span className="text-[10px] text-hud-muted tracking-widest uppercase">Perimeter: Secured</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[10px] text-hud-muted tracking-widest uppercase">Operatives Online:</span>
              <span className="text-[10px] text-hud-accent tracking-widest">12 / 14</span>
            </div>
            <div className="flex items-center gap-4">
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-hud-green animate-pulse' : 'bg-hud-dim'}`} />
              <span className="text-[10px] text-hud-muted tracking-widest uppercase">
                Comms: {connected ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </HudPanel>
      </div>

      {/* Corner decorations */}
      <div className="fixed top-16 left-4 z-10 space-y-1 pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-1">
            <div className="w-0.5 h-0.5 bg-hud-accent opacity-40" />
            <div className="h-px bg-hud-accent opacity-20" style={{ width: `${20 - i * 3}px` }} />
          </div>
        ))}
      </div>
      <div className="fixed top-16 right-4 z-10 space-y-1 pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-1 flex-row-reverse">
            <div className="w-0.5 h-0.5 bg-hud-accent opacity-40" />
            <div className="h-px bg-hud-accent opacity-20" style={{ width: `${20 - i * 3}px` }} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Index;
