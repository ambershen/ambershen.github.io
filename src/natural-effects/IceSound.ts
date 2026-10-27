/** Quiet, event-driven playback of real recordings. No synthesized tones. */
export class IceSound {
 private c:AudioContext|null=null
 private master:GainNode|null=null
 private clips:AudioBuffer[]=[]
 private loading:Promise<void>|null=null
 private voices=new Set<AudioBufferSourceNode>()
 private rubbing:{source:AudioBufferSourceNode;gain:GainNode;pan:StereoPannerNode}|null=null
 private lastMove=-Infinity
 private lastRubStart=-Infinity
 private nextCrack=0
 private variation=0
 private contacts=new Map<number,{stage:number;threshold:number}>()
 enabled=true
 async unlock(){
  if(!this.enabled)return
  try{const session=(navigator as Navigator & {audioSession?:{type:string}}).audioSession;if(session)session.type='playback'}catch{}
  const c=this.c??=new AudioContext()
  if(!this.master){this.master=c.createGain();this.master.gain.value=.48;this.master.connect(c.destination)}
  const resumed=c.resume(),s=c.createBufferSource();s.buffer=c.createBuffer(1,1,c.sampleRate);s.connect(c.destination);s.start();s.onended=()=>s.disconnect()
  if(!this.clips.length&&!this.loading)this.loading=Promise.all(['ice-rub','ice-crack','ice-crack-soft'].map(async name=>{const r=await fetch(`${import.meta.env.BASE_URL}audio/${name}.mp3`);if(!r.ok)throw Error('Ice audio unavailable');return c.decodeAudioData(await r.arrayBuffer())})).then(clips=>{this.clips=clips}).finally(()=>{this.loading=null})
  await Promise.all([resumed,this.loading])
 }
 motion(speed:number,x:number,now:number){
  const c=this.c,clip=this.clips[0];if(!this.enabled||!c||c.state!=='running'||!clip||speed<18)return
  this.lastMove=now
  // One continuous take, never rapid overlapping grains. Leave breathing room between takes.
  if(!this.rubbing&&now-this.lastRubStart>2400){
   const source=c.createBufferSource(),gain=c.createGain(),pan=c.createStereoPanner(),filter=c.createBiquadFilter()
   source.buffer=clip;gain.gain.value=0;filter.type='lowpass';filter.frequency.value=1200
   source.connect(filter);filter.connect(gain);gain.connect(pan);pan.connect(this.master!)
   this.rubbing={source,gain,pan};this.voices.add(source);this.lastRubStart=now
   source.onended=()=>{if(this.rubbing?.source===source)this.rubbing=null;this.voices.delete(source);source.disconnect();filter.disconnect();gain.disconnect();pan.disconnect()}
   source.start(0,.12,Math.min(2.25,clip.duration-.12))
  }
  if(this.rubbing){this.rubbing.gain.gain.setTargetAtTime(Math.min(.075,speed/8500),c.currentTime,.09);this.rubbing.pan.pan.setTargetAtTime((x*2-1)*.3,c.currentTime,.1)}
 }
 tick(now:number){if(this.rubbing&&this.c&&now-this.lastMove>70)this.rubbing.gain.gain.setTargetAtTime(0,this.c.currentTime,.055)}
 fracture(id:number,amount:number,x:number,now:number){
  if(amount<=0)return
  let contact=this.contacts.get(id)
  if(!contact){contact={stage:0,threshold:.65+Math.random()*.35};this.contacts.set(id,contact)}
  if(amount<contact.threshold||contact.stage>=2)return
  const c=this.c,clip=this.clips[1+(this.variation++%2)]
  // A small release and one deeper break per press, not a crack on a metronome.
  if(now<this.nextCrack||!this.enabled||!c||c.state!=='running'||!clip||this.voices.size>=4)return
  contact.stage++;contact.threshold=2.5+Math.random()*.7
  this.nextCrack=now+850
  const source=c.createBufferSource(),gain=c.createGain(),pan=c.createStereoPanner(),filter=c.createBiquadFilter()
  source.buffer=clip;filter.type='lowpass';filter.frequency.value=contact.stage===1?2600:4300;pan.pan.value=(x*2-1)*.35
  source.connect(filter);filter.connect(gain);gain.connect(pan);pan.connect(this.master!)
  const t=c.currentTime,len=clip.duration,volume=contact.stage===1?.11:.23
  gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(volume,t+.008);gain.gain.setValueAtTime(volume,t+Math.max(.01,len-.18));gain.gain.linearRampToValueAtTime(0,t+len)
  this.voices.add(source);source.onended=()=>{this.voices.delete(source);source.disconnect();filter.disconnect();gain.disconnect();pan.disconnect()};source.start()
 }
 release(id:number){this.contacts.delete(id)}
 quiet(){for(const source of this.voices){try{source.stop()}catch{}}this.voices.clear();this.rubbing=null;this.contacts.clear();this.lastMove=-Infinity;this.lastRubStart=-Infinity}
 toggle(){this.enabled=!this.enabled;if(!this.enabled)this.quiet();return this.enabled}
 dispose(){this.quiet();void this.c?.close()}
}
