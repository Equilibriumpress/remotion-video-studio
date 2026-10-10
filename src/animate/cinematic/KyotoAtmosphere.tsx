const hash=(n:number)=>{const a=Math.sin(n*127.1+73.4)*43758.5;return a-Math.floor(a)};
export function KyotoAtmosphere({progress,amount=55}:{progress:number;amount?:number}){
 return <g aria-hidden="true" style={{pointerEvents:'none'}}>
 <defs><linearGradient id="wet-film" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#f4ae74" stopOpacity=".02"/><stop offset=".65" stopColor="#f4ae74" stopOpacity=".03"/><stop offset="1" stopColor="#f4ae74" stopOpacity=".24"/></linearGradient></defs>
 <rect y="1250" width="1080" height="670" fill="url(#wet-film)"/>
 {Array.from({length:amount},(_,i)=>{const x=hash(i+18)*1120;const y=(hash(i+510)*2050+progress*(340+i%7*53))%2070-50;const depth=.3+hash(i+95)*.7;return <path key={i} d={`M${x} ${y}l${-9*depth} ${25*depth}`} stroke="#d8e8ee" strokeOpacity={.09+.16*depth} strokeWidth={1.2*depth} strokeLinecap="round"/>})}
 {Array.from({length:24},(_,i)=>{const x=80+hash(i+76)*940,y=1640+hash(i+400)*260;return <rect key={i} x={x} y={y} width={12+hash(i+150)*85} height={1.5+hash(i+30)*3} fill="#f6ad77" opacity={.09+hash(i+7)*.15}/>})}
 </g>;
}
