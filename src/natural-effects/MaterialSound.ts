/** A looped window of a real recording, levelled on load. */
export type SoundLayer = { file: string; from: number; to: number; lowpass: number; restart?: boolean }

/** Recorded material layers (sand pour; snow swish and crunch), each continuously enveloped by real contact. */
export class MaterialSound {
  private context: AudioContext | null = null
  private buffers: (AudioBuffer | null)[]
  private loading: Promise<void> | null = null
  private gains: (GainNode | null)[]
  private pans: (StereoPannerNode | null)[]
  private sources: (AudioBufferSourceNode | null)[]
  private levels: number[]
  private silentSince: number[]
  enabled = true
  constructor(private layers: SoundLayer[]) {
    this.buffers = layers.map(() => null); this.gains = layers.map(() => null); this.pans = layers.map(() => null); this.sources = layers.map(() => null); this.levels = layers.map(() => 0); this.silentSince = layers.map(() => -1)
  }
  async unlock() {
    // Like IceSound/WaterSoundscape: play through the iOS ring/silent switch, and start a silent buffer inside the gesture.
    try { const session = (navigator as Navigator & { audioSession?: { type: string } }).audioSession; if (session) session.type = 'playback' } catch { /* Older browsers use their default session. */ }
    if (!this.context) this.context = new AudioContext()
    const context = this.context
    const resumed = context.resume()
    const silent = context.createBufferSource()
    silent.buffer = context.createBuffer(1, 1, context.sampleRate); silent.connect(context.destination); silent.start(); silent.onended = () => silent.disconnect()
    if (this.buffers.some(b => !b) && !this.loading) this.loading = Promise.all(this.layers.map(async (layer, i) => {
      if (this.buffers[i]) return
      const response = await fetch(`${import.meta.env.BASE_URL}audio/${layer.file}`)
      if (!response.ok) throw Error(`${layer.file} could not load`)
      this.buffers[i] = level(context, await context.decodeAudioData(await response.arrayBuffer()), layer)
    })).then(() => undefined).finally(() => { this.loading = null })
    await Promise.all([resumed, this.loading])
  }
  /** Set one layer's level (0 silences it) and its stereo position, x in 0..1. */
  set(layer: number, volume: number, x = .5) {
    const c = this.context, buffer = this.buffers[layer]
    if (!this.enabled || !c || c.state !== 'running' || !buffer) return
    if (volume <= 0 && this.levels[layer] > 0) this.silentSince[layer] = c.currentTime
    // A restarting layer begins each new press at the top of its window, so a press opens on a crunch.
    // A slow trace flickers between pressing and moving, so only a real pause counts as a new press.
    const restart = this.layers[layer].restart && !this.levels[layer] && c.currentTime - this.silentSince[layer] > .3
    if (volume > 0 && (!this.gains[layer] || restart)) {
      const old = this.sources[layer], oldGain = this.gains[layer]
      if (old && oldGain) { oldGain.gain.setTargetAtTime(0, c.currentTime, .015); old.stop(c.currentTime + .1) }
      const source = c.createBufferSource(), gain = c.createGain(), pan = c.createStereoPanner(), filter = c.createBiquadFilter()
      source.buffer = buffer; source.loop = true
      filter.type = 'lowpass'; filter.frequency.value = this.layers[layer].lowpass; gain.gain.value = 0
      source.connect(filter); filter.connect(gain); gain.connect(pan); pan.connect(c.destination)
      source.start(); this.sources[layer] = source; this.gains[layer] = gain; this.pans[layer] = pan
    }
    this.levels[layer] = volume
    this.gains[layer]?.gain.setTargetAtTime(volume, c.currentTime, volume > 0 ? .035 : .045)
    this.pans[layer]?.pan.setTargetAtTime((x * 2 - 1) * .35, c.currentTime, .08)
  }
  quiet() { if (this.context) { for (let i = 0; i < this.levels.length; i++) if (this.levels[i] > 0) this.silentSince[i] = this.context.currentTime } this.levels.fill(0); if (this.context) for (const gain of this.gains) gain?.gain.setTargetAtTime(0, this.context.currentTime, .025) }
  toggle() { this.enabled = !this.enabled; if (!this.enabled) this.quiet(); return this.enabled }
  dispose() { for (const source of this.sources) source?.stop(); void this.context?.close() }
}

/** Cut the layer's window into a seamless loop and raise it to a usable, consistent level. */
function level(context: AudioContext, recording: AudioBuffer, layer: SoundLayer) {
  const rate = recording.sampleRate
  const start = Math.round(layer.from * rate), end = Math.min(recording.length, Math.round(layer.to * rate))
  const fade = Math.round(.12 * rate), length = end - start - fade
  const loop = context.createBuffer(recording.numberOfChannels, length, rate)
  for (let channel = 0; channel < recording.numberOfChannels; channel++) {
    const input = recording.getChannelData(channel), output = loop.getChannelData(channel)
    for (let i = 0; i < length; i++) output[i] = i < fade
      ? input[start + length + i] * (1 - i / fade) + input[start + i] * (i / fade)
      : input[start + i]
  }
  // Field recordings sit far below full scale (the sand pour near -42 dBFS); normalise and soft-limit the rare loud grains.
  let sum = 0
  for (let channel = 0; channel < loop.numberOfChannels; channel++) for (const x of loop.getChannelData(channel)) sum += x * x
  const makeup = .12 / Math.max(1e-4, Math.sqrt(sum / (length * loop.numberOfChannels)))
  for (let channel = 0; channel < loop.numberOfChannels; channel++) {
    const data = loop.getChannelData(channel)
    for (let i = 0; i < length; i++) data[i] = Math.tanh(data[i] * makeup)
  }
  return loop
}
