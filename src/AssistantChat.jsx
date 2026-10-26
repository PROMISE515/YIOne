import React,{useEffect,useRef,useState} from 'react';
import {IOSStatusBar,MiniProgramCapsule,PersonaAvatar} from './PhoneChrome.jsx';
import {clearWorkbenchTask, parseWorkbenchTask, readCustomTasks, readWorkbenchTask, writeCustomTasks} from './scheduledTasks.js';
import './assistant-chat.css';

const storageKey='yione-assistant-chat';
const opening={role:'assistant',text:'你好，我是林舟的分身。可以帮你整理合作线索、查看待办，或一起梳理下一步。'};
function readMessages(){try{const value=JSON.parse(localStorage.getItem(storageKey)||'null');return Array.isArray(value)&&value.length?value:[opening]}catch{return [opening]}}
function replyTo(text){
 if(/任务|待办|提醒/.test(text))return '目前有 2 项正在进行的任务，其中 1 项需要你决定。你可以回到工作总览，打开「定时任务」查看。';
 if(/消息|聊天|对话|谁找/.test(text))return '消息中心整理了单聊和群聊的动态。你可以从工作总览进入消息中心查看具体对话。';
 if(/合作|线索|人物|找人/.test(text))return '今天整理出 4 条可继续跟进的合作线索。你想先看人物方向，还是梳理合作需求？';
 if(/你好|在吗/.test(text))return '我在。你想先聊合作线索、定时任务，还是今天需要你决定的事项？';
 return '我记下了。当前原型可以演示合作线索、定时任务和消息整理；你可以继续说说想处理哪一项。';
}
export default function AssistantChat({onClose,inline=false}){
 const [messages,setMessages]=useState(readMessages);
 const [stagedTask,setStagedTask]=useState(readWorkbenchTask);
 const [draft,setDraft]=useState(()=>readWorkbenchTask()?.text || '');
 const [taskError,setTaskError]=useState('');
 const end=useRef(null);
 const composerInput=useRef(null);
 useEffect(()=>{localStorage.setItem(storageKey,JSON.stringify(messages));const list=end.current?.parentElement;if(list)list.scrollTop=list.scrollHeight;},[messages]);
 useEffect(()=>{if(stagedTask)composerInput.current?.focus();},[stagedTask]);
 function send(event){event.preventDefault();const text=draft.trim();if(!text)return;let reply=replyTo(text);if(stagedTask){const parsed=parseWorkbenchTask(text);if(!parsed){setTaskError('请在对话框中填写任务名称和任务内容。');return;}const item={...parsed,id:globalThis.crypto?.randomUUID?.()||`task-${Date.now()}`};writeCustomTasks([...readCustomTasks(),item]);let enabled={};try{enabled=JSON.parse(localStorage.getItem('yione-task-enabled')||'{}')}catch{}localStorage.setItem('yione-task-enabled',JSON.stringify({...enabled,[item.id]:true}));reply=`已创建定时任务「${item.title}」。你可以在定时任务列表查看或调整。`;clearWorkbenchTask();setStagedTask(null);setTaskError('');}setMessages(current=>[...current,{role:'user',text},{role:'assistant',text:reply}]);setDraft('');}
 return <section className={inline?'assistant-chat-inline':'assistant-chat-page'} aria-label="和助手聊">{!inline&&<><IOSStatusBar/><header className="assistant-chat-header"><button type="button" onClick={onClose} aria-label="返回工作总览"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 4-8 8 8 8"/></svg></button><strong>{stagedTask?'新建定时任务':'和助手聊'}</strong><MiniProgramCapsule/></header><div className="assistant-chat-identity"><PersonaAvatar size={38}/><div><strong>林舟</strong><small>分身助手</small></div></div></>}{stagedTask&&<div className="assistant-task-handoff"><strong>创建任务</strong>{taskError&&<span role="alert">{taskError}</span>}</div>}<main className="assistant-chat-messages">{messages.filter((message,index)=>!inline||index!==0||message.text!==opening.text).map((message,index)=><div key={index} className={`assistant-chat-message ${message.role}`}><span>{message.role==='assistant'?'林舟':'我'}</span><p>{message.text}</p></div>)}<div ref={end}/></main><form className={`assistant-chat-compose ${stagedTask?'task-draft':''}`} onSubmit={send}>{stagedTask?<textarea ref={composerInput} aria-label="工作台任务输入框" value={draft} onChange={event=>{setDraft(event.target.value);setTaskError('')}}/>:<input ref={composerInput} aria-label="输入给助手的消息" placeholder="输入消息…" value={draft} onChange={event=>setDraft(event.target.value)}/>}<button type="submit" disabled={!draft.trim()} aria-label="发送消息">发送</button></form></section>;
}
