import React, { useCallback, useState } from 'react';
import ReactFlow, {
  Background, Controls, MiniMap,
  useNodesState, useEdgesState,
  Connection, Edge, Node, MarkerType, NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { BlockType } from '../../types';
import CustomNode from './CustomNode';
import EdgeLabelModal from './EdgeLabelModal';

const nodeTypes: NodeTypes = { custom: CustomNode };

const BLOCK_COLORS: Record<string, string> = {
  START: '#4ade80', STOP: '#f87171',
  OPERATION: '#60a5fa', INPUT: '#a78bfa',
  OUTPUT: '#fb923c', CONDITION: '#fbbf24',
  LOOP_WHILE: '#34d399', LOOP_FOR: '#22d3ee',
};

const BLOCKS: { type: BlockType; label: string; color: string }[] = [
  { type: 'START',      label: 'Start',               color: '#4ade80' },
  { type: 'INPUT',      label: 'Wejście (read)',       color: '#a78bfa' },
  { type: 'OPERATION',  label: 'Operacja (operation)', color: '#60a5fa' },
  { type: 'OUTPUT',     label: 'Wyjście (write)',      color: '#fb923c' },
  { type: 'STOP',       label: 'Stop',                color: '#f87171' },
  { type: 'CONDITION',  label: 'Warunek (if)',         color: '#fbbf24' },
  { type: 'LOOP_WHILE', label: 'Pętla While',          color: '#34d399' },
  { type: 'LOOP_FOR',   label: 'Pętla For',            color: '#22d3ee' },
];

const makeEdge = (params: Connection, label: string): Edge => ({
  id: `e_${Date.now()}_${Math.random()}`,
  source: params.source!, target: params.target!,
  sourceHandle: params.sourceHandle, targetHandle: params.targetHandle,
  label, data: { label }, type: 'smoothstep',
  markerEnd: { type: MarkerType.ArrowClosed, width: 15, height: 15, color: '#222' },
  style: { strokeWidth: 2, stroke: '#222' },
});

interface Props {
  diagramId: string;
  onSave: (nodes: Node[], edges: Edge[]) => void;
  onUnsavedChange: (hasChanges: boolean) => void;
}

export default function Canvas({ diagramId, onSave, onUnsavedChange }: Props) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [pendingEdge, setPendingEdge] = useState<Connection | null>(null);
  const [edgeLabel, setEdgeLabel] = useState('');

  const onConnect = useCallback((params: Connection) => {
    setPendingEdge(params);
    setEdgeLabel('');
  }, []);

  const confirmEdge = () => {
    if (!pendingEdge) return;
    setEdges(eds => [...eds, makeEdge(pendingEdge, edgeLabel)]);
    setPendingEdge(null);
    setEdgeLabel('');
    onUnsavedChange(true);
  };

  const addBlock = (type: BlockType, color: string) => {
    const id = `${type}_${Date.now()}`;
    setNodes(nds => [...nds, {
      id, type: 'custom',
      position: { x: 300 + Math.random() * 80, y: 100 + Math.random() * 80 },
      data: {
        type, color, content: '',
        onChange: (content: string) => {
          setNodes(ns => ns.map(n => n.id === id ? { ...n, data: { ...n.data, content } } : n));
          onUnsavedChange(true);
        }
      }
    }]);
    onUnsavedChange(true);
  };

  const deleteSelected = () => {
    setNodes(nds => nds.filter(n => !n.selected));
    setEdges(eds => eds.filter(e => !e.selected));
    onUnsavedChange(true);
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex' }}>
      <div style={{ width: 190, background: '#1e1e2e', padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ color: '#aaa', fontSize: 10, fontWeight: 'bold', marginBottom: 2 }}>BLOKI</div>
        {BLOCKS.map(b => (
          <button key={b.type} onClick={() => addBlock(b.type, b.color)} style={{
            background: b.color, border: 'none', borderRadius: 6,
            padding: '7px 8px', cursor: 'pointer', fontWeight: 'bold', fontSize: 10, textAlign: 'left'
          }}>{b.label}</button>
        ))}
        <div style={{ flex: 1 }} />
        <button onClick={deleteSelected} style={{
          background: '#ef4444', color: 'white', border: 'none',
          borderRadius: 6, padding: '7px', cursor: 'pointer', fontWeight: 'bold', fontSize: 11
        }}>🗑️ Usuń zaznaczone</button>
        <button onClick={() => onSave(nodes, edges)} style={{
          background: '#6366f1', color: 'white', border: 'none',
          borderRadius: 6, padding: '9px', cursor: 'pointer', fontWeight: 'bold', fontSize: 12
        }}>💾 Zapisz</button>
      </div>
      <div style={{ flex: 1 }}>
        <ReactFlow nodes={nodes} edges={edges}
          onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
          onConnect={onConnect} nodeTypes={nodeTypes}
          deleteKeyCode="Delete" connectionMode={'loose' as any} fitView
          defaultEdgeOptions={{
            type: 'smoothstep',
            markerEnd: { type: MarkerType.ArrowClosed, width: 15, height: 15, color: '#222' },
            style: { strokeWidth: 2, stroke: '#222' },
          }}>
          <Background /><Controls /><MiniMap />
        </ReactFlow>
      </div>
      {pendingEdge && (
        <EdgeLabelModal label={edgeLabel} onChange={setEdgeLabel}
          onConfirm={confirmEdge} onCancel={() => setPendingEdge(null)} />
      )}
    </div>
  );
}