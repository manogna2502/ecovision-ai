import React from "react";

export function AnimatedBackground({ className = "" }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-grid-pattern bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,black,transparent)]" />
      <div className="absolute inset-0 bg-mesh-glow" />
      {Array.from({ length: 18 }).map((_, i) => {
        const left = (i * 47) % 100;
        const top = (i * 29) % 100;
        const duration = 8 + (i % 6);
        const size = i % 3 === 0 ? 3 : 2;
        return (
          <span
            key={i}
            className="absolute rounded-full bg-secondary/40 animate-pulse-glow"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: size,
              height: size,
              animationDuration: `${duration}s`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        );
      })}
    </div>
  );
}
