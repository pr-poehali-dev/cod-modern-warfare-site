import { useEffect, useRef, useState, useCallback } from "react";
import Icon from "@/components/ui/icon";

const BOOT_LINES = [
  "ИНИЦИАЛИЗАЦИЯ СИСТЕМЫ СВЯЗИ...",
  "ЗАГРУЗКА ТАКТИЧЕСКИХ ПРОТОКОЛОВ...",
  "ШИФРОВАНИЕ КАНАЛА: AES-256...",
  "ПРОВЕРКА ЧАСТОТ: 156.8 МГц...",
  "СТАТУС: ГОТОВ К РАБОТЕ",
];

function useAudio() {
  const audioCtx = useRef<AudioContext | null>(null);

  const getCtx = useCallback(() => {
    if (!audioCtx.current) {
      const AudioCtxClass = window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      audioCtx.current = new AudioCtxClass!();
    }
    return audioCtx.current;
  }, []);

  const playActivation = useCallback(() => {
    const ctx = getCtx();
    const t = ctx.currentTime;

    // Sweep up tone
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.frequency.setValueAtTime(400, t);
    osc1.frequency.exponentialRampToValueAtTime(1200, t + 0.15);
    gain1.gain.setValueAtTime(0.3, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc1.start(t);
    osc1.stop(t + 0.15);

    // Click confirm
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.frequency.setValueAtTime(880, t + 0.18);
    osc2.frequency.setValueAtTime(1760, t + 0.22);
    gain2.gain.setValueAtTime(0.25, t + 0.18);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
    osc2.start(t + 0.18);
    osc2.stop(t + 0.32);
  }, [getCtx]);

  const playRadioNoise = useCallback(() => {
    const ctx = getCtx();
    const t = ctx.currentTime;
    const duration = 1.2;

    // White noise burst
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.4;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1800;
    filter.Q.value = 0.5;

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, t);
    gainNode.gain.linearRampToValueAtTime(0.15, t + 0.1);
    gainNode.gain.setValueAtTime(0.15, t + 0.4);
    gainNode.gain.linearRampToValueAtTime(0.05, t + 0.8);
    gainNode.gain.linearRampToValueAtTime(0, t + duration);

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    source.start(t);
    source.stop(t + duration);

    // Short beep after noise
    const beep = ctx.createOscillator();
    const beepGain = ctx.createGain();
    beep.connect(beepGain);
    beepGain.connect(ctx.destination);
    beep.frequency.value = 660;
    beepGain.gain.setValueAtTime(0.1, t + duration - 0.1);
    beepGain.gain.exponentialRampToValueAtTime(0.001, t + duration + 0.05);
    beep.start(t + duration - 0.1);
    beep.stop(t + duration + 0.1);
  }, [getCtx]);

  return { playActivation, playRadioNoise };
}

function GlitchText({ text }: { text: string }) {
  const [glitch, setGlitch] = useState(false);
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 120);
    }, 4000 + Math.random() * 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className={`relative inline-block ${glitch ? "hud-glitch" : ""}`}>
      {text}
    </span>
  );
}

function ScanLine() {
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      <div className="scan-line" />
      <div className="scanlines" />
    </div>
  );
}

function CornerBracket({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const classes = {
    tl: "top-0 left-0 border-t border-l",
    tr: "top-0 right-0 border-t border-r",
    bl: "bottom-0 left-0 border-b border-l",
    br: "bottom-0 right-0 border-b border-r",
  };
  return (
    <div className={`absolute w-6 h-6 ${classes[pos]} border-[var(--hud-accent)] opacity-80`} />
  );
}

function StatusBar({ label, value, max = 100, color = "var(--hud-green)" }: {
  label: string; value: number; max?: number; color?: string;
}) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center">
        <span className="text-[9px] font-mono text-[var(--hud-muted)] tracking-widest uppercase">{label}</span>
        <span className="text-[9px] font-mono text-[var(--hud-green)]">{value}/{max}</span>
      </div>
      <div className="h-[3px] bg-[var(--hud-border)] relative overflow-hidden">
        <div
          className="h-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color, boxShadow: `0 0 6px ${color}` }}
        />
        <div className="absolute inset-0 bar-flicker" />
      </div>
    </div>
  );
}

function HexGrid() {
  return (
    <svg className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="hex" x="0" y="0" width="40" height="46" patternUnits="userSpaceOnUse">
          <polygon points="20,2 38,12 38,34 20,44 2,34 2,12" fill="none" stroke="#00ff88" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#hex)" />
    </svg>
  );
}

export default function Index() {
  const [booted, setBooted] = useState(false);
  const [bootStep, setBootStep] = useState(0);
  const [bootDone, setBootDone] = useState(false);
  const [commActive, setCommActive] = useState(false);
  const [commStatus, setCommStatus] = useState<"idle" | "connecting" | "connected">("idle");
  const [time, setTime] = useState(new Date());
  const [noiseFlash, setNoiseFlash] = useState(false);
  const [signalStrength] = useState(87);
  const [coords] = useState({ lat: "55°45′N", lon: "37°37′E" });
  const { playActivation, playRadioNoise } = useAudio();

  // Clock
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Boot sequence
  useEffect(() => {
    const timer = setInterval(() => {
      setBootStep((s) => {
        if (s >= BOOT_LINES.length - 1) {
          clearInterval(timer);
          setTimeout(() => setBootDone(true), 600);
          return s;
        }
        return s + 1;
      });
    }, 420);
    setBooted(true);
    return () => clearInterval(timer);
  }, []);

  // Periodic radio noise every 20s
  useEffect(() => {
    if (!bootDone) return;
    const interval = setInterval(() => {
      setNoiseFlash(true);
      playRadioNoise();
      setTimeout(() => setNoiseFlash(false), 1400);
    }, 20000);
    return () => clearInterval(interval);
  }, [bootDone, playRadioNoise]);

  const handleComm = () => {
    if (commStatus === "connecting") return;
    playActivation();
    setCommStatus("connecting");
    setCommActive(true);
    setTimeout(() => setCommStatus("connected"), 900);
  };

  const fmt = (d: Date) =>
    `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;

  const fmtDate = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  return (
    <div className="hud-root min-h-screen overflow-hidden relative flex flex-col">
      <ScanLine />
      <HexGrid />

      {/* Noise flash overlay */}
      {noiseFlash && <div className="fixed inset-0 z-40 pointer-events-none noise-flash" />}

      {/* Boot overlay */}
      {!bootDone && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center gap-3 p-8">
          <div className="text-[var(--hud-green)] font-mono text-xs space-y-2 w-full max-w-md">
            {BOOT_LINES.slice(0, bootStep + 1).map((line, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-[var(--hud-accent)]">[{String(i + 1).padStart(2, "0")}]</span>
                <span className={i === bootStep ? "boot-cursor" : ""}>{line}</span>
                {i < bootStep && <span className="text-[var(--hud-green)] ml-auto">OK</span>}
              </div>
            ))}
          </div>
          <div className="mt-6 w-full max-w-md">
            <div className="h-[2px] bg-[var(--hud-border)] overflow-hidden">
              <div
                className="h-full bg-[var(--hud-green)] transition-all duration-500"
                style={{ width: `${((bootStep + 1) / BOOT_LINES.length) * 100}%`, boxShadow: "0 0 10px var(--hud-green)" }}
              />
            </div>
          </div>
        </div>
      )}

      {/* TOP BAR */}
      <header className={`hud-panel border-b border-[var(--hud-border)] px-6 py-3 flex items-center justify-between transition-opacity duration-700 ${bootDone ? "opacity-100" : "opacity-0"}`}>
        <div className="flex items-center gap-4">
          <div className="w-2 h-2 rounded-full bg-[var(--hud-green)] pulse-dot" />
          <span className="font-display text-sm font-bold tracking-[0.3em] text-[var(--hud-green)] uppercase">
            <GlitchText text="SHADOW LINK" />
          </span>
          <span className="text-[var(--hud-muted)] font-mono text-[10px] tracking-widest">v4.2.1</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Icon name="MapPin" size={10} className="text-[var(--hud-accent)]" />
            <span className="font-mono text-[10px] text-[var(--hud-muted)]">{coords.lat} / {coords.lon}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="font-mono text-base font-medium text-[var(--hud-green)] leading-none tabular-nums">{fmt(time)}</span>
            <span className="font-mono text-[9px] text-[var(--hud-muted)] tracking-widest">{fmtDate(time)}</span>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className={`flex-1 flex flex-col lg:flex-row gap-4 p-4 md:p-6 transition-opacity duration-1000 ${bootDone ? "opacity-100" : "opacity-0"}`}>

        {/* LEFT PANEL */}
        <aside className="lg:w-64 flex flex-col gap-4">
          {/* Operator card */}
          <div className="hud-panel p-4 relative">
            <CornerBracket pos="tl" />
            <CornerBracket pos="tr" />
            <CornerBracket pos="bl" />
            <CornerBracket pos="br" />
            <div className="text-[10px] font-mono text-[var(--hud-accent)] tracking-widest mb-3">// ОПЕРАТОР</div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 border border-[var(--hud-green)] relative flex items-center justify-center">
                <Icon name="User" size={18} className="text-[var(--hud-green)]" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[var(--hud-green)]" />
              </div>
              <div>
                <div className="font-display text-xs font-bold text-white tracking-wider">GHOST</div>
                <div className="font-mono text-[9px] text-[var(--hud-muted)]">LVL 4 · АЛЬФА</div>
              </div>
            </div>
            <div className="space-y-3">
              <StatusBar label="ЗДОРОВЬЕ" value={94} max={100} />
              <StatusBar label="ЭНЕРГИЯ" value={67} max={100} color="var(--hud-accent)" />
              <StatusBar label="СВЯЗЬ" value={signalStrength} max={100} color="var(--hud-green)" />
            </div>
          </div>

          {/* Signal indicators */}
          <div className="hud-panel p-4">
            <div className="text-[10px] font-mono text-[var(--hud-accent)] tracking-widest mb-3">// ЧАСТОТЫ</div>
            <div className="space-y-2">
              {[
                { ch: "ALPHA", freq: "156.8", active: true },
                { ch: "BRAVO", freq: "243.0", active: false },
                { ch: "CHARLIE", freq: "406.1", active: false },
              ].map((ch) => (
                <div key={ch.ch} className={`flex items-center justify-between py-1.5 px-2 border ${ch.active ? "border-[var(--hud-green)] bg-[var(--hud-green)]/5" : "border-[var(--hud-border)]"}`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${ch.active ? "bg-[var(--hud-green)] pulse-dot" : "bg-[var(--hud-border)]"}`} />
                    <span className="font-mono text-[10px] text-white">{ch.ch}</span>
                  </div>
                  <span className={`font-mono text-[10px] ${ch.active ? "text-[var(--hud-green)]" : "text-[var(--hud-muted)]"}`}>{ch.freq} МГц</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* CENTER PANEL */}
        <section className="flex-1 flex flex-col gap-4">
          {/* Main HUD display */}
          <div className="hud-panel flex-1 p-6 md:p-10 relative flex flex-col items-center justify-center text-center min-h-[340px]">
            <CornerBracket pos="tl" />
            <CornerBracket pos="tr" />
            <CornerBracket pos="bl" />
            <CornerBracket pos="br" />

            {/* Radar rings */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="radar-ring w-[500px] h-[500px]" style={{ animationDelay: "0s" }} />
              <div className="radar-ring w-[340px] h-[340px]" style={{ animationDelay: "0.8s" }} />
              <div className="radar-ring w-[180px] h-[180px]" style={{ animationDelay: "1.6s" }} />
            </div>

            {/* Top tag */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 font-mono text-[9px] text-[var(--hud-muted)] tracking-[0.4em] uppercase">
              TACTICAL COMMS SYSTEM
            </div>

            {/* Main title */}
            <div className="relative z-10 mb-6">
              <div className="font-mono text-[10px] text-[var(--hud-accent)] tracking-[0.5em] mb-2 uppercase">Миссия активна</div>
              <h1 className="font-display text-4xl md:text-6xl font-black text-white tracking-[0.15em] leading-none uppercase mb-1">
                <GlitchText text="SHADOW" />
              </h1>
              <h1 className="font-display text-4xl md:text-6xl font-black text-[var(--hud-green)] tracking-[0.15em] leading-none uppercase" style={{ textShadow: "0 0 30px var(--hud-green), 0 0 60px var(--hud-green)" }}>
                <GlitchText text="LINK" />
              </h1>
              <p className="font-mono text-[11px] text-[var(--hud-muted)] tracking-[0.3em] mt-4 max-w-sm mx-auto">
                ЗАЩИЩЁННЫЙ КАНАЛ ТАКТИЧЕСКОЙ СВЯЗИ
              </p>
            </div>

            {/* Comm button */}
            <button
              onClick={handleComm}
              className={`comm-btn relative z-10 font-display text-sm font-bold tracking-[0.3em] uppercase px-10 py-4 border-2 transition-all duration-300 ${
                commStatus === "connected"
                  ? "border-[var(--hud-green)] text-[var(--hud-green)] bg-[var(--hud-green)]/10"
                  : commStatus === "connecting"
                  ? "border-[var(--hud-accent)] text-[var(--hud-accent)] bg-[var(--hud-accent)]/10 animate-pulse"
                  : "border-[var(--hud-green)] text-black bg-[var(--hud-green)] hover:bg-[var(--hud-green)]/80"
              }`}
              style={commStatus === "idle" ? { boxShadow: "0 0 20px var(--hud-green), inset 0 0 20px rgba(0,255,136,0.1)" } : {}}
            >
              <span className="flex items-center gap-3">
                <Icon
                  name={commStatus === "connected" ? "CheckCircle" : commStatus === "connecting" ? "Loader" : "Radio"}
                  size={16}
                  className={commStatus === "connecting" ? "animate-spin" : ""}
                />
                {commStatus === "connected" ? "КАНАЛ ОТКРЫТ" : commStatus === "connecting" ? "СОЕДИНЕНИЕ..." : "УСТАНОВИТЬ СВЯЗЬ"}
              </span>
            </button>

            {/* Connected message */}
            {commStatus === "connected" && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-[10px] text-[var(--hud-green)] tracking-[0.3em] animate-fade-in">
                ▶ ОЖИДАЕМ ОТВЕТА ОПЕРАТОРА...
              </div>
            )}

            {/* Bottom coords */}
            <div className="absolute bottom-4 right-4 font-mono text-[9px] text-[var(--hud-muted)]">
              {coords.lat} · {coords.lon}
            </div>
          </div>

          {/* Bottom data strip */}
          <div className="hud-panel p-3 flex items-center gap-6 overflow-x-auto">
            {[
              { label: "ПИНГ", value: "14 МС", ok: true },
              { label: "ПРОТОКОЛ", value: "AES-256", ok: true },
              { label: "ПАКЕТЫ", value: "0 ПОТЕРЬ", ok: true },
              { label: "СЕТЬ", value: "MESH-7", ok: true },
              { label: "СТАТУС", value: commStatus === "connected" ? "АКТИВЕН" : "ГОТОВ", ok: true },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-1 min-w-max">
                <span className="font-mono text-[8px] text-[var(--hud-muted)] tracking-widest">{item.label}</span>
                <span className="font-mono text-[11px] text-[var(--hud-green)] font-medium">{item.value}</span>
              </div>
            ))}
            <div className="ml-auto flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${noiseFlash ? "bg-[var(--hud-accent)]" : "bg-[var(--hud-green)]"} pulse-dot`} />
              <span className="font-mono text-[9px] text-[var(--hud-muted)]">{noiseFlash ? "ПОМЕХИ..." : "СИГНАЛ ЧИСТЫЙ"}</span>
            </div>
          </div>
        </section>

        {/* RIGHT PANEL */}
        <aside className="lg:w-56 flex flex-col gap-4">
          {/* Tactical log */}
          <div className="hud-panel p-4 flex-1">
            <div className="text-[10px] font-mono text-[var(--hud-accent)] tracking-widest mb-3">// ЖУРНАЛ</div>
            <div className="space-y-2 font-mono text-[10px]">
              {[
                { t: "00:00:01", msg: "Система запущена", type: "info" },
                { t: "00:00:04", msg: "Каналы проверены", type: "ok" },
                { t: "00:00:07", msg: "Шифрование: OK", type: "ok" },
                ...(commActive ? [{ t: fmt(time), msg: commStatus === "connected" ? "Связь установлена" : "Подключение...", type: commStatus === "connected" ? "ok" : "warn" }] : []),
                ...(noiseFlash ? [{ t: fmt(time), msg: "Обнаружены помехи", type: "warn" }] : []),
              ].map((entry, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-[var(--hud-muted)] shrink-0">{entry.t}</span>
                  <span className={
                    entry.type === "ok" ? "text-[var(--hud-green)]" :
                    entry.type === "warn" ? "text-[var(--hud-accent)]" :
                    "text-[var(--hud-muted)]"
                  }>{entry.msg}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mini radar */}
          <div className="hud-panel p-4">
            <div className="text-[10px] font-mono text-[var(--hud-accent)] tracking-widest mb-3">// РАДАР</div>
            <div className="relative w-full aspect-square max-w-[160px] mx-auto">
              <svg viewBox="0 0 160 160" className="w-full h-full">
                <circle cx="80" cy="80" r="75" fill="none" stroke="var(--hud-border)" strokeWidth="1" />
                <circle cx="80" cy="80" r="50" fill="none" stroke="var(--hud-border)" strokeWidth="0.5" />
                <circle cx="80" cy="80" r="25" fill="none" stroke="var(--hud-border)" strokeWidth="0.5" />
                <line x1="80" y1="5" x2="80" y2="155" stroke="var(--hud-border)" strokeWidth="0.5" />
                <line x1="5" y1="80" x2="155" y2="80" stroke="var(--hud-border)" strokeWidth="0.5" />
                <circle cx="80" cy="80" r="3" fill="var(--hud-green)" style={{ filter: "drop-shadow(0 0 4px var(--hud-green))" }} />
                <circle cx="110" cy="55" r="2" fill="var(--hud-accent)" className="radar-blink" />
                <circle cx="48" cy="100" r="2" fill="var(--hud-muted)" />
                <g style={{ transformOrigin: "80px 80px", animation: "radarSweep 4s linear infinite" }}>
                  <line x1="80" y1="80" x2="80" y2="6" stroke="var(--hud-green)" strokeWidth="1.5" opacity="0.8" />
                  <path d="M80 80 L80 6 A74 74 0 0 1 90 8 Z" fill="var(--hud-green)" opacity="0.08" />
                </g>
              </svg>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}