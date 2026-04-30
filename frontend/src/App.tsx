import React, { useState, useEffect } from 'react';
import { Node, Edge } from 'reactflow';
import Canvas from './components/Canvas';
import { createDiagram, listDiagrams, saveDiagram, validateDiagram, deleteDiagram } from './api/client';
import { ValidationResult } from './types';

export default function App() {
  const [diagrams, setDiagrams] = useState<any[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0);
  const [validation, setValidation] = useState<ValidationResult | null>(null);

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
    setValidation(null);
  };

  const handleSelectDiagram = (id: string) => {
    if (!id) return;
    if (hasUnsavedChanges) {
      const ok = window.confirm('Masz niezapisane zmiany! Czy chcesz przełączyć?');
      if (!ok) return;
    }
    setCurrentId(id);
    setCanvasKey(k => k + 1);
    setHasUnsavedChanges(false);
    setValidation(null);
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

  const handleValidate = async () => {
    if (!currentId) return;
    const r = await validateDiagram(currentId);
    setValidation(r);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Usunąć ten diagram?')) return;
    await deleteDiagram(id);
    setDiagrams(prev => prev.filter(d => d.id !== id));
    if (currentId === id) { setCurrentId(null); setHasUnsavedChanges(false); }
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
          <span style={{ background: '#f59e0b', color: 'white', borderRadius: 6, padding: '4px 8px', fontSize: 11, fontWeight: 'bold' }}>⚠️ Niezapisane zmiany</span>
        )}
        <div style={{ flex: 1 }} />
        {currentId && <>
          <button onClick={handleValidate} style={{ padding: '6px 10px', background: '#fbbf24', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold', fontSize: 12 }}>✅ Waliduj</button>
          <button onClick={() => handleDelete(currentId)} style={{ padding: '6px 10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold', fontSize: 12 }}>🗑️ Usuń</button>
        </>}
      </div>
      {validation && (
        <div style={{ background: validation.isValid ? '#d1fae5' : '#fee2e2', padding: '8px 16px', borderBottom: '1px solid #ccc', display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            {validation.isValid ? '✅ Schemat jest poprawny!'
              : <><span>❌ Błędy:</span><ul style={{ margin: '4px 0 0 0' }}>{validation.errors.map((e, i) => <li key={i}>{e}</li>)}</ul></>
            }
          </div>
          <button onClick={() => setValidation(null)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer' }}>✕</button>
        </div>
      )}
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