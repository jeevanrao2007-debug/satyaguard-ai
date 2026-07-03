import React, { useEffect, useState, useMemo } from "react";
import { motion } from "motion/react";

interface Particle {
  id: number;
  depth: number;
  size: number;
  left: string;
  top: string;
  color: string;
  speed: number;
  delay: number;
  driftX: number;
  driftY: number;
}

export default function ParticlesBackground() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize coordinate around center-origin (-0.5 to 0.5)
      const x = (e.clientX / window.innerWidth) - 0.5;
      const y = (e.clientY / window.innerHeight) - 0.5;
      setMouse({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Generate stable random particles coordinate, speed, and depth properties
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: 32 }).map((_, i) => {
      const depth = Math.random() * 0.9 + 0.1; // 0.1 (farthest, deep background) to 1.0 (closest)
      const size = depth * 4 + 1.5; // 1.5px to 5.5px
      const isIndigo = Math.random() > 0.5;
      const color = isIndigo 
        ? `rgba(99, 102, 241, ${depth * 0.5 + 0.15})` // Indigo
        : `rgba(6, 182, 212, ${depth * 0.5 + 0.15})`; // Cyan
      
      return {
        id: i,
        depth,
        size,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        color,
        speed: (1.1 - depth) * 25 + 15, // Farthest float slower (up to 40s), closest float faster (15s)
        delay: Math.random() * -40, // Pre-distribute on start
        driftX: (Math.random() - 0.5) * 100, // Horizontal wave variance
        driftY: -120 - Math.random() * 180, // Scrolling upward offset
      };
    });
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" style={{ perspective: "1000px" }}>
      {particles.map((p) => {
        // Subtle depth-based interactive displacement (closer items move more)
        const parallaxX = mouse.x * p.depth * 70;
        const parallaxY = mouse.y * p.depth * 70;

        return (
          <motion.div
            key={p.id}
            className="absolute"
            style={{
              left: p.left,
              top: p.top,
              transformStyle: "preserve-3d",
            }}
            animate={{
              // Perpetual depth-scrolling drift upwards
              y: [0, p.driftY],
              x: [0, p.driftX],
              opacity: [0, p.depth * 0.7 + 0.2, 0],
            }}
            transition={{
              duration: p.speed,
              repeat: Infinity,
              ease: "linear",
              delay: p.delay,
            }}
          >
            <div
              className="rounded-full"
              style={{
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
                filter: `blur(${Math.max(0, (1 - p.depth) * 1.5)}px)`,
                // 3D parallax offset displacement based on depth layer
                transform: `translate3d(${parallaxX}px, ${parallaxY}px, ${p.depth * 150}px)`,
                transformStyle: "preserve-3d",
                transition: "transform 0.8s cubic-bezier(0.1, 0.9, 0.2, 1)",
              }}
            />
          </motion.div>
        );
      })}
    </div>
  );
}
