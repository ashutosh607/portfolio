import React, { createContext, useContext, useEffect, useState, useSyncExternalStore } from 'react';
import { Volume2, VolumeX, SlidersHorizontal } from 'lucide-react';
import { VillageMusic } from './villageMusic';
import './VillageMusic.css';

const defaultMusic = new VillageMusic();
const MusicContext = createContext(defaultMusic);

export function VillageMusicProvider({ children }) {
  const [music] = useState(() => defaultMusic);
  useEffect(() => {
    music.enabled = true;
    music.play();
    document.addEventListener('visibilitychange', music.visibility);
    return () => {
      document.removeEventListener('visibilitychange', music.visibility);
      music.dispose();
    };
  }, [music]);
  return <MusicContext.Provider value={music}>{children}</MusicContext.Provider>;
}

export function MusicButton() {
  const music = useContext(MusicContext);
  const { volume, status } = useSyncExternalStore(music.subscribe, music.snapshot);
  const [adjusting, setAdjusting] = useState(false);
  const active = status === 'playing' || status === 'loading' || status === 'paused';
  const label = {
    off: 'Play village music', playing: 'Pause village music', loading: 'Loading music · cancel',
    paused: 'Village music paused', error: 'Music unavailable · tap to retry',
  }[status];
  return <div className="village-music" onKeyDown={event => event.stopPropagation()} onKeyUp={event => event.stopPropagation()}
    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setAdjusting(false); }}>
    <button type="button" title={label} aria-label={label} aria-pressed={active}
      onClick={() => { setAdjusting(false); music.toggle(); }}>
      {active && volume > 0 ? <Volume2 size={17}/> : <VolumeX size={17}/>}
      {status === 'playing' && volume > 0 && <span className="music-levels" aria-hidden="true"><i/><i/><i/></span>}
    </button>
    {active && <button type="button" title="Music volume" aria-label="Music volume" aria-expanded={adjusting}
      onClick={() => setAdjusting(!adjusting)}><SlidersHorizontal size={14}/></button>}
    {active && adjusting && <label className="music-volume">Volume {Math.round(volume * 100)}%
      <input type="range" min="0" max="100" value={Math.round(volume * 100)} onChange={event => music.setVolume(Number(event.target.value) / 100)} />
    </label>}
    {!adjusting && status !== 'error' && <span className="music-tooltip" aria-hidden="true">{label}</span>}
    <span role="status" className="music-feedback">{status === 'error' ? 'Music unavailable. Tap to retry.' : ''}</span>
  </div>;
}
