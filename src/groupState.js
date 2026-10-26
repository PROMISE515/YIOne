const KEY = 'yione-group-demo-v1';
const fallback = {name:'合作群聊', members:['zhou','xu'], messages:[], muted:false, announcement:''};

export function readGroupState() {
  try {
    const value = JSON.parse(sessionStorage.getItem(KEY));
    return value && Array.isArray(value.members) ? {...fallback, ...value} : {...fallback};
  } catch {
    return {...fallback};
  }
}

export function writeGroupState(next) {
  sessionStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function createGroupState(members) {
  return writeGroupState({...fallback, members:[...members], messages:[]});
}
