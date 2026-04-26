import React from 'react';
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';

export default function Canvas() {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow>
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}