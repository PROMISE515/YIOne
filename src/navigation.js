export const pageFromPath=path=>/(?:^|\/)prototype\/((?:N|G|S|A|B)\d+)$/.exec(path)?.[1]||null;
export function initialEntry(page){return {prototype:true,key:crypto.randomUUID(),page,trail:[page],depth:0,scroll:0,context:{}};}
export function nextEntry(previous,page,context={}){return {...initialEntry(page),trail:[...(previous?.trail||[]),page],depth:(previous?.depth||0)+1,context};}
export function stepsBackTo(entry,page){const trail=entry?.trail||[];const index=trail.lastIndexOf(page);return index<0?0:trail.length-1-index;}
export function planReturnToWorkbench(entry){const trail=entry?.trail||[];let index=trail.lastIndexOf('N34');while(index>=2&&trail[index-1]==='N27'&&trail[index-2]==='N34')index-=2;const steps=index<0?0:trail.length-1-index;return steps>0&&steps<=(entry?.depth||0)?{mode:'back',steps}:{mode:'replace',page:'N34'};}
export function planToolbarBack(entry,entryStep){
 if(entryStep==='setup')return {mode:'entry',step:'register'};
 if(entryStep==='register')return {mode:'entry',step:'welcome'};
 if(entryStep==='welcome')return {mode:'none'};
 if((entry?.depth||0)>0)return {mode:'history'};
 if(entry?.fromSetup)return {mode:'entry',step:'setup',answers:entry.entryAnswers||[]};
 return {mode:'none'};
}
