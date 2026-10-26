import React,{useState} from 'react';
import {IOSStatusBar,MiniProgramCapsule} from './PhoneChrome.jsx';
import './bubble-settings.css';

const key='yione-bubble-settings';
const inviteKey='yione-bubble-invite';
const defaultQuestions=['项目名称','合作需求','预期效果'];
const defaults=[{name:'了解合作',content:'我想了解你目前能提供哪些合作资源。',access:'free',type:'message',enabled:true}];
export const readBubbles=()=>{try{const value=JSON.parse(localStorage.getItem(key));return Array.isArray(value)?value:defaults}catch{return defaults}};
const blank={name:'',content:'',access:'free',type:'message',review:'manual',price:'29',formLabels:defaultQuestions};

export default function BubbleSettings({page,onHotspot}){
 const [bubbles,setBubbles]=useState(readBubbles);
 const [editing,setEditing]=useState(null);
 const [draft,setDraft]=useState(blank);
 const [invite,setInvite]=useState(()=>localStorage.getItem(inviteKey)!=='false');
 const [error,setError]=useState('');
 const back=page.hotspots.find(h=>h.id==='back');
 const update=patch=>{setDraft(current=>({...current,...patch}));setError('')};
 const openEditor=index=>{setEditing(index);setDraft(index<0?{...blank,formLabels:[...defaultQuestions]}:{...blank,...bubbles[index],formLabels:[...(bubbles[index].formLabels||defaultQuestions)]});setError('')};
 const save=()=>{
   if(!draft.name.trim()||!draft.content.trim()){setError('请填写气泡名称和内容。');return}
   if(draft.access==='form'&&draft.formLabels.some(label=>!label.trim())){setError('请填写全部表单问题。');return}
   if(draft.access==='paid'&&!(Number(draft.price)>0)){setError('请输入有效的解锁价格。');return}
   const bubble={...draft,name:draft.name.trim().slice(0,8),content:draft.content.trim(),type:draft.access==='free'?draft.type:'content',price:draft.access==='paid'?draft.price:'',enabled:true};
   const next=editing===-1?[...bubbles,bubble]:bubbles.map((item,index)=>index===editing?bubble:item);
   setBubbles(next);localStorage.setItem(key,JSON.stringify(next));setEditing(null)
 };
 const enabled=[...(invite?['建联邀约']:[]),...bubbles.filter(item=>item.enabled).map(item=>item.name)];
 const chips=enabled.length>3?[...enabled.slice(0,2),'更多指令']:enabled;
 const setQuestion=(index,value)=>update({formLabels:draft.formLabels.map((label,i)=>i===index?value:label)});
 return <section className="h5-page bubble-settings-page"><IOSStatusBar/><header><button type="button" onClick={()=>editing===null?onHotspot(back):setEditing(null)} aria-label="返回">‹</button><strong>{editing===null?'聊天气泡':editing===-1?'添加气泡':'编辑气泡'}</strong><MiniProgramCapsule/></header>
 {editing===null?<main className="bubble-settings-main"><h2>对方看到的气泡</h2><div className="bubble-preview" aria-label="对方与林舟对话时看到的气泡预览"><div className="bubble-preview-header"><span className="bubble-preview-back">‹</span><span className="bubble-preview-person"><b>林舟</b><small>对方的聊天页面</small></span><span className="bubble-preview-more">···</span></div><div className="bubble-preview-chat"><small>今天 09:41</small><div className="bubble-preview-incoming"><span className="bubble-preview-avatar">林</span><p>我正在做一款 AI 产品，想认识能一起验证产品的伙伴。</p></div><div className="bubble-preview-outgoing"><p>你好，想了解怎么合作。</p></div></div><div className="bubble-preview-bottom"><div className="bubble-preview-chips">{chips.map((label,index)=><span key={`${label}-${index}`}>{label}</span>)}</div><div className="bubble-preview-composer"><b>＋</b><span>输入消息 · 按住说话</span><span className="bubble-preview-call" aria-hidden="true"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 3 2 6c0 8 8 16 16 16l3-3-5-5-3 3-6-6 3-3Z"/></svg></span></div></div></div><p className="bubble-rule">气泡显示在对话输入框上方。最多展示三个入口。</p><button type="button" className="bubble-row bubble-switch-row" role="switch" aria-checked={invite} aria-label="显示建联邀约" onClick={()=>setInvite(value=>{localStorage.setItem(inviteKey,String(!value));return !value})}>建联邀约 <span className={`bubble-toggle ${invite?'on':''}`} aria-hidden="true"><i/></span></button><h2>自定义气泡</h2>{bubbles.map((item,index)=><button type="button" className="bubble-row" key={index} onClick={()=>openEditor(index)}>{item.name}<small>{item.access==='form'?'填表开放':item.access==='paid'?'付费内容':'免费开放'}　编辑</small></button>)}</main>:<main className="bubble-editor-main"><label>气泡名称<input maxLength={8} value={draft.name} onChange={event=>update({name:event.target.value})} placeholder="最多 8 个字"/></label><div className="bubble-field"><span>使用条件</span><div className="bubble-options" role="group" aria-label="使用条件">{[['free','免费开放'],['form','先填表'],['paid','付费解锁']].map(([value,label])=><button type="button" key={value} className={draft.access===value?'selected':''} onClick={()=>update({access:value,type:value==='free'?draft.type:'content'})}>{label}</button>)}</div></div>{draft.access==='free'&&<div className="bubble-field"><span>点击后</span><div className="bubble-options" role="group" aria-label="点击后">{[['message','填入快捷消息'],['content','查看内容']].map(([value,label])=><button type="button" key={value} className={draft.type===value?'selected':''} onClick={()=>update({type:value})}>{label}</button>)}</div></div>}<label>{draft.access==='free'&&draft.type==='message'?'快捷消息内容':'开放内容'}<textarea value={draft.content} onChange={event=>update({content:event.target.value})} placeholder={draft.access==='free'&&draft.type==='message'?'点击后填入访客输入框，由访客发送':'写下访客可以查看的内容'}/></label>{draft.access==='form'&&<section className="bubble-conditional"><h2>收集表单</h2><p>访客填写以下问题后申请查看内容。</p>{draft.formLabels.map((label,index)=><label key={index}>问题 {index+1}<input value={label} onChange={event=>setQuestion(index,event.target.value)}/></label>)}<h2>开放方式</h2><div className="bubble-options" role="group" aria-label="开放方式"><button type="button" className={draft.review==='auto'?'selected':''} onClick={()=>update({review:'auto'})}>提交后自动开放</button><button type="button" className={draft.review==='manual'?'selected':''} onClick={()=>update({review:'manual'})}>本人审核后开放</button></div></section>}{draft.access==='paid'&&<label className="bubble-price-label">解锁价格<div className="bubble-price"><b>¥</b><input type="number" min="0.01" step="0.01" value={draft.price} onChange={event=>update({price:event.target.value})} aria-label="解锁价格"/></div><small>购买后可再次查看。平台按设定比例抽佣。</small></label>}{draft.access!=='free'&&<p className="bubble-service-note">审核与支付将在接入服务端后对访客开放。</p>}{error&&<p className="bubble-error" role="alert">{error}</p>}</main>}
 <footer><button type="button" onClick={editing===null?()=>openEditor(-1):save}>{editing===null?'添加气泡':'保存气泡'}</button></footer></section>;
}
