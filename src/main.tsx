import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { R5StartupExperience } from './tabletop/R5StartupExperience';
import './styles.css';
import './command-interface.css';
import './r3-strategic-map.css';
import './r3-map-hierarchy.css';
import './r3-terrain-prototype.css';
import './r3-wp6-command-ui.css';
import './r3-wp6-pictorial-details.css';
import './r3-wp6-command-ui-refinements.css';
import './r3-wp6-5-interface-polish.css';
import './r3-wp6-6-command-shell-follow-up.css';
import './tabletop/tabletop-board.css';
import './tabletop/tabletop-pieces.css';
import './tabletop/rich-map-shell.css';
import './tabletop/r3-tabletop-shell.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <R5StartupExperience><App /></R5StartupExperience>
  </StrictMode>
);
