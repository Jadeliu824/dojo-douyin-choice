'use client';

interface RadarChartProps {
  scores: Record<string, number>;
  size?: number;
}

const DIMENSIONS = [
  { key: 'empathy',    label: '同理心',   color: '#FF6B6B' },
  { key: 'boundary',   label: '边界感',   color: '#4A9EFF' },
  { key: 'eq',         label: '情绪克制', color: '#9FE050' },
  { key: 'clarity',    label: '逻辑清晰', color: '#FF9F4A' },
  { key: 'constructive', label: '建设表达', color: '#C084FC' },
];

export function calcRadarScores(finalScore: number, knowledgePoints?: string[]): Record<string, number> {
  const base = Math.round(finalScore / 20) * 10;
  const kp = (knowledgePoints || []).join(' ');

  const boosts: Record<string, number> = {
    empathy: kp.includes('感受') || kp.includes('同理') || kp.includes('观察') ? 15 : 0,
    boundary: kp.includes('拒绝') || kp.includes('边界') || kp.includes('隔离') ? 15 : 0,
    eq: kp.includes('情绪') || kp.includes('冷静') || kp.includes('克制') ? 15 : 0,
    clarity: kp.includes('逻辑') || kp.includes('事实') || kp.includes('具体') ? 15 : 0,
    constructive: kp.includes('建设') || kp.includes('坦诚') || kp.includes('请求') ? 15 : 0,
  };

  return {
    empathy: Math.min(100, Math.max(10, base + boosts.empathy + (finalScore > 80 ? 10 : finalScore < 30 ? -10 : 0))),
    boundary: Math.min(100, Math.max(10, base + boosts.boundary + Math.round(Math.random() * 10 - 5))),
    eq: Math.min(100, Math.max(10, base + boosts.eq + (finalScore > 80 ? 5 : finalScore < 30 ? -15 : 0))),
    clarity: Math.min(100, Math.max(10, base + boosts.clarity + Math.round(Math.random() * 10 - 5))),
    constructive: Math.min(100, Math.max(10, base + boosts.constructive + Math.round(Math.random() * 10 - 5))),
  };
}

export default function RadarChart({ scores, size = 200 }: RadarChartProps) {
  // Use a larger canvas internally with padding so labels don't clip
  const pad = 36;
  const viewSize = size + pad * 2;
  const cx = viewSize / 2;
  const cy = viewSize / 2;
  const r = size * 0.36;
  const levels = 5;

  const angleStep = (Math.PI * 2) / DIMENSIONS.length;
  const startAngle = -Math.PI / 2;

  const getPoint = (value: number, index: number, radius: number) => {
    const angle = startAngle + index * angleStep;
    const dist = (value / 100) * radius;
    return {
      x: cx + dist * Math.cos(angle),
      y: cy + dist * Math.sin(angle),
    };
  };

  const gridPaths = Array.from({ length: levels }, (_, level) => {
    const levelRadius = (r / levels) * (level + 1);
    const points = DIMENSIONS.map((_, i) => {
      const angle = startAngle + i * angleStep;
      return `${cx + levelRadius * Math.cos(angle)},${cy + levelRadius * Math.sin(angle)}`;
    });
    return points.join(' ');
  });

  const dataPoints = DIMENSIONS.map((_, i) => {
    const p = getPoint(scores[DIMENSIONS[i].key] || 50, i, r);
    return `${p.x},${p.y}`;
  });

  const axes = DIMENSIONS.map((dim, i) => {
    const angle = startAngle + i * angleStep;
    const x2 = cx + r * Math.cos(angle);
    const y2 = cy + r * Math.sin(angle);
    const labelR = r + 20;
    const lx = cx + labelR * Math.cos(angle);
    const ly = cy + labelR * Math.sin(angle);
    return { dim, i, x2, y2, lx, ly };
  });

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${viewSize} ${viewSize}`}
      style={{ display: 'block' }}
    >
      {/* Grid */}
      {gridPaths.map((points, i) => (
        <polygon key={i} points={points} fill="none" stroke="#E5E5E5" strokeWidth={1} />
      ))}

      {/* Axes */}
      {axes.map((a) => (
        <line key={a.i} x1={cx} y1={cy} x2={a.x2} y2={a.y2} stroke="#E5E5E5" strokeWidth={1} />
      ))}

      {/* Data polygon */}
      <polygon
        points={dataPoints.join(' ')}
        fill="rgba(159,224,80,0.2)"
        stroke="#9FE050"
        strokeWidth={2}
      />

      {/* Data points */}
      {DIMENSIONS.map((dim, i) => {
        const p = getPoint(scores[dim.key] || 50, i, r);
        return <circle key={i} cx={p.x} cy={p.y} r={3} fill="#9FE050" />;
      })}

      {/* Labels */}
      {axes.map((a) => {
        const score = scores[a.dim.key] || 0;
        return (
          <g key={a.i}>
            <text
              x={a.lx}
              y={a.ly}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={13}
              fontWeight={700}
              fill="#111"
              fontFamily="-apple-system, 'PingFang SC', 'Noto Sans SC', sans-serif"
            >
              {a.dim.label}
            </text>
            <text
              x={a.lx}
              y={a.ly + 16}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={11}
              fontWeight={800}
              fill={a.dim.color}
              fontFamily="-apple-system, 'PingFang SC', 'Noto Sans SC', sans-serif"
            >
              {score}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
