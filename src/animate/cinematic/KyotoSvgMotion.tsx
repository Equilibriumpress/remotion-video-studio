import type {KyotoArtShot} from './svg-art/KyotoArtwork';
/** SVG objects animated only from composition frame progress. */
export function KyotoSvgMotion({shot,progress}:{shot:KyotoArtShot;progress:number}){
 const p=Math.max(0,Math.min(1,progress)),breath=Math.sin(p*Math.PI*6);
 const lamps=shot==='lantern'?[[535,815,3.2]]:shot==='teahouse'?[[565,715,1.2]]:[[150,820,1.2],[920,925,1.1]];
 return <g aria-hidden="true" style={{pointerEvents:'none'}}>
 <defs><radialGradient id="kyoto-light"><stop stopColor="#ffe8ad" stopOpacity=".62"/><stop offset=".33" stopColor="#ffae67" stopOpacity=".28"/><stop offset="1" stopColor="#ffa65e" stopOpacity="0"/></radialGradient></defs>
 {lamps.map(([x,y,s],i)=><g key={i} transform={`translate(${x} ${y}) rotate(${breath*(1+i*.24)*1.5})`}>
 <ellipse rx={145*s*(1+.035*breath)} ry={188*s} fill="url(#kyoto-light)" opacity={.78+.13*breath}/>
 <path d={`M ${-10*s} ${-100*s} Q ${24*s} 0 ${-10*s} ${100*s}`} stroke="#ffd5a0" strokeWidth={3*s} fill="none" opacity=".24"/>
 </g>)}
 {shot==='pagoda'&&<g transform={`translate(${540+35*Math.sin(p*Math.PI)} 550)`}><path d="M-60 0Q0 -35 60 0" stroke="#efc89e" fill="none" strokeWidth="4" opacity=".5"/></g>}
 </g>;
}
