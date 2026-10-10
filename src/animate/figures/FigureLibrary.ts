import type {IllustrationPalette} from '../illustrationKit';
export type FigureKind='person'|'computer'|'robot'|'brain'|'circuit'|'book'|'timeline'|'speech'|'chess';
export type Figure={kind:FigureKind;x:number;y:number;scale?:number;color?:string;from?:number;to?:number;label?:string};
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
export function drawFigures(ctx:CanvasRenderingContext2D,w:number,h:number,figures:Figure[],progress:number,palette:IllustrationPalette){
 const unit=Math.min(w,h);
 for(const f of figures){const t=clamp((progress-(f.from??0))/Math.max(.001,(f.to??1)-(f.from??0)));if(t===0)continue;
 ctx.save();ctx.translate(f.x*w,f.y*h);ctx.scale(unit*(f.scale??.18),unit*(f.scale??.18));ctx.globalAlpha=t;
 const ink=f.color??palette.foreground;ctx.strokeStyle=ink;ctx.fillStyle=ink;ctx.lineWidth=.035;ctx.lineJoin='round';
 const box=(x:number,y:number,a:number,b:number)=>ctx.fillRect(x,y,a,b);
 const line=(pts:number[][])=>{ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke()};
 const disc=(x:number,y:number,r:number)=>{ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill()};
 if(f.kind==='person'){disc(0,-.5,.19);box(-.21,-.26,.42,.55);line([[-.16,.27],[-.25,.62]]);line([[.16,.27],[.25,.62]]);line([[-.2,-.1],[-.42,.12]]);line([[.2,-.1],[.44,.05+Math.sin(t*Math.PI)*.16]])}
 if(f.kind==='computer'){box(-.5,-.42,1,.65);ctx.fillStyle=palette.background;box(-.39,-.30,.78,.39);ctx.fillStyle=ink;box(-.07,.24,.14,.20);box(-.35,.43,.70,.08)}
 if(f.kind==='robot'){box(-.35,-.43,.70,.65);ctx.fillStyle=palette.background;disc(-.16,-.19,.07);disc(.16,-.19,.07);ctx.fillStyle=ink;box(-.2,.07,.4,.04);line([[0,-.43],[0,-.62]])}
 if(f.kind==='brain'){for(let i=0;i<7;i++)disc(Math.cos(i*2.4)*.23,Math.sin(i*2.4)*.18,.20);ctx.strokeStyle=palette.background;line([[0,-.36],[0,.36]])}
 if(f.kind==='circuit'){for(let i=-2;i<=2;i++){line([[-.45,i*.16],[.45,i*.16]]);disc((i%2)*.21,i*.16,.055)}}
 if(f.kind==='book'){box(-.47,-.34,.44,.72);box(.03,-.34,.44,.72);ctx.strokeStyle=palette.background;line([[0,-.34],[0,.38]])}
 if(f.kind==='timeline'){line([[-.5,0],[.5,0]]);for(let i=-2;i<=2;i++)disc(i*.22,0,.065)}
 if(f.kind==='speech'){box(-.48,-.35,.96,.55);line([[-.12,.2],[-.30,.41],[-.27,.2]]);ctx.fillStyle=palette.background;for(let i=-1;i<=1;i++)disc(i*.24,-.1,.05)}
 if(f.kind==='chess'){box(-.27,.24,.54,.15);box(-.20,.09,.40,.15);box(-.14,-.10,.28,.22);disc(0,-.31,.20)}
 if(f.label){ctx.fillStyle=ink;ctx.font='.13px Arial';ctx.fillText(f.label,-.48,.78)}
 ctx.restore();
 }
}
