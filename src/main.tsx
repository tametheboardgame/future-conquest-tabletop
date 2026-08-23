import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './tabletop/tabletop-board.css';
import './tabletop/tabletop-pieces.css';
import './r3-terrain-prototype.css';
import './r3-strategic-map.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
