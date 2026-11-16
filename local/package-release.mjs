import {VERSION} from '../lib/version.ts';
import {readFile,writeFile} from 'node:fs/promises';import {createHash} from 'node:crypto';import {resolve,join} from 'node:path';
const root=resolve(process.argv[2]||'outputs/Moc_Deo_Con_v'+VERSION),version=JSON.parse(await readFile(join(root,'version.json'),'utf8')).version;
const paths=['server.mjs','api.mjs','schema.sql','updater.mjs','bootstrap.mjs','version.json','public/index.html','public/app.js','public/app.css'],files=[];
for(const path of paths){const content=await readFile(join(root,path));files.push({path,sha256:createHash('sha256').update(content).digest('hex'),content:content.toString('base64')})}
const dest=resolve('outputs/moc-deo-con-update.json');await writeFile(dest,JSON.stringify({format:1,version,minNode:'24',files}));console.log(dest);
