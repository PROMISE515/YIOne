import React, {useEffect, useRef, useState} from 'react';
import {IOSStatusBar} from './PhoneChrome.jsx';
import './entry-flow.css';

const questions = [
  '您是谁？',
  '您需要什么？',
  '您能提供什么？',
  '对了，我应该怎么称呼您？',
];
const mascot = `${import.meta.env.BASE_URL}assets/yione-gecko-explorer.png?v=2`;
const peekingMascot = `${import.meta.env.BASE_URL}assets/yione-gecko-peek.png`;

function Gecko({className = '', pose = 'standing'}) {
  return <img className={`entry-gecko ${className}`} src={pose === 'peeking' ? peekingMascot : mascot} alt="YIOne 小蜥蜴"/>;
}

function Icon({name}) {
  const paths = {
    mic: <><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 17v5m-4 0h8"/></>,
    mute: <><path d="M9 9v2a3 3 0 0 0 5.3 1.9M15 9V5a3 3 0 0 0-5.7-1.3M5 10a7 7 0 0 0 12 4.9M19 10a7 7 0 0 1-.5 2.6M12 17v5m-4 0h8M3 3l18 18"/></>,
    close: <path d="M5 5l14 14M19 5 5 19"/>,
    keyboard: <><rect x="2" y="5" width="20" height="14" rx="3"/><path d="M6 9h1m3 0h1m3 0h1m3 0h1M6 13h1m3 0h1m3 0h1m3 0h1M8 16h8"/></>,
    clip: <path d="m8 12.5 5.8-5.8a3 3 0 0 1 4.2 4.2l-7.7 7.7a5 5 0 0 1-7.1-7.1l8.4-8.4"/>,
    send: <><path d="m3 11 18-8-8 18-2.7-7.3L3 11Z"/><path d="M10.3 13.7 21 3"/></>,
  };
  return <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function Splash({onNext}) {
  useEffect(() => {
    const timer = window.setTimeout(onNext, 2800);
    return () => window.clearTimeout(timer);
  }, [onNext]);
  return <section className="entry-screen entry-splash" aria-label="开屏页">
    <IOSStatusBar/>
    <div className="entry-splash-content">
      <div className="entry-splash-glow"><Gecko/></div>
      <div className="entry-splash-copy"><span>YIOne</span><h1>Hi，我是 YIOne</h1><p>一个智能全自动AI机器人，后台有1000+来自大厂、名校、精英人群的分身。</p></div>
      <div className="entry-supply-demand" aria-hidden="true"><span>供</span><i/><span>需</span></div>
    </div>
  </section>;
}

function Register({onNext, draft, onDraftChange}) {
  const {phone, code} = draft;
  const [showCode, setShowCode] = useState(false);
  const [error, setError] = useState('');
  const continueToSetup = event => {
    event.preventDefault();
    if (!/^1\d{10}$/.test(phone)) { setError('请输入 11 位手机号'); return; }
    if (code.trim() !== '123456') { setError('请输入页面上的演示验证码'); return; }
    onNext();
  };
  return <section className="entry-screen entry-register" aria-label="注册页">
    <IOSStatusBar/>
    <div className="entry-register-top"><Gecko/><span>YIOne</span></div>
    <form className="entry-register-form" onSubmit={continueToSetup}>
      <h1>注册 YIOne</h1>
      <p>先认识你，再帮你找到合适的连接。</p>
      <label>手机号<input type="tel" inputMode="numeric" autoComplete="tel" maxLength={11} placeholder="请输入手机号" value={phone} onChange={event => {onDraftChange({...draft,phone:event.target.value.replace(/\D/g, '')});setError('')}}/></label>
      <label>验证码<div className="entry-code-row"><input type="text" inputMode="numeric" maxLength={6} placeholder="输入验证码" value={code} onChange={event => {onDraftChange({...draft,code:event.target.value.replace(/\D/g, '')});setError('')}}/><button type="button" onClick={() => setShowCode(true)}>获取验证码</button></div></label>
      {showCode && <small className="entry-demo-code">演示验证码：123456（不会发送短信）</small>}
      {error && <small className="entry-error" role="alert">{error}</small>}
      <button className="entry-primary" type="submit">继续</button>
      <small className="entry-register-note">当前为页面演示，不会创建真实账号。</small>
    </form>
  </section>;
}

function Collection({onComplete, initialAnswers = []}) {
  const [answers, setAnswers] = useState(() => initialAnswers);
  const [mode, setMode] = useState('voice');
  const [muted, setMuted] = useState(false);
  const [voiceActive, setVoiceActive] = useState(true);
  const [text, setText] = useState('');
  const [file, setFile] = useState('');
  const [error, setError] = useState('');
  const fileInput = useRef(null);
  const chat = useRef(null);
  const index = answers.length;
  const complete = index >= questions.length;

  useEffect(() => { if (chat.current) chat.current.scrollTop = chat.current.scrollHeight; }, [index]);

  const addAnswer = (value, source) => {
    if (!value.trim() && !file) { setError('请先输入回答'); return; }
    const next = [...answers, {value: value.trim(), source, file}];
    setAnswers(next);
    setText('');
    setFile('');
    setError('');
    setVoiceActive(true);
  };
  const sendText = event => { event.preventDefault(); addAnswer(text, 'text'); };
  const finishVoice = () => { if (muted || !voiceActive) return; addAnswer('语音演示回答', 'voice'); };

  return <section className="entry-screen entry-collection" aria-label="信息采集页">
    <IOSStatusBar/>
    <div className="entry-collection-top"><Gecko pose="peeking"/><div><span>YIOne</span><small>{complete ? '信息收集完成' : `认识你 · ${index + 1}/${questions.length}`}</small></div></div>
    <div className="entry-collection-chat" ref={chat} aria-live="polite">
      <div className="entry-chat-bubble entry-assistant">请回答：您是谁？需要什么？能提供什么？</div>
      {answers.map((answer, number) => <React.Fragment key={number}>
        <div className="entry-chat-bubble entry-assistant">{questions[number]}</div>
        <div className="entry-chat-bubble entry-user">{answer.source === 'voice' ? '已完成语音演示回答' : answer.value}{answer.file && <small>附件：{answer.file}</small>}</div>
      </React.Fragment>)}
      {!complete && <div className="entry-chat-bubble entry-assistant entry-followup">{questions[index]}</div>}
      {complete && <div className="entry-chat-bubble entry-assistant">信息收集好了，准备好与 YIOne 链接了吗？</div>}
    </div>
    {complete ? <footer className="entry-collection-footer"><button className="entry-journey" type="button" onClick={() => onComplete(answers)}>开启旅程 · 与YIOne链接</button></footer> : mode === 'voice' ? <footer className="entry-collection-footer">
      <div className="entry-voice-summary"><span className={voiceActive && !muted ? 'entry-live-dot' : ''}/>{muted ? '麦克风已关闭' : voiceActive ? '正在记录 · 语音交互演示' : '语音已暂停'}</div>
      <div className="entry-voice-controls"><button className={`entry-voice-bar ${voiceActive && !muted ? 'is-active' : 'is-idle'}`} type="button" disabled={muted} onClick={() => setVoiceActive(current => !current)}><span className="entry-voice-light entry-voice-light-a" aria-hidden="true"/><span className="entry-voice-light entry-voice-light-b" aria-hidden="true"/><span className="entry-voice-light entry-voice-light-c" aria-hidden="true"/><span className="entry-voice-label">{muted ? '打开麦克风后继续' : voiceActive ? '直接说，YIOne 正在记录' : '点击继续说话'}</span></button><button className="entry-icon-button" type="button" aria-label={muted ? '打开麦克风' : '关闭麦克风'} onClick={() => setMuted(current => !current)}><Icon name={muted ? 'mute' : 'mic'}/></button><button className="entry-icon-button" type="button" aria-label="切换到打字" onClick={() => {setMode('text');setError('')}}><Icon name="close"/></button></div>
      <button className="entry-voice-next" type="button" disabled={muted || !voiceActive} onClick={finishVoice}>完成本题</button>
      <small className="entry-voice-note">语音仅演示状态，不会录音或保存声音。切换打字可保存文字回答。</small>
    </footer> : <footer className="entry-collection-footer">
      <form className="entry-text-controls" onSubmit={sendText}><button className="entry-icon-button" type="button" aria-label="添加附件" onClick={() => fileInput.current?.click()}><Icon name="clip"/></button><input className="entry-answer-input" value={text} onChange={event => {setText(event.target.value);setError('')}} placeholder="输入回答" aria-label="输入回答"/><button className="entry-icon-button entry-send" type="submit" aria-label="发送回答"><Icon name="send"/></button></form>
      <input ref={fileInput} type="file" hidden onChange={event => setFile(event.target.files?.[0]?.name || '')}/>
      {file && <small className="entry-selected-file">已选择：{file}</small>}
      {error && <small className="entry-error" role="alert">{error}</small>}
      <button className="entry-switch-voice" type="button" onClick={() => {setMode('voice');setError('')}}><Icon name="mic"/> 切换语音</button>
    </footer>}
  </section>;
}

export default function EntryFlow({step, onStep, onComplete, initialAnswers, registerDraft, onRegisterDraftChange}) {
  const onRegister = () => onStep('register');
  if (step === 'welcome') return <Splash onNext={onRegister}/>;
  if (step === 'register') return <Register onNext={() => onStep('setup')} draft={registerDraft} onDraftChange={onRegisterDraftChange}/>;
  return <Collection onComplete={onComplete} initialAnswers={initialAnswers}/>;
}
