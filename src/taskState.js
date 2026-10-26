const KEY = 'yione-demo-task-v1';

export function readDemoTask() {
  try {
    const value = JSON.parse(sessionStorage.getItem(KEY));
    return value && typeof value.text === 'string' ? value : null;
  } catch {
    return null;
  }
}

export function writeDemoTask(text) {
  const task = {text:text.trim(), createdAt:'刚刚', status:'待执行'};
  sessionStorage.setItem(KEY, JSON.stringify(task));
  return task;
}
