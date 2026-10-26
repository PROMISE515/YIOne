import React, {useEffect, useState} from 'react';

const DB_NAME='yione-reply-media-v1';
const STORE_NAME='files';

function openMediaStore() {
  return new Promise((resolve,reject)=>{
    const request=indexedDB.open(DB_NAME,1);
    request.onupgradeneeded=()=>request.result.createObjectStore(STORE_NAME);
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(request.error);
  });
}

export async function saveReplyMedia(file) {
  const id=crypto.randomUUID();
  const db=await openMediaStore();
  try {
    await new Promise((resolve,reject)=>{
      const transaction=db.transaction(STORE_NAME,'readwrite');
      transaction.objectStore(STORE_NAME).put(file,id);
      transaction.oncomplete=resolve;
      transaction.onerror=()=>reject(transaction.error);
    });
  } finally { db.close(); }
  return {id,name:file.name,type:file.type,size:file.size};
}

async function loadReplyMedia(id) {
  const db=await openMediaStore();
  try {
    return await new Promise((resolve,reject)=>{
      const request=db.transaction(STORE_NAME,'readonly').objectStore(STORE_NAME).get(id);
      request.onsuccess=()=>resolve(request.result);
      request.onerror=()=>reject(request.error);
    });
  } finally { db.close(); }
}

export default function ReplyMedia({item, compact=false}) {
  const [url,setUrl]=useState('');
  useEffect(()=>{
    let active=true;
    let objectUrl='';
    (async()=>{
      try {
        const file=item.file||await loadReplyMedia(item.id);
        if(!file||!active)return;
        objectUrl=URL.createObjectURL(file);
        setUrl(objectUrl);
      } catch { /* The attachment label remains visible. */ }
    })();
    return ()=>{active=false;if(objectUrl)URL.revokeObjectURL(objectUrl)};
  },[item.file,item.id]);
  const type=item.type||item.file?.type||'';
  if(type.startsWith('image/'))return <figure className={`reply-media ${compact?'compact':''}`}>{url?<img src={url} alt={item.name}/>:<span>{item.name}</span>}</figure>;
  if(type.startsWith('video/'))return <figure className={`reply-media ${compact?'compact':''}`}>{url?<video src={url} controls aria-label={item.name}/>:<span>{item.name}</span>}<figcaption>{item.name}</figcaption></figure>;
  return <div className="reply-media reply-file">{url?<a href={url} download={item.name}>📎 {item.name}</a>:<span>📎 {item.name}</span>}</div>;
}
