import React from 'react';
import { Handle, Position } from 'reactflow';

const H: React.CSSProperties = {
  width: 10, height: 10,
  background: 'transparent',
  border: 'none',
};

export default function JunctionNode({ selected }: any) {
  return (
    <div style={{
      width: 24, height: 24, borderRadius: '50%',
      background: 'white',
      border: selected ? '2px solid #6366f1' : '2px solid #333',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative',
    }}>
      <svg width="10" height="10" viewBox="0 0 10 10">
        <line x1="1" y1="1" x2="9" y2="9" stroke="#333" strokeWidth="1.5"/>
        <line x1="9" y1="1" x2="1" y2="9" stroke="#333" strokeWidth="1.5"/>
      </svg>
      <Handle type="source" position={Position.Top}    id="top"    style={H} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={H} />
      <Handle type="source" position={Position.Left}   id="left"   style={H} />
      <Handle type="source" position={Position.Right}  id="right"  style={H} />
    </div>
  );
}