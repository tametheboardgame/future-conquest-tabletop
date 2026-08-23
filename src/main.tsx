import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { R5StartupExperience } from './tabletop/R5StartupExperience';
import './styles.css';
import './r3-terrain-prototype.css';
import './r3-wp6-command-ui.css';
import './r3-wp6-command-ui-refinements.css';
import './r3-wp6-5-interface-polish.css';
import './r3-wp6-6-command-shell-follow-up.css';
import './tabletop/tabletop-board.css';
import './tabletop/tabletop-pieces.css';
import './tabletop/rich-map-shell.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <R5StartupExperience><App /></R5StartupExperience>
  </StrictMode>
);
