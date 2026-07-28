"use client";

import { cn } from "@/lib/utils";

interface ScoreRingProps {
  score: number; // 0-100
  size?: number;
  stroke?: number;
  label?: string;
  sublabel?: string;
  className?: string;
  animate?: boolean;
}

function colorFor(score: number): string {
  if (score >= 85) return "oklch(0.62 0.15 162)"; // emerald
  if (score >= 68) return "oklch(0.75 0.16 85)"; // amber
  if (score >= 50) return "oklch(0.72 0.15 55)"; // orange
  return "oklch(0.62 0.2 25)"; // red
}

export function ScoreRing({
  score,
  size = 160,
  stroke = 14,
  label,
  sublabel,
  className,
  animate = true,
}: ScoreRingProps) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const offset = circumference - (clamped / 100) * circumference;
  const color = colorFor(clamped);

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        className="score-ring -rotate-90"
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={stroke}
          opacity={0.35}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animate ? offset : circumference - (clamped / 100) * circumference}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-bold tabular-nums leading-none"
          style={{ color, fontSize: size * 0.28 }}
        >
          {Math.round(clamped)}
        </span>
        {label && (
          <span className="text-muted-foreground mt-1" style={{ fontSize: size * 0.09 }}>
            {label}
          </span>
        )}
        {sublabel && (
          <span className="text-muted-foreground/70" style={{ fontSize: size * 0.075 }}>
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}
