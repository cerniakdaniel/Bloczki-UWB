import React from 'react';

interface Props {
  label: string;
  onChange: (v: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function EdgeLabelModal({ label, onChange, onConfirm, onCancel }: Props) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}
      onClick={e => e.stopPropagation()}
    >
      <div style={{ background: 'white', padding: 24, borderRadius: 12, minWidth: 300 }}>
        <h3 style={{ marginTop: 0 }}>Etykieta połączenia</h3>
        <p style={{ fontSize: 13, color: '#666' }}>Dla warunku wpisz TAK lub NIE, dla pętli zostaw puste</p>
        <input autoFocus value={label} onChange={e => onChange(e.target.value)}
          onKeyDown={e => { e.stopPropagation(); if (e.key === 'Enter') onConfirm(); if (e.key === 'Escape') onCancel(); }}
          placeholder="np. TAK, NIE lub zostaw puste"
          style={{ width: '100%', padding: 8, fontSize: 14, border: '1px solid #ccc', borderRadius: 6, boxSizing: 'border-box' }}
        />
        <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
          <button onClick={e => { e.stopPropagation(); onCancel(); }}
            style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #ccc', cursor: 'pointer' }}>Anuluj</button>
          <button onClick={e => { e.stopPropagation(); onConfirm(); }}
            style={{ padding: '8px 16px', borderRadius: 6, background: '#6366f1', color: 'white', border: 'none', cursor: 'pointer' }}>OK</button>
        </div>
      </div>
    </div>
  );
}