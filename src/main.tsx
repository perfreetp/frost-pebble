import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { App } from './App';
import { SharePage } from './ui/SharePage';

const path = window.location.pathname;
const shareMatch = /^\/share\/([A-Za-z0-9-]+)/.exec(path);

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {shareMatch ? <SharePage token={shareMatch[1]} /> : <App />}
  </React.StrictMode>,
);
