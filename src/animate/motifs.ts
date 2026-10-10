import type {AnimateDrawing} from './draw';
import {animateStyles} from './styles';

export type IllustrationMotif = 'city' | 'temple' | 'train' | 'village' | 'pixel-night' | 'geometry';
export type CameraPreset = 'static' | 'push' | 'pan-left';
const ease = (x: number) => {const p = Math.max(0, Math.min(1, x)); return p * p * (3 - 2 * p);};

/** All coordinates are normalized. Each motif is drawn from primitives without external assets. */
export function drawMotif(ctx: CanvasRenderingContext2D, args: AnimateDrawing & {motif: IllustrationMotif; camera?: CameraPreset}) {
  const {width: w, height: h, motif} = args;
  const p = ease(args.progress);
  const colors = animateStyles[args.style];
  const unit = Math.min(w, h);
  ctx.save();
  const camera = args.camera ?? 'static';
  if (camera === 'push') {const z = 1 + .14 * p; ctx.translate(w / 2, h / 2); ctx.scale(z, z); ctx.translate(-w / 2, -h / 2);}
  if (camera === 'pan-left') ctx.translate(w * .08 * (1 - p), 0);
  const rect = (x:number,y:number,bw:number,bh:number,color:string) => {ctx.fillStyle=color;ctx.fillRect(w*x,h*y,w*bw,h*bh);};
  const path = (points: [number,number][], color:string, fill=true) => {
    ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(w*x,h*y):ctx.moveTo(w*x,h*y));ctx.closePath();ctx.fillStyle=color;ctx.strokeStyle=color;fill?ctx.fill():ctx.stroke();
  };
  if (motif === 'temple') {
    for(let i=0;i<3;i++) {
      const y=.54+i*.074;
      rect(.24,y,.52,.069, i%2?colors.accent:colors.secondary);
      path([[.19,y],[.5,y-.065],[.81,y],[.75,y+.014],[.25,y+.014]],colors.foreground);
    }
    for(let i=0;i<5;i++) rect(.29+i*.103,.61,.022,.23,colors.foreground);
    rect(.15,.82,.7,.025,colors.foreground);
    for(let i=0;i<5;i++){const x=.1+i*.19;rect(x,.45,.018,.36,colors.secondary);}
  } else if(motif==='train'){
    const x=.06+.18*p;rect(x,.55,.66,.17,colors.secondary);
    path([[x+.66,.55],[x+.76,.63],[x+.66,.72]],colors.accent);
    for(let i=0;i<7;i++)rect(x+.045+i*.085,.58,.059,.065,colors.foreground);
    rect(.04,.75,.9,.012,colors.foreground);
    for(let i=0;i<8;i++)rect(.04+i*.12,.775,.065,.009,colors.secondary);
  } else if(motif==='village' || motif==='city'){
    for(let i=0;i<7;i++) {
      const x=.12+i*.115;
      const tall = motif==='city' ? .15+(i%3)*.085 : .12+(i%2)*.04;
      const rise=ease((p-i*.07)/.45);
      const y=.76-tall*rise;
      rect(x,y,.091,tall*rise,i%3===0?colors.accent:i%3===1?colors.secondary:colors.foreground);
      path([[x-.01,y],[x+.045,y-.042*rise],[x+.101,y]],colors.foreground);
      if(rise>.75)for(let j=0;j<3;j++)rect(x+.02+j*.019,y+.055,.012,.012,colors.background);
    }
    if(motif==='village')for(let i=0;i<5;i++){
      const x=.07+i*.2;
      rect(x,.72,.014,.10,colors.foreground);
      ctx.fillStyle=colors.secondary;ctx.beginPath();ctx.arc(w*(x+.007),h*.70,unit*.038,0,Math.PI*2);ctx.fill();
    }
    rect(0,.82,1,.016,colors.foreground);
  } else if(motif==='pixel-night') {
    rect(0,.3,1,.5,colors.foreground);
    for(let i=0;i<9;i++){
      const x=.05+i*.103, ht=.13+(i%4)*.045;
      rect(x,.79-ht,.083,ht,colors.secondary);
      for(let row=0;row<4;row++)for(let col=0;col<2;col++)if((i+row+col+Math.floor(p*8))%3!==0)rect(x+.015+col*.034,.81-ht+row*.032,.014,.012,colors.accent);
    }
    rect(0,.8,1,.019,colors.accent);
  } else {
    ctx.lineWidth=unit*.004;
    for(let i=0;i<6;i++){
      ctx.strokeStyle=i%2?colors.accent:colors.secondary;
      ctx.beginPath();ctx.arc(w*(.24+i*.105),h*(.66-.13*Math.sin(i)),unit*(.035+.022*i)*p,0,Math.PI*2);ctx.stroke();
    }
    ctx.strokeStyle=colors.foreground;ctx.beginPath();
    for(let i=0;i<=80;i++){const x=.08+i/80*.84;const y=.69-.10*Math.sin(i/80*4*Math.PI)*p;i===0?ctx.moveTo(w*x,h*y):ctx.lineTo(w*x,h*y);}ctx.stroke();
  }
  ctx.restore();
}
