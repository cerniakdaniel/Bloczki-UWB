import React, { useState, useEffect, useRef } from 'react';
import { Node, Edge } from 'reactflow';
import Canvas from './components/Canvas';
import { createDiagram, listDiagrams, saveDiagram, validateDiagram, generatePseudocode, deleteDiagram } from './api/client';
import { ValidationResult } from './types';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function App() {
  const [diagrams, setDiagrams] = useState<any[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [pseudocode, setPseudocode] = useState<string | null>(null);
  const [view, setView] = useState<'canvas' | 'pseudo'>('canvas');
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => { listDiagrams().then(setDiagrams).catch(() => {}); }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    if (hasUnsavedChanges) {
      const ok = window.confirm('Masz niezapisane zmiany! Czy chcesz kontynuować?');
      if (!ok) return;
    }
    const d = await createDiagram(newName);
    setDiagrams(prev => [d, ...prev]);
    setCurrentId(d.id); setCanvasKey(k => k + 1); setNewName('');
    setHasUnsavedChanges(false); setValidation(null); setPseudocode(null); setView('canvas');
  };

  const handleSelectDiagram = (id: string) => {
    if (!id) return;
    if (hasUnsavedChanges) {
      const ok = window.confirm('Masz niezapisane zmiany! Czy chcesz przełączyć?');
      if (!ok) return;
    }
    setCurrentId(id); setCanvasKey(k => k + 1); setHasUnsavedChanges(false);
    setValidation(null); setPseudocode(null); setView('canvas');
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
    setHasUnsavedChanges(false); alert('Zapisano!');
  };

  const handleValidate = async () => {
    if (!currentId) return;
    const r = await validateDiagram(currentId);
    setValidation(r);
  };

  const handleGenerate = async () => {
    if (!currentId) return;
    try {
      const r = await generatePseudocode(currentId);
      setPseudocode(r.pseudocode); setView('pseudo');
    } catch (e: any) {
      alert(e.response?.data?.errors?.join('\n') || 'Błąd generowania');
    }
  };

  const handleExportPNG = async () => {
    const el = canvasRef.current;
    if (!el) return;
    try {
      const canvas = await html2canvas(el, {
        backgroundColor: '#ffffff', scale: 3, useCORS: true, allowTaint: true, logging: false,
        onclone: (_clonedDoc: Document, clonedEl: HTMLElement) => {
          const inputs = clonedEl.querySelectorAll('input, textarea');
          inputs.forEach((input: any) => {
            const div = _clonedDoc.createElement('div');
            div.style.fontSize = '11px'; div.style.fontWeight = 'bold';
            div.style.textAlign = 'center'; div.textContent = input.value;
            input.parentNode?.replaceChild(div, input);
          });
        }
      });
      const link = document.createElement('a');
      link.download = `${diagrams.find(d => d.id === currentId)?.name || 'diagram'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) { alert('Błąd eksportu PNG'); }
  };

  const handleExportPseudocodePDF = () => {
    if (!pseudocode) { alert('Najpierw wygeneruj pseudokod!'); return; }
    const doc = new jsPDF();
    doc.setFont('courier', 'normal');
    doc.setFontSize(11);
    const lines = doc.splitTextToSize(pseudocode, 180);
    doc.text(lines, 15, 20);
    doc.save(`${diagrams.find(d => d.id === currentId)?.name || 'pseudokod'}.pdf`);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Usunąć ten diagram?')) return;
    await deleteDiagram(id);
    setDiagrams(prev => prev.filter(d => d.id !== id));
    if (currentId === id) { setCurrentId(null); setHasUnsavedChanges(false); }
  };

  return (
    <div style={{ fontFamily: 'system-ui', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: '#1e1e2e', color: 'white', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
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
        {hasUnsavedChanges && <span style={{ background: '#f59e0b', color: 'white', borderRadius: 6, padding: '4px 8px', fontSize: 11, fontWeight: 'bold' }}>⚠️ Niezapisane zmiany</span>}
        <div style={{ flex: 1 }} />
        {currentId && <>
          <button onClick={handleValidate} style={{ padding: '6px 10px', background: '#fbbf24', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold', fontSize: 12 }}>✅ Waliduj</button>
          <button onClick={handleGenerate} style={{ padding: '6px 10px', background: '#6366f1', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold', fontSize: 12 }}>📝 Pseudokod</button>
          <button onClick={handleExportPNG} style={{ padding: '6px 10px', background: '#34d399', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold', fontSize: 12 }}>🖼️ PNG</button>
          <button onClick={handleExportPseudocodePDF} style={{ padding: '6px 10px', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold', fontSize: 12 }}>📄 PDF</button>
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
      {view === 'pseudo' && pseudocode && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', padding: 24, background: '#0f172a', zIndex: 100 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <button onClick={() => setView('canvas')} style={{ padding: '6px 12px', borderRadius: 6, background: '#334155', color: 'white', border: 'none', cursor: 'pointer' }}>← Wróć</button>
            <button onClick={() => navigator.clipboard.writeText(pseudocode)} style={{ padding: '6px 12px', borderRadius: 6, background: '#6366f1', color: 'white', border: 'none', cursor: 'pointer' }}>📋 Kopiuj</button>
            <button onClick={handleExportPseudocodePDF} style={{ padding: '6px 12px', borderRadius: 6, background: '#0ea5e9', color: 'white', border: 'none', cursor: 'pointer' }}>📄 Eksport PDF</button>
          </div>
          <pre style={{ flex: 1, color: '#e2e8f0', fontSize: 15, lineHeight: 1.8, overflow: 'auto', margin: 0 }}>{pseudocode}</pre>
        </div>
      )}
      {currentId ? (
        <div ref={canvasRef} style={{ flex: 1, position: 'relative' }}>
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
