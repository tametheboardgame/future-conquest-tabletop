import { useEffect, useState, type ReactNode } from 'react';
import { audioManager } from '../audio/audio-manager';
import { loadGlobalSettings, saveGlobalSettings, type GlobalSettings } from '../game/global-settings';
import { BUILD_LABEL } from '../generated/build-info';
import { GlobalSettingsPanel } from '../components/GlobalSettingsPanel';
import { GlobalSettingsContext } from '../components/StartupExperience';
import { R5_GAME_REVEALED_EVENT } from './launch-transition';
import '../components/startup-launcher.css';

/** The preserved R3 title/audio host. It deliberately owns presentation only. */
export function R5StartupExperience({ children }: { children: ReactNode }) {
  const [launched, setLaunched] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<GlobalSettings>(() => loadGlobalSettings());

  useEffect(() => {
    audioManager.setSettings(settings);
    audioManager.requestMusic(launched ? 'game' : 'title');
  }, [launched, settings]);

  useEffect(() => {
    if (!launched) return;
    // Let React remove the launcher and restore the shell's layout before
    // persistent canvas renderers measure their now-visible viewport.
    const frame = window.requestAnimationFrame(() => {
      window.dispatchEvent(new Event(R5_GAME_REVEALED_EVENT));
    });
    return () => window.cancelAnimationFrame(frame);
  }, [launched]);

  const applySettings = (next: GlobalSettings) => {
    const saved = saveGlobalSettings(next);
    setSettings(saved);
    audioManager.setSettings(saved);
  };

  const begin = () => {
    void audioManager.unlock();
    setLaunched(true);
  };

  return <>
    <div className={`startup-game-shell ${launched ? '' : 'launcher-covered'}`}>
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
  </>;
}
