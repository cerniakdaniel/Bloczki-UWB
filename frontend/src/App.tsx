import React from 'react';
import Canvas from './components/Canvas';

export default function App() {
  return (
    <div style={{ fontFamily: 'system-ui', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: '#1e1e2e', color: 'white', padding: '8px 16px' }}>
        <span style={{ fontWeight: 'bold', fontSize: 18 }}>Bloczki UWB</span>
      </div>
      <div style={{ flex: 1 }}>
        <Canvas />
      </div>
    </div>
  );
}