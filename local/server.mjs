import {createServer} from 'node:http';
import {readFile,stat,mkdir} from 'node:fs/promises';
import {resolve,join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {networkInterfaces} from 'node:os';
import {backup,DatabaseSync} from 'node:sqlite';
process.env.NODE_ENV='production';
const here=dirname(fileURLToPath(import.meta.url));process.chdir(here);
const {GET,POST,authorizeAdmin,hasOpenOrders}=await import('./api.mjs');
const data=resolve(process.env.MOC_DATA_DIR||'data');await mkdir(join(data,'backups'),{recursive:true});
async function snapshot(force=false){const date=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());const dest=join(data,'backups','moc-deo-con-'+date+(force?'-before-update-'+Date.now():'')+'.sqlite');try{await stat(dest);return}catch{}const db=new DatabaseSync(join(data,'moc-deo-con.sqlite'));try{await backup(db,dest)}finally{db.close()}}
await snapshot();setInterval(()=>snapshot().catch(e=>console.error('Khong sao luu duoc:',e.message)),3600000).unref();
const {createUpdater}=await import('./updater.mjs');const currentVersion=JSON.parse(await readFile(join(here,'version.json'),'utf8')).version;const update=createUpdater({root:resolve(process.env.MOC_INSTALL_ROOT||here),currentVersion,authorizeAdmin,hasOpenOrders,backup:()=>snapshot(true),onRestart:()=>process.send?.({type:'restart'})});
const port=Number(process.env.PORT||8099);
createServer(async(req,res)=>{try{
 if(req.url?.split('?')[0]==='/api/data'||req.url?.split('?')[0]==='/api/update'){
 if(!['GET','POST'].includes(req.method)){res.writeHead(405);return res.end()}
 let body='';for await(const chunk of req){body+=chunk;if(Buffer.byteLength(body)>200000){res.writeHead(413);res.end('Yeu cau qua lon');return}}
 const host=req.headers.host||'localhost:'+port;if(!/^[a-zA-Z0-9.\-\[\]:]+$/.test(host))throw Error('Host invalid');
 const request=new Request('http://'+host+req.url,{method:req.method,headers:req.headers,...req.method==='POST'?{body}:{}});
 const response=await (req.url?.split('?')[0]==='/api/update'?update:(req.method==='GET'?GET:POST))(request);res.writeHead(response.status,Object.fromEntries(response.headers));return res.end(Buffer.from(await response.arrayBuffer()));
 }
 const path=req.url?.split('?')[0],files={'/':'index.html','/app.js':'app.js','/app.css':'app.css'};const file=files[path];if(!file){res.writeHead(404);return res.end('Not found')}
 res.setHeader('Content-Type',file.endsWith('.css')?'text/css; charset=utf-8':file.endsWith('.js')?'text/javascript; charset=utf-8':'text/html; charset=utf-8');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Cache-Control','no-cache');res.end(await readFile(join(here,'public',file)));
 }catch(e){console.error(e);res.writeHead(500,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'Khong the xu ly yeu cau'}))}
}).listen(port,'0.0.0.0',()=>{process.send?.({type:'ready',version:currentVersion});console.log('\nMOC DEO CON - SO QUAN v'+currentVersion+'\n');console.log('Tren may nay: http://localhost:'+port);try{for(const nets of Object.values(networkInterfaces()))for(const n of nets||[])if(n.family==='IPv4'&&!n.internal)console.log('Dien thoai / tablet cung Wi-Fi: http://'+n.address+':'+port)}catch{console.log('Dung ipconfig de xem IPv4 cua may chu, truy cap http://IP:'+port)};console.log('\nGiu cua so nay mo de su dung. Ctrl+C de dung.\nDu lieu: '+data+'\n')});
