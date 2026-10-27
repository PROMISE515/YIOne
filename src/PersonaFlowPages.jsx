import React, {useEffect, useLayoutEffect, useState} from 'react';
import {IOSStatusBar, MiniProgramCapsule, MoreDotsIcon, PersonaAvatar} from './PhoneChrome.jsx';
import {certificationText, personaFromContext} from './personas.js';
import './persona-flow.css';
import {readBubbles} from './BubbleSettings.jsx';
import ShareIcon from './ShareIcon.jsx';
import PersonaShareCard from './PersonaShareCard.jsx';
import {matchFaq, readFaqItems, readSuggestions, writeSuggestions} from './faqStore.js';

function Icon({name, size=24}) {
  const paths = {
    back:<path d="m15 4-8 8 8 8"/>, right:<path d="m9 4 8 8-8 8"/>,
    people:<><circle cx="9" cy="7" r="4"/><path d="M2 21v-3a7 7 0 0 1 14 0v3ZM16 4a4 4 0 0 1 0 8m2 2a6 6 0 0 1 4 6"/></>,
    user:<><circle cx="12" cy="7" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3Z"/></>,
    plus:<path d="M12 3v18M3 12h18"/>, phone:<path d="M5 3 2 6c0 8 8 16 16 16l3-3-5-5-3 3-6-6 3-3Z"/>,
    send:<><path d="m2 11 20-9-9 20-3-9Z"/><path d="m10 13 12-11"/></>,
    check:<path d="m6 12 4 4 8-9"/>, down:<path d="m6 9 6 6 6-6"/>, up:<path d="m6 15 6-6 6 6"/>, search:<><circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export default function PersonaFlowPages({page, entry, debug, onHotspot, onLoad}) {
  const person = personaFromContext(entry?.context);
  const [expanded, setExpanded] = useState(true);
  const [postQuery,setPostQuery]=useState('');
  const [postLikes,setPostLikes]=useState({});
  const [postNotice,setPostNotice]=useState('');
  const [profileMenu, setProfileMenu] = useState(false);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState(()=>{try{return JSON.parse(localStorage.getItem(`yione-direct-chat-${person.id}`)||'[]').map(item=>typeof item==='string'?{text:item,source:'manual'}:item)}catch{return []}});
  useEffect(()=>{try{setMessages(JSON.parse(localStorage.getItem(`yione-direct-chat-${person.id}`)||'[]').map(item=>typeof item==='string'?{text:item,source:'manual'}:item))}catch{setMessages([])}setDraft('');},[person.id]);
  const [bubbleMenu,setBubbleMenu]=useState(false);
  const [shareOpen,setShareOpen]=useState(false);
  const [bubbles]=useState(readBubbles);
  const [following,setFollowing]=useState(()=>{try{return JSON.parse(localStorage.getItem('yione-following')||'{}')}catch{return {}}});
  const toggleFollow=()=>setFollowing(current=>{const next={...current,[person.id]:!current[person.id]};localStorage.setItem('yione-following',JSON.stringify(next));return next});
  const hotspot = id => page.hotspots.find(item => item.id === id);
  const Button = ({id, children, className='', onClick, context, ...props}) => {
    const item = hotspot(id);
    return <button {...props} type="button" aria-label={item?.label || id} className={`${className} ${debug ? `inspect ${item?.status || 'pending'}` : ''}`} title={debug ? `${item?.status || 'pending'} → ${item?.target || (item?.action === 'local' ? '页面内交互' : '目标待确认')}` : undefined} onClick={() => onClick ? onClick(item) : item && onHotspot(context ? {...item, context} : {...item, context:{person:person.id}})}>{children}</button>;
  };
  useLayoutEffect(() => onLoad?.(), [page.id]);

  if (page.id === 'G02') return <section className="h5-page persona-profile-page"><IOSStatusBar/><header className="persona-flow-header"><Button id="back"><Icon name="back"/></Button><strong>个人主页</strong><MiniProgramCapsule/></header><main className="persona-profile-content"><section className="persona-profile-identity"><span>{person.name[0]}</span><div><h1>{person.name}</h1><p>✓ 已认证</p></div></section><Button id="cooperation" context={{owner:person.id}} className="persona-profile-friend-links"><Icon name="people" size={20}/><span>{person.name}的友联</span><Icon name="right" size={18}/></Button><div className="persona-profile-bio"><p>{person.id==='yione'?'帮助创业者交流想法，连接真实的合作机会。':`${person.job.replaceAll(' · ','与')}从业者，关注真实合作机会。`}</p><p>{person.bio}</p></div><section className="persona-profile-needs"><div><small>我能提供</small>{person.offer.map(line => <p key={line}>{line}</p>)}</div><div><small>我在寻找</small>{person.need.map(line => <p key={line}>{line}</p>)}</div></section><div className="persona-profile-stats"><span><b>36</b> 关注</span><span><b>128</b> 被关注</span><span><b>3</b> 共同好友</span></div><div className="persona-profile-actions"><Button id="follow" className={following[person.id]?'is-following':''} onClick={toggleFollow}>{following[person.id]?'已关注':'关注'}</Button><button type="button">微信</button><Button id="more" onClick={()=>setProfileMenu(true)}><MoreDotsIcon/></Button></div><div className="persona-profile-section"><h2>动态</h2><Button id="posts" context={{person:person.id}}>全部 <Icon name="right" size={16}/></Button></div><article className="persona-profile-post"><time>昨天</time><p>{person.name}更新了近期进展，合作方向更清晰了。</p><div className="persona-profile-photo"><svg viewBox="72 1950 890 320" role="img" aria-label="人物动态配图"><image href={page.image} width="1206" height="2622"/></svg></div></article>{debug&&<section className="persona-profile-note"><b>调试说明</b><p>人物资料来自广场上下文。</p></section>}</main>{profileMenu&&<div className="profile-more-layer"><button type="button" className="profile-menu-dismiss" aria-label="关闭人物更多" onClick={()=>setProfileMenu(false)}/><div className="profile-more-menu" role="dialog" aria-label="人物更多"><Button id="report">举报</Button><Button id="block">屏蔽</Button><Button id="group">创建群聊</Button></div></div>}</section>;

  if(page.id==='G05'){
    const posts=[{id:`${person.id}-progress`,name:person.name,job:person.job,time:'昨天',text:`${person.name}更新了近期进展，合作方向更清晰了。`,tag:'#近期进展',image:true},{id:`${person.id}-focus`,name:person.name,job:person.job,time:'上周',text:person.bio,tag:'#寻找合作'}];
    const visiblePosts=posts.filter(post=>(post.text+post.tag).includes(postQuery.trim()));
    const openPost=post=>{const item=hotspot('post');if(item)onHotspot({...item,context:{person:person.id,post}})};
    const share=async()=>{try{await navigator.clipboard.writeText(location.href);setPostNotice('页面链接已复制')}catch{setPostNotice('请使用浏览器分享此页面')}};
    return <section className="h5-page persona-posts-page posts-shell"><IOSStatusBar/><header className="search-header"><Button id="back"><Icon name="back"/></Button><label><Icon name="search"/><input aria-label={`搜索${person.name}的动态`} placeholder={`搜索${person.name}的动态`} value={postQuery} onChange={event=>setPostQuery(event.target.value)}/></label><MiniProgramCapsule/></header><main className="my-posts persona-posts-content">{visiblePosts.map(post=><article className="persona-post-row" key={post.id}><div className="post-author"><span className="persona-post-avatar">{person.name[0]}</span><div><h1>{person.name}</h1><p>{post.time}</p></div></div><button type="button" className="post-body" onClick={()=>openPost(post)}>{post.text}</button>{post.image&&<button type="button" className="persona-post-media" onClick={()=>openPost(post)} aria-label="查看动态配图和评论"><svg viewBox="72 1950 890 320" role="img" aria-label="动态配图"><image href={page.image} width="1206" height="2622"/></svg></button>}<div className="post-actions"><button type="button" onClick={()=>setPostLikes(current=>({...current,[post.id]:!current[post.id]}))}>{postLikes[post.id]?'已赞':'点赞'}</button><button type="button" onClick={()=>openPost(post)}>评论</button><button type="button" onClick={share}>分享</button></div></article>)}{visiblePosts.length===0&&<p className="persona-posts-empty">没有找到相关动态</p>}{postNotice&&<p className="persona-posts-notice" role="status">{postNotice}</p>}</main></section>;
  }

  const send = item => {
    const text = draft.trim();
    if (!text || item?.status !== 'confirmed') return;
    setMessages(current => {const next=[...current,{text,source:'manual',replyTo:incomingQuestion}];localStorage.setItem(`yione-direct-chat-${person.id}`,JSON.stringify(next));return next;});
    const existing = readSuggestions();
    if (!existing.some(candidate => candidate.q === incomingQuestion && candidate.a === text)) writeSuggestions([{id:globalThis.crypto?.randomUUID?.()||`${Date.now()}`,q:incomingQuestion,a:text,scene:'合作交流',topic:'对话补充',sourceFile:`对话 · ${person.name}`,sourceId:person.id,status:'pending',createdAt:new Date().toISOString()},...existing]);
    setDraft('');
  };
  const incomingQuestion = person.id==='zhou'?'你希望以渠道合作，还是共同创业的方式推进？':person.id==='chen'?'你对发酵产品的应用方向，有没有更具体的要求？':'这周哪天方便进一步交流？';
  const faqMatch = matchFaq(readFaqItems(), incomingQuestion);
  const alreadyAnswered = messages.some(message => message.replyTo === incomingQuestion);
  const confirmFaq = () => {
    const text = (faqMatch?.a || '').trim();
    if (!faqMatch || !text) return;
    setMessages(current => {const next=[...current,{text,source:'faq-confirmed',faqId:faqMatch.id,replyTo:incomingQuestion}];localStorage.setItem(`yione-direct-chat-${person.id}`,JSON.stringify(next));return next;});
  };
  return <section className="h5-page standard-conversation-page person-real-conversation">
    <IOSStatusBar/>
    <header className="compact-chat-header">
      <Button id="back" className="compact-back"><Icon name="back" size={27}/></Button>
      <div className="need-summary">
        <Button id="profile" className="summary-avatar"><span>{person.name[0]}</span></Button>
        <span className="need-state">供 <i><Icon name="check" size={19}/></i></span>
        <Button id="collapse" className="summary-toggle" aria-expanded={expanded} onClick={()=>setExpanded(value=>!value)}><Icon name={expanded?'up':'down'} size={21}/>{expanded?'收起':'展开'}</Button>
        <span className="need-state">需 <i><Icon name="check" size={19}/></i></span>
      </div>
      <MiniProgramCapsule/>
    </header>
    {expanded&&<div className="person-conversation-fixed"><section className="official-card person-conversation-card">
      <div className="identity-row">
        <Button id="profile" className="conversation-profile-avatar"><span className="brand-avatar">{person.name[0]}</span></Button>
        <div><h1>{person.name}</h1><span className="conversation-person-meta">{certificationText(person)}</span></div>
        <Button id="cooperation" context={{owner:person.id}} className="cooperation"><Icon name="people"/>友联<Icon name="right" size={16}/></Button>
      </div>
      <div className="supply">
        <div><small>我能提供</small><p>{person.offer.map(line=><React.Fragment key={line}>{line}<br/></React.Fragment>)}</p></div>
        <div><small>我在寻找</small><p>{person.need.map(line=><React.Fragment key={line}>{line}<br/></React.Fragment>)}</p></div>
      </div>
      <div className="person-actions">
        <Button id="follow" className={`follow ${following[person.id]?'is-following':''}`} onClick={toggleFollow}>{following[person.id]?'已关注':'关注'}</Button>
        <Button id="wechat" className="wechat">微信</Button>
        <Button id="share" className="share" onClick={()=>setShareOpen(true)}><ShareIcon size={27}/></Button>
        <Button id="more"><span className="circle-more"><MoreDotsIcon size={18}/></span></Button>
      </div>
    </section></div>}
    <main className="standard-conversation-main"><div className="standard-chat-messages">
      <div className="standard-chat-time">今天 · 对话仅在当前设备保存</div>
      <div className="standard-chat-incoming"><b>{person.name}</b><span>{incomingQuestion}<small className="incoming-source"><Icon name="check" size={11}/>本人确认</small></span></div>
      {faqMatch&&!alreadyAnswered&&<div className="faq-approval">
        <small>我的拟回复 · 问答库 · 尚未发送</small>
        <p>{faqMatch.a}</p>
        <div><button type="button" className="faq-approval-confirm" onClick={confirmFaq}>确认发送</button></div>
      </div>}
      {!faqMatch&&<p className="faq-no-match">问答库未覆盖此问题，请本人回复。</p>}
      {messages.map((message,index)=><div className="chat-sent" key={`${message.text}-${index}`}><div className="standard-chat-outgoing">{message.text}</div>{message.source!=='faq-confirmed'&&<small>本人回复</small>}</div>)}
    </div></main>
    <div className="standard-conversation-bottom">
      <Button id="assistant" className="avatar-entry"><PersonaAvatar/></Button>
      <div className="commands"><Button id="cofounder">找联创</Button>{bubbles.filter(b=>b.enabled&&b.access==='free').slice(0,1).map((b,i)=><button type="button" key={i} onClick={()=>setDraft(b.content)}>{b.name}</button>)}<button type="button" onClick={()=>setBubbleMenu(true)}>更多指令</button></div>
      <div className="composer"><Button id="attachment"><Icon name="plus" size={28}/></Button><input aria-label="输入消息" placeholder="输入消息 · 按住说话" value={draft} onChange={event=>setDraft(event.target.value)} onKeyDown={event=>{if(event.key==='Enter')send(hotspot('send'));}}/><Button id={draft?'send':'phone'} className="phone" onClick={draft?send:undefined}><Icon name={draft?'send':'phone'}/></Button></div>
    </div>
    {bubbleMenu&&<div className="local-panel"><div className="local-panel-card"><button onClick={()=>setBubbleMenu(false)}>×</button><h2>更多指令</h2>{bubbles.filter(b=>b.enabled).map((b,i)=><button key={i} onClick={()=>{if(b.access==='free')setDraft(b.content);setBubbleMenu(false)}}>{b.name} · {b.access==='free'?'填入消息':'待接入'}</button>)}</div></div>}
    {shareOpen&&<PersonaShareCard person={person} onClose={()=>setShareOpen(false)}/>}
  </section>;
}
