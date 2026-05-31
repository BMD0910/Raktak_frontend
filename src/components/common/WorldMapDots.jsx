import React from 'react';

// WorldMapDots: uses a stylized world illustration (SVG shapes) as background
// and overlays animated dots. This component intentionally uses an
// illustrative map (not a geographic-accurate path) to match the design request.
export default function WorldMapDots({ cities = [], width = 800, height = 360 }) {
  const toXY = (lat, lng) => {
    // simple equirectangular mapping to place dots roughly over illustration
    const x = ((lng + 180) / 360) * width;
    const y = ((90 - lat) / 180) * height;
    return { x, y };
  };

  const dots = (cities || []).filter(c => typeof c.lat === 'number' && typeof c.lng === 'number');

  // Use background image in a positioned div and overlay an SVG for dots.
  const paddingTop = (height / width) * 100; // percentage for responsive ratio

  return (
    <div className="map-container" style={{ maxWidth: width }}>
      <div className="map-bg" style={{ position: 'relative', width: '100%', paddingTop: `${paddingTop}%`, backgroundImage: `url(/assets/images/carte.png)`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: 8, overflow: 'hidden' }}>
        <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} aria-hidden="true">
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
          </filter>
          </defs>

          {/* Overlay dots */}
          {dots.map((c, idx) => {
            const { x, y } = toXY(c.lat, c.lng);
            return (
              <g key={`dot-${idx}`} transform={`translate(${x}, ${y})`} className="map-dot-group">
                <circle r="12" fill="rgba(37,99,235,0.12)" />
                <circle r="6" className="dot" fill="#2563EB" stroke="#fff" strokeWidth="1" />
                <circle r="16" className="pulse" fill="#2563EB" opacity="0.16" filter="url(#glow)" />
                {c.name ? <title>{c.name}</title> : null}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
