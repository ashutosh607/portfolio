# Village background music

Bundled with an original, royalty-free 48-second stereo pastoral Japanese instrumental (`konoha-ambience.ogg` + `konoha-ambience.mp3` fallback for Safari/iOS), featuring acoustic plucked strings (koto & nylon guitar), bamboo shakuhachi flute, and warm ambient sustain inspired by peaceful mornings in the Hidden Leaf Village. The app requests audio only after a visitor clicks the music button.

## Replacing with your own licensed track

1. Place your loop-ready audio file in `public/audio/` as **`konoha-ambience.ogg`** (and optionally **`konoha-ambience.mp3`** for iOS/Safari compatibility).
2. Or update `villageTrack.url` (and `villageTrack.fallbackUrl`) in `src/audio/villageMusic.js` to match your filename (supported formats: `.ogg`, `.mp3`, `.m4a`, `.wav`).
3. Set `start` and `end` (in seconds) in `src/audio/villageMusic.js` if you want to loop a specific musical phrase within the file (`end: null` uses the full decoded buffer).
4. `seam: 0.08` applies an 80 ms raised-cosine blend between the loop tail and opening so `AudioBufferSourceNode` repeats cleanly on the Web Audio render thread without clicks. Set `seam: 0` if your master is already pre-crossfaded.
