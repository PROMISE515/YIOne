export const types = {home:'首页',plaza:'广场',assistant:'助手',persona:'分身',task:'任务',external:'外链',system:'系统'};
const text=v=>typeof v==='string'&&v.trim().length>0;
export function validate(c){
 if(!c||c.version!==2||!Array.isArray(c.pages)||!c.pages.length)throw Error('需要 version: 2 和非空 pages');
 const ids=new Set();
 for(const p of c.pages){
  if(!p||!text(p.id)||!text(p.name)||ids.has(p.id))throw Error('页面 ID/名称无效或重复');ids.add(p.id);
  if(!Object.hasOwn(types,p.type))throw Error(`${p.id}: 节点类型无效`);
  if(!/^\/prototype\/[^?#]+\.png$/.test(p.image)||p.image.includes('..'))throw Error(`${p.id}: 图片必须为本地 prototype PNG`);
  if(p.width!==1206||p.height!==2622)throw Error(`${p.id}: 原图尺寸必须为 1206×2622`);
  if(!Array.isArray(p.hotspots)||typeof p.notes!=='string')throw Error(`${p.id}: 缺少 hotspots / notes`);
  if(!p.context||typeof p.context!=='object'||Array.isArray(p.context))throw Error('context 必须为对象');
  const hs=new Set();
  for(const h of p.hotspots){
   if(!h||!text(h.id)||!text(h.label)||hs.has(h.id))throw Error(`${p.id}: 热区 ID/名称无效或重复`);hs.add(h.id);
   if(!['x','y','width','height'].every(k=>Number.isFinite(h[k]))||h.x<0||h.y<0||h.width<=0||h.height<=0||h.x+h.width>p.width||h.y+h.height>p.height)throw Error(`${p.id}/${h.id}: 热区越界或尺寸无效`);
   if(!['confirmed','pending'].includes(h.status)||!['navigate','back','local'].includes(h.action))throw Error('热区状态或动作无效');
   if(h.status==='pending'&&(!text(h.reason)||h.target!==null))throw Error('pending 必须说明原因且 target 为 null');
   if(h.status==='confirmed'&&h.action==='navigate'&&!text(h.target))throw Error('confirmed 导航缺少 target');
   if(h.action==='local'&&h.target!==null)throw Error('local 动作不得配置 target');
  }
 }
 if(!ids.has(c.startPage))throw Error('startPage 无效');
 for(const p of c.pages){if(p.back&&!ids.has(p.back.fallback))throw Error('返回落点不存在');for(const h of p.hotspots)if(h.target&&!ids.has(h.target))throw Error('目标页面不存在');}
 return c;
}
export function resolveHotspot(h){return h.status==='confirmed'?{action:h.action,target:h.target}:null;}
export function hotspotStyle(h,p){return {left:`${h.x/p.width*100}%`,top:`${h.y/p.height*100}%`,width:`${h.width/p.width*100}%`,height:`${h.height/p.height*100}%`};}
