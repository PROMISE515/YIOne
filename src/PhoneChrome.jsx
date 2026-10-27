import React, {forwardRef, useSyncExternalStore} from 'react';
import './phone-chrome.css';
import {readAvatar, subscribeAvatar} from './avatarStore.js';

export const PhoneShell = forwardRef(function PhoneShell({children, onScroll, shortcut, overlay}, ref) {
  return <div className="phone-shell"><div className="phone-scroll" ref={ref} onScroll={onScroll}>{children}</div>{shortcut&&<button type="button" className="global-workbench-entry" aria-label="进入工作台" onClick={shortcut}><PersonaAvatar size={48}/></button>}{overlay}</div>;
});

export function IOSStatusBar() {
  return <div className="ios-status" aria-label="9:41，网络正常，电量充足"><b>9:41</b><div className="ios-status-icons"><svg viewBox="0 0 20 14" aria-hidden="true"><rect x="1" y="8" width="3" height="5" rx="1"/><rect x="6" y="5" width="3" height="8" rx="1"/><rect x="11" y="2" width="3" height="11" rx="1"/><rect x="16" y="0" width="3" height="13" rx="1"/></svg><svg viewBox="0 0 18 14" fill="none" aria-hidden="true"><path d="M2 5.5a10 10 0 0 1 14 0M4.7 8.2a6.2 6.2 0 0 1 8.6 0M7.5 11a2.2 2.2 0 0 1 3 0"/><circle cx="9" cy="12" r="1" fill="currentColor" stroke="none"/></svg><svg className="ios-battery" viewBox="0 0 27 14" fill="none" aria-hidden="true"><rect x="1" y="1" width="22" height="12" rx="3"/><path d="M25 5v4"/><rect className="ios-charge" x="3" y="3" width="16" height="8" rx="1"/></svg></div></div>;
}

export function MiniProgramCapsule() {
  return <div className="mini-capsule" aria-hidden="true"><span className="mini-dots"><i/><i/><i/></span><b/><span className="mini-ring"><i/></span></div>;
}

export function PersonaAvatar({size=32}) {
  const uploaded = useSyncExternalStore(subscribeAvatar, readAvatar, () => '');
  return <img className="persona-avatar" src={uploaded || `${import.meta.env.BASE_URL}assets/patrick-avatar.jpg`} width={size} height={size} alt="" aria-hidden="true"/>;
}

export function MoreDotsIcon({size=22}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/></svg>;
}
