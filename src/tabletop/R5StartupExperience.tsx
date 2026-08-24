import { useEffect, useRef, useState, type ReactNode } from 'react';
import { audioManager } from '../audio/audio-manager';
import { loadGlobalSettings, saveGlobalSettings, type GlobalSettings } from '../game/global-settings';
import { BUILD_LABEL } from '../generated/build-info';
import { GlobalSettingsPanel } from '../components/GlobalSettingsPanel';
import { GlobalSettingsContext } from '../components/StartupExperience';
import { logR5HardwareDiagnostic, readR5HardwareDiagnosticMode } from './r5-hardware-diagnostic';
import '../components/startup-launcher.css';

/** The preserved R3 title/audio host. It deliberately owns presentation only. */
export function R5StartupExperience({ children }: { children: ReactNode }) {
  const [launched, setLaunched] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<GlobalSettings>(() => loadGlobalSettings());
  const [responsive, setResponsive] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);
  const [diagnosticMode] = useState(readR5HardwareDiagnosticMode);

  useEffect(() => {
    audioManager.setSettings(settings);
    audioManager.requestMusic(launched ? 'game' : 'title');
  }, [launched, settings]);

  useEffect(() => {
    if (diagnosticMode === 'production' || !shellRef.current) return;
    let observed = false;
    const observer = new ResizeObserver(() => {
      if (!observed) logR5HardwareDiagnostic(diagnosticMode, 'first ResizeObserver callback');
      observed = true;
    });
    observer.observe(shellRef.current);
    return () => observer.disconnect();
  }, [diagnosticMode]);

  useEffect(() => {
    if (!launched || diagnosticMode === 'production') return;
    logR5HardwareDiagnostic(diagnosticMode, 'launcher removed / shell class changed');
    const frame = requestAnimationFrame(() => {
      logR5HardwareDiagnostic(diagnosticMode, 'first rendered frame');
      setResponsive(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [diagnosticMode, launched]);

  const applySettings = (next: GlobalSettings) => {
    const saved = saveGlobalSettings(next);
    setSettings(saved);
    audioManager.setSettings(saved);
  };

  const begin = () => {
    logR5HardwareDiagnostic(diagnosticMode, 'BEGIN CAMPAIGN click');
    void audioManager.unlock();
    logR5HardwareDiagnostic(diagnosticMode, 'audioManager.unlock requested');
    logR5HardwareDiagnostic(diagnosticMode, 'setLaunched');
    setLaunched(true);
  };

  return <>
    <div ref={shellRef} className={`startup-game-shell ${launched ? '' : 'launcher-covered'}`} aria-hidden={!launched} inert={!launched}>
      <GlobalSettingsContext.Provider value={settings}>{children}</GlobalSettingsContext.Provider>
    </div>
    {!launched && <section className="startup-launcher" aria-label="Future Conquest title screen">
      <div className="startup-launcher-panel">
        <p className="launcher-kicker">COMMAND ACCESS · TABLETOP PROTOCOL</p>
        <div className="launcher-actions">
          <button type="button" className="launcher-primary" onClick={begin}>BEGIN CAMPAIGN</button>
          <button type="button" className="launcher-secondary" onClick={() => { void audioManager.unlock(); setShowSettings(true); }}>SETTINGS</button>
        </div>
        <div className="launcher-footer"><span>{BUILD_LABEL}</span><span>R5 RULES · R3 COMMAND SHELL</span></div>
      </div>
    </section>}
    {launched && <button type="button" className="global-settings-toggle" onClick={() => setShowSettings(true)} aria-label="Open game settings" title="Settings">⚙</button>}
    {showSettings && <GlobalSettingsPanel settings={settings} onChange={applySettings} onClose={() => setShowSettings(false)} onReturnToTitle={launched ? () => { setShowSettings(false); setLaunched(false); } : undefined} />}
    {diagnosticMode !== 'production' && <aside className="r5-hardware-diagnostic-badge" role="status"><strong>R5 HARDWARE DIAG · {diagnosticMode.toUpperCase()}</strong><span>{launched ? (responsive ? 'LAUNCHED / RESPONSIVE' : 'LAUNCHING…') : 'READY / BEGIN CAMPAIGN'}</span></aside>}
  </>;
}
