import { useState } from 'react';
import { TopBar } from './components/TopBar';
import { LeftPanel } from './components/LeftPanel';
import { RightPanel } from './components/RightPanel';
import { DesignCanvas } from './components/DesignCanvas';
import { ArchiveView } from './components/ArchiveView';
import { Notice } from './components/Notice';

export default function App() {
  const [view, setView] = useState<'design' | 'archive'>('design');

  return (
    <div className="app">
      <TopBar onGoArchive={() => setView(view === 'archive' ? 'design' : 'archive')} />
      {view === 'archive' ? (
        <ArchiveView onBack={() => setView('design')} />
      ) : (
        <div className="workspace">
          <LeftPanel />
          <main className="canvas-area">
            <DesignCanvas />
          </main>
          <RightPanel />
        </div>
      )}
      <Notice />
    </div>
  );
}
