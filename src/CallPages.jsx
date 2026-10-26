import React, {useLayoutEffect} from 'react';
import {IOSStatusBar, MiniProgramCapsule} from './PhoneChrome.jsx';
import './call-pages.css';

function PhoneIcon() {
  return <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M7 13c5.2-4.3 12.8-4.3 18 0l-3.4 4.4-4-1.8v3h-3.2v-3l-4 1.8L7 13Z"/></svg>;
}

export default function CallPages({page, debug, onHotspot, onLoad}) {
  const hotspot = id => page.hotspots.find(item => item.id === id);
  const Button = ({id, children, className=''}) => {
    const item = hotspot(id);
    return <button type="button" aria-label={item?.label || id} className={`${className} ${debug ? `inspect ${item?.status || 'pending'}` : ''}`} title={debug ? `${item?.status || 'pending'} → ${item?.target || (item?.action === 'back' ? '来源页' : '目标待确认')}` : undefined} onClick={() => item && onHotspot(id === 'end-call' ? {...item, action: 'navigate', target: 'N68', historyMode: 'replace'} : item)}>{children}</button>;
  };
  useLayoutEffect(() => { onLoad?.(); }, [page.id]);
  const visible = page.id === 'N52';
  return <section className={`h5-page call-page ${visible ? 'call-transcript-visible' : 'call-transcript-hidden'}`}>
    <IOSStatusBar/>
    <header className="call-header"><strong>YIOne</strong><MiniProgramCapsule/></header>
    <main className="call-main">
      <div className="call-identity"><span>Y</span><p>语音通话中</p></div>
      {visible ? <section className="call-transcript" aria-label="对话文字">
        <header><span>对话文字</span><Button id="hide-text" className="hide-transcript">×</Button></header>
        <div className="speech user-speech">帮我找三个做生物发酵市场<br/>创业的人。</div>
        <p className="assistant-speech">你更想认识做技术产品的创业者，<br/>还是做市场、销售的创业者？</p>
        <div className="speech reply-speech">做市场的，先看看上海。</div>
        <p className="replying"><i/>YIOne 正在回复</p>
        <p className="assistant-speech last">好的，先聚焦上海的市场方向。</p>
      </section> : <section className="call-listening" aria-label="对话文字已隐藏">
        <h1>我在听，你继续说</h1>
        <p>寻找生物发酵领域创业者</p>
        <div className="voice-bars"><i/><i/><i/><i/></div>
        <Button id="show-text" className="show-transcript">对话文字已隐藏</Button>
      </section>}
      <Button id="end-call" className="end-call"><span><PhoneIcon/></span><em>结束通话</em></Button>
    </main>
  </section>;
}
