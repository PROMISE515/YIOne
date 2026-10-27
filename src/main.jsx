import React,{useEffect,useState,useRef} from 'react';
import {createRoot} from 'react-dom/client';
import {validate,resolveHotspot} from './routing.js';
import {pageFromPath,initialEntry,nextEntry,planReturnToWorkbench,planToolbarBack,stepsBackTo} from './navigation.js';
import PrototypeViewer from './PrototypeViewer.jsx';
import H5Pages from './H5Pages.jsx';
import CallPages from './CallPages.jsx';
import GroupChatPages from './GroupChatPages.jsx';
import PostComposerPages from './PostComposerPages.jsx';
import StructurePages from './StructurePages.jsx';
import SidebarSettingsPages from './SidebarSettingsPages.jsx';
import PersonaFlowPages from './PersonaFlowPages.jsx';
import {PhoneShell} from './PhoneChrome.jsx';
import DebugWorkbench from './DebugWorkbench.jsx';
import BubbleSettings from './BubbleSettings.jsx';
import PostDetailPage from './PostDetailPage.jsx';
import FirstVisitGuide from './FirstVisitGuide.jsx';
import EntryFlow from './EntryFlow.jsx';
import './style.css';
import './ui-system.css';
const appBase=import.meta.env.BASE_URL;
const prototypePath=id=>`${appBase}prototype/${id}`;
const entryStepFromPath=path=>['welcome','register','setup'].find(step=>path===`${appBase}${step}`)||null;
const workbenchPageIds=new Set(['N34','A01','N27','N28','N31','N32','N35','N36','N38','G01','G03','G04']);
function App(){
 const [config,setConfig]=useState(null),[error,setError]=useState(''),[location,setLocation]=useState(window.location.pathname+window.location.search),[entry,setEntry]=useState(history.state),[message,setMessage]=useState(''),[copy,setCopy]=useState(false);const restore=useRef(null), positions=useRef(new Map()), changing=useRef(false), phoneScroll=useRef(null);
 const [onboardingComplete,setOnboardingComplete]=useState(()=>{try{return localStorage.getItem('yione-onboarding-complete')==='1'}catch{return false}});
 const [guideDismissed,setGuideDismissed]=useState(false);
 const [registerDraft,setRegisterDraft]=useState({phone:'',code:''});
 const debug=new URLSearchParams(location.split('?')[1]).get('debug')==='1';
 const previewGuide=new URLSearchParams(location.split('?')[1]).get('onboarding')==='1';
 useEffect(()=>{fetch(`${appBase}routes.json`).then(r=>{if(!r.ok)throw Error('配置读取失败');return r.json();}).then(validate).then(c=>{if(window.location.pathname===appBase||window.location.pathname==='/'){let completed=false;try{completed=localStorage.getItem('yione-setup-complete')==='1'}catch{}if(completed)history.replaceState(initialEntry(c.startPage),'',`${prototypePath(c.startPage)}${window.location.search}`);else history.replaceState({entryFlow:true},'',`${appBase}welcome`);}else if(entryStepFromPath(window.location.pathname)){if(!history.state?.entryFlow)history.replaceState({entryFlow:true},'');}else if(!history.state?.prototype){history.replaceState(initialEntry(pageFromPath(window.location.pathname)),'');}setEntry(history.state);setLocation(window.location.pathname+window.location.search);setConfig(c);}).catch(e=>setError(e.message));
 history.scrollRestoration='manual';const pop=()=>{changing.current=true;restore.current=positions.current.get(history.state?.key)??history.state?.scroll??0;setEntry(history.state);setLocation(window.location.pathname+window.location.search);setMessage('');const y=restore.current;requestAnimationFrame(()=>{phoneScroll.current?.scrollTo(0,y);setTimeout(()=>{changing.current=false;},100);});};window.addEventListener('popstate',pop);return()=>window.removeEventListener('popstate',pop);},[]);
 function recordScroll(){if(history.state?.prototype&&!changing.current){const y=phoneScroll.current?.scrollTop||0;positions.current.set(history.state.key,y);history.replaceState({...history.state,scroll:y},'');}}
 function navigate(id,reset=false,context={},replace=false,metadata={}){if(!reset&&!replace&&id===pageFromPath(window.location.pathname))return;const y=phoneScroll.current?.scrollTop||0;positions.current.set(history.state?.key,y);history.replaceState({...history.state,scroll:y},'');changing.current=true;restore.current=0;const previous=history.state;const e={...(reset?initialEntry(id):replace?{...initialEntry(id),trail:[...(previous?.trail||[]).slice(0,-1),id],depth:previous?.depth||0,context}:nextEntry(previous,id,context)),...metadata};history[replace?'replaceState':'pushState'](e,'',`${prototypePath(id)}${debug?'?debug=1':''}`);setEntry(e);setLocation(window.location.pathname+window.location.search);setMessage('');phoneScroll.current?.scrollTo(0,0);setTimeout(()=>{changing.current=false;},100);}
 function navigateEntry(step,answers){const next={entryFlow:true,...(answers?{entryAnswers:answers}:{})};history.replaceState(next,'',`${appBase}${step}`);setEntry(next);setLocation(window.location.pathname);phoneScroll.current?.scrollTo(0,0)}
 function completeEntry(answers){const value=index=>answers[index]?.source==='text'?answers[index].value:'';try{localStorage.setItem('yione-setup-complete','1');localStorage.setItem('yione-intake',JSON.stringify(answers));localStorage.setItem('yione-self-profile',JSON.stringify({name:value(3)||'新朋友',bio:value(0),need:value(1),offer:value(2)}))}catch{}navigate('N68',true,{},true,{fromSetup:true,entryAnswers:answers})}
 const entryStep=entryStepFromPath(location.split('?')[0]);
 const toolbarBackPlan=planToolbarBack(entry,entryStep);
 function toolbarBack(){if(toolbarBackPlan.mode==='history')history.back();else if(toolbarBackPlan.mode==='entry')navigateEntry(toolbarBackPlan.step,toolbarBackPlan.answers)}
 const page=config?.pages.find(p=>p.id===pageFromPath(location.split('?')[0]));
 const showGuide=page?.id==='N68'&&!debug&&!guideDismissed&&(!onboardingComplete||previewGuide);
 function finishGuide(){try{localStorage.setItem('yione-onboarding-complete','1')}catch{}setOnboardingComplete(true);setGuideDismissed(true)}
 const h5Ids=['N68','N46','N34','N35','N36','N53','N54'];
 const callIds=['N51','N52'];
 const groupIds=['N47','G01','G04'];
 const postIds=['N07','N15','N19'];
 const personaFlowIds=['G02','G03','G05'];
 const structureIds=['A01','N27','N28','N31','N32','N38','N56','N41','N50'];
 const sidebarIds=['N18','N01','N05','N12','S01','N02','N14','N17','N16','N22','N04','N06','N13','N08','N11','N09'];
 const Viewer=page?.id==='N57'?PostDetailPage:page?.id==='B01'?BubbleSettings:h5Ids.includes(page?.id)?H5Pages:callIds.includes(page?.id)?CallPages:groupIds.includes(page?.id)?GroupChatPages:postIds.includes(page?.id)?PostComposerPages:personaFlowIds.includes(page?.id)?PersonaFlowPages:structureIds.includes(page?.id)?StructurePages:sidebarIds.includes(page?.id)?SidebarSettingsPages:PrototypeViewer;
 function click(h){const action=resolveHotspot(h);if(!action){if(debug)setMessage(`目标待确认：${h.label}。${h.reason}`);return;}if(action.action==='local')return;if(h.historyMode==='return-to-workbench'){const plan=planReturnToWorkbench(history.state);if(plan.mode==='back')history.go(-plan.steps);else navigate(plan.page,false,{},true);return;}if(action.action==='back'){if(['N35','N36'].includes(page.id)){const steps=stepsBackTo(history.state,'N34');if(steps>0)history.go(-steps);else navigate('N34',true,{},true);}else if(history.state?.depth>0)history.back();else navigate(page.back?.fallback||config.startPage,true);}else navigate(action.target,false,h.context||{},h.historyMode==='replace');}
 function apply(c){validate(c);setConfig(c);setMessage('配置已应用，请导出保存。');}
 return <><div className="toolbar"><button type="button" onClick={toolbarBack} disabled={!config||toolbarBackPlan.mode==='none'}>返回上一步</button><button onClick={async()=>{try{await navigator.clipboard.writeText(window.location.href);setCopy(false);}catch{setCopy(true);}}}>复制当前URL</button>{copy&&<input aria-label="手动复制URL" readOnly value={window.location.href} onFocus={e=>e.target.select()}/>}</div>{error?<p role="alert">{error}</p>:!config?<p className="loading">加载原型…</p>:entryStep?<div className="layout"><PhoneShell ref={phoneScroll}><EntryFlow step={entryStep} onStep={navigateEntry} onComplete={completeEntry} initialAnswers={entry?.entryAnswers} registerDraft={registerDraft} onRegisterDraftChange={setRegisterDraft}/></PhoneShell></div>:!page?<p role="alert">页面不存在，请返回上一步。</p>:<div className={debug?'layout debugging':'layout'}><PhoneShell ref={phoneScroll} onScroll={recordScroll} shortcut={workbenchPageIds.has(page.id)?null:()=>navigate('N34')} overlay={showGuide?<FirstVisitGuide onComplete={finishGuide}/>:null}><Viewer key={page.id} page={page} entry={entry} debug={debug} onHotspot={click} onLoad={()=>{if(restore.current!==null){phoneScroll.current?.scrollTo(0,restore.current);restore.current=null;}}}/></PhoneShell>{debug&&<DebugWorkbench config={config} page={page} entry={entry} onApply={c=>{validate(c);apply(c);}} message={message}/>}</div>}</>;
}
createRoot(document.getElementById('root')).render(<App/>);
