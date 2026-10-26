import React from 'react';
import {readGroupState} from './groupState.js';
import './message-center.css';

const directChats = [
  {id:'zhou', avatar:'周', name:'周岚', detail:'生物发酵 · 市场拓展', time:'刚刚', heading:'合作范围需要你明确', question:'对方问：你希望以渠道合作，还是共同创业的方式推进？'},
  {id:'chen', avatar:'陈', name:'陈序', detail:'合成生物 · 产品研发', time:'8 分钟前', heading:'技术要求还不够清楚', question:'对方问：你对发酵产品的应用方向，有没有更具体的要求？'},
  {id:'xu', avatar:'许', name:'许宁', detail:'食品原料 · 创业者', time:'20 分钟前', heading:'交流时间需要你确定', question:'对方问：这周哪天方便进一步交流？'},
];
const memberNames = {zhou:'周岚',chen:'陈序',xu:'许宁',yione:'YIOne'};

export default function MessageCenter({page, debug, onHotspot}) {
  const direct = page.id === 'N35';
  const group = readGroupState();
  const find = id => page.hotspots.find(hotspot => hotspot.id === id);
  const Button = ({id, className='', children, context, ...props}) => {
    const hotspot = find(id);
    return <button {...props} type="button" className={`${className} ${debug ? `inspect ${hotspot?.status || 'pending'}` : ''}`} aria-label={hotspot?.label || id} onClick={() => hotspot && onHotspot(context ? {...hotspot, context} : hotspot)}>{children}</button>;
  };
  const lastGroupMessage = group.messages?.at(-1);
  return <main className="message-center">
    <div className="message-tabs" role="tablist" aria-label="消息分类">
      {direct?<span className="message-tab active" role="tab" aria-selected="true">单聊</span>:<Button id="unsure" className="message-tab" role="tab" aria-selected="false">单聊</Button>}
      {direct?<Button id="chatting" className="message-tab" role="tab" aria-selected="false">群聊</Button>:<span className="message-tab active" role="tab" aria-selected="true">群聊</span>}
    </div>
    {direct?<div className="message-card-list">{directChats.map(card=><article key={card.id} className="message-card">
      <div className="message-card-person"><Button id={`card-${card.id}-avatar`} className="message-avatar-button" context={{person:card.id}}><span className="message-avatar">{card.avatar}</span></Button><div><h2>{card.name}</h2><p>{card.detail}</p></div><time>{card.time}</time></div>
      <Button id={`card-${card.id}`} context={{person:card.id}} className="message-card-open"><span className="message-card-heading needs-decision"><i/>{card.heading}</span><span className="message-card-question">{card.question}</span><span className="message-card-context">查看对话并回复</span></Button>
    </article>)}</div>:<div className="message-card-list"><Button id="group-main" className="message-card message-group-card">
      <span className="message-group-top"><span className="message-group-avatars">{(group.members||[]).slice(0,3).map(id=><span key={id}>{memberNames[id]?.[0]||id[0]}</span>)}</span><span><strong>{group.name}</strong><small>{(group.members||[]).map(id=>memberNames[id]||id).join('、')} · {(group.members?.length||0)+1} 人</small></span></span>
      <span className="message-card-heading in-progress"><i/>{group.muted?'消息免打扰':'群聊进行中'}</span><span className="message-card-question">{lastGroupMessage||'在这里和合作伙伴一起交流。'}</span><span className="message-card-context">进入群聊 →</span>
    </Button></div>}
  </main>;
}
