import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  alphaDir: number;
}

interface Streak {
  x: number;
  y: number;
  length: number;
  angle: number;
  speed: number;
  alpha: number;
  width: number;
}

export default function LandingBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let W = 0;
    let H = 0;

    const PARTICLE_COUNT = 55;
    const STREAK_COUNT = 7;

    const particles: Particle[] = [];
    const streaks: Streak[] = [];

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };

    const spawnParticle = (): Particle => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.18,
      radius: Math.random() * 1.8 + 0.4,
      alpha: Math.random() * 0.5 + 0.1,
      alphaDir: Math.random() > 0.5 ? 1 : -1,
    });

    const spawnStreak = (): Streak => ({
      x: Math.random() * W * 1.4 - W * 0.2,
      y: Math.random() * H * 0.7,
      length: Math.random() * 180 + 80,
      angle: Math.PI * (Math.random() * 0.18 + 0.08),
      speed: Math.random() * 0.3 + 0.1,
      alpha: Math.random() * 0.06 + 0.02,
      width: Math.random() * 1.2 + 0.4,
    });

    resize();
    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(spawnParticle());
    for (let i = 0; i < STREAK_COUNT; i++) streaks.push(spawnStreak());

    // Wave state
    let waveT = 0;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // ── Soft ambient glow blobs ──
      const drawBlob = (cx: number, cy: number, r: number, alpha: number) => {
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        g.addColorStop(0, `rgba(236,72,153,${alpha})`);
        g.addColorStop(0.5, `rgba(190,24,93,${alpha * 0.3})`);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      };

      drawBlob(W * 0.18, H * 0.22, 340, 0.055);
      drawBlob(W * 0.82, H * 0.15, 280, 0.045);
      drawBlob(W * 0.5,  H * 0.55, 420, 0.03);
      drawBlob(W * 0.1,  H * 0.78, 200, 0.03);
      drawBlob(W * 0.88, H * 0.72, 250, 0.035);

      // ── Slow wave lines ──
      waveT += 0.003;
      for (let w = 0; w < 3; w++) {
        const yBase = H * (0.28 + w * 0.18);
        const amp = 28 + w * 14;
        const freq = 0.0025 - w * 0.0004;
        const phase = waveT + w * 1.4;
        const alpha = 0.035 - w * 0.008;

        ctx.beginPath();
        ctx.moveTo(0, yBase);
        for (let x = 0; x <= W; x += 3) {
          const y = yBase + Math.sin(x * freq + phase) * amp + Math.sin(x * freq * 0.4 + phase * 0.7) * amp * 0.4;
          ctx.lineTo(x, y);
        }
        const grad = ctx.createLinearGradient(0, 0, W, 0);
        grad.addColorStop(0,   'rgba(236,72,153,0)');
        grad.addColorStop(0.3, `rgba(236,72,153,${alpha})`);
        grad.addColorStop(0.7, `rgba(219,39,119,${alpha})`);
        grad.addColorStop(1,   'rgba(236,72,153,0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.2 - w * 0.3;
        ctx.stroke();
      }

      // ── Light streaks ──
      streaks.forEach(s => {
        const x2 = s.x + Math.cos(s.angle) * s.length;
        const y2 = s.y + Math.sin(s.angle) * s.length;
        const g = ctx.createLinearGradient(s.x, s.y, x2, y2);
        g.addColorStop(0,   'rgba(236,72,153,0)');
        g.addColorStop(0.4, `rgba(236,72,153,${s.alpha})`);
        g.addColorStop(0.7, `rgba(249,168,212,${s.alpha * 0.6})`);
        g.addColorStop(1,   'rgba(236,72,153,0)');
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = g;
        ctx.lineWidth = s.width;
        ctx.stroke();

        // drift streak slowly
        s.x += Math.cos(s.angle + Math.PI * 0.5) * s.speed * 0.4;
        s.y -= s.speed * 0.15;
        if (s.y + s.length < -60) {
          Object.assign(s, spawnStreak());
          s.y = H + 40;
        }
      });

      // ── Floating particles ──
      particles.forEach(p => {
        // pulse alpha
        p.alpha += p.alphaDir * 0.003;
        if (p.alpha > 0.65 || p.alpha < 0.08) p.alphaDir *= -1;

        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10;
        if (p.y > H + 10) p.y = -10;

        const pg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 3);
        pg.addColorStop(0, `rgba(249,168,212,${p.alpha})`);
        pg.addColorStop(0.5, `rgba(236,72,153,${p.alpha * 0.4})`);
        pg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = pg;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <>
      {/* Canvas layer */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 0 }}
      />
      {/* Static CSS gradient layer for depth */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 0,
          background:
            'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(236,72,153,0.07) 0%, transparent 70%), ' +
            'radial-gradient(ellipse 60% 40% at 10% 80%, rgba(190,24,93,0.05) 0%, transparent 60%)',
        }}
      />
      {/* Noise texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.025] mix-blend-overlay"
        style={{
          zIndex: 0,
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
          backgroundSize: '180px 180px',
        }}
      />
    </>
  );
}
