import type {IllustrationPalette} from '../illustrationKit';
export type PaperObject={kind:'portrait'|'typewriter'|'chess'|'network'|'robot'|'book'|'terminal'|'lab';x:number;y:number;scale?:number;rotation?:number;from?:number;to?:number;seed?:number};
const clamp=(v:number)=>Math.min(1,Math.max(0,v));
const hash=(n:number,seed:number)=>{const x=Math.sin(n*127.1+seed*311.7)*43758.5453;return x-Math.floor(x)};
export function drawPaperObjects(ctx:CanvasRenderingContext2D,w:number,h:number,objects:PaperObject[],progress:number,palette:IllustrationPalette){
 const unit=Math.min(w,h);
 for(const obj of objects){
  const reveal=clamp((progress-(obj.from??0))/Math.max(.001,(obj.to??1)-(obj.from??0)));
  if(reveal<=0)continue;
  ctx.save();ctx.translate(obj.x*w,obj.y*h);ctx.rotate((obj.rotation??0)*Math.PI/180);ctx.scale(unit*(obj.scale??.23)*(.75+.25*reveal),unit*(obj.scale??.23)*(.75+.25*reveal));
  ctx.globalAlpha=reveal;ctx.shadowColor='#4A373755';ctx.shadowBlur=.07*unit;ctx.shadowOffsetX=.035*unit;ctx.shadowOffsetY=.055*unit;
  const fill=(color:string)=>{ctx.fillStyle=color;ctx.fill()};const poly=(pts:number[][],c:string)=>{ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();fill(c)};
  const rect=(x:number,y:number,ww:number,hh:number,c:string)=>{ctx.fillStyle=c;ctx.fillRect(x,y,ww,hh)};
  const circ=(x:number,y:number,r:number,c:string)=>{ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);fill(c)};
  const ink=palette.foreground,accent=palette.accent,light=palette.background;
  poly([[-.53,.43],[-.51,-.47],[.51,-.45],[.53,.46]],palette.secondary);
  ctx.shadowBlur=0;ctx.shadowOffsetX=0;ctx.shadowOffsetY=0;
  if(obj.kind==='portrait'){circ(0,-.15,.27,light);poly([[-.19,-.24],[-.2,-.43],[.18,-.44],[.22,-.24]],ink);circ(-.09,-.11,.025,ink);circ(.09,-.11,.025,ink);rect(-.1,.02,.2,.024,ink);poly([[-.42,.43],[-.28,.14],[.28,.14],[.42,.43]],ink)}
  if(obj.kind==='typewriter'||obj.kind==='terminal'){rect(-.37,-.12,.74,.38,ink);rect(-.31,-.4,.62,.33,light);for(let i=0;i<4;i++)rect(-.26+i*.15,-.32,.09,.06,accent);rect(-.29,.16,.58,.06,light)}
  if(obj.kind==='chess'){for(let i=0;i<4;i++)for(let j=0;j<4;j++)rect(-.36+i*.18,-.37+j*.18,.18,.18,(i+j)%2?ink:light);poly([[-.10,.32],[-.18,.12],[-.12,-.12],[0,-.29],[.15,-.13],[.11,.13],[.2,.32]],accent)}
  if(obj.kind==='network'){for(let i=0;i<6;i++){const a=i*Math.PI/3;ctx.strokeStyle=ink;ctx.lineWidth=.022;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(a)*.32,Math.sin(a)*.3);ctx.stroke();circ(Math.cos(a)*.32,Math.sin(a)*.3,.08,i%2?accent:light)}circ(0,0,.12,accent)}
  if(obj.kind==='robot'){rect(-.28,-.26,.56,.5,ink);circ(-.13,-.11,.07,light);circ(.13,-.11,.07,light);rect(-.14,.09,.28,.035,accent);rect(-.21,.25,.42,.11,accent);rect(-.02,-.4,.04,.14,ink)}
  if(obj.kind==='book'){poly([[-.4,-.35],[-.02,-.31],[-.02,.34],[-.4,.28]],light);poly([[.02,-.31],[.4,-.35],[.4,.28],[.02,.34]],accent);rect(-.012,-.33,.024,.69,ink)}
  if(obj.kind==='lab'){rect(-.37,-.2,.74,.47,light);for(let i=0;i<3;i++)circ(-.21+i*.21,.02,.07,i===1?accent:ink);rect(-.29,-.33,.58,.08,accent)}
  for(let i=0;i<48;i++){const x=hash(i+10,obj.seed??7)-.5,y=hash(i+60,obj.seed??7)-.5;ctx.fillStyle='rgba(45,36,31,.09)';ctx.fillRect(x,y,.009,.009);}
  ctx.restore();
 }
}
