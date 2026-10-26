import React, {useLayoutEffect, useRef, useState} from 'react';
import {IOSStatusBar, MiniProgramCapsule} from './PhoneChrome.jsx';
import './post-composer.css';

const DRAFT_KEY='yione-demo-post-draft';
const POST_KEY='yione-demo-post';
const initialDraft={text:'正在做 AI 产品的早期验证，想认识懂用户增长和 AI 应用的朋友，一起聊聊。',visibility:'所有人可见',topic:'#寻找建议',image:'sample'};
const loadDraft=()=>{try{const draft={...initialDraft,...JSON.parse(sessionStorage.getItem(DRAFT_KEY)||'{}')};return {...draft,image:draft.image===true?'sample':typeof draft.image==='string'?draft.image:null}}catch{return initialDraft}};

function Icon({name,size=24}){const paths={back:<path d="m15 4-8 8 8 8"/>,down:<path d="m6 9 6 6 6-6"/>,up:<path d="m6 15 6-6 6 6"/>,plus:<path d="M12 3v18M3 12h18"/>,check:<path d="m5 12 4 4L19 6"/>};return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>}

export default function PostComposerPages({page,debug,onHotspot,onLoad}){
 const h=id=>page.hotspots.find(item=>item.id===id);
 const [draft,setDraftState]=useState(loadDraft);
 const imageInput=useRef(null);
 const [imageError,setImageError]=useState('');
 const saveDraft=next=>{setDraftState(next);try{sessionStorage.setItem(DRAFT_KEY,JSON.stringify(next))}catch{setImageError('图片过大，请选择较小的照片')}};
 const Button=({id,children,className='',onClick,disabled=false})=>{const item=h(id);return <button type="button" disabled={disabled} aria-label={item?.label||id} className={`${className} ${debug?`inspect ${item?.status||'pending'}`:''}`} title={debug?`${item?.status||'pending'} → ${item?.target||(item?.action==='back'?'来源页':item?.action==='local'?'页面内交互':'目标待确认')}`:undefined} onClick={()=>onClick?onClick(item):item&&onHotspot(item)}>{children}</button>};
 useLayoutEffect(()=>onLoad?.(),[page.id]);
 const update=patch=>saveDraft({...draft,...patch});
 const selectImage=event=>{const file=event.target.files?.[0];if(!file)return;if(!file.type.startsWith('image/')){setImageError('请选择图片文件');return}if(file.size>10*1024*1024){setImageError('请选择小于 10 MB 的照片');return}const reader=new FileReader();reader.onload=()=>{const image=new Image();image.onload=()=>{const ratio=Math.min(1,1200/Math.max(image.width,image.height));const canvas=document.createElement('canvas');canvas.width=Math.round(image.width*ratio);canvas.height=Math.round(image.height*ratio);canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);update({image:canvas.toDataURL('image/jpeg',.78)});setImageError('')};image.src=reader.result};reader.readAsDataURL(file);event.target.value=''};
 const choose=(value,item)=>{update({visibility:value});onHotspot(item)};
 const publish=item=>{if(!draft.text.trim())return;const post={...draft,text:draft.text.trim(),publishedAt:'刚刚'};sessionStorage.setItem(POST_KEY,JSON.stringify(post));sessionStorage.removeItem(DRAFT_KEY);onHotspot(item)};
 const Editor=()=> <><IOSStatusBar/><header className="post-editor-header"><Button id="back"><Icon name="back" size={25}/></Button><strong>发布动态</strong><MiniProgramCapsule/></header><main className="post-editor-main"><p className="post-editor-hint">分享想法、进展或正在寻找的合作</p><textarea aria-label="动态正文" value={draft.text} onChange={event=>update({text:event.target.value})} placeholder="写下你想分享的内容…"/><Button id="visibility" className="post-visibility">{draft.visibility}<Icon name={page.id==='N19'?'up':'down'} size={18}/></Button><div className="post-tools"><Button id="topic" className={draft.topic?'active':''} onClick={()=>update({topic:draft.topic?'':'#寻找建议'})}>{draft.topic||<><Icon name="plus" size={19}/>添加话题</>}</Button></div><div className="post-images"><input ref={imageInput} type="file" accept="image/*" aria-label="选择动态图片" hidden onChange={selectImage}/>{draft.image?<figure>{draft.image==='sample'?<svg viewBox="55 1540 430 470" role="img" aria-label="示例动态图片"><image href={`${import.meta.env.BASE_URL}prototype/N07-发布动态.png`} width="1206" height="2622"/></svg>:<img src={draft.image} alt="已选择的动态图片"/>}<Button id="remove-image" onClick={()=>update({image:null})}>×</Button></figure>:null}<Button id="add-image" className="add-post-image" onClick={()=>imageInput.current?.click()}><Icon name="plus" size={32}/><span>{draft.image?"更换图片":"添加图片"}</span></Button></div>{imageError&&<p className="post-image-error" role="alert">{imageError}</p>}</main><footer className="post-editor-footer"><Button id="publish" disabled={!draft.text.trim()} onClick={publish}>发布</Button></footer></>;
 if(page.id==='N07')return <section className="h5-page post-editor-page"><Editor/></section>;
 if(page.id==='N19')return <section className="h5-page post-editor-page visibility-state"><Editor/><div className="visibility-menu" role="dialog" aria-label="动态可见范围">{['仅自己可见','所有人可见','关注人可见'].map(value=><Button key={value} id={value==='仅自己可见'?'only-me':value==='所有人可见'?'everyone':'followers'} onClick={item=>choose(value,item)}><span>{value}</span>{draft.visibility===value&&<Icon name="check"/>}</Button>)}</div></section>;
 const finish=(item,keep)=>{if(!keep)sessionStorage.removeItem(DRAFT_KEY);onHotspot(item)};
 return <section className="h5-page post-editor-page leave-editor-state"><Editor/><div className="leave-backdrop"/><section className="leave-sheet" role="dialog" aria-label="保存这次编辑"><i/><h1>保存这次编辑？</h1><p>保存为草稿，下次继续编辑</p><Button id="save-draft" onClick={item=>finish(item,true)}>保存</Button><Button id="discard" onClick={item=>finish(item,false)}>不保存</Button></section></section>;
}

export const readDemoPost=()=>{try{return JSON.parse(sessionStorage.getItem(POST_KEY)||'null')}catch{return null}};
