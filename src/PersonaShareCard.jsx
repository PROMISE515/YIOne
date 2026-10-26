import React, {useState} from 'react';
import {certificationText} from './personas.js';
import './persona-share-card.css';

const cardText = person => `${person.name}\n${certificationText(person)}\n\n我能提供：${person.offer.join('、')}\n我在寻找：${person.need.join('、')}\n\nYIOne 人物名片`;

function cardImage(person) {
  const canvas = document.createElement('canvas');
  canvas.width = 900;
  canvas.height = 1180;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#f7f3ee';
  ctx.fillRect(0, 0, 900, 1180);
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.roundRect(48, 48, 804, 1084, 36);
  ctx.fill();
  ctx.strokeStyle = '#e7d7c9';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#f1ede7';
  ctx.beginPath();
  ctx.arc(148, 165, 56, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#665e56';
  ctx.font = '56px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(person.name[0], 148, 184);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#191918';
  ctx.font = 'bold 50px sans-serif';
  ctx.fillText(person.name, 225, 157);
  ctx.fillStyle = person.certification ? '#bb5a22' : '#89827a';
  ctx.font = '27px sans-serif';
  ctx.fillText(certificationText(person), 225, 204);
  ctx.strokeStyle = '#eee6dd';
  ctx.beginPath();
  ctx.moveTo(100, 267);
  ctx.lineTo(800, 267);
  ctx.stroke();
  const section = (label, items, top) => {
    ctx.fillStyle = '#999087';
    ctx.font = '28px sans-serif';
    ctx.fillText(label, 100, top);
    ctx.fillStyle = '#24211e';
    ctx.font = '34px sans-serif';
    items.forEach((item, index) => ctx.fillText(item, 100, top + 64 + index * 58));
  };
  section('我能提供', person.offer, 355);
  section('我在寻找', person.need, 650);
  ctx.fillStyle = '#f35b55';
  ctx.fillRect(100, 1002, 70, 6);
  ctx.fillStyle = '#77716a';
  ctx.font = '28px sans-serif';
  ctx.fillText('YIOne · 认识真实的合作伙伴', 100, 1063);
  return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
}

export default function PersonaShareCard({person, onClose}) {
  const [notice, setNotice] = useState('');
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(cardText(person));
      setNotice('名片内容已复制');
    } catch {
      setNotice('复制失败，请使用分享名片');
    }
  };
  const share = async () => {
    const blob = await cardImage(person);
    if (!blob) { setNotice('名片生成失败'); return; }
    const file = new File([blob], `${person.name}-YIOne名片.png`, {type:'image/png'});
    if (navigator.canShare?.({files:[file]})) {
      try { await navigator.share({title:`${person.name}的名片`, files:[file]}); return; }
      catch (error) { if (error.name === 'AbortError') return; }
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice('名片图片已保存');
  };
  return <div className="persona-share-overlay" onClick={onClose}>
    <section className="persona-share-sheet" role="dialog" aria-modal="true" aria-label={`分享${person.name}的名片`} onClick={event=>event.stopPropagation()}>
      <header><h2>分享人物名片</h2><button type="button" aria-label="关闭名片" onClick={onClose}>×</button></header>
      <p className="persona-share-hint">分享这张名片，让朋友认识 {person.name}。</p>
      <article className="persona-postcard">
        <div className="persona-postcard-identity"><span className="persona-postcard-avatar">{person.name[0]}</span><div><strong>{person.name}</strong><small>{certificationText(person)}</small></div></div>
        <div className="persona-postcard-section"><small>我能提供</small>{person.offer.map(item=><p key={item}>{item}</p>)}</div>
        <div className="persona-postcard-section"><small>我在寻找</small>{person.need.map(item=><p key={item}>{item}</p>)}</div>
        <footer>YIOne · 认识真实的合作伙伴</footer>
      </article>
      <div className="persona-share-actions"><button type="button" onClick={copy}>复制名片内容</button><button type="button" onClick={share}>分享名片</button></div>
      {notice&&<p className="persona-share-notice" role="status">{notice}</p>}
    </section>
  </div>;
}
