import React from 'react';

export default function SimpleLineChart({ points = [], width = 240, height = 60, stroke = '#2563eb' }) {
  if (!points || points.length === 0) return <div style={{ width, height, color: 'var(--text-muted)' }}>Pas de données</div>;

  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const stepX = width / Math.max(points.length - 1, 1);

  const path = points.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * height;
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
  }).join(' ');

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <path d={path} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
