import React, {useEffect, useLayoutEffect, useState} from 'react';
import {IOSStatusBar, MiniProgramCapsule, MoreDotsIcon, PersonaAvatar} from './PhoneChrome.jsx';
import './cooperation-sheet.css';
import {readDemoPost} from './PostComposerPages.jsx';
import {certificationText, personas} from './personas.js';
import {readDemoTask} from './taskState.js';
import {formatTaskSchedule, readCustomTasks, readTaskSchedules, stageWorkbenchTask, WEEKDAYS, writeCustomTasks, writeTaskSchedules} from './scheduledTasks.js';
import {readFriendLinks, readFriendVisibility, writeFriendLinks} from './friendLinks.js';
import './persona-flow.css';
import {readBubbles} from './BubbleSettings.jsx';
import ShareIcon from './ShareIcon.jsx';
import PersonaShareCard from './PersonaShareCard.jsx';
import ReplyMedia, {saveReplyMedia} from './ReplyMedia.jsx';
import FaqKnowledgePages from './FaqKnowledgePages.jsx';
import {matchFaq, readFaqItems, saveFaqItem} from './faqStore.js';
import './task-enhancements.css';

function I({name, size=24}) {
  const svg = {
    back:<path d="m15 4-8 8 8 8"/>, right:<path d="m9 4 8 8-8 8"/>,
    search:<><circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/></>,
    plus:<path d="M12 3v18M3 12h18"/>, send:<><path d="m2 11 20-9-9 20-3-9Z"/><path d="m10 13 12-11"/></>,
    file:<><rect x="7" y="3" width="11" height="15" rx="2"/><path d="M7 7H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1"/></>,
    people:<><circle cx="9" cy="7" r="4"/><path d="M2 21v-3a7 7 0 0 1 14 0v3ZM16 4a4 4 0 0 1 0 8m2 2a6 6 0 0 1 4 6"/></>,
    check:<><rect x="4" y="2" width="16" height="20" rx="3"/><path d="m8 10 3 3 5-6M8 18h8"/></>,
    mic:<><rect x="8" y="2" width="8" height="14" rx="4"/><path d="M4 12v2a8 8 0 0 0 16 0v-2M12 22v-4M8 22h8"/></>,
    settings:<><path d="m9 2-1 4-4-1-2 5 3 2-3 3 2 5 4-1 1 4h6l1-4 4 1 2-5-3-3 3-2-2-5-4 1-1-4Z"/><circle cx="12" cy="12" r="3"/></>,
    calendar:<><rect x="3" y="5" width="18" height="17" rx="3"/><path d="M7 2v6m10-6v6M3 11h18m-9 3v4l3 1"/></>,
    up:<path d="m6 15 6-6 6 6"/>, down:<path d="m6 9 6 6 6-6"/>, phone:<path d="M5 3 2 6c0 8 8 16 16 16l3-3-5-5-3 3-6-6 3-3Z"/>, tick:<path d="m6 12 4 4 8-9"/>,
    bell:<><path d="M4 18h16l-2-4V9a6 6 0 0 0-12 0v5ZM9 21h6"/></>, edit:<><path d="m4 20 4-1 11-11-3-3L5 16Z"/><path d="m14 7 3 3"/></>
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{svg[name] || <circle cx="12" cy="12" r="8"/>}</svg>;
}

export default function StructurePages({page, entry, debug, onHotspot, onLoad}) {
  const [report, setReport] = useState('');
  const [panel, setPanel] = useState(null);
  const [questions, setQuestions] = useState(readFaqItems);
  const [debugDraft,setDebugDraft]=useState('');
  const [debugMessages,setDebugMessages]=useState(()=>{const saved=matchFaq(questions,'你能提供哪些帮助？');return [{role:'visitor',text:'你能提供哪些帮助？'},{role:saved?'assistant':'exception',text:saved?.a??'问答库未覆盖，正在呼叫本人。',attachments:saved?.attachments||[],attempts:saved?0:1}];});
  useEffect(()=>{if(page.id!=='N38')return;const current=readFaqItems();const answer=matchFaq(current,'你能提供哪些帮助？');setQuestions(current);setDebugMessages([{role:'visitor',text:'你能提供哪些帮助？'},{role:answer?'assistant':'exception',text:answer?.a??'问答库未覆盖，正在呼叫本人。',attachments:answer?.attachments||[],attempts:answer?0:1}]);},[page.id]);
  const [debugExpanded,setDebugExpanded]=useState(true);
  const [debugEditingIndex,setDebugEditingIndex]=useState(null);
  const [debugEditText,setDebugEditText]=useState('');
  const [debugEditAttachments,setDebugEditAttachments]=useState([]);
  const [debugEditError,setDebugEditError]=useState('');
  const [debugNotice,setDebugNotice]=useState('');
  const [debugCommandsOpen,setDebugCommandsOpen]=useState(false);
  const [debugShareOpen,setDebugShareOpen]=useState(false);
  const [debugWechatOpen,setDebugWechatOpen]=useState(false);
  const [personaBio,setPersonaBio]=useState(()=>localStorage.getItem('yione-persona-bio')||'产品研究与创业交流助手');
  const [demoPost] = useState(readDemoPost);
  const [taskDescription,setTaskDescription]=useState(()=>localStorage.getItem('yione-task-description')||'每天整理新增合作线索，归纳人物的供需方向，并把需要本人判断的事项单独列出。');
  const [descriptionDraft,setDescriptionDraft]=useState(taskDescription);
  const [editingDescription,setEditingDescription]=useState(false);
  const [demoTask] = useState(readDemoTask);
  const [feedMenu, setFeedMenu] = useState(null);
  const [feedAction, setFeedAction] = useState('');
  const [postDetail,setPostDetail]=useState(null);
  const [commentDraft,setCommentDraft]=useState('');
  const [comments,setComments]=useState(()=>{try{return JSON.parse(localStorage.getItem('yione-post-comments')||'{}')}catch{return {}}});
  const [replyTo,setReplyTo]=useState(null);
  const [likes,setLikes]=useState(()=>{try{return JSON.parse(localStorage.getItem('yione-post-likes')||'{}')}catch{return {}}});
  useEffect(()=>{localStorage.setItem('yione-post-likes',JSON.stringify(likes))},[likes]);
  const [taskEnabled,setTaskEnabled]=useState(()=>{try{return {...{'task-1':true,'task-2':true,'task-3':false},...JSON.parse(localStorage.getItem('yione-task-enabled')||'{}')}}catch{return {'task-1':true,'task-2':true,'task-3':false}}});
  const [taskSchedules,setTaskSchedules]=useState(readTaskSchedules);
  const [scheduleDraft,setScheduleDraft]=useState(taskSchedules['task-2']);
  const [editingSchedule,setEditingSchedule]=useState(false);
  const [customTasks,setCustomTasks]=useState(readCustomTasks);
  const [taskCreateOpen,setTaskCreateOpen]=useState(false);
  const [newTask,setNewTask]=useState({title:'',description:'',repeat:'daily',weekday:'五',time:'09:00'});
  const toggleTask=id=>setTaskEnabled(current=>{const next={...current,[id]:!current[id]};localStorage.setItem('yione-task-enabled',JSON.stringify(next));return next;});
  const h = id => page.hotspots.find(item => item.id === id);
  const go = id => { const item = h(id); if (item) onHotspot(item); };
  const B = ({id, children, className='', type='button', onClick, context, ...props}) => {
    const item = h(id);
    return <button {...props} type={type} aria-label={item?.label || id} className={`${className} ${debug ? `inspect ${item?.status || 'pending'}` : ''}`} title={debug ? `${item?.status || 'pending'} → ${item?.target || (item?.action === 'local' ? '页面内交互' : '目标待确认')}` : undefined} onClick={event => onClick ? onClick(item,event) : item && onHotspot(context ? {...item, context} : item)}>{children}</button>;
  };
  useLayoutEffect(() => { onLoad?.(); }, [page.id]);
  const Header = ({title}) => <><IOSStatusBar/><header className="structure-header"><B id="back"><I name="back" size={25}/></B><strong>{title}</strong><MiniProgramCapsule/></header></>;
  const Underlay = () => <div className="sheet-underlay" aria-hidden="true"><IOSStatusBar/><header className="sheet-underlay-header"><I name="people"/><b>YIOne</b><span>分身广场</span><MiniProgramCapsule/></header><div className="sheet-underlay-card"><i/><strong>YIOne</strong><span>友联</span></div></div>;
  const TaskCard = ({id, title, meta, body, enabled}) => <B id={id} className="structure-card task-list-card"><div><h2>{title}</h2><p className="muted">{meta}</p><p>{body}</p></div><div className="task-state"><I name="right"/><span>{enabled ? '已开启' : '已关闭'}</span><i className={`switch ${enabled ? 'on' : ''}`}/></div></B>;
  if (page.id === 'N27') {
    const defaults=[['task-1','精灵巡逻','浏览新增人物，整理值得继续关注的供需线索。'],['task-2','合作线索整理','汇总当天交流，并标出需要本人决定的事项。'],['task-3','每周进展回顾','整理本周任务结果和下一步计划。']];
    const saveNewTask=()=>{
      if(!newTask.title.trim()||!newTask.description.trim())return;
      const item={...newTask,title:newTask.title.trim(),description:newTask.description.trim()};
      setCustomTasks(current=>writeCustomTasks(current.map(task=>task.id===item.id?item:task)));
      setTaskCreateOpen(false);
    };
    const startNewTask=()=>{
      stageWorkbenchTask();
      onHotspot({id:'new-task-workbench',label:'前往工作台创建任务',action:'navigate',target:'N34',status:'confirmed',historyMode:'return-to-workbench'});
    };
    return <section className="h5-page structure-page task-list-shell"><Header title="定时任务"/><main className="timed-task-page">{defaults.map(([id,title,body])=><article key={id} className="timed-task-card"><B id={id} className="timed-task-open"><h2>{title}</h2><p className="muted">{formatTaskSchedule(taskSchedules[id])} · 林舟</p><p>{body}</p></B><B id={id} className="timed-task-detail" aria-label={`查看${title}`}><I name="right"/></B><button type="button" className={`task-switch-button switch ${taskEnabled[id]?'on':''}`} role="switch" aria-label={`${title}${taskEnabled[id]?'已开启':'已关闭'}`} aria-checked={!!taskEnabled[id]} onClick={()=>toggleTask(id)}/></article>)}{customTasks.map(task=><article key={task.id} className="timed-task-card"><button type="button" className="timed-task-open" onClick={()=>{setNewTask(task);setTaskCreateOpen(true)}}><h2>{task.title}</h2><p className="muted">{formatTaskSchedule(task)} · 林舟</p><p>{task.description}</p></button><button type="button" className="timed-task-detail" aria-label={`编辑${task.title}`} onClick={()=>{setNewTask(task);setTaskCreateOpen(true)}}><I name="right"/></button><button type="button" className={`task-switch-button switch ${taskEnabled[task.id]?'on':''}`} role="switch" aria-label={`${task.title}${taskEnabled[task.id]?'已开启':'已关闭'}`} aria-checked={!!taskEnabled[task.id]} onClick={()=>toggleTask(task.id)}/></article>)}</main><div className="task-list-footer"><button type="button" onClick={startNewTask}>新增任务</button></div>{taskCreateOpen&&<div className="local-panel"><div className="local-panel-card task-create-panel"><button type="button" aria-label="关闭" onClick={()=>setTaskCreateOpen(false)}>×</button><h2>编辑任务</h2><label>任务名称<input value={newTask.title} onChange={event=>setNewTask({...newTask,title:event.target.value})} placeholder="例如：约咖啡"/></label><label>任务描述<textarea value={newTask.description} onChange={event=>setNewTask({...newTask,description:event.target.value})} placeholder="写下分身要完成的事"/></label><div className="task-time-fields"><label>重复<select value={newTask.repeat} onChange={event=>setNewTask({...newTask,repeat:event.target.value})}><option value="daily">每天</option><option value="weekly">每周</option></select></label>{newTask.repeat==='weekly'&&<label>星期<select value={newTask.weekday} onChange={event=>setNewTask({...newTask,weekday:event.target.value})}>{WEEKDAYS.map(day=><option key={day} value={day}>周{day}</option>)}</select></label>}<label>执行时间<input type="time" value={newTask.time} onChange={event=>setNewTask({...newTask,time:event.target.value})}/></label></div><button type="button" className="local-primary" disabled={!newTask.title.trim()||!newTask.description.trim()} onClick={saveNewTask}>保存任务</button></div></div>}</section>;
  }
  if (page.id === 'N28') return <section className="h5-page structure-page"><Header title="任务详情"/><main className="task-detail-v2"><section><div className="task-description-heading"><h1>任务描述</h1>{!editingDescription&&<B id="edit" onClick={()=>{setDescriptionDraft(taskDescription);setEditingDescription(true)}}>编辑</B>}</div>{editingDescription?<div className="task-description-editor"><textarea aria-label="任务描述" value={descriptionDraft} onChange={e=>setDescriptionDraft(e.target.value)}/><div><button type="button" onClick={()=>setEditingDescription(false)}>取消</button><button type="button" disabled={!descriptionDraft.trim()} onClick={()=>{const value=descriptionDraft.trim();setTaskDescription(value);localStorage.setItem('yione-task-description',value);setEditingDescription(false)}}>保存</button></div></div>:<B id="edit" className="task-description-display" onClick={()=>{setDescriptionDraft(taskDescription);setEditingDescription(true)}}>{taskDescription}</B>}</section><section className="task-schedule-section"><div className="task-description-heading"><h1>执行时间</h1>{!editingSchedule&&<button type="button" onClick={()=>{setScheduleDraft(taskSchedules['task-2']);setEditingSchedule(true)}}>调整</button>}</div>{editingSchedule?<div className="task-schedule-editor"><div className="task-time-fields"><label>重复<select value={scheduleDraft.repeat} onChange={event=>setScheduleDraft({...scheduleDraft,repeat:event.target.value})}><option value="daily">每天</option><option value="weekly">每周</option></select></label>{scheduleDraft.repeat==='weekly'&&<label>星期<select value={scheduleDraft.weekday||'五'} onChange={event=>setScheduleDraft({...scheduleDraft,weekday:event.target.value})}>{WEEKDAYS.map(day=><option key={day} value={day}>周{day}</option>)}</select></label>}<label>时间<input type="time" value={scheduleDraft.time} onChange={event=>setScheduleDraft({...scheduleDraft,time:event.target.value})}/></label></div><div className="task-schedule-actions"><button type="button" onClick={()=>setEditingSchedule(false)}>取消</button><button type="button" onClick={()=>{setTaskSchedules(current=>writeTaskSchedules({...current,'task-2':scheduleDraft}));setEditingSchedule(false)}}>保存时间</button></div></div>:<button type="button" className="task-schedule-display" onClick={()=>{setScheduleDraft(taskSchedules['task-2']);setEditingSchedule(true)}}><span>重复执行</span><strong>{formatTaskSchedule(taskSchedules['task-2'])}</strong><I name="right" size={18}/></button>}</section><section><h1>历史结果</h1><B id="result" className="history-result"><strong>今天 09:00</strong><span>已整理 4 条线索</span><I name="right"/></B><B id="history" className="history-result"><strong>昨天 09:00</strong><span>已整理 3 条线索</span><I name="right"/></B></section></main></section>;
  if (page.id === 'A01') return <section className="h5-page structure-page assistant-manage-home"><Header title="分身管理"/><main><section className="assistant-persona"><PersonaAvatar size={64}/><div><h1>林舟</h1><p>{personaBio}</p></div></section><p className="assistant-persona-copy">分身会根据问答库和知识库理解你，并在交流中协助整理人物、需求与合作线索。</p><B id="edit" className="assistant-edit" onClick={()=>setPanel("persona")}><I name="edit"/>编辑分身资料</B><div className="assistant-library-cards"><B id="qa"><strong>问答库</strong><small>更新于今天</small></B><B id="knowledge"><strong>知识库</strong><small>更新于昨天</small></B></div><B id="debug" className="assistant-debug">调试分身</B></main>{panel==="persona"&&<div className="local-panel"><div className="local-panel-card"><button onClick={()=>setPanel(null)} aria-label="关闭">×</button><h2>编辑分身资料</h2><label>简介<textarea value={personaBio} onChange={e=>{setPersonaBio(e.target.value);localStorage.setItem('yione-persona-bio',e.target.value)}}/></label><button className="local-primary" onClick={()=>setPanel(null)}>保存资料</button></div></div>}</section>;
  if (page.id === 'N31' || page.id === 'N32') return <FaqKnowledgePages page={page} B={B} Header={Header}/>;
  if (page.id === 'N38') {
    let savedProfile={};
    try { savedProfile=JSON.parse(localStorage.getItem('yione-self-profile')||'{}')||{}; } catch { savedProfile={}; }
    const person={...personas.lin,name:savedProfile.name?.trim()||personas.lin.name,offer:savedProfile.offer?.split('\n').map(item=>item.trim()).filter(Boolean)||personas.lin.offer,need:savedProfile.need?.split('\n').map(item=>item.trim()).filter(Boolean)||personas.lin.need};
    const inviteEnabled=localStorage.getItem('yione-bubble-invite')!=='false';
    const friendLinksVisible=readFriendVisibility();
    const qrAccess=localStorage.getItem('yione-qr-access')||'all';
    const qrPrice=localStorage.getItem('yione-qr-price')||'';
    const ownBubbles=[...(inviteEnabled?[{name:'建联邀约',content:'你好，想认识你，方便聊聊吗？',access:'free',type:'message'}]:[]),...readBubbles().filter(item=>item.enabled)];
    const shownBubbles=ownBubbles.length>3?ownBubbles.slice(0,2):ownBubbles;
    const selectBubble=bubble=>{
      if(bubble.access==='free'&&bubble.type==='message'){setDebugDraft(bubble.content);return;}
      setDebugNotice(bubble.access==='paid'?`${bubble.name}：访客需付费解锁`:bubble.access==='form'?`${bubble.name}：访客需先填写表单`:bubble.content);
    };
    const sendDebug=()=>{
      const text=debugDraft.trim();if(!text)return;
      const match=matchFaq(readFaqItems(),text);
      const answer=match?.a || (match?.attachments?.length?'附件回复':'问答库未覆盖，正在呼叫本人。');
      setDebugMessages(current=>[...current,{role:'visitor',text},{role:match?'assistant':'exception',text:answer,attachments:match?.attachments||[],attempts:match?0:1}]);setDebugDraft('');setDebugNotice('');
    };
    const openDebugEditor=index=>{
      const message=debugMessages[index];
      setDebugEditingIndex(index);setDebugEditText(message.text);setDebugEditAttachments(message.attachments||[]);setDebugEditError('');setDebugNotice('');
    };
    const addDebugAttachments=files=>{
      const incoming=Array.from(files||[]);
      if(incoming.some(file=>file.size>100*1024*1024)){setDebugEditError('单个附件不能超过 100 MB。');return;}
      setDebugEditError('');
      setDebugEditAttachments(current=>[...current,...incoming.map(file=>({id:crypto.randomUUID(),name:file.name,type:file.type,size:file.size,file}))]);
    };
    const saveDebugReply=async()=>{
      const answer=debugEditText.trim();if((!answer&&!debugEditAttachments.length)||debugEditingIndex===null)return;
      const question=[...debugMessages.slice(0,debugEditingIndex)].reverse().find(message=>message.role==='visitor')?.text;
      if(!question)return;
      try {
        const attachments=await Promise.all(debugEditAttachments.map(item=>item.file?saveReplyMedia(item.file):item));
        const nextMessages=debugMessages.map((message,index)=>index===debugEditingIndex?{...message,role:'assistant',text:answer,attachments}:message);
        const nextQuestions=saveFaqItem(readFaqItems(),{q:question,a:answer,attachments,source:'调试修改',scene:'开场白',topic:'调试补充'});
        setQuestions(nextQuestions);setDebugMessages(nextMessages);setDebugEditingIndex(null);setDebugEditAttachments([]);setDebugNotice('回答和附件已保存到问答库');
      } catch { setDebugEditError('保存附件失败，请重试或选择更小的文件。'); }
    };
    return <section className="h5-page standard-conversation-page debug-dialog-page">
      <IOSStatusBar/>
      <header className="compact-chat-header">
        <B id="back" className="compact-back" aria-label="退出调试"><I name="back" size={27}/></B>
        <div className="need-summary">
          <span className="summary-avatar"><PersonaAvatar size={36}/></span>
          <span className="need-state">供 <i><I name="tick" size={19}/></i></span>
          <button type="button" className="summary-toggle" aria-expanded={debugExpanded} onClick={()=>setDebugExpanded(value=>!value)}><I name={debugExpanded?'up':'down'} size={21}/>{debugExpanded?'收起':'展开'}</button>
          <span className="need-state">需 <i><I name="tick" size={19}/></i></span>
        </div>
        <MiniProgramCapsule/>
      </header>
      <main className="standard-conversation-main" role="log" aria-live="polite">
        {debugExpanded&&<section className="official-card person-conversation-card">
          <div className="identity-row">
            <span className="conversation-profile-avatar"><PersonaAvatar size={54}/></span>
            <div><h1>{person.name}</h1><span className="conversation-person-meta">{certificationText(person)}</span></div>
            {friendLinksVisible&&<span className="cooperation"><I name="people"/>友联<I name="right" size={16}/></span>}
          </div>
          <div className="supply"><div><small>我能提供</small><p>{person.offer.map(line=><React.Fragment key={line}>{line}<br/></React.Fragment>)}</p></div><div><small>我在寻找</small><p>{person.need.map(line=><React.Fragment key={line}>{line}<br/></React.Fragment>)}</p></div></div>
          <div className="person-actions"><span className="follow">关注</span><button type="button" className="wechat" onClick={()=>setDebugWechatOpen(true)}>微信</button><button type="button" className="share" aria-label="分享名片" onClick={()=>setDebugShareOpen(true)}><ShareIcon size={27}/></button><span className="circle-more"><MoreDotsIcon size={18}/></span></div>
        </section>}
        <div className="standard-chat-messages">
          <div className="standard-chat-time">今天 · 调试预览 · 仅自己可见</div>
          <p className="debug-chat-guidance">点击分身回复可修改，保存后同步到问答库</p>
          {debugMessages.map((message,index)=>message.role==='visitor'
            ? <div className="standard-chat-outgoing" key={index}>{message.text}</div>
            : message.role==='exception' ? <div className="debug-exception" key={index}><small>问答库未命中 · 模拟短信通知本人</small><p>{message.text}</p><button type="button" onClick={()=>setDebugMessages(current=>current.map((item,i)=>i===index?{...item,attempts:(item.attempts||1)+1,text:(item.attempts||1)>=2?'多次呼叫暂未接通，请稍后再试或留下消息。':'已再次呼叫本人，请稍候。'}:item))}>再次呼叫</button><button type="button" onClick={()=>openDebugEditor(index)}>补充到问答库</button>{debugEditingIndex===index&&<div className="debug-reply-edit-bubble"><textarea aria-label="补充问答库回答" value={debugEditText} onChange={event=>setDebugEditText(event.target.value)}/><div className="debug-reply-edit-actions"><button type="button" onClick={()=>setDebugEditingIndex(null)}>取消</button><button type="button" onClick={saveDebugReply}>保存到问答库</button></div></div>}</div>
            : <div className="standard-chat-incoming debug-chat-answer" key={index}>
              <b>{person.name}</b>
              {debugEditingIndex===index?<div className="debug-reply-edit-bubble">
                <textarea aria-label="直接修改分身回复" value={debugEditText} onChange={event=>setDebugEditText(event.target.value)} placeholder="输入分身回复" autoFocus/>
                {debugEditAttachments.map((item,mediaIndex)=><div className="debug-edit-media" key={item.id}><ReplyMedia item={item} compact/><button type="button" aria-label={`移除${item.name}`} onClick={()=>setDebugEditAttachments(current=>current.filter((_,i)=>i!==mediaIndex))}>×</button></div>)}
                <label className="debug-media-add"><I name="plus" size={17}/>添加照片、文件或视频<input type="file" multiple hidden onChange={event=>{addDebugAttachments(event.target.files);event.target.value=''}}/></label>
                {debugEditError&&<small className="debug-edit-error" role="alert">{debugEditError}</small>}
                <div className="debug-reply-edit-actions"><button type="button" onClick={()=>setDebugEditingIndex(null)}>取消</button><button type="button" disabled={!debugEditText.trim()&&!debugEditAttachments.length} onClick={saveDebugReply}>保存到问答库</button></div>
              </div>:<div className="debug-reply-bubble"><button type="button" className="debug-reply-content" aria-label={`修改${person.name}的回复`} onClick={()=>openDebugEditor(index)}>{message.text||'附件回复'}</button>{message.attachments?.map(item=><ReplyMedia item={item} key={item.id} compact/>)}<button type="button" className="debug-reply-edit-trigger" onClick={()=>openDebugEditor(index)}><I name="edit" size={14}/> 修改</button></div>}
            </div>)}
          {debugNotice&&<div className="debug-save-notice" role="status">{debugNotice}</div>}
        </div>
      </main>
      <div className="standard-conversation-bottom debug-conversation-bottom">
        <div className="commands">{shownBubbles.map((bubble,index)=><button type="button" key={`${bubble.name}-${index}`} onClick={()=>selectBubble(bubble)}>{bubble.name}</button>)}{ownBubbles.length>3&&<button type="button" onClick={()=>setDebugCommandsOpen(true)}>更多指令</button>}</div>
        <div className="composer"><button type="button" aria-label="选择测试问题" onClick={()=>setDebugDraft('你能提供哪些帮助？')}><I name="plus" size={28}/></button><input value={debugDraft} onChange={event=>setDebugDraft(event.target.value)} onKeyDown={event=>{if(event.key==='Enter')sendDebug()}} placeholder="输入消息 · 按住说话" aria-label="输入调试消息"/><button type="button" className="phone" aria-label={debugDraft?'发送调试消息':'模拟呼叫'} onClick={debugDraft?sendDebug:()=>setDebugNotice('调试中仅模拟文字对话')}><I name={debugDraft?'send':'phone'}/></button></div>
      </div>
      {debugWechatOpen&&<div className="local-panel"><div className="local-panel-card debug-wechat-panel"><button type="button" onClick={()=>setDebugWechatOpen(false)} aria-label="关闭微信查看">×</button><h2>查看微信二维码</h2>{qrAccess==='paid'?<><p>支付后可查看微信二维码</p><strong>¥{qrPrice||'--'}</strong><button type="button" className="local-primary" onClick={()=>setDebugWechatOpen(false)}>返回调试</button></>:qrAccess==='mutual'?<><p>你设置了仅互关的人可见。当前模拟访客无法查看。</p><button type="button" className="local-primary" onClick={()=>setDebugWechatOpen(false)}>知道了</button></>:<><p>你设置了所有人可见。</p>{localStorage.getItem('yione-wechat-qr')?<img src={localStorage.getItem('yione-wechat-qr')} alt="你的微信二维码"/>:<p>你还没有上传微信二维码。</p>}<button type="button" className="local-primary" onClick={()=>setDebugWechatOpen(false)}>关闭</button></>}</div></div>}
      {debugCommandsOpen&&<div className="local-panel"><div className="local-panel-card"><button type="button" onClick={()=>setDebugCommandsOpen(false)} aria-label="关闭更多指令">×</button><h2>更多指令</h2>{ownBubbles.map((bubble,index)=><button type="button" key={`${bubble.name}-${index}`} onClick={()=>{selectBubble(bubble);setDebugCommandsOpen(false)}}>{bubble.name}</button>)}</div></div>}
      {debugShareOpen&&<PersonaShareCard person={person} onClose={()=>setDebugShareOpen(false)}/>}
    </section>;
  }
  if (page.id === 'N56') return <FriendLinksPage B={B} owner={entry?.context?.owner || 'yione'}/>;
  if (page.id === 'N41') return <section className="h5-page structure-page report-page"><Underlay/><div className="sheet-backdrop"/><main><i className="sheet-grip"/><B id="close" className="sheet-close">×</B><h1>举报</h1><p className="muted">请描述举报原因，帮助我们了解情况</p><textarea aria-label="举报原因" placeholder="请输入具体原因…" value={report} onChange={e=>setReport(e.target.value)}/><B id="submit" className="report-submit">提交举报</B></main></section>;
  if (page.id === 'N50') {const openPost=post=>{const item=h(post.id);if(item)onHotspot({...item,context:{post}})};const openFeedMenu=(id,event)=>{const shell=event.currentTarget.closest('.feed-shell').getBoundingClientRect();const phone=event.currentTarget.closest('.phone-scroll').getBoundingClientRect();const button=event.currentTarget.getBoundingClientRect();const top=button.bottom+176<=phone.bottom?button.bottom-shell.top+6:button.top-shell.top-168;setFeedMenu({id,top:Math.max(0,top)});setFeedAction('');};return <section className="h5-page structure-page feed-shell"><div className="feed-head"><IOSStatusBar/><header className="product-header"><B id="sidebar" className="persona-nav"><PersonaAvatar/></B><div className="top-tabs"><B id="home">YIOne</B><span className="current">分身广场</span></div><MiniProgramCapsule/></header></div><main className="feed-page"><div className="segment"><B id="persons">分身</B><span>广场</span></div><label className="feed-search"><I name="search"/><input placeholder="搜索动态" aria-label="搜索动态" onKeyDown={e=>{if(e.key==='Enter')go('search')}}/></label>{demoPost?.visibility==='所有人可见'&&<Feed B={B} name="林舟" job="AI 产品 · 早期验证" text={demoPost.text} tag={demoPost.topic} time={demoPost.publishedAt||'刚刚'} id="demo-post" demo image={demoPost.image} onMore={openFeedMenu} onOpen={openPost} likes={likes} setLikes={setLikes} comments={comments}/>}<Feed B={B} name="周岚" job="生物发酵 · 市场拓展" text="最近在梳理发酵食品的市场机会。\n想认识做菌种研发、产品转化的朋友，\n一起聊聊技术走向市场的实际难题。" tag="#生物发酵 #寻找合作" time="10 分钟前" id="post-zhou" onMore={openFeedMenu} onOpen={openPost} likes={likes} setLikes={setLikes} comments={comments}/><Feed B={B} name="陈序" job="合成生物 · 产品研发" text="这周完成了一轮发酵工艺的小试。\n从实验室到产品，还有很多细节要看。\n欢迎有食品应用经验的伙伴交流。" tag="#研发日常" time="38 分钟前" id="post-chen" onMore={openFeedMenu} onOpen={openPost} likes={likes} setLikes={setLikes} comments={comments}/><Feed B={B} name="许宁" job="食品原料 · 创业者" text="今天和两位品牌主理人聊了新原料。\n有真实的应用需求，合作才更具体。\n正在关注发酵来源的功能性原料。" tag="#创业记录 #食品原料" time="1 小时前" id="post-xu" onMore={openFeedMenu} onOpen={openPost} likes={likes} setLikes={setLikes} comments={comments}/><B id="publish" className="publish-button"><I name="plus"/>发动态</B></main><B id="avatar" className="avatar-entry plaza-avatar feed-avatar-entry"><I name="people"/></B>{feedMenu&&<div className="feed-action-layer"><button type="button" className="feed-action-dismiss" aria-label="关闭动态更多" onClick={()=>setFeedMenu(null)}/><div className="feed-action-menu" style={{top:feedMenu.top}} role="dialog" aria-label="动态更多"><B id="post-report">举报</B><B id="post-forward" onClick={()=>setFeedAction('forward')}>{feedAction==='forward'?'已选择转发':'转发'}</B><B id="post-squat" onClick={()=>setFeedAction(value=>value==='squat'?'':'squat')}>{feedAction==='squat'?'已蹲':'蹲一蹲'}</B></div></div>}</section>;}
  return null;
}

function Feed({B,name,job,text,tag,time,id,demo=false,onMore,onOpen,likes,setLikes,comments,image}) { const lines=text.split(/\\n|\n/);const person=demo?'lin':id.replace('post-','');return <article className={`feed-post ${demo?'demo-feed-post':''}`}><div className="feed-person"><B id={`${id}-avatar`} className="feed-avatar-button" context={{person}}><span className="letter-avatar">{name[0]}</span></B><div><h2>{name}</h2><p className="muted">{certificationText(personas[person])}</p></div><B id="more" className="feed-more" onClick={(item,event)=>onMore(id,event)}><MoreDotsIcon/></B></div><B id={id} className="post-text" onClick={()=>onOpen({id,name,job,text,tag,time,image})}>{lines.map((line,i)=><React.Fragment key={i}>{line}{i<lines.length-1&&<br/>}</React.Fragment>)}</B>{tag&&<p className="feed-tags">{tag}</p>}<div className="feed-time"><span className="muted">{time}</span></div><div className="feed-metrics"><button onClick={()=>setLikes(v=>({...v,[id]:!v[id]}))}>{likes[id]?"♥":"♡"} {likes[id]?13:12}</button><button onClick={()=>onOpen({id,name,job,text,tag,time,image})}>评论 {comments[id]?.reduce((total,item)=>total+1+(item.replies?.length||0),0)??(id==='post-zhou'?2:0)}</button><span>浏览 128</span></div></article>; }

function FriendLinksPage({B, owner}) {
  const editable = owner === 'lin';
  const [links, setLinks] = useState(() => readFriendLinks(owner));
  const [adding, setAdding] = useState(false);
  const [query, setQuery] = useState('');
  const ownerName = editable ? (() => { try { return JSON.parse(localStorage.getItem('yione-self-profile') || '{}').name || '林舟'; } catch { return '林舟'; } })() : personas[owner]?.name || 'YIOne';
  const people = Object.values(personas).filter(person => person.id !== owner && person.id !== 'lin');
  const visible = links.map(id => personas[id]).filter(Boolean);
  const available = people.filter(person => !links.includes(person.id) && person.name.includes(query.trim()));
  const update = next => setLinks(writeFriendLinks(owner, next));
  return <section className="h5-page structure-page cooperation-map-page"><IOSStatusBar/><header className="cooperation-map-header"><B id="back"><I name="back"/></B><strong>{ownerName}的友联</strong><MiniProgramCapsule/></header><main className="friend-links-page"><div className="friend-links-heading"><span>友联 · {visible.length} 位</span>{editable&&<button type="button" onClick={()=>setAdding(value=>!value)}>{adding?'完成':'+ 添加友联'}</button>}</div>{visible.length?<div className="friend-links-list">{visible.map(person=><div className="friend-link-row" key={person.id}><B id={`person-${person.id}`} context={{person:person.id,expanded:true}} className="friend-link-person"><span className="friend-link-avatar">{person.name[0]}</span><span className="friend-link-details"><strong>{person.name}</strong><small>{certificationText(person)}</small></span><I name="right" size={18}/></B>{editable&&<button type="button" className="friend-link-remove" aria-label={`移除${person.name}`} onClick={()=>update(links.filter(id=>id!==person.id))}>移除</button>}</div>)}</div>:<p className="friend-links-empty">还没有友联。{editable?'添加产品内用户后会显示在这里。':''}</p>}{editable&&adding&&<section className="friend-links-picker"><h2>添加产品内用户</h2><label><I name="search" size={18}/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="搜索用户" aria-label="搜索产品内用户"/></label>{available.length?available.map(person=><button type="button" key={person.id} onClick={()=>update([...links,person.id])}><span className="friend-link-avatar">{person.name[0]}</span><span><strong>{person.name}</strong><small>{certificationText(person)}</small></span><I name="plus" size={20}/></button>):<p>没有可添加的用户</p>}</section>}</main></section>;
}
