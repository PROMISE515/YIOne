import test from 'node:test';
import assert from 'node:assert/strict';
import {clearWorkbenchTask, parseWorkbenchTask, readWorkbenchTask, stageWorkbenchTask, readCustomTasks, WORKBENCH_TASK_TEMPLATE} from './scheduledTasks.js';

function memoryStorage() {
  const values = new Map();
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key,value) => values.set(key,String(value)),
    removeItem: key => values.delete(key),
  };
}

test('点击新增任务后，工作台对话框获得空白创建模板', () => {
  const draftStorage = memoryStorage();
  const taskStorage = memoryStorage();
  const staged = stageWorkbenchTask(draftStorage);
  assert.equal(staged.text,WORKBENCH_TASK_TEMPLATE);
  assert.deepEqual(readCustomTasks(taskStorage),[]);
  assert.deepEqual(readWorkbenchTask(draftStorage),staged);
  assert.equal(parseWorkbenchTask(staged.text),null);
  clearWorkbenchTask(draftStorage);
  assert.equal(readWorkbenchTask(draftStorage),null);
});

test('工作台对话框填写任务后才能生成任务内容', () => {
  const text='请帮我创建一个定时任务：\n任务名称：约咖啡\n任务内容：联系周岚确定见面时间\n执行时间：每周五 17:00';
  assert.deepEqual(parseWorkbenchTask(text),{title:'约咖啡',description:'联系周岚确定见面时间',repeat:'weekly',weekday:'五',time:'17:00'});
});
