import React, { useState, useEffect } from 'react';
import { Node, Edge } from 'reactflow';
import Canvas from './components/Canvas';
import { createDiagram, listDiagrams, saveDiagram } from './api/client';

export default function App() {
  const [diagrams, setDiagrams] = useState<any[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0);

  useEffect(() => { listDiagrams().then(setDiagrams).catch(() => {}); }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    if (hasUnsavedChanges) {
      const ok = window.confirm('Masz niezapisane zmiany! Czy chcesz kontynuować?');
      if (!ok) return;
    }
    const d = await createDiagram(newName);
    setDiagrams(prev => [d, ...prev]);
    setCurrentId(d.id);
    setCanvasKey(k => k + 1);
    setNewName('');
    setHasUnsavedChanges(false);
  };

  const handleSelectDiagram = (id: string) => {
    if (!id) return;
    if (hasUnsavedChanges) {
      const ok = window.confirm('Masz niezapisane zmiany! Czy chcesz przełączyć diagram?');
      if (!ok) return;
    }
    setCurrentId(id);
    setCanvasKey(k => k + 1);
    setHasUnsavedChanges(false);
  };

  const handleSave = async (nodes: Node[], edges: Edge[]) => {
    if (!currentId) return;
    const blocks = nodes.map(n => ({
      id: n.id, type: n.data?.type || 'junction', content: n.data?.content || '',
      position_x: n.position.x, position_y: n.position.y
    }));
    const connections = edges.map(e => ({
      id: e.id, from_block_id: e.source, to_block_id: e.target,
      label: String(e.label || e.data?.label || '')
    }));
    await saveDiagram(currentId, { blocks, connections });
    setHasUnsavedChanges(false);
    alert('Zapisano!');
  };

  return (
    <div style={{ fontFamily: 'system-ui', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: '#1e1e2e', color: 'white', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontWeight: 'bold', fontSize: 16 }}>Bloczki UWB</span>
        <input value={newName} onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleCreate()}
          placeholder="Nazwa nowego diagramu..."
          style={{ padding: '6px 10px', borderRadius: 6, border: 'none', fontSize: 12, width: 160 }}
        />
        <button onClick={handleCreate} style={{ padding: '6px 10px', background: '#4ade80', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold', fontSize: 12 }}>+ Nowy</button>
        <select onChange={e => handleSelectDiagram(e.target.value)} value={currentId || ''}
          style={{ padding: '6px 10px', borderRadius: 6, border: 'none', maxWidth: 180, fontSize: 12 }}>
          <option value="">-- wybierz diagram --</option>
          {diagrams.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        {hasUnsavedChanges && (
          <span style={{ background: '#f59e0b', color: 'white', borderRadius: 6, padding: '4px 8px', fontSize: 11, fontWeight: 'bold' }}>
            ⚠️ Niezapisane zmiany
          </span>
        )}
      </div>
      {currentId ? (
        <div style={{ flex: 1, position: 'relative' }}>
          <Canvas key={canvasKey} diagramId={currentId} onSave={handleSave} onUnsavedChange={setHasUnsavedChanges} />
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: 18 }}>
          Utwórz lub wybierz diagram, aby zacząć.
        </div>
      )}
    </div>
  );
}