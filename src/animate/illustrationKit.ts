/**
 * Reusable, deterministic illustration primitives. Coordinates are normalized 0–1.
 * Agent-authored project JSON supplies paths, shapes and labels; Pages only draws.
 */
export type Point = [number, number];
export type IllustrationElement = {
  kind: 'path' | 'circle' | 'rect' | 'label' | 'flow';
  points?: Point[];
  x?: number; y?: number; width?: number; height?: number;
  text?: string;
  color?: string;
  from?: number; to?: number;
  speed?: number;
};
export type IllustrationPalette = {foreground: string; accent: string; secondary: string; background: string};
const clamp = (n:number) => Math.max(0,Math.min(1,n));
const smooth = (t:number) => {const v=clamp(t);return v*v*(3-2*v);};
export function drawElements(ctx:CanvasRenderingContext2D, width:number, height:number, elements:IllustrationElement[], progress:number, palette:IllustrationPalette){
  const scale=Math.min(width,height);
  for(const element of elements){
    const from=element.from ?? 0, to=element.to ?? 1;
    const reveal=smooth((progress-from)/Math.max(.001,to-from));
    if(reveal<=0)continue;
    const color=element.color ?? palette.accent;
    ctx.save();ctx.globalAlpha=reveal;ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=Math.max(2,scale*.005);ctx.lineCap='round';ctx.lineJoin='round';
    if(element.kind==='rect')ctx.fillRect((element.x??0)*width,(element.y??0)*height,(element.width??.1)*width*reveal,(element.height??.1)*height);
    if(element.kind==='circle'){ctx.beginPath();ctx.arc((element.x??.5)*width,(element.y??.5)*height,(element.width??.05)*scale*reveal,0,Math.PI*2);ctx.fill();}
    if(element.kind==='label'){
      ctx.font=`600 ${Math.round(scale*.026)}px Arial, sans-serif`;
      ctx.fillText(element.text??'',(element.x??.5)*width,(element.y??.5)*height);
    }
    if((element.kind==='path'||element.kind==='flow')&&element.points&&element.points.length>1){
      const points=element.points;const lengths:number[]=[];let total=0;
      for(let i=1;i<points.length;i++){const dx=(points[i][0]-points[i-1][0])*width,dy=(points[i][1]-points[i-1][1])*height;const len=Math.hypot(dx,dy);lengths.push(len);total+=len;}
      const target=total*reveal;let travelled=0;
      ctx.beginPath();ctx.moveTo(points[0][0]*width,points[0][1]*height);
      for(let i=1;i<points.length;i++){
        const length=lengths[i-1];if(travelled+length<=target){ctx.lineTo(points[i][0]*width,points[i][1]*height);travelled+=length;}
        else{const f=length===0?0:clamp((target-travelled)/length);ctx.lineTo((points[i-1][0]+(points[i][0]-points[i-1][0])*f)*width,(points[i-1][1]+(points[i][1]-points[i-1][1])*f)*height);break;}
      }
      ctx.stroke();
      if(element.kind==='flow'&&total>0){
        const phase=((progress*(element.speed??1)*4)%1+1)%1;let distance=total*phase;
        for(let i=1;i<points.length;i++){const len=lengths[i-1];if(distance<=len){const f=len===0?0:distance/len;ctx.beginPath();ctx.arc((points[i-1][0]+(points[i][0]-points[i-1][0])*f)*width,(points[i-1][1]+(points[i][1]-points[i-1][1])*f)*height,scale*.014,0,Math.PI*2);ctx.fill();break;}distance-=len;}
      }
    }
    ctx.restore();
  }
}
