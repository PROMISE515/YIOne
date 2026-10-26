import {spawnSync} from 'node:child_process';
import {copyFileSync} from 'node:fs';

const repository=process.env.GITHUB_REPOSITORY?.split('/')[1];
const owner=process.env.GITHUB_REPOSITORY_OWNER;
const base=process.env.GITHUB_PAGES_BASE||(repository&&repository!==`${owner}.github.io`?`/${repository}/`:'/');
const result=spawnSync('npm',['run','build'],{
  stdio:'inherit',
  env:{...process.env,GITHUB_PAGES_BASE:base},
});
if(result.status!==0)process.exit(result.status||1);
copyFileSync('dist/index.html','dist/404.html');
console.log(`Static Pages build ready at dist/ (base: ${base})`);
