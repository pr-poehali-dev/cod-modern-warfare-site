import { useEffect, useRef, useState } from 'react';
import HudCorner from './HudCorner';

const AC130Screen = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => setTime(new Date().toISOString().slice(11, 19));
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let t = 0;
    let targetX = 180;
    let targetY = 130;
    let targetVX = 0.15;
    let targetVY = 0.08;
    let explosionFrames: { x: number; y: number; r: number; age: number }[] = [];
    let lastShot = 0;

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      t += 0.012;

      // Background - dark terrain
      ctx.fillStyle = '#0a0f0a';
      ctx.fillRect(0, 0, w, h);

      // Terrain grid (top-down parallax)
      ctx.strokeStyle = 'rgba(80,120,80,0.12)';
      ctx.lineWidth = 0.5;
      const gridOffset = (t * 18) % 40;
      for (let y = -40; y < h + 40; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y + gridOffset);
        ctx.lineTo(w, y + gridOffset);
        ctx.stroke();
      }
      for (let x = 0; x < w + 40; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      // Roads / terrain features
      ctx.strokeStyle = 'rgba(100,140,100,0.18)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, h * 0.4 + Math.sin(t * 0.3) * 5);
      ctx.lineTo(w * 0.35, h * 0.45);
      ctx.lineTo(w * 0.7, h * 0.38);
      ctx.lineTo(w, h * 0.42);
      ctx.stroke();

      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(w * 0.3, 0);
      ctx.lineTo(w * 0.28, h * 0.35);
      ctx.lineTo(w * 0.45, h * 0.7);
      ctx.lineTo(w * 0.42, h);
      ctx.stroke();

      // Buildings (dim blobs)
      const buildings = [
        { x: 0.2, y: 0.25 }, { x: 0.6, y: 0.3 }, { x: 0.75, y: 0.6 },
        { x: 0.15, y: 0.65 }, { x: 0.55, y: 0.72 }, { x: 0.4, y: 0.18 },
      ];
      buildings.forEach(b => {
        ctx.fillStyle = 'rgba(90,130,90,0.15)';
        ctx.fillRect(b.x * w - 8, b.y * h - 6, 16, 12);
      });

      // Moving target vehicle
      targetX += targetVX + Math.sin(t * 0.5) * 0.1;
      targetY += targetVY + Math.cos(t * 0.7) * 0.05;
      if (targetX > w - 20 || targetX < 20) targetVX *= -1;
      if (targetY > h - 20 || targetY < 20) targetVY *= -1;

      // Target heat signature
      const grd = ctx.createRadialGradient(targetX, targetY, 0, targetX, targetY, 14);
      grd.addColorStop(0, 'rgba(200,255,200,0.6)');
      grd.addColorStop(0.4, 'rgba(120,200,120,0.25)');
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(targetX, targetY, 14, 0, Math.PI * 2);
      ctx.fill();

      // Vehicle body
      ctx.fillStyle = 'rgba(180,240,180,0.5)';
      ctx.fillRect(targetX - 5, targetY - 3, 10, 6);

      // Explosions
      if (t - lastShot > 3.5) {
        lastShot = t;
        const ex = targetX + (Math.random() - 0.5) * 30;
        const ey = targetY + (Math.random() - 0.5) * 30;
        explosionFrames.push({ x: ex, y: ey, r: 2, age: 0 });
      }

      explosionFrames = explosionFrames.filter(exp => exp.age < 40);
      explosionFrames.forEach(exp => {
        exp.age++;
        exp.r += 0.8;
        const alpha = 1 - exp.age / 40;
        const eg = ctx.createRadialGradient(exp.x, exp.y, 0, exp.x, exp.y, exp.r);
        eg.addColorStop(0, `rgba(255,255,200,${alpha * 0.9})`);
        eg.addColorStop(0.5, `rgba(180,255,180,${alpha * 0.5})`);
        eg.addColorStop(1, 'transparent');
        ctx.fillStyle = eg;
        ctx.beginPath();
        ctx.arc(exp.x, exp.y, exp.r, 0, Math.PI * 2);
        ctx.fill();

        // Impact rings
        if (exp.age < 20) {
          ctx.strokeStyle = `rgba(150,255,150,${alpha * 0.4})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(exp.x, exp.y, exp.r * 1.5, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      // Main crosshair (center)
      const cx = w / 2;
      const cy = h / 2;
      ctx.strokeStyle = 'rgba(180,255,180,0.7)';
      ctx.lineWidth = 1;

      // Outer circle
      ctx.beginPath();
      ctx.arc(cx, cy, 40, 0, Math.PI * 2);
      ctx.stroke();

      // Inner circle
      ctx.beginPath();
      ctx.arc(cx, cy, 8, 0, Math.PI * 2);
      ctx.stroke();

      // Cross lines
      ctx.beginPath();
      ctx.moveTo(cx - 55, cy); ctx.lineTo(cx - 12, cy);
      ctx.moveTo(cx + 12, cy); ctx.lineTo(cx + 55, cy);
      ctx.moveTo(cx, cy - 55); ctx.lineTo(cx, cy - 12);
      ctx.moveTo(cx, cy + 12); ctx.lineTo(cx, cy + 55);
      ctx.stroke();

      // Rotating tracking indicator
      ctx.strokeStyle = 'rgba(180,255,180,0.3)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.arc(cx, cy, 60, t, t + 0.8);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, 60, t + Math.PI, t + Math.PI + 0.8);
      ctx.stroke();

      // Target lock indicator
      const lockDist = 20;
      ctx.strokeStyle = 'rgba(180,255,180,0.8)';
      ctx.lineWidth = 1.5;
      [[targetX - lockDist, targetY - lockDist, 8, 0], [targetX + lockDist, targetY - lockDist, 8, 1],
       [targetX - lockDist, targetY + lockDist, 8, 2], [targetX + lockDist, targetY + lockDist, 8, 3]].forEach(([x, y, s, corner]) => {
        ctx.beginPath();
        const xDir = corner === 1 || corner === 3 ? -1 : 1;
        const yDir = corner === 2 || corner === 3 ? -1 : 1;
        ctx.moveTo(x as number, (y as number) + yDir * (s as number));
        ctx.lineTo(x as number, y as number);
        ctx.lineTo((x as number) + xDir * (s as number), y as number);
        ctx.stroke();
      });

      // Film grain noise
      for (let i = 0; i < 80; i++) {
        const nx = Math.random() * w;
        const ny = Math.random() * h;
        ctx.fillStyle = `rgba(150,200,150,${Math.random() * 0.04})`;
        ctx.fillRect(nx, ny, 1, 1);
      }

      // Scanline effect
      for (let y = 0; y < h; y += 3) {
        ctx.fillStyle = 'rgba(0,0,0,0.08)';
        ctx.fillRect(0, y, w, 1);
      }

      // Horizontal roll artifact
      if (Math.sin(t * 7) > 0.97) {
        const ry = Math.random() * h;
        ctx.fillStyle = 'rgba(150,220,150,0.04)';
        ctx.fillRect(0, ry, w, 2);
      }

      // Vignette
      const vgrd = ctx.createRadialGradient(cx, cy, h * 0.2, cx, cy, h * 0.75);
      vgrd.addColorStop(0, 'transparent');
      vgrd.addColorStop(1, 'rgba(0,8,0,0.7)');
      ctx.fillStyle = vgrd;
      ctx.fillRect(0, 0, w, h);

      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  const altitude = 8240 + Math.floor(Math.sin(Date.now() / 3000) * 12);

  return (
    <div className="relative border border-hud-border bg-black" style={{ aspectRatio: '4/3' }}>
      <HudCorner position="tl" size={16} />
      <HudCorner position="tr" size={16} />
      <HudCorner position="bl" size={16} />
      <HudCorner position="br" size={16} />

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={480}
        height={360}
        className="w-full h-full"
        style={{ imageRendering: 'pixelated' }}
      />

      {/* HUD overlays */}
      {/* Top left */}
      <div className="absolute top-2 left-2 font-mono text-[9px] text-green-400 space-y-0.5 leading-tight">
        <div>AC-130U SPECTRE</div>
        <div>ALT: {altitude}ft MSL</div>
        <div>SPD: 300kt</div>
        <div>HDG: 247°</div>
      </div>

      {/* Top right */}
      <div className="absolute top-2 right-2 font-mono text-[9px] text-green-400 text-right space-y-0.5 leading-tight">
        <div>{time} UTC</div>
        <div>FLIR MODE: ON</div>
        <div>ZOOM: 4x</div>
        <div>CHAN: 2</div>
      </div>

      {/* Bottom left */}
      <div className="absolute bottom-2 left-2 font-mono text-[9px] text-green-400 space-y-0.5 leading-tight">
        <div>LAT: 34°22′N</div>
        <div>LON: 069°13′E</div>
        <div>TGT TRACK: ACTIVE</div>
      </div>

      {/* Bottom right */}
      <div className="absolute bottom-2 right-2 font-mono text-[9px] text-green-400 text-right space-y-0.5 leading-tight">
        <div>ROUNDS: 427</div>
        <div>105mm HOW</div>
        <div className="text-green-300 animate-pulse">■ FIRING</div>
      </div>

      {/* ZAГЛУШЕНО badge */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="relative">
          <div className="border-2 border-red-800 bg-black/80 px-6 py-3 text-center" style={{ transform: 'rotate(-2deg)' }}>
            <div className="text-red-600 font-mono text-xs tracking-[0.4em] uppercase font-bold">⬛ ЗАГЛУШЕНО</div>
            <div className="text-red-800 font-mono text-[8px] tracking-widest uppercase mt-0.5">Audio Feed Classified</div>
          </div>
          <HudCorner position="tl" size={10} />
          <HudCorner position="tr" size={10} />
          <HudCorner position="bl" size={10} />
          <HudCorner position="br" size={10} />
        </div>
      </div>

      {/* Green overlay tint */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(0,20,0,0.08)', mixBlendMode: 'multiply' }} />
    </div>
  );
};

export default AC130Screen;
