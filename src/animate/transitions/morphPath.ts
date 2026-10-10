export type Vertex = [number, number];
export type MorphSpec = {from:Vertex[];to:Vertex[];fromColor?:string;toColor?:string;start?:number;end?:number};
export const clamp01=(v:number)=>Math.min(1,Math.max(0,v));
export const easing=(x:number)=>{const t=clamp01(x);return t*t*(3-2*t)};
export function interpolatePolygon(spec:MorphSpec,progress:number):Vertex[]{
 const t=easing((progress-(spec.start??0))/Math.max(.001,(spec.end??1)-(spec.start??0)));
 return spec.from.map(([x,y],i)=>[x+(spec.to[i][0]-x)*t,y+(spec.to[i][1]-y)*t]);
}
export function drawMorph(ctx:CanvasRenderingContext2D,w:number,h:number,spec:MorphSpec,progress:number){
 if(spec.from.length<3||spec.from.length!==spec.to.length)return;
 const points=interpolatePolygon(spec,progress);
 const t=easing((progress-(spec.start??0))/Math.max(.001,(spec.end??1)-(spec.start??0)));
 const color=(hex:string)=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
 const a=color(spec.fromColor??'#E9783F'),b=color(spec.toColor??spec.fromColor??'#E9783F');
 const rgb=a.map((v,i)=>Math.round(v+(b[i]-v)*t));
 ctx.save();ctx.fillStyle='rgb('+rgb.join(',')+')';ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=Math.min(w,h)*.016;
 ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x*w,y*h):ctx.moveTo(x*w,y*h));ctx.closePath();ctx.fill();ctx.restore();
}
