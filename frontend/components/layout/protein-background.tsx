"use client";

import { useEffect, useRef } from "react";

type Strand = {
  points: { x: number; y: number }[];
  dx: number;
  dy: number;
  phase: number;
  color: string;
  lineWidth: number;
};

type Residue = {
  x: number;
  y: number;
  dx: number;
  dy: number;
  label: string;
};

const RESIDUES = [
  "ALA", "GLY", "LEU", "VAL", "SER", "THR", "LYS", "ARG",
  "ASP", "GLU", "PHE", "TYR", "TRP", "PRO",
];

const STRAND_COLORS = ["#BC7EBF", "#384F95", "#8E68A9"];

export function ProteinBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const strandsRef = useRef<Strand[]>([]);
  const residuesRef = useRef<Residue[]>([]);
  const sizeRef = useRef({ w: 0, h: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      sizeRef.current = { w, h };
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initScene(w, h);
    };

    const initScene = (w: number, h: number) => {
      const strands: Strand[] = [];
      for (let i = 0; i < 18; i++) {
        const points = [];
        const startX = Math.random() * w;
        const startY = Math.random() * h;
        const spread = 220 + Math.random() * 260;
        for (let p = 0; p < 6; p++) {
          points.push({
            x: startX + (Math.random() - 0.5) * spread,
            y: startY + (Math.random() - 0.5) * spread,
          });
        }
        strands.push({
          points,
          dx: (Math.random() - 0.5) * 0.12,
          dy: (Math.random() - 0.5) * 0.08,
          phase: Math.random() * Math.PI * 2,
          color:
            STRAND_COLORS[Math.floor(Math.random() * STRAND_COLORS.length)],
          lineWidth: 1.5 + Math.random() * 1.0,
        });
      }
      strandsRef.current = strands;

      const residues: Residue[] = [];
      for (let i = 0; i < 30; i++) {
        residues.push({
          x: Math.random() * w,
          y: Math.random() * h,
          dx: (Math.random() - 0.5) * 0.3,
          dy: (Math.random() - 0.5) * 0.2,
          label: RESIDUES[Math.floor(Math.random() * RESIDUES.length)],
        });
      }
      residuesRef.current = residues;
    };

    const draw = () => {
      const { w, h } = sizeRef.current;
      ctx.clearRect(0, 0, w, h);

      const strands = strandsRef.current;
      for (const s of strands) {
        for (let i = 0; i < s.points.length; i++) {
          const p = s.points[i];
          p.x += s.dx;
          p.y += s.dy;
          p.x += Math.sin((performance.now() / 4000) + s.phase + i) * 0.05;
          if (p.x < -100) p.x = w + 100;
          if (p.x > w + 100) p.x = -100;
          if (p.y < -100) p.y = h + 100;
          if (p.y > h + 100) p.y = -100;
        }
        ctx.beginPath();
        ctx.moveTo(s.points[0].x, s.points[0].y);
        for (let i = 1; i < s.points.length - 2; i++) {
          const midX = (s.points[i].x + s.points[i + 1].x) / 2;
          const midY = (s.points[i].y + s.points[i + 1].y) / 2;
          ctx.quadraticCurveTo(s.points[i].x, s.points[i].y, midX, midY);
        }
        ctx.strokeStyle = s.color;
        ctx.globalAlpha = 0.08;
        ctx.lineWidth = s.lineWidth;
        ctx.stroke();
      }

      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillStyle = "#A6BAEE";
      ctx.globalAlpha = 0.1;
      for (const r of residuesRef.current) {
        r.x += r.dx;
        r.y += r.dy;
        if (r.x < -40) r.x = w + 40;
        if (r.x > w + 40) r.x = -40;
        if (r.y < -20) r.y = h + 20;
        if (r.y > h + 20) r.y = -20;
        ctx.fillText(r.label, r.x, r.y);
      }

      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(draw);
    };

    resize();
    if (reducedMotion) {
      drawOnce(ctx, sizeRef.current.w, sizeRef.current.h);
    } else {
      rafRef.current = requestAnimationFrame(draw);
    }

    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    const handleResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 100);
    };

    const handleVisibility = () => {
      if (document.hidden) {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      } else if (!reducedMotion && rafRef.current === null) {
        rafRef.current = requestAnimationFrame(draw);
      }
    };

    window.addEventListener("resize", handleResize);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (resizeTimer) clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -1,
        pointerEvents: "none",
      }}
    />
  );
}

function drawOnce(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number
) {
  ctx.clearRect(0, 0, w, h);
  ctx.font = '11px "JetBrains Mono", monospace';
  ctx.fillStyle = "#A6BAEE";
  ctx.globalAlpha = 0.1;
  const labels = ["ALA", "GLY", "LEU", "VAL", "SER", "THR"];
  for (let i = 0; i < 20; i++) {
    ctx.fillText(
      labels[i % labels.length],
      Math.random() * w,
      Math.random() * h
    );
  }
  ctx.globalAlpha = 1;
}
