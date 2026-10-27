import React, {useEffect, useRef, useState} from 'react';
import {PersonaAvatar} from './PhoneChrome.jsx';
import {saveAvatarFile} from './avatarStore.js';
import './first-visit-guide.css';

export default function FirstVisitGuide({onComplete}) {
  const [stage, setStage] = useState('intro');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const input = useRef(null);
  const upload = useRef(null);

  useEffect(() => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { setStage('focus'); return; }
    const travelTimer = window.setTimeout(() => setStage('travel'), 1050);
    const focusTimer = window.setTimeout(() => setStage('focus'), 2850);
    return () => { window.clearTimeout(travelTimer); window.clearTimeout(focusTimer); };
  }, []);
  useEffect(() => { if (stage === 'focus') upload.current?.focus(); }, [stage]);

  const chooseAvatar = async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSaving(true);
    setError('');
    try {
      await saveAvatarFile(file);
      onComplete();
    } catch (problem) {
      setError(problem.message || '上传失败，请重试');
      event.target.value = '';
    } finally {
      setSaving(false);
    }
  };

  return <div className={`first-visit-guide ${stage}`} role="dialog" aria-modal="true" aria-label="首次进入引导">
    {stage !== 'focus' ? <>
      <div className="first-visit-travel-orb" aria-hidden="true">✦</div>
      <div className="first-visit-intro-copy" aria-live="polite"><strong>你的分身已创建好</strong><span>接下来认识你的悬浮球</span></div>
    </> : <>
      <div className="first-visit-spotlight" aria-hidden="true"><PersonaAvatar size={56}/></div>
      <div className="first-visit-card">
        <small>第一步 · 设置分身头像</small>
        <h2>你的分身已创建好</h2>
        <p>右下角的悬浮球是你的分身入口。上传头像后，悬浮球会显示你的照片。</p>
        <div className="first-visit-actions">
          <button type="button" className="first-visit-upload" ref={upload} disabled={saving} onClick={() => input.current?.click()}>{saving ? '正在保存…' : '上传我的头像'}</button>
          <button type="button" className="first-visit-skip" onClick={onComplete}>稍后再说</button>
        </div>
        {error && <p className="first-visit-error" role="alert">{error}</p>}
        <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={chooseAvatar}/>
      </div>
    </>}
  </div>;
}
