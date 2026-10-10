/** Stable local scene cue pulses, evaluated from frame time, never wall-clock. */
export type BeatCue={at:number;strength?:number;decay?:number};
const clamp=(n:number)=>Math.min(1,Math.max(0,n));
export function beatEnergy(cues:BeatCue[],sceneSeconds:number){
 return cues.reduce((sum,cue)=>{const dt=sceneSeconds-cue.at;if(dt<0)return sum;return Math.max(sum,(cue.strength??.65)*Math.exp(-dt/Math.max(.025,cue.decay??.18)));},0);
}
export function paintBeatAccent(ctx:CanvasRenderingContext2D,w:number,h:number,cues:BeatCue[],sceneSeconds:number,color='#E9783F'){
 const pulse=clamp(beatEnergy(cues,sceneSeconds));if(pulse<.015)return;
 ctx.save();ctx.strokeStyle=color;ctx.globalAlpha=.20*pulse;ctx.lineWidth=Math.min(w,h)*(.004+.009*pulse);
 ctx.beginPath();ctx.arc(w*.84,h*.40,Math.min(w,h)*(.05+.14*pulse),0,Math.PI*2);ctx.stroke();ctx.restore();
}
