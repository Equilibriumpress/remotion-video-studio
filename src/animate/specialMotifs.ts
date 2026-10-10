import type {IllustrationPalette} from './illustrationKit';
export type SpecialMotif='raindrop'|'watch'|'kyoto';
export type SpecialObject={kind:SpecialMotif;phase?:number;detail?:number};
export function drawSpecial(ctx:CanvasRenderingContext2D,w:number,h:number,p:number,obj:SpecialObject,palette:IllustrationPalette){
 const u=Math.min(w,h),x=w*.52,y=h*.65;
 ctx.save();ctx.translate(x,y);ctx.scale(u,u);ctx.lineWidth=.009;ctx.lineJoin='round';ctx.strokeStyle=palette.foreground;
 const path=(pts:number[][],color:string)=>{ctx.beginPath();pts.forEach(([a,b],i)=>i?ctx.lineTo(a,b):ctx.moveTo(a,b));ctx.closePath();ctx.fillStyle=color;ctx.fill();ctx.stroke()};
 const circle=(a:number,b:number,r:number,color:string)=>{ctx.beginPath();ctx.arc(a,b,r,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();ctx.stroke()};
 if(obj.kind==='raindrop'){
  const phase=obj.phase??0;const yy=-.22+Math.sin(p*Math.PI*2+phase)*.075;
  path([[0,yy-.27],[.16,yy-.05],[.19,yy+.05],[.12,yy+.18],[0,yy+.22],[-.12,yy+.18],[-.19,yy+.05],[-.16,yy-.05]],palette.secondary);
  circle(-.07,yy-.01,.044,palette.background);
  for(let i=0;i<5;i++){const t=(p*1.4+i/5)%1;circle((i-2)*.12,.24+t*.12,.018,palette.accent)}
 }else if(obj.kind==='watch'){
  circle(0,-.09,.29,palette.secondary);circle(0,-.09,.23,palette.background);
  for(let i=0;i<12;i++){const a=i*Math.PI/6;circle(Math.sin(a)*.2,-.09-Math.cos(a)*.2,.012,palette.foreground)}
  const a=p*Math.PI*2;ctx.beginPath();ctx.moveTo(0,-.09);ctx.lineTo(Math.sin(a)*.16,-.09-Math.cos(a)*.16);ctx.stroke();
  ctx.save();ctx.translate(.32,.13);ctx.rotate(p*Math.PI*4);for(let i=0;i<10;i++){const a=i*Math.PI/5;circle(Math.cos(a)*.13,Math.sin(a)*.13,.055,palette.accent)}circle(0,0,.12,palette.foreground);circle(0,0,.055,palette.background);ctx.restore();
  ctx.save();ctx.translate(-.33,.18);ctx.rotate(-p*Math.PI*3);for(let i=0;i<8;i++){const a=i*Math.PI/4;circle(Math.cos(a)*.10,Math.sin(a)*.10,.045,palette.secondary)}circle(0,0,.09,palette.foreground);ctx.restore();
 }else{
  path([[-.4,.24],[-.4,-.02],[0,-.30],[.4,-.02],[.4,.24]],palette.secondary);
  path([[-.46,-.01],[0,-.37],[.46,-.01],[.35,-.03],[0,-.28],[-.35,-.03]],palette.foreground);
  for(let i=-2;i<=2;i++){const xx=i*.14;ctx.fillStyle=palette.background;ctx.fillRect(xx-.035,.03,.07,.13)}
  ctx.fillStyle=palette.accent;ctx.fillRect(-.42,.25,.84,.025);
  for(let i=0;i<5;i++){const xx=-.37+i*.18;circle(xx,-.4-.035*Math.sin(i+p*2),.023,palette.accent)}
 }
 ctx.restore();
}
