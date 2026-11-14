// Set end to null to use the end of the decoded file. Times are in seconds.
export const villageTrack = {
  url: '/audio/konoha-ambience.ogg',
  fallbackUrl: '/audio/konoha-ambience.mp3',
  start: 0,
  end: null,
  seam: 0.08,
};

const preference = 'konoha-music-volume';
const clamp = value => Math.min(1, Math.max(0, value));

// Blend the tail into the opening once, then let the audio thread repeat the
// buffer. Complementary weights avoid boosting correlated notes at the seam.
export function prepareLoop(buffer, track) {
  const rate = buffer.sampleRate;
  const first = Math.round(track.start * rate);
  const end = track.end == null ? buffer.length : Math.round(track.end * rate);
  if (!(first >= 0 && end <= buffer.length && end - first >= 2)) throw Error('Invalid loop points');
  const blend = Math.min(Math.round(track.seam * rate), Math.floor((end - first) / 4));
  if (blend > 1) {
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < blend; i++) {
        const weight = (1 - Math.cos(Math.PI * i / (blend - 1))) / 2;
        const tail = end - blend + i;
        data[tail] = data[tail] * (1 - weight) + data[first + i] * weight;
      }
    }
  }
  return { first: first / rate, start: (first + blend) / rate, end: end / rate };
}

export class VillageMusic {
  constructor() {
    let volume = 0.1;
    try {
      const saved = localStorage.getItem(preference);
      if (saved != null && saved.trim() && Number.isFinite(Number(saved))) volume = clamp(Number(saved));
    } catch { /* Storage is optional. */ }
    this.state = { volume, status: 'off' };
    this.listeners = new Set();
    this.version = 0;
    this.enabled = true;
    this.offset = null;
  }

  subscribe = listener => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };
  snapshot = () => this.state;
  update(change) {
    this.state = { ...this.state, ...change };
    this.listeners.forEach(listener => listener());
  }

  toggle = () => {
    if (this.enabled && this.ctx && this.ctx.state !== 'running') {
      this.ctx.resume().catch(() => {});
      return;
    }
    this.enabled = !this.enabled;
    if (this.enabled) this.play();
    else this.pause();
  };

  visibility = () => {
    if (!this.enabled) return;
    if (document.hidden) this.pause();
    else this.play();
  };

  setVolume = value => {
    if (!Number.isFinite(value)) return;
    const volume = clamp(value);
    this.update({ volume });
    try { localStorage.setItem(preference, String(volume)); } catch { /* Optional. */ }
    if (this.source && this.state.status === 'playing') this.ramp(volume, 0.25);
  };

  ramp(target, seconds) {
    const now = this.ctx.currentTime;
    const gain = this.gain.gain;
    const { from, to, start, duration } = this.envelope;
    const level = from + (to - from) * clamp((now - start) / duration);
    gain.cancelScheduledValues(now);
    gain.setValueAtTime(level, now);
    gain.linearRampToValueAtTime(target, now + seconds);
    this.envelope = { from: level, to: target, start: now, duration: seconds };
  }

  async play() {
    const version = ++this.version;
    clearTimeout(this.timer);
    this.update({ status: 'loading' });
    try {
      if (!this.ctx) {
        const Context = window.AudioContext || window.webkitAudioContext;
        this.ctx = new Context();
        this.gain = this.ctx.createGain();
        this.gain.gain.value = 0;
        this.gain.connect(this.ctx.destination);
        this.envelope = { from: 0, to: 0, start: 0, duration: 1 };
      }
      const ctx = this.ctx;
      // Invoke resume synchronously inside the tap, before fetching or decoding.
      const resumed = ctx.resume();
      if (ctx.state !== 'running' && typeof window !== 'undefined' && !this.removeUnlock) {
        const unlock = () => {
          if (!this.enabled || this.ctx !== ctx) {
            this.removeUnlock?.();
            return;
          }
          ctx.resume().then(() => {
            if (ctx.state === 'running') {
              this.removeUnlock?.();
              if (this.source && this.enabled) this.ramp(this.state.volume, 2);
            }
          }).catch(() => {});
        };
        const removeUnlock = () => {
          window.removeEventListener('pointerdown', unlock, true);
          window.removeEventListener('touchstart', unlock, true);
          window.removeEventListener('keydown', unlock, true);
          this.removeUnlock = null;
        };
        this.removeUnlock = removeUnlock;
        window.addEventListener('pointerdown', unlock, { capture: true, passive: true });
        window.addEventListener('touchstart', unlock, { capture: true, passive: true });
        window.addEventListener('keydown', unlock, { capture: true, passive: true });
      }
      if (!this.loading) {
        this.abort = new AbortController();
        const loadAudio = async (targetUrl) => {
          const response = await fetch(targetUrl, { signal: this.abort.signal });
          if (!response.ok || response.headers.get('content-type')?.includes('text/html')) {
            throw Error('Missing track');
          }
          const bytes = await response.arrayBuffer();
          const buffer = await ctx.decodeAudioData(bytes);
          return { buffer, loop: prepareLoop(buffer, villageTrack) };
        };
        this.loading = loadAudio(villageTrack.url).catch((err) => {
          if (
            this.abort.signal.aborted ||
            !villageTrack.fallbackUrl ||
            villageTrack.fallbackUrl === villageTrack.url
          ) {
            throw err;
          }
          return loadAudio(villageTrack.fallbackUrl);
        });
      }
      const { buffer, loop } = await this.loading;
      await Promise.race([resumed.catch(() => {}), new Promise((r) => setTimeout(r, 250))]);
      if (version !== this.version) return;
      if (ctx.state === 'running') {
        this.removeUnlock?.();
      }
      if (!this.source) {
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        source.loopStart = loop.start;
        source.loopEnd = loop.end;
        source.connect(this.gain);
        this.loop = loop;
        this.offset ??= loop.first;
        this.started = ctx.currentTime;
        source.start(this.started, this.offset);
        this.source = source;
      }
      this.ramp(this.state.volume, 2);
      this.update({ status: 'playing' });
    } catch {
      if (version !== this.version) return;
      this.dispose();
      this.update({ status: 'error' });
    }
  }

  pause() {
    const version = ++this.version;
    this.removeUnlock?.();
    this.update({ status: this.enabled ? 'paused' : 'off' });
    clearTimeout(this.timer);
    if (!this.source) {
      this.ctx?.suspend().catch(() => {});
      return;
    }
    this.ramp(0, 1.5);
    this.timer = setTimeout(() => {
      if (version !== this.version) return;
      const position = this.offset + this.ctx.currentTime - this.started;
      const { start, end } = this.loop;
      this.offset = position < end ? position : start + (position - end) % (end - start);
      this.gain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.gain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.envelope = { from: 0, to: 0, start: this.ctx.currentTime, duration: 1 };
      this.source.stop();
      this.source.disconnect();
      this.source = null;
      this.ctx.suspend().catch(() => {});
    }, 1500);
  }

  dispose() {
    ++this.version;
    this.enabled = false;
    this.removeUnlock?.();
    clearTimeout(this.timer);
    this.abort?.abort();
    this.source?.stop();
    this.source?.disconnect();
    this.gain?.disconnect();
    this.ctx?.close().catch(() => {});
    this.source = this.loading = this.ctx = this.gain = this.offset = null;
  }
}
