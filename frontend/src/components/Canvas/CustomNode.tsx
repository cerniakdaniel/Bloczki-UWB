import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

const W = 140;
const H = 55;

function ParallelogramShape({ color, selected }: { color: string; selected: boolean }) {
  const skew = 15;
  const points = `${skew},0 ${W},0 ${W - skew},${H} 0,${H}`;
  return (
    <svg width={W} height={H} style={{ overflow: 'visible' }}>
      <polygon points={points} fill={color}
        stroke={selected ? '#6366f1' : '#333'}
        strokeWidth={selected ? 2.5 : 1.5} />
    </svg>
  );
}

function DiamondShape({ color, selected, size = 90 }: { color: string; selected: boolean; size?: number }) {
  const half = size / 2;
  const points = `${half},0 ${size},${half} ${half},${size} 0,${half}`;
  return (
    <svg width={size} height={size} style={{ overflow: 'visible' }}>
      <polygon points={points} fill={color}
        stroke={selected ? '#6366f1' : '#333'}
        strokeWidth={selected ? 2.5 : 1.5} />
    </svg>
  );
}

function RectShape({ color, selected }: { color: string; selected: boolean }) {
  return (
    <svg width={W} height={H} style={{ overflow: 'visible' }}>
      <rect x={0} y={0} width={W} height={H} rx={4} fill={color}
        stroke={selected ? '#6366f1' : '#333'}
        strokeWidth={selected ? 2.5 : 1.5} />
    </svg>
  );
}

function CircleShape({ color, selected, r = 40 }: { color: string; selected: boolean; r?: number }) {
  return (
    <svg width={r * 2} height={r * 2} style={{ overflow: 'visible' }}>
      <circle cx={r} cy={r} r={r - 1} fill={color}
        stroke={selected ? '#6366f1' : '#333'}
        strokeWidth={selected ? 2.5 : 1.5} />
    </svg>
  );
}

const LABELS: Record<string, string> = {
  START: 'START', STOP: 'STOP',
  OPERATION: 'Operacja', INPUT: 'Wejście (read)',
  OUTPUT: 'Wyjście (write)', CONDITION: 'Warunek (if)',
  LOOP_WHILE: 'Pętla While', LOOP_FOR: 'Pętla For',
};

export default function CustomNode({ data, selected }: NodeProps) {
  const isStart = data.type === 'START';
  const isStop  = data.type === 'STOP';
  const isParallelogram = data.type === 'INPUT' || data.type === 'OUTPUT';
  const isDiamond = data.type === 'CONDITION' || data.type === 'LOOP_WHILE' || data.type === 'LOOP_FOR';
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

  if (isParallelogram) {
    return (
      <div style={{ position: 'relative', width: W, height: H }}>
        <ParallelogramShape color={data.color} selected={selected} />
        <div style={{ ...textOverlay, paddingLeft: 4 }}>
          <div style={{ fontSize: 8, opacity: 0.6, fontWeight: 'bold' }}>{LABELS[data.type]}</div>
          <textarea value={data.content} onChange={e => data.onChange(e.target.value)}
            placeholder={data.type === 'INPUT' ? 'read a\nread b' : 'write wynik'}
            rows={2}
            style={{ background: 'transparent', border: 'none', textAlign: 'center',
              fontSize: 11, width: '85%', outline: 'none', fontWeight: 'bold',
              resize: 'none', pointerEvents: 'all', lineHeight: 1.4, fontFamily: 'monospace' }}
          />
        </div>
        <Handle type="target" position={Position.Top} style={handleStyle} />
        <Handle type="source" position={Position.Bottom} style={handleStyle} />
      </div>
    );
  }

  if (isDiamond) {
    const size = 100;
    return (
      <div style={{ position: 'relative', width: size, height: size }}>
        <DiamondShape color={data.color} selected={selected} size={size} />
        <div style={textOverlay}>
          <div style={{ fontSize: 8, opacity: 0.6, fontWeight: 'bold' }}>{LABELS[data.type]}</div>
          <input value={data.content} onChange={e => data.onChange(e.target.value)}
            placeholder="warunek..."
            style={{ background: 'transparent', border: 'none', textAlign: 'center',
              fontSize: 10, width: '70%', outline: 'none', fontWeight: 'bold', pointerEvents: 'all' }}
          />
        </div>
        <Handle type="target" position={Position.Top} style={handleStyle} />
        <Handle type="source" position={Position.Bottom} id="nie" style={{ ...handleStyle, bottom: -5 }} />
        <Handle type="source" position={Position.Right} id="tak" style={handleStyle} />
        <Handle type="source" position={Position.Left} id="left" style={handleStyle} />
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: W, height: H }}>
      <RectShape color={data.color} selected={selected} />
      <div style={textOverlay}>
        <div style={{ fontSize: 8, opacity: 0.6, fontWeight: 'bold' }}>{LABELS[data.type]}</div>
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