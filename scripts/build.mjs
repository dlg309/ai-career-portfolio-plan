import {cp, lstat, mkdir, rm, stat} from 'node:fs/promises';
import {isAbsolute, join, relative, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const out=resolve(root,'dist');
const location=relative(root,out);
if(!location||location.startsWith('..')||isAbsolute(location))throw new Error('Build output must stay inside project');
try{if((await lstat(out)).isSymbolicLink())throw new Error('Build output cannot be a symlink');}catch(error){if(error.code!=='ENOENT')throw error;}
const files=['index.html','styles.css','dashboard.css','app.mjs','logic.mjs','research-data.mjs','.nojekyll'];
await rm(out,{recursive:true,force:true});
await mkdir(out,{recursive:true});
for(const file of files){
  await stat(join(root,file));
  await cp(join(root,file),join(out,file));
}
console.log(`Built ${files.length} static files in dist/`);
