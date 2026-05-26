import React, { useEffect, useRef, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  opacity: number;
  pulseSpeed: number;
  pulsePhase: number;
  baseOpacity: number;
}

interface TemporaryDust {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  decay: number;
}

export const CosmicCanvasBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });
  const [windowDimensions, setWindowDimensions] = useState({ width: 1200, height: 800 });

  // Array of celestial/nebula colors
  const colors = [
    'rgba(99, 102, 241, ',  // Indigo
    'rgba(168, 85, 247, ',  // Purple
    'rgba(236, 72, 153, ',  // Pink / Nebula
    'rgba(34, 211, 238, ',  // Cyan
    'rgba(52, 211, 153, ',  // Emerald Aurora
    'rgba(245, 158, 11, ',  // Gold stars
    'rgba(255, 255, 255, '  // White stardust
  ];

  // Particle list
  const particlesRef = useRef<Particle[]>([]);
  const temporaryDustRef = useRef<TemporaryDust[]>([]);

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const width = window.innerWidth;
        const height = window.innerHeight;
        canvasRef.current.width = width;
        canvasRef.current.height = height;
        setWindowDimensions({ width, height });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    // Initialize 65 stardust particles
    const particles: Particle[] = [];
    const count = Math.min(65, Math.floor((window.innerWidth * window.innerHeight) / 25000) + 20);

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.38, // very soft cosmic drift
        vy: (Math.random() - 0.5) * 0.38,
        radius: Math.random() * 2.2 + 0.8,
        color: colors[Math.floor(Math.random() * colors.length)],
        baseOpacity: Math.random() * 0.35 + 0.2,
        opacity: Math.random(),
        pulseSpeed: 0.005 + Math.random() * 0.015,
        pulsePhase: Math.random() * Math.PI * 2
      });
    }
    particlesRef.current = particles;

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Track mouse coordinates
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY,
        active: true
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    // Splash dynamic star dust on click/touch
    const handleClick = (e: MouseEvent) => {
      const clickColor = colors[Math.floor(Math.random() * colors.length)];
      const numDust = Math.floor(Math.random() * 8) + 8;
      
      for (let i = 0; i < numDust; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 1.8 + 0.4;
        temporaryDustRef.current.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: Math.random() * 3.5 + 1.2,
          color: clickColor,
          alpha: 0.9,
          decay: 0.012 + Math.random() * 0.015 // dissolves over ~1-2 seconds
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('click', handleClick);
    };
  }, []);

  // Frame Loop
  useEffect(() => {
    let animationId = 0;
    let isPaused = false;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        isPaused = true;
        if (animationId) {
          cancelAnimationFrame(animationId);
          animationId = 0;
        }
      } else {
        isPaused = false;
        if (!animationId) {
          animationId = requestAnimationFrame(tick);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    const tick = () => {
      if (isPaused) return;

      const canvas = canvasRef.current;
      if (!canvas) {
        animationId = requestAnimationFrame(tick);
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animationId = requestAnimationFrame(tick);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Render glowing ambient nebulae underlay
      const gradient = ctx.createRadialGradient(
        canvas.width * 0.3, canvas.height * 0.3, 10,
        canvas.width * 0.3, canvas.height * 0.3, Math.max(canvas.width, canvas.height) * 0.5
      );
      gradient.addColorStop(0, 'rgba(30, 27, 75, 0.04)');   // Indigo-950 glow under
      gradient.addColorStop(0.5, 'rgba(88, 28, 135, 0.01)'); // Purple-900 faint glow
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const mouse = mouseRef.current;
      const particles = particlesRef.current;
      const temporaryDust = temporaryDustRef.current;

      // 2. Draw Faint Constellation Lines (Joining)
      const maxDistance = 125;
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.hypot(dx, dy);

          if (dist < maxDistance) {
            // Stronger opacity the closer they are
            const alpha = (1 - dist / maxDistance) * 0.13 * p1.opacity * p2.opacity;
            ctx.strokeStyle = `rgba(129, 140, 248, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }

        // Draw line to user's interactive pointer if nearby
        if (mouse.active) {
          const mdx = p1.x - mouse.x;
          const mdy = p1.y - mouse.y;
          const mdist = Math.hypot(mdx, mdy);
          if (mdist < 180) {
            const mAlpha = (1 - mdist / 180) * 0.16 * p1.opacity;
            ctx.strokeStyle = `rgba(165, 180, 252, ${mAlpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();

            // Very gentle pull towards cursor (cosmic gravity join currents)
            const force = (1 - mdist / 180) * 0.05;
            p1.vx += (mouse.x - p1.x) / mdist * force * 0.15;
            p1.vy += (mouse.y - p1.y) / mdist * force * 0.15;
          }
        }
      }

      // 3. Update & Draw Ambient Floating Particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Soft pulse/breathing logic (Dissolving and forming)
        p.pulsePhase += p.pulseSpeed;
        p.opacity = p.baseOpacity + Math.sin(p.pulsePhase) * (p.baseOpacity * 0.7);
        if (p.opacity < 0.02) p.opacity = 0.02;

        p.x += p.vx;
        p.y += p.vy;

        // Wrap around borders gracefully with a tiny fade
        if (p.x < -10) p.x = canvas.width + 10;
        else if (p.x > canvas.width + 10) p.x = -10;
        
        if (p.y < -10) p.y = canvas.height + 10;
        else if (p.y > canvas.height + 10) p.y = -10;

        // Speed dampener/cap
        p.vx *= 0.992;
        p.vy *= 0.992;

        // Render particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.opacity})`;
        ctx.fill();

        // Optional star glow aura for larger dust
        if (p.radius > 1.8) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 3.5, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color}${p.opacity * 0.12})`;
          ctx.fill();
        }
      }

      // 4. Update & Draw Temporary Dust Splash (Expanding & dissolving)
      for (let idx = temporaryDust.length - 1; idx >= 0; idx--) {
        const d = temporaryDust[idx];
        d.x += d.vx;
        d.y += d.vy;
        d.alpha -= d.decay;
        d.vx *= 0.96; // decelerate
        d.vy *= 0.96;

        if (d.alpha <= 0) {
          temporaryDust.splice(idx, 1);
          continue;
        }

        ctx.beginPath();
        const startPath = Math.PI * 2;
        ctx.arc(d.x, d.y, d.radius, 0, startPath);
        ctx.fillStyle = `${d.color}${d.alpha})`;
        ctx.fill();

        // Faint light aura
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.radius * 3.2, 0, startPath);
        ctx.fillStyle = `${d.color}${d.alpha * 0.14})`;
        ctx.fill();
      }

      animationId = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      cancelAnimationFrame(animationId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full z-0 pointer-events-none select-none"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};
