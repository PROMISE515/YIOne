import test from 'node:test';
import assert from 'node:assert/strict';
import {makeSuggestion, matchFaq, readFaqItems, saveFaqItem, writeFaqItems} from './faqStore.js';

function memoryStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {getItem:key=>data.get(key) ?? null,setItem:(key,value)=>data.set(key,value)};
}

test('只有已确认且启用的问答可作答', () => {
  const storage = memoryStorage({'yione-questions':JSON.stringify([{q:'你能提供哪些帮助？',a:'已核对的回答'}])});
  const items = readFaqItems(storage);
  assert.equal(matchFaq(items, '你能提供哪些帮助?')?.a, '已核对的回答');
  const disabled = items.map(item => item.q === '你能提供哪些帮助？' ? {...item,status:'disabled'} : item);
  assert.equal(matchFaq(disabled, '你能提供哪些帮助？'), null);
  assert.equal(matchFaq([...items,{id:'unreviewed',q:'新问题',a:'未经确认',status:'active'}], '新问题'), null);
});

test('知识库建议经确认后才可作答，归档后停止作答', () => {
  const storage = memoryStorage();
  const items = readFaqItems(storage);
  const suggestion = makeSuggestion({id:'doc-1',name:'访谈.txt',excerpt:'问题：你正在研究什么？ 回答：我正在研究早期产品验证。'});
  assert.equal(suggestion.status, 'pending');
  assert.equal(suggestion.sourceFile, '访谈.txt');
  assert.equal(matchFaq(items, suggestion.q), null);
  const confirmed = saveFaqItem(items, suggestion, storage);
  assert.equal(matchFaq(confirmed, suggestion.q)?.a, suggestion.a);
  writeFaqItems(confirmed.map(item => item.q === suggestion.q ? {...item,status:'archived'} : item), storage);
  assert.equal(matchFaq(readFaqItems(storage), suggestion.q), null);
});
