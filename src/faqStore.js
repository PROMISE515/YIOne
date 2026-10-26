const FAQ_KEY = 'yione-faq-v2';
const SUGGESTION_KEY = 'yione-faq-suggestions-v1';
const KNOWLEDGE_KEY = 'yione-knowledge-v2';

export const DEFAULT_FAQ = [
  {id:'faq-start-1', q:'你正在做什么？', a:'我正在做一款 AI 产品，目前专注于早期产品验证。', scene:'开场白', topic:'自我介绍', source:'本人设置'},
  {id:'faq-start-2', q:'你能提供哪些帮助？', a:'我可以分享产品设计、用户研究和早期验证经验。', scene:'开场白', topic:'自我介绍', source:'本人设置'},
  {id:'faq-start-3', q:'你希望认识什么样的伙伴？', a:'希望认识愿意一起探索的技术伙伴。', scene:'开场白', topic:'合作意向', source:'本人设置'},
  {id:'faq-coop-1', q:'你希望以渠道合作，还是共同创业的方式推进？', a:'我想先聊清楚双方的资源和目标，再决定更适合渠道合作还是共同创业。', scene:'合作交流', topic:'合作方式', source:'本人设置'},
  {id:'faq-coop-2', q:'你对发酵产品的应用方向，有没有更具体的要求？', a:'我想先了解产品适用的人群和场景，再一起讨论具体的应用方向。', scene:'合作交流', topic:'合作方式', source:'本人设置'},
  {id:'faq-coop-3', q:'这周哪天方便进一步交流？', a:'这周可以约一个时间继续聊，请先发我几个你方便的时段。', scene:'合作交流', topic:'约见沟通', source:'本人设置'},
];

const parse = (storage, key) => { try { return JSON.parse(storage.getItem(key) || 'null'); } catch { return null; } };
const uid = () => globalThis.crypto?.randomUUID?.() || `faq-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const normalize = value => String(value || '').replace(/[？?。！!，,、：:\s]/g, '').toLowerCase();
const topicName = topic => topic === '认识我' ? '自我介绍' : topic === '合作方向' ? '合作意向' : topic;

export function readFaqItems(storage = localStorage) {
  const saved = parse(storage, FAQ_KEY);
  if (Array.isArray(saved)) {
    const normalized = saved.map(item => ({...item,topic:topicName(item.topic)}));
    const missing = DEFAULT_FAQ.filter(item => !normalized.some(row => row.id === item.id));
    if (!missing.length && normalized.every((item,index)=>item.topic===saved[index].topic)) return saved;
    const next = [...normalized, ...missing.map(item => ({...item,status:'active',attachments:[],confirmedAt:'示例问答'}))];
    storage.setItem(FAQ_KEY, JSON.stringify(next));
    return next;
  }
  const legacy = parse(storage, 'yione-questions');
  const merged = DEFAULT_FAQ.map(item => ({...item, status:'active', attachments:[], confirmedAt:'示例问答'}));
  if (Array.isArray(legacy)) legacy.forEach((item, index) => {
    if (!item?.q) return;
    const existing = merged.findIndex(row => normalize(row.q) === normalize(item.q));
    const migrated = {
      ...(existing >= 0 ? merged[existing] : {}),
      id: existing >= 0 ? merged[existing].id : `faq-legacy-${index}`,
      q:item.q, a:item.a || '', attachments:item.attachments || [],
      scene:'开场白', topic:existing >= 0 ? merged[existing].topic : '其他',
      source:item.source === 'debug' ? '调试修改' : '本人设置',
      status:item.attachment && !item.a ? 'disabled' : 'active',
      confirmedAt:'已迁移',
    };
    if (existing >= 0) merged[existing] = migrated; else merged.push(migrated);
  });
  storage.setItem(FAQ_KEY, JSON.stringify(merged));
  return merged;
}

export function writeFaqItems(items, storage = localStorage) {
  storage.setItem(FAQ_KEY, JSON.stringify(items));
  return items;
}

export function saveFaqItem(items, draft, storage = localStorage) {
  const existing = items.find(item => item.id === draft.id || normalize(item.q) === normalize(draft.q));
  const now = new Date().toISOString();
  const item = {
    ...existing, ...draft, id:existing?.id || draft.id || uid(),
    q:String(draft.q || '').trim(), a:String(draft.a || '').trim(),
    attachments:draft.attachments || [], scene:draft.scene || '开场白',
    topic:draft.topic || '其他', status:draft.status === 'disabled' ? 'disabled' : 'active',
    source:draft.source || existing?.source || '本人设置',
    confirmedAt:now, updatedAt:now, revision:(existing?.revision || 0) + 1,
  };
  if (!item.q || (!item.a && !item.attachments.length)) throw new Error('问题和回答不能为空');
  return writeFaqItems(existing ? items.map(row => row.id === existing.id ? item : row) : [...items, item], storage);
}

export function matchFaq(items, question) {
  const target = normalize(question);
  if (!target) return null;
  return items.find(item => item.status === 'active' && item.confirmedAt && (item.a || item.attachments?.length) && normalize(item.q) === target) || null;
}

export function readSuggestions(storage = localStorage) {
  return parse(storage, SUGGESTION_KEY) || [];
}

export function writeSuggestions(items, storage = localStorage) {
  storage.setItem(SUGGESTION_KEY, JSON.stringify(items));
  return items;
}

export function readKnowledge(storage = localStorage) {
  const saved = parse(storage, KNOWLEDGE_KEY);
  if (Array.isArray(saved)) return saved;
  const initial = [{id:'knowledge-demo', name:'产品介绍.pdf', status:'已解析', excerpt:'面向早期创业者的 AI 产品，帮助整理产品设计、用户研究和早期验证经验。', demo:true}];
  storage.setItem(KNOWLEDGE_KEY, JSON.stringify(initial));
  return initial;
}

export function writeKnowledge(items, storage = localStorage) {
  storage.setItem(KNOWLEDGE_KEY, JSON.stringify(items));
  return items;
}

export function makeSuggestion(file) {
  const text = file.excerpt?.trim();
  if (!text) return null;
  const explicit = text.match(/(?:问题|Q)\s*[：:]\s*(.+?)\s*(?:回答|A)\s*[：:]\s*([\s\S]+)/i);
  return {
    id:uid(), q:explicit?.[1]?.trim() || `关于${file.name.replace(/\.[^.]+$/, '')}，你可以介绍什么？`,
    a:(explicit?.[2] || text).trim().slice(0, 500), scene:'开场白', topic:'其他',
    sourceFile:file.name, sourceId:file.id, status:'pending', createdAt:new Date().toISOString(),
  };
}
