import React from 'react';

export default function Sparkline({ data = [], width = 120, height = 36, stroke = '#0ea5a4', fill = 'rgba(14,165,164,0.08)' }) {
  if (!Array.isArray(data) || data.length === 0) return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <rect width={width} height={height} fill="var(--bg-subtle)" />
    </svg>
  );

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1 || 1);

  const points = data.map((v, i) => {
    const x = i * step;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  const areaPath = `M0,${height} L${points.split(' ').join(' L ')} L${width},${height} Z`;
  const linePath = `M${points.split(' ').join(' L ')}`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <path d={areaPath} fill={fill} />
      <path d={linePath} fill="none" stroke={stroke} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
