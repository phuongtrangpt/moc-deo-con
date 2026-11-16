import {build} from 'esbuild';import {VERSION} from '../lib/version.ts';import {mkdir,copyFile,writeFile} from 'node:fs/promises';import {resolve} from 'node:path';
const out=resolve('outputs/Moc_Deo_Con_v'+VERSION);await mkdir(out+'/public',{recursive:true});
await build({entryPoints:['local/entry.tsx'],bundle:true,minify:true,outfile:out+'/public/app.js',define:{'process.env.NODE_ENV':'"production"'},jsx:'automatic',loader:{'.css':'css'}});
await build({entryPoints:['app/api/data/route.ts'],bundle:true,minify:false,format:'esm',platform:'node',outfile:out+'/api.mjs',alias:{'cloudflare:workers':resolve('local/cloudflare-local.ts')},define:{'process.env.NODE_ENV':'"production"'}});
await copyFile('local/server.mjs',out+'/server.mjs');await copyFile('drizzle/0000_famous_scarecrow.sql',out+'/schema.sql');
await writeFile(out+'/public/index.html','<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Mốc Đèo Cón · Sổ quán</title><link rel="stylesheet" href="/app.css"></head><body><div id="root"></div><script src="/app.js" defer></script></body></html>');
await copyFile('local/CHAY_WINDOWS.bat',out+'/CHAY_WINDOWS.bat');await copyFile('local/HUONG_DAN.txt',out+'/HUONG_DAN.txt');await copyFile('local/Dockerfile',out+'/Dockerfile');console.log(out);

for(const name of ['updater.mjs','bootstrap.mjs'])await copyFile('local/'+name,out+'/'+name);
await writeFile(out+'/version.json',JSON.stringify({version:VERSION,repository:'phuongtrangpt/moc-deo-con',minNode:'24'}));
