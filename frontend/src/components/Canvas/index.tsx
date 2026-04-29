import React, { useCallback, useState, useEffect } from 'react';
import ReactFlow, {
  Background, Controls, MiniMap,
  useNodesState, useEdgesState,
  Connection, Edge, Node, MarkerType, NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import './junction.css';
import { BlockType } from '../../types';
import CustomNode from './CustomNode';
import JunctionNode from './JunctionNode';
import EdgeLabelModal from './EdgeLabelModal';
import { getDiagram } from '../../api/client';

const nodeTypes: NodeTypes = { custom: CustomNode, junction: JunctionNode };

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
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!diagramId) return;
    setIsLoading(true);
    setHasChanges(false);
    onUnsavedChange(false);
    getDiagram(diagramId).then(diagram => {
      const loadedNodes = (diagram.blocks || []).map((b: any) => ({
        id: b.id,
        type: b.type === 'junction' ? 'junction' : 'custom',
        position: { x: b.position_x, y: b.position_y },
        data: {
          type: b.type, color: BLOCK_COLORS[b.type] || '#60a5fa', content: b.content || '',
          onChange: (content: string) => {
            setNodes(ns => ns.map(n => n.id === b.id ? { ...n, data: { ...n.data, content } } : n));
            setHasChanges(true); onUnsavedChange(true);
          }
        }
      }));
      const loadedEdges = (diagram.connections || []).map((c: any) => ({
        id: c.id, source: c.from_block_id, target: c.to_block_id,
        label: c.label, data: { label: c.label }, type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed, width: 15, height: 15, color: '#222' },
        style: { strokeWidth: 2, stroke: '#222' },
      }));
      setNodes(loadedNodes);
      setEdges(loadedEdges);
      setTimeout(() => setIsLoading(false), 100);
    }).catch(() => setIsLoading(false));
  }, [diagramId]);

  const markChanged = () => {
    if (isLoading) return;
    setHasChanges(true);
    onUnsavedChange(true);
  };

  const onConnect = useCallback((params: Connection) => {
    setPendingEdge(params); setEdgeLabel('');
  }, []);

  const confirmEdge = () => {
    if (!pendingEdge) return;
    setEdges(eds => [...eds, makeEdge(pendingEdge, edgeLabel)]);
    setPendingEdge(null); setEdgeLabel(''); markChanged();
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
          markChanged();
        }
      }
    }]);
    markChanged();
  };

  const addJunction = () => {
    const id = `junction_${Date.now()}`;
    setNodes(nds => [...nds, { id, type: 'junction', position: { x: 450 + Math.random() * 80, y: 200 + Math.random() * 80 }, data: {} }]);
    markChanged();
  };

  const deleteSelected = () => {
    setNodes(nds => nds.filter(n => !n.selected));
    setEdges(eds => eds.filter(e => !e.selected));
    markChanged();
  };

  const clearAll = () => {
    if (window.confirm('Wyczyścić cały diagram?')) { setNodes([]); setEdges([]); markChanged(); }
  };

  const handleSave = async () => {
    await onSave(nodes, edges);
    setHasChanges(false); onUnsavedChange(false);
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex' }}>
      <div style={{ width: 190, background: '#1e1e2e', padding: 10, display: 'flex', flexDirection: 'column', gap: 6, overflowY: 'auto' }}>
        <div style={{ color: '#aaa', fontSize: 10, fontWeight: 'bold', marginBottom: 2 }}>BLOKI</div>
        {BLOCKS.map(b => (
          <button key={b.type} onClick={() => addBlock(b.type, b.color)} style={{
            background: b.color, border: 'none', borderRadius: 6,
            padding: '7px 8px', cursor: 'pointer', fontWeight: 'bold', fontSize: 10, textAlign: 'left'
          }}>{b.label}</button>
        ))}
        <div style={{ color: '#aaa', fontSize: 10, fontWeight: 'bold', marginTop: 6 }}>NARZĘDZIA</div>
        <button onClick={addJunction} style={{
          background: '#475569', color: 'white', border: '2px solid #94a3b8',
          borderRadius: 20, padding: '6px 8px', cursor: 'pointer', fontSize: 10, fontWeight: 'bold'
        }}>⊗ Węzeł pomocniczy</button>
        <div style={{ flex: 1 }} />
        {hasChanges && (
          <div style={{ background: '#f59e0b', color: 'white', borderRadius: 6, padding: '4px 8px', fontSize: 10, textAlign: 'center' }}>
            ⚠️ Niezapisane zmiany
          </div>
        )}
        <button onClick={deleteSelected} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: 6, padding: '7px', cursor: 'pointer', fontWeight: 'bold', fontSize: 11 }}>🗑️ Usuń zaznaczone</button>
        <button onClick={clearAll} style={{ background: '#7f1d1d', color: 'white', border: 'none', borderRadius: 6, padding: '7px', cursor: 'pointer', fontWeight: 'bold', fontSize: 11 }}>🧹 Wyczyść wszystko</button>
        <button onClick={handleSave} style={{ background: hasChanges ? '#f59e0b' : '#6366f1', color: 'white', border: 'none', borderRadius: 6, padding: '9px', cursor: 'pointer', fontWeight: 'bold', fontSize: 12 }}>💾 Zapisz{hasChanges ? ' *' : ''}</button>
        <div style={{ color: '#555', fontSize: 9, textAlign: 'center' }}>Zaznacz + Delete = usuń</div>
      </div>
      <div style={{ flex: 1 }}>
        <ReactFlow nodes={nodes} edges={edges}
          onNodesChange={(changes) => { onNodesChange(changes); if (!isLoading) markChanged(); }}
          onEdgesChange={(changes) => { onEdgesChange(changes); if (!isLoading) markChanged(); }}
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