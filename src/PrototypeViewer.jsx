import React from 'react';
import {hotspotStyle} from './routing.js';
export default function PrototypeViewer({page,debug,onHotspot,onLoad}){
 return <div className="canvas" style={{aspectRatio:`${page.width}/${page.height}`}}><img src={`${import.meta.env.BASE_URL}${page.image.slice(1)}`} width={page.width} height={page.height} alt={page.name} onLoad={onLoad} onError={e=>{e.currentTarget.alt=`原图加载失败：${page.image}`;}}/>{page.hotspots.map(h=><button key={h.id} className={`hotspot ${debug?'show':''} ${h.status}`} style={hotspotStyle(h,page)} aria-label={h.label} onClick={()=>onHotspot(h)}>{debug&&<span>{h.label} · {h.status} → {h.target|| (h.action==='back'&&h.status==='confirmed'?'来源页':'待确认')}</span>}</button>)}</div>;
}
