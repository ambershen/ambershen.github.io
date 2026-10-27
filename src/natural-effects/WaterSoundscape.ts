type Clip = { buffer: AudioBuffer; onset: number }
type Contact = { x: number; y: number; started: number; seen: number; travel: number }

/** Outdoor water recordings, triggered by contact rather than a repeating splash loop. */
export class WaterSoundscape {
  private context: AudioContext | null = null
  private master: GainNode | null = null
  private clips: { pond: Clip; lake: Clip } | null = null
  private loading: Promise<void> | null = null
  private voices = new Map<AudioBufferSourceNode, GainNode>()
  private enabled = false
  private generation = 0
  private contact: Contact | null = null
  private lastEntry = -Infinity
  private lastMotion = -Infinity
  private motionLevel = 0
  private nextMovement = -Infinity
  private movementGain: GainNode | null = null
  private movementPan: StereoPannerNode | null = null
  private movementVoices = new Set<AudioBufferSourceNode>()
  private variation = 0
  get active() { return this.enabled }

  unlock() {
    // Called synchronously from a real touchend/click, including after OS interruption.
    if(this.context && this.context.state !== 'running')void this.context.resume().catch(()=>{})
  }

  async enable() {
    try { const session=(navigator as Navigator & {audioSession?:{type:string}}).audioSession; if(session)session.type='playback' } catch { /* Older browsers use their default session. */ }
    const generation = ++this.generation
    const c = this.context ??= new AudioContext()
    if (!this.master) {
      this.master = c.createGain(); this.master.gain.value = 0
      this.master.connect(c.destination)
      this.movementGain = c.createGain(); this.movementGain.gain.value = 0
      this.movementPan = c.createStereoPanner()
      this.movementGain.connect(this.movementPan); this.movementPan.connect(this.master)
    }
    const resumed = c.resume()
    const unlockBuffer=c.createBuffer(1,1,c.sampleRate)
    const unlockSource=c.createBufferSource();unlockSource.buffer=unlockBuffer
    unlockSource.connect(c.destination);unlockSource.start();unlockSource.onended=()=>unlockSource.disconnect()
    if (!this.clips && !this.loading) {
      this.loading = (async () => {
        const load = async (name: string): Promise<Clip> => {
          const response = await fetch(`${import.meta.env.BASE_URL}audio/${name}.mp3`)
          if (!response.ok) throw new Error('The outdoor water recording could not be loaded.')
          const buffer = await c.decodeAudioData(await response.arrayBuffer())
          const data = buffer.getChannelData(0), step = Math.floor(buffer.sampleRate * .01)
          const energies: number[] = []
          for (let i = 0; i < data.length; i += step) {
            let energy = 0
            for (let j = i; j < Math.min(data.length, i + step); j++) energy += data[j] ** 2
            energies.push(energy / step)
          }
          const peak = Math.max(...energies)
          const first = energies.findIndex(e => e > peak * .08)
          return { buffer, onset: Math.max(0, first * .01 - .015) }
        }
        const [pond, lake] = await Promise.all([load('pond-entry'), load('lake-movement')])
        this.clips = { pond, lake }
      })().finally(() => { this.loading = null })
    }
    await Promise.all([resumed, this.loading])
    if (generation !== this.generation || c.state === 'closed') return
    this.contact = null; this.enabled = true
    this.master.gain.setTargetAtTime(.85, c.currentTime, .03)
  }

  /** Call while a pointing finger or pressed pointer is in contact, even when still. */
  touch(x: number, y: number, now: number) {
    if (!this.active || !this.clips) return
    if (!this.contact) {
      this.contact = { x, y, started: now, seen: now, travel: 0 }
      if (now - this.lastEntry > 350) {
        this.play(this.clips.pond, x, 0, .55, .12)
        this.lastEntry = now
      }
      return
    }
    const contact = this.contact
    const distance = Math.hypot(x - contact.x, y - contact.y)
    const speed = distance / Math.max(.016, (now - contact.seen) / 1000)
    contact.x = x; contact.y = y; contact.seen = now
    // Small movements in either direction keep the recorded water flowing.
    // Ignore landmark jumps, while retaining a short tail across direction changes.
    if (distance < .0005 || distance > .25 || speed < .015) return
    this.lastMotion = now
    this.motionLevel = Math.min(.24, .035 + Math.sqrt(speed) * .15)
    this.updateMovement(now)
  }

  /** Aggregate multitouch motion, including rotation with a stationary centroid. */
  motion(x:number,y:number,speed:number,now:number){
    this.touch(x,y,now)
    if(!this.active||speed<.015)return
    this.lastMotion=now;this.motionLevel=Math.min(.24,.035+Math.sqrt(speed)*.15)
    this.updateMovement(now)
  }

  private updateMovement(now: number) {
    if (!this.context || !this.clips || !this.movementGain || !this.movementPan) return
    const c = this.context
    const age = Math.max(0, now - this.lastMotion - 100)
    const level = this.contact ? this.motionLevel * Math.exp(-age / 90) : 0
    this.movementGain.gain.setTargetAtTime(level, c.currentTime, level > .01 ? .035 : .07)
    if (this.contact) this.movementPan.pan.setTargetAtTime(this.contact.x * .7 - .35, c.currentTime, .06)
    if (level < .008 || c.currentTime < this.nextMovement) return
    // Overlap real-water excerpts so one stroke flows into the next without a gap.
    const source = c.createBufferSource(), envelope = c.createGain()
    const clip = this.clips.lake
    source.buffer = clip.buffer
    const duration = Math.min(1.2, clip.buffer.duration)
    const offset = Math.min(clip.onset + (this.variation++ % 4) * .65, clip.buffer.duration - duration)
    const t = c.currentTime
    envelope.gain.setValueAtTime(0, t)
    envelope.gain.linearRampToValueAtTime(1, t + .09)
    envelope.gain.setValueAtTime(1, t + duration - .35)
    envelope.gain.linearRampToValueAtTime(0, t + duration)
    source.connect(envelope); envelope.connect(this.movementGain)
    this.movementVoices.add(source)
    source.onended = () => { this.movementVoices.delete(source); source.disconnect(); envelope.disconnect() }
    source.start(t, Math.max(0, offset), duration)
    this.nextMovement = t + duration - .3
  }

  release() {
    const contact = this.contact
    this.contact = null
    this.motionLevel = 0
    if(this.context)this.movementGain?.gain.setTargetAtTime(0,this.context.currentTime,.07)
    if (this.active && this.clips && contact && contact.seen - contact.started > 150) {
      // The quiet settling tail provides a few drops on withdrawal.
      this.play(this.clips.pond, contact.x, .55, .65, .065)
    }
  }

  tick(now: number) {
    // A short grace period prevents brief tracking loss from creating repeated entries.
    if (this.contact && now - this.contact.seen > 220) this.release()
    if(this.active)this.updateMovement(now)
  }

  preview() {
    if (!this.active || !this.clips) return
    this.play(this.clips.pond, .5, 0, .55, .12)
    this.play(this.clips.pond, .5, .55, .65, .065, .7)
  }

  private play(clip: Clip, x: number, offset: number, duration: number, volume: number, delay = 0) {
    if (!this.context || !this.master || this.voices.size >= 3) return
    const c = this.context, t = c.currentTime + delay
    const start = Math.min(clip.onset + offset, Math.max(0, clip.buffer.duration - duration))
    const source = c.createBufferSource(); source.buffer = clip.buffer
    const envelope = c.createGain(), pan = c.createStereoPanner()
    pan.pan.value = Math.max(-.35, Math.min(.35, x * .7 - .35))
    envelope.gain.setValueAtTime(0, t)
    envelope.gain.linearRampToValueAtTime(volume, t + .012)
    envelope.gain.setValueAtTime(volume, t + duration - .18)
    envelope.gain.linearRampToValueAtTime(0, t + duration)
    source.connect(envelope); envelope.connect(pan); pan.connect(this.master)
    this.voices.set(source, envelope)
    source.onended = () => {
      this.voices.delete(source); source.disconnect(); envelope.disconnect(); pan.disconnect()
    }
    source.start(t, start, duration)
  }

  damp() {
    this.contact = null
    this.motionLevel = 0; this.lastMotion = -Infinity; this.nextMovement = -Infinity
    if (!this.context) return
    const t = this.context.currentTime
    this.movementGain?.gain.setTargetAtTime(0,t,.025)
    for(const source of this.movementVoices)source.stop(t+.1)
    for (const [source, envelope] of this.voices) {
      envelope.gain.cancelAndHoldAtTime(t)
      envelope.gain.linearRampToValueAtTime(0, t + .09)
      source.stop(t + .1)
    }
  }

  mute() {
    ++this.generation; this.enabled = false; this.damp()
    if (this.context) this.master?.gain.setTargetAtTime(0, this.context.currentTime, .03)
  }

  dispose() {
    this.mute(); void this.context?.close()
    this.context = null; this.master = null; this.clips = null; this.voices.clear()
    this.movementGain = null; this.movementPan = null; this.movementVoices.clear()
  }
}
