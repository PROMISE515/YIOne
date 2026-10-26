const SCHEDULE_KEY = 'yione-task-schedules-v1';
const CUSTOM_KEY = 'yione-custom-tasks-v1';
const WORKBENCH_DRAFT_KEY = 'yione-workbench-task-draft-v1';
export const WORKBENCH_TASK_TEMPLATE = '请帮我创建一个定时任务：\n任务名称：\n任务内容：\n执行时间：每天 09:00';

export const DEFAULT_SCHEDULES = {
  'task-1': {repeat:'daily', time:'09:00'},
  'task-2': {repeat:'daily', time:'18:00'},
  'task-3': {repeat:'weekly', weekday:'五', time:'17:00'},
};

export const WEEKDAYS = ['一','二','三','四','五','六','日'];

export function readTaskSchedules(storage = localStorage) {
  try {return {...DEFAULT_SCHEDULES,...JSON.parse(storage.getItem(SCHEDULE_KEY) || '{}')};}
  catch {return {...DEFAULT_SCHEDULES};}
}

export function writeTaskSchedules(schedules, storage = localStorage) {
  storage.setItem(SCHEDULE_KEY,JSON.stringify(schedules));
  return schedules;
}

export function readCustomTasks(storage = localStorage) {
  try {const value=JSON.parse(storage.getItem(CUSTOM_KEY) || '[]');return Array.isArray(value)?value:[];}
  catch {return [];}
}

export function writeCustomTasks(tasks, storage = localStorage) {
  storage.setItem(CUSTOM_KEY,JSON.stringify(tasks));
  return tasks;
}

export function formatTaskSchedule(schedule) {
  if (!schedule) return '未设置时间';
  return `${schedule.repeat === 'weekly' ? `每周${schedule.weekday || '一'}` : '每天'} ${schedule.time || '09:00'}`;
}

export function stageWorkbenchTask(storage = sessionStorage) {
  const staged = {text:WORKBENCH_TASK_TEMPLATE};
  storage.setItem(WORKBENCH_DRAFT_KEY,JSON.stringify(staged));
  return staged;
}

export function parseWorkbenchTask(text) {
  const title = text.match(/(?:^|\n)任务名称[：:][ \t]*([^\n]*)/)?.[1]?.trim();
  const description = text.match(/(?:^|\n)任务内容[：:][ \t]*([\s\S]*?)(?=\n执行时间[：:]|$)/)?.[1]?.trim();
  if (!title || !description) return null;
  const schedule = text.match(/(?:^|\n)执行时间[：:]\s*(每周([一二三四五六日])|每天)\s*(\d{1,2}:\d{2})/);
  return {title,description,repeat:schedule?.[2]?'weekly':'daily',weekday:schedule?.[2]||'五',time:schedule?.[3]||'09:00'};
}

export function readWorkbenchTask(storage = sessionStorage) {
  try {return JSON.parse(storage.getItem(WORKBENCH_DRAFT_KEY) || 'null');}
  catch {return null;}
}

export function clearWorkbenchTask(storage = sessionStorage) {
  storage.removeItem(WORKBENCH_DRAFT_KEY);
}
