"use client";

type Point = { label: string; value: number };

export function LineChart({ points, height = 180 }: { points: Point[]; height?: number }) {
  const width = 600;

  if (points.length < 2) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-stone-400">
        Add at least two measurements to see the trend.
      </div>
    );
  }

  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pad = range * 0.2;
  const lo = min - pad;
  const hi = max + pad;
  const span = hi - lo || 1;

  const stepX = width / (points.length - 1);
  const toY = (v: number) => height - ((v - lo) / span) * (height - 24) - 12;

  const coords = points.map((p, i) => ({
    x: i * stepX,
    y: toY(p.value),
  }));

  const line = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x},${c.y}`).join(" ");
  const area = `${line} L${coords[coords.length - 1].x},${height} L0,${height} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Trend chart">
      <defs>
        <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#chart-fill)" />
      <path d={line} fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {coords.map((c, i) => (
        <g key={i}>
          <circle cx={c.x} cy={c.y} r="3.5" fill="#fff" stroke="#059669" strokeWidth="2" />
          <text x={c.x} y={c.y - 10} textAnchor="middle" fontSize="10" fill="#78716c">
            {points[i].value}
          </text>
        </g>
      ))}
      {points.map((p, i) => (
        <text
          key={`l-${i}`}
          x={i * stepX}
          y={height - 2}
          textAnchor="middle"
          fontSize="10"
          fill="#a8a29e"
        >
          {p.label}
        </text>
      ))}
    </svg>
  );
}