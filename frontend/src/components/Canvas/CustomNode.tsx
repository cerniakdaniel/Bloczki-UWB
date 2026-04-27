import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

const W = 140;
const H = 55;

function RectShape({ color, selected }: { color: string; selected: boolean }) {
  return (
    <svg width={W} height={H} style={{ overflow: 'visible' }}>
      <rect x={0} y={0} width={W} height={H} rx={4}
        fill={color} stroke={selected ? '#6366f1' : '#333'}
        strokeWidth={selected ? 2.5 : 1.5} />
    </svg>
  );
}

function CircleShape({ color, selected, r = 40 }: { color: string; selected: boolean; r?: number }) {
  return (
    <svg width={r * 2} height={r * 2} style={{ overflow: 'visible' }}>
      <circle cx={r} cy={r} r={r - 1}
        fill={color} stroke={selected ? '#6366f1' : '#333'}
        strokeWidth={selected ? 2.5 : 1.5} />
    </svg>
  );
}

export default function CustomNode({ data, selected }: NodeProps) {
  const isStart = data.type === 'START';
  const isStop = data.type === 'STOP';
  const handleStyle = { background: '#555', width: 10, height: 10 };
  const textOverlay: React.CSSProperties = {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    pointerEvents: 'none',
  };

  if (isStart || isStop) {
    const r = 38;
    return (
      <div style={{ position: 'relative', width: r * 2, height: r * 2 }}>
        <CircleShape color={data.color} selected={selected} r={r} />
        <div style={textOverlay}>
          <span style={{ fontWeight: 'bold', fontSize: 13 }}>{isStart ? 'START' : 'STOP'}</span>
        </div>
        <Handle type="target" position={Position.Top} style={handleStyle} />
        <Handle type="source" position={Position.Bottom} style={handleStyle} />
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: W, height: H }}>
      <RectShape color={data.color} selected={selected} />
      <div style={textOverlay}>
        <div style={{ fontSize: 8, opacity: 0.6, fontWeight: 'bold' }}>Operacja</div>
        <input value={data.content} onChange={e => data.onChange(e.target.value)}
          placeholder="np. suma = a + b"
          style={{ background: 'transparent', border: 'none', textAlign: 'center',
            fontSize: 11, width: '90%', outline: 'none', fontWeight: 'bold', pointerEvents: 'all' }}
        />
      </div>
      <Handle type="target" position={Position.Top} style={handleStyle} />
      <Handle type="source" position={Position.Bottom} style={handleStyle} />
    </div>
  );
}