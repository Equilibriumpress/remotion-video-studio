export type Handoff={key:string;fromX:number;fromY:number;toX:number;toY:number;radius?:number;color?:string;entryFrames?:number;exitFrames?:number};
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
const smooth=(x:number)=>{const t=clamp(x);return t*t*(3-2*t)};
export function handoffPosition(h:Handoff,frame:number,frames:number){
 const enter=smooth(frame/Math.max(1,h.entryFrames??15));
 const leave=smooth((frame-(frames-Math.max(1,h.exitFrames??15)))/Math.max(1,h.exitFrames??15));
 const t=clamp(.5*enter+.5*leave);
 return {x:h.fromX+(h.toX-h.fromX)*t,y:h.fromY+(h.toY-h.fromY)*t,scale:.78+.22*Math.sin(Math.PI*clamp(frame/Math.max(1,frames-1)))};
}
export function drawHandoff(ctx:CanvasRenderingContext2D,w:number,h:number,shape:Handoff,frame:number,frames:number){
 const p=handoffPosition(shape,frame,frames);
 ctx.save();ctx.fillStyle=shape.color??'#E9783F';ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=Math.min(w,h)*.027;
 ctx.beginPath();ctx.arc(p.x*w,p.y*h,Math.min(w,h)*(shape.radius??.025)*p.scale,0,Math.PI*2);ctx.fill();ctx.restore();
}
