import React, {useState} from 'react';
import ReplyMedia, {saveReplyMedia} from './ReplyMedia.jsx';
import {makeSuggestion, readFaqItems, readKnowledge, readSuggestions, saveFaqItem, writeFaqItems, writeKnowledge, writeSuggestions} from './faqStore.js';
import './faq-knowledge.css';

const emptyDraft = {q:'', a:'', scene:'开场白', topic:'自我介绍', attachments:[], source:'本人设置'};

export default function FaqKnowledgePages({page, Header, B}) {
  const [faq, setFaq] = useState(readFaqItems);
  const [knowledge, setKnowledge] = useState(readKnowledge);
  const [suggestions, setSuggestions] = useState(readSuggestions);
  const [tab, setTab] = useState('active');
  const [scene, setScene] = useState('开场白');
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [collapsed, setCollapsed] = useState({});
  const [editor, setEditor] = useState(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [editingSuggestion, setEditingSuggestion] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const [deleteItem, setDeleteItem] = useState(null);
  const [busy, setBusy] = useState(false);
  const updateFaq = next => setFaq(writeFaqItems(next));
  const updateKnowledge = next => setKnowledge(writeKnowledge(next));
  const updateSuggestions = next => setSuggestions(writeSuggestions(next));
  const startEdit = (item = emptyDraft, suggestion = null) => {
    setDraft({...emptyDraft, ...item, attachments:item.attachments || []});
    setEditingSuggestion(suggestion);
    setError(''); setEditor(true);
  };
  const save = async () => {
    if (!draft.q.trim() || (!draft.a.trim() && !draft.attachments.length)) { setError('请填写问题和回答。'); return; }
    setBusy(true); setError('');
    try {
      const attachments = await Promise.all(draft.attachments.map(item => item.file ? saveReplyMedia(item.file) : item));
      const next = saveFaqItem(faq, {...draft, attachments, source:editingSuggestion ? `建议确认 · ${editingSuggestion.sourceFile}` : draft.source});
      setFaq(next);
      if (editingSuggestion) updateSuggestions(suggestions.map(item => item.id === editingSuggestion.id ? {...item, status:'confirmed'} : item));
      setEditor(null); setTab('active'); setScene(draft.scene);
    } catch { setError('保存失败，请重试。'); }
    setBusy(false);
  };
  const upload = async file => {
    if (!file) return;
    setError('');
    if (file.size > 10 * 1024 * 1024) { setError('文件不能超过 10 MB。'); return; }
    try {
      let excerpt = '';
      if (/\.(txt|md)$/i.test(file.name)) excerpt = (await file.text()).trim().slice(0, 5000);
      const attachment = await saveReplyMedia(file);
      const item = {id:globalThis.crypto?.randomUUID?.() || `${Date.now()}`, name:file.name, size:file.size, status:excerpt ? '已解析' : '待解析', excerpt, attachment, uploadedAt:new Date().toISOString()};
      updateKnowledge([item, ...knowledge]); setSelectedFile(item);
    } catch { setError('保存文件失败，请重试。'); }
  };
  const suggest = file => {
    const candidate = makeSuggestion(file);
    if (!candidate) return;
    updateSuggestions([candidate, ...suggestions]); setSelectedFile(null);
  };
  const pending = suggestions.filter(item => item.status === 'pending');
  const visibleFaq = faq.filter(item => tab === 'disabled' ? item.status === 'disabled' : item.status === 'active')
    .filter(item => item.scene === scene || search.trim())
    .filter(item => !search.trim() || `${item.q} ${item.a} ${item.topic}`.includes(search.trim()));
  const topics = [...new Set(visibleFaq.map(item => item.topic || '其他'))];
  return <section className="h5-page structure-page faq-knowledge-shell"><Header title={page.id === 'N32' ? '问答库' : '知识库'}/>
    {page.id === 'N32' ? <main className="faq-knowledge-main">
      {searchOpen&&<input className="faq-search" aria-label="搜索问答内容" placeholder="搜索问题或回答" value={search} onChange={event=>setSearch(event.target.value)}/>}
      <div className="faq-tabs"><button className={tab==='active'?'selected':''} onClick={()=>setTab('active')}>已启用</button><button className={tab==='pending'?'selected':''} onClick={()=>setTab('pending')}>待确认{pending.length>0&&<em>{pending.length}</em>}</button><button className={tab==='disabled'?'selected':''} onClick={()=>setTab('disabled')}>已停用</button></div>
      {tab==='pending' ? <div className="faq-list">{pending.length ? pending.map(item=><article className="faq-item" key={item.id}><small>来源 · {item.sourceFile}</small><h3>{item.q}</h3><p>{item.a}</p><div className="faq-item-actions"><button onClick={()=>startEdit(item,item)}>编辑并确认</button><button onClick={()=>updateSuggestions(suggestions.map(row=>row.id===item.id?{...row,status:'ignored'}:row))}>忽略</button></div></article>) : <p className="faq-empty">暂无待确认内容。资料和对话产生的备选问答会先出现在这里。</p>}</div> : <>
        <div className="faq-scene-filter"><span>场景</span>{[...new Set(['开场白',...faq.filter(item=>item.status==='active').map(item=>item.scene)])].map(value=><button key={value} className={scene===value?'selected':''} onClick={()=>setScene(value)}>{value}</button>)}</div>
        <div className="faq-list">{topics.length ? topics.map(topic=><section className="faq-topic" key={topic}><button type="button" className="faq-topic-heading" aria-expanded={!collapsed[topic]} onClick={()=>setCollapsed(current=>({...current,[topic]:!current[topic]}))}><span>{topic}</span><small>{visibleFaq.filter(item=>item.topic===topic).length} 条</small><i>{collapsed[topic]?'⌄':'⌃'}</i></button>{!collapsed[topic]&&visibleFaq.filter(item=>item.topic===topic).map(item=><article className="faq-item" key={item.id}><small>{item.source} · {item.status==='active'?'已确认':'已停用'}</small><h3><span>Q</span>{item.q}</h3><p><span>A</span>{item.a || '附件回复'}</p>{item.attachments?.map(media=><ReplyMedia key={media.id} item={media} compact/>)}<div className="faq-item-actions"><button onClick={()=>startEdit(item)}>编辑</button><button onClick={()=>updateFaq(faq.map(row=>row.id===item.id?{...row,status:item.status==='active'?'disabled':'active'}:row))}>{item.status==='active'?'停用':'启用'}</button><button onClick={()=>setDeleteItem(item)}>删除</button></div></article>)}</section>) : <p className="faq-empty">此场景暂无问答。你可以新建问答。</p>}</div>
      </>}
    </main> : <main className="faq-knowledge-main knowledge-main">{searchOpen&&<input className="faq-search" aria-label="搜索资料" placeholder="搜索文件名" value={search} onChange={event=>setSearch(event.target.value)}/>}<section className="knowledge-section"><div className="knowledge-title"><h2>资料文件</h2><span>{knowledge.length} 份</span></div>{knowledge.filter(file=>!search.trim()||file.name.includes(search.trim())).map(file=><button type="button" className="knowledge-file" key={file.id} onClick={()=>setSelectedFile(file)}><span className="knowledge-file-icon">▤</span><span><strong>{file.name}</strong><small>{file.status}{file.demo?' · 示例资料':''}</small></span><i>›</i></button>)}</section><section className="knowledge-section"><div className="knowledge-title"><h2>待确认问答</h2><span>{pending.length} 条</span></div><p className="knowledge-explain">AI 提炼的内容先由你核对。确认后才会进入问答库。</p>{pending.slice(0,2).map(item=><button type="button" className="knowledge-candidate" key={item.id} onClick={()=>startEdit(item,item)}><small>{item.sourceFile}</small><strong>{item.q}</strong><span>查看并确认 ›</span></button>)}</section>{error&&<p className="faq-error" role="alert">{error}</p>}</main>}
    {page.id === 'N32' ? <div className="faq-bottom"><B id="new" onClick={()=>startEdit()}>新建问答</B><button type="button" className="faq-footer-search" aria-label="搜索问答" onClick={()=>setSearchOpen(value=>!value)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg></button></div> : <div className="faq-bottom knowledge-footer"><label className="knowledge-upload">上传资料<input type="file" accept=".txt,.md,.pdf,.doc,.docx" onChange={event=>{upload(event.target.files?.[0]);event.target.value='';}}/></label><button type="button" className="faq-footer-search" aria-label="搜索资料" onClick={()=>setSearchOpen(value=>!value)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg></button></div>}
    {selectedFile&&<div className="local-panel"><div className="local-panel-card knowledge-detail"><button type="button" aria-label="关闭" onClick={()=>setSelectedFile(null)}>×</button><h2>{selectedFile.name}</h2><p>状态：{selectedFile.status}</p>{selectedFile.attachment&&<ReplyMedia item={selectedFile.attachment} compact/>}{selectedFile.excerpt?<><h3>提炼依据</h3><p className="knowledge-excerpt">{selectedFile.excerpt}</p><button type="button" className="local-primary" onClick={()=>suggest(selectedFile)}>生成待确认问答</button></>:<p>此文件尚未解析。当前原型仅支持提取 TXT 和 Markdown 文本。</p>}</div></div>}
    {editor&&<div className="local-panel"><div className="local-panel-card faq-editor"><button type="button" aria-label="关闭" onClick={()=>setEditor(null)}>×</button><h2>{editingSuggestion?'确认候选问答':draft.id?'编辑问答':'新建问答'}</h2>{editingSuggestion&&<p className="faq-source">依据：{editingSuggestion.sourceFile} · 请核对内容后确认</p>}<label>场景<select value={draft.scene} onChange={event=>setDraft({...draft,scene:event.target.value})}><option>开场白</option><option>合作交流</option><option>其他</option></select></label><label>事项<input value={draft.topic} onChange={event=>setDraft({...draft,topic:event.target.value})} placeholder="例如：自我介绍"/></label><label>问题<input value={draft.q} onChange={event=>setDraft({...draft,q:event.target.value})} placeholder="访客可能怎么问？"/></label><label>回答<textarea value={draft.a} onChange={event=>setDraft({...draft,a:event.target.value})} placeholder="分身应该怎么回答？"/></label><div className="faq-editor-media">{draft.attachments.map((item,index)=><div key={item.id || index}><ReplyMedia item={item} compact/><button type="button" aria-label={`移除${item.name}`} onClick={()=>setDraft({...draft,attachments:draft.attachments.filter((_,i)=>i!==index)})}>×</button></div>)}<label>＋ 添加照片、文件或视频<input type="file" multiple onChange={event=>{const files=Array.from(event.target.files||[]).map(file=>({id:globalThis.crypto?.randomUUID?.()||`${Date.now()}-${file.name}`,name:file.name,type:file.type,size:file.size,file}));setDraft(current=>({...current,attachments:[...current.attachments,...files]}));event.target.value='';}}/></label></div>{error&&<p className="faq-error" role="alert">{error}</p>}<button type="button" className="local-primary" disabled={busy} onClick={save}>{busy?'保存中…':editingSuggestion?'确认并纳入问答库':'保存问答'}</button></div></div>}
    {deleteItem&&<div className="local-panel"><div className="local-panel-card"><h2>删除这条问答？</h2><p>删除后分身不再使用它作答。</p><div className="faq-confirm-actions"><button onClick={()=>setDeleteItem(null)}>取消</button><button onClick={()=>{updateFaq(faq.map(item=>item.id===deleteItem.id?{...item,status:'archived'}:item));setDeleteItem(null)}}>删除</button></div></div></div>}
  </section>;
}
